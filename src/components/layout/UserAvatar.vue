<script setup lang="ts">
// Figma: div.w-11 / User Avatar (1097:42292, square) and div.w-10 (1097:22038, round)
withDefaults(
  defineProps<{
    src: string
    name: string
    shape?: 'square' | 'round'
  }>(),
  { shape: 'square' },
)
</script>

<template>
  <span
    class="block shrink-0 bg-linear-45 from-primary to-avatar-end p-0.5"
    :class="shape === 'round' ? 'size-10 rounded-full shadow-hairline' : 'size-11 rounded-2xl shadow-card'"
    :title="name"
  >
    <img
      :src="src"
      :alt="name"
      class="size-full border-2 border-white object-cover"
      :class="shape === 'round' ? 'rounded-full' : 'rounded-2xl'"
    />
  </span>
</template>
