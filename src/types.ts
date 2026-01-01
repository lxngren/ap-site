export interface Project {
  id: number
  title: string
  client: string
  description: string
  category: string
  youtubeId: string // Changed
  thumbnailUrl: string
  isFeatured: boolean
}

export interface SoftwareGroup {
  category: string
  items: string[]
}

export interface AboutData {
  title: string
  description: string
  skills: string[]
  software: SoftwareGroup[]
  email: string
  instagram: string
  discord: string // Changed
}

export interface GlobalSettings {
  accentMode: 'hero' | 'custom'
  customColor: string
}

export interface AppConfig {
  projects: Project[]
  about?: AboutData
  global?: GlobalSettings
}

export interface YoutubeMetaData {
  id: string
  title: string
  thumbnail_url: string
  thumbnail_maxres_url: string
  width: number
  height: number
}
