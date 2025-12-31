import ColorThief from 'colorthief'
import type { IRGB, IHSL } from '@/types'

interface IColorService {
  extractDominantColor(imageUrl: string): Promise<string>
}

class ColorService implements IColorService {
  private readonly _cache: Map<string, string> = new Map()
  private readonly _colorThief: ColorThief = new ColorThief()

  private readonly _DEFAULT_COLOR: string = '#f3d0d3'
  private readonly _SAT_RANGE = { min: 0.3, max: 0.5 }
  private readonly _LIGHT_RANGE = { min: 0.75, max: 0.85 }

  public async extractDominantColor(imageUrl: string): Promise<string> {
    if (!imageUrl) return this._DEFAULT_COLOR

    const cached = this._cache.get(imageUrl)
    if (cached) return cached

    try {
      const img: HTMLImageElement = await this.#loadImageOptimized(imageUrl)
      const [r, g, b]: [number, number, number] = this._colorThief.getColor(img)

      const hsl = this.#rgbToHsl(r, g, b)
      const mutedS = Math.max(this._SAT_RANGE.min, Math.min(hsl.s, this._SAT_RANGE.max))
      const brightL = Math.max(this._LIGHT_RANGE.min, Math.min(hsl.l, this._LIGHT_RANGE.max))

      const rgb = this.#hslToRgb(hsl.h, mutedS, brightL)
      const hex = this.#rgbToHex(rgb.r, rgb.g, rgb.b)

      this._cache.set(imageUrl, hex)
      return hex
    } catch (error) {
      console.warn('[ColorService] Error:', error)
      return this._DEFAULT_COLOR
    }
  }

  async #loadImageOptimized(src: string): Promise<HTMLImageElement> {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = src

    await img.decode()
    return img
  }

  #rgbToHsl(r: number, g: number, b: number): IHSL {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b)
    let h = 0,
      s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
      else if (max === g) h = (b - r) / d + 2
      else h = (r - g) / d + 4
      h /= 6
    }
    return { h, s, l }
  }

  #hslToRgb(h: number, s: number, l: number): IRGB {
    let r: number, g: number, b: number
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
  }

  #rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
  }
}

export const colorService = new ColorService()
