<script setup lang="ts">
// Figma: Component 5 (11:1283)
defineProps<{
  status: 'online' | 'offline'
  label: string
  count: number
  active?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
    :class="active ? 'bg-primary-soft ring-1.5 ring-primary' : 'bg-surface-muted hover:bg-surface-hover'"
    @click="$emit('click')"
  >
    <div class="flex items-center gap-3">
      <span
        class="size-2 shrink-0 rounded-full"
        :class="status === 'online' ? 'bg-success shadow-glow-success' : 'bg-danger shadow-glow-danger'"
      />
      <span class="text-sm font-medium" :class="active ? 'font-bold text-primary' : 'text-ink-strong'">{{ label }}</span>
    </div>
    <span class="text-base font-bold" :class="active ? 'text-primary' : 'text-ink-heading'">{{ count }}</span>
  </button>
</template>
