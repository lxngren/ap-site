import { ref, type Ref } from 'vue'

export interface IAssetsLoader {
  readonly loadedAssets: Ref<Set<string | number>>
  isLoaded(id: string | number): boolean
  load(id: string | number, url: string): Promise<void>
}

export class AssetsLoader implements IAssetsLoader {
  public readonly loadedAssets = ref(new Set<string | number>())

  public isLoaded(id: string | number): boolean {
    return this.loadedAssets.value.has(id)
  }

  public async load(id: string | number, url: string): Promise<void> {
    if (!url) return

    this.loadedAssets.value.delete(id)

    const img = new Image()
    img.src = url

    try {
      await img.decode()
      this.loadedAssets.value.add(id)
    } catch {
      this.loadedAssets.value.add(id)
    }
  }
}
