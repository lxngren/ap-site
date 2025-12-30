<script setup lang="ts"></script>

<template>
  <main class="landing-container">
    <div class="ui-layer">
      <div class="spacer"></div>

      <footer class="bottom-footer">
        <button class="showreel-button">showreel</button>
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

.showreel-button {
  background: none;
  border: none;
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

.showreel-button:hover {
  letter-spacing: 0.02em;
  transform: scale(1.3);
  color: var(--main-accent);
}

@media (max-width: 768px) {
  .showreel-button {
    font-size: 1.2rem;
  }
}
</style>
