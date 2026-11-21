<script setup lang="ts">
// Figma: 7.11-D-Vending Sales-almost expired-detail (1097:30280, 1097:30410)
// Table container for Almost Expired Items detail view
import { computed } from 'vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import AlmostExpiredItemTableRow from './AlmostExpiredItemTableRow.vue'
import type { AlmostExpiredItem } from '@/types/almostExpired'

const props = withDefaults(
  defineProps<{
    items: AlmostExpiredItem[]
    selectedIds: number[]
    loading?: boolean
    startIndex?: number
  }>(),
  {
    loading: false,
    startIndex: 1,
  },
)

const emit = defineEmits<{
  'update:selectedIds': [ids: number[]]
  edit: [item: AlmostExpiredItem]
}>()

const allSelected = computed(() => {
  if (props.items.length === 0) return false
  return props.items.every((item) => props.selectedIds.includes(item.id))
})

const isIndeterminate = computed(() => {
  if (props.items.length === 0) return false
  const selectedCount = props.items.filter((item) => props.selectedIds.includes(item.id)).length
  return selectedCount > 0 && selectedCount < props.items.length
})

function toggleSelectAll(checked: boolean) {
  if (checked) {
    const allIds = Array.from(new Set([...props.selectedIds, ...props.items.map((i) => i.id)]))
    emit('update:selectedIds', allIds)
  } else {
    const itemIds = new Set(props.items.map((i) => i.id))
    const remaining = props.selectedIds.filter((id) => !itemIds.has(id))
    emit('update:selectedIds', remaining)
  }
}

function toggleItemSelection(id: number, selected: boolean) {
  if (selected) {
    if (!props.selectedIds.includes(id)) {
      emit('update:selectedIds', [...props.selectedIds, id])
    }
  } else {
    emit(
      'update:selectedIds',
      props.selectedIds.filter((itemId) => itemId !== id),
    )
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[960px] border-collapse text-left font-inter">
      <thead>
        <tr class="border-b border-[#f1f5f9]">
          <!-- Select all checkbox -->
          <th scope="col" class="w-16 px-6 py-4">
            <AppCheckbox
              :model-value="allSelected"
              :indeterminate="isIndeterminate"
              label="Pilih semua item"
              @update:model-value="toggleSelectAll"
            />
          </th>
          <th
            scope="col"
            class="w-14 px-4 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            No
          </th>
          <th
            scope="col"
            class="w-20 px-4 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            Photo
          </th>
          <th
            scope="col"
            class="min-w-[220px] px-6 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            Product Name
          </th>
          <th
            scope="col"
            class="w-36 px-6 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            Price
          </th>
          <th
            scope="col"
            class="w-44 px-6 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            EXPIRED
          </th>
          <th
            scope="col"
            class="w-24 px-6 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            STATUS
          </th>
          <th
            scope="col"
            class="w-24 px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading skeletons -->
        <template v-if="loading">
          <tr v-for="n in 5" :key="'skeleton-' + n" class="border-t border-[#f8fafc] animate-pulse">
            <td class="px-6 py-4"><div class="size-4 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4"><div class="h-4 w-6 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4"><div class="size-11 rounded-lg bg-surface-muted" /></td>
            <td class="px-6 py-4"><div class="h-4 w-52 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4"><div class="h-4 w-24 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4"><div class="h-4 w-32 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4"><div class="h-4 w-8 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4 text-right"><div class="ml-auto size-9 rounded-xl bg-surface-muted" /></td>
          </tr>
        </template>

        <!-- Data rows -->
        <template v-else-if="items.length > 0">
          <AlmostExpiredItemTableRow
            v-for="(item, index) in items"
            :key="item.id"
            :item="item"
            :index="startIndex + index"
            :selected="selectedIds.includes(item.id)"
            @update:selected="(val) => toggleItemSelection(item.id, val)"
            @edit="emit('edit', item)"
          />
        </template>

        <!-- Empty state -->
        <tr v-else>
          <td colspan="8" class="py-12 text-center text-sm text-ink-muted">
            Tidak ada produk yang mendekati kedaluwarsa pada vending machine ini.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
