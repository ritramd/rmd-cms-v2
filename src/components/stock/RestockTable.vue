<script setup lang="ts">
// Figma: restock entries table on Histori Stok Ulang (1097:34183). The all-machines list adds a machine column.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import SortHeader from '@/components/ui/SortHeader.vue'
import type { RestockRecord } from '@/types/stock'

const props = defineProps<{
  records: RestockRecord[]
  /** Show which machine each entry belongs to. */
  showMachine?: boolean
  total: number
  totalPages: number
  loading?: boolean
  error?: string | null
  emptyText: string
}>()

defineEmits<{ retry: [] }>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
/** Order of "Dibuat Pada": desc = newest first (the API default). */
const sortDir = defineModel<'asc' | 'desc'>('sortDir', { required: true })

const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)
const columnCount = computed(() => (props.showMachine ? 7 : 6))

// Backend sends "DD-MM-YYYY HH:mm:ss" in machine local time (WIB); the design shows "12-05-2025, 12:50 WIB".
function formatTime(value: string | null) {
  const match = value?.match(/^(\d{2}-\d{2}-\d{4}) (\d{2}:\d{2})/)
  return match ? `${match[1]}, ${match[2]} WIB` : (value ?? '-')
}

const thClass = 'px-6 py-4 text-xs font-semibold tracking-[0.6px] whitespace-nowrap text-ink-placeholder uppercase'
const tdClass = 'px-6 pt-4 pb-[17px]'
</script>

<template>
  <section class="rounded-2xl border border-line-faint/50 bg-surface px-8 pt-[29px] pb-6 font-inter shadow-card">
    <EntriesSelect v-model="pageSize" />

    <div class="mt-6 overflow-x-auto">
      <table class="w-full min-w-[860px] table-fixed text-left">
        <colgroup>
          <col class="w-[84px]" />
          <!-- The machine column takes its room from the others; slot/stock columns keep space for their headers. -->
          <col v-if="showMachine" class="w-[20%]" />
          <col :class="showMachine ? 'w-[19%]' : 'w-[22%]'" />
          <col :class="showMachine && 'w-20'" />
          <col :class="showMachine && 'w-[13%]'" />
          <col :class="showMachine && 'w-[13%]'" />
          <col :class="showMachine ? 'w-[19%]' : 'w-[22%]'" />
        </colgroup>
        <thead>
          <tr class="border-b border-line-faint">
            <th scope="col" :class="thClass">No</th>
            <th v-if="showMachine" scope="col" :class="thClass">Mesin</th>
            <th scope="col" :class="thClass">Produk</th>
            <th scope="col" :class="thClass" class="text-center">Slot</th>
            <th scope="col" :class="thClass">Before Restock</th>
            <th scope="col" :class="thClass">Updated Stock</th>
            <th scope="col" :class="thClass" class="py-3" :aria-sort="sortDir === 'asc' ? 'ascending' : 'descending'">
              <SortHeader label="Dibuat Pada" :direction="sortDir" @toggle="sortDir = sortDir === 'asc' ? 'desc' : 'asc'" />
            </th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="text-sm text-ink">
          <tr v-if="loading">
            <td :colspan="columnCount" class="py-16 text-center text-ink-muted">Memuat riwayat stok ulang…</td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="columnCount" class="py-16 text-center text-ink-muted">
              {{ error }}
              <button type="button" class="ml-2 font-medium text-link hover:underline" @click="$emit('retry')">Coba lagi</button>
            </td>
          </tr>
          <tr v-else-if="!records.length">
            <td :colspan="columnCount" class="py-16 text-center text-ink-muted">{{ emptyText }}</td>
          </tr>
          <tr v-for="(record, i) in records" v-else :key="record.id" class="transition-colors hover:bg-row-line">
            <td :class="tdClass" class="text-ink-muted">{{ firstIndex + i }}</td>
            <td v-if="showMachine" :class="tdClass">
              <RouterLink
                :to="`/histori-stok-ulang/${encodeURIComponent(record.vmcode)}`"
                class="block font-semibold text-ink-deep hover:text-link hover:underline"
              >
                {{ record.vmcode }}
              </RouterLink>
              <span v-if="record.machine_name" class="block text-xs text-ink-muted">{{ record.machine_name }}</span>
            </td>
            <td :class="tdClass">{{ record.product || '-' }}</td>
            <td :class="tdClass" class="text-center">{{ record.slot ?? '-' }}</td>
            <td :class="tdClass">{{ record.stock_before ?? '-' }}</td>
            <td :class="tdClass">{{ record.stock_after ?? '-' }}</td>
            <td :class="tdClass">{{ formatTime(record.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <EntriesFooter
      v-model:page="page"
      :page-size="pageSize"
      :count="records.length"
      :total="total"
      :total-pages="totalPages"
      :hidden="loading || !!error"
    />
  </section>
</template>
