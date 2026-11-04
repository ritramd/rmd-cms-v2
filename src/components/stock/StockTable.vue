<script setup lang="ts">
// Figma: table_2 on Stok Vending (1075:13147) — selectable machines, stock level bar, view and download links.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SortHeader from '@/components/ui/SortHeader.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import type { StockMachine } from '@/types/stock'
import StockLevelBar from './StockLevelBar.vue'

const props = defineProps<{
  machines: StockMachine[]
  total: number
  totalPages: number
  /** Where "Lihat" goes for a machine code. */
  detailPath: (code: string) => string
  loading?: boolean
  error?: string | null
  emptyText: string
}>()

defineEmits<{
  retry: []
  download: [machine: StockMachine]
}>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
/** Stock level order: asc = lowest first (the API default). */
const sortDir = defineModel<'asc' | 'desc'>('sortDir', { required: true })
/** Selected machines; kept across pages so one download can span several. */
const selected = defineModel<StockMachine[]>('selected', { required: true })

const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)

const selectedIds = computed(() => new Set(selected.value.map((m) => m.id)))
const selectedOnPage = computed(() => props.machines.filter((m) => selectedIds.value.has(m.id)).length)
const allOnPage = computed(() => props.machines.length > 0 && selectedOnPage.value === props.machines.length)

function toggle(machine: StockMachine, on: boolean) {
  selected.value = on ? [...selected.value, machine] : selected.value.filter((m) => m.id !== machine.id)
}
function toggleAll(on: boolean) {
  const pageIds = new Set(props.machines.map((m) => m.id))
  const others = selected.value.filter((m) => !pageIds.has(m.id))
  selected.value = on ? [...others, ...props.machines] : others
}

/** `isi` is a 0–1 ratio (MySQL decimal, may arrive as a string). */
function level(machine: StockMachine): number | null {
  if (machine.isi === null || machine.isi === '') return null
  const ratio = Number(machine.isi)
  return Number.isNaN(ratio) ? null : ratio * 100
}

const thClass = 'px-6 py-4 text-xs font-semibold tracking-[0.6px] whitespace-nowrap text-ink-placeholder uppercase'
const tdClass = 'px-6 pt-4 pb-[17px] align-middle'
const linkClass =
  'text-sm font-medium text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link'
</script>

<template>
  <section class="rounded-2xl border border-line-faint/50 bg-surface px-8 pt-[29px] pb-6 font-inter shadow-card">
    <EntriesSelect v-model="pageSize" />

    <div class="mt-6 overflow-x-auto">
      <table class="w-full min-w-[960px] table-fixed text-left">
        <colgroup>
          <col class="w-16" />
          <col class="w-[100px]" />
          <col class="w-[14%]" />
          <col />
          <col class="w-[20%]" />
          <col class="w-[11%]" />
          <col class="w-[11%]" />
        </colgroup>
        <thead>
          <tr class="border-b border-line-faint">
            <th scope="col" :class="thClass">
              <AppCheckbox
                :model-value="allOnPage"
                :indeterminate="selectedOnPage > 0 && !allOnPage"
                label="Pilih semua mesin di halaman ini"
                class="align-middle"
                @update:model-value="toggleAll"
              />
            </th>
            <th scope="col" :class="thClass">No</th>
            <th scope="col" :class="thClass">Kode Vending</th>
            <th scope="col" :class="thClass">Lokasi</th>
            <th
              scope="col"
              :class="thClass"
              class="py-3"
              :aria-sort="sortDir === 'asc' ? 'ascending' : 'descending'"
            >
              <SortHeader label="Level Stok" :direction="sortDir" @toggle="sortDir = sortDir === 'asc' ? 'desc' : 'asc'" />
            </th>
            <th scope="col" :class="thClass" class="text-right">Lihat Stok</th>
            <th scope="col" :class="thClass" class="text-right">Download</th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="text-sm">
          <tr v-if="loading">
            <td colspan="7" class="py-16 text-center text-ink-muted">Memuat stok…</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="7" class="py-16 text-center text-ink-muted">
              {{ error }}
              <button type="button" class="ml-2 font-medium text-link hover:underline" @click="$emit('retry')">Coba lagi</button>
            </td>
          </tr>
          <tr v-else-if="!machines.length">
            <td colspan="7" class="py-16 text-center text-ink-muted">{{ emptyText }}</td>
          </tr>
          <tr v-for="(machine, i) in machines" v-else :key="machine.id" class="transition-colors hover:bg-row-line">
            <td :class="tdClass">
              <AppCheckbox
                :model-value="selectedIds.has(machine.id)"
                :label="`Pilih ${machine.vmcode}`"
                class="align-middle"
                @update:model-value="toggle(machine, $event)"
              />
            </td>
            <td :class="tdClass" class="text-ink-muted">{{ firstIndex + i }}</td>
            <td :class="tdClass" class="truncate text-ink-deep">{{ machine.vmcode }}</td>
            <td :class="tdClass" class="text-ink-deep">{{ machine.name || '-' }}</td>
            <td :class="tdClass"><StockLevelBar :value="level(machine)" /></td>
            <td :class="tdClass" class="text-right">
              <RouterLink :to="detailPath(machine.vmcode)" :class="linkClass">Lihat</RouterLink>
            </td>
            <td :class="tdClass" class="text-right">
              <button type="button" :class="linkClass" @click="$emit('download', machine)">Download</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EntriesFooter
      v-model:page="page"
      :page-size="pageSize"
      :count="machines.length"
      :total="total"
      :total-pages="totalPages"
      :hidden="loading || !!error"
    />
  </section>
</template>
