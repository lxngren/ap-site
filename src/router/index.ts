import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectDetailView from '../views/ProjectDetailView.vue' // <-- Импорт

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView,
    },
    {
      path: '/project/:id', // <-- Динамический ID
      name: 'project-detail',
      component: ProjectDetailView,
    },
  ],
  // Чтобы при переходе страница скроллилась наверх
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
