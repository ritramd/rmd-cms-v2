<script setup lang="ts">
// Figma: Component 1 (11:1198, 4:1023, 187:3356)
import { icons, isFlippedGlyph, type IconName } from '@/assets/icons'

defineProps<{
  name: IconName
}>()
</script>

<template>
  <!-- Glyph exports are upside-down; Figma flips the vector node, so mirror that transform here. -->
  <img :src="icons[name]" alt="" class="max-w-none" :class="isFlippedGlyph(name) ? '-scale-y-100' : ''" />
</template>
