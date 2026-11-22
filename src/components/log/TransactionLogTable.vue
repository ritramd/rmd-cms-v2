<script setup lang="ts">
// Unsettled transactions of one machine (v1 pages/log-transaksi/[machine].vue), in the table style of
// Vending Sales detail (MachineSalesTable, Figma 1097:33488).
import { computed } from 'vue'
import TransactionStatusBadge from '@/components/log/TransactionStatusBadge.vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import type { TransactionLogRecord } from '@/types/logs'
import { formatRupiah } from '@/utils/format'

defineProps<{
  rows: TransactionLogRecord[]
  total: number
  totalPages: number
  loading?: boolean
  error?: string | null
  emptyText: string
}>()

defineEmits<{ retry: [] }>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)

/** v1: actions.quantity, or 1. */
function quantity(row: TransactionLogRecord): number | string {
  return typeof row.actions === 'object' && row.actions?.quantity ? row.actions.quantity : 1
}

/** v1 shows the list price, or the paid amount when there is none. */
function price(row: TransactionLogRecord): string {
  const value = row.price || row.gross_amount
  return value === null || value === '' || Number.isNaN(Number(value)) ? '-' : formatRupiah(Number(value))
}

// Backend sends "DD-MM-YYYY HH:mm:ss" in machine local time (WIB).
function formatTime(value: string | null): [string, string] {
  const match = value?.match(/^(\d{2}-\d{2}-\d{4}) (\d{2}:\d{2})/)
  return match ? [`${match[1]},`, `${match[2]} WIB`] : [value ?? '-', '']
}

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
            <th scope="col" :class="thClass" class="text-center">Slot</th>
            <th scope="col" :class="thClass" class="text-center">Jumlah</th>
            <th scope="col" :class="thClass">Status</th>
            <th scope="col" :class="thClass">Harga</th>
            <th scope="col" :class="thClass">Metode Bayar</th>
            <th scope="col" :class="thClass">Waktu Transaksi</th>
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
          <tr v-else-if="!rows.length">
            <td :colspan="columnCount" class="py-16 text-center text-ink-muted">{{ emptyText }}</td>
          </tr>
          <tr
            v-for="(row, i) in rows"
            v-else
            :key="row.order_id ?? row.id"
            class="text-ink transition-colors hover:bg-row-line"
          >
            <td :class="tdClass" class="text-ink-muted">{{ firstIndex + i }}</td>
            <td :class="tdClass" class="min-w-40 font-semibold break-all text-ink-deep">{{ row.transaction_id || '-' }}</td>
            <td :class="tdClass" class="min-w-40">{{ row.product || '-' }}</td>
            <td :class="tdClass" class="text-center">{{ row.slot ?? '-' }}</td>
            <td :class="tdClass" class="text-center">{{ quantity(row) }}</td>
            <td :class="tdClass"><TransactionStatusBadge :status="row.transaction_status" /></td>
            <td :class="tdClass" class="whitespace-nowrap">{{ price(row) }}</td>
            <td :class="tdClass" class="whitespace-nowrap">{{ row.payment_type || '-' }}</td>
            <td :class="tdClass" class="whitespace-nowrap">
              <span v-for="(part, j) in formatTime(row.transaction_time)" :key="j" class="block">{{ part }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EntriesFooter
      v-model:page="page"
      :page-size="pageSize"
      :count="rows.length"
      :total="total"
      :total-pages="totalPages"
      :hidden="loading || !!error"
    />
  </section>
</template>
