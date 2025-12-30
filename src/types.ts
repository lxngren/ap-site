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

export interface AboutData {
  title: string
  description: string
  bio: string
  skills: string[]
  email: string
  instagram: string
  youtube: string // Changed
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
