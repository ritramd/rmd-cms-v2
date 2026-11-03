<script setup lang="ts">
// Figma: Component 8, variant 1 (11:931 / 11:936)
import AppIcon from './AppIcon.vue'

withDefaults(
  defineProps<{
    label: string
    icon?: 'more-vert'
  }>(),
  { icon: 'more-vert' },
)
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    class="group flex items-center justify-center rounded-lg px-2 pt-2 pb-3 transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <AppIcon :name="icon" class="group-hover:hidden" />
    <AppIcon :name="`${icon}-active`" class="hidden group-hover:block" />
  </button>
</template>
