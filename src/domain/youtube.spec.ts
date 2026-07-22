import { describe, expect, it } from 'vitest'
import {
  downgradeThumbnailUrl,
  isPlaceholderThumbnail,
  thumbnailUrl,
  toYoutubeVideoId,
  watchUrl,
  type YoutubeVideoId,
} from './youtube'

const ID = 'dQw4w9WgXcQ'

describe('toYoutubeVideoId', () => {
  it('accepts a bare id', () => {
    expect(toYoutubeVideoId(ID)).toBe(ID)
    expect(toYoutubeVideoId(`  ${ID}  `)).toBe(ID)
  })

  it.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtube.com/watch?v=${ID}&t=42s`],
    [`https://youtu.be/${ID}`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/v/${ID}`],
    [`http://www.youtube.com/watch?feature=share&v=${ID}`],
  ])('extracts the id from %s', (url) => {
    expect(toYoutubeVideoId(url)).toBe(ID)
  })

  it('rejects ids of the wrong length', () => {
    expect(toYoutubeVideoId('short')).toBeNull()
    expect(toYoutubeVideoId('waytoolongvideoid')).toBeNull()
  })

  it('rejects empty and non-string input', () => {
    expect(toYoutubeVideoId('')).toBeNull()
    expect(toYoutubeVideoId('   ')).toBeNull()
    expect(toYoutubeVideoId(null)).toBeNull()
    expect(toYoutubeVideoId(undefined)).toBeNull()
    expect(toYoutubeVideoId(12345678901)).toBeNull()
  })

  it('rejects an unrelated URL', () => {
    expect(toYoutubeVideoId('https://example.com/watch?v=abcdefghijk')).toBeNull()
  })
})

describe('thumbnailUrl', () => {
  it('builds the URL arithmetically, with no network involved', () => {
    expect(thumbnailUrl(ID as YoutubeVideoId, 'maxres')).toBe(
      `https://img.youtube.com/vi/${ID}/maxresdefault.jpg`,
    )
    expect(thumbnailUrl(ID as YoutubeVideoId, 'hq')).toBe(
      `https://img.youtube.com/vi/${ID}/hqdefault.jpg`,
    )
  })

  it('defaults to the highest quality', () => {
    expect(thumbnailUrl(ID as YoutubeVideoId)).toContain('maxresdefault')
  })
})

describe('watchUrl', () => {
  it('builds the canonical watch link', () => {
    expect(watchUrl(ID as YoutubeVideoId)).toBe(`https://www.youtube.com/watch?v=${ID}`)
  })
})

describe('downgradeThumbnailUrl', () => {
  it('walks maxres to hq to mq and then stops', () => {
    const maxres = `https://img.youtube.com/vi/${ID}/maxresdefault.jpg`
    const hq = downgradeThumbnailUrl(maxres)
    expect(hq).toBe(`https://img.youtube.com/vi/${ID}/hqdefault.jpg`)

    const mq = downgradeThumbnailUrl(hq as string)
    expect(mq).toBe(`https://img.youtube.com/vi/${ID}/mqdefault.jpg`)

    expect(downgradeThumbnailUrl(mq as string)).toBeNull()
  })

  it('returns null for a URL that is not a recognised thumbnail', () => {
    expect(downgradeThumbnailUrl('https://example.com/cover.jpg')).toBeNull()
    expect(downgradeThumbnailUrl('')).toBeNull()
  })
})

describe('isPlaceholderThumbnail', () => {
  it('recognises the 120x90 grey placeholder', () => {
    expect(isPlaceholderThumbnail(120, 90)).toBe(true)
    expect(isPlaceholderThumbnail(100, 80)).toBe(true)
  })

  it('treats real artwork as displayable', () => {
    expect(isPlaceholderThumbnail(1280, 720)).toBe(false)
    expect(isPlaceholderThumbnail(480, 360)).toBe(false)
  })

  it('does not treat an undecoded image as a placeholder', () => {
    expect(isPlaceholderThumbnail(0, 0)).toBe(false)
  })
})
