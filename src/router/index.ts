import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
  },
  {
    path: '/project/:id',
    name: 'project-detail',
    component: () => import('@/views/ProjectDetailView.vue'),
    props: true,
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/AdminLogin.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  const store = useAdminStore()
  const shouldCheckSession = !store.isAuthenticated && (to.meta.requiresAuth || to.meta.guestOnly)
  if (shouldCheckSession) {
    await store.checkSession()
  }

  if (to.meta.requiresAuth && !store.isAuthenticated) {
    return { name: 'admin-login' }
  }

  if (to.meta.guestOnly && store.isAuthenticated) {
    return { name: 'admin-dashboard' }
  }
  return
})

export default router
