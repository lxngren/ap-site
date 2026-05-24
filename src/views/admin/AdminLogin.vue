<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useRouter } from 'vue-router'

const key = ref('')
const showKey = ref(false)
const store = useAdminStore()
const router = useRouter()

const handleLogin = async () => {
  if (!key.value || store.loading) return
  const success = await store.login(key.value)
  if (success) await router.push({ name: 'admin-dashboard' })
}

const statusLabel = computed(() => {
  if (store.loading) return 'VERIFYING'
  if (store.error) return 'DENIED'
  return 'AWAITING KEY'
})

const year = new Date().getFullYear()
</script>

<template>
  <main class="gate">
    <header class="gate-mast">
      <a class="gate-brand" href="/" aria-label="Back to site">
        <svg class="brand-logo" viewBox="0 0 1280 1280" aria-hidden="true">
          <path
            fill="currentColor"
            d="M366.9,703c15.2-57.2,46.9-109,68-163.7c9-23.2,3.6-48.2-22.9-62.4c-33.7-18.3-24.6-48.4,10.6-49.8 c187.2-7.5,289.1-155.5,449.8-225.7c13.7-4.2,82.5-31.9,64.4,3.9c-11.5,22.7-24.7,26.1-30.4,57.9c-6.8,37.6,19.9,77.8,19.8,115.4 c-0.3,99-34,103.7-37.5,170.6c-2.9,55.6,23.9,68.8,26.6,122.1c3.4,66.7-15.3,101-35.1,144.3c-14.7,32.2-32.5,57.5-63.6,87.4 c-11.9,11.4-55.8,31.4-46.7-2.2c25-91.6,11.3-168.1-2-212.3c-8.6-28.7-34-57.3-36.4-100.4c-2.5-46.2,39.5-102.6,44-146.9 c2.1-20.9-16-23-43.4-12.3c-38.4,15-42.6,17.5-75.3,34.3c-86.6,44.6-139.1,140-137.2,152.3c5.3,35.8,37.7,44.9,91.9,36.2 c44.5-7.2,66.5-0.4,85.9,8.7c40.6,19.2,58.1,85.2,38.3,104.5c-20.6,20.2-51.1-14.9-106.4-1.8c-66.4,15.7-76.8,39.4-89,54.3 c-52.7,64.3-21.4,88.9-63.9,168.8c-21.7,40.9-43,78.9-73.8,115.1c-15.6,18.3-65.8,25.8-44.9-8.4c65.5-106.9,2.6-235.2,1.1-329.4 c-0.3-19.8,2.3-40.6,7.8-60.2L366.9,703z"
          />
        </svg>
        <div class="brand-meta">
          <span class="brand-eyebrow">STUDIO</span>
          <span class="brand-tag">CMS LOGIN</span>
        </div>
      </a>

      <div
        class="gate-status"
        :class="{ verifying: store.loading, denied: !!store.error && !store.loading }"
      >
        <span class="status-dot" aria-hidden="true"></span>
        <span class="status-text">{{ statusLabel }}</span>
      </div>
    </header>

    <section class="gate-stage">
      <span class="stage-eyebrow">SECTION 00 — IDENTIFICATION</span>

      <h1 class="stage-display">
        <span>BACK</span>
        <span>ROOM</span>
      </h1>

      <p class="stage-lead">
        Provide the key to continue. Visitors should head back to public site.
      </p>

      <form class="gate-form" @submit.prevent="handleLogin">
        <div class="form-row">
          <span class="row-mark" aria-hidden="true">01</span>
          <label class="form-field">
            <span class="field-label">
              <span>ACCESS KEY</span>
              <span class="field-hint">case sensitive</span>
            </span>
            <div class="field-input">
              <input
                v-model="key"
                :type="showKey ? 'text' : 'password'"
                autocomplete="off"
                autofocus
                spellcheck="false"
                @keyup.enter="handleLogin"
              />
              <button
                type="button"
                class="reveal"
                :aria-pressed="showKey"
                aria-label="Toggle key visibility"
                @click="showKey = !showKey"
              >
                <svg v-if="!showKey" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M1.5 8 C3.5 4.5 5.5 3 8 3 C10.5 3 12.5 4.5 14.5 8" />
                  <path d="M1.5 8 C3.5 11.5 5.5 13 8 13 C10.5 13 12.5 11.5 14.5 8" />
                  <circle cx="8" cy="8" r="2" />
                </svg>
                <svg v-else viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M1.5 8 C3.5 4.5 5.5 3 8 3 C10.5 3 12.5 4.5 14.5 8" />
                  <path d="M1.5 8 C3.5 11.5 5.5 13 8 13 C10.5 13 12.5 11.5 14.5 8" />
                  <circle cx="8" cy="8" r="2" />
                  <path d="M2 2 L14 14" />
                </svg>
              </button>
            </div>
          </label>
        </div>

        <Transition name="fade">
          <p v-if="store.error" class="form-error" role="alert">
            <span class="err-dot" aria-hidden="true"></span>
            <span>{{ store.error }}</span>
          </p>
        </Transition>

        <div class="form-row">
          <span class="row-mark" aria-hidden="true">02</span>
          <button class="submit" type="submit" :disabled="!key || store.loading">
            <span class="submit-label">{{ store.loading ? 'VERIFYING' : 'ENTER STUDIO' }}</span>
            <span class="submit-arrow" aria-hidden="true">
              <svg viewBox="0 0 16 16">
                <path d="M3 8 L13 8" />
                <path d="M9 4 L13 8 L9 12" />
              </svg>
            </span>
          </button>
        </div>
      </form>
    </section>

    <footer class="gate-foot">
      <span>VOL. 01</span>
      <span class="gate-foot-sep" aria-hidden="true"></span>
      <span>ARI PEKKA STUDIO CMS</span>
      <span class="gate-foot-sep" aria-hidden="true"></span>
      <span>{{ year }}</span>
    </footer>

    <div class="gate-ornament" aria-hidden="true"></div>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;700&display=swap');

.gate {
  --bg: oklch(0.14 0.005 280);
  --surface-0: oklch(0.17 0.006 280);
  --line: oklch(0.28 0.008 280);
  --line-strong: oklch(0.36 0.012 280);
  --ink: oklch(0.97 0.005 280);
  --ink-2: oklch(0.74 0.008 280);
  --ink-3: oklch(0.56 0.01 280);
  --ink-4: oklch(0.4 0.012 280);
  --accent: oklch(0.78 0.16 145);
  --danger: oklch(0.7 0.22 27);

  --display: 'Archivo Black', sans-serif;
  --body: 'Inter', system-ui, sans-serif;

  position: relative;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--body);
  font-feature-settings: 'tnum' 1;
  -webkit-font-smoothing: antialiased;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 32px;
  padding: 28px clamp(24px, 4vw, 64px);
  overflow: hidden;
}

/* MASTHEAD */
.gate-mast {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
  z-index: 2;
}

.gate-brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: var(--ink);
  text-decoration: none;
  transition: opacity 0.2s;
}
.gate-brand:hover {
  opacity: 0.72;
}
.brand-logo {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}
.brand-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
  gap: 2px;
}
.brand-eyebrow {
  font-family: var(--display);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
}
.brand-tag {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--ink-3);
}

.gate-status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: var(--ink-2);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px color-mix(in oklch, var(--accent), transparent 80%);
}
.gate-status.verifying .status-dot {
  background: oklch(0.82 0.17 85);
  box-shadow: 0 0 0 4px color-mix(in oklch, oklch(0.82 0.17 85), transparent 78%);
  animation: pulse 1s ease-in-out infinite;
}
.gate-status.denied .status-dot {
  background: var(--danger);
  box-shadow: 0 0 0 4px color-mix(in oklch, var(--danger), transparent 78%);
}
.gate-status.denied {
  color: oklch(0.85 0.14 27);
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* STAGE */
.gate-stage {
  align-self: center;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
  z-index: 2;
}

.stage-eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  color: var(--ink-3);
}

.stage-display {
  font-family: var(--display);
  font-size: clamp(3.5rem, 11vw, 8.5rem);
  line-height: 0.88;
  margin: 0;
  letter-spacing: -0.015em;
  text-transform: uppercase;
  transform: scaleX(1.05);
  transform-origin: left;
  display: flex;
  flex-direction: column;
}
.stage-display span:nth-child(2) {
  padding-left: 0.7em;
  color: var(--ink-2);
}

.stage-lead {
  margin: 8px 0 4px;
  max-width: 52ch;
  line-height: 1.55;
  font-size: 0.95rem;
  color: var(--ink-2);
}

/* FORM */
.gate-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-top: 22px;
}

.form-row {
  display: grid;
  grid-template-columns: 36px 1fr;
  align-items: end;
  gap: 18px;
}
.row-mark {
  font-family: var(--display);
  font-size: 0.85rem;
  color: var(--ink-4);
  padding-bottom: 12px;
  font-feature-settings: 'tnum' 1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.field-label {
  display: inline-flex;
  align-items: baseline;
  gap: 12px;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--ink-3);
}
.field-hint {
  font-weight: 500;
  letter-spacing: 0.12em;
  color: var(--ink-4);
  text-transform: uppercase;
  font-size: 0.58rem;
}

.field-input {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--line);
  transition: border-color 0.2s;
}
.field-input:focus-within {
  border-bottom-color: var(--ink);
}
.field-input input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--ink);
  font-family: var(--body);
  font-size: 1.15rem;
  letter-spacing: 0.05em;
  padding: 14px 0;
  caret-color: var(--accent);
}
.field-input input::placeholder {
  color: var(--ink-4);
}
.reveal {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: var(--ink-3);
  cursor: pointer;
  transition: color 0.2s;
}
.reveal svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.reveal:hover {
  color: var(--ink);
}

/* ERROR */
.form-error {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 0 54px;
  font-size: 0.82rem;
  color: oklch(0.85 0.14 27);
}
.err-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--danger);
  flex-shrink: 0;
}

/* SUBMIT */
.submit {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--ink);
  color: oklch(0.16 0 0);
  border: 1px solid var(--ink);
  padding: 18px 22px;
  cursor: pointer;
  font-family: var(--body);
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.16em;
  width: 100%;
  transition:
    background 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.25s,
    border-color 0.25s,
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.submit:hover:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
}
.submit:hover:not(:disabled) .submit-arrow {
  transform: translateX(4px);
}
.submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.submit-arrow {
  display: inline-flex;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.submit-arrow svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* FOOTER */
.gate-foot {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  color: var(--ink-4);
  z-index: 2;
}
.gate-foot-sep {
  width: 1px;
  height: 10px;
  background: var(--line);
}

/* BACKGROUND ORNAMENT */
.gate-ornament {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 100% 0%,
      color-mix(in oklch, var(--accent), transparent 92%) 0%,
      transparent 38%
    ),
    linear-gradient(
      to right,
      transparent 0%,
      color-mix(in oklch, var(--ink), transparent 96%) 50%,
      transparent 100%
    );
  z-index: 0;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* RESPONSIVE */
@media (max-width: 720px) {
  .gate {
    padding: 20px 22px;
    gap: 24px;
  }
  .gate-mast {
    padding-bottom: 14px;
  }
  .brand-tag {
    display: none;
  }
  .stage-display {
    font-size: clamp(3rem, 16vw, 6rem);
  }
  .form-row {
    grid-template-columns: 28px 1fr;
    gap: 12px;
  }
  .row-mark {
    font-size: 0.75rem;
  }
  .form-error {
    margin-left: 40px;
  }
  .gate-foot {
    flex-wrap: wrap;
    row-gap: 8px;
  }
}
</style>
