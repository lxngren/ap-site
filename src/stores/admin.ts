import { defineStore } from 'pinia'
import { ref } from 'vue'
import { gistService } from '@/services/gistService'
import { youtubeService } from '@/services/youtube'
import type { Project, AboutData, GlobalSettings } from '@/types'

const SESSION_KEY = 'gh_admin_token'

export const useAdminStore = defineStore('admin', () => {
  const isAuthenticated = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const projects = ref<Project[]>([])
  const about = ref<AboutData>({
    title: '',
    description: '',
    bio: '',
    skills: [],
    email: '',
    instagram: '',
    youtube: '',
  })

  const globalSettings = ref<GlobalSettings>({
    accentMode: 'custom',
    customColor: '#e0d0d3',
  })

  const handleError = (e: unknown, msg: string) => {
    console.error(`[AdminStore] ${msg}:`, e)
    error.value = e instanceof Error ? e.message : msg
  }

  const resetState = () => {
    isAuthenticated.value = false
    projects.value = []
    gistService.setToken(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  const checkSession = async (): Promise<boolean> => {
    const token = sessionStorage.getItem(SESSION_KEY)
    if (!token) return false

    isLoading.value = true
    try {
      const hasAccess = await gistService.verifyPermissions(token)
      if (!hasAccess) throw new Error('Invalid or expired token')

      gistService.setToken(token)
      await loadAllData()

      isAuthenticated.value = true
      return true
    } catch {
      resetState()
      return false
    } finally {
      isLoading.value = false
    }
  }

  const login = async (token: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    try {
      const hasAccess = await gistService.verifyPermissions(token)
      if (!hasAccess) throw new Error('Access Denied: Invalid Scope or User')

      gistService.setToken(token)
      sessionStorage.setItem(SESSION_KEY, token)
      await loadAllData()

      isAuthenticated.value = true
      return true
    } catch (e) {
      handleError(e, 'Login failed')
      resetState()
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    resetState()
    window.location.href = '/'
  }

  const loadAllData = async () => {
    const data = await gistService.fetchConfig()

    projects.value = data.projects || []
    if (data.about) about.value = data.about
    if (data.global) globalSettings.value = data.global
  }

  const saveChanges = async () => {
    if (!isAuthenticated.value) return

    isLoading.value = true
    try {
      await gistService.updateConfig({
        projects: projects.value,
        about: about.value,
        global: globalSettings.value,
      })
      alert('Changes saved successfully.')
    } catch (e) {
      handleError(e, 'Failed to save changes')
      alert('Error saving data. Check console.')
    } finally {
      isLoading.value = false
    }
  }

  const fetchYoutubeMetadata = async (input: string) => {
    isLoading.value = true
    try {
      const data = await youtubeService.getVideoData(input)
      return {
        id: data.id,
        title: data.title ? data.title.toUpperCase() : undefined,
        thumbnailUrl: data.thumbnail_maxres_url || data.thumbnail_url,
      }
    } catch (e) {
      console.error(e)
      alert('Video not found. Check URL/ID or Privacy settings.')
      return null
    } finally {
      isLoading.value = false
    }
  }

  const addProject = (projectData: Partial<Project>) => {
    const maxId = projects.value.reduce((max, p) => Math.max(max, p.id), 0)

    const newProject = {
      ...projectData,
      id: maxId + 1,
      isFeatured: projectData.isFeatured || false,
    } as Project

    projects.value.unshift(newProject)

    if (newProject.isFeatured) {
      ensureSingleHero(newProject.id)
    }
  }

  const updateProject = (updatedProject: Project) => {
    const index = projects.value.findIndex((p) => p.id === updatedProject.id)
    if (index !== -1) {
      projects.value[index] = updatedProject

      if (updatedProject.isFeatured) {
        ensureSingleHero(updatedProject.id)
      }
    }
  }

  const removeProject = (id: number) => {
    if (confirm('Delete this project permanently?')) {
      projects.value = projects.value.filter((p) => p.id !== id)
    }
  }

  const updateProjectsOrder = (newOrder: Project[]) => {
    projects.value = newOrder
  }

  const updateAbout = (newData: AboutData) => {
    about.value = newData
  }

  const updateGlobalSettings = (newSettings: GlobalSettings) => {
    globalSettings.value = newSettings
  }

  const ensureSingleHero = (heroId: number) => {
    projects.value.forEach((p) => {
      p.isFeatured = p.id === heroId
    })
  }

  return {
    // State
    isAuthenticated,
    loading: isLoading,
    error,
    projects,
    about,
    globalSettings,

    // Actions
    login,
    logout,
    checkSession,
    saveChanges,
    fetchYoutubeMetadata,

    // CRUD
    addProject,
    updateProject,
    removeProject,
    updateProjectsOrder,

    // Setters
    updateAbout,
    updateGlobalSettings,
  }
})
