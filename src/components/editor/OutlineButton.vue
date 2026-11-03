<script setup lang="ts">
// Figma: Component 8 (4:1095)
import type { IconName } from '@/assets/icons'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps<{
  icon?: IconName
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="flex w-full items-center justify-center gap-2 rounded-2xl border border-line-strong bg-surface py-2.5 font-inter text-sm font-bold text-ink-heading transition-colors enabled:hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
  >
    <AppIcon v-if="icon" :name="icon" class="my-[3px] shrink-0" />
    <slot />
  </button>
</template>
