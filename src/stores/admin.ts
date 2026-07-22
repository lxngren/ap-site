import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { gistService } from '@/services/gistService'
import { fetchVideoMetadata, type VideoMetadata } from '@/services/youtubeMetadata'
import {
  DEFAULT_GLOBAL_SETTINGS,
  EMPTY_ABOUT,
  draftToProject,
  draftToSettings,
  nextProjectId,
  settingsToDraft,
  toProjectId,
  withSingleHero,
  type AboutDraft,
  type AppConfig,
  type GlobalSettingsDraft,
  type Project,
  type ProjectDraft,
  type ProjectId,
} from '@/domain/content'
import { useProjectsStore } from './projects'

export type AdminStatus = 'anonymous' | 'authenticating' | 'authenticated'

export type ActionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string }

const failure = (cause: unknown, fallback: string): ActionResult => ({
  ok: false,
  message: cause instanceof Error ? cause.message : fallback,
})

export const useAdminStore = defineStore('admin', () => {
  const published = useProjectsStore()

  const status = ref<AdminStatus>('anonymous')
  const error = ref<string | null>(null)
  const isBusy = ref(false)
  const isDirty = ref(false)

  const projects = ref<Project[]>([])
  const about = ref<AboutDraft>({ ...EMPTY_ABOUT })
  const globalSettings = ref<GlobalSettingsDraft>(settingsToDraft(DEFAULT_GLOBAL_SETTINGS))

  const isAuthenticated = computed(() => status.value === 'authenticated')
  const loading = computed(() => isBusy.value || status.value === 'authenticating')

  const reset = (): void => {
    status.value = 'anonymous'
    projects.value = []
    about.value = { ...EMPTY_ABOUT }
    globalSettings.value = settingsToDraft(DEFAULT_GLOBAL_SETTINGS)
    isDirty.value = false
    gistService.setToken(null)
  }

  const adopt = (config: AppConfig): void => {
    projects.value = [...config.projects]
    about.value = { ...(config.about ?? EMPTY_ABOUT) }
    globalSettings.value = settingsToDraft(config.global)
    isDirty.value = false
  }

  const login = async (token: string): Promise<boolean> => {
    status.value = 'authenticating'
    error.value = null

    try {
      if (!(await gistService.verifyPermissions(token))) {
        throw new Error('Access denied: token is invalid or belongs to another account')
      }

      gistService.setToken(token)
      adopt(await gistService.fetchConfig())
      status.value = 'authenticated'
      return true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Login failed'
      reset()
      return false
    }
  }

  const logout = (): void => {
    reset()
  }

  const currentConfig = (): AppConfig => ({
    projects: projects.value,
    about: about.value,
    global: draftToSettings(globalSettings.value),
  })

  const saveChanges = async (): Promise<ActionResult> => {
    if (status.value !== 'authenticated') {
      return { ok: false, message: 'Not signed in' }
    }

    isBusy.value = true
    try {
      const config = currentConfig()
      await gistService.updateConfig(config)
      published.replaceConfig(config)
      isDirty.value = false
      return { ok: true }
    } catch (cause) {
      return failure(cause, 'Failed to save changes')
    } finally {
      isBusy.value = false
    }
  }

  const fetchYoutubeMetadata = async (input: string): Promise<VideoMetadata | null> => {
    isBusy.value = true
    try {
      return await fetchVideoMetadata(input)
    } catch (cause) {
      console.warn('[admin] video lookup failed', cause)
      return null
    } finally {
      isBusy.value = false
    }
  }

  const markDirty = (): void => {
    isDirty.value = true
  }

  const addProject = (draft: ProjectDraft): ActionResult => {
    const project = draftToProject(draft, nextProjectId(projects.value))
    if (project === null) return { ok: false, message: 'TITLE and CLIENT are required.' }

    projects.value = [project, ...projects.value]
    if (project.isFeatured) projects.value = [...withSingleHero(projects.value, project.id)]
    markDirty()
    return { ok: true }
  }

  const updateProject = (draft: ProjectDraft): ActionResult => {
    const id = toProjectId(draft.id)
    if (id === null) return { ok: false, message: 'Cannot update a project without an id.' }

    const project = draftToProject(draft, id)
    if (project === null) return { ok: false, message: 'TITLE and CLIENT are required.' }

    projects.value = projects.value.map((existing) => (existing.id === id ? project : existing))
    if (project.isFeatured) projects.value = [...withSingleHero(projects.value, id)]
    markDirty()
    return { ok: true }
  }

  const removeProject = (id: ProjectId): void => {
    projects.value = projects.value.filter((project) => project.id !== id)
    markDirty()
  }

  const updateProjectsOrder = (order: readonly Project[]): void => {
    projects.value = [...order]
    markDirty()
  }

  const updateAbout = (next: AboutDraft): void => {
    about.value = { ...next }
    markDirty()
  }

  return {
    status,
    isAuthenticated,
    loading,
    error,
    isDirty,
    projects,
    about,
    globalSettings,
    login,
    logout,
    saveChanges,
    fetchYoutubeMetadata,
    markDirty,
    addProject,
    updateProject,
    removeProject,
    updateProjectsOrder,
    updateAbout,
  }
})
