import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { colorService } from '@/services/colorService'
import { gistService } from '@/services/gistService'
import { DEFAULT_ACCENT, type HexColor } from '@/domain/color'
import {
  DEFAULT_GLOBAL_SETTINGS,
  type AboutData,
  type AppConfig,
  type GlobalSettings,
  type Project,
  type ProjectId,
} from '@/domain/content'

export type ContentState =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly config: AppConfig }
  | { readonly status: 'error'; readonly error: Error }

export const useProjectsStore = defineStore('projects', () => {
  const state = shallowRef<ContentState>({ status: 'idle' })

  const heroAccentColor = shallowRef<HexColor>(DEFAULT_ACCENT)
  const currentAccentColor = shallowRef<HexColor>(DEFAULT_ACCENT)

  const config = computed<AppConfig | null>(() =>
    state.value.status === 'ready' ? state.value.config : null,
  )

  const projects = computed<readonly Project[]>(() => config.value?.projects ?? [])
  const about = computed<AboutData | null>(() => config.value?.about ?? null)
  const globalSettings = computed<GlobalSettings>(
    () => config.value?.global ?? DEFAULT_GLOBAL_SETTINGS,
  )

  const status = computed(() => state.value.status)
  const isReady = computed(() => state.value.status === 'ready')
  const loadError = computed<Error | null>(() =>
    state.value.status === 'error' ? state.value.error : null,
  )

  const featuredProject = computed<Project | null>(
    () => projects.value.find((project) => project.isFeatured) ?? null,
  )

  const mainAccent = computed<HexColor>(() =>
    globalSettings.value.accentMode === 'hero'
      ? heroAccentColor.value
      : globalSettings.value.customColor,
  )

  const refreshHeroAccent = async (): Promise<void> => {
    const thumbnail = featuredProject.value?.thumbnailUrl
    heroAccentColor.value = thumbnail ? await colorService.extract(thumbnail) : DEFAULT_ACCENT
  }

  const load = async (): Promise<void> => {
    state.value = { status: 'loading' }
    try {
      state.value = { status: 'ready', config: await gistService.fetchConfig() }
      await refreshHeroAccent()
    } catch (cause) {
      state.value = {
        status: 'error',
        error: cause instanceof Error ? cause : new Error(String(cause)),
      }
    }
  }

  let inFlight: Promise<void> | null = null

  const init = (): Promise<void> => {
    if (state.value.status === 'ready') return Promise.resolve()

    inFlight ??= load().finally(() => {
      inFlight = null
    })
    return inFlight
  }

  const getProjectById = (id: ProjectId): Project | null =>
    projects.value.find((project) => project.id === id) ?? null

  const setAccentColor = (color: HexColor): void => {
    currentAccentColor.value = color
  }

  const setHeroAccentColor = (color: HexColor): void => {
    heroAccentColor.value = color
  }

  const replaceConfig = (next: AppConfig): void => {
    state.value = { status: 'ready', config: next }
    void refreshHeroAccent()
  }

  return {
    status,
    isReady,
    loadError,
    projects,
    about,
    globalSettings,
    featuredProject,
    mainAccent,
    heroAccentColor,
    currentAccentColor,
    init,
    getProjectById,
    setAccentColor,
    setHeroAccentColor,
    replaceConfig,
  }
})
