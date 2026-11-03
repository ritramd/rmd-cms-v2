<script setup lang="ts">
// Figma: "Button" on the auth pages (1097:13218, 1097:14004)
defineProps<{
  loading?: boolean
}>()
</script>

<template>
  <button
    type="submit"
    :disabled="loading"
    class="w-full rounded-lg border border-cta-border bg-cta px-6 py-2.5 font-inter text-sm font-medium text-white shadow-hairline transition-colors enabled:hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
  >
    <template v-if="loading">Memproses…</template>
    <slot v-else />
  </button>
</template>
