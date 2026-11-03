<script setup lang="ts">
// Figma: Component 6, variant 1 (11:752)
defineProps<{
  href?: string
}>()
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    class="text-xs font-bold text-primary uppercase hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
  >
    <slot />
  </component>
</template>
