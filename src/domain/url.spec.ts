import { describe, expect, it } from 'vitest'
import { toHttpUrl, toMailtoUrl, toSafeUrl } from './url'

describe('toSafeUrl', () => {
  it('accepts the protocols the content model actually uses', () => {
    expect(toSafeUrl('https://instagram.com/ari.cgi')).toBe('https://instagram.com/ari.cgi')
    expect(toSafeUrl('http://example.com')).toBe('http://example.com')
    expect(toSafeUrl('mailto:hi@example.com')).toBe('mailto:hi@example.com')
  })

  it('trims surrounding whitespace before parsing', () => {
    expect(toSafeUrl('  https://example.com  ')).toBe('https://example.com')
  })

  it.each([
    ['javascript:alert(1)'],
    ['JavaScript:alert(1)'],
    ['JAVASCRIPT:alert(1)'],
    ['  javascript:alert(1)'],
    ['data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='],
    ['vbscript:msgbox(1)'],
    ['file:///etc/passwd'],
  ])('rejects %s', (hostile) => {
    expect(toSafeUrl(hostile)).toBeNull()
  })

  it('rejects protocol-relative URLs, which read as same-origin but are not', () => {
    expect(toSafeUrl('//evil.example.com/path')).toBeNull()
  })

  it('rejects values that are not parseable URLs at all', () => {
    expect(toSafeUrl('not a url')).toBeNull()
    expect(toSafeUrl('example.com')).toBeNull()
    expect(toSafeUrl('')).toBeNull()
    expect(toSafeUrl('   ')).toBeNull()
  })

  it('rejects non-string input rather than coercing it', () => {
    expect(toSafeUrl(null)).toBeNull()
    expect(toSafeUrl(undefined)).toBeNull()
    expect(toSafeUrl(42)).toBeNull()
    expect(toSafeUrl({ href: 'https://example.com' })).toBeNull()
  })
})

describe('toHttpUrl', () => {
  it('accepts network protocols', () => {
    expect(toHttpUrl('https://img.youtube.com/vi/abc/hqdefault.jpg')).toBe(
      'https://img.youtube.com/vi/abc/hqdefault.jpg',
    )
  })

  it('rejects mailto, which is meaningless for an image or a fetch', () => {
    expect(toHttpUrl('mailto:hi@example.com')).toBeNull()
  })

  it('rejects the same hostile protocols as toSafeUrl', () => {
    expect(toHttpUrl('javascript:alert(1)')).toBeNull()
    expect(toHttpUrl('data:image/svg+xml,<svg onload=alert(1)>')).toBeNull()
  })
})

describe('toMailtoUrl', () => {
  it('builds a mailto link from a plausible address', () => {
    expect(toMailtoUrl('hi@example.com')).toBe('mailto:hi@example.com')
    expect(toMailtoUrl('  hi@example.com  ')).toBe('mailto:hi@example.com')
  })

  it('rejects values that would produce a broken link', () => {
    expect(toMailtoUrl('')).toBeNull()
    expect(toMailtoUrl('   ')).toBeNull()
    expect(toMailtoUrl('not-an-email')).toBeNull()
  })

  it('rejects embedded whitespace, which would let a header be smuggled in', () => {
    expect(toMailtoUrl('hi@example.com?bcc=someone\nelse@evil.com')).toBeNull()
    expect(toMailtoUrl('hi@example.com else@evil.com')).toBeNull()
  })
})
