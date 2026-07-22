import { parseAppConfig, type AppConfig } from '@/domain/content'

const API_BASE = 'https://api.github.com'
const CONFIG_FILE = 'projects-config.json'
const REQUEST_TIMEOUT_MS = 10_000

const PUBLIC_HEADERS: Readonly<Record<string, string>> = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

export class GistError extends Error {
  readonly status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GistError'
    this.status = status
  }
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null

const readConfigFile = (payload: unknown): string => {
  const files = asRecord(asRecord(payload)?.files)
  const content = asRecord(files?.[CONFIG_FILE])?.content

  if (typeof content !== 'string') {
    throw new GistError(`Gist does not contain a readable "${CONFIG_FILE}"`)
  }
  return content
}

class GistService {
  #token: string | null = null
  readonly #gistId: string

  constructor(gistId: string) {
    this.#gistId = gistId
  }

  get isAuthenticated(): boolean {
    return this.#token !== null
  }

  setToken(token: string | null): void {
    this.#token = token
  }

  async verifyPermissions(token: string): Promise<boolean> {
    try {
      const [user, gist] = await Promise.all([
        this.#request(`${API_BASE}/user`, { token }),
        this.#request(`${API_BASE}/gists/${this.#gistId}`),
      ])

      const userId = asRecord(user)?.id
      const ownerId = asRecord(asRecord(gist)?.owner)?.id

      return typeof userId === 'number' && userId === ownerId
    } catch (error) {
      console.error('[gist] permission check failed', error)
      return false
    }
  }

  async fetchConfig(): Promise<AppConfig> {
    const payload = await this.#request(`${API_BASE}/gists/${this.#gistId}`)
    const raw = readConfigFile(payload)

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      throw new GistError(`Config document is not valid JSON: ${String(error)}`)
    }

    return parseAppConfig(parsed)
  }

  async updateConfig(config: AppConfig): Promise<void> {
    if (this.#token === null) {
      throw new GistError('Unauthorized: admin token required')
    }

    await this.#request(`${API_BASE}/gists/${this.#gistId}`, {
      token: this.#token,
      method: 'PATCH',
      body: {
        files: { [CONFIG_FILE]: { content: JSON.stringify(config, null, 2) } },
      },
    })
  }

  async #request(
    url: string,
    options: { token?: string; method?: string; body?: unknown } = {},
  ): Promise<unknown> {
    const headers: Record<string, string> = { ...PUBLIC_HEADERS }
    if (options.token !== undefined) {
      headers['Authorization'] = `Bearer ${options.token}`
    }
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    })

    if (!response.ok) {
      throw new GistError(`GitHub request failed (${response.status})`, response.status)
    }

    return response.json()
  }
}

export const gistService = new GistService(import.meta.env.VITE_GIST_ID)
