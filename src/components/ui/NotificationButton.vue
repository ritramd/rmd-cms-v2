<script setup lang="ts">
// Figma: Component 4 (11:1277)
import AppIcon from './AppIcon.vue'

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
    class="group relative flex flex-col items-center justify-center overflow-clip rounded-2xl bg-surface px-3 pt-3 pb-[18px] shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <AppIcon name="notifications" class="group-hover:hidden" />
    <AppIcon name="notifications-active" class="hidden group-hover:block" />
    <span v-if="hasUnread" class="absolute top-3 right-3 size-2 rounded-full bg-danger" />
  </button>
</template>
