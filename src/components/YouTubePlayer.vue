<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { YoutubePlayerManager } from '@/core/YouTubePlayerManager'

const props = defineProps<{
  videoId: string
  autoplay?: boolean
  muted?: boolean
}>()

const containerId = `yt-player-${useId()}`

const failed = ref(false)
let manager: YoutubePlayerManager | null = null

onMounted(async () => {
  manager = new YoutubePlayerManager(containerId, props.videoId, {
    autoplay: props.autoplay === true,
    mute: props.muted === true,
  })

  try {
    await manager.mount()
  } catch (error) {
    console.error('[YouTubePlayer] mount failed', error)
    failed.value = true
  }
})

onBeforeUnmount(() => {
  manager?.destroy()
  manager = null
})

watch(
  () => props.videoId,
  (next) => {
    if (next) manager?.loadVideo(next)
  },
)
</script>

<template>
  <div class="youtube-container">
    <div v-show="!failed" :id="containerId" class="player-placeholder"></div>
    <p v-if="failed" class="player-error">Player unavailable. Use the link below to watch.</p>
  </div>
</template>

<style scoped>
.youtube-container {
  width: 100%;
  height: 100%;
  background: #000;
  position: relative;
  overflow: hidden;
}

.player-placeholder {
  width: 100%;
  height: 100%;
}

.player-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6a6a6a;
}
</style>
