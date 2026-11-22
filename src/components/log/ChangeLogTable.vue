<script setup lang="ts">
// Price, product and planogram changes with who made them (v1 pages/log-perubahan/index.vue), in the v2 table style.
import { computed } from 'vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import type { ChangeAction, ChangeEntityType, ChangeLogRecord } from '@/types/logs'

defineProps<{
  rows: ChangeLogRecord[]
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

const ENTITY: Record<ChangeEntityType, { label: string; pill: string }> = {
  product: { label: 'Produk', pill: 'bg-primary-soft text-primary' },
  planogram: { label: 'Planogram', pill: 'bg-surface-muted text-ink' },
}
const ACTION: Record<ChangeAction, { label: string; pill: string }> = {
  create: { label: 'Tambah', pill: 'bg-success-soft text-success-strong' },
  update: { label: 'Ubah', pill: 'bg-warning-soft text-warning-strong' },
  delete: { label: 'Hapus', pill: 'bg-danger-soft text-danger-strong' },
}
const PRICE_FIELDS = ['price', 'promo_price']

/** v1: "-" for empty, rupiah for prices. */
function formatValue(field: string, value: string | number | null): string {
  if (value === null || value === undefined || value === '') return '-'
  if (PRICE_FIELDS.includes(field) && !Number.isNaN(Number(value))) return `Rp ${Number(value).toLocaleString('id-ID')}`
  return String(value)
}

const thClass = 'px-3 py-4 text-xs font-semibold tracking-[0.6px] whitespace-nowrap text-ink-placeholder uppercase 2xl:px-6'
const tdClass = 'px-3 py-4 align-top 2xl:px-6'
const pillClass = 'inline-flex rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap'
const columnCount = 7
</script>

<template>
  <section class="rounded-2xl border border-line-faint/50 bg-surface px-8 pt-[29px] pb-6 font-inter shadow-card">
    <EntriesSelect v-model="pageSize" />

    <div class="mt-6 overflow-x-auto">
      <table class="w-full min-w-[1040px] text-left">
        <thead>
          <tr class="border-b border-line-faint">
            <th scope="col" :class="thClass">No</th>
            <th scope="col" :class="thClass">Waktu</th>
            <th scope="col" :class="thClass">Tipe / Aksi</th>
            <th scope="col" :class="thClass">Mesin</th>
            <th scope="col" :class="thClass">Produk</th>
            <th scope="col" :class="thClass">Perubahan</th>
            <th scope="col" :class="thClass">Diubah Oleh</th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="text-sm">
          <tr v-if="loading">
            <td :colspan="columnCount" class="py-16 text-center text-ink-muted">Memuat log perubahan…</td>
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
            :key="row.id"
            class="border-t border-row-line text-ink transition-colors first:border-t-0 hover:bg-row-line"
          >
            <td :class="tdClass" class="text-ink-muted">{{ firstIndex + i }}</td>
            <td :class="tdClass" class="whitespace-nowrap">{{ row.created_at }}</td>
            <td :class="tdClass">
              <span class="flex flex-col items-start gap-1">
                <span :class="[pillClass, ENTITY[row.entity_type]?.pill]">{{ ENTITY[row.entity_type]?.label ?? row.entity_type }}</span>
                <span :class="[pillClass, ACTION[row.action]?.pill]">{{ ACTION[row.action]?.label ?? row.action }}</span>
              </span>
            </td>
            <td :class="tdClass" class="whitespace-nowrap">
              <span class="font-semibold text-ink-deep">{{ row.vending_machine_code ?? '-' }}</span>
              <span v-if="row.slot" class="block text-xs text-ink-muted">Slot {{ row.slot }}</span>
            </td>
            <td :class="tdClass" class="min-w-40">
              {{ row.product_name ?? '-' }}
              <span v-if="row.sku" class="block text-xs text-ink-muted">{{ row.sku }}</span>
            </td>
            <td :class="tdClass" class="min-w-64">
              <span v-for="change in row.changed_fields" :key="change.field" class="block leading-5">
                <!-- &nbsp;: the template compiler drops the whitespace between these spans. -->
                <span class="font-semibold text-ink-strong">{{ change.label }}:&nbsp;</span>
                <span class="text-ink-muted line-through">{{ formatValue(change.field, change.before) }}</span>
                <span class="text-ink-muted" aria-label="menjadi">&nbsp;→&nbsp;</span>
                <span class="text-ink-strong">{{ formatValue(change.field, change.after) }}</span>
              </span>
            </td>
            <td :class="tdClass" class="min-w-44">
              {{ row.user_name ?? '-' }}
              <span class="block text-xs text-ink-muted">{{ row.user_email ?? '-' }}</span>
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
