import type { IconName, NavIconName } from '@/assets/icons'

// Sidebar from the dashboard design (1097:42249). Paths reuse rmd-cms v1 routes (utils/menuItems.ts).

export interface NavLink {
  label: string
  icon: NavIconName
  to: string
}

export interface NavGroup {
  label: string
  icon: IconName
  children: { label: string; to: string }[]
}

export type NavEntry = NavLink | NavGroup | 'divider'

export const navigation: NavEntry[] = [
  { label: 'Dashboard', icon: 'dashboard', to: '/' },
  // Figma: Produk group with "Atur Produk" (1097:21992). v1's "Manage Produk" lives at /product.
  {
    label: 'Produk',
    icon: 'inventory',
    children: [
      { label: 'Atur Produk', to: '/product' },
      // Not in Figma yet; same path as v1's "Kategori Produk".
      { label: 'Kategori Produk', to: '/product/categories' },
    ],
  },
  // Figma: Penjualan group (1097:20207). v1 has these pages under the same paths.
  {
    label: 'Penjualan',
    icon: 'receipt',
    children: [
      { label: 'Vending Sales', to: '/vending-sales' },
      { label: 'Vending Sales Digital', to: '/sales-digital' },
    ],
  },
  { label: 'Configs', icon: 'tune', to: '/vm-config' },
  // Figma: Stok group (1097:34077). Same paths as v1.
  {
    label: 'Stok',
    icon: 'assignment',
    children: [
      { label: 'Stok Vending', to: '/stok-vending' },
      { label: 'Riwayat Stok Ulang', to: '/histori-stok-ulang' },
    ],
  },
  {
    label: 'Kelola Vending',
    icon: 'storefront',
    children: [
      { label: 'Live Preview', to: '/live-preview' },
      { label: 'Daftar vending', to: '/kelola-vending' },
      { label: 'UI Material', to: '/ui-material' },
    ],
  },
  { label: 'Atur Promo', icon: 'sell', to: '/flashsale' },
  { label: 'Log', icon: 'history', to: '/log-transaksi' },
  { label: 'Billing', icon: 'receipt-long', to: '/subscription-end' },
  { label: 'User Management', icon: 'manage-accounts', to: '/users' },
  'divider',
  { label: 'Bantuan', icon: 'help', to: '/tutorial' },
]

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return typeof entry === 'object' && 'children' in entry
}
