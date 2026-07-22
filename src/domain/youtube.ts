import type { Brand } from './brand'

export type YoutubeVideoId = Brand<string, 'YoutubeVideoId'>

const BARE_ID_PATTERN = /^[\w-]{11}$/
const URL_PATTERN =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i

export const THUMBNAIL_QUALITIES = ['maxres', 'hq', 'mq'] as const
export type ThumbnailQuality = (typeof THUMBNAIL_QUALITIES)[number]

const PLACEHOLDER_MAX_EDGE = { width: 120, height: 90 } as const

export const toYoutubeVideoId = (input: unknown): YoutubeVideoId | null => {
  if (typeof input !== 'string') return null

  const trimmed = input.trim()
  if (!trimmed) return null

  if (BARE_ID_PATTERN.test(trimmed)) return trimmed as YoutubeVideoId

  return (URL_PATTERN.exec(trimmed)?.[1] ?? null) as YoutubeVideoId | null
}

export const thumbnailUrl = (
  id: YoutubeVideoId,
  quality: ThumbnailQuality = 'maxres',
): string => `https://img.youtube.com/vi/${id}/${quality}default.jpg`

export const watchUrl = (id: YoutubeVideoId): string =>
  `https://www.youtube.com/watch?v=${id}`

export const downgradeThumbnailUrl = (url: string): string | null => {
  const currentIndex = THUMBNAIL_QUALITIES.findIndex((quality) =>
    url.includes(`${quality}default`),
  )
  if (currentIndex === -1) return null

  const next = THUMBNAIL_QUALITIES[currentIndex + 1]
  if (next === undefined) return null

  const current = THUMBNAIL_QUALITIES[currentIndex]
  return url.replace(`${current}default`, `${next}default`)
}

export const isPlaceholderThumbnail = (width: number, height: number): boolean =>
  width > 0 &&
  height > 0 &&
  width <= PLACEHOLDER_MAX_EDGE.width &&
  height <= PLACEHOLDER_MAX_EDGE.height
