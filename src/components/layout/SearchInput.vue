<script setup lang="ts">
// Figma: header search (1097:42284)
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps<{
  placeholder?: string
  label?: string
}>()

const query = defineModel<string>({ default: '' })
</script>

<template>
  <label class="relative block">
    <span class="sr-only">{{ label ?? placeholder }}</span>
    <AppIcon name="search" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
    <input
      v-model="query"
      type="search"
      :placeholder="placeholder"
      class="w-full rounded-2xl bg-surface py-[13px] pr-3 pl-10 text-sm text-ink-strong shadow-card outline-none placeholder:text-ink-subtle focus:ring-2 focus:ring-primary/30"
    />
  </label>
</template>
