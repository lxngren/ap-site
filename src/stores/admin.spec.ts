import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyDraft, type AppConfig, type ProjectDraft, type ProjectId } from '@/domain/content'
import { DEFAULT_ACCENT } from '@/domain/color'

const gistService = {
  setToken: vi.fn(),
  verifyPermissions: vi.fn(),
  fetchConfig: vi.fn(),
  updateConfig: vi.fn(),
}

vi.mock('@/services/gistService', () => ({
  gistService: {
    setToken: (...args: unknown[]) => gistService.setToken(...args),
    verifyPermissions: (...args: unknown[]) => gistService.verifyPermissions(...args),
    fetchConfig: (...args: unknown[]) => gistService.fetchConfig(...args),
    updateConfig: (...args: unknown[]) => gistService.updateConfig(...args),
  },
  GistError: class GistError extends Error {},
}))

vi.mock('@/services/colorService', () => ({
  colorService: { extract: vi.fn(async () => DEFAULT_ACCENT) },
}))

const { useAdminStore } = await import('./admin')

const EMPTY_CONFIG: AppConfig = {
  projects: [],
  about: null,
  global: { accentMode: 'custom', customColor: DEFAULT_ACCENT },
}

const draft = (overrides: Partial<ProjectDraft> = {}): ProjectDraft => ({
  ...emptyDraft(),
  title: 'Neon Drift',
  client: 'Acme',
  ...overrides,
})

const signIn = async () => {
  const store = useAdminStore()
  gistService.verifyPermissions.mockResolvedValue(true)
  gistService.fetchConfig.mockResolvedValue(EMPTY_CONFIG)
  await store.login('token')
  return store
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('login', () => {
  it('authenticates and adopts the fetched content', async () => {
    const store = await signIn()

    expect(store.isAuthenticated).toBe(true)
    expect(gistService.setToken).toHaveBeenCalledWith('token')
    expect(store.isDirty).toBe(false)
  })

  it('rejects a token that does not own the gist, and clears it', async () => {
    const store = useAdminStore()
    gistService.verifyPermissions.mockResolvedValue(false)

    expect(await store.login('someone-elses-token')).toBe(false)
    expect(store.isAuthenticated).toBe(false)
    expect(store.error).toMatch(/access denied/i)
    expect(gistService.setToken).toHaveBeenLastCalledWith(null)
  })

  it('surfaces a network failure without authenticating', async () => {
    const store = useAdminStore()
    gistService.verifyPermissions.mockRejectedValue(new Error('offline'))

    expect(await store.login('token')).toBe(false)
    expect(store.isAuthenticated).toBe(false)
  })
})

describe('logout', () => {
  it('drops the token and the working copy', async () => {
    const store = await signIn()
    store.addProject(draft())

    store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(store.projects).toEqual([])
    expect(store.isDirty).toBe(false)
    expect(gistService.setToken).toHaveBeenLastCalledWith(null)
  })
})

describe('project editing', () => {
  it('refuses a draft without a title or client, and stays clean', async () => {
    const store = await signIn()

    const result = store.addProject(draft({ title: '' }))

    expect(result.ok).toBe(false)
    expect(store.projects).toHaveLength(0)
    expect(store.isDirty).toBe(false)
  })

  it('adds a project and marks the document dirty', async () => {
    const store = await signIn()

    expect(store.addProject(draft()).ok).toBe(true)
    expect(store.projects).toHaveLength(1)
    expect(store.projects[0]?.title).toBe('Neon Drift')
    expect(store.isDirty).toBe(true)
  })

  it('assigns ids that do not collide after a deletion', async () => {
    const store = await signIn()
    store.addProject(draft({ title: 'One' }))
    store.addProject(draft({ title: 'Two' }))

    const firstId = store.projects.find((project) => project.title === 'One')?.id
    store.removeProject(firstId as ProjectId)
    store.addProject(draft({ title: 'Three' }))

    const ids = store.projects.map((project) => project.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps exactly one hero when a second is promoted', async () => {
    const store = await signIn()
    store.addProject(draft({ title: 'One', isFeatured: true }))
    store.addProject(draft({ title: 'Two', isFeatured: true }))

    const featured = store.projects.filter((project) => project.isFeatured)
    expect(featured).toHaveLength(1)
    expect(featured[0]?.title).toBe('Two')
  })

  it('keeps one hero when an existing project is promoted by edit', async () => {
    const store = await signIn()
    store.addProject(draft({ title: 'One', isFeatured: true }))
    store.addProject(draft({ title: 'Two' }))

    const two = store.projects.find((project) => project.title === 'Two')
    store.updateProject({ ...draft({ title: 'Two', isFeatured: true }), id: two?.id ?? 0 })

    const featured = store.projects.filter((project) => project.isFeatured)
    expect(featured.map((project) => project.title)).toEqual(['Two'])
  })

  it('refuses to update a draft that has no id', async () => {
    const store = await signIn()
    expect(store.updateProject(draft({ id: 0 })).ok).toBe(false)
  })

  it('reorders without losing entries', async () => {
    const store = await signIn()
    store.addProject(draft({ title: 'One' }))
    store.addProject(draft({ title: 'Two' }))

    store.updateProjectsOrder([...store.projects].reverse())

    expect(store.projects.map((project) => project.title)).toEqual(['One', 'Two'])
  })
})

describe('saveChanges', () => {
  it('refuses to write when not signed in', async () => {
    const store = useAdminStore()

    const result = await store.saveChanges()

    expect(result.ok).toBe(false)
    expect(gistService.updateConfig).not.toHaveBeenCalled()
  })

  it('writes the working copy and clears the dirty flag', async () => {
    const store = await signIn()
    store.addProject(draft())
    gistService.updateConfig.mockResolvedValue(undefined)

    const result = await store.saveChanges()

    expect(result.ok).toBe(true)
    expect(store.isDirty).toBe(false)
    expect(gistService.updateConfig).toHaveBeenCalledOnce()
  })

  it('reports a write failure and leaves the work marked unsaved', async () => {
    const store = await signIn()
    store.addProject(draft())
    gistService.updateConfig.mockRejectedValue(new Error('403 Forbidden'))

    const result = await store.saveChanges()

    expect(result).toEqual({ ok: false, message: '403 Forbidden' })
    expect(store.isDirty).toBe(true)
  })
})
