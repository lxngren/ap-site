<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
import { useProjectsStore } from '@/stores/projects.ts'

const route = useRoute()
const VIDEO_ROUTES = ['home', 'about']

const shouldShowVideo = computed(() => {
  return route.name && VIDEO_ROUTES.includes(route.name as string)
})

const bgVideoRef = ref<HTMLVideoElement | null>(null)
const projectsStore = useProjectsStore()

let pauseTimeout: number | undefined

watch(
  () => projectsStore.mainAccent,
  (newColor) => {
    document.documentElement.style.setProperty('--main-accent', newColor)
  },
  { immediate: true },
)

watch(
  shouldShowVideo,
  (isActive) => {
    clearTimeout(pauseTimeout)

    if (isActive) {
      bgVideoRef.value?.play().catch(() => {})
    } else {
      pauseTimeout = setTimeout(() => {
        bgVideoRef.value?.pause()
      }, 800)
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  projectsStore.init()
})
</script>

<template>
  <div class="global-background">
    <div class="bg-layer video-layer" :class="{ visible: shouldShowVideo }">
      <video ref="bgVideoRef" autoplay muted loop playsinline class="bg-video">
        <source src="@/assets/video/bg-loop.mp4" type="video/mp4" />
      </video>
      <div class="video-overlay"></div>
    </div>
  </div>

  <AppNavigation />

  <RouterView v-slot="{ Component }">
    <Transition name="page-fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
:root {
  --main-accent: #f0d0d3;
}

body {
  margin: 0;
  padding: 0;
  background: #000;
  overflow-x: hidden;
}

.global-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
  background-color: #000;
  contain: strict;
}

.bg-layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.8s ease;
  pointer-events: none;
  visibility: hidden;
}

.bg-layer.visible {
  opacity: 1;
  visibility: visible;
}

.bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.6s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
