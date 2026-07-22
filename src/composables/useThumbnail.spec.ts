import { describe, expect, it } from 'vitest'
import { useThumbnail } from './useThumbnail'

const MAXRES = 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
const HQ = 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
const MQ = 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'

const imageEvent = (src: string, naturalWidth: number, naturalHeight: number) => {
  const image = document.createElement('img')
  image.src = src
  Object.defineProperty(image, 'naturalWidth', { value: naturalWidth, configurable: true })
  Object.defineProperty(image, 'naturalHeight', { value: naturalHeight, configurable: true })

  const event = new Event('load')
  Object.defineProperty(event, 'target', { value: image })

  return { image, event }
}

describe('useThumbnail onLoad', () => {
  it('reports a real thumbnail as displayable', () => {
    const { onLoad } = useThumbnail()
    const { event } = imageEvent(MAXRES, 1280, 720)

    expect(onLoad(event)).toBe(true)
  })

  it('steps down and withholds display when served the grey placeholder', () => {
    const { onLoad } = useThumbnail()
    const { image, event } = imageEvent(MAXRES, 120, 90)

    expect(onLoad(event)).toBe(false)
    expect(image.src).toBe(HQ)
  })

  it('gives up and displays once the ladder is exhausted', () => {
    const { onLoad } = useThumbnail()
    const { image, event } = imageEvent(MQ, 120, 90)

    expect(onLoad(event)).toBe(true)
    expect(image.src).toBe(MQ)
  })

  it('ignores events whose target is not an image', () => {
    const { onLoad } = useThumbnail()
    const event = new Event('load')
    Object.defineProperty(event, 'target', { value: document.createElement('div') })

    expect(onLoad(event)).toBe(false)
  })
})

describe('useThumbnail onError', () => {
  it('walks down one quality step', () => {
    const { onError } = useThumbnail()
    const { image, event } = imageEvent(MAXRES, 0, 0)

    onError(event)
    expect(image.src).toBe(HQ)

    onError(event)
    expect(image.src).toBe(MQ)
  })

  it('stops at the bottom rather than looping', () => {
    const { onError } = useThumbnail()
    const { image, event } = imageEvent(MQ, 0, 0)

    onError(event)
    expect(image.src).toBe(MQ)
  })

  it('leaves a non-YouTube URL alone', () => {
    const { onError } = useThumbnail()
    const { image, event } = imageEvent('https://example.com/cover.jpg', 0, 0)

    onError(event)
    expect(image.src).toBe('https://example.com/cover.jpg')
  })
})
