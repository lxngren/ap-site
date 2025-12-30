<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import VimeoPlayer from '@/components/VimeoPlayer.vue'

const route = useRoute()
const store = useProjectsStore()

const projectId = computed(() => Number(route.params.id))
const project = computed(() => store.getProjectById(projectId.value))

// HD Фон
const backgroundSrc = computed(() => {
  if (!project.value) return ''
  if (project.value.vimeoId) {
    const vimeoThumb = store.getVimeoThumbnail(project.value.vimeoId, 'hd')
    if (vimeoThumb) return vimeoThumb
  }
  return project.value.thumbnailUrl
})

// Загрузка данных
watch(
  () => project.value?.vimeoId,
  (newId) => {
    if (newId) store.loadVimeoData(newId)
  },
  { immediate: true },
)
</script>

<template>
  <div class="project-detail-page" v-if="project">
    <div class="bg-wrapper">
      <transition name="fade-slow">
        <img
          v-if="backgroundSrc"
          :key="backgroundSrc"
          :src="backgroundSrc"
          alt=""
          class="bg-image-hd"
        />
      </transition>
      <div class="bg-overlay"></div>
    </div>

    <div class="split-layout">
      <div class="info-section">
        <div class="text-content">
          <span class="client-name">{{ project.client }}</span>
          <h1 class="project-title">{{ project.title }}</h1>
          <p class="project-description">{{ project.description }}</p>
        </div>

        <div class="meta-footer">
          <a
            v-if="project.vimeoId"
            :href="`https://vimeo.com/${project.vimeoId}`"
            target="_blank"
            class="vimeo-link"
          >
            Watch on Vimeo <span class="arrow">→</span>
          </a>
        </div>
      </div>

      <div class="video-section">
        <div class="player-wrapper" v-if="project.vimeoId">
          <VimeoPlayer :videoId="project.vimeoId" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;700&display=swap');

/* --- LAYOUT --- */
.project-detail-page {
  position: fixed; /* Фиксируем страницу, убираем скролл */
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden; /* Критично для производительности */
}

/* --- ФОН --- */
.bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.3; /* Затемняем фон сильнее, чтобы акцент был на видео */
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

/* --- GRID LAYOUT --- */
.split-layout {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: grid;
  /* Левая колонка (текст) 35%, Правая (видео) остальное.
     minmax(400px, 1fr) гарантирует читаемость текста. */
  grid-template-columns: minmax(400px, 35%) 1fr;
  padding: 0 4rem; /* Отступы от краев экрана */
  align-items: center; /* Центрируем по вертикали */
  column-gap: 4rem;
}

/* --- INFO SECTION --- */
.info-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  /* Если текста много, он может скроллиться внутри колонки, но не вся страница */
  overflow-y: auto;
  padding-right: 2rem;
  scrollbar-width: none; /* Скрываем скроллбар */
}
.info-section::-webkit-scrollbar {
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
  /* Уменьшили шрифт, чтобы влезало */
  font-size: clamp(2rem, 3.5vw, 4rem);
  text-transform: uppercase;
  line-height: 0.95;
  color: #f3d0d3;
  margin: 0 0 1.5rem 0;
  transform: scaleX(1.05);
  transform-origin: left;
}

.project-description {
  font-family: 'Inter', sans-serif;
  font-size: 1rem; /* Компактный текст */
  line-height: 1.5;
  color: #d1d1d1;
  max-width: 90%;
}

.meta-footer {
  margin-top: 2rem;
}

.vimeo-link {
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.7;
  transition: opacity 0.3s;
}
.vimeo-link:hover {
  opacity: 1;
}
.arrow {
  margin-left: 5px;
}

/* --- VIDEO SECTION --- */
.video-section {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  overflow: hidden;
}

/* --- RESPONSIVE (MOBILE) --- */
@media (max-width: 1024px) {
  .project-detail-page {
    position: relative; /* Возвращаем скролл на планшетах/телефонах */
    height: auto;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .split-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    padding: 100px 20px 40px 20px; /* Отступ сверху под меню */
    gap: 2rem;
    height: auto;
  }

  /* Меняем порядок: Видео сверху, Текст снизу */
  .video-section {
    order: 1;
  }
  .info-section {
    order: 2;
    padding-right: 0;
  }

  .player-wrapper {
    width: 100%;
  }

  .project-title {
    font-size: 2.5rem;
  }
}
</style>
