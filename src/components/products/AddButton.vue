<script setup lang="ts">
// Figma: "Tambah Produk" button in the Atur Produk action bar (1097:22041).
import AppIcon from '@/components/ui/AppIcon.vue'
</script>

<template>
  <button
    type="button"
    class="flex items-center gap-2 rounded-lg border border-cta-border bg-cta px-6 py-2.5 font-inter text-sm font-medium text-white shadow-hairline transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <AppIcon name="line-plus" />
    <slot />
  </button>
</template>
