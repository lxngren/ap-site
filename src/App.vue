<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
import { useProjectsStore } from '@/stores/projects.ts'

import desktopVideo from '@/assets/video/desktop.mp4'
import mobileVideo from '@/assets/video/mobile.mp4'

const route = useRoute()
const VIDEO_ROUTES: readonly string[] = ['home', 'about']

const mobileQuery = window.matchMedia('(max-width: 768px)')
const isMobile = ref(mobileQuery.matches)

const bgVideoRef = ref<HTMLVideoElement | null>(null)
const projectsStore = useProjectsStore()

void projectsStore.init()

const isVideoLoaded = ref(false)

const handleVideoLoad = () => {
  isVideoLoaded.value = true
}

const handleMediaChange = (event: MediaQueryListEvent): void => {
  isMobile.value = event.matches
}

const currentVideoSrc = computed(() => (isMobile.value ? mobileVideo : desktopVideo))

const shouldShowVideo = computed(
  () => typeof route.name === 'string' && VIDEO_ROUTES.includes(route.name),
)

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

watch(currentVideoSrc, () => {
  isVideoLoaded.value = false
  if (bgVideoRef.value) {
    bgVideoRef.value.load()
    if (shouldShowVideo.value) {
      bgVideoRef.value.play().catch(() => {})
    }
  }
})

onMounted(() => {
  mobileQuery.addEventListener('change', handleMediaChange)
})

onUnmounted(() => {
  clearTimeout(pauseTimeout)
  mobileQuery.removeEventListener('change', handleMediaChange)
})
</script>

<template>
  <div class="global-background">
    <Transition name="fade">
      <div v-if="shouldShowVideo && !isVideoLoaded" class="video-loader">
        <div class="spinner"></div>
      </div>
    </Transition>

    <div class="bg-layer video-layer" :class="{ visible: shouldShowVideo && isVideoLoaded }">
      <video
        ref="bgVideoRef"
        :src="currentVideoSrc"
        :key="currentVideoSrc"
        autoplay
        muted
        loop
        playsinline
        class="bg-video"
        @canplay="handleVideoLoad"
      ></video>
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
  --main-accent: #a49fdf;
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

.video-loader {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--main-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.bg-layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1s ease;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
