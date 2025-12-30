import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { gistService } from '@/services/gistService'
import type { Project, AboutData, GlobalSettings } from '@/types'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const about = ref<AboutData | null>(null)

  const globalSettings = ref<GlobalSettings>({
    accentMode: 'custom',
    customColor: '#f0d0d3',
  })

  const currentAccentColor = ref<string>('#f3d0d3')
  const heroAccentColor = ref<string | null>(null)

  async function init() {
    try {
      const config = await gistService.fetchConfig()
      projects.value = config.projects || []
      about.value = config.about || null
      if (config.global) {
        globalSettings.value = config.global
      }
    } catch (e) {
      console.error('Failed to load content', e)
    }
  }

  const getProjectById = (id: number) => projects.value.find((p) => p.id === id)

  const setAccentColor = (color: string) => {
    currentAccentColor.value = color
  }

  const setHeroAccentColor = (color: string) => {
    heroAccentColor.value = color
  }

  const mainAccent = computed(() => {
    if (globalSettings.value.accentMode === 'hero' && heroAccentColor.value) {
      return heroAccentColor.value
    }
    return globalSettings.value.customColor
  })

  return {
    projects,
    about,
    globalSettings, // Экспорт для админки
    mainAccent, // Экспорт готового цвета
    currentAccentColor,
    heroAccentColor,
    init,
    getProjectById,
    setAccentColor,
    setHeroAccentColor,
  }
})
