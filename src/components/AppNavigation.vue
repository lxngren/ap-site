<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHome = computed(() => route.name === 'home')
const isProjectPage = computed(() => route.name === 'project-detail')

const navLinks = [
  { text: 'INSTAGRAM', href: 'https://instagram.com', isExternal: true },
  { text: 'PROJECTS', href: '/projects', isExternal: false },
  { text: 'ABOUT', href: '/about', isExternal: false },
]

// Ссылки на элементы для измерения размеров
const itemRefs = ref<HTMLElement[]>([])
// Храним размеры элементов
const metrics = ref({
  instagram: { width: 0, height: 0 },
  projects: { width: 0, height: 0 },
  about: { width: 0, height: 0 },
})

const updateMetrics = () => {
  if (itemRefs.value.length === 3) {
    // Порядок в DOM: Instagram[0], Projects[1], About[2]
    metrics.value = {
      instagram: {
        width: itemRefs.value[0].offsetWidth,
        height: itemRefs.value[0].offsetHeight,
      },
      projects: {
        width: itemRefs.value[1].offsetWidth,
        height: itemRefs.value[1].offsetHeight,
      },
      about: {
        width: itemRefs.value[2].offsetWidth,
        height: itemRefs.value[2].offsetHeight,
      },
    }
  }
}

// Вычисляем CSS переменные для анимации на основе реальных размеров
const cssVars = computed(() => {
  const m = metrics.value
  const rowGap = 48 // 3rem отступ в режиме строки (Project)
  const colGap = 8 // 0.5rem отступ в режиме колонки (Home)

  // Логика трансформации (из Колонки в Строку):

  // 1. INSTAGRAM (Был наверху, должен уехать влево)
  // X: Сдвигаем влево на ширину Projects + About + 2 отступа
  const moveInstX = -(m.projects.width + m.about.width + 2 * rowGap)

  // 2. PROJECTS (Был посередине, должен подняться и уехать влево)
  // X: Сдвигаем влево на ширину About + отступ
  const moveProjX = -(m.about.width + rowGap)
  // Y: Поднимаем вверх на высоту Instagram + отступ колонки
  const moveProjY = -(m.instagram.height + colGap)

  // 3. ABOUT (Был внизу, должен подняться)
  // X: 0 (Остается справа)
  // Y: Поднимаем вверх на высоту Instagram + Projects + 2 отступа
  const moveAboutY = -(m.instagram.height + m.projects.height + 2 * colGap)

  return {
    '--move-inst-x': `${moveInstX}px`,
    '--move-proj-x': `${moveProjX}px`,
    '--move-proj-y': `${moveProjY}px`,
    '--move-about-y': `${moveAboutY}px`,
  }
})

onMounted(() => {
  // Ждем рендера и загрузки шрифтов для точных замеров
  nextTick(() => {
    updateMetrics()
    // Если шрифт грузится долго, можно повторить замер
    document.fonts.ready.then(updateMetrics)
  })
})
</script>

<template>
  <header class="app-header" :class="{ 'project-mode': isProjectPage }" :style="cssVars">
    <Transition name="fade">
      <div class="logo-container" v-if="!isHome">
        <RouterLink to="/" class="logo-text">LOGO</RouterLink>
      </div>
    </Transition>

    <nav class="nav-menu">
      <ul>
        <li
          v-for="(link, index) in navLinks"
          :key="link.text"
          ref="itemRefs"
          :class="{ 'animate-item': isProjectPage }"
        >
          <component
            :is="link.isExternal ? 'a' : 'RouterLink'"
            :href="link.isExternal ? link.href : undefined"
            :to="!link.isExternal ? link.href : undefined"
            class="nav-link-wrapper"
            active-class="active-link"
          >
            <span class="nav-text">{{ link.text }}</span>
            <span class="nav-line"></span>
          </component>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
/* --- КОНТЕЙНЕР --- */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: 100;
  pointer-events: none;
  padding: 2rem 2.5rem;
  transition: padding 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.app-header.project-mode {
  padding: 2rem 4rem;
}

.app-header * {
  pointer-events: auto;
}

/* --- LOGO --- */
.logo-container {
  position: absolute;
  top: 2rem;
  left: 2.5rem;
}

.logo-text {
  color: #fff;
  font-family: 'GoodSans', sans-serif;
  font-weight: 700;
  line-height: 0.9;
  font-size: 1rem;
  text-transform: uppercase;
  text-decoration: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- MENU --- */
.nav-menu {
  position: absolute;
  top: 2rem;
  right: 2.5rem;
}

/* БАЗОВОЕ СОСТОЯНИЕ (HOME): Идеальная вертикальная колонка */
.nav-menu ul {
  list-style: none;
  display: flex;
  flex-direction: column; /* Колонка по умолчанию */
  align-items: flex-end; /* Выравнивание по правому краю */
  gap: 0.5rem; /* Отступ 8px */
  margin: 0;
  padding: 0;
}

/* Элементы списка */
.nav-menu ul li {
  /* Transition для плавного движения */
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translate(0, 0); /* В Home режиме смещения нет */
  will-change: transform;
}

/* СОСТОЯНИЕ ПРОЕКТА: Применяем вычисленные трансформации */

/* 1. INSTAGRAM (Первый в DOM, Верхний) */
.project-mode .nav-menu ul li:nth-child(1) {
  transform: translate(var(--move-inst-x), 0);
  transition-delay: 0s;
}

/* 2. PROJECTS (Второй в DOM, Средний) */
.project-mode .nav-menu ul li:nth-child(2) {
  transform: translate(var(--move-proj-x), var(--move-proj-y));
  transition-delay: 0.05s;
}

/* 3. ABOUT (Третий в DOM, Нижний) */
.project-mode .nav-menu ul li:nth-child(3) {
  transform: translate(0, var(--move-about-y));
  transition-delay: 0.1s;
}

/* Ссылка и текст */
.nav-link-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-decoration: none;
  cursor: pointer;
}

.nav-text {
  display: block;
  color: #fff;
  font-family: 'GoodSans', sans-serif;
  font-size: 1.7rem;
  font-weight: 400;
  text-transform: uppercase;
  line-height: 1;
  transition: opacity 0.3s ease;
  white-space: nowrap; /* Важно, чтобы ширина не скакала */
}

.nav-line {
  display: block;
  width: 100%;
  height: 2px;
  background-color: #fff;
  margin-top: 5px;
  border-radius: 4px;
  transform: scaleX(0);
  transform-origin: right center;
  transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
}

.nav-link-wrapper:hover .nav-text {
  opacity: 0.7;
}

.active-link .nav-line {
  transform: scaleX(1);
}

@media (max-width: 1024px) {
  /* На мобильных отключаем сложную анимацию, оставляем колонку */
  .project-mode .nav-menu ul li:nth-child(n) {
    transform: none !important;
  }
  .app-header.project-mode {
    padding: 2rem 2.5rem;
  }
}
</style>
