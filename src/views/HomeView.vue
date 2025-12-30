<script setup lang="ts">
// Скрипт можно оставить пустым или убрать ref на видео, так как оно удалено
</script>

<template>
  <main class="landing-container">
    <div class="ui-layer">
      <div class="spacer"></div>

      <footer class="bottom-footer">
        <button class="showreel-btn">showreel</button>
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
  /* Убираем черный фон, чтобы видеть видео из App.vue,
     либо оставляем прозрачным */
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

/* ... Твои стили кнопки footer ... */
.bottom-footer {
  display: flex;
  justify-content: center;
  padding-bottom: 3rem;
}

.showreel-btn {
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

.showreel-btn::after {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background-color: #fff;
  margin-top: 10px;
  border-radius: 4px;
  transform: scaleX(0.2);
  transform-origin: center;
  transition: transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
}

.showreel-btn:hover {
  letter-spacing: 0.02em;
  transform: scale(1.3);
}

.showreel-btn:hover::after {
  transform: scaleX(1);
}

@media (max-width: 768px) {
  .showreel-btn {
    font-size: 3rem;
  }
}
</style>
