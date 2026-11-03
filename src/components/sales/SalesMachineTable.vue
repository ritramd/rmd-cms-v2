<script setup lang="ts">
// Figma: machine table on Penjualan (1097:20291) — "Show N entries", selectable rows, entries summary and pagination.
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import type { SalesMachine } from '@/types/sales'

const props = defineProps<{
  machines: SalesMachine[]
  total: number
  totalPages: number
  /** Where "Lihat Detail" goes for a machine code. */
  detailPath: (code: string) => string
  /** Machine id whose single download is running. */
  downloadingId?: number | null
  loading?: boolean
  error?: string | null
}>()

defineEmits<{
  retry: []
  download: [machine: SalesMachine]
}>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
/** Selected machines; kept across pages so a download can span several. */
const selected = defineModel<SalesMachine[]>('selected', { required: true })

const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)

const selectedIds = computed(() => new Set(selected.value.map((m) => m.id)))
const selectedOnPage = computed(() => props.machines.filter((m) => selectedIds.value.has(m.id)).length)
const allOnPage = computed(() => props.machines.length > 0 && selectedOnPage.value === props.machines.length)

function toggle(machine: SalesMachine, on: boolean) {
  selected.value = on ? [...selected.value, machine] : selected.value.filter((m) => m.id !== machine.id)
}
function toggleAll(on: boolean) {
  const pageIds = new Set(props.machines.map((m) => m.id))
  const others = selected.value.filter((m) => !pageIds.has(m.id))
  selected.value = on ? [...others, ...props.machines] : others
}

const thClass = 'px-6 py-4 text-xs font-semibold tracking-[0.6px] text-ink-placeholder uppercase'
const linkClass =
  'text-sm font-medium text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link disabled:cursor-wait disabled:opacity-60'
</script>

<template>
  <section class="rounded-2xl border border-line-faint/50 bg-surface px-8 pt-[29px] pb-6 font-inter shadow-card">
    <EntriesSelect v-model="pageSize" />

    <div class="mt-6 overflow-x-auto">
      <table class="w-full min-w-[878px] table-fixed text-left">
        <colgroup>
          <col class="w-16" />
          <col class="w-[8.5%]" />
          <col class="w-[18.5%]" />
          <col />
          <col class="w-[14.5%]" />
          <col class="w-[14.5%]" />
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
            <th scope="col" :class="thClass">Vending Code</th>
            <th scope="col" :class="thClass">Location</th>
            <th scope="col" :class="thClass" class="text-right">Download</th>
            <th scope="col" :class="thClass" class="text-right">Action</th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="text-sm">
          <tr v-if="loading">
            <td colspan="6" class="py-16 text-center text-ink-muted">Memuat mesin…</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="6" class="py-16 text-center text-ink-muted">
              {{ error }}
              <button type="button" class="ml-2 font-medium text-link hover:underline" @click="$emit('retry')">Coba lagi</button>
            </td>
          </tr>
          <tr v-else-if="!machines.length">
            <td colspan="6" class="py-16 text-center text-ink-muted">Tidak ada mesin yang cocok.</td>
          </tr>
          <tr
            v-for="(machine, i) in machines"
            v-else
            :key="machine.id"
            class="border-t border-row-line transition-colors first:border-t-0 hover:bg-row-line"
          >
            <td class="px-6 py-4 align-top">
              <AppCheckbox
                :model-value="selectedIds.has(machine.id)"
                :label="`Pilih ${machine.code}`"
                class="align-middle"
                @update:model-value="toggle(machine, $event)"
              />
            </td>
            <td class="px-6 py-4 text-ink-muted">{{ firstIndex + i }}</td>
            <td class="truncate px-6 py-4 font-semibold text-ink-deep">{{ machine.code }}</td>
            <td class="truncate px-6 py-4 text-ink" :title="machine.name ?? undefined">{{ machine.name || '-' }}</td>
            <td class="px-6 py-4 text-right">
              <button
                type="button"
                :class="linkClass"
                :disabled="downloadingId === machine.id"
                @click="$emit('download', machine)"
              >
                {{ downloadingId === machine.id ? 'Mengunduh…' : 'Download' }}
              </button>
            </td>
            <td class="px-6 py-4 text-right">
              <RouterLink :to="detailPath(machine.code)" :class="linkClass">Lihat Detail</RouterLink>
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
