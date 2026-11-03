<script setup lang="ts">
// Figma: Component 5 (11:1283)
defineProps<{
  status: 'online' | 'offline'
  label: string
  count: number
}>()
</script>

<template>
  <div
    class="flex w-full items-center justify-between rounded-xl bg-surface-muted p-3 transition-colors hover:bg-surface-hover"
  >
    <div class="flex items-center gap-3">
      <span
        class="size-2 shrink-0 rounded-full"
        :class="status === 'online' ? 'bg-success shadow-glow-success' : 'bg-danger shadow-glow-danger'"
      />
      <span class="text-sm font-medium text-ink-strong">{{ label }}</span>
    </div>
    <span class="text-base font-bold text-ink-heading">{{ count }}</span>
  </div>
</template>
