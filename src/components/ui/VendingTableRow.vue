<script setup lang="ts">
// Figma: Component 9 (11:1328). Renders a <tr>; use inside a <table class="table-fixed">.
import type { IconName } from '@/assets/icons'
import type { VendingMachine, VendingType } from '@/types/vending'
import { formatRupiah } from '@/utils/format'
import AppIcon from './AppIcon.vue'
import IconButton from './IconButton.vue'
import StatusBadge from './StatusBadge.vue'
import StockProgress from './StockProgress.vue'

defineProps<{
  machine: VendingMachine
}>()

defineEmits<{
  actions: [machine: VendingMachine]
}>()

// Machines without a known type use the snack (robot) styling as the generic machine icon.
const typeStyles: Record<VendingType, { icon: IconName; tile: string }> = {
  snack: { icon: 'machine-snack', tile: 'bg-primary-soft' },
  drink: { icon: 'machine-drink', tile: 'bg-surface-muted' },
  coffee: { icon: 'machine-coffee', tile: 'bg-surface-muted' },
}
</script>

<template>
  <tr class="border-b border-surface-muted transition-colors last:border-b-0 hover:bg-surface-muted">
    <td class="py-[16.5px] pl-4">
      <div class="flex items-center gap-4">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl"
          :class="typeStyles[machine.type ?? 'snack'].tile"
        >
          <AppIcon :name="typeStyles[machine.type ?? 'snack'].icon" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-ink-strong">{{ machine.name }}</p>
          <p class="truncate text-xs text-ink-muted">ID: #{{ machine.id }}</p>
        </div>
      </div>
    </td>
    <td class="truncate py-[16.5px] text-sm font-medium text-ink">
      <template v-if="machine.location">{{ machine.location }}</template>
      <span v-else class="text-ink-subtle" title="Data lokasi belum tersedia">—</span>
    </td>
    <td class="py-[16.5px]">
      <StatusBadge :status="machine.status" />
    </td>
    <td class="py-[16.5px]">
      <StockProgress :value="machine.stock" />
    </td>
    <td class="py-[16.5px] text-sm font-bold whitespace-nowrap text-ink-strong">
      <template v-if="machine.revenue !== undefined">{{ formatRupiah(machine.revenue) }}</template>
      <span v-else class="font-medium text-ink-subtle" title="Data penjualan per mesin belum tersedia">—</span>
    </td>
    <td class="py-[16.5px] pr-4">
      <div class="flex justify-end">
        <IconButton :label="`Aksi untuk ${machine.name}`" @click="$emit('actions', machine)" />
      </div>
    </td>
  </tr>
</template>
