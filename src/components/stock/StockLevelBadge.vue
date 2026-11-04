<script setup lang="ts">
// Figma: machine stock level next to the filters on Histori Stok Ulang (1097:34144) — dot and percentage
// in the level's color (orange in the design).
import { computed } from 'vue'
import dotIcon from '@/assets/stock/level-dot.svg'
import TintedIcon from '@/components/ui/TintedIcon.vue'
import { stockBand } from '@/utils/stock'

const props = defineProps<{
  /** 0–100. */
  value: number
}>()

const percent = computed(() => Math.round(Math.min(Math.max(props.value, 0), 100)))
const band = computed(() => stockBand(percent.value))
const colors = {
  low: ['bg-danger', 'text-danger'],
  mid: ['bg-warning', 'text-warning'],
  high: ['bg-success', 'text-success'],
} as const
</script>

<template>
  <span class="inline-flex items-center gap-1 font-inter text-sm/[21px] font-bold" :title="`Level stok saat ini ${percent}%`">
    <TintedIcon :src="dotIcon" :color="colors[band][0]" class="size-[18px] shrink-0" />
    <span :class="colors[band][1]">{{ percent }}%</span>
    <span class="sr-only">level stok saat ini</span>
  </span>
</template>
