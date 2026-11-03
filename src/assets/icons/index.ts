// SVG icons exported from Figma (nodes 11:1198 and 4:1023). Colors are baked into each file,
// so stateful icons come in pairs: `<name>` (default) and `<name>-active` (hover/active).

export type NavIconName =
  | 'dashboard'
  | 'inventory'
  | 'receipt'
  | 'tune'
  | 'assignment'
  | 'sell'
  | 'history'
  | 'receipt-long'
  | 'manage-accounts'
  | 'help'

export type IconName =
  | NavIconName
  | `${NavIconName}-active`
  | 'notifications'
  | 'notifications-active'
  | 'more-vert'
  | 'more-vert-active'
  | 'storefront'
  /** Chevron that points down; rotate 180° for the expanded state. */
  | 'chevron-expand'
  | 'search'
  | 'wallet'
  | 'trending-up'
  | 'dns'
  | 'restock'
  | 'power-off'
  | 'filter'
  | 'download'
  | 'add'
  | 'machine-snack'
  | 'machine-drink'
  | 'machine-coffee'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  // Screen editor set (4:1023)
  | 'arrow-back'
  | 'arrow-back-active'
  | 'robot'
  | 'expand-more'
  | 'restart'
  | 'tune-outline'
  | 'tune-outline-active'
  | 'devices'
  | 'payments'
  | 'payments-active'
  | 'local-mall'
  | 'qr-code'
  | 'home'
  | 'search-outline'
  | 'shopping-cart'
  | 'zoom-in'
  | 'zoom-in-active'
  | 'zoom-out'
  | 'zoom-out-active'
  | 'smartphone'
  | 'smartphone-active'
  // Compact page header (Atur Produk, 1097:22028)
  | 'search-sm'
  | 'bell-outline'
  | LineIconName

/** Stroke-drawn vectors (`line-*`). Unlike the glyph icons above, these export upright. */
export type LineIconName =
  | 'line-select-chevron'
  // Product management set (187:3356)
  | 'line-search'
  | 'line-bell'
  | 'line-bell-active'
  | 'line-plus'
  | 'line-chevron-down'
  | 'line-filter'
  | 'line-pencil'
  | 'line-pencil-active'
  | 'line-chevron-left'
  | 'line-chevron-left-active'
  | 'line-chevron-right'
  | 'line-chevron-right-active'
  | 'line-home'
  | 'line-cube'
  | 'line-bar-chart'
  | 'line-users'
  // Not in Figma: drawn to match line-pencil for the Kategori Produk delete action.
  | 'line-trash'
  | 'line-trash-active'
  // Reset filters on Vending Sales detail (1097:33355)
  | 'line-rotate-ccw'

const files = import.meta.glob<string>('./*.svg', { eager: true, import: 'default' })

export const icons = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.slice(2, -4), url]),
) as Record<IconName, string>

/** Icon-font glyphs are exported upside-down (Figma flips the vector node); `line-*` vectors are not. */
export function isFlippedGlyph(name: IconName): boolean {
  return !name.startsWith('line-')
}
