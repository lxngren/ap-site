import type { YoutubeMetaData } from '@/types'

export interface IYoutubeService {
  getVideoData(input: string): Promise<YoutubeMetaData>
  getThumbnailUrl(videoId: string, quality: 'maxres' | 'hq'): string
  extractVideoId(input: string): string
}

class YoutubeService implements IYoutubeService {
  private static instance: YoutubeService
  private cache = new Map<string, YoutubeMetaData>()
  private readonly YT_OEMBED_URL = 'https://www.youtube.com/oembed'

  public static getInstance(): YoutubeService {
    if (!YoutubeService.instance) {
      YoutubeService.instance = new YoutubeService()
    }
    return YoutubeService.instance
  }

  public extractVideoId(input: string): string {
    if (!input) return ''
    const cleanInput = input.trim()

    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanInput)) {
      return cleanInput
    }

    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i

    const match = cleanInput.match(regex)

    if (match && match[1]) {
      return match[1]
    }

    return ''
  }

  public async getVideoData(input: string): Promise<YoutubeMetaData> {
    const videoId = this.extractVideoId(input)

    if (!videoId) throw new Error('Invalid YouTube URL or ID')
    let title = ''
    try {
      const response = await fetch(
        `${this.YT_OEMBED_URL}?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      )

      if (response.ok) {
        const data = await response.json()
        if (data.title) {
          title = data.title
        }
      }
    } catch (e) {
      console.warn('Could not fetch YouTube title via oEmbed:', e)
    }

    return {
      id: videoId,
      title: title,
      thumbnail_url: this.getThumbnailUrl(videoId, 'hq'),
      thumbnail_maxres_url: this.getThumbnailUrl(videoId, 'maxres'),
      width: 1280,
      height: 720,
    }
  }

  public getThumbnailUrl(videoId: string, quality: 'maxres' | 'hq' = 'maxres'): string {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
  }
}

export const youtubeService = YoutubeService.getInstance()
