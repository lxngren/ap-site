import { ref, watch, toValue, type MaybeRef } from 'vue'
import { youtubeService } from '@/services/YouTubeService.ts'
import type { YoutubeMetaData } from '@/types'

export function useYoutube(videoId: MaybeRef<string | undefined | null>) {
  const data = ref<YoutubeMetaData | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchData = async () => {
    const id = toValue(videoId)

    if (!id) {
      data.value = null
      error.value = null
      return
    }

    isLoading.value = true
    error.value = null

    try {
      data.value = await youtubeService.getVideoData(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown YouTube Error'
      data.value = null
    } finally {
      isLoading.value = false
    }
  }

  watch(() => toValue(videoId), fetchData, { immediate: true })

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}
