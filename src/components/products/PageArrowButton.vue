<script setup lang="ts">
// Figma: Component 13 / "Component 3", variants 2–3 (187:3003–187:3012)
import type { IconName } from '@/assets/icons'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps<{
  direction: 'prev' | 'next'
  disabled?: boolean
}>()

const icons: Record<'prev' | 'next', [IconName, IconName]> = {
  prev: ['line-chevron-left', 'line-chevron-left-active'],
  next: ['line-chevron-right', 'line-chevron-right-active'],
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-label="direction === 'prev' ? 'Halaman sebelumnya' : 'Halaman berikutnya'"
    class="group rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40"
  >
    <AppIcon :name="icons[direction][0]" class="group-enabled:group-hover:hidden" />
    <AppIcon :name="icons[direction][1]" class="hidden group-enabled:group-hover:block" />
  </button>
</template>
