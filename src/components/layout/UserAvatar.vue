<script setup lang="ts">
// Figma: div.w-11 / User Avatar (1097:42292)
defineProps<{
  src: string
  name: string
}>()
</script>

<template>
  <span
    class="block size-11 shrink-0 rounded-2xl bg-linear-45 from-primary to-avatar-end p-0.5 shadow-card"
    :title="name"
  >
    <img :src="src" :alt="name" class="size-full rounded-2xl border-2 border-white object-cover" />
  </span>
</template>
