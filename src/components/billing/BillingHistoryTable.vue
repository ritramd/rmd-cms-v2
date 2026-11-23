<script setup lang="ts">
// Riwayat Perpanjangan list. No Figma frame; table style of the log pages (ErrorLogTable). Columns
// follow v1 dashboard/billing-history.vue, minus the internal ones (email, flow, PPh flag).
import { computed } from 'vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import type { BillingHistoryRecord, BillingPaymentStatus } from '@/types/billing'
import type { Pagination } from '@/types/product'
import { formatRupiah, formatWibDateTime } from '@/utils/format'

const props = defineProps<{
  rows: BillingHistoryRecord[]
  pagination: Pagination | null
  loading?: boolean
  error?: string | null
  emptyText: string
}>()

defineEmits<{ retry: [] }>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)

const STATUS: Record<BillingPaymentStatus, { label: string; pill: string }> = {
  SUCCESS: { label: 'Berhasil', pill: 'bg-success-soft text-success-strong' },
  'IN PROGRESS': { label: 'Diproses', pill: 'bg-warning-soft text-warning-strong' },
  FAILED: { label: 'Gagal', pill: 'bg-danger-soft text-danger-strong' },
}

/**
 * "starter" → "Starter"; v1 packages are starter / pro / priority. Legacy voucher rows keep the
 * month count in the same column ("3"); their period already shows it, so no package name there.
 */
const packageLabel = (value: string | null) =>
  value && !/^\d+$/.test(value) ? value.charAt(0).toUpperCase() + value.slice(1) : '-'

function periodLabel(row: BillingHistoryRecord): string {
  const months = row.billing_period_months ?? 0
  const outstanding = row.outstanding_months ?? 0
  const parts = [months ? `${months} bulan` : null, outstanding ? `+ ${outstanding} bln tertunggak` : null]
  return parts.filter(Boolean).join(' ') || '-'
}

function machineCount(row: BillingHistoryRecord): number {
  return row.machine_count ?? row.machine_list.length
}

/** Hover text listing the machines; long lists are cut so the tooltip stays readable. */
function machineTitle(row: BillingHistoryRecord): string {
  const names = row.machine_list.map((m) => `${m.code} · ${m.name}`)
  return names.length > 15 ? [...names.slice(0, 15), `… dan ${names.length - 15} mesin lainnya`].join('\n') : names.join('\n')
}

/** Only a settled payment actually extended the subscription. */
function activeUntil(row: BillingHistoryRecord): string {
  if (row.payment_status !== 'SUCCESS' || !row.subscription_end_date) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${row.subscription_end_date.slice(0, 10)}T00:00:00`),
  )
}

const thClass = 'px-5 py-4 text-xs font-semibold tracking-[0.6px] whitespace-nowrap text-ink-placeholder uppercase'
</script>

<template>
  <section class="rounded-2xl border border-line-faint/50 bg-surface px-8 pt-[29px] pb-6 font-inter shadow-card">
    <EntriesSelect v-model="pageSize" />

    <div class="mt-6 overflow-x-auto">
      <table class="w-full min-w-[1040px] text-left">
        <thead>
          <tr class="border-b border-line-faint">
            <th scope="col" :class="thClass">No</th>
            <th scope="col" :class="thClass">Tanggal</th>
            <th scope="col" :class="thClass">Order ID</th>
            <th scope="col" :class="thClass">Paket</th>
            <th scope="col" :class="thClass">Periode</th>
            <th scope="col" :class="thClass">Mesin</th>
            <th scope="col" :class="[thClass, 'text-right']">Total</th>
            <th scope="col" :class="thClass">Aktif s/d</th>
            <th scope="col" :class="thClass">Status</th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="text-sm">
          <tr v-if="loading">
            <td colspan="9" class="py-16 text-center text-ink-muted">Memuat riwayat perpanjangan…</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="9" class="py-16 text-center text-ink-muted">
              {{ error }}
              <button type="button" class="ml-2 font-medium text-link hover:underline" @click="$emit('retry')">Coba lagi</button>
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="9" class="py-16 text-center text-ink-muted">{{ emptyText }}</td>
          </tr>
          <tr
            v-for="(row, i) in rows"
            v-else
            :key="row.id"
            class="border-t border-row-line text-ink transition-colors first:border-t-0 hover:bg-row-line"
          >
            <td class="px-5 py-4 text-ink-muted">{{ firstIndex + i }}</td>
            <td class="px-5 py-4 whitespace-nowrap">{{ formatWibDateTime(row.payment_date ?? row.created_at) }}</td>
            <td class="px-5 py-4 font-mono text-xs whitespace-nowrap">
              {{ row.order_id }}
              <span v-if="row.voucherCode" class="mt-0.5 block font-inter text-ink-muted">Voucher {{ row.voucherCode }}</span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap">{{ packageLabel(row.subscription_package) }}</td>
            <td class="px-5 py-4 whitespace-nowrap">{{ periodLabel(row) }}</td>
            <td class="px-5 py-4 whitespace-nowrap">
              <span v-if="machineCount(row)" class="cursor-help underline decoration-dotted underline-offset-4" :title="machineTitle(row)">
                {{ machineCount(row) }} mesin
              </span>
              <span v-else>-</span>
            </td>
            <td class="px-5 py-4 text-right font-semibold whitespace-nowrap text-ink-strong">{{ formatRupiah(row.gross_amount) }}</td>
            <td class="px-5 py-4 whitespace-nowrap">{{ activeUntil(row) }}</td>
            <td class="px-5 py-4">
              <span
                class="inline-flex rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap"
                :class="STATUS[row.payment_status]?.pill ?? 'bg-surface-muted text-ink'"
              >
                {{ STATUS[row.payment_status]?.label ?? row.payment_status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EntriesFooter
      v-if="pagination"
      v-model:page="page"
      :page-size="pageSize"
      :count="rows.length"
      :total="pagination.totalItem"
      :total-pages="pagination.totalPage"
      :hidden="loading || !!error"
    />
  </section>
</template>
