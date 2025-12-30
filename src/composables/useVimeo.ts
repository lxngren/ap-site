// src/composables/useVimeo.ts
import { ref, watch, type Ref } from 'vue'
import { vimeoService } from '@/services/vimeoService'

export function useVimeo(vimeoId: Ref<string | undefined> | string) {
  const thumbnailUrl = ref<string | null>(null)
  const videoTitle = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<unknown | null>(null)

  const fetchVideoData = async (id: string) => {
    // Сброс перед новым запросом
    isLoading.value = true
    error.value = null
    // Не сбрасываем thumbnailUrl сразу, чтобы избежать "мигания" старого фона перед новым

    try {
      const data = await vimeoService.fetchVideoData(id)
      // Предпочитаем HD версию, если хак сработал, иначе large
      thumbnailUrl.value = data.thumbnail_hd || data.thumbnail_large
      videoTitle.value = data.title
    } catch (e) {
      error.value = e
      console.warn('Error loading Vimeo data:', e)
    } finally {
      isLoading.value = false
    }
  }

  // Поддержка и ref, и string
  const idRef = ref(vimeoId)

  watch(
    () => idRef.value,
    (newId) => {
      if (newId) {
        fetchVideoData(newId)
      } else {
        thumbnailUrl.value = null
      }
    },
    { immediate: true },
  )

  return {
    thumbnailUrl,
    videoTitle,
    isLoading,
    error,
  }
}
