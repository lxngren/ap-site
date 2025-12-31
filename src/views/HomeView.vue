<script setup lang="ts">
const SHOWREEL_URL: string = 'https://www.instagram.com/ari.cgi/reel/DS6DPlEDDyE/'
</script>

<template>
  <main class="landing-container">
    <div class="ui-layer">
      <div class="spacer"></div>
      <footer class="bottom-footer">
        <a :href="SHOWREEL_URL" target="_blank" rel="noopener noreferrer" class="showreel-link">
          showreel
        </a>
      </footer>
    </div>
  </main>
</template>

<style scoped>
.landing-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: transparent;
  font-family: 'GoodSans', sans-serif;
}

.ui-layer {
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem 1rem;
}

.bottom-footer {
  display: flex;
  justify-content: center;
  padding-bottom: 3rem;
}

.showreel-link {
  display: inline-block;
  background: none;
  border: none;
  text-decoration: none;
  cursor: pointer;
  color: #ffffff;
  font-family: inherit;
  font-size: 1.5rem;
  font-weight: 400;
  text-transform: uppercase;
  line-height: 1;
  letter-spacing: -0.1em;
  transform: scaleX(1.1);
  transform-origin: center center;
  transition: all 0.4s cubic-bezier(0, 0.83, 0.64, 1);
}

.showreel-link:hover {
  letter-spacing: 0.02em;
  transform: scale(1.3);
  color: var(--main-accent);
}

@media (max-width: 1024px) {
  .showreel-link {
    font-size: 1.65rem;
  }
}

@media (max-width: 768px) {
  .bottom-footer {
    padding-bottom: 5rem;
  }
}
</style>
