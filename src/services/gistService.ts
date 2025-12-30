import { ref } from 'vue'
import type { AppConfig } from '@/types'

class GistService {
  private apiBase = 'https://api.github.com'
  private gistId = import.meta.env.VITE_GIST_ID
  private fileName = 'projects-config.json'

  private token = ref<string | null>(null)

  setToken(token: string | null) {
    this.token.value = token
  }

  async verifyPermissions(token: string): Promise<boolean> {
    try {
      const userResponse = await fetch(`${this.apiBase}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      })

      if (!userResponse.ok) return false
      const userData = await userResponse.json()

      const gistResponse = await fetch(`${this.apiBase}/gists/${this.gistId}`)
      if (!gistResponse.ok) return false
      const gistData = await gistResponse.json()

      return userData.id === gistData.owner.id
    } catch (error) {
      console.error('Permission check failed:', error)
      return false
    }
  }

  async fetchConfig(): Promise<AppConfig> {
    const url = `${this.apiBase}/gists/${this.gistId}`
    const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' }

    if (this.token.value) {
      headers['Authorization'] = `Bearer ${this.token.value}`
    }

    try {
      const response = await fetch(url, { headers })
      if (!response.ok) throw new Error(`Gist Error: ${response.status}`)

      const data = await response.json()
      const file = data.files[this.fileName]

      if (!file) throw new Error('Config file not found in Gist')

      return (JSON.parse(file.content) || { projects: [] }) as AppConfig
    } catch (error) {
      console.error('Failed to fetch Gist configuration', error)
      throw error
    }
  }

  async updateConfig(newConfig: AppConfig) {
    if (!this.token.value) throw new Error('Unauthorized: Admin Token Required')

    const url = `${this.apiBase}/gists/${this.gistId}`
    const body = {
      files: {
        [this.fileName]: {
          content: JSON.stringify(newConfig, null, 2),
        },
      },
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${this.token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('Failed to save. Check token permissions (gist scope required).')
    }
    return await response.json()
  }
}

export const gistService = new GistService()
