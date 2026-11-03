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
  { label: 'Produk', icon: 'inventory', to: '/product' },
  { label: 'Penjualan', icon: 'receipt', to: '/sales-recap' },
  { label: 'Configs', icon: 'tune', to: '/vm-config' },
  { label: 'Stok', icon: 'assignment', to: '/stok-vending' },
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
