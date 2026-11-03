<script setup lang="ts">
// Figma: status pill inside Component 9 (e.g. 11:1001, 11:1062, 11:1182)
import type { VendingStatus } from '@/types/vending'

defineProps<{
  status: VendingStatus
}>()

const styles: Record<VendingStatus, { label: string; pill: string; dot: string }> = {
  online: { label: 'Online', pill: 'bg-success-soft text-success-strong', dot: 'bg-success' },
  offline: { label: 'Offline', pill: 'bg-danger-soft text-danger-strong', dot: 'bg-danger' },
  maintenance: { label: 'Maintenance', pill: 'bg-warning-soft text-warning-strong', dot: 'bg-warning' },
}
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold" :class="styles[status].pill">
    <span class="size-1.5 shrink-0 rounded-full" :class="styles[status].dot" />
    {{ styles[status].label }}
  </span>
</template>
