<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useRouter } from 'vue-router'

const token = ref('')
const store = useAdminStore()
const router = useRouter()

const handleLogin = async () => {
  if (!token.value) return
  const success = await store.login(token.value)
  if (success) await router.push({ name: 'admin-dashboard' })
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-box">
      <h1 class="admin-title">SYSTEM ACCESS</h1>
      <div class="input-group">
        <input
          v-model="token"
          type="password"
          placeholder="GITHUB TOKEN"
          class="brutal-input"
          @keyup.enter="handleLogin"
        />
      </div>
      <div v-if="store.error" class="error-msg">{{ store.error }}</div>
      <button @click="handleLogin" class="brutal-btn" :disabled="store.loading">
        {{ store.loading ? 'VERIFYING...' : 'ENTER' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  height: 100vh;
  width: 100vw;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}
.login-box {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border: 1px solid #333;
}
.admin-title {
  color: #fff;
  font-weight: 900;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  letter-spacing: -1px;
}
.brutal-input {
  width: 100%;
  background: #000;
  border: 1px solid #555;
  color: #fff;
  padding: 1rem;
  font-family: monospace;
  font-size: 1rem;
  margin-bottom: 1rem;
  outline: none;
}
.brutal-input:focus {
  border-color: #fff;
}
.brutal-btn {
  width: 100%;
  background: #fff;
  color: #000;
  border: none;
  padding: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}
.brutal-btn:hover {
  background: #ccc;
}
.brutal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.error-msg {
  color: #ff3333;
  font-family: monospace;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}
</style>
