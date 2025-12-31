<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useProjectsStore } from '@/stores/projects'
import { ProjectsDisplayManager } from '@/services/ProjectsDisplayService'
import { AssetsLoader } from '@/services/AssetsLoader'

import type { Project } from '@/types'

const FADE_DELAY_MS = 800
const DEFAULT_ACCENT = '#f3d0d3'

const store = useProjectsStore()
const router = useRouter()

const isPageLoading = ref<boolean>(store.projects.length === 0)
const projectColors = ref<Record<number, string>>({})
const activeFilter = ref<string>('All')

const loader = new AssetsLoader()
const manager = new ProjectsDisplayManager(store, isPageLoading, projectColors, FADE_DELAY_MS)

const filters = ['All', '3D / VFX', 'Motion Graphics', 'Graphic Design'] as const

const projects = computed<Project[]>(() => store.projects)
const heroProject = computed<Project | undefined>(() => store.projects.find((p) => p.isFeatured))

const heroImageUrl = computed<string>(() => {
  const project = heroProject.value
  return project ? project.heroThumbnailUrl || project.thumbnailUrl : ''
})

const filteredProjects = computed<Project[]>(() => {
  if (activeFilter.value === 'All') return projects.value
  return projects.value.filter((p) => p.category === activeFilter.value)
})

const accentColor = computed<string>(() => store.heroAccentColor || DEFAULT_ACCENT)

watch(
  heroImageUrl,
  (url) => {
    if (url) loader.load('hero', url)
  },
  { immediate: true },
)

watch(
  projects,
  (list) => {
    if (list.length > 0) {
      manager.processGridColors(list)
    }
  },
  { immediate: true },
)

onMounted(() => manager.initialize())

const goToProject = (id: number): void => {
  router.push({ name: 'project-detail', params: { id } })
}
</script>

<template>
  <div class="page-wrapper">
    <transition name="fade">
      <div v-if="isPageLoading" class="loading-skeleton">
        <div class="skeleton-hero">
          <div class="sk-meta"></div>
          <div class="sk-title"></div>
          <div class="sk-btn"></div>
        </div>
        <div class="skeleton-grid">
          <div class="sk-card" v-for="i in 4" :key="i">
            <div class="sk-image"></div>
            <div class="sk-text"></div>
          </div>
        </div>
      </div>
    </transition>

    <div class="content-wrapper" :class="{ 'content-visible': !isPageLoading }">
      <div class="hero-background" v-if="heroProject">
        <div class="bg-image-wrapper" :class="{ 'img-loaded': loader.isLoaded('hero') }">
          <div v-if="!loader.isLoaded('hero')" class="sk-image hero-skeleton-overlay"></div>
          <img :key="heroImageUrl" :src="heroImageUrl" alt="Hero Background" />
        </div>
        <div class="hero-overlay"></div>
      </div>

      <div class="main-content" :class="{ 'no-hero': !heroProject }">
        <header class="hero-section" v-if="heroProject">
          <div class="hero-container">
            <transition name="slide-up" appear>
              <div v-if="!isPageLoading">
                <div class="hero-meta">
                  <span class="client-tag">{{ heroProject.client }}</span>
                </div>
                <h1 class="hero-title">{{ heroProject.title }}</h1>
                <button class="watch-link" @click="goToProject(heroProject.id)">
                  Watch Project <span class="arrow">→</span>
                </button>
              </div>
            </transition>
          </div>
        </header>

        <div v-else class="simple-header">
          <h1 class="simple-title">SELECTED WORK</h1>
        </div>

        <div class="grid-section">
          <section v-if="filteredProjects.length > 0" class="projects-grid">
          </section>

          <div v-else-if="!isPageLoading" class="error-state">
            <p>Unable to load projects. Please check your connection or GitHub API limits.</p>
            <button @click="manager.initialize()">TRY AGAIN</button>
          </div>
          <nav class="filters-nav">
            <button
              v-for="filter in filters"
              :key="filter"
              class="filter-link"
              :class="{ active: activeFilter === filter }"
              @click="activeFilter = filter"
            >
              {{ filter }}
            </button>
          </nav>
          <section class="projects-grid">
            <article
              class="project-card"
              v-for="project in filteredProjects"
              :key="project.id"
              @click="goToProject(project.id)"
              :style="{ '--item-accent': projectColors[project.id] || DEFAULT_ACCENT }"
            >
              <div class="card-image-box" :class="{ loaded: loader.isLoaded(project.id) }">
                <div
                  v-if="!loader.isLoaded(project.id)"
                  class="sk-image grid-skeleton-overlay"
                ></div>
                <img
                  :src="project.thumbnailUrl"
                  :alt="project.title"
                  loading="lazy"
                  @load="loader.load(project.id, project.thumbnailUrl)"
                />
                <div class="card-overlay"></div>
              </div>

              <div class="card-info">
                <span class="card-client">{{ project.client }}</span>
                <h3 class="card-title">{{ project.title }}</h3>
              </div>
            </article>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;700&display=swap');
.page-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: #000;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

.loading-skeleton {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: #000;
  padding: 0 4vw;
  max-width: 1600px;
  margin: 0 auto;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
}

.content-wrapper {
  opacity: 0;
  transition: opacity 1s ease 0.2s;
}

.content-wrapper.content-visible {
  opacity: 1;
}

.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90vh;
  z-index: 0;
  overflow: hidden;
}

.bg-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background: #050505;
}

.hero-skeleton-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.bg-image-wrapper img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.05);
  transition: opacity 2s ease;
}

.bg-image-wrapper.img-loaded img {
  opacity: 0.6;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.6) 60%, #000 100%);
}

.main-content {
  position: relative;
  z-index: 10;
  padding: 0 4vw;
  max-width: 1600px;
  margin: 0 auto;
}

.main-content.no-hero {
  padding-top: 180px;
}

.hero-section {
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 6rem;
}

.hero-container {
  max-width: 45%;
}

.client-tag {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #fff;
  margin-bottom: 1rem;
  display: block;
  opacity: 0.9;
}

.hero-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(1.5rem, 4vw, 3.5rem);
  line-height: 1;
  text-transform: uppercase;
  color: v-bind(accentColor);
  margin: 0 0 2rem 0;
  transform: scaleX(1.05);
  transform-origin: left;
  transition: color 1s ease;
}

.watch-link {
  background: none;
  border: none;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.watch-link:hover {
  color: v-bind(accentColor);
  gap: 15px;
}

.simple-header {
  padding-bottom: 4rem;
}
.simple-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: 3rem;
  color: #fff;
  text-transform: uppercase;
}

.grid-section {
  padding-bottom: 8rem;
}

.filters-nav {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  border-bottom: 1px solid #222;
  padding-bottom: 1rem;
}

.filter-link {
  background: none;
  border: none;
  color: #666;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s ease;
}

.filter-link:hover {
  color: #fff;
}

.filter-link.active {
  color: v-bind(accentColor);
}

.projects-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 3rem;
  row-gap: 5rem;
}

.project-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  group: hover;
  --item-accent: #f3d0d3;
}

.card-image-box {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #111;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.grid-skeleton-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.card-image-box img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition:
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 1s ease;
}

.card-image-box.loaded img {
  opacity: 0.8;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  transition: background 0.3s;
  pointer-events: none;
}

.project-card:hover .card-image-box {
  border-color: var(--item-accent);
}

.project-card:hover .card-image-box.loaded img {
  transform: scale(1.05);
  opacity: 1;
}

.project-card:hover .card-overlay {
  background: transparent;
}

.card-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-client {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #888;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  transition: color 0.3s;
}

.card-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.8rem;
  line-height: 1;
  text-transform: uppercase;
  color: #fff;
  margin: 0;
  transform: scaleX(1.05);
  transform-origin: left;
  transition: color 0.3s;
}

.project-card:hover .card-title {
  color: var(--item-accent);
}
.project-card:hover .card-client {
  color: #fff;
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.sk-meta,
.sk-title,
.sk-btn,
.sk-image,
.sk-text {
  background: #111 linear-gradient(to right, #111 0%, #1a1a1a 20%, #111 40%, #111 100%) no-repeat;
  background-size: 2000px 100%;
  animation: shimmer 2s infinite linear;
}

.skeleton-hero {
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 6rem;
}
.sk-meta {
  width: 100px;
  height: 14px;
  margin-bottom: 2rem;
}
.sk-title {
  width: 60%;
  height: 60px;
  margin-bottom: 2rem;
}
.sk-btn {
  width: 150px;
  height: 20px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 4rem;
}
.sk-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.sk-image {
  width: 100%;
  aspect-ratio: 16/9;
}
.sk-text {
  width: 70%;
  height: 20px;
}

@media (max-width: 1024px) {
  .hero-section {
    height: 70vh;
    padding-bottom: 4rem;
  }
  .hero-container {
    max-width: 80%;
  }
  .projects-grid {
    grid-template-columns: 1fr;
    row-gap: 4rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 5vw;
  }
  .hero-container {
    max-width: 100%;
  }
  .hero-title {
    font-size: 2rem;
  }
  .sk-title {
    height: 40px;
  }
}
</style>
