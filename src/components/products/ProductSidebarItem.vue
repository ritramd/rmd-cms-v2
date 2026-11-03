<script setup lang="ts">
// Figma: Component 16 / "Component 6" (187:3556) — item for the dark sidebar.
import type { IconName } from '@/assets/icons'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps<{
  label: string
  icon: IconName
  /** The design only ships an indigo icon for "cube"; other items keep their default icon when active. */
  activeIcon?: IconName
  href?: string
  active?: boolean
}>()
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    :aria-current="active ? 'page' : undefined"
    class="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left font-inter text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    :class="active ? 'border-r-[3px] border-brand bg-brand-tint text-brand' : 'text-ink-subtle hover:bg-ink-strong'"
  >
    <AppIcon :name="active && activeIcon ? activeIcon : icon" class="shrink-0" />
    <span class="truncate">{{ label }}</span>
  </component>
</template>
