export interface VimeoData {
  id: number
  title: string
  thumbnail_small: string
  thumbnail_medium: string
  thumbnail_large: string
  thumbnail_hd?: string
  duration: number
}

class VimeoService {
  async fetchVideoData(vimeoId: string): Promise<VimeoData> {
    try {
      const response = await fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`)
      if (!response.ok) throw new Error('Network response was not ok')

      const data = await response.json()
      if (!data || !data[0]) throw new Error('No data')

      const videoData = data[0] as VimeoData

      if (videoData.thumbnail_large) {
        videoData.thumbnail_hd = videoData.thumbnail_large.replace(/_\d+\./, '_1280.')
      }

      return videoData
    } catch (error) {
      console.error(`Vimeo fetch error:`, error)
      throw error
    }
  }
}

export const vimeoService = new VimeoService()
