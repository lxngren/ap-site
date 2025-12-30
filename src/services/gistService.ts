// src/services/gistService.ts
import { ref } from 'vue'

class GistService {
  private apiBase = 'https://api.github.com'
  // ID твоего Gist файла (он публичный, это не секрет)
  private gistId = import.meta.env.VITE_GIST_ID
  private fileName = 'projects-config.json'

  // Реактивный токен (существует только в памяти)
  private token = ref<string | null>(null)

  setToken(token: string | null) {
    this.token.value = token
  }

  // ЧТЕНИЕ (Работает и без токена, если Gist публичный)
  async fetchConfig() {
    // Если есть токен — используем его (для админки, чтобы избежать кэширования)
    // Если нет — просто фетчим публичный URL
    const url = `${this.apiBase}/gists/${this.gistId}`
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    }

    if (this.token.value) {
      headers['Authorization'] = `Bearer ${this.token.value}`
    }

    try {
      const response = await fetch(url, { headers })
      if (!response.ok) throw new Error(`Gist Error: ${response.status}`)

      const data = await response.json()
      const file = data.files[this.fileName]

      if (!file) throw new Error('Config file not found in Gist')

      // Парсим контент. Если файл пустой, возвращаем дефолтную структуру
      return JSON.parse(file.content) || { projects: [] }
    } catch (e) {
      console.error('Failed to fetch Gist configuration', e)
      throw e
    }
  }

  // ЗАПИСЬ (Требует токен)
  async updateConfig(newConfig: any) {
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

    if (!response.ok) throw new Error('Failed to save data to GitHub')
    return await response.json()
  }
}

export const gistService = new GistService()
