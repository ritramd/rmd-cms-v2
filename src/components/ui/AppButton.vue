<script setup lang="ts">
// Figma: Component 7 (11:1304)
import type { IconName } from '@/assets/icons'
import AppIcon from './AppIcon.vue'

withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    icon?: IconName
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { variant: 'secondary', type: 'button' },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center gap-2 rounded-xl px-4 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    :class="
      variant === 'primary'
        ? 'bg-primary py-[11px] font-bold text-white shadow-primary enabled:hover:bg-primary-hover'
        : 'border border-line bg-surface py-2.5 font-medium text-ink shadow-hairline enabled:hover:bg-surface-muted'
    "
  >
    <AppIcon v-if="icon" :name="icon" class="my-[5px] shrink-0" />
    <slot />
  </button>
</template>
