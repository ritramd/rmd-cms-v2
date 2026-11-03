<script setup lang="ts">
// Figma: Component 2 (11:1242)
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import type { NavIconName } from '@/assets/icons'
import AppIcon from './AppIcon.vue'

defineProps<{
  label: string
  icon: NavIconName
  to?: RouteLocationRaw
  active?: boolean
}>()
</script>

<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    :aria-current="active ? 'page' : undefined"
    class="group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="active ? 'bg-surface-muted text-primary' : 'text-ink-muted hover:bg-surface-muted hover:text-primary'"
  >
    <!-- The active icon is 1.1× larger in the design; it overflows the 24px slot so the label stays put. -->
    <span class="relative my-1 size-6 shrink-0">
      <AppIcon :name="icon" class="absolute inset-0" :class="active ? 'invisible' : 'group-hover:invisible'" />
      <AppIcon
        :name="`${icon}-active`"
        class="absolute -top-[1.2px] -left-[1.2px]"
        :class="active ? 'visible' : 'invisible group-hover:visible'"
      />
    </span>
    <span class="truncate">{{ label }}</span>
  </component>
</template>
