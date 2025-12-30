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
        <RouterLink to="/" class="logo-link">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 1280 1280"
            xml:space="preserve"
          >
            <g id="logo">
              <path
                fill="currentColor"
                d="M366.9,703c15.2-57.2,46.9-109,68-163.7c9-23.2,3.6-48.2-22.9-62.4c-33.7-18.3-24.6-48.4,10.6-49.8
		c187.2-7.5,289.1-155.5,449.8-225.7c13.7-4.2,82.5-31.9,64.4,3.9c-11.5,22.7-24.7,26.1-30.4,57.9c-6.8,37.6,19.9,77.8,19.8,115.4
		c-0.3,99-34,103.7-37.5,170.6c-2.9,55.6,23.9,68.8,26.6,122.1c3.4,66.7-15.3,101-35.1,144.3c-14.7,32.2-32.5,57.5-63.6,87.4
		c-11.9,11.4-55.8,31.4-46.7-2.2c25-91.6,11.3-168.1-2-212.3c-8.6-28.7-34-57.3-36.4-100.4c-2.5-46.2,39.5-102.6,44-146.9
		c2.1-20.9-16-23-43.4-12.3c-38.4,15-42.6,17.5-75.3,34.3c-86.6,44.6-139.1,140-137.2,152.3c5.3,35.8,37.7,44.9,91.9,36.2
		c44.5-7.2,66.5-0.4,85.9,8.7c40.6,19.2,58.1,85.2,38.3,104.5c-20.6,20.2-51.1-14.9-106.4-1.8c-66.4,15.7-76.8,39.4-89,54.3
		c-52.7,64.3-21.4,88.9-63.9,168.8c-21.7,40.9-43,78.9-73.8,115.1c-15.6,18.3-65.8,25.8-44.9-8.4c65.5-106.9,2.6-235.2,1.1-329.4
		c-0.3-19.8,2.3-40.6,7.8-60.2L366.9,703z"
              />
              <g>
                <path
                  fill="currentColor"
                  d="M998.8,193.1c0,13.4-10.6,24-24.3,24c-13.6,0-24.4-10.6-24.4-24c0-13.2,10.8-23.7,24.4-23.7
			C988.3,169.4,998.8,180,998.8,193.1z M956.2,193.1c0,10.6,7.8,18.9,18.5,18.9c10.4,0,18.1-8.4,18.1-18.8
			c0-10.6-7.7-19.1-18.2-19.1C964,174.2,956.2,182.7,956.2,193.1z M970.8,205.6h-5.5v-23.7c2.2-0.4,5.2-0.7,9.1-0.7
			c4.5,0,6.5,0.7,8.2,1.7c1.3,1,2.3,2.9,2.3,5.2c0,2.6-2,4.6-4.9,5.5v0.3c2.3,0.9,3.6,2.6,4.3,5.8c0.7,3.6,1.2,5.1,1.7,5.9h-5.9
			c-0.7-0.9-1.2-3-1.9-5.8c-0.4-2.6-1.9-3.8-4.9-3.8h-2.6V205.6z M970.9,192.1h2.6c3,0,5.5-1,5.5-3.5c0-2.2-1.6-3.6-5.1-3.6
			c-1.4,0-2.5,0.1-3,0.3V192.1z"
                />
              </g>
            </g>
          </svg>
        </RouterLink>
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
  top: 1.5rem; /* Adjusted slightly to align with nav */
  left: 2.5rem;
}

/* Updated Logo Styles for SVG */
.logo-link {
  display: block;
  color: #fff;
  width: 60px; /* Adjust this to change logo size */
  height: auto;
  transition: opacity 0.3s ease;
}

.logo-link:hover {
  opacity: 0.7;
}

.logo-link svg {
  display: block;
  width: 100%;
  height: auto;
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
    top: 1.2rem;
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

  /* Make logo slightly smaller on mobile */
  .logo-link {
    width: 50px;
  }
}
</style>
