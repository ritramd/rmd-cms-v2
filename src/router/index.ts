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
    // Same path as v1's "Manage Produk"; sidebar: Produk → Atur Produk.
    { path: '/product', name: 'products', component: () => import('@/pages/ProductListPage.vue') },
    // Same path as v1; sidebar: Produk → Kategori Produk.
    {
      path: '/product/categories',
      name: 'product-categories',
      component: () => import('@/pages/ProductCategoryPage.vue'),
    },
    // Same paths as v1; sidebar: Penjualan → Vending Sales / Vending Sales Digital.
    {
      path: '/vending-sales',
      name: 'vending-sales',
      component: () => import('@/pages/SalesMachinesPage.vue'),
      props: { channel: 'vending' },
    },
    {
      path: '/vending-sales/:machine',
      name: 'vending-sales-machine',
      component: () => import('@/pages/MachineSalesPage.vue'),
      props: true,
    },
    {
      path: '/sales-digital',
      name: 'sales-digital',
      component: () => import('@/pages/SalesMachinesPage.vue'),
      props: { channel: 'digital' },
    },
    // Same path as v1; sidebar: Stok → Stok Vending.
    { path: '/stok-vending', name: 'stock-vending', component: () => import('@/pages/StockVendingPage.vue') },
    // Same paths as v1 (the machine page also takes v1's trailing name slug); sidebar: Stok → Riwayat Stok Ulang.
    { path: '/histori-stok-ulang', name: 'restock-history', component: () => import('@/pages/RestockHistoryPage.vue') },
    {
      path: '/histori-stok-ulang/:machine/:slug?',
      name: 'restock-history-machine',
      component: () => import('@/pages/RestockHistoryPage.vue'),
      props: (route) => ({ machine: route.params.machine }),
    },
    // Billing and subscription expiration: preserves v1 path (/subscription-end) and supports /billing
    {
      path: '/subscription-end',
      name: 'subscription-end',
      component: () => import('@/pages/BillingPage.vue'),
    },
    {
      path: '/billing',
      name: 'billing',
      redirect: '/subscription-end',
    },
    // Same paths as v1's "Log" group (pages/log-transaksi, pages/log-error, pages/log-perubahan).
    {
      path: '/log-transaksi',
      name: 'log-transaksi',
      component: () => import('@/pages/LogMachinesPage.vue'),
      props: { kind: 'transaction' },
    },
    {
      path: '/log-transaksi/:machine',
      name: 'log-transaksi-machine',
      component: () => import('@/pages/TransactionLogPage.vue'),
      props: true,
    },
    {
      path: '/log-error',
      name: 'log-error',
      component: () => import('@/pages/LogMachinesPage.vue'),
      props: { kind: 'error' },
    },
    {
      path: '/log-error/:machine',
      name: 'log-error-machine',
      component: () => import('@/pages/ErrorLogPage.vue'),
      props: true,
    },
    { path: '/log-perubahan', name: 'log-perubahan', component: () => import('@/pages/ChangeLogPage.vue') },
    // Same path as v1's "VM & Machine Config" (pages/vm-config); sidebar: Configs.
    { path: '/vm-config', name: 'vm-config', component: () => import('@/pages/VmConfigPage.vue') },
    // Same path as v1's "Ubah Password" (pages/ganti-password/index.vue)
    {
      path: '/ganti-password',
      name: 'change-password',
      component: () => import('@/pages/ChangePasswordPage.vue'),
    },
    // Promo & Flash sale: preserves v1 paths and matches Figma (1097:35691)
    {
      path: '/flashsale/:machine?',
      name: 'flashsale',
      component: () => import('@/pages/FlashsalePage.vue'),
      props: true,
    },
    {
      path: '/flashsale/kelola-:machine',
      redirect: (to) => `/flashsale/${to.params.machine}`,
    },
    {
      path: '/flashsale/tambah-:machine',
      redirect: (to) => `/flashsale/${to.params.machine}?action=add`,
    },
    {
      path: '/almost-expired',
      name: 'almost-expired',
      component: () => import('@/pages/AlmostExpiredPage.vue'),
    },
    {
      path: '/almost-expired/:machine',
      name: 'almost-expired-detail',
      component: () => import('@/pages/AlmostExpiredDetailPage.vue'),
    },
    {
      path: '/flashsale/almost-expired',
      redirect: '/almost-expired',
    },
    {
      path: '/diskon-kedaluarsa',
      redirect: '/almost-expired',
    },
    {
      path: '/diskon-kedaluarsa/:machine',
      redirect: (to) => `/almost-expired/${to.params.machine}`,
    },
    // Help & Support: preserves v1 paths (/tutorial and /faq)
    {
      path: '/tutorial',
      name: 'tutorial',
      component: () => import('@/pages/TutorialPage.vue'),
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('@/pages/FaqPage.vue'),
    },
    // User Management: preserves legacy path (/users) and matches Figma (1097:28128)
    {
      path: '/users',
      name: 'users',
      component: () => import('@/pages/UserManagementPage.vue'),
    },
    {
      path: '/user-management',
      redirect: '/users',
    },
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
