import type { Brand } from './brand'
import { DEFAULT_ACCENT, toHexColor, type HexColor } from './color'
import { toHttpUrl } from './url'
import { toYoutubeVideoId, type YoutubeVideoId } from './youtube'

export const PROJECT_CATEGORIES = ['3D / VFX', 'Motion Graphics', 'Graphic Design'] as const
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

export const ACCENT_MODES = ['hero', 'custom'] as const
export type AccentMode = (typeof ACCENT_MODES)[number]

export type ProjectId = Brand<number, 'ProjectId'>

export interface Project {
  readonly id: ProjectId
  readonly title: string
  readonly client: string
  readonly description: string
  readonly category: ProjectCategory
  readonly youtubeId: YoutubeVideoId | null
  readonly thumbnailUrl: string
  readonly isFeatured: boolean
}

export interface ProjectDraft {
  id: number
  title: string
  client: string
  description: string
  category: ProjectCategory
  youtubeId: string
  thumbnailUrl: string
  isFeatured: boolean
}

export interface SoftwareGroup {
  readonly category: string
  readonly items: readonly string[]
}

export interface AboutData {
  readonly title: string
  readonly description: string
  readonly skills: readonly string[]
  readonly software: readonly SoftwareGroup[]
  readonly email: string
  readonly instagram: string
  readonly discord: string
}

export interface GlobalSettings {
  readonly accentMode: AccentMode
  readonly customColor: HexColor
}

export interface AppConfig {
  readonly projects: readonly Project[]
  readonly about: AboutData | null
  readonly global: GlobalSettings
}

export type Draft<T> = { -readonly [K in keyof T]: T[K] }

export type AboutDraft = Draft<AboutData>

export interface GlobalSettingsDraft {
  accentMode: AccentMode
  customColor: string
}

export const settingsToDraft = (settings: GlobalSettings): GlobalSettingsDraft => ({
  accentMode: settings.accentMode,
  customColor: settings.customColor,
})

export const draftToSettings = (draft: GlobalSettingsDraft): GlobalSettings => ({
  accentMode: draft.accentMode,
  customColor: toHexColor(draft.customColor),
})

export const EMPTY_ABOUT: AboutData = {
  title: '',
  description: '',
  skills: [],
  software: [],
  email: '',
  instagram: '',
  discord: '',
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  accentMode: 'custom',
  customColor: DEFAULT_ACCENT,
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null

const asString = (value: unknown): string => (typeof value === 'string' ? value : '')

const asStringArray = (value: unknown): readonly string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

export const toProjectId = (value: unknown): ProjectId | null =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? (value as ProjectId)
    : null

export const isProjectCategory = (value: unknown): value is ProjectCategory =>
  PROJECT_CATEGORIES.includes(value as ProjectCategory)

const asAccentMode = (value: unknown): AccentMode =>
  ACCENT_MODES.includes(value as AccentMode) ? (value as AccentMode) : 'custom'

export const parseProject = (raw: unknown): Project | null => {
  const record = asRecord(raw)
  if (record === null) return null

  const id = toProjectId(record.id)
  if (id === null) return null

  const title = asString(record.title).trim()
  if (!title) return null

  return {
    id,
    title,
    client: asString(record.client).trim(),
    description: asString(record.description),
    category: isProjectCategory(record.category) ? record.category : PROJECT_CATEGORIES[0],
    youtubeId: toYoutubeVideoId(record.youtubeId),
    thumbnailUrl: toHttpUrl(record.thumbnailUrl) ?? '',
    isFeatured: record.isFeatured === true,
  }
}

const parseSoftwareGroup = (raw: unknown): SoftwareGroup | null => {
  const record = asRecord(raw)
  if (record === null) return null

  const category = asString(record.category).trim()
  if (!category) return null

  return { category, items: asStringArray(record.items) }
}

export const parseAbout = (raw: unknown): AboutData | null => {
  const record = asRecord(raw)
  if (record === null) return null

  return {
    title: asString(record.title),
    description: asString(record.description),
    skills: asStringArray(record.skills),
    software: Array.isArray(record.software)
      ? record.software
          .map(parseSoftwareGroup)
          .filter((group): group is SoftwareGroup => group !== null)
      : [],
    email: asString(record.email).trim(),
    instagram: asString(record.instagram).trim(),
    discord: asString(record.discord).trim(),
  }
}

export const parseGlobalSettings = (raw: unknown): GlobalSettings => {
  const record = asRecord(raw)
  if (record === null) return DEFAULT_GLOBAL_SETTINGS

  return {
    accentMode: asAccentMode(record.accentMode),
    customColor: toHexColor(record.customColor),
  }
}

export const parseAppConfig = (raw: unknown): AppConfig => {
  const root = asRecord(raw)

  return {
    projects: Array.isArray(root?.projects)
      ? root.projects.map(parseProject).filter((project): project is Project => project !== null)
      : [],
    about: parseAbout(root?.about),
    global: parseGlobalSettings(root?.global),
  }
}

export const draftToProject = (draft: ProjectDraft, id: ProjectId): Project | null => {
  const title = draft.title.trim()
  const client = draft.client.trim()
  if (!title || !client) return null

  return {
    id,
    title,
    client,
    description: draft.description,
    category: draft.category,
    youtubeId: toYoutubeVideoId(draft.youtubeId),
    thumbnailUrl: toHttpUrl(draft.thumbnailUrl) ?? '',
    isFeatured: draft.isFeatured,
  }
}

export const projectToDraft = (project: Project): ProjectDraft => ({
  id: project.id,
  title: project.title,
  client: project.client,
  description: project.description,
  category: project.category,
  youtubeId: project.youtubeId ?? '',
  thumbnailUrl: project.thumbnailUrl,
  isFeatured: project.isFeatured,
})

export const emptyDraft = (): ProjectDraft => ({
  id: 0,
  title: '',
  client: '',
  description: '',
  category: PROJECT_CATEGORIES[0],
  youtubeId: '',
  thumbnailUrl: '',
  isFeatured: false,
})

export const withSingleHero = (
  projects: readonly Project[],
  heroId: ProjectId,
): readonly Project[] =>
  projects.map((project) => ({ ...project, isFeatured: project.id === heroId }))

export const nextProjectId = (projects: readonly Project[]): ProjectId =>
  (projects.reduce((max, project) => Math.max(max, project.id), 0) + 1) as ProjectId
