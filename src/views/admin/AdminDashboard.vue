<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useAdminStore } from '@/stores/admin'
import type { Project } from '@/types'

const store = useAdminStore()

const showForm = ref(false)
const isVimeoMode = ref(true)

// Категории из твоего проекта
const CATEGORIES = ['All', 'VFX / Motion', 'Color Grading']

const newProject = ref<Partial<Project>>({
  title: '',
  client: '',
  description: '',
  category: 'VFX / Motion',
  vimeoId: '',
  thumbnailUrl: '',
  isFeatured: false,
})

const handleVimeoFetch = async () => {
  if (!newProject.value.vimeoId) return
  const meta = await store.fetchVimeoMetadata(newProject.value.vimeoId)
  if (meta) {
    newProject.value.title = meta.title
    // Если пользователь не задал своё превью, берем с Vimeo
    if (!newProject.value.thumbnailUrl) {
      newProject.value.thumbnailUrl = meta.thumbnailUrl
    }
  }
}

const handleSubmit = () => {
  if (!newProject.value.title || !newProject.value.client) {
    alert('TITLE AND CLIENT ARE REQUIRED')
    return
  }

  store.addProject(newProject.value as Project)

  showForm.value = false
  newProject.value = {
    title: '',
    client: '',
    description: '',
    category: 'VFX / Motion',
    vimeoId: '',
    thumbnailUrl: '',
    isFeatured: false,
  }
}

const draggableProjects = computed({
  get: () => store.projects,
  set: (val) => store.updateProjectOrder(val),
})
</script>

<template>
  <div class="admin-layout">
    <header class="admin-header">
      <h2 class="logo">ADMIN // CONTROL</h2>
      <div class="actions">
        <span class="status-indicator">SECURE SESSION</span>
        <button class="action-btn save" @click="store.saveChanges" :disabled="store.loading">
          {{ store.loading ? 'SAVING...' : 'SAVE CHANGES' }}
        </button>
        <button class="action-btn logout" @click="store.logout">LOGOUT</button>
      </div>
    </header>

    <div class="container">
      <div class="panel add-panel">
        <button class="toggle-add-btn" @click="showForm = !showForm">
          {{ showForm ? '- CANCEL' : '+ ADD NEW PROJECT' }}
        </button>

        <div v-if="showForm" class="form-grid">
          <div class="form-row full">
            <label>SOURCE</label>
            <div class="toggle-switch">
              <button :class="{ active: isVimeoMode }" @click="isVimeoMode = true">VIMEO</button>
              <button :class="{ active: !isVimeoMode }" @click="isVimeoMode = false">MANUAL</button>
            </div>
          </div>

          <div class="form-row" v-if="isVimeoMode">
            <input
              v-model="newProject.vimeoId"
              placeholder="VIMEO ID (e.g. 76979871)"
              class="admin-input"
            />
            <button @click="handleVimeoFetch" class="fetch-btn">AUTO FILL</button>
          </div>

          <div class="form-row">
            <input v-model="newProject.client" placeholder="CLIENT NAME" class="admin-input" />
            <input v-model="newProject.title" placeholder="PROJECT TITLE" class="admin-input" />
          </div>

          <div class="form-row">
            <div class="select-wrapper">
              <label class="input-label">CATEGORY</label>
              <select v-model="newProject.category" class="admin-input">
                <option v-for="cat in CATEGORIES" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <label class="checkbox-label">
              <input type="checkbox" v-model="newProject.isFeatured" />
              <div class="custom-checkbox"></div>
              <span>FEATURED (HERO)</span>
            </label>
          </div>

          <div class="form-row full">
            <textarea
              v-model="newProject.description"
              placeholder="DESCRIPTION"
              class="admin-input area"
            ></textarea>
          </div>

          <div class="form-row full">
            <input
              v-model="newProject.thumbnailUrl"
              placeholder="CUSTOM THUMBNAIL URL (LEAVE EMPTY FOR VIMEO)"
              class="admin-input"
            />
          </div>

          <button class="submit-btn" @click="handleSubmit">ADD TO LIST</button>
        </div>
      </div>

      <div class="list-container">
        <VueDraggable
          v-model="draggableProjects"
          :animation="200"
          handle=".handle"
          ghost-class="ghost"
          class="project-list"
        >
          <div v-for="element in draggableProjects" :key="element.id" class="list-item">
            <div class="handle">⠿</div>
            <div class="item-preview">
              <img :src="element.thumbnailUrl" loading="lazy" />
            </div>
            <div class="item-info">
              <div class="item-meta">
                <span class="client">{{ element.client }}</span>
                <span class="cat-badge">{{ element.category }}</span>
                <span v-if="element.isFeatured" class="tag-featured">HERO</span>
              </div>
              <h4 class="title">{{ element.title }}</h4>
            </div>
            <button class="delete-btn" @click="store.removeProject(element.id)">DELETE</button>
          </div>
        </VueDraggable>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* STYLES */
.admin-layout {
  min-height: 100vh;
  background: #050505;
  color: #e0e0e0;
  font-family: 'Inter', sans-serif;
  padding-bottom: 10rem;
}

.admin-header {
  position: sticky;
  top: 0;
  background: rgba(5, 5, 5, 0.95);
  border-bottom: 1px solid #333;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.logo {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.status-indicator {
  font-size: 0.7rem;
  color: #0f0;
  margin-right: 1rem;
  font-family: monospace;
  border: 1px solid #0f0;
  padding: 2px 6px;
}

.action-btn {
  padding: 0.5rem 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
  cursor: pointer;
}
.action-btn.save {
  background: #fff;
  color: #000;
}
.action-btn:disabled {
  opacity: 0.5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* FORM */
.add-panel {
  margin-bottom: 3rem;
  border: 1px solid #333;
  padding: 1.5rem;
  background: #0a0a0a;
}

.toggle-add-btn {
  width: 100%;
  background: #222;
  border: none;
  color: #fff;
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  cursor: pointer;
}

.form-grid {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.form-row.full {
  flex-direction: column;
}

.admin-input {
  flex: 1;
  background: #111;
  border: 1px solid #333;
  color: #fff;
  padding: 10px;
  font-family: monospace;
  font-size: 0.9rem;
  outline: none;
}
.admin-input:focus {
  border-color: #fff;
}
.area {
  min-height: 80px;
  resize: vertical;
}

.toggle-switch {
  display: flex;
  gap: 10px;
}
.toggle-switch button {
  background: #222;
  border: 1px solid #333;
  color: #666;
  padding: 5px 15px;
  cursor: pointer;
}
.toggle-switch button.active {
  background: #fff;
  color: #000;
  border-color: #fff;
}

.fetch-btn,
.submit-btn {
  background: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 0 1.5rem;
  cursor: pointer;
  font-weight: 600;
}
.submit-btn {
  background: #fff;
  color: #000;
  padding: 1rem;
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.checkbox-label input {
  display: none;
}
.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 1px solid #555;
}
.checkbox-label input:checked + .custom-checkbox {
  background: #fff;
}

.select-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.input-label {
  font-size: 0.7rem;
  color: #888;
  font-weight: 700;
}

/* LIST */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-item {
  display: flex;
  align-items: center;
  background: #111;
  border: 1px solid #222;
  padding: 10px;
  margin-bottom: 8px;
  gap: 15px;
}
.list-item:hover {
  border-color: #444;
}

.handle {
  cursor: grab;
  color: #555;
  font-size: 1.2rem;
  padding: 0 10px;
}
.item-preview {
  width: 100px;
  aspect-ratio: 16/9;
  background: #000;
  overflow: hidden;
}
.item-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}
.item-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 4px;
}
.client {
  font-size: 0.8rem;
  color: #999;
  font-weight: 700;
}
.cat-badge {
  font-size: 0.7rem;
  background: #222;
  padding: 2px 6px;
  border-radius: 2px;
  color: #ccc;
}
.tag-featured {
  font-size: 0.7rem;
  background: #fff;
  color: #000;
  padding: 2px 6px;
  font-weight: 900;
}
.title {
  margin: 0;
  font-size: 1rem;
  color: #fff;
}

.delete-btn {
  background: transparent;
  border: 1px solid #333;
  color: #666;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
}
.delete-btn:hover {
  border-color: #f00;
  color: #f00;
}

.ghost {
  opacity: 0.5;
  background: #222;
}
</style>
