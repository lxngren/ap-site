import { describe, expect, it } from 'vitest'
import { DEFAULT_ACCENT, clamp, hslToHex, isHexColor, toAccent, toHexColor } from './color'

describe('isHexColor', () => {
  it('accepts six-digit hex in either case', () => {
    expect(isHexColor('#a49fdf')).toBe(true)
    expect(isHexColor('#A49FDF')).toBe(true)
    expect(isHexColor('#000000')).toBe(true)
  })

  it('rejects notations the colour input cannot consume', () => {
    expect(isHexColor('#abc')).toBe(false)
    expect(isHexColor('a49fdf')).toBe(false)
    expect(isHexColor('#a49fdff')).toBe(false)
    expect(isHexColor('rgb(164,159,223)')).toBe(false)
    expect(isHexColor('#zzzzzz')).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(isHexColor(null)).toBe(false)
    expect(isHexColor(undefined)).toBe(false)
    expect(isHexColor(0xa49fdf)).toBe(false)
  })
})

describe('toHexColor', () => {
  it('passes valid colours through', () => {
    expect(toHexColor('#123456')).toBe('#123456')
  })

  it('falls back rather than throwing on malformed stored values', () => {
    expect(toHexColor('nonsense')).toBe(DEFAULT_ACCENT)
    expect(toHexColor(undefined)).toBe(DEFAULT_ACCENT)
    expect(toHexColor(null, '#ffffff' as never)).toBe('#ffffff')
  })
})

describe('clamp', () => {
  it('bounds a value on both sides', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})

describe('hslToHex', () => {
  it('converts the primaries', () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe('#ff0000')
    expect(hslToHex({ h: 120, s: 100, l: 50 })).toBe('#00ff00')
    expect(hslToHex({ h: 240, s: 100, l: 50 })).toBe('#0000ff')
  })

  it('converts achromatic values', () => {
    expect(hslToHex({ h: 0, s: 0, l: 0 })).toBe('#000000')
    expect(hslToHex({ h: 0, s: 0, l: 100 })).toBe('#ffffff')
    expect(hslToHex({ h: 210, s: 0, l: 50 })).toBe('#808080')
  })

  it('always emits a padded six-digit string', () => {
    expect(hslToHex({ h: 0, s: 0, l: 2 })).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('wraps hue rather than producing garbage outside 0-360', () => {
    expect(hslToHex({ h: 360, s: 100, l: 50 })).toBe(hslToHex({ h: 0, s: 100, l: 50 }))
    expect(hslToHex({ h: 480, s: 100, l: 50 })).toBe(hslToHex({ h: 120, s: 100, l: 50 }))
    expect(hslToHex({ h: -120, s: 100, l: 50 })).toBe(hslToHex({ h: 240, s: 100, l: 50 }))
  })
})

describe('toAccent', () => {
  it('pulls an over-saturated colour into the readable band', () => {
    expect(toAccent({ h: 0, s: 100, l: 50 })).toBe('#df9f9f')
    expect(toAccent({ h: 0, s: 100, l: 50 })).toBe(hslToHex({ h: 0, s: 50, l: 75 }))
  })

  it('lifts a near-black colour to the minimum lightness', () => {
    expect(toAccent({ h: 0, s: 100, l: 0 })).toBe(toAccent({ h: 0, s: 100, l: 40 }))
  })

  it('leaves a colour already inside the band untouched', () => {
    const inside = { h: 200, s: 40, l: 80 }
    expect(toAccent(inside)).toBe(hslToHex(inside))
  })

  it('preserves hue, so the accent still reads as taken from the image', () => {
    expect(toAccent({ h: 120, s: 100, l: 10 })).not.toBe(toAccent({ h: 240, s: 100, l: 10 }))
  })

  it('always produces a value the colour input can consume', () => {
    for (const hue of [0, 45, 90, 180, 270, 359]) {
      expect(isHexColor(toAccent({ h: hue, s: 100, l: 50 }))).toBe(true)
    }
  })
})
