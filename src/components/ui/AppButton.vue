<script setup lang="ts">
// Figma: Component 7 (11:1304)
import { computed } from 'vue'
import type { IconName } from '@/assets/icons'
import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{
    /** "danger" isn't in Figma; same shape as primary for destructive confirmations. */
    variant?: 'primary' | 'secondary' | 'danger'
    icon?: IconName
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { variant: 'secondary', type: 'button' },
)

const resolvedIcon = computed<IconName | undefined>(() => {
  if (!props.icon) return undefined
  if (props.variant === 'primary' || props.variant === 'danger') {
    if (props.icon === 'filter') return 'filter-active'
    if (props.icon === 'line-filter') return 'line-filter-active'
  }
  return props.icon
})

const isWhiteIcon = computed(() => props.variant === 'primary' || props.variant === 'danger')
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center gap-2 rounded-xl px-4 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    :class="
      variant === 'primary'
        ? 'bg-primary py-[11px] font-bold text-white shadow-primary enabled:hover:bg-primary-hover'
        : variant === 'danger'
          ? 'bg-danger py-[11px] font-bold text-white enabled:hover:bg-danger-strong'
          : 'border border-line bg-surface py-2.5 font-medium text-ink shadow-hairline enabled:hover:bg-surface-muted'
    "
  >
    <AppIcon
      v-if="resolvedIcon"
      :name="resolvedIcon"
      class="my-[5px] shrink-0"
      :class="isWhiteIcon ? '[filter:brightness(0)_invert(1)]' : ''"
    />
    <slot />
  </button>
</template>
