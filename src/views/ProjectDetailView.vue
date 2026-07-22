<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'

import YouTubePlayer from '@/components/YouTubePlayer.vue'
import { colorService } from '@/services/colorService'
import { useThumbnail } from '@/composables/useThumbnail'
import { DEFAULT_ACCENT, type HexColor } from '@/domain/color'
import { toProjectId } from '@/domain/content'
import { thumbnailUrl, watchUrl } from '@/domain/youtube'

const route = useRoute()
const store = useProjectsStore()
const thumbnail = useThumbnail()

const accentColor = ref<HexColor>(DEFAULT_ACCENT)

const projectId = computed(() => toProjectId(Number(route.params.id)))
const project = computed(() =>
  projectId.value === null ? null : store.getProjectById(projectId.value),
)

const isMissing = computed(() => store.isReady && project.value === null)

const backgroundSource = computed(() => {
  const current = project.value
  if (current === null) return ''
  if (current.thumbnailUrl) return current.thumbnailUrl
  return current.youtubeId === null ? '' : thumbnailUrl(current.youtubeId, 'maxres')
})

const youtubeLink = computed(() => {
  const id = project.value?.youtubeId
  return id === null || id === undefined ? null : watchUrl(id)
})

watch(
  backgroundSource,
  async (source) => {
    const color = source ? await colorService.extract(source) : DEFAULT_ACCENT
    accentColor.value = color
    store.setAccentColor(color)
  },
  { immediate: true },
)
</script>

<template>
  <div class="project-detail-page" v-if="project">
    <div class="bg-wrapper">
      <transition name="fade-slow">
        <img
          v-if="backgroundSource"
          :key="backgroundSource"
          :src="backgroundSource"
          alt=""
          class="bg-image-hd"
          @load="thumbnail.onLoad"
          @error="thumbnail.onError"
        />
      </transition>
      <div class="bg-overlay"></div>
    </div>

    <div class="split-layout">
      <div class="left-column">
        <div class="text-content">
          <span class="client-name">{{ project.client }}</span>
          <h1 class="project-title">{{ project.title }}</h1>
          <p class="project-description">{{ project.description }}</p>
        </div>

        <div class="meta-footer">
          <a
            v-if="youtubeLink"
            :href="youtubeLink"
            target="_blank"
            rel="noopener noreferrer"
            class="video-link"
          >
            Watch on YouTube <span class="arrow">→</span>
          </a>
        </div>
      </div>

      <div class="video-section">
        <div class="player-wrapper" v-if="project.youtubeId">
          <YouTubePlayer :videoId="project.youtubeId" />
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="isMissing" class="project-missing">
    <p class="missing-text">This project is no longer available.</p>
    <RouterLink to="/projects" class="missing-link">
      Back to projects <span class="arrow">→</span>
    </RouterLink>
  </div>
</template>

<style scoped>
.project-detail-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.3;
}
.bg-image-hd {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 50%, rgba(0, 0, 0, 0.1), #000 90%);
}

.fade-slow-enter-active,
.fade-slow-leave-active {
  transition: opacity 1s ease;
}
.fade-slow-enter-from,
.fade-slow-leave-to {
  opacity: 0;
}

.split-layout {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: minmax(400px, 35%) 1fr;
  padding: 0 4rem;
  align-items: center;
  column-gap: 4rem;
}

.left-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  overflow-y: auto;
  padding-right: 2rem;
  scrollbar-width: none;
}
.left-column::-webkit-scrollbar {
  display: none;
}

.client-name {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
  opacity: 0.8;
  margin-bottom: 1rem;
  display: block;
}

.project-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(2rem, 3.5vw, 4rem);
  text-transform: uppercase;
  line-height: 0.95;
  color: v-bind(accentColor);

  margin: 0 0 1.5rem 0;
  transform: scaleX(1.05);
  transform-origin: left;
  transition: color 1s ease;
}

.project-description {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  color: #d1d1d1;
  max-width: 90%;
}

.meta-footer {
  margin-top: 2rem;
}

.video-link {
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.7;
  transition: opacity 0.3s;
}
.video-link:hover {
  opacity: 1;
}
.arrow {
  margin-left: 5px;
}

.video-section {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-missing {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 200px 4rem 4rem;
  font-family: 'Inter', sans-serif;
}

.missing-text {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8a8a8a;
}

.missing-link {
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.missing-link:hover {
  color: var(--main-accent);
}

.player-wrapper {
  width: 100%;
  max-width: calc((100vh - 12rem) * 16 / 9);
  aspect-ratio: 16 / 9;
  background: #000;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .project-detail-page {
    position: relative;
    height: auto;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .split-layout {
    display: flex;
    flex-direction: column;
    padding: 160px 20px 60px 20px;
    gap: 3rem;
    height: auto;
  }

  .left-column {
    display: contents;
  }

  .text-content {
    order: 1;
    width: 100%;
  }

  .video-section {
    order: 2;
    height: auto;
    width: 100%;
    margin-bottom: 0;
  }

  .meta-footer {
    order: 3;
    margin-top: 1rem;
    width: 100%;
  }

  .player-wrapper {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    max-width: none;
  }

  .project-title {
    font-size: 2.5rem;
  }
  .project-description {
    max-width: 100%;
  }
}
</style>
