<script setup lang="ts">
// Figma: Component 5 (4:1077). The design overlays a transparent native color input on the swatch.
defineProps<{
  label: string
}>()

const color = defineModel<string>({ required: true })
</script>

<template>
  <label
    class="relative block size-8 shrink-0 cursor-pointer overflow-clip rounded-full border border-line shadow-xs transition-shadow hover:shadow-swatch-hover has-focus-visible:shadow-swatch-hover"
    :title="label"
  >
    <span class="block size-full" :style="{ backgroundColor: color }" />
    <input
      v-model="color"
      type="color"
      :aria-label="label"
      class="absolute -inset-2 size-16 cursor-pointer opacity-0"
    />
  </label>
</template>
