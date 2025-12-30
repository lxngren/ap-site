<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { YoutubePlayerManager } from '@/core/YouTubePlayerManager'

const props = defineProps<{
  videoId: string
  autoplay?: boolean
  muted?: boolean
}>()

const containerId = `yt-player-${Math.random().toString(36).substring(2, 9)}`
let playerManager: YoutubePlayerManager | null = null

onMounted(async () => {
  playerManager = new YoutubePlayerManager(containerId, props.videoId, {
    autoplay: props.autoplay,
    mute: props.muted,
  })

  await playerManager.mount()
})

onBeforeUnmount(() => {
  playerManager?.destroy()
  playerManager = null
})

watch(
  () => props.videoId,
  (newId) => {
    if (newId) playerManager?.loadVideo(newId)
  },
)
</script>

<template>
  <div class="youtube-container">
    <div :id="containerId" class="player-placeholder"></div>
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
</style>
