<script setup lang="ts">
// Figma: Component 2, variant 1 (4:848 / 4:852)
import AppIcon from '@/components/ui/AppIcon.vue'

withDefaults(
  defineProps<{
    label?: string
  }>(),
  { label: 'Kembali' },
)
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    class="group flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <AppIcon name="arrow-back" class="group-hover:hidden" />
    <AppIcon name="arrow-back-active" class="hidden group-hover:block" />
  </button>
</template>
