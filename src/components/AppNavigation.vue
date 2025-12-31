<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'

/**
 * Интерфейс для безопасности типов навигации
 */

interface NavigationLink {
  id: string
  text: string
  href: string
  isExternal: boolean
}

interface ElementSize {
  width: number
  height: number
}

/**
 * Расчет инкапсулированных метрик
 */
class NavigationMetricsCalculator {
  private static readonly ORIGINAL_ROW_GAP = 24
  private static readonly COL_GAP = 0

  public static calculate(sizes: Map<string, ElementSize>): Record<string, string> {
    const getSize = (id: string) => sizes.get(id) || { width: 0, height: 0 }

    const instagram = getSize('instagram')
    const projects = getSize('projects')
    const about = getSize('about')

    const rowGap = this.ORIGINAL_ROW_GAP

    const moveInstagramX = -(projects.width + about.width + 2 * rowGap)
    const moveProjectX = -(about.width + rowGap)
    const moveProjectY = -(instagram.height + this.COL_GAP)
    const moveAboutY = -(instagram.height + projects.height + 2 * this.COL_GAP)

    return {
      '--move-instagram-x': `${moveInstagramX}px`,
      '--move-projects-x': `${moveProjectX}px`,
      '--move-projects-y': `${moveProjectY}px`,
      '--move-about-y': `${moveAboutY}px`,
    }
  }
}

const route = useRoute()
const store = useProjectsStore()

const isHome = computed(() => route.name === 'home')
const isProjectPage = computed(() => route.name === 'project-detail')
const isAdmin = computed(() => route.path.startsWith('/admin'))

const DEFAULT_ACCENT = 'rgb(163,159,223)'

const NAVIGATION_ACCENT_COLOR = computed(() => {
  if (route.name === 'about') return store.mainAccent
  if (route.name === 'projects') return store.heroAccentColor || DEFAULT_ACCENT
  return store.currentAccentColor
})

const navigation_links: NavigationLink[] = [
  { id: 'instagram', text: 'INSTAGRAM', href: 'https://instagram.com/ari.cgi', isExternal: true },
  { id: 'projects', text: 'PROJECTS', href: '/projects', isExternal: false },
  { id: 'about', text: 'ABOUT', href: '/about', isExternal: false },
]

const elementMap = new Map<string, HTMLElement>()
const sizes = ref<Map<string, ElementSize>>(new Map())

const setItemRef = (element: HTMLElement | null, id: string) => {
  if (element) elementMap.set(id, element)
}

const updateMetrics = () => {
  const newSizes = new Map<string, ElementSize>()
  let hasZero = false

  navigation_links.forEach((link) => {
    const element = elementMap.get(link.id)
    if (element) {
      const w = element.offsetWidth
      const h = element.offsetHeight
      if (w === 0 || h === 0) hasZero = true
      newSizes.set(link.id, { width: w, height: h })
    }
  })

  sizes.value = newSizes
  if (hasZero) requestAnimationFrame(updateMetrics)
}

let resizeObserver: ResizeObserver | null = null

const initObserver = () => {
  if (resizeObserver) resizeObserver.disconnect()
  resizeObserver = new ResizeObserver(() => requestAnimationFrame(updateMetrics))
  elementMap.forEach((el) => resizeObserver?.observe(el))
}

onMounted(() => {
  nextTick(() => {
    updateMetrics()
    initObserver()
  })
  window.addEventListener('resize', updateMetrics)
  document.fonts.ready.then(updateMetrics)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateMetrics)
})

watch(
  () => route.path,
  () => {
    nextTick(() => setTimeout(updateMetrics, 50))
  },
)

const isLinkActive = (link: NavigationLink) => {
  return isProjectPage.value && link.id === 'projects'
}

const cssVars = computed(() => {
  const vars = NavigationMetricsCalculator.calculate(sizes.value)
  return {
    ...vars,
    '--navigation-accent': NAVIGATION_ACCENT_COLOR.value,
  }
})
</script>

<template>
  <header
    v-if="!isAdmin"
    class="app-header"
    :class="{ 'project-mode': isProjectPage }"
    :style="cssVars"
  >
    <Transition name="fade">
      <div class="logo-container" v-if="!isHome">
        <RouterLink to="/" class="logo-link">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280">
            <g id="logo">
              <path
                fill="currentColor"
                d="M366.9,703c15.2-57.2,46.9-109,68-163.7c9-23.2,3.6-48.2-22.9-62.4c-33.7-18.3-24.6-48.4,10.6-49.8 c187.2-7.5,289.1-155.5,449.8-225.7c13.7-4.2,82.5-31.9,64.4,3.9c-11.5,22.7-24.7,26.1-30.4,57.9c-6.8,37.6,19.9,77.8,19.8,115.4 c-0.3,99-34,103.7-37.5,170.6c-2.9,55.6,23.9,68.8,26.6,122.1c3.4,66.7-15.3,101-35.1,144.3c-14.7,32.2-32.5,57.5-63.6,87.4 c-11.9,11.4-55.8,31.4-46.7-2.2c25-91.6,11.3-168.1-2-212.3c-8.6-28.7-34-57.3-36.4-100.4c-2.5-46.2,39.5-102.6,44-146.9 c2.1-20.9-16-23-43.4-12.3c-38.4,15-42.6,17.5-75.3,34.3c-86.6,44.6-139.1,140-137.2,152.3c5.3,35.8,37.7,44.9,91.9,36.2 c44.5-7.2,66.5-0.4,85.9,8.7c40.6,19.2,58.1,85.2,38.3,104.5c-20.6,20.2-51.1-14.9-106.4-1.8c-66.4,15.7-76.8,39.4-89,54.3 c-52.7,64.3-21.4,88.9-63.9,168.8c-21.7,40.9-43,78.9-73.8,115.1c-15.6,18.3-65.8,25.8-44.9-8.4c65.5-106.9,2.6-235.2,1.1-329.4 c-0.3-19.8,2.3-40.6,7.8-60.2L366.9,703z"
              />
              <path
                fill="currentColor"
                d="M998.8,193.1c0,13.4-10.6,24-24.3,24c-13.6,0-24.4-10.6-24.4-24c0-13.2,10.8-23.7,24.4-23.7 C988.3,169.4,998.8,180,998.8,193.1z M956.2,193.1c0,10.6,7.8,18.9,18.5,18.9c10.4,0,18.1-8.4,18.1-18.8 c0-10.6-7.7-19.1-18.2-19.1C964,174.2,956.2,182.7,956.2,193.1z M970.8,205.6h-5.5v-23.7c2.2-0.4,5.2-0.7,9.1-0.7 c4.5,0,6.5,0.7,8.2,1.7c1.3,1,2.3,2.9,2.3,5.2c0,2.6-2,4.6-4.9,5.5v0.3c2.3,0.9,3.6,2.6,4.3,5.8c0.7,3.6,1.2,5.1,1.7,5.9h-5.9 c-0.7-0.9-1.2-3-1.9-5.8c-0.4-2.6-1.9-3.8-4.9-3.8h-2.6V205.6z M970.9,192.1h2.6c3,0,5.5-1,5.5-3.5c0-2.2-1.6-3.6-5.1-3.6 c-1.4,0-2.5,0.1-3,0.3V192.1z"
              />
            </g>
          </svg>
        </RouterLink>
      </div>
    </Transition>

    <nav class="nav-menu">
      <ul>
        <li
          v-for="link in navigation_links"
          :key="link.id"
          :ref="(el) => setItemRef(el as HTMLElement | null, link.id)"
        >
          <component
            :is="link.isExternal ? 'a' : 'RouterLink'"
            :href="link.isExternal ? link.href : undefined"
            :to="!link.isExternal ? link.href : undefined"
            class="nav-link-wrapper"
            active-class="active-link"
            :class="{ 'active-link': isLinkActive(link) }"
          >
            <span class="nav-text">{{ link.text }}</span>
          </component>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  pointer-events: none;
  padding: 2rem 2.5rem;
  transition: padding 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  --move-instagram-x: 0px;
  --move-projects-x: 0px;
  --move-projects-y: 0px;
  --move-about-y: 0px;
  --navigation-accent: #fff;
}
.app-header.project-mode {
  padding: 2rem 4rem;
}
.app-header * {
  pointer-events: auto;
}
.logo-container {
  position: absolute;
  top: 1.5rem;
  left: 2.5rem;
}
.logo-link {
  display: block;
  color: #fff;
  width: 60px;
  height: auto;
  transition: opacity 0.3s ease;
}
.logo-link svg {
  display: block;
  width: 100%;
  height: auto;
}

.nav-menu {
  position: absolute;
  top: 2rem;
  right: 2.5rem;
}
.nav-menu ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  margin: 0;
  padding: 0;
}
.nav-menu ul li {
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translate(0, 0);
  will-change: transform;
}

/* lego animation */
.project-mode .nav-menu ul li:nth-child(1) {
  transform: translate(var(--move-instagram-x), 0);
}
.project-mode .nav-menu ul li:nth-child(2) {
  transform: translate(var(--move-projects-x), var(--move-projects-y));
}
.project-mode .nav-menu ul li:nth-child(3) {
  transform: translate(0, var(--move-about-y));
}

.nav-link-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-decoration: none;
  padding: 1px 0 1px 20px;
  cursor: pointer !important;
}

.nav-text {
  display: inline-flex;
  align-items: center;
  color: #fff;
  font-family: 'GoodSans', sans-serif;
  font-size: 1.7rem;
  font-weight: 400;
  text-transform: uppercase;
  line-height: 1;
  white-space: nowrap;
  transform-origin: right center;
  transition:
    opacity 0.5s ease,
    color 0.5s ease,
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

@media (hover: hover) {
  .nav-link-wrapper:hover .nav-text {
    transform: translateX(-15px);
    opacity: 1;
  }
  .project-mode .nav-link-wrapper:hover .nav-text {
    transform: scale(0.75);
    opacity: 0.7;
  }
}

.active-link .nav-text {
  transform: translateX(0);
  color: var(--navigation-accent);
  opacity: 1;
}

/* единая база масштаба для всех вкладок внутрпи проекта */
.project-mode .nav-text,
.project-mode .active-link .nav-text {
  transform: scale(0.75);
}
.project-mode .active-link .nav-text {
  color: var(--navigation-accent);
  opacity: 1;
}

/* версия для планшетов */
@media (max-width: 1024px) {
  .app-header {
    padding: 1.5rem 1.5rem;
  }

  .logo-container {
    top: 1.2rem;
    left: 1.5rem;
  }

  .nav-menu {
    top: 1.5rem;
    right: 1.5rem;
  }

  .nav-text {
    font-size: 1.65rem;
  }

  .nav-link-wrapper:hover .nav-text {
    transform: none;
  }

  .logo-link {
    width: 50px;
  }
}

/* телефоная адаптация lego */
@media (max-width: 767px) {
  .project-mode .nav-menu ul li {
    transform: none !important;
    transition: none !important;
  }
  .project-mode .nav-text,
  .project-mode .active-link .nav-text {
    transform: none !important;
  }
  .nav-link-wrapper {
    padding: 0 0 0 10px;
  }
}

/* планшетная адаптация lego (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .project-mode .nav-text,
  .project-mode .active-link .nav-text {
    transform: scale(0.6) !important;
  }
  .nav-link-wrapper {
    padding: 1px 0 1px 10px;
  }
}
</style>
