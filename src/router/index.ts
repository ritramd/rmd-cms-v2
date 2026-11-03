import { createRouter, createWebHistory } from 'vue-router'
import { getSession } from '@/services/auth'

declare module 'vue-router' {
  interface RouteMeta {
    /** Pages reachable without logging in. */
    public?: boolean
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
    { path: '/login', name: 'login', component: () => import('@/pages/LoginPage.vue'), meta: { public: true } },
    // Same path as v1 so existing links keep working.
    {
      path: '/lupa-password',
      name: 'forgot-password',
      component: () => import('@/pages/ForgotPasswordPage.vue'),
      meta: { public: true },
    },
    // Dev-only UI kit preview.
    { path: '/components', name: 'components', component: () => import('@/pages/ComponentGallery.vue'), meta: { public: true } },
    { path: '/:pathMatch(.*)*', name: 'not-migrated', component: () => import('@/pages/NotMigratedPage.vue') },
  ],
})

router.beforeEach((to) => {
  if (!to.meta.public && !getSession()) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && getSession()) return { path: '/' }
})
