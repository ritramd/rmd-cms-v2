<script setup lang="ts">
// Figma: Component 3 (4:1062)
defineProps<{
  href?: string
  current?: boolean
}>()
</script>

<template>
  <span v-if="current" aria-current="page" class="font-inter text-sm leading-[21px] font-bold text-ink-black">
    <slot />
  </span>
  <a
    v-else
    :href="href"
    class="font-inter text-sm leading-[21px] font-medium text-ink-soft transition-colors hover:text-ink-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <slot />
  </a>
</template>
