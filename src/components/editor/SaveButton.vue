<script setup lang="ts">
// Figma: Component 4 (4:1071)
defineProps<{
  type?: 'button' | 'submit'
  disabled?: boolean
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    class="flex h-9 items-center justify-center truncate rounded-2xl bg-ink-subtle px-4 font-inter text-sm font-bold text-white shadow-primary-hairline transition-colors enabled:hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed"
  >
    <slot>Simpan Perubahan</slot>
  </button>
</template>
