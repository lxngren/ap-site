import type { Brand } from './brand'

export type SafeUrl = Brand<string, 'SafeUrl'>

const ALLOWED_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:', 'mailto:'])

export const toSafeUrl = (value: unknown): SafeUrl | null => {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const { protocol } = new URL(trimmed)
    return ALLOWED_PROTOCOLS.has(protocol) ? (trimmed as SafeUrl) : null
  } catch {
    return null
  }
}

export const toHttpUrl = (value: unknown): SafeUrl | null => {
  const url = toSafeUrl(value)
  if (url === null) return null
  return url.startsWith('http:') || url.startsWith('https:') ? url : null
}

export const toMailtoUrl = (email: string): SafeUrl | null => {
  const trimmed = email.trim()
  if (!trimmed || /\s/.test(trimmed) || !trimmed.includes('@')) return null
  return `mailto:${trimmed}` as SafeUrl
}
