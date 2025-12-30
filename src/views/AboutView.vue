<script setup lang="ts">
import { computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'

const store = useProjectsStore()

const about = computed(
  () =>
    store.about || {
      title: 'LOADING...',
      description: '',
      bio: '',
      skills: [],
      email: '',
      instagram: '',
      youtube: '',
    },
)
</script>

<template>
  <div class="about-page">
    <div class="page-overlay"></div>

    <div class="content-container">
      <div class="col-left">
        <h1 class="main-title" v-html="about.title"></h1>

        <div class="separator"></div>
        <span class="description">{{ about.description }}</span>
      </div>

      <div class="col-right">
        <section class="info-block">
          <h2 class="block-label">BIO</h2>
          <p class="text-body">{{ about.bio }}</p>
        </section>

        <section class="info-block" v-if="about.skills && about.skills.length">
          <h2 class="block-label">SKILLS</h2>
          <ul class="skills-list">
            <li v-for="skill in about.skills" :key="skill">
              {{ skill }}
            </li>
          </ul>
        </section>

        <section class="info-block">
          <h2 class="block-label">CONTACTS</h2>
          <div class="links-stack">
            <a v-if="about.email" :href="`mailto:${about.email}`" class="text-link">
              EMAIL <span class="arrow">→</span>
            </a>

            <a v-if="about.instagram" :href="about.instagram" target="_blank" class="text-link">
              INSTAGRAM <span class="arrow">→</span>
            </a>

            <a v-if="about.youtube" :href="about.youtube" target="_blank" class="social-link">
              YOUTUBE <span class="arrow">↗</span>
            </a>
          </div>
        </section>

        <div class="credits-block">
          <a href="https://t.me/piratism" target="_blank" class="credits-link">
            DEVELOPED BY LXNGREN
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;700&display=swap');

.about-page {
  position: relative;
  min-height: 100vh;
  background-color: transparent;
  color: #fff;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

.page-overlay {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  backdrop-filter: blur(8px);
  pointer-events: none;
}

.content-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 180px 4vw 80px 4vw;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
}

.col-left {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.main-title {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(3rem, 6vw, 6rem);
  line-height: 0.9;
  color: #fff;
  margin: 0;
  text-transform: uppercase;
  transform: scaleX(1.05);
  transform-origin: left;
}
.separator {
  width: 100px;
  height: 4px;
  background-color: var(--main-accent);
  margin: 2rem 0;
}
.description {
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 2px;
  color: #888;
}

.col-right {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  padding-top: 1rem;
}
.info-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.block-label {
  font-family: 'Archivo Black', sans-serif;
  font-size: 1.2rem;
  color: var(--main-accent);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.text-body {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #ddd;
  max-width: 90%;
}

.skills-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.skills-list li {
  font-weight: 700;
  font-size: 0.9rem;
  color: #fff;
  border-left: 2px solid #333;
  padding-left: 10px;
}

.links-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}
.text-link {
  text-decoration: none;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.text-link:hover {
  color: var(--main-accent);
}
.text-link .arrow {
  transition: transform 0.2s;
}
.text-link:hover .arrow {
  transform: translateX(5px);
}

.credits-block {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
}

.credits-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  color: #444;
  text-decoration: none;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

.credits-link:hover {
  color: var(--main-accent);
}

@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding-top: 140px;
  }
  .main-title {
    font-size: 3.5rem;
  }
  .text-body {
    max-width: 100%;
  }
}
</style>
