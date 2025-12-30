<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'

interface NavLink {
  id: string
  text: string
  href: string
  isExternal: boolean
}

interface ElementSize {
  width: number
  height: number
}

const route = useRoute()
const store = useProjectsStore()

const isHome = computed(() => route.name === 'home')
const isProjectPage = computed(() => route.name === 'project-detail')
const isAdmin = computed(() => route.path.startsWith('/admin'))

const DEFAULT_ACCENT = '#f3d0d3'

const navAccentColor = computed(() => {
  if (route.name === 'about') return store.mainAccent
  if (route.name === 'projects') return store.heroAccentColor || DEFAULT_ACCENT

  return store.currentAccentColor
})

const navLinks: NavLink[] = [
  { id: 'instagram', text: 'INSTAGRAM', href: 'https://instagram.com/ari.cgi', isExternal: true },
  { id: 'projects', text: 'PROJECTS', href: '/projects', isExternal: false },
  { id: 'about', text: 'ABOUT', href: '/about', isExternal: false },
]

const elementMap = new Map<string, HTMLElement>()
const sizes = ref<Map<string, ElementSize>>(new Map())

const setItemRef = (element: HTMLElement | null, id: string) => {
  if (element) {
    elementMap.set(id, element)
  }
}

const updateMetrics = () => {
  const newSizes = new Map<string, ElementSize>()
  let hasZero = false

  navLinks.forEach((link) => {
    const element = elementMap.get(link.id)
    if (element) {
      const w = element.offsetWidth
      const h = element.offsetHeight
      if (w === 0 || h === 0) hasZero = true
      newSizes.set(link.id, { width: w, height: h })
    }
  })

  sizes.value = newSizes

  if (hasZero) {
    requestAnimationFrame(() => updateMetrics())
  }
}

let resizeObserver: ResizeObserver | null = null

const initObserver = () => {
  if (resizeObserver) resizeObserver.disconnect()
  resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(updateMetrics)
  })
  elementMap.forEach((el) => resizeObserver?.observe(el))
}

onMounted(() => {
  nextTick(() => {
    updateMetrics()
    initObserver()
  })

  requestAnimationFrame(() => {
    updateMetrics()
    setTimeout(updateMetrics, 100)
  })

  document.fonts.ready.then(updateMetrics)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(
  () => route.path,
  () => {
    nextTick(() => {
      setTimeout(updateMetrics, 50)
    })
  },
)

const isLinkActive = (link: NavLink) => {
  if (isProjectPage.value && link.id === 'projects') return true
  return false
}

const cssVars = computed(() => {
  const getSize = (id: string) => sizes.value.get(id) || { width: 0, height: 0 }

  const inst = getSize('instagram')
  const proj = getSize('projects')
  const about = getSize('about')

  const ROW_GAP = 24
  const COL_GAP = 0

  const moveInstX = -(proj.width + about.width + 2 * ROW_GAP)
  const moveProjX = -(about.width + ROW_GAP)
  const moveProjY = -(inst.height + COL_GAP)
  const moveAboutY = -(inst.height + proj.height + 2 * COL_GAP)

  return {
    '--move-inst-x': `${moveInstX}px`,
    '--move-proj-x': `${moveProjX}px`,
    '--move-proj-y': `${moveProjY}px`,
    '--move-about-y': `${moveAboutY}px`,
    '--nav-accent': navAccentColor.value,
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
        <RouterLink to="/" class="logo-text">LOGO</RouterLink>
      </div>
    </Transition>

    <nav class="nav-menu">
      <ul>
        <li
          v-for="link in navLinks"
          :key="link.id"
          :ref="(el) => setItemRef(el as HTMLElement | null, link.id)"
          :class="{ 'animate-item': isProjectPage }"
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
  height: auto;
  z-index: 100;
  pointer-events: none;
  padding: 2rem 2.5rem;
  transition: padding 0.6s cubic-bezier(0.16, 1, 0.3, 1);

  /* FIX: Объявляем переменные с дефолтными значениями,
    чтобы IDE не ругалась на "Unresolved custom property".
    В рантайме они перезапишутся через :style.
  */
  --move-inst-x: 0px;
  --move-proj-x: 0px;
  --move-proj-y: 0px;
  --move-about-y: 0px;
  --nav-accent: #fff;
}

.app-header.project-mode {
  padding: 2rem 4rem;
}

.app-header * {
  pointer-events: auto;
}

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

/* LEGO Animation Positions */
.project-mode .nav-menu ul li:nth-child(1) {
  transform: translate(var(--move-inst-x), 0);
  transition-delay: 0s;
}
.project-mode .nav-menu ul li:nth-child(2) {
  transform: translate(var(--move-proj-x), var(--move-proj-y));
  transition-delay: 0.05s;
}
.project-mode .nav-menu ul li:nth-child(3) {
  transform: translate(0, var(--move-about-y));
  transition-delay: 0.1s;
}

.nav-link-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-decoration: none;
  cursor: pointer;
  padding: 1px 0 1px 20px;
}

.nav-text {
  display: block;
  color: #fff;
  font-family: 'GoodSans', sans-serif;
  font-size: 1.7rem;
  font-weight: 400;
  text-transform: uppercase;
  /* UPDATED: Отступ 1.05 */
  line-height: 1.05;
  white-space: nowrap;

  transform-origin: right center;
  transition:
    opacity 0.5s ease,
    color 0.5s ease,
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

/* --- ОБЫЧНЫЙ РЕЖИМ --- */

.nav-link-wrapper:hover .nav-text {
  transform: translateX(-15px);
  opacity: 1;
}

.active-link .nav-text {
  transform: translateX(0);
  color: var(--nav-accent);
  opacity: 1;
}

/* --- РЕЖИМ ПРОЕКТА --- */

.project-mode .nav-text {
  transform: scale(0.75);
}

.project-mode .nav-link-wrapper:hover .nav-text {
  transform: scale(0.75);
  opacity: 0.7;
}

.project-mode .active-link .nav-text {
  transform: scale(0.75);
  color: var(--nav-accent);
  opacity: 1;
}

@media (max-width: 1024px) {
  .app-header {
    padding: 1.5rem 1.5rem;
  }
  .app-header.project-mode {
    padding: 1.5rem 1.5rem;
  }
  .logo-container {
    top: 1.5rem;
    left: 1.5rem;
  }
  .nav-menu {
    top: 1.5rem;
    right: 1.5rem;
  }
  .nav-text {
    font-size: 1.1rem;
  }
  .nav-menu ul {
    gap: 0;
  }
  .project-mode .nav-menu ul li:nth-child(n) {
    transform: none !important;
  }
  .project-mode .nav-text {
    transform: none;
  }
  .project-mode .nav-link-wrapper:hover .nav-text {
    transform: translateX(-5px);
  }
}
</style>
