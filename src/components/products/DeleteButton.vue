<script setup lang="ts">
// Companion to EditButton (187:2996) for destructive row actions; not in Figma, styled to match.
import AppIcon from '@/components/ui/AppIcon.vue'

withDefaults(
  defineProps<{
    label?: string
  }>(),
  { label: 'Hapus' },
)
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    class="group rounded-xl bg-surface-muted p-2.5 shadow-hairline transition-colors hover:bg-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
  >
    <AppIcon name="line-trash" class="group-hover:hidden" />
    <AppIcon name="line-trash-active" class="hidden group-hover:block" />
  </button>
</template>
