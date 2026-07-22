import { getColor } from 'colorthief'
import { DEFAULT_ACCENT, toAccent, type HexColor } from '@/domain/color'

const EXTRACTION_TIMEOUT_MS = 8_000

const loadImage = (src: string, signal: AbortSignal): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'

    const onAbort = (): void => {
      cleanup()
      image.src = ''
      reject(signal.reason instanceof Error ? signal.reason : new Error('Image load aborted'))
    }

    const cleanup = (): void => {
      image.onload = null
      image.onerror = null
      signal.removeEventListener('abort', onAbort)
    }

    image.onload = (): void => {
      cleanup()
      resolve(image)
    }
    image.onerror = (): void => {
      cleanup()
      reject(new Error(`Failed to load image: ${src}`))
    }

    signal.addEventListener('abort', onAbort, { once: true })
    image.src = src
  })

class AccentPalette {
  readonly #cache = new Map<string, HexColor>()
  readonly #inFlight = new Map<string, Promise<HexColor>>()

  async extract(imageUrl: string): Promise<HexColor> {
    if (!imageUrl) return DEFAULT_ACCENT

    const cached = this.#cache.get(imageUrl)
    if (cached !== undefined) return cached

    const pending = this.#inFlight.get(imageUrl)
    if (pending !== undefined) return pending

    const request = this.#extract(imageUrl).finally(() => {
      this.#inFlight.delete(imageUrl)
    })
    this.#inFlight.set(imageUrl, request)

    return request
  }

  async #extract(imageUrl: string): Promise<HexColor> {
    const signal = AbortSignal.timeout(EXTRACTION_TIMEOUT_MS)

    try {
      const image = await loadImage(imageUrl, signal)
      const color = await getColor(image, { signal })
      if (color === null) return DEFAULT_ACCENT

      const accent = toAccent(color.hsl())
      this.#cache.set(imageUrl, accent)
      return accent
    } catch (error) {
      console.warn('[colorService] extraction failed for', imageUrl, error)
      return DEFAULT_ACCENT
    }
  }
}

export const colorService = new AccentPalette()
