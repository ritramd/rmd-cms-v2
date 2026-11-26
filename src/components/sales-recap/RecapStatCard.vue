<script setup lang="ts">
// Summary figure above the recap tables (v1 sales-recap summary boxes). Not in Figma; card tokens as the
// dashboard cards.
defineProps<{
  label: string
  value: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1 rounded-2xl border border-line-faint/50 bg-surface px-6 py-5 font-inter shadow-card">
    <span class="text-xs font-semibold tracking-[0.6px] text-ink-placeholder uppercase">{{ label }}</span>
    <span class="text-xl font-bold text-ink-strong">{{ value }}</span>
  </div>
</template>
