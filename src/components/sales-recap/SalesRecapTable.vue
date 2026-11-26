<script setup lang="ts">
// Rekap Penjualan per period (v1 pages/sales-recap ElTable with its TOTAL summary row), in the table style
// of Vending Sales detail (MachineSalesTable, Figma 1097:33488).
import type { SalesRecapGroupBy, SalesRecapRow, SalesRecapSummary } from '@/types/salesRecap'
import { formatRupiah } from '@/utils/format'
import { formatCount, formatRecapPeriod } from '@/utils/salesRecap'

defineProps<{
  rows: SalesRecapRow[]
  summary: SalesRecapSummary | null
  groupBy: SalesRecapGroupBy
  /** e.g. "Harian", for the period column. */
  groupLabel: string
  loading?: boolean
  error?: string | null
  emptyText: string
}>()

defineEmits<{ retry: [] }>()

const thClass = 'px-6 py-4 text-xs font-semibold tracking-[0.6px] whitespace-nowrap text-ink-placeholder uppercase'
const tdClass = 'px-6 py-4 whitespace-nowrap'
</script>

<template>
  <section class="rounded-2xl border border-line-faint/50 bg-surface px-8 pt-4 pb-6 font-inter shadow-card">
    <div class="max-h-[600px] overflow-auto">
      <table class="w-full min-w-[720px] text-left">
        <thead class="sticky top-0 bg-surface">
          <tr class="border-b border-line-faint">
            <th scope="col" :class="thClass">Periode ({{ groupLabel }})</th>
            <th scope="col" :class="thClass" class="text-right">Transaksi</th>
            <th scope="col" :class="thClass" class="text-right">Qty</th>
            <th scope="col" :class="thClass" class="text-right">Total (Gross)</th>
            <th scope="col" :class="thClass" class="text-right">Mesin Bertransaksi</th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="text-sm">
          <tr v-if="loading">
            <td colspan="5" class="py-16 text-center text-ink-muted">Memuat rekap penjualan…</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="5" class="py-16 text-center text-ink-muted">
              {{ error }}
              <button type="button" class="ml-2 font-medium text-link hover:underline" @click="$emit('retry')">Coba lagi</button>
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="5" class="py-16 text-center text-ink-muted">{{ emptyText }}</td>
          </tr>
          <tr
            v-for="row in rows"
            v-else
            :key="row.period"
            class="border-t border-row-line text-ink transition-colors first:border-t-0 hover:bg-row-line"
            :class="!row.transactions && 'text-ink-muted'"
          >
            <td :class="tdClass">{{ formatRecapPeriod(row.period, groupBy) }}</td>
            <td :class="tdClass" class="text-right">{{ formatCount(row.transactions) }}</td>
            <td :class="tdClass" class="text-right">{{ formatCount(row.qty) }}</td>
            <td :class="tdClass" class="text-right font-semibold">{{ formatRupiah(row.gross) }}</td>
            <td :class="tdClass" class="text-right">{{ formatCount(row.machines) }}</td>
          </tr>
        </tbody>
        <tfoot v-if="summary && !loading && !error" class="sticky bottom-0 bg-surface text-sm font-bold text-ink-strong">
          <tr class="border-t-2 border-line-faint">
            <th scope="row" :class="tdClass" class="text-left">TOTAL</th>
            <td :class="tdClass" class="text-right">{{ formatCount(summary.transactions) }}</td>
            <td :class="tdClass" class="text-right">{{ formatCount(summary.qty) }}</td>
            <td :class="tdClass" class="text-right">{{ formatRupiah(summary.gross) }}</td>
            <td :class="tdClass" class="text-right">
              {{ formatCount(summary.machines) }} / {{ formatCount(summary.totalMachines) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>
</template>
