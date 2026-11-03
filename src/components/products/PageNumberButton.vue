<script setup lang="ts">
// Figma: Component 15 / "Component 5" (187:3408)
defineProps<{
  page: number
  active?: boolean
}>()
</script>

<template>
  <button
    type="button"
    :aria-current="active ? 'page' : undefined"
    :aria-label="`Halaman ${page}`"
    class="flex size-8 shrink-0 items-center justify-center rounded-lg font-inter text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    :class="active ? 'bg-brand text-white' : 'text-ink-soft hover:bg-line'"
  >
    {{ page }}
  </button>
</template>
