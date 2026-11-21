<script setup lang="ts">
// Figma: 7.10-D-Vending Sales-almost expired (1097:27019, 1097:27164)
// Table container for Almost Expired vending machines list
import type { AlmostExpiredMachine } from '@/types/almostExpired'
import AlmostExpiredMachineTableRow from './AlmostExpiredMachineTableRow.vue'

withDefaults(
  defineProps<{
    machines: AlmostExpiredMachine[]
    loading?: boolean
    startIndex?: number
  }>(),
  {
    loading: false,
    startIndex: 1,
  },
)
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left font-inter">
      <thead>
        <tr class="border-b border-[#f1f5f9]">
          <th
            scope="col"
            class="w-[83px] px-6 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            No
          </th>
          <th
            scope="col"
            class="w-[182px] px-6 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            Vending Code
          </th>
          <th
            scope="col"
            class="px-6 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            Location
          </th>
          <th
            scope="col"
            class="px-6 py-4 text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            Jumlah Item
          </th>
          <th
            scope="col"
            class="w-[142px] px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.6px] text-ink-placeholder"
          >
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading skeletons -->
        <template v-if="loading">
          <tr v-for="n in 5" :key="'skeleton-' + n" class="border-t border-[#f8fafc] animate-pulse">
            <td class="px-6 py-4"><div class="h-4 w-6 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4"><div class="h-4 w-28 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4"><div class="h-4 w-64 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4"><div class="h-4 w-12 rounded bg-surface-muted" /></td>
            <td class="px-6 py-4 text-right"><div class="ml-auto h-4 w-12 rounded bg-surface-muted" /></td>
          </tr>
        </template>

        <!-- Data rows -->
        <template v-else-if="machines.length > 0">
          <AlmostExpiredMachineTableRow
            v-for="(machine, index) in machines"
            :key="machine.code"
            :machine="machine"
            :index="startIndex + index"
          />
        </template>

        <!-- Empty state -->
        <tr v-else>
          <td colspan="5" class="py-12 text-center text-sm text-ink-muted">
            Tidak ada vending machine dengan item hampir kedaluwarsa.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
