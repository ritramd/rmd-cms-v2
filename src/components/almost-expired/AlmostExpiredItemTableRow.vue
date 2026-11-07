<script setup lang="ts">
// Figma: 7.11-D-Vending Sales-almost expired-detail (1097:30280, 1097:30431)
// Row in Almost Expired Item detail table with checkbox, thumbnail, price, expiry date, and edit button
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import defaultProductImg from '@/assets/demo/face-scrub.png'
import { formatRupiah } from '@/utils/format'
import type { AlmostExpiredItem } from '@/types/almostExpired'

const props = defineProps<{
  item: AlmostExpiredItem
  index: number
  selected?: boolean
}>()

const emit = defineEmits<{
  'update:selected': [selected: boolean]
  edit: [item: AlmostExpiredItem]
  toggleStatus: [item: AlmostExpiredItem]
}>()

function onCheckboxChange(val: boolean) {
  emit('update:selected', val)
}
</script>

<template>
  <tr class="border-t border-[#f8fafc] transition-colors hover:bg-surface-muted/50 font-inter">
    <!-- Select checkbox -->
    <td class="w-16 px-6 py-4">
      <AppCheckbox
        :model-value="selected"
        :label="`Pilih item ${item.name}`"
        @update:model-value="onCheckboxChange"
      />
    </td>

    <!-- No -->
    <td class="w-14 px-4 py-4 text-sm font-normal text-ink-muted">
      {{ index }}
    </td>

    <!-- Photo -->
    <td class="w-20 px-4 py-4">
      <div class="size-[46px] overflow-hidden rounded-lg border border-line-soft bg-surface-muted p-1">
        <img
          :src="item.photo || defaultProductImg"
          :alt="item.name"
          class="size-full object-contain pointer-events-none"
        />
      </div>
    </td>

    <!-- Product Name -->
    <td class="min-w-[220px] px-6 py-4 text-sm font-normal text-ink">
      {{ item.name }}
    </td>

    <!-- Price -->
    <td class="w-36 px-6 py-4 text-sm font-normal text-ink whitespace-nowrap">
      {{ formatRupiah(item.price) }}
    </td>

    <!-- EXPIRED -->
    <td class="w-44 px-6 py-4 text-sm font-normal text-ink whitespace-nowrap">
      {{ item.expiredDate }}
    </td>

    <!-- STATUS -->
    <td class="w-24 px-6 py-4 text-sm font-normal text-ink">
      <span v-if="item.status" class="inline-flex items-center text-ink-muted">-</span>
      <span v-else class="inline-flex items-center text-ink-placeholder">Non-aktif</span>
    </td>

    <!-- Action: Edit Pencil button -->
    <td class="w-24 px-6 py-4 text-right">
      <button
        type="button"
        title="Edit Item"
        aria-label="Edit Item"
        class="inline-flex size-9 items-center justify-center rounded-xl bg-[#f7f9fc] text-ink-muted drop-shadow-xs transition hover:bg-surface-muted hover:text-ink-strong focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
        @click="emit('edit', item)"
      >
        <AppIcon name="line-pencil" class="size-4" />
      </button>
    </td>
  </tr>
</template>
