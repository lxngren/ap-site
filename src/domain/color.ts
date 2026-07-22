import type { Brand } from './brand'

export type HexColor = Brand<string, 'HexColor'>

export interface Hsl {
  readonly h: number
  readonly s: number
  readonly l: number
}

const HEX_PATTERN = /^#[0-9a-f]{6}$/i

export const DEFAULT_ACCENT = '#a49fdf' as HexColor

const ACCENT_SATURATION = { min: 30, max: 50 } as const
const ACCENT_LIGHTNESS = { min: 75, max: 85 } as const

export const isHexColor = (value: unknown): value is HexColor =>
  typeof value === 'string' && HEX_PATTERN.test(value)

export const toHexColor = (value: unknown, fallback: HexColor = DEFAULT_ACCENT): HexColor =>
  isHexColor(value) ? value : fallback

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

export const hslToHex = (hsl: Hsl): HexColor => {
  const saturation = clamp(hsl.s, 0, 100) / 100
  const lightness = clamp(hsl.l, 0, 100) / 100
  const hue = ((hsl.h % 360) + 360) % 360

  const chroma = saturation * Math.min(lightness, 1 - lightness)

  const channel = (offset: number): string => {
    const k = (offset + hue / 30) % 12
    const value = lightness - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${channel(0)}${channel(8)}${channel(4)}` as HexColor
}

export const toAccent = (hsl: Hsl): HexColor =>
  hslToHex({
    h: hsl.h,
    s: clamp(hsl.s, ACCENT_SATURATION.min, ACCENT_SATURATION.max),
    l: clamp(hsl.l, ACCENT_LIGHTNESS.min, ACCENT_LIGHTNESS.max),
  })
