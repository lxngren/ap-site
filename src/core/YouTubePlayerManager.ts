/// <reference types="youtube" />

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
  }
}

export interface PlayerManagerOptions {
  autoplay?: boolean
  mute?: boolean
}

export class YoutubePlayerManager {
  private player: YT.Player | null = null
  private readonly elementId: string
  private readonly videoId: string
  private managerOptions: PlayerManagerOptions

  constructor(elementId: string, videoId: string, options: PlayerManagerOptions = {}) {
    this.elementId = elementId
    this.videoId = videoId
    this.managerOptions = options
  }

  public async mount(): Promise<void> {
    await this.ensureApiLoaded()

    return new Promise((resolve) => {
      this.player = new YT.Player(this.elementId, {
        videoId: this.videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: this.managerOptions.autoplay ? 1 : 0,
          controls: 1,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            if (this.managerOptions.mute) {
              event.target.mute()
            }

            if (this.managerOptions.autoplay) {
              event.target.playVideo()
            }
            resolve()
          },
        },
      })
    })
  }

  public loadVideo(videoId: string): void {
    if (this.player && typeof this.player.loadVideoById === 'function') {
      this.player.loadVideoById(videoId)
    }
  }

  public destroy(): void {
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy()
    }
    this.player = null
  }

  private ensureApiLoaded(): Promise<void> {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve()
        return
      }

      const existing_script = document.getElementById('youtube-iframe-api')
      if (!existing_script) {
        const tag = document.createElement('script')
        tag.id = 'youtube-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'

        const first_script_tag = document.getElementsByTagName('script')[0]
        if (first_script_tag && first_script_tag.parentNode) {
          first_script_tag.parentNode.insertBefore(tag, first_script_tag)
        } else {
          document.head.appendChild(tag)
        }
      }

      const previousCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback()
        resolve()
      }
    })
  }
}
