<script setup lang="ts">
// Figma: Component 3 (11:1268)
import { RouterLink, type RouteLocationRaw } from 'vue-router'

defineProps<{
  label: string
  to?: RouteLocationRaw
  active?: boolean
  /** Not in Figma: small status pill after the label (StatusBadge colours). */
  badge?: { label: string; tone: 'danger' | 'warning' } | null
}>()

const BADGE_TONES = {
  danger: 'bg-danger-soft text-danger-strong',
  warning: 'bg-warning-soft text-warning-strong',
} as const
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
    <!-- Wraps rather than truncates: "Perpanjang Subscription" plus its badge is wider than the sidebar. -->
    <span class="min-w-0 leading-snug break-words">{{ label }}</span>
    <span
      v-if="badge"
      class="ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold whitespace-nowrap"
      :class="BADGE_TONES[badge.tone]"
    >
      {{ badge.label }}
    </span>
  </component>
</template>
