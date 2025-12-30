import ColorThief from 'colorthief'

const DEFAULT_COLOR = '#f3d0d3'

// Saturation (0.0 - 1.0): меньше = грязнее/серее
const SAT_MIN = 0.3
const SAT_MAX = 0.5

// lightness (0.0 - 1.0): больше = светлее (фон)
const LIGHT_MIN = 0.75
const LIGHT_MAX = 0.85

class ColorService {
  private cache = new Map<string, string>()
  private colorThief = new ColorThief()

  public async extractDominantColor(imageUrl: string): Promise<string> {
    if (this.cache.has(imageUrl)) return this.cache.get(imageUrl)!

    try {
      const img = await this.loadImage(imageUrl)

      const [r, g, b] = this.colorThief.getColor(img)
      const [h, s, l] = this.rgbToHsl(r, g, b)

      const mutedS = Math.max(SAT_MIN, Math.min(s, SAT_MAX))
      const brightL = Math.max(LIGHT_MIN, Math.min(l, LIGHT_MAX))

      const [finalR, finalG, finalB] = this.hslToRgb(h, mutedS, brightL)
      const hex = this.rgbToHex(finalR, finalG, finalB)

      this.cache.set(imageUrl, hex)
      return hex
    } catch (error) {
      console.warn('Color extraction failed', error)
      return DEFAULT_COLOR
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = src
      img.onload = () => resolve(img)
      img.onerror = reject
    })
  }

  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    return [h, s, l]
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const toHex = (c: number) => {
      const hex = c.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }
}

export const colorService = new ColorService()
