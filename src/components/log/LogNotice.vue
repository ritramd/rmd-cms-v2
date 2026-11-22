<script setup lang="ts">
// Card shown instead of a log page the user's package can't open.
defineProps<{
  title: string
  message: string
}>()
</script>

<template>
  <section class="rounded-2xl bg-surface p-8 text-center shadow-card">
    <p class="text-sm font-bold text-ink-strong">{{ title }}</p>
    <p class="mt-1 text-sm text-ink-muted">{{ message }}</p>
  </section>
</template>
