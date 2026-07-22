/// <reference types="youtube" />

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: (() => void) | undefined
  }
}

const API_SCRIPT_ID = 'youtube-iframe-api'
const API_SRC = 'https://www.youtube.com/iframe_api'
const API_LOAD_TIMEOUT_MS = 10_000
const PLAYER_READY_TIMEOUT_MS = 15_000

let apiReady: Promise<void> | null = null

const loadIframeApi = (): Promise<void> => {
  if (window.YT?.Player !== undefined) return Promise.resolve()

  apiReady ??= new Promise<void>((resolve, reject) => {
    const fail = (message: string): void => {
      window.clearTimeout(timer)
      apiReady = null
      reject(new Error(message))
    }

    const timer = window.setTimeout(
      () => fail('YouTube IFrame API did not become ready in time'),
      API_LOAD_TIMEOUT_MS,
    )

    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = (): void => {
      window.clearTimeout(timer)
      previous?.()
      resolve()
    }

    if (document.getElementById(API_SCRIPT_ID) !== null) return

    const script = document.createElement('script')
    script.id = API_SCRIPT_ID
    script.src = API_SRC
    script.async = true
    script.onerror = (): void => {
      script.remove()
      fail('YouTube IFrame API script could not be fetched')
    }
    document.head.append(script)
  })

  return apiReady
}

export interface PlayerManagerOptions {
  readonly autoplay?: boolean
  readonly mute?: boolean
}

export class YoutubePlayerManager {
  #player: YT.Player | null = null
  #destroyed = false

  readonly #elementId: string
  readonly #videoId: string
  readonly #options: PlayerManagerOptions

  constructor(elementId: string, videoId: string, options: PlayerManagerOptions = {}) {
    this.#elementId = elementId
    this.#videoId = videoId
    this.#options = options
  }

  async mount(): Promise<void> {
    await loadIframeApi()
    if (this.#destroyed) return

    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(
        () => reject(new Error('YouTube player did not become ready in time')),
        PLAYER_READY_TIMEOUT_MS,
      )

      this.#player = new YT.Player(this.#elementId, {
        videoId: this.#videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: this.#options.autoplay === true ? 1 : 0,
          controls: 1,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            window.clearTimeout(timer)

            if (this.#destroyed) {
              event.target.destroy()
              this.#player = null
              resolve()
              return
            }

            if (this.#options.mute === true) event.target.mute()
            if (this.#options.autoplay === true) event.target.playVideo()
            resolve()
          },
          onError: () => {
            window.clearTimeout(timer)
            reject(new Error(`YouTube refused to play video ${this.#videoId}`))
          },
        },
      })
    })
  }

  loadVideo(videoId: string): void {
    this.#player?.loadVideoById(videoId)
  }

  destroy(): void {
    this.#destroyed = true
    this.#player?.destroy()
    this.#player = null
  }
}
