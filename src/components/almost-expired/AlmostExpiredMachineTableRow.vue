<script setup lang="ts">
// Figma: 7.10-D-Vending Sales-almost expired (1097:27019, 1097:27181)
// Row in Almost Expired vending machines table
import { RouterLink } from 'vue-router'
import type { AlmostExpiredMachine } from '@/types/almostExpired'

defineProps<{
  machine: AlmostExpiredMachine
  index: number
}>()
</script>

<template>
  <tr class="border-t border-[#f8fafc] transition-colors hover:bg-surface-muted/50 font-inter">
    <!-- No -->
    <td class="w-[83px] px-6 py-4 text-sm font-normal text-ink-muted">
      {{ index }}
    </td>

    <!-- Vending Code -->
    <td class="w-[182px] px-6 py-4 text-sm font-semibold text-ink-heading">
      {{ machine.code }}
    </td>

    <!-- Location -->
    <td class="px-6 py-4 text-sm font-normal text-ink">
      {{ machine.location }}
    </td>

    <!-- Jumlah Item -->
    <td class="px-6 py-4 text-sm font-normal text-ink">
      {{ machine.totalItem }}
    </td>

    <!-- Action -->
    <td class="w-[142px] px-6 py-4 text-right">
      <RouterLink
        :to="{ name: 'almost-expired-detail', params: { machine: machine.code } }"
        class="inline-flex items-center justify-end text-sm font-medium text-[#4f46e5] hover:text-primary-hover hover:underline transition-colors"
      >
        View
      </RouterLink>
    </td>
  </tr>
</template>
