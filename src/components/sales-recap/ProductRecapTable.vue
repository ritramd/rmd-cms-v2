<script setup lang="ts">
// Rekap Penjualan per Produk (v1 pages/sales-recap-product ElTable: sortable columns, gross descending by
// default, TOTAL summary row), in the table style of Vending Sales detail (Figma 1097:33488).
import SortHeader from '@/components/ui/SortHeader.vue'
import type { ProductRecapRow, ProductRecapSortKey, ProductRecapSummary } from '@/types/salesRecap'
import { formatRupiah } from '@/utils/format'
import { formatCount } from '@/utils/salesRecap'

defineProps<{
  /** Already filtered and sorted by the page. */
  rows: ProductRecapRow[]
  summary: ProductRecapSummary | null
  loading?: boolean
  error?: string | null
  emptyText: string
}>()

defineEmits<{ retry: [] }>()

const sortBy = defineModel<ProductRecapSortKey>('sortBy', { required: true })
const sortDir = defineModel<'asc' | 'desc'>('sortDir', { required: true })

const COLUMNS: { key: ProductRecapSortKey; label: string; numeric: boolean }[] = [
  { key: 'product', label: 'Produk', numeric: false },
  { key: 'transactions', label: 'Transaksi', numeric: true },
  { key: 'qty', label: 'Qty', numeric: true },
  { key: 'gross', label: 'Total (Gross)', numeric: true },
]

/** Same column flips direction; a new one starts high to low (A–Z for the name). */
function toggleSort(key: ProductRecapSortKey) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    return
  }
  sortBy.value = key
  sortDir.value = key === 'product' ? 'asc' : 'desc'
}

const ariaSort = (key: ProductRecapSortKey) =>
  sortBy.value === key ? (sortDir.value === 'asc' ? 'ascending' : 'descending') : 'none'

const thClass = 'px-6 py-3 text-xs font-semibold tracking-[0.6px] whitespace-nowrap text-ink-placeholder uppercase'
const tdClass = 'px-6 py-4 whitespace-nowrap'
</script>

<template>
  <section class="rounded-2xl border border-line-faint/50 bg-surface px-8 pt-4 pb-6 font-inter shadow-card">
    <div class="max-h-[600px] overflow-auto">
      <table class="w-full min-w-[720px] text-left">
        <thead class="sticky top-0 bg-surface">
          <tr class="border-b border-line-faint">
            <th
              v-for="col in COLUMNS"
              :key="col.key"
              scope="col"
              :class="[thClass, col.numeric && 'text-right']"
              :aria-sort="ariaSort(col.key)"
            >
              <SortHeader
                :label="col.label"
                :direction="sortBy === col.key ? sortDir : null"
                @toggle="toggleSort(col.key)"
              />
            </th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="text-sm">
          <tr v-if="loading">
            <td colspan="4" class="py-16 text-center text-ink-muted">Memuat rekap per produk…</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="4" class="py-16 text-center text-ink-muted">
              {{ error }}
              <button type="button" class="ml-2 font-medium text-link hover:underline" @click="$emit('retry')">Coba lagi</button>
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="4" class="py-16 text-center text-ink-muted">{{ emptyText }}</td>
          </tr>
          <tr
            v-for="row in rows"
            v-else
            :key="`${row.product_id}-${row.product}`"
            class="border-t border-row-line text-ink transition-colors first:border-t-0 hover:bg-row-line"
          >
            <td class="px-6 py-3">
              <span class="block font-medium text-ink-deep">{{ row.product }}</span>
              <span v-if="row.sku" class="block text-xs text-ink-subtle">{{ row.sku }}</span>
            </td>
            <td :class="tdClass" class="text-right">{{ formatCount(row.transactions) }}</td>
            <td :class="tdClass" class="text-right">{{ formatCount(row.qty) }}</td>
            <td :class="tdClass" class="text-right font-semibold">{{ formatRupiah(row.gross) }}</td>
          </tr>
        </tbody>
        <tfoot v-if="summary && !loading && !error" class="sticky bottom-0 bg-surface text-sm font-bold text-ink-strong">
          <tr class="border-t-2 border-line-faint">
            <th scope="row" :class="tdClass" class="text-left">TOTAL ({{ formatCount(summary.products) }} produk)</th>
            <td :class="tdClass" class="text-right">{{ formatCount(summary.transactions) }}</td>
            <td :class="tdClass" class="text-right">{{ formatCount(summary.qty) }}</td>
            <td :class="tdClass" class="text-right">{{ formatRupiah(summary.gross) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>
</template>
