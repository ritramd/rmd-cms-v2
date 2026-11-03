<script setup lang="ts">
// Figma: Component 6, variants 2–3 (page numbers) and Component 8, variants 2–3 (prev/next)
import AppIcon from './AppIcon.vue'

defineProps<{
  kind: 'page' | 'prev' | 'next'
  page?: number
  active?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-current="active ? 'page' : undefined"
    :aria-label="kind === 'prev' ? 'Halaman sebelumnya' : kind === 'next' ? 'Halaman berikutnya' : `Halaman ${page}`"
    class="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    :class="
      active
        ? 'bg-primary font-bold text-white shadow-primary-sm'
        : 'border border-line font-medium text-ink-muted enabled:hover:bg-surface-muted'
    "
  >
    <AppIcon v-if="kind === 'prev'" name="chevron-left" />
    <AppIcon v-else-if="kind === 'next'" name="chevron-right" />
    <template v-else>{{ page }}</template>
  </button>
</template>
