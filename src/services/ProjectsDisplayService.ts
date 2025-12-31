import { type Ref } from 'vue'
import { colorService } from '@/services/ColorService'
import type { Project } from '@/types'
import { useProjectsStore } from '@/stores/projects'

export interface IProjectsManager {
  readonly isPageLoading: Ref<boolean>
  readonly projectColors: Ref<Record<number, string>>
  initialize(): Promise<void>
  processGridColors(projects: Project[]): Promise<void>
}

export class ProjectsDisplayManager implements IProjectsManager {
  readonly #store: ReturnType<typeof useProjectsStore>
  readonly #fadeDelay: number

  constructor(
    store: ReturnType<typeof useProjectsStore>,
    public readonly isPageLoading: Ref<boolean>,
    public readonly projectColors: Ref<Record<number, string>>,
    fadeDelay: number,
  ) {
    this.#store = store
    this.#fadeDelay = fadeDelay
  }

  public async initialize(): Promise<void> {
    const minDelay = new Promise((resolve) => setTimeout(resolve, this.#fadeDelay))

    try {
      await Promise.allSettled([this.#store.init(), minDelay])
    } catch (error) {
      console.error('[ProjectsDisplayManager] Critical init error:', error)
    } finally {
      this.isPageLoading.value = false
    }
  }

  public async processGridColors(projects: Project[]): Promise<void> {
    const tasks = projects
      .filter((p) => p.thumbnailUrl && !this.projectColors.value[p.id])
      .map(async (p) => {
        this.projectColors.value[p.id] = await colorService.extractDominantColor(p.thumbnailUrl)
      })
    await Promise.allSettled(tasks)
  }
}
