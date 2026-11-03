<script setup lang="ts">
// Figma: Component 9 (4:1101)
import type { IconName } from '@/assets/icons'
import AppIcon from '@/components/ui/AppIcon.vue'

type TabIcon = 'tune-outline' | 'devices' | 'payments'

defineProps<{
  icon: TabIcon
  label: string
  active?: boolean
}>()

// `devices` has no hover variant in the design.
const hoverIcons: Record<TabIcon, IconName> = {
  'tune-outline': 'tune-outline-active',
  devices: 'devices',
  payments: 'payments-active',
}
</script>

<template>
  <button
    type="button"
    role="tab"
    :aria-selected="active"
    class="group flex h-[50px] items-center gap-2 border-b-2 pt-2 pb-3.5 font-inter text-xs font-bold tracking-[0.6px] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="active ? 'border-ink-subtle text-ink-subtle' : 'border-transparent text-ink-subtle hover:text-ink-gray'"
  >
    <span class="relative my-[3px] shrink-0 transition-transform" :class="active ? '' : 'group-hover:-translate-y-0.5'">
      <AppIcon :name="icon" :class="active ? '' : 'group-hover:invisible'" />
      <AppIcon v-if="!active" :name="hoverIcons[icon]" class="invisible absolute inset-0 group-hover:visible" />
    </span>
    {{ label }}
  </button>
</template>
