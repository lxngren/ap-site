<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useAdminStore } from '@/stores/admin'
import { useProjectsStore } from '@/stores/projects'
import { colorService } from '@/services/colorService'
import type { AboutData, Project } from '@/types'
import router from '@/router'

const store = useAdminStore()
const projectsStore = useProjectsStore()

type PanelMode = 'project' | 'about' | null
const activePanel = ref<PanelMode>(null)
const isEditing = ref(false)
const isColorPickerOpen = ref(false)
const isDirty = ref(false)

const CATEGORIES = ['3D / VFX', 'Motion Graphics', 'Graphic Design']

const DEFAULT_ACCENT = '#a49fdf'

const initialFormState: Project = {
  id: 0,
  title: '',
  client: '',
  description: '',
  category: '3D / VFX',
  youtubeId: '',
  thumbnailUrl: '',
  isFeatured: false,
}
const formData = ref<Project>({ ...initialFormState })

const aboutFormData = ref<AboutData>({
  title: '',
  description: '',
  skills: [],
  software: [],
  email: '',
  instagram: '',
  discord: '',
})

const goToSite = () => router.push('/projects')

const heroProject = computed(() => store.projects.find((p) => p.isFeatured))
const projectCount = computed(() => store.projects.length)

watch(
  () => heroProject.value?.thumbnailUrl,
  async (newUrl) => {
    if (newUrl) {
      const color = await colorService.extractDominantColor(newUrl)
      projectsStore.setHeroAccentColor(color)
    } else {
      projectsStore.setHeroAccentColor(DEFAULT_ACCENT)
    }
  },
  { immediate: true },
)

const currentHeroColor = computed(() => projectsStore.heroAccentColor || DEFAULT_ACCENT)

const settingsMode = computed({
  get: () => store.globalSettings.accentMode === 'hero',
  set: (val: boolean) => {
    store.globalSettings.accentMode = val ? 'hero' : 'custom'
    isDirty.value = true
  },
})

const uiAccentColor = computed(() =>
  store.globalSettings.accentMode === 'hero'
    ? currentHeroColor.value
    : store.globalSettings.customColor,
)

const toggleColorPicker = () => {
  isColorPickerOpen.value = !isColorPickerOpen.value
}

const lockScroll = (locked: boolean) => {
  document.body.style.overflow = locked ? 'hidden' : ''
}

const openNewProject = () => {
  formData.value = { ...initialFormState }
  isEditing.value = false
  activePanel.value = 'project'
  lockScroll(true)
}

const openEditProject = (project: Project) => {
  formData.value = { ...project }
  isEditing.value = true
  activePanel.value = 'project'
  lockScroll(true)
}

const openAboutPanel = () => {
  aboutFormData.value = { ...store.about }
  activePanel.value = 'about'
  lockScroll(true)
}

const closePanel = () => {
  activePanel.value = null
  lockScroll(false)
  setTimeout(() => {
    formData.value = { ...initialFormState }
    isEditing.value = false
  }, 300)
}

const handleYoutubeFetch = async () => {
  if (!formData.value.youtubeId) return

  const meta = await store.fetchYoutubeMetadata(formData.value.youtubeId)
  if (!meta) return

  formData.value.thumbnailUrl = meta.thumbnailUrl
  formData.value.youtubeId = meta.id
  if (meta.title) formData.value.title = meta.title
}

const handleSubmit = () => {
  if (!formData.value.title || !formData.value.client) {
    alert('TITLE and CLIENT are required.')
    return
  }
  if (isEditing.value) store.updateProject(formData.value)
  else store.addProject(formData.value)
  isDirty.value = true
  closePanel()
}

const handleAboutSubmit = async () => {
  // skills и software больше не редактируются из UI, но сохраняем как было —
  // существующие значения уже скопированы из store.about
  store.updateAbout(aboutFormData.value)
  closePanel()
  await store.saveChanges()
  isDirty.value = false
}

const handleRemove = (id: number) => {
  store.removeProject(id)
  isDirty.value = true
}

const handleSaveAll = async () => {
  await store.saveChanges()
  isDirty.value = false
}

const draggableProjects = computed({
  get: () => store.projects,
  set: (val) => {
    store.updateProjectsOrder(val)
    isDirty.value = true
  },
})

const saveLabel = computed(() => {
  if (store.loading) return 'SAVING'
  if (isDirty.value) return 'SAVE'
  return 'SAVED'
})

const formatIndex = (i: number) => String(i + 1).padStart(2, '0')
</script>

<template>
  <div class="dashboard" :style="{ '--accent': uiAccentColor, '--hero': currentHeroColor }">
    <div class="canvas" :class="{ shrink: activePanel !== null }">
      <header class="topbar">
        <div class="topbar-left">
          <button class="exit" @click="goToSite">
            <svg class="exit-arrow ico" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3 L5 8 L10 13" />
              <path d="M5 8 L14 8" />
            </svg>
            <span>BACK TO SITE</span>
          </button>
          <span class="topbar-divider" aria-hidden="true"></span>
          <div class="brand">
            <svg class="brand-logo" viewBox="0 0 1280 1280" aria-hidden="true">
              <path
                fill="currentColor"
                d="M366.9,703c15.2-57.2,46.9-109,68-163.7c9-23.2,3.6-48.2-22.9-62.4c-33.7-18.3-24.6-48.4,10.6-49.8 c187.2-7.5,289.1-155.5,449.8-225.7c13.7-4.2,82.5-31.9,64.4,3.9c-11.5,22.7-24.7,26.1-30.4,57.9c-6.8,37.6,19.9,77.8,19.8,115.4 c-0.3,99-34,103.7-37.5,170.6c-2.9,55.6,23.9,68.8,26.6,122.1c3.4,66.7-15.3,101-35.1,144.3c-14.7,32.2-32.5,57.5-63.6,87.4 c-11.9,11.4-55.8,31.4-46.7-2.2c25-91.6,11.3-168.1-2-212.3c-8.6-28.7-34-57.3-36.4-100.4c-2.5-46.2,39.5-102.6,44-146.9 c2.1-20.9-16-23-43.4-12.3c-38.4,15-42.6,17.5-75.3,34.3c-86.6,44.6-139.1,140-137.2,152.3c5.3,35.8,37.7,44.9,91.9,36.2 c44.5-7.2,66.5-0.4,85.9,8.7c40.6,19.2,58.1,85.2,38.3,104.5c-20.6,20.2-51.1-14.9-106.4-1.8c-66.4,15.7-76.8,39.4-89,54.3 c-52.7,64.3-21.4,88.9-63.9,168.8c-21.7,40.9-43,78.9-73.8,115.1c-15.6,18.3-65.8,25.8-44.9-8.4c65.5-106.9,2.6-235.2,1.1-329.4 c-0.3-19.8,2.3-40.6,7.8-60.2L366.9,703z"
              />
            </svg>
            <span class="brand-label">STUDIO</span>
          </div>
        </div>

        <div class="topbar-right">
          <div class="status" :class="{ dirty: isDirty, busy: store.loading }">
            <span class="status-dot" aria-hidden="true"></span>
            <span class="status-text">{{
              store.loading ? 'WORKING' : isDirty ? 'UNSAVED' : 'IN SYNC'
            }}</span>
          </div>

          <div class="accent-control">
            <button class="accent-trigger" @click.stop="toggleColorPicker">
              <span class="accent-chip" :style="{ background: uiAccentColor }">
                <span v-if="settingsMode" class="accent-h">H</span>
              </span>
              <span class="accent-meta">
                <span class="accent-label">ACCENT</span>
                <span class="accent-value">{{
                  settingsMode ? 'FROM HERO' : store.globalSettings.customColor.toUpperCase()
                }}</span>
              </span>
            </button>

            <div v-if="isColorPickerOpen" class="popover" @click.stop>
              <div class="popover-row">
                <span class="popover-label">USE HERO COLOR</span>
                <button
                  class="toggle"
                  :class="{ on: settingsMode }"
                  @click="settingsMode = !settingsMode"
                >
                  <span class="toggle-knob"></span>
                </button>
              </div>

              <div v-if="!settingsMode" class="popover-row stacked">
                <span class="popover-label">CUSTOM</span>
                <div class="color-input">
                  <input type="color" v-model="store.globalSettings.customColor" />
                  <input
                    type="text"
                    v-model="store.globalSettings.customColor"
                    class="hex-text"
                    spellcheck="false"
                  />
                </div>
              </div>
            </div>
          </div>

          <button class="ghost-btn" @click="openAboutPanel">
            <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M11 2 L14 5 L5.5 13.5 L2 14 L2.5 10.5 Z" />
              <path d="M9.5 3.5 L12.5 6.5" />
            </svg>
            <span>EDIT ABOUT</span>
          </button>
          <button class="primary-btn" :disabled="store.loading" @click="handleSaveAll">
            {{ saveLabel }}
          </button>
          <button class="ghost-btn quiet" @click="store.logout">
            <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M9 2 L3 2 L3 14 L9 14" />
              <path d="M7 8 L14 8" />
              <path d="M11 5 L14 8 L11 11" />
            </svg>
            <span>LOGOUT</span>
          </button>
        </div>
      </header>

      <section class="masthead">
        <div class="masthead-meta">
          <span class="masthead-eyebrow">SECTION 01</span>
          <span class="masthead-count">
            <span class="count-num">{{ formatIndex(projectCount - 1) }}</span>
            <span class="count-label">{{
              projectCount === 1 ? 'PROJECT ON RECORD' : 'PROJECTS ON RECORD'
            }}</span>
          </span>
        </div>
        <div class="masthead-title-row">
          <h1 class="masthead-title">PROJECTS</h1>
          <button class="add-btn" @click="openNewProject">
            <svg class="ico ico-lg" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 3 L8 13" />
              <path d="M3 8 L13 8" />
            </svg>
            <span>NEW ENTRY</span>
          </button>
        </div>
        <p class="masthead-hint">
          Drag rows to reorder. Hero is the first thing visitors see on the public Projects page.
        </p>
      </section>

      <div v-if="projectCount === 0" class="empty">
        <span class="empty-num">00</span>
        <h2 class="empty-title">NOTHING HERE YET</h2>
        <p class="empty-body">
          No projects on record. Hit <strong>NEW ENTRY</strong> to add the first one — paste a
          YouTube link, fetch the thumbnail, save.
        </p>
      </div>

      <VueDraggable
        v-else
        v-model="draggableProjects"
        :animation="220"
        handle=".row-handle"
        class="ledger"
      >
        <article
          v-for="(project, idx) in draggableProjects"
          :key="project.id"
          class="row"
          :class="{ 'row-hero': project.isFeatured }"
        >
          <div class="row-handle" aria-label="Drag to reorder">
            <span class="handle-num">{{ formatIndex(idx) }}</span>
            <span class="handle-grip" aria-hidden="true">
              <span></span><span></span><span></span>
              <span></span><span></span><span></span>
            </span>
          </div>

          <div class="row-thumb">
            <img :src="project.thumbnailUrl" loading="lazy" alt="" />
            <span v-if="project.isFeatured" class="hero-tag">HERO</span>
          </div>

          <div class="row-body">
            <div class="row-meta">
              <span class="row-client">{{ project.client || 'UNTITLED CLIENT' }}</span>
              <span class="meta-sep" aria-hidden="true">·</span>
              <span class="row-cat">{{ project.category }}</span>
            </div>
            <h3 class="row-title">{{ project.title || 'UNTITLED' }}</h3>
          </div>

          <div class="row-actions">
            <button class="row-btn" @click="openEditProject(project)" aria-label="Edit project">
              <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M11 2 L14 5 L5.5 13.5 L2 14 L2.5 10.5 Z" />
                <path d="M9.5 3.5 L12.5 6.5" />
              </svg>
              <span>EDIT</span>
            </button>
            <button
              class="row-btn destructive"
              @click="handleRemove(project.id)"
              aria-label="Remove project"
            >
              <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 4 L13 4" />
                <path d="M6 4 L6 2 L10 2 L10 4" />
                <path d="M4 4 L5 14 L11 14 L12 4" />
                <path d="M7 7 L7 11" />
                <path d="M9 7 L9 11" />
              </svg>
              <span>REMOVE</span>
            </button>
          </div>
        </article>
      </VueDraggable>
    </div>

    <!-- PROJECT PANEL -->
    <aside class="panel" :class="{ open: activePanel === 'project' }">
      <header class="panel-head">
        <div class="panel-eyebrow">{{ isEditing ? 'EDIT' : 'NEW' }} · PROJECT</div>
        <h2 class="panel-title">{{ isEditing ? 'EDIT ENTRY' : 'NEW ENTRY' }}</h2>
        <button class="panel-close" @click="closePanel" aria-label="Close panel">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4 L12 12" />
            <path d="M12 4 L4 12" />
          </svg>
        </button>
      </header>

      <div class="panel-body">
        <section class="field-section">
          <h3 class="section-title">SOURCE</h3>

          <div class="field">
            <label>YOUTUBE ID OR URL</label>
            <div class="field-with-action">
              <input
                v-model="formData.youtubeId"
                placeholder="dQw4w9WgXcQ — or full youtu.be link"
                spellcheck="false"
              />
              <button class="inline-btn" @click="handleYoutubeFetch">
                <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 2 L8 11" />
                  <path d="M4 7 L8 11 L12 7" />
                  <path d="M3 14 L13 14" />
                </svg>
                <span>FETCH</span>
              </button>
            </div>
          </div>

          <div class="field">
            <label>THUMBNAIL URL</label>
            <input v-model="formData.thumbnailUrl" spellcheck="false" />
            <div v-if="formData.thumbnailUrl" class="thumb-preview">
              <img :src="formData.thumbnailUrl" alt="Preview" />
            </div>
          </div>
        </section>

        <section class="field-section">
          <h3 class="section-title">METADATA</h3>

          <div class="field">
            <label>CLIENT</label>
            <input v-model="formData.client" />
          </div>

          <div class="field">
            <label>TITLE</label>
            <input v-model="formData.title" />
          </div>

          <div class="field-grid">
            <div class="field">
              <label>CATEGORY</label>
              <select v-model="formData.category">
                <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="field">
              <label>SET AS HERO</label>
              <button
                class="toggle wide"
                :class="{ on: formData.isFeatured }"
                @click="formData.isFeatured = !formData.isFeatured"
              >
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>

          <div class="field">
            <label>DESCRIPTION</label>
            <textarea v-model="formData.description" rows="5"></textarea>
          </div>
        </section>
      </div>

      <footer class="panel-foot">
        <button class="ghost-btn" @click="closePanel">
          <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4 L12 12" />
            <path d="M12 4 L4 12" />
          </svg>
          <span>CANCEL</span>
        </button>
        <button class="primary-btn flex" @click="handleSubmit">
          {{ isEditing ? 'UPDATE ENTRY' : 'CREATE ENTRY' }}
        </button>
      </footer>
    </aside>

    <!-- ABOUT PANEL -->
    <aside class="panel" :class="{ open: activePanel === 'about' }">
      <header class="panel-head">
        <div class="panel-eyebrow">EDIT · ABOUT</div>
        <h2 class="panel-title">ABOUT PAGE</h2>
        <button class="panel-close" @click="closePanel" aria-label="Close panel">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4 L12 12" />
            <path d="M12 4 L4 12" />
          </svg>
        </button>
      </header>

      <div class="panel-body">
        <section class="field-section">
          <h3 class="section-title">HEADLINE</h3>

          <div class="field">
            <label>MAIN TITLE (HTML ALLOWED)</label>
            <textarea v-model="aboutFormData.title" rows="3"></textarea>
          </div>

          <div class="field">
            <label>DESCRIPTION</label>
            <input v-model="aboutFormData.description" />
          </div>
        </section>

        <section class="field-section">
          <h3 class="section-title">CONTACTS</h3>

          <div class="field">
            <label>EMAIL</label>
            <input v-model="aboutFormData.email" type="email" spellcheck="false" />
          </div>
          <div class="field">
            <label>INSTAGRAM URL</label>
            <input v-model="aboutFormData.instagram" spellcheck="false" />
          </div>
          <div class="field">
            <label>DISCORD</label>
            <input v-model="aboutFormData.discord" spellcheck="false" />
          </div>
        </section>
      </div>

      <footer class="panel-foot">
        <button class="ghost-btn" @click="closePanel">
          <svg class="ico" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4 L12 12" />
            <path d="M12 4 L4 12" />
          </svg>
          <span>CANCEL</span>
        </button>
        <button class="primary-btn flex" @click="handleAboutSubmit">UPDATE &amp; SAVE</button>
      </footer>
    </aside>

    <div class="scrim" :class="{ visible: activePanel !== null }" @click="closePanel"></div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;700&display=swap');

/* TOKENS */
.dashboard {
  --bg: oklch(0.14 0.005 280);
  --surface-0: oklch(0.17 0.006 280);
  --surface-1: oklch(0.2 0.007 280);
  --surface-2: oklch(0.24 0.008 280);
  --line: oklch(0.28 0.008 280);
  --line-strong: oklch(0.36 0.012 280);
  --ink: oklch(0.97 0.005 280);
  --ink-2: oklch(0.74 0.008 280);
  --ink-3: oklch(0.56 0.01 280);
  --ink-4: oklch(0.4 0.012 280);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  --display: 'Archivo Black', sans-serif;
  --body: 'Inter', system-ui, sans-serif;

  background: var(--bg);
  min-height: 100vh;
  color: var(--ink);
  font-family: var(--body);
  font-feature-settings: 'tnum' 1, 'ss01' 1;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;
}

.canvas {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 var(--space-7);
  transition:
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.4s ease;
}

.canvas.shrink {
  transform: translateX(-3vw) scale(0.985);
  opacity: 0.45;
  pointer-events: none;
}

/* ICONS */
.ico {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex-shrink: 0;
}
.ico-lg {
  width: 16px;
  height: 16px;
}
.ico-label {
  width: 11px;
  height: 11px;
  stroke-width: 1.3;
  opacity: 0.7;
}

/* TOPBAR */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-5) 0;
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  background: color-mix(in oklch, var(--bg), transparent 8%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  z-index: 60;
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.exit {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: none;
  color: var(--ink);
  font-family: var(--body);
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}
.exit:hover {
  color: var(--accent);
}
.exit-arrow {
  display: inline-block;
  width: 14px;
  height: 14px;
  color: var(--ink-3);
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.2s;
}
.exit:hover .exit-arrow {
  transform: translateX(-4px);
  color: var(--accent);
}

.topbar-divider {
  width: 1px;
  height: 18px;
  background: var(--line);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
}
.brand-logo {
  display: block;
  width: 22px;
  height: 22px;
  color: var(--ink);
  flex-shrink: 0;
}
.brand-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--ink-3);
  letter-spacing: 0.22em;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 6px 0;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--ink-2);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: oklch(0.78 0.16 145);
}
.status.dirty .status-dot {
  background: oklch(0.82 0.17 85);
  animation: pulse 1.6s ease-in-out infinite;
}
.status.busy .status-dot {
  background: var(--accent);
  animation: pulse 0.9s ease-in-out infinite;
}
.status.dirty {
  color: oklch(0.92 0.1 85);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

/* ACCENT CONTROL */
.accent-control {
  position: relative;
}
.accent-trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  background: none;
  border: none;
  padding: 6px 0;
  cursor: pointer;
  color: var(--ink);
}
.accent-chip {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  font-size: 0.6rem;
  font-weight: 900;
  color: oklch(0.15 0 0);
  box-shadow: 0 0 0 0 color-mix(in oklch, var(--accent), transparent 100%);
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.accent-trigger:hover .accent-chip {
  transform: scale(1.1);
  box-shadow:
    0 0 0 3px var(--bg),
    0 0 0 4px color-mix(in oklch, var(--accent), transparent 55%);
}
.accent-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}
.accent-label {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--ink-3);
}
.accent-value {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.popover {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 240px;
  background: var(--surface-0);
  border: 1px solid var(--line);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  z-index: 80;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55);
}
.popover-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.popover-row.stacked {
  flex-direction: column;
  align-items: stretch;
}
.popover-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--ink-3);
}
.color-input {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border: 1px solid var(--line);
  padding: var(--space-2);
}
.color-input input[type='color'] {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}
.hex-text {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--ink);
  font-family: var(--body);
  font-feature-settings: 'tnum' 1;
  font-size: 0.85rem;
  padding: 0;
  outline: none;
}

/* BUTTONS */
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: none;
  border: 1px solid var(--line);
  color: var(--ink);
  font-family: var(--body);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  padding: 10px 14px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s,
    background 0.2s;
}
.ghost-btn .ico {
  color: var(--ink-3);
  transition: color 0.2s;
}
.ghost-btn:hover .ico {
  color: var(--ink);
}
.ghost-btn:hover {
  border-color: var(--line-strong);
  background: var(--surface-0);
}
.ghost-btn.quiet {
  border-color: transparent;
  color: var(--ink-3);
}
.ghost-btn.quiet:hover {
  color: var(--ink);
  background: var(--surface-0);
}
.topbar-right .ghost-btn {
  border-color: transparent;
  padding: 6px 8px;
}
.topbar-right .ghost-btn:hover {
  background: transparent;
  color: var(--accent);
}
.topbar-right .ghost-btn:hover .ico {
  color: var(--accent);
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: var(--ink);
  color: oklch(0.16 0 0);
  border: 1px solid var(--ink);
  font-family: var(--body);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  padding: 10px 16px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}
.primary-btn:hover:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
}
.primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.primary-btn.flex {
  flex: 1;
}

/* MASTHEAD */
.masthead {
  padding: var(--space-7) 0 var(--space-6);
  border-bottom: 1px solid var(--line);
}
.masthead-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--space-5);
}
.masthead-eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--ink-3);
}
.masthead-count {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
}
.count-num {
  font-family: var(--display);
  font-size: 1rem;
  color: var(--accent);
  font-feature-settings: 'tnum' 1;
}
.count-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: var(--ink-3);
}

.masthead-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-5);
}
.masthead-title {
  font-family: var(--display);
  font-size: clamp(3rem, 6vw, 5.5rem);
  margin: 0;
  line-height: 0.9;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  transform: scaleX(1.05);
  transform-origin: left;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--ink);
  color: oklch(0.16 0 0);
  border: none;
  padding: 14px 22px;
  font-family: var(--body);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.add-btn:hover {
  background: var(--accent);
  transform: translateY(-1px);
}
.add-btn .ico {
  width: 14px;
  height: 14px;
  stroke-width: 1.7;
}

.masthead-hint {
  margin: var(--space-4) 0 0;
  color: var(--ink-3);
  font-size: 0.82rem;
  max-width: 60ch;
  line-height: 1.55;
}

/* EMPTY */
.empty {
  margin: var(--space-8) 0;
  padding: var(--space-7) var(--space-6);
  border: 1px dashed var(--line);
  text-align: left;
  max-width: 56ch;
}
.empty-num {
  font-family: var(--display);
  font-size: 0.9rem;
  color: var(--ink-4);
  letter-spacing: 0.05em;
}
.empty-title {
  font-family: var(--display);
  font-size: 2rem;
  margin: var(--space-3) 0 var(--space-3);
  line-height: 1;
}
.empty-body {
  color: var(--ink-2);
  font-size: 0.92rem;
  line-height: 1.6;
  margin: 0;
}
.empty-body strong {
  color: var(--ink);
}

/* PROJECT LIST */
.ledger {
  display: flex;
  flex-direction: column;
  padding: var(--space-5) 0 var(--space-8);
}
.row {
  display: grid;
  grid-template-columns: 64px 144px 1fr auto;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--line);
  transition: background 0.2s;
}
.row:hover {
  background: var(--surface-0);
}
.row-hero {
  background: linear-gradient(
    to right,
    color-mix(in oklch, var(--hero), transparent 88%) 0%,
    transparent 60%
  );
}

.row-handle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: var(--space-2);
  cursor: grab;
  user-select: none;
}
.row-handle:active {
  cursor: grabbing;
}
.handle-num {
  font-family: var(--display);
  font-size: 0.95rem;
  color: var(--ink-4);
  font-feature-settings: 'tnum' 1;
  transition: color 0.2s;
}
.row:hover .handle-num {
  color: var(--ink-2);
}
.row-hero .handle-num {
  color: var(--hero);
}
.handle-grip {
  display: grid;
  grid-template-columns: repeat(2, 3px);
  gap: 3px;
  opacity: 0;
  transition: opacity 0.2s;
}
.row:hover .handle-grip {
  opacity: 1;
}
.handle-grip span {
  width: 3px;
  height: 3px;
  background: var(--ink-3);
}

.row-thumb {
  position: relative;
  width: 144px;
  aspect-ratio: 16 / 9;
  background: oklch(0.1 0 0);
  overflow: hidden;
}
.row-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: opacity 0.3s;
}
.row:hover .row-thumb img {
  opacity: 1;
}
.hero-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  background: var(--hero);
  color: oklch(0.14 0 0);
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  padding: 3px 6px;
}

.row-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.row-meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--ink-3);
}
.row-client {
  color: var(--ink);
}
.meta-sep {
  color: var(--ink-4);
}
.row-cat {
  color: var(--ink-3);
}
.row-title {
  font-family: var(--display);
  font-size: 1.5rem;
  line-height: 1;
  margin: 0;
  text-transform: uppercase;
  transform: scaleX(1.05);
  transform-origin: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-hero .row-title {
  color: var(--hero);
}

.row-actions {
  display: flex;
  gap: var(--space-2);
  opacity: 0.55;
  transition: opacity 0.2s;
}
.row:hover .row-actions {
  opacity: 1;
}
.row-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--line);
  color: var(--ink-2);
  font-family: var(--body);
  font-weight: 700;
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  padding: 8px 12px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}
.row-btn .ico {
  width: 12px;
  height: 12px;
  color: var(--ink-3);
  transition: color 0.2s;
}
.row-btn:hover .ico {
  color: var(--ink);
}
.row-btn.destructive:hover .ico {
  color: oklch(0.78 0.2 27);
}
.row-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}
.row-btn.destructive:hover {
  border-color: oklch(0.65 0.22 27);
  color: oklch(0.78 0.2 27);
}

/* PANEL */
.panel {
  position: fixed;
  top: 0;
  right: 0;
  width: min(540px, 100vw);
  height: 100vh;
  background: var(--surface-0);
  border-left: 1px solid var(--line);
  z-index: 200;
  transform: translateX(100%);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -30px 0 80px rgba(0, 0, 0, 0.55);
}
.panel.open {
  transform: translateX(0);
}

.panel-head {
  position: relative;
  padding: var(--space-6) var(--space-6) var(--space-5);
  border-bottom: 1px solid var(--line);
}
.panel-eyebrow {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--ink-3);
  margin-bottom: var(--space-2);
}
.panel-title {
  font-family: var(--display);
  font-size: 1.8rem;
  margin: 0;
  line-height: 1;
  letter-spacing: -0.005em;
  transform: scaleX(1.05);
  transform-origin: left;
}
.panel-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: none;
  border: 1px solid var(--line);
  color: var(--ink-2);
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s,
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.panel-close svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
}
.panel-close:hover {
  border-color: var(--ink);
  color: var(--ink);
  transform: rotate(90deg);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
  scrollbar-color: var(--line) transparent;
  scrollbar-width: thin;
}

.field-section {
  position: relative;
  padding-left: var(--space-6);
}
.section-num {
  position: absolute;
  left: 0;
  top: 2px;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  color: var(--ink-3);
}
.section-num svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.section-title {
  font-family: var(--body);
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  color: var(--ink-2);
  margin: 0 0 var(--space-5);
  padding-top: 2px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}
.field:last-child {
  margin-bottom: 0;
}
.field label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--ink-3);
}
.field label .ico-label {
  color: var(--ink-4);
}
.field-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-5);
  align-items: end;
  margin-bottom: var(--space-5);
}
.field-grid .field {
  margin-bottom: 0;
}

input,
textarea,
select {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  padding: 10px 0;
  font-family: var(--body);
  font-size: 0.95rem;
  width: 100%;
  border-radius: 0;
  transition: border-color 0.2s;
}
textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.55;
}
input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-bottom-color: var(--accent);
}
select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--ink-2) 50%),
    linear-gradient(135deg, var(--ink-2) 50%, transparent 50%);
  background-position:
    calc(100% - 14px) 18px,
    calc(100% - 9px) 18px;
  background-size:
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
  padding-right: var(--space-6);
}
option {
  background: var(--surface-1);
}

.field-with-action {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--line);
}
.field-with-action input {
  border-bottom: none;
}
.field-with-action:focus-within {
  border-bottom-color: var(--accent);
}
.inline-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--line);
  color: var(--ink);
  font-family: var(--body);
  font-weight: 700;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  padding: 8px 14px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s;
}
.inline-btn .ico {
  width: 12px;
  height: 12px;
}
.inline-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.thumb-preview {
  margin-top: var(--space-3);
  aspect-ratio: 16 / 9;
  background: oklch(0.1 0 0);
  border: 1px solid var(--line);
  overflow: hidden;
}
.thumb-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
}

/* TOGGLES */
.toggle {
  width: 48px;
  height: 26px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  position: relative;
  padding: 0;
  cursor: pointer;
  transition:
    background 0.3s,
    border-color 0.3s;
}
.toggle.wide {
  align-self: flex-start;
  margin-top: var(--space-2);
}
.toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--ink);
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.3s;
}
.toggle.on {
  background: var(--hero);
  border-color: var(--hero);
}
.toggle.on .toggle-knob {
  transform: translateX(22px);
  background: oklch(0.14 0 0);
}

.panel-foot {
  padding: var(--space-5) var(--space-6);
  border-top: 1px solid var(--line);
  display: flex;
  gap: var(--space-3);
}

/* SCRIM */
.scrim {
  position: fixed;
  inset: 0;
  background: oklch(0.05 0 0 / 0.78);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 150;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.45s ease;
}
.scrim.visible {
  opacity: 1;
  pointer-events: auto;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .canvas {
    padding: 0 var(--space-5);
  }
  .row {
    grid-template-columns: 56px 120px 1fr auto;
    gap: var(--space-4);
  }
  .row-thumb {
    width: 120px;
  }
}

@media (max-width: 768px) {
  .canvas {
    padding: 0 var(--space-4);
  }
  .topbar {
    flex-wrap: wrap;
    gap: var(--space-3);
    padding: var(--space-3) 0;
  }
  .topbar-left,
  .topbar-right {
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .brand-label {
    display: none;
  }
  .topbar-divider {
    display: none;
  }
  .accent-trigger .accent-meta {
    display: none;
  }
  .accent-trigger {
    padding: 4px;
  }

  .masthead {
    padding: var(--space-6) 0 var(--space-5);
  }
  .masthead-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .row {
    grid-template-columns: 40px 1fr;
    grid-template-areas:
      'handle thumb'
      'handle body'
      'actions actions';
    column-gap: var(--space-3);
    row-gap: var(--space-3);
    padding: var(--space-4) 0;
  }
  .row-handle {
    grid-area: handle;
    flex-direction: column;
    justify-content: flex-start;
    padding-left: 0;
    padding-top: var(--space-2);
    gap: var(--space-3);
  }
  .handle-grip {
    opacity: 1;
  }
  .row-thumb {
    grid-area: thumb;
    width: 100%;
  }
  .row-body {
    grid-area: body;
  }
  .row-actions {
    grid-area: actions;
    opacity: 1;
    width: 100%;
  }
  .row-actions .row-btn {
    flex: 1;
    text-align: center;
    padding: 12px;
  }

  .panel {
    width: 100%;
  }
  .panel-head,
  .panel-body,
  .panel-foot {
    padding-left: var(--space-5);
    padding-right: var(--space-5);
  }

  .field-grid {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
}
</style>
