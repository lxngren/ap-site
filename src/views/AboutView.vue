<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectsStore } from '@/stores/projects'

const store = useProjectsStore()
const isCopied = ref(false)

const about = computed(
  () =>
    store.about || {
      title: 'LOADING...',
      description: '',
      email: '',
      instagram: '',
      discord: '',
    },
)

const instagramHandle = computed(() => {
  const raw = about.value.instagram?.trim()
  if (!raw) return ''
  const match = raw.match(/instagram\.com\/([^/?#]+)/i)
  if (match && match[1]) return '@' + match[1]
  if (raw.startsWith('@')) return raw
  return raw
})

type ContactEntry = {
  key: 'email' | 'instagram' | 'discord'
  label: string
  value: string
  href?: string
  newTab?: boolean
  copy?: boolean
}

const contactEntries = computed<ContactEntry[]>(() => {
  const list: ContactEntry[] = []
  if (about.value.email) {
    list.push({
      key: 'email',
      label: 'EMAIL',
      value: about.value.email,
      href: `mailto:${about.value.email}`,
    })
  }
  if (about.value.instagram) {
    list.push({
      key: 'instagram',
      label: 'INSTAGRAM',
      value: instagramHandle.value || 'OPEN PROFILE',
      href: about.value.instagram,
      newTab: true,
    })
  }
  if (about.value.discord) {
    list.push({
      key: 'discord',
      label: 'DISCORD',
      value: '@' + about.value.discord,
      copy: true,
    })
  }
  return list
})

const handleDiscordCopy = async () => {
  const login = about.value.discord
  if (!login) return
  try {
    await navigator.clipboard.writeText(login)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy', e)
  }
}

const year = new Date().getFullYear()
</script>

<template>
  <div class="about-page">
    <div class="page-overlay"></div>

    <article class="canvas">
      <header class="profile">
        <h1 class="display" v-html="about.title"></h1>
        <div class="accent-bar"></div>
        <p class="lede">{{ about.description }}</p>
      </header>

      <section class="contact">
        <ol v-if="contactEntries.length" class="ledger">
          <li v-for="entry in contactEntries" :key="entry.key" class="row">
            <span class="row-label">{{ entry.label }}</span>

            <a
              v-if="entry.href"
              :href="entry.href"
              :target="entry.newTab ? '_blank' : undefined"
              :rel="entry.newTab ? 'noopener noreferrer' : undefined"
              class="row-value"
            >
              <span class="row-text">{{ entry.value }}</span>
            </a>

            <button
              v-else-if="entry.copy"
              type="button"
              class="row-value row-copy"
              :class="{ copied: isCopied }"
              :aria-label="`Copy Discord username ${entry.value}`"
              @click="handleDiscordCopy"
            >
              <Transition name="copy-fade" mode="out-in">
                <span v-if="!isCopied" class="row-text" key="default">
                  {{ entry.value }}
                </span>
                <span v-else class="row-text" key="copied">COPIED</span>
              </Transition>
            </button>
          </li>
        </ol>

        <p v-else class="contact-empty">No channels available right now.</p>
      </section>

      <!-- COLOPHON -->
      <footer class="colophon">
        <span class="colophon-meta">
          <span>VOL. 01</span>
          <span class="dot">·</span>
          <span>ABOUT</span>
          <span class="dot">·</span>
          <span>{{ year }}</span>
        </span>
        <a
          href="https://t.me/fuckincash"
          target="_blank"
          rel="noopener noreferrer"
          class="colophon-credit"
        >
          DEVELOPED BY LXNGREN <span class="row-arrow" aria-hidden="true">→</span>
        </a>
      </footer>
    </article>
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
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.85) 100%
  );
  backdrop-filter: blur(8px);
  pointer-events: none;
}

.canvas {
  position: relative;
  z-index: 10;
  max-width: 1240px;
  margin: 0 auto;
  padding: 180px 4vw 80px;
  display: grid;
  gap: 6rem;
}

/* PROFILE */
.profile {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.display {
  font-family: 'Archivo Black', sans-serif;
  font-size: clamp(3rem, 8vw, 7.25rem);
  line-height: 0.88;
  color: #ffffff;
  margin: 0;
  text-transform: uppercase;
  transform: scaleX(1.05);
  transform-origin: left;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}

.display::first-line {
  color: var(--main-accent);
}

.accent-bar {
  width: 100px;
  height: 4px;
  background-color: var(--main-accent);
  margin: 2rem 0 1.75rem;
}

.lede {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.18em;
  line-height: 1.7;
  color: #9a9a9a;
  max-width: 60ch;
  margin: 0;
}

/* CONTACT — LEDGER */
.contact {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ledger {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #1c1c1c;
}

.row {
  display: grid;
  grid-template-columns: 180px 1fr;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 0.5rem;
  border-bottom: 1px solid #1c1c1c;
  transition: padding 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.row:hover {
  padding-left: 1.25rem;
}

.row-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  color: #b4b4b4;
  text-transform: uppercase;
}

.row-value {
  font-family: 'Inter', sans-serif;
  font-size: clamp(1rem, 1.7vw, 1.4rem);
  font-weight: 700;
  letter-spacing: 0;
  color: #fff;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: baseline;
  gap: 0.95rem;
  justify-self: start;
  transition: color 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  word-break: break-word;
  text-align: left;
}

.row-value:hover,
.row-value:focus-visible {
  color: var(--main-accent);
  outline: none;
}

.row-copy.copied {
  color: var(--main-accent);
}

/* COLOPHON ARROW */
.row-arrow {
  font-family: 'Archivo Black', sans-serif;
  font-size: 0.95rem;
  color: #5a5a5a;
  transition:
    color 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.contact-empty {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #4a4a4a;
  margin: 0;
  padding: 1.5rem 0;
  border-top: 1px solid #1c1c1c;
  border-bottom: 1px solid #1c1c1c;
}

/* COLOPHON */
.colophon {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 2rem;
  padding-top: 2.5rem;
  border-top: 1px solid #1c1c1c;
  font-family: 'Inter', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #4a4a4a;
}

.colophon-meta {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
}

.colophon-meta .dot {
  color: #2a2a2a;
}

.colophon-credit {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
  color: #4a4a4a;
  text-decoration: none;
  transition: color 0.25s ease;
}

.colophon-credit:hover {
  color: var(--main-accent);
}

.colophon-credit:hover .row-arrow {
  color: var(--main-accent);
  transform: translateX(4px);
}

/* COPY TRANSITION */
.copy-fade-enter-active,
.copy-fade-leave-active {
  transition: opacity 0.2s ease;
}
.copy-fade-enter-from,
.copy-fade-leave-to {
  opacity: 0;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .canvas {
    padding: 200px 5vw 80px;
    gap: 5rem;
  }
  .display {
    font-size: clamp(2.5rem, 9vw, 5rem);
  }
  .row {
    grid-template-columns: 140px 1fr;
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .canvas {
    padding: 220px 5vw 60px;
    gap: 4rem;
  }
  .display {
    font-size: clamp(2.25rem, 11vw, 3.5rem);
    transform: none;
  }
  .accent-bar {
    margin: 1.75rem 0 1.5rem;
  }
  .lede {
    font-size: 0.85rem;
    letter-spacing: 0.14em;
    line-height: 1.65;
  }
  .row {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    column-gap: 0;
    row-gap: 0.4rem;
    padding: 1.15rem 0;
  }
  .row-label {
    grid-row: 1;
    grid-column: 1;
    justify-self: start;
  }
  .row-value {
    grid-row: 2;
    grid-column: 1;
    font-size: 1.15rem;
  }
  .row:hover {
    padding-left: 0;
  }
  .colophon {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row,
  .row-arrow,
  .row-value,
  .colophon-credit {
    transition: none;
  }
}
</style>
