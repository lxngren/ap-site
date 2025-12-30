import { defineStore } from 'pinia'
import { ref } from 'vue'
import { gistService } from '@/services/gistService'
import { vimeoService } from '@/services/vimeoService'
import type { Project } from '@/types'

export const useAdminStore = defineStore('admin', () => {
  const isAuthenticated = ref(false)
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function login(token: string) {
    loading.value = true
    error.value = null
    try {
      gistService.setToken(token)
      const config = await gistService.fetchConfig()
      projects.value = config.projects || []
      isAuthenticated.value = true
      return true
    } catch (e) {
      console.error(e)
      error.value = 'Invalid Access Token'
      isAuthenticated.value = false
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    isAuthenticated.value = false
    gistService.setToken(null)
    projects.value = []
  }

  async function fetchVimeoMetadata(vimeoId: string) {
    loading.value = true
    try {
      const data = await vimeoService.fetchVideoData(vimeoId)
      return {
        title: data.title,
        thumbnailUrl: data.thumbnail_hd || data.thumbnail_large,
      }
    } catch (e) {
      error.value = 'Vimeo ID not found'
      return null
    } finally {
      loading.value = false
    }
  }

  async function saveChanges() {
    if (!isAuthenticated.value) return
    loading.value = true
    try {
      const payload = { projects: projects.value }
      await gistService.updateConfig(payload)
      alert('SAVED SUCCESSFULLY')
    } catch (e) {
      error.value = 'Failed to save changes'
      alert('ERROR SAVING')
    } finally {
      loading.value = false
    }
  }

  function addProject(project: Project) {
    const newId = projects.value.length > 0 ? Math.max(...projects.value.map((p) => p.id)) + 1 : 1
    projects.value.unshift({ ...project, id: newId })
  }

  function removeProject(id: number) {
    if (!confirm('DELETE PROJECT?')) return
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  function updateProjectOrder(newOrder: Project[]) {
    projects.value = newOrder
  }

  return {
    isAuthenticated,
    projects,
    loading,
    error,
    login,
    logout,
    fetchVimeoMetadata,
    saveChanges,
    addProject,
    removeProject,
    updateProjectOrder,
  }
})
