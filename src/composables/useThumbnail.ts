import { downgradeThumbnailUrl, isPlaceholderThumbnail } from '@/domain/youtube'

export interface ThumbnailHandlers {
  readonly onLoad: (event: Event) => boolean
  readonly onError: (event: Event) => void
}

const stepDown = (image: HTMLImageElement): boolean => {
  const next = downgradeThumbnailUrl(image.src)
  if (next === null) return false

  image.src = next
  return true
}

export const useThumbnail = (): ThumbnailHandlers => ({
  onLoad: (event: Event): boolean => {
    const image = event.target
    if (!(image instanceof HTMLImageElement)) return false

    if (isPlaceholderThumbnail(image.naturalWidth, image.naturalHeight) && stepDown(image)) {
      return false
    }
    return true
  },

  onError: (event: Event): void => {
    const image = event.target
    if (image instanceof HTMLImageElement) stepDown(image)
  },
})
