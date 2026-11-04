<script setup lang="ts">
// Figma: "Levelstock" (250:6322 / 250:6350 / 250:6370) as used in the Stok Vending table (399:12260):
// a 32px pill filled to the stock level, box icon on the left, percentage on the right.
// Empty is a white pill with a red outline and the "dangerous" icon.
import { computed } from 'vue'
import emptyIcon from '@/assets/stock/empty.svg'
import levelIcon from '@/assets/stock/level.svg'
import { stockBand } from '@/utils/stock'

const props = defineProps<{
  /** 0–100, or null when the machine has no capacity set. */
  value: number | null
}>()

const percent = computed(() => (props.value === null ? null : Math.round(Math.min(Math.max(props.value, 0), 100))))

const fillWidth = computed(() => `max(${percent.value}%, 2.75rem)`)

// Same bands as the dashboard's StockProgress.
const fillColor = computed(
  () => ({ low: 'bg-danger', mid: 'bg-warning-light', high: 'bg-success' })[stockBand(percent.value ?? 0)],
)
</script>

<template>
  <div
    class="relative flex h-8 w-full items-center gap-1 overflow-clip rounded-2xl bg-surface px-4 font-inter text-sm font-bold"
    :class="percent === 0 && 'border border-danger'"
    role="meter"
    :aria-valuenow="percent ?? undefined"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="percent === null ? 'Level stok tidak diketahui' : `Level stok ${percent}%`"
  >
    <template v-if="percent === null">
      <span class="relative flex-1 text-right font-medium text-ink-subtle">N/A</span>
    </template>
    <template v-else-if="percent === 0">
      <img :src="emptyIcon" alt="" class="relative shrink-0" />
      <span class="relative flex-1 text-right text-danger">0%</span>
    </template>
    <template v-else>
      <!-- The fill is at least as wide as the icon so it stays visible on low levels. The label is drawn twice:
           black on the empty part, white clipped to the fill, so a boundary through "85%" stays readable. -->
      <span
        class="absolute inset-y-0 left-0"
        :class="[fillColor, percent === 100 ? 'rounded-2xl' : 'rounded-l-2xl']"
        :style="{ width: fillWidth }"
      />
      <span class="absolute inset-0 flex items-center gap-1 px-4 text-black" aria-hidden="true">
        <span class="size-6 shrink-0" />
        <span class="flex-1 text-right">{{ percent }}%</span>
      </span>
      <span
        class="absolute inset-0 flex items-center gap-1 px-4 text-white"
        :style="{ clipPath: `inset(0 calc(100% - ${fillWidth}) 0 0)` }"
        aria-hidden="true"
      >
        <img :src="levelIcon" alt="" class="shrink-0" />
        <span class="flex-1 text-right">{{ percent }}%</span>
      </span>
    </template>
  </div>
</template>
