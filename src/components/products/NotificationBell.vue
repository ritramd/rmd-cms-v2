<script setup lang="ts">
// Figma: Component 12 / "Component 2" (187:3376)
import AppIcon from '@/components/ui/AppIcon.vue'

withDefaults(
  defineProps<{
    hasUnread?: boolean
    label?: string
  }>(),
  { label: 'Notifikasi' },
)
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    class="group relative shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
  >
    <AppIcon name="line-bell" class="group-hover:hidden" />
    <AppIcon name="line-bell-active" class="hidden group-hover:block" />
    <span v-if="hasUnread" class="absolute top-0 right-0 size-2 rounded-full bg-danger ring-2 ring-white" />
  </button>
</template>
