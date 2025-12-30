import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { gistService } from '@/services/gistService'
import { vimeoService, type VimeoData } from '@/services/vimeoService'
import type { Project } from '@/types'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const initialized = ref(false)

  // Кэш для Vimeo данных (чтобы не спамить API при навигации)
  const vimeoCache = ref<Record<string, VimeoData>>({})

  // Геттер по ID
  const getProjectById = computed(() => {
    return (id: number) => projects.value.find((p) => p.id === id)
  })

  // Инициализация (Загрузка списка проектов из Gist)
  async function init() {
    if (initialized.value) return
    loading.value = true
    try {
      const data = await gistService.fetchConfig()
      if (data && Array.isArray(data.projects)) {
        projects.value = data.projects
      }
      initialized.value = true
    } catch (e) {
      console.error('Failed to load projects list', e)
      // Здесь можно загрузить локальный фоллбэк, если Gist недоступен
    } finally {
      loading.value = false
    }
  }

  // Загрузка метаданных конкретного видео с Vimeo
  async function loadVimeoData(vimeoId: string) {
    if (!vimeoId || vimeoCache.value[vimeoId]) return
    // ... твоя старая логика загрузки ...
    try {
      const data = await vimeoService.fetchVideoData(vimeoId)
      vimeoCache.value = { ...vimeoCache.value, [vimeoId]: data }
    } catch (e) {
      console.warn(e)
    }
  }

  function getVimeoThumbnail(vimeoId: string, size: 'hd' | 'small' = 'hd') {
    const data = vimeoCache.value[vimeoId]
    if (!data) return undefined
    return size === 'small' ? data.thumbnail_small : data.thumbnail_hd || data.thumbnail_large
  }

  return {
    projects,
    loading,
    init,
    getProjectById,
    loadVimeoData,
    getVimeoThumbnail,
  }
})
