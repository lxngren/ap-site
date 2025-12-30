<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'

const store = useProjectsStore()
const router = useRouter()

// Данные из Pinia
const projects = computed(() => store.projects)
// Берем первый проект как Hero (или по флагу isFeatured, если нужно)
const heroProject = computed(() => store.projects[0])

const activeFilter = ref('All')
const filters = ['All', 'VFX / Motion']

const filteredProjects = computed(() => {
  if (activeFilter.value === 'All') return projects.value
  return projects.value.filter((p) => p.category === activeFilter.value)
})

const goToProject = (id: number) => {
  router.push({ name: 'project-detail', params: { id } })
}
</script>

<template>
  <div class="page-wrapper">
    <div class="hero-background" v-if="heroProject">
      <img :src="heroProject.thumbnailUrl" alt="Hero Background" />
      <div class="hero-gradient"></div>
    </div>

    <div class="main-container" v-if="heroProject">
      <header class="hero-content">
        <p class="hero-client">{{ heroProject.client }}</p>
        <h1 class="hero-title">{{ heroProject.title }}</h1>
        <button class="btn-watch" @click="goToProject(heroProject.id)">
          <span class="icon-play">▶</span> Watch
        </button>
      </header>

      <div class="content-area">
        <nav class="filters-nav">
          <button
            v-for="filter in filters"
            :key="filter"
            class="btn-filter"
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
          >
            <div class="card-image">
              <img :src="project.thumbnailUrl" :alt="project.title" loading="lazy" />
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ project.title }}</h3>
              <p class="card-client">{{ project.client }}</p>
            </div>
          </article>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@700&display=swap');

/* --- GLOBAL LAYOUT --- */
.page-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: #000;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* ... ОСТАЛЬНЫЕ СТИЛИ БЕЗ ИЗМЕНЕНИЙ ... */
.main-container {
  position: relative;
  z-index: 10;
  padding: 0 18vw;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
}
.hero-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7;
}
.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 40%, #000 95%);
}

.hero-content {
  padding-top: 40vh;
  margin-bottom: 8rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.hero-client {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.hero-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(3rem, 6vw, 6rem);
  line-height: 0.9;
  text-transform: uppercase;
  color: #f3d0d3;
  margin: 0 0 2rem 0;
  transform: scaleX(1.1);
  transform-origin: left;
}

.btn-watch {
  border: 2px solid #fff;
  background: transparent;
  color: #fff;
  padding: 12px 32px;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
}

.filters-nav {
  display: flex;
  gap: 12px;
  margin-bottom: 2rem;
}

.btn-filter {
  background: #000;
  border: 2px solid #fff;
  color: #fff;
  padding: 10px 24px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 0;
}

.btn-filter.active {
  background: #fff;
  color: #000;
}

.projects-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 2rem;
  row-gap: 4rem;
  padding-bottom: 10rem;
}

.project-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #111;
  margin-bottom: 1.5rem;
  border: 1px solid #fff;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.8rem;
  line-height: 0.95;
  text-transform: uppercase;
  color: #f3d0d3;
  margin: 0 0 0.5rem 0;
  transform: scaleX(1.05);
  transform-origin: left;
  max-width: 95%;
}

.card-client {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  opacity: 1;
}

@media (max-width: 1024px) {
  .main-container {
    padding: 0 5vw;
  }
  .projects-grid {
    grid-template-columns: 1fr;
    row-gap: 3rem;
  }
}
</style>
