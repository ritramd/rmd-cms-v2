<script setup lang="ts">
// Figma: "Show 10 entries" above the Penjualan tables (1097:20293, 1097:33490).
import AppIcon from './AppIcon.vue'

withDefaults(defineProps<{ sizes?: number[] }>(), { sizes: () => [10, 25, 50, 100] })

const pageSize = defineModel<number>({ required: true })
</script>

<template>
  <label class="flex items-center gap-2 font-inter text-sm text-ink-muted">
    Show
    <span class="relative">
      <select
        v-model.number="pageSize"
        class="h-[30px] w-[41px] cursor-pointer appearance-none rounded-md border border-cta-border bg-surface pl-3 text-xs font-medium text-ink-heading"
      >
        <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
      </select>
      <AppIcon name="line-select-chevron" class="pointer-events-none absolute top-1/2 right-[-2px] -translate-y-1/2" />
    </span>
    entries
  </label>
</template>
