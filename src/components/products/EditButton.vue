<script setup lang="ts">
// Figma: Component 13 / "Component 3", variant 1 (187:2996 / 187:2999)
import AppIcon from '@/components/ui/AppIcon.vue'

withDefaults(
  defineProps<{
    label?: string
  }>(),
  { label: 'Ubah' },
)
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    class="group rounded-xl bg-surface-muted p-2.5 shadow-hairline transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
  >
    <AppIcon name="line-pencil" class="group-hover:hidden" />
    <AppIcon name="line-pencil-active" class="hidden group-hover:block" />
  </button>
</template>
