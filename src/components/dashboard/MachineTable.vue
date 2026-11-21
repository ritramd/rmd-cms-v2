<script setup lang="ts">
// Figma: Daftar Mesin card (1097:42364)
import { computed, ref, watch } from 'vue'
import sortIcon from '@/assets/table/sort.svg'
import MachineFilterPopover from '@/components/dashboard/MachineFilterPopover.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import VendingTableRow from '@/components/ui/VendingTableRow.vue'
import type { MachineFilterOptions, StockFilterRange, VendingMachine, VendingStatus, VendingType } from '@/types/vending'

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

const filters = defineModel<MachineFilterOptions>('filters', {
  default: () => ({ status: 'all', stockRange: 'all', type: 'all' }),
})
const filterOpen = ref(false)

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.status !== 'all') count++
  if (filters.value.stockRange !== 'all') count++
  if (filters.value.type !== 'all') count++
  return count
})

function statusLabel(s: VendingStatus | 'all') {
  if (s === 'online') return 'Online'
  if (s === 'offline') return 'Offline'
  if (s === 'maintenance') return 'Maintenance'
  return 'Semua'
}

function stockLabel(r: StockFilterRange) {
  if (r === 'critical') return '< 40%'
  if (r === 'medium') return '40%–70%'
  if (r === 'safe') return '> 70%'
  return 'Semua'
}

function typeLabel(t: VendingType | 'all') {
  if (t === 'snack') return 'Snack'
  if (t === 'drink') return 'Minuman'
  if (t === 'coffee') return 'Kopi'
  return 'Semua'
}

function resetFilters() {
  filters.value = { status: 'all', stockRange: 'all', type: 'all' }
}

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

// Back to the first page whenever the list changes (e.g. a new search or filter).
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
      <div class="flex items-center gap-3">
        <!-- Interactive Filter Popover matching Figma Component 7 -->
        <MachineFilterPopover
          v-model="filters"
          v-model:open="filterOpen"
          @reset="resetFilters"
        >
          <template #default="{ toggle }">
            <AppButton
              :icon="activeFilterCount > 0 ? 'filter-active' : 'filter'"
              :variant="activeFilterCount > 0 ? 'primary' : 'secondary'"
              :aria-expanded="filterOpen"
              @click="toggle"
            >
              Filter
              <span
                v-if="activeFilterCount > 0"
                class="ml-0.5 flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary"
              >
                {{ activeFilterCount }}
              </span>
            </AppButton>
          </template>
        </MachineFilterPopover>
        <AppButton icon="download" @click="$emit('download')">Download</AppButton>
      </div>
    </div>

    <!-- Active filter chips -->
    <div v-if="activeFilterCount > 0" class="mt-4 flex flex-wrap items-center gap-2">
      <span class="text-xs font-medium text-ink-muted">Filter aktif:</span>
      <span
        v-if="filters.status !== 'all'"
        class="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
      >
        Status: {{ statusLabel(filters.status) }}
        <button
          type="button"
          class="cursor-pointer text-primary hover:text-primary-hover"
          aria-label="Hapus filter status"
          @click="filters.status = 'all'"
        >
          ✕
        </button>
      </span>
      <span
        v-if="filters.stockRange !== 'all'"
        class="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
      >
        Stok: {{ stockLabel(filters.stockRange) }}
        <button
          type="button"
          class="cursor-pointer text-primary hover:text-primary-hover"
          aria-label="Hapus filter stok"
          @click="filters.stockRange = 'all'"
        >
          ✕
        </button>
      </span>
      <span
        v-if="filters.type !== 'all'"
        class="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary"
      >
        Tipe: {{ typeLabel(filters.type) }}
        <button
          type="button"
          class="cursor-pointer text-primary hover:text-primary-hover"
          aria-label="Hapus filter tipe"
          @click="filters.type = 'all'"
        >
          ✕
        </button>
      </span>
      <button
        type="button"
        class="text-xs font-semibold text-danger hover:underline cursor-pointer"
        @click="resetFilters"
      >
        Reset Semua
      </button>
    </div>

    <div class="mt-8 overflow-x-auto pb-16">
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
              v-for="(machine, index) in pageRows"
              :key="machine.id"
              :machine="machine"
              :is-upward="index >= 2"
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
