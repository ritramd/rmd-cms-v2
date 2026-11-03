<script setup lang="ts">
// Figma: Component 2, variants 2–4 (4:856–4:876)
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps<{
  icon: 'zoom-in' | 'zoom-out' | 'smartphone'
  label: string
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    class="group flex size-10 shrink-0 items-center justify-center overflow-clip rounded-full border border-line-soft bg-surface shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
  >
    <AppIcon :name="icon" class="group-enabled:group-hover:hidden" />
    <AppIcon :name="`${icon}-active`" class="hidden group-enabled:group-hover:block" />
  </button>
</template>
