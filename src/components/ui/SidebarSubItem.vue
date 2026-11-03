<script setup lang="ts">
// Figma: Component 3 (11:1268)
import { RouterLink, type RouteLocationRaw } from 'vue-router'

defineProps<{
  label: string
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
    class="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    :class="
      active
        ? 'bg-primary-tint font-bold text-primary'
        : 'font-medium text-ink-muted hover:bg-surface-muted hover:text-primary'
    "
  >
    <span class="size-1.5 shrink-0 rounded-full" :class="active ? 'bg-primary' : 'bg-bullet'" />
    <span class="truncate">{{ label }}</span>
  </component>
</template>
