import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GLOBAL_SETTINGS,
  PROJECT_CATEGORIES,
  draftToProject,
  emptyDraft,
  nextProjectId,
  parseAppConfig,
  parseProject,
  projectToDraft,
  toProjectId,
  withSingleHero,
  type Project,
  type ProjectId,
} from './content'
import { DEFAULT_ACCENT } from './color'

const id = (value: number): ProjectId => value as ProjectId

const validRaw = {
  id: 1,
  title: 'Neon Drift',
  client: 'Acme',
  description: 'A spot.',
  category: 'Motion Graphics',
  youtubeId: 'dQw4w9WgXcQ',
  thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  isFeatured: true,
}

describe('toProjectId', () => {
  it('accepts positive safe integers', () => {
    expect(toProjectId(1)).toBe(1)
    expect(toProjectId(9007199254740991)).toBe(9007199254740991)
  })

  it('rejects values that could not have come from the id generator', () => {
    expect(toProjectId(0)).toBeNull()
    expect(toProjectId(-1)).toBeNull()
    expect(toProjectId(1.5)).toBeNull()
    expect(toProjectId(NaN)).toBeNull()
    expect(toProjectId(Infinity)).toBeNull()
    expect(toProjectId('1')).toBeNull()
    expect(toProjectId(null)).toBeNull()
  })
})

describe('parseProject', () => {
  it('parses a well-formed entry', () => {
    expect(parseProject(validRaw)).toEqual({
      id: 1,
      title: 'Neon Drift',
      client: 'Acme',
      description: 'A spot.',
      category: 'Motion Graphics',
      youtubeId: 'dQw4w9WgXcQ',
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      isFeatured: true,
    })
  })

  it('drops entries that cannot produce a usable card', () => {
    expect(parseProject({ ...validRaw, id: undefined })).toBeNull()
    expect(parseProject({ ...validRaw, title: '' })).toBeNull()
    expect(parseProject({ ...validRaw, title: '   ' })).toBeNull()
    expect(parseProject(null)).toBeNull()
    expect(parseProject('a project')).toBeNull()
    expect(parseProject([])).toBeNull()
  })

  it('falls back to the first category when the stored one is unknown', () => {
    const parsed = parseProject({ ...validRaw, category: 'Retired Category' })
    expect(parsed?.category).toBe(PROJECT_CATEGORIES[0])
  })

  it('strips a thumbnail URL that is not a real network URL', () => {
    expect(parseProject({ ...validRaw, thumbnailUrl: 'javascript:alert(1)' })?.thumbnailUrl).toBe('')
    expect(parseProject({ ...validRaw, thumbnailUrl: 42 })?.thumbnailUrl).toBe('')
  })

  it('normalises an unusable video id to null instead of keeping junk', () => {
    expect(parseProject({ ...validRaw, youtubeId: 'nope' })?.youtubeId).toBeNull()
    expect(parseProject({ ...validRaw, youtubeId: undefined })?.youtubeId).toBeNull()
  })

  it('treats anything other than true as not featured', () => {
    expect(parseProject({ ...validRaw, isFeatured: 'yes' })?.isFeatured).toBe(false)
    expect(parseProject({ ...validRaw, isFeatured: 1 })?.isFeatured).toBe(false)
  })
})

describe('parseAppConfig', () => {
  it.each([[null], [undefined], ['garbage'], [42], [[]], [{}]])(
    'returns a usable config for %s',
    (raw) => {
      const config = parseAppConfig(raw)
      expect(config.projects).toEqual([])
      expect(config.about).toBeNull()
      expect(config.global).toEqual(DEFAULT_GLOBAL_SETTINGS)
    },
  )

  it('keeps the good projects and drops the broken ones', () => {
    const config = parseAppConfig({
      projects: [validRaw, null, { id: 2 }, { ...validRaw, id: 3, title: 'Second' }],
    })

    expect(config.projects.map((project) => project.title)).toEqual(['Neon Drift', 'Second'])
  })

  it('defaults global settings when the stored colour is malformed', () => {
    const config = parseAppConfig({ global: { accentMode: 'hero', customColor: 'not-a-colour' } })
    expect(config.global).toEqual({ accentMode: 'hero', customColor: DEFAULT_ACCENT })
  })

  it('falls back to custom mode for an unknown accent mode', () => {
    expect(parseAppConfig({ global: { accentMode: 'rainbow' } }).global.accentMode).toBe('custom')
  })

  it('parses about, discarding non-string entries in its arrays', () => {
    const config = parseAppConfig({
      about: {
        title: 'Hi',
        description: 'Desc',
        skills: ['Compositing', 42, null, 'Lighting'],
        software: [{ category: 'DCC', items: ['Blender', 7] }, { items: ['orphan'] }, 'nope'],
        email: '  hi@example.com ',
        instagram: 'https://instagram.com/x',
        discord: 'user',
      },
    })

    expect(config.about?.skills).toEqual(['Compositing', 'Lighting'])
    expect(config.about?.software).toEqual([{ category: 'DCC', items: ['Blender'] }])
    expect(config.about?.email).toBe('hi@example.com')
  })
})

describe('withSingleHero', () => {
  const projects: readonly Project[] = [
    { ...(parseProject({ ...validRaw, id: 1, isFeatured: true }) as Project) },
    { ...(parseProject({ ...validRaw, id: 2, isFeatured: true }) as Project) },
    { ...(parseProject({ ...validRaw, id: 3, isFeatured: false }) as Project) },
  ]

  it('leaves exactly one project featured', () => {
    const result = withSingleHero(projects, id(3))
    expect(result.filter((project) => project.isFeatured).map((project) => project.id)).toEqual([3])
  })

  it('does not mutate the input', () => {
    withSingleHero(projects, id(3))
    expect(projects[0]?.isFeatured).toBe(true)
  })
})

describe('nextProjectId', () => {
  it('starts at 1 for an empty portfolio', () => {
    expect(nextProjectId([])).toBe(1)
  })

  it('takes the maximum rather than the length, so deletions cannot collide', () => {
    const projects = [
      parseProject({ ...validRaw, id: 1 }) as Project,
      parseProject({ ...validRaw, id: 9 }) as Project,
    ]
    expect(nextProjectId(projects)).toBe(10)
  })
})

describe('draft round trip', () => {
  it('requires a title and a client', () => {
    expect(draftToProject({ ...emptyDraft(), title: 'T' }, id(1))).toBeNull()
    expect(draftToProject({ ...emptyDraft(), client: 'C' }, id(1))).toBeNull()
    expect(draftToProject({ ...emptyDraft(), title: '  ', client: '  ' }, id(1))).toBeNull()
  })

  it('extracts a video id from a pasted watch URL', () => {
    const draft = {
      ...emptyDraft(),
      title: 'T',
      client: 'C',
      youtubeId: 'https://youtu.be/dQw4w9WgXcQ',
    }
    expect(draftToProject(draft, id(1))?.youtubeId).toBe('dQw4w9WgXcQ')
  })

  it('survives a trip through the editor unchanged', () => {
    const project = parseProject(validRaw) as Project
    expect(draftToProject(projectToDraft(project), project.id)).toEqual(project)
  })
})
