import { thumbnailUrl, toYoutubeVideoId, type YoutubeVideoId } from '@/domain/youtube'

const OEMBED_ENDPOINT = 'https://www.youtube.com/oembed'
const REQUEST_TIMEOUT_MS = 8_000

export interface VideoMetadata {
  readonly id: YoutubeVideoId
  readonly title: string | null
  readonly thumbnailUrl: string
}

export const fetchVideoMetadata = async (input: string): Promise<VideoMetadata> => {
  const id = toYoutubeVideoId(input)
  if (id === null) throw new Error('Invalid YouTube URL or ID')

  return {
    id,
    title: await fetchTitle(id),
    thumbnailUrl: thumbnailUrl(id, 'maxres'),
  }
}

const fetchTitle = async (id: YoutubeVideoId): Promise<string | null> => {
  const target = new URL(OEMBED_ENDPOINT)
  target.searchParams.set('url', `https://www.youtube.com/watch?v=${id}`)
  target.searchParams.set('format', 'json')

  try {
    const response = await fetch(target, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    if (!response.ok) return null

    const payload: unknown = await response.json()
    const title = (payload as { title?: unknown } | null)?.title

    return typeof title === 'string' && title.trim() ? title.trim() : null
  } catch (error) {
    console.warn('[youtube] title lookup failed for', id, error)
    return null
  }
}
