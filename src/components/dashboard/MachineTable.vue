<script setup lang="ts">
// Figma: Daftar Mesin card (1097:42364)
import { computed, ref, watch } from 'vue'
import sortIcon from '@/assets/table/sort.svg'
import AppButton from '@/components/ui/AppButton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import VendingTableRow from '@/components/ui/VendingTableRow.vue'
import type { VendingMachine, VendingStatus } from '@/types/vending'

const props = withDefaults(
  defineProps<{
    machines: VendingMachine[]
    pageSize?: number
    loading?: boolean
    error?: string | null
  }>(),
  { pageSize: 4 },
)

defineEmits<{
  filter: []
  download: []
  retry: []
  actions: [machine: VendingMachine]
}>()

type SortKey = 'status' | 'stock'
const sortKey = ref<SortKey | null>(null)
const sortDir = ref<1 | -1>(1)
const page = ref(1)

const statusOrder: Record<VendingStatus, number> = { online: 0, maintenance: 1, offline: 2 }

function toggleSort(key: SortKey) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 1 ? -1 : 1
  else {
    sortKey.value = key
    sortDir.value = 1
  }
}

const sorted = computed(() => {
  const key = sortKey.value
  if (!key) return props.machines
  const value = (m: VendingMachine) => (key === 'status' ? statusOrder[m.status] : (m.stock ?? -1))
  return [...props.machines].sort((a, b) => (value(a) - value(b)) * sortDir.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / props.pageSize)))
const pageRows = computed(() => sorted.value.slice((page.value - 1) * props.pageSize, page.value * props.pageSize))
const rangeLabel = computed(() => {
  const total = sorted.value.length
  if (!total) return 'Tidak ada hasil'
  const start = (page.value - 1) * props.pageSize + 1
  return `Menampilkan ${start}-${start + pageRows.value.length - 1} dari ${total} hasil`
})

// Back to the first page whenever the list changes (e.g. a new search).
watch(() => props.machines, () => (page.value = 1))

const columns: { label: string; sort?: SortKey; width: string; class?: string }[] = [
  { label: 'Nama Mesin', width: 'w-[27%]', class: 'pl-4' },
  { label: 'Lokasi', width: 'w-[14%]' },
  { label: 'Status', sort: 'status', width: 'w-[15%]' },
  { label: 'Kapasitas Stok', sort: 'stock', width: 'w-[18%]' },
  { label: 'Penjualan Hari Ini', width: 'w-[18%]' },
  { label: 'Aksi', width: 'w-[8%]', class: 'pr-4 text-right' },
]

function ariaSort(key?: SortKey) {
  if (!key) return undefined
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 1 ? 'ascending' : 'descending'
}
</script>

<template>
  <section class="rounded-[40px] border border-white bg-surface p-8 shadow-card">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-xl font-bold text-ink-strong">Daftar Mesin</h2>
        <p class="text-sm text-ink-muted"><slot name="subtitle" /></p>
      </div>
      <div class="flex gap-3">
        <AppButton icon="filter" @click="$emit('filter')">Filter</AppButton>
        <AppButton icon="download" @click="$emit('download')">Download</AppButton>
      </div>
    </div>

    <div class="mt-8 overflow-x-auto">
      <table class="w-full min-w-[960px] table-fixed text-left">
        <colgroup>
          <col v-for="col in columns" :key="col.label" :class="col.width" />
        </colgroup>
        <thead>
          <tr class="border-b border-line-soft">
            <th
              v-for="col in columns"
              :key="col.label"
              scope="col"
              :aria-sort="ariaSort(col.sort)"
              class="pb-4 text-xs font-semibold tracking-[0.6px] text-ink-subtle uppercase"
              :class="col.class"
            >
              <button
                v-if="col.sort"
                type="button"
                class="inline-flex items-center uppercase hover:text-ink-muted focus-visible:outline-2 focus-visible:outline-primary"
                @click="toggleSort(col.sort)"
              >
                {{ col.label }}
                <img :src="sortIcon" alt="" />
              </button>
              <span v-else class="inline-block py-1">{{ col.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody :aria-busy="loading">
          <tr v-if="loading">
            <td :colspan="columns.length" class="py-12 text-center text-sm text-ink-muted">Memuat data mesin…</td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="columns.length" class="py-12 text-center text-sm text-ink-muted">
              {{ error }}
              <button type="button" class="ml-2 font-bold text-primary hover:underline" @click="$emit('retry')">
                Coba lagi
              </button>
            </td>
          </tr>
          <template v-else>
            <VendingTableRow
              v-for="machine in pageRows"
              :key="machine.id"
              :machine="machine"
              @actions="$emit('actions', $event)"
            />
            <tr v-if="!pageRows.length">
              <td :colspan="columns.length" class="py-12 text-center text-sm text-ink-muted">Tidak ada mesin yang cocok.</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line-soft pt-6">
      <span class="text-sm text-ink-muted">{{ loading || error ? '' : rangeLabel }}</span>
      <AppPagination v-if="!loading && !error && totalPages > 1" v-model:page="page" :total-pages="totalPages" />
    </div>
  </section>
</template>
