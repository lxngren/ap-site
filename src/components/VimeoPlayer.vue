<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Player from '@vimeo/player'

const props = defineProps<{
  videoId: string
}>()

const playerContainer = ref<HTMLElement | null>(null)
let playerInstance: Player | null = null

const initPlayer = () => {
  if (!playerContainer.value) return

  playerInstance = new Player(playerContainer.value, {
    id: Number(props.videoId),
    autoplay: true, // Автоплей
    muted: false, // Можно true, если браузер блокирует звук
    background: false,
    responsive: true,
    loop: true, // Зацикливаем для атмосферы
    dnt: true, // Do Not Track (немного ускоряет загрузку)
    controls: true, // Оставляем контроли (пауза/звук)
  })

  // Обработка ошибок автоплея (браузеры блокируют звук без взаимодействия)
  playerInstance.play().catch((error) => {
    if (error.name === 'NotAllowedError') {
      // Если автоплей со звуком запрещен, мьютим и пробуем снова
      playerInstance?.setMuted(true)
      playerInstance?.play()
    }
  })
}

onMounted(() => {
  initPlayer()
})

onBeforeUnmount(() => {
  if (playerInstance) {
    playerInstance.destroy().catch(() => {})
  }
})

// Реакция на смену видео без пересоздания компонента
watch(
  () => props.videoId,
  (newId) => {
    if (playerInstance) {
      playerInstance.loadVideo(Number(newId)).catch(console.error)
    }
  },
)
</script>

<template>
  <div ref="playerContainer" class="vimeo-player-container"></div>
</template>

<style scoped>
.vimeo-player-container {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 4px; /* Легкое скругление для эстетики */
  overflow: hidden;
}
:deep(iframe) {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border: none;
}
</style>
