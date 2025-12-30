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

const isPanelOpen = ref(false)
const isAboutPanelOpen = ref(false)
const isEditing = ref(false)
const isColorPickerOpen = ref(false)

const CATEGORIES = ['All', '3D / VFX', 'Motion Graphics', 'Graphic Design']

const initialFormState = {
  id: 0,
  title: '',
  client: '',
  description: '',
  category: '3D / VFX',
  youtubeId: '',
  thumbnailUrl: '',
  isFeatured: false,
}
const formData = ref<Project>({ ...initialFormState } as Project)

const aboutFormData = ref<AboutData>({
  title: '',
  description: '',
  bio: '',
  skills: [],
  email: '',
  instagram: '',
  youtube: '',
})
const skillsString = ref('')

const goToSite = () => {
  router.push('/projects')
}

const heroProject = computed(() => store.projects.find((p) => p.isFeatured))

watch(
  () => heroProject.value?.thumbnailUrl,
  async (newUrl) => {
    if (newUrl) {
      const color = await colorService.extractDominantColor(newUrl)
      projectsStore.setHeroAccentColor(color)
    } else {
      projectsStore.setHeroAccentColor('#f3d0d3')
    }
  },
  { immediate: true },
)

const currentHeroColor = computed(() => projectsStore.heroAccentColor || '#f3d0d3')

const settingsMode = computed({
  get: () => store.globalSettings.accentMode === 'hero',
  set: (val: boolean) => {
    store.globalSettings.accentMode = val ? 'hero' : 'custom'
  },
})

const uiAccentColor = computed(() => {
  if (store.globalSettings.accentMode === 'hero') {
    return currentHeroColor.value
  }
  return store.globalSettings.customColor
})

const toggleColorPicker = () => {
  isColorPickerOpen.value = !isColorPickerOpen.value
}

const openNewProject = () => {
  formData.value = { ...initialFormState } as Project
  isEditing.value = false
  isPanelOpen.value = true
  document.body.style.overflow = 'hidden'
}

const openEditProject = (project: Project) => {
  formData.value = { ...project }
  isEditing.value = true
  isPanelOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closePanel = () => {
  isPanelOpen.value = false
  document.body.style.overflow = ''

  setTimeout(() => {
    formData.value = { ...initialFormState } as Project
    isEditing.value = false
  }, 300)
}

const handleYoutubeFetch = async () => {
  if (!formData.value.youtubeId) return

  const meta = await store.fetchYoutubeMetadata(formData.value.youtubeId)

  if (meta) {
    formData.value.thumbnailUrl = meta.thumbnailUrl
    formData.value.youtubeId = meta.id
    if (meta.title) {
      formData.value.title = meta.title
    }
  }
}

const handleSubmit = () => {
  if (!formData.value.title || !formData.value.client) {
    alert('Title and Client are required!')
    return
  }
  if (isEditing.value) store.updateProject(formData.value)
  else store.addProject(formData.value)
  closePanel()
}

const openAboutPanel = () => {
  aboutFormData.value = { ...store.about }
  skillsString.value = store.about.skills.join('\n')
  isAboutPanelOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeAboutPanel = () => {
  isAboutPanelOpen.value = false
  document.body.style.overflow = ''
}

const handleAboutSubmit = async () => {
  aboutFormData.value.skills = skillsString.value
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  store.updateAbout(aboutFormData.value)

  closeAboutPanel()
  await store.saveChanges()
}

const draggableProjects = computed({
  get: () => store.projects,
  set: (val) => store.updateProjectsOrder(val),
})
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="main-content" :class="{ shrink: isPanelOpen || isAboutPanelOpen }">
      <header class="top-bar">
        <div class="brand">
          <button class="nav-btn back-btn" @click="goToSite">← EXIT TO SITE</button>
        </div>

        <div class="controls">
          <div class="color-control-wrapper">
            <span class="color-label">ACCENT</span>

            <div
              class="color-circle-btn"
              :style="{
                backgroundColor: uiAccentColor,
                borderColor: '#fff',
              }"
              @click.stop="toggleColorPicker"
            >
              <span
                v-if="store.globalSettings.accentMode === 'hero'"
                class="hero-indicator"
                :style="{ color: '#000' }"
                >H</span
              >
            </div>

            <div class="color-popover" v-if="isColorPickerOpen" @click.stop>
              <div class="popover-row">
                <label>USE HERO COLOR</label>
                <div
                  class="hero-toggle"
                  :class="{ active: settingsMode }"
                  @click="settingsMode = !settingsMode"
                >
                  <div class="knob"></div>
                </div>
              </div>

              <div class="popover-row" v-if="!settingsMode">
                <label>CUSTOM HEX</label>
                <div class="color-input-wrap">
                  <input type="color" v-model="store.globalSettings.customColor" />
                  <input type="text" v-model="store.globalSettings.customColor" class="hex-text" />
                </div>
              </div>
            </div>
          </div>
          <span class="divider">|</span>

          <button class="nav-btn" @click="openAboutPanel">[ EDIT ABOUT ]</button>

          <span class="divider">|</span>
          <span class="status-mobile">SECURE</span>
          <button class="nav-btn" @click="store.saveChanges">
            {{ store.loading ? 'SAVING...' : '[ SAVE ALL ]' }}
          </button>
          <button class="nav-btn" @click="store.logout">LOGOUT</button>
        </div>
      </header>

      <div class="list-header">
        <h1 class="page-title">PROJECTS</h1>
        <button class="add-btn" @click="openNewProject"><span>+</span> NEW</button>
      </div>

      <div class="list-scroll-area">
        <VueDraggable
          v-model="draggableProjects"
          :animation="250"
          handle=".drag-zone"
          class="projects-stack"
        >
          <div
            v-for="project in draggableProjects"
            :key="project.id"
            class="project-card"
            :class="{ 'is-hero': project.isFeatured }"
            :style="project.isFeatured ? { borderColor: currentHeroColor } : {}"
          >
            <div class="drag-zone">
              <div class="dots">
                <span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div class="card-inner-wrapper">
              <div class="card-thumb">
                <img :src="project.thumbnailUrl" loading="lazy" />
                <div
                  class="hero-badge"
                  v-if="project.isFeatured"
                  :style="{ backgroundColor: currentHeroColor }"
                >
                  HERO
                </div>
              </div>
              <div class="card-info">
                <div class="meta">
                  <span class="client">{{ project.client }}</span
                  ><span class="separator">/</span
                  ><span class="category">{{ project.category }}</span>
                </div>
                <h3 class="title">{{ project.title }}</h3>
              </div>
              <div class="card-actions">
                <button class="icon-btn edit" @click="openEditProject(project)">EDIT</button>
                <button class="icon-btn delete" @click="store.removeProject(project.id)">×</button>
              </div>
            </div>
          </div>
        </VueDraggable>
      </div>
    </div>

    <div class="slide-panel" :class="{ open: isPanelOpen }">
      <div class="panel-header">
        <h2>{{ isEditing ? 'EDIT DATA' : 'NEW ENTRY' }}</h2>
        <button class="close-btn" @click="closePanel">CLOSE</button>
      </div>
      <div class="panel-content">
        <div class="field-group">
          <label>YOUTUBE ID</label>
          <div class="input-row">
            <input
              v-model="formData.youtubeId"
              placeholder="e.g. dQw4w9WgXcQ or https://youtu.be/..."
            /><button class="action-text-btn" @click="handleYoutubeFetch">FETCH</button>
          </div>
        </div>
        <div class="field-group"><label>CLIENT</label><input v-model="formData.client" /></div>
        <div class="field-group"><label>TITLE</label><input v-model="formData.title" /></div>
        <div class="split-row">
          <div class="field-group">
            <label>CATEGORY</label
            ><select v-model="formData.category">
              <option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="field-group toggle-group">
            <label>IS HERO?</label>
            <div
              class="hero-toggle"
              :class="{ active: formData.isFeatured }"
              @click="formData.isFeatured = !formData.isFeatured"
            >
              <div class="knob"></div>
            </div>
          </div>
        </div>
        <div class="field-group">
          <label>DESCRIPTION</label><textarea v-model="formData.description" rows="5"></textarea>
        </div>
        <div class="field-group">
          <label>THUMBNAIL URL</label><input v-model="formData.thumbnailUrl" />
          <div class="thumb-preview" v-if="formData.thumbnailUrl">
            <img :src="formData.thumbnailUrl" />
          </div>
        </div>
      </div>
      <div class="panel-footer">
        <button class="save-btn" @click="handleSubmit">
          {{ isEditing ? 'UPDATE' : 'CREATE' }}
        </button>
      </div>
    </div>

    <div class="slide-panel" :class="{ open: isAboutPanelOpen }">
      <div class="panel-header">
        <h2>EDIT: ABOUT PAGE</h2>
        <button class="close-btn" @click="closeAboutPanel">CLOSE</button>
      </div>
      <div class="panel-content">
        <div class="field-group">
          <label>MAIN TITLE (HTML TAGS)</label
          ><textarea v-model="aboutFormData.title" rows="2"></textarea>
        </div>
        <div class="field-group">
          <label>DESCRIPTION</label><input v-model="aboutFormData.description" />
        </div>
        <div class="field-group">
          <label>BIO</label><textarea v-model="aboutFormData.bio" rows="8"></textarea>
        </div>
        <div class="field-group">
          <label>SKILLS (ONE PER LINE)</label><textarea v-model="skillsString" rows="6"></textarea>
        </div>
        <div class="field-group"><label>EMAIL</label><input v-model="aboutFormData.email" /></div>
        <div class="field-group">
          <label>INSTAGRAM</label><input v-model="aboutFormData.instagram" />
        </div>
        <div class="field-group">
          <label>YOUTUBE</label><input v-model="aboutFormData.youtube" />
        </div>
      </div>
      <div class="panel-footer">
        <button class="save-btn" @click="handleAboutSubmit">UPDATE & SAVE</button>
      </div>
    </div>

    <div
      class="backdrop"
      :class="{ visible: isPanelOpen || isAboutPanelOpen }"
      @click="
        () => {
          closePanel()
          closeAboutPanel()
        }
      "
    ></div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;700&display=swap');
.dashboard-wrapper {
  background: #050505;
  min-height: 100vh;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
  position: relative;
}
.main-content {
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.4s;
  padding: 0 4vw;
  max-width: 1400px;
  margin: 0 auto;
}
.main-content.shrink {
  transform: scale(0.98);
  opacity: 0.5;
  pointer-events: none;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #222;
  margin-bottom: 2rem;
}
.nav-btn {
  background: none;
  border: none;
  color: #888;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}
.nav-btn:hover {
  color: #fff;
}
.back-btn {
  font-size: 0.9rem;
  color: #fff;
  padding-left: 0;
}
.controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.divider {
  color: #333;
}
.status-mobile {
  display: none;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.page-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: 3rem;
  margin: 0;
  line-height: 1;
}
.add-btn {
  background: #fff;
  color: #000;
  border: none;
  padding: 0.8rem 1.5rem;
  font-family: 'Archivo Black', sans-serif;
  font-size: 1rem;
  cursor: pointer;
}
.projects-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 5rem;
}
.project-card {
  display: flex;
  background: #0f0f0f;
  border: 1px solid #222;
  transition: all 0.2s;
}
.project-card:hover {
  background: #141414;
  border-color: #444;
}

.project-card.is-hero {
  background: #1a1515;
}
.hero-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  color: #000;
  font-size: 0.6rem;
  font-weight: 900;
  padding: 2px 6px;
}

.drag-zone {
  width: 40px;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  flex-shrink: 0;
}
.dots {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}
.dots span {
  width: 3px;
  height: 3px;
  background: #555;
  border-radius: 50%;
}
.card-inner-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1.5rem;
}
.card-thumb {
  width: 160px;
  aspect-ratio: 16/9;
  background: #000;
  position: relative;
  flex-shrink: 0;
}
.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
}

.card-info {
  flex: 1;
}
.meta {
  font-size: 0.75rem;
  color: #666;
  font-weight: 700;
  margin-bottom: 0.3rem;
}
.title {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.5rem;
  margin: 0;
}
.card-actions {
  display: flex;
  gap: 1rem;
}
.icon-btn {
  background: none;
  border: 1px solid #333;
  color: #888;
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
}
.icon-btn:hover {
  border-color: #fff;
  color: #fff;
}
.icon-btn.delete:hover {
  border-color: #f00;
  color: #f00;
}

/* --- COLOR CONTROL STYLES --- */
.color-control-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.color-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #666;
  letter-spacing: 0.5px;
}

.color-circle-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  /* Цвет фона и рамки теперь inline */
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-circle-btn:hover {
  transform: scale(1.1);
}

.hero-indicator {
  font-size: 10px;
  font-weight: 900;
  /* Цвет текста задается inline */
}

.color-popover {
  position: absolute;
  top: 40px;
  right: 0;
  background: #111;
  border: 1px solid #333;
  padding: 1rem;
  width: 200px;
  z-index: 300;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.popover-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popover-row label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #888;
}

.color-input-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
}

input[type='color'] {
  width: 24px;
  height: 24px;
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
}

.hex-text {
  width: 60px;
  border: none;
  border-bottom: 1px solid #333;
  color: #fff;
  font-size: 0.8rem;
  font-family: monospace;
  padding: 2px;
}

/* PANEL & FORM STYLES */
.slide-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100vh;
  background: #0a0a0a;
  border-left: 1px solid #222;
  z-index: 200;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.5);
}
.slide-panel.open {
  transform: translateX(0);
}
.panel-header {
  padding: 2rem;
  border-bottom: 1px solid #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h2 {
  font-family: 'Archivo Black', sans-serif;
  margin: 0;
  font-size: 1.5rem;
}
.close-btn {
  background: none;
  border: none;
  color: #666;
  font-weight: 700;
  cursor: pointer;
}
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.field-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #555;
  letter-spacing: 1px;
}
.input-row {
  display: flex;
  gap: 10px;
}
input,
textarea,
select {
  background: transparent;
  border: none;
  border-bottom: 1px solid #333;
  color: #fff;
  padding: 10px 0;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  width: 100%;
  border-radius: 0;
}
input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-bottom-color: #fff;
}
.action-text-btn {
  background: none;
  border: 1px solid #333;
  color: #fff;
  font-weight: 700;
  font-size: 0.7rem;
  padding: 0 1rem;
  cursor: pointer;
}
.split-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.hero-toggle {
  width: 50px;
  height: 26px;
  background: #222;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}
.hero-toggle .knob {
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
}

/* ДИНАМИЧЕСКИЙ ЦВЕТ ТУМБЛЕРА */
.hero-toggle.active {
  background-color: v-bind(currentHeroColor);
}

.hero-toggle.active .knob {
  transform: translateX(24px);
}
.thumb-preview {
  margin-top: 1rem;
  width: 100%;
  aspect-ratio: 16/9;
  border: 1px dashed #333;
  overflow: hidden;
}
.thumb-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.panel-footer {
  padding: 2rem;
  border-top: 1px solid #222;
}
.save-btn {
  width: 100%;
  background: #fff;
  color: #000;
  border: none;
  padding: 1.2rem;
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.1rem;
  cursor: pointer;
}
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 150;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s;
}
.backdrop.visible {
  opacity: 1;
  pointer-events: auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 0 5vw;
  }
  .top-bar {
    padding: 1rem 0;
  }
  .status-mobile {
    display: block;
  }
  .card-inner-wrapper {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    gap: 1rem;
  }
  .drag-zone {
    width: 30px;
  }
  .card-thumb {
    width: 100%;
    aspect-ratio: 16/9;
    margin: 0;
  }
  .card-info {
    width: 100%;
  }
  .card-actions {
    width: 100%;
    justify-content: space-between;
    margin-top: 0.5rem;
  }
  .icon-btn {
    flex: 1;
    text-align: center;
    padding: 0.8rem;
  }
  .slide-panel {
    width: 100%;
  }
  .split-row {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
