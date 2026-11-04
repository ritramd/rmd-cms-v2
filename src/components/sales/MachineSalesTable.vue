<script setup lang="ts">
// Figma: transactions table on Vending Sales detail (1097:33488).
import { computed } from 'vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import type { SaleRecord, SaleSortKey } from '@/types/sales'
import { formatRupiah } from '@/utils/format'
import SortHeader from '@/components/ui/SortHeader.vue'

defineProps<{
  sales: SaleRecord[]
  total: number
  totalPages: number
  loading?: boolean
  error?: string | null
  /** Shown when the filtered list is empty. */
  emptyText: string
}>()

defineEmits<{ retry: [] }>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
const sortBy = defineModel<SaleSortKey>('sortBy', { required: true })
const sortDir = defineModel<'asc' | 'desc'>('sortDir', { required: true })

const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)

// First click on a column sorts it newest/Z first (the default for time), the next click flips it.
function toggleSort(key: SaleSortKey) {
  if (sortBy.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortBy.value = key
    sortDir.value = key === 'transaction_time' ? 'desc' : 'asc'
  }
}
const ariaSort = (key: SaleSortKey) =>
  sortBy.value === key ? (sortDir.value === 'asc' ? 'ascending' : 'descending') : undefined

const money = (value: number | string | null) =>
  value === null || value === '' || Number.isNaN(Number(value)) ? '-' : formatRupiah(Number(value))

// Backend sends "DD-MM-YYYY HH:mm:ss" in machine local time (WIB); the design shows "12-05-2025," / "12:50 WIB".
function formatTime(value: string | null): [string, string] {
  const match = value?.match(/^(\d{2}-\d{2}-\d{4}) (\d{2}:\d{2})/)
  return match ? [`${match[1]},`, `${match[2]} WIB`] : [value ?? '-', '']
}

// Figma pads cells 24px at 1920; tighter below that so nine columns fit next to the sidebar.
const thClass = 'px-3 py-4 text-xs font-semibold tracking-[0.6px] whitespace-nowrap text-ink-placeholder uppercase 2xl:px-6'
const tdClass = 'px-3 pt-4 pb-[17px] 2xl:px-6'
const columnCount = 9
</script>

<template>
  <section class="rounded-2xl border border-line-faint/50 bg-surface px-8 pt-[29px] pb-6 font-inter shadow-card">
    <EntriesSelect v-model="pageSize" />

    <div class="mt-6 overflow-x-auto">
      <table class="w-full min-w-[960px] text-left">
        <thead>
          <tr class="border-b border-line-faint">
            <th scope="col" :class="thClass">No</th>
            <th scope="col" :class="thClass">ID Transaksi</th>
            <th scope="col" :class="thClass">Produk</th>
            <th scope="col" :class="thClass">SKU</th>
            <th scope="col" :class="thClass" class="text-center">Slot</th>
            <th scope="col" :class="thClass">Harga SKU</th>
            <th scope="col" :class="thClass">Harga NETT</th>
            <th scope="col" :class="thClass" class="py-3" :aria-sort="ariaSort('payment_type')">
              <SortHeader
                label="Metode Bayar"
                :direction="sortBy === 'payment_type' ? sortDir : null"
                @toggle="toggleSort('payment_type')"
              />
            </th>
            <th scope="col" :class="thClass" class="py-3" :aria-sort="ariaSort('transaction_time')">
              <SortHeader
                label="Waktu Transaksi"
                :direction="sortBy === 'transaction_time' ? sortDir : null"
                @toggle="toggleSort('transaction_time')"
              />
            </th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="text-sm">
          <tr v-if="loading">
            <td :colspan="columnCount" class="py-16 text-center text-ink-muted">Memuat transaksi…</td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="columnCount" class="py-16 text-center text-ink-muted">
              {{ error }}
              <button type="button" class="ml-2 font-medium text-link hover:underline" @click="$emit('retry')">Coba lagi</button>
            </td>
          </tr>
          <tr v-else-if="!sales.length">
            <td :colspan="columnCount" class="py-16 text-center text-ink-muted">{{ emptyText }}</td>
          </tr>
          <tr
            v-for="(sale, i) in sales"
            v-else
            :key="sale.order_id ?? sale.id"
            class="text-ink transition-colors hover:bg-row-line"
          >
            <td :class="tdClass" class="text-ink-muted">{{ firstIndex + i }}</td>
            <td :class="tdClass" class="min-w-40 font-semibold break-all text-ink-deep">{{ sale.transaction_id || '-' }}</td>
            <td :class="tdClass" class="min-w-40">{{ sale.product || '-' }}</td>
            <td :class="tdClass" class="whitespace-nowrap">{{ sale.sku || '-' }}</td>
            <td :class="tdClass" class="text-center">{{ sale.slot ?? '-' }}</td>
            <td :class="tdClass" class="whitespace-nowrap">{{ money(sale.price) }}</td>
            <td :class="tdClass" class="whitespace-nowrap">{{ money(sale.gross_amount) }}</td>
            <td :class="tdClass" class="whitespace-nowrap">{{ sale.payment_type || '-' }}</td>
            <td :class="tdClass" class="whitespace-nowrap">
              <span v-for="(part, j) in formatTime(sale.transaction_time)" :key="j" class="block">{{ part }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EntriesFooter
      v-model:page="page"
      :page-size="pageSize"
      :count="sales.length"
      :total="total"
      :total-pages="totalPages"
      :hidden="loading || !!error"
    />
  </section>
</template>
