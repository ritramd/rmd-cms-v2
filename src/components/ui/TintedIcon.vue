<script setup lang="ts">
// Paints a single-color SVG in any color by using it as a CSS mask. For states Figma
// doesn't export (e.g. a gray version of an icon that only ships in blue). Size it with classes.
import { computed } from 'vue'

const props = defineProps<{
  src: string
  /** Background utility that sets the color, e.g. "bg-ink-muted". */
  color: string
}>()

const style = computed(() => ({
  maskImage: `url("${props.src}")`,
  maskSize: '100% 100%',
  maskRepeat: 'no-repeat',
}))
</script>

<template>
  <span class="inline-block" :class="color" :style="style" aria-hidden="true" />
</template>
