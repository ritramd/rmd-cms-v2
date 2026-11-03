<script setup lang="ts">
// Figma: stock bar inside Component 9 (11:1006); colors follow the final dashboard (1097:42239).
import { computed } from 'vue'
import { LOW_STOCK_PERCENT } from '@/utils/stock'

const props = defineProps<{
  /** 0–100, or null when unknown. */
  value: number | null
}>()

const percent = computed(() => (props.value === null ? null : Math.round(Math.min(Math.max(props.value, 0), 100))))

// Dashboard samples: 32% red, 49% orange, 85% / 95% green.
const barColor = computed(() => {
  const p = percent.value ?? 0
  return p < LOW_STOCK_PERCENT ? 'bg-danger' : p < 70 ? 'bg-warning-light' : 'bg-success'
})
</script>

<template>
  <div class="flex items-center gap-2">
    <div
      class="h-1.5 w-24 shrink-0 overflow-clip rounded-full bg-surface-hover"
      role="progressbar"
      :aria-valuenow="percent ?? undefined"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div v-if="percent !== null" class="h-full rounded-full" :class="barColor" :style="{ width: `${percent}%` }" />
    </div>
    <span class="text-xs font-bold" :class="percent === null ? 'text-ink-subtle' : 'text-ink'">
      {{ percent === null ? 'N/A' : `${percent}%` }}
    </span>
  </div>
</template>
