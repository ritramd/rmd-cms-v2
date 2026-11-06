<script setup lang="ts">
// Figma: Flashsale Rules Table (1097:22366 / 1097:39795 / 1097:39917)
import { computed, ref } from 'vue'
import ProductPagination from '@/components/products/ProductPagination.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { FlashsaleRule } from '@/types/flashsale'

const props = defineProps<{
  rules: FlashsaleRule[]
  total: number
  totalPages: number
  loading?: boolean
}>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const emit = defineEmits<{
  addItem: [rule: FlashsaleRule]
  edit: [rule: FlashsaleRule]
  selectRule: [rule: FlashsaleRule]
}>()

const filterDay = ref('')
const selectedIds = ref<number[]>([1, 2, 7, 8])

const filteredRules = computed(() => {
  if (!filterDay.value) return props.rules
  return props.rules.filter((r) =>
    r.days.some((d) => d.toLowerCase().includes(filterDay.value.toLowerCase())),
  )
})

const allSelected = computed(
  () => filteredRules.value.length > 0 && filteredRules.value.every((r) => selectedIds.value.includes(r.id)),
)

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredRules.value.map((r) => r.id)
  }
}

function toggleRow(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const pageSizes = [10, 25, 50, 100]
const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)
const summary = computed(() => {
  const count = filteredRules.value.length
  if (!count) return 'No flashsales'
  return `Showing ${firstIndex.value} to ${firstIndex.value + count - 1} of ${props.total || count} flashsales`
})

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <section class="overflow-clip rounded-3xl border border-line bg-surface font-inter shadow-[0_2px_4px_rgb(0_0_0/0.02),0_1px_2px_rgb(0_0_0/0.03)]">
    <!-- Table Filters / Utility (1097:22384) -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-surface-muted px-8 pt-6 pb-6">
      <label class="flex items-center gap-4 text-sm text-ink-soft">
        Show
        <span class="relative">
          <select
            v-model.number="pageSize"
            class="h-[30px] min-w-11 appearance-none rounded-lg border border-line bg-surface-muted pr-5 pl-[5px] text-sm text-ink-navy cursor-pointer"
          >
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
          <AppIcon name="line-chevron-down" class="pointer-events-none absolute top-1/2 right-1 size-4 -translate-y-1/2" />
        </span>
        entries
      </label>

      <label class="relative flex items-center gap-2 text-sm text-ink-subtle hover:text-ink-navy cursor-pointer">
        <AppIcon name="line-filter" />
        <span class="font-medium">{{ filterDay ? `Hari: ${filterDay}` : 'Filter Flashsale' }}</span>
        <select v-model="filterDay" class="absolute inset-0 cursor-pointer opacity-0" aria-label="Filter Flashsale">
          <option value="">Semua Flashsale</option>
          <option value="Senin">Senin</option>
          <option value="Selasa">Selasa</option>
          <option value="Rabu">Rabu</option>
          <option value="Kamis">Kamis</option>
          <option value="Jumat">Jumat</option>
          <option value="Sabtu">Sabtu</option>
          <option value="Minggu">Minggu</option>
        </select>
      </label>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto">
      <table class="w-full min-w-[1040px] text-left">
        <thead class="bg-surface-muted/50">
          <tr class="border-b border-line">
            <th scope="col" class="w-12 px-6 pt-5 pb-5">
              <AppCheckbox label="Pilih semua flashsale" :model-value="allSelected" @update:model-value="toggleAll" />
            </th>
            <th scope="col" class="px-6 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase">
              No
            </th>
            <th scope="col" class="px-6 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase">
              Flashsale Name
            </th>
            <th scope="col" class="px-6 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase">
              Days Applied
            </th>
            <th scope="col" class="px-6 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase">
              Start Date
            </th>
            <th scope="col" class="px-6 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase">
              End Date
            </th>
            <th scope="col" class="px-6 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase">
              Start Time
            </th>
            <th scope="col" class="px-6 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase">
              End Time
            </th>
            <th scope="col" class="px-6 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase">
              Discount
            </th>
            <th scope="col" class="px-6 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="divide-y divide-surface-muted font-inter text-sm">
          <tr v-if="loading">
            <td colspan="10" class="py-16 text-center text-sm text-ink-soft">Memuat data flashsale…</td>
          </tr>
          <tr v-else-if="!filteredRules.length">
            <td colspan="10" class="py-16 text-center text-sm text-ink-soft">Belum ada aturan flashsale yang cocok.</td>
          </tr>
          <template v-else>
            <tr
              v-for="(rule, idx) in filteredRules"
              :key="rule.id"
              class="border-t border-surface-muted font-inter text-sm transition-colors first:border-t-0 hover:bg-surface-muted/30"
              :class="selectedIds.includes(rule.id) && 'bg-blue-50/10'"
            >
              <td class="px-6 py-5">
                <AppCheckbox
                  :label="`Pilih flashsale ${rule.name}`"
                  :model-value="selectedIds.includes(rule.id)"
                  @update:model-value="toggleRow(rule.id)"
                />
              </td>
              <td class="px-6 py-5 text-ink-subtle">
                {{ firstIndex + idx }}
              </td>
              <td class="px-6 py-5 font-semibold text-ink-heading hover:text-primary transition-colors cursor-pointer" @click="emit('selectRule', rule)">
                {{ rule.name }}
              </td>
              <td class="px-6 py-5 text-xs text-ink-soft">
                {{ rule.days.join(', ') }}
              </td>
              <td class="px-6 py-5 text-xs text-ink-soft">
                {{ formatDate(rule.startDate) }}
              </td>
              <td class="px-6 py-5 text-xs text-ink-soft">
                {{ formatDate(rule.endDate) }}
              </td>
              <td class="px-6 py-5 text-xs text-ink-soft">
                {{ rule.startTime }} WIB
              </td>
              <td class="px-6 py-5 text-xs text-ink-soft">
                {{ rule.endTime }} WIB
              </td>
              <td class="px-6 py-5 font-semibold text-ink-navy">
                {{ rule.discountValue }}%
              </td>
              <td class="px-6 py-5 text-center">
                <div class="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    class="rounded-lg px-2.5 py-1 text-xs font-semibold text-brand hover:bg-primary-soft transition-colors cursor-pointer"
                    @click="emit('addItem', rule)"
                  >
                    + Add Item
                  </button>
                  <button
                    type="button"
                    class="rounded-lg px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-surface-muted transition-colors cursor-pointer"
                    @click="emit('edit', rule)"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Footer Pagination (1097:22416) -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-surface-muted/20 px-8 py-6">
      <p class="text-xs text-ink-soft">{{ loading ? '' : summary }}</p>
      <ProductPagination v-if="!loading && totalPages > 1" v-model:page="page" :total-pages="totalPages" />
    </div>
  </section>
</template>
