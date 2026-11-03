import type { AttentionItem } from '@/types/dashboard'
import type { VendingMachine } from '@/types/vending'
import { LOW_STOCK_PERCENT } from './stock'

function machineLabel(first: VendingMachine, total: number) {
  return total > 1 ? `${first.name} dan ${total - 1} mesin lain` : first.name
}

/** "Perlu Perhatian" entries: the lowest-stock machine and the offline machines. */
export function buildAttentionItems(machines: VendingMachine[]): AttentionItem[] {
  const items: AttentionItem[] = []

  const lowStock = machines
    .filter((m) => m.stock !== null && m.stock < LOW_STOCK_PERCENT)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
  if (lowStock.length) {
    items.push({
      id: 'low-stock',
      kind: 'low-stock',
      title: 'Stok Menipis',
      machine: machineLabel(lowStock[0], lowStock.length),
      detail: `Sisa ${lowStock[0].stock}%`,
    })
  }

  const offline = machines.filter((m) => m.status === 'offline')
  if (offline.length) {
    items.push({
      id: 'disconnected',
      kind: 'disconnected',
      title: 'Koneksi Terputus',
      machine: machineLabel(offline[0], offline.length),
      detail: 'Offline',
    })
  }

  return items
}
