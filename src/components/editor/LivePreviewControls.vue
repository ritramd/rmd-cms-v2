<script setup lang="ts">
// Figma: View Controls (1097:21532)
import AppIcon from '@/components/ui/AppIcon.vue'

withDefaults(
  defineProps<{
    scale: number
    isFullscreen?: boolean
  }>(),
  {
    isFullscreen: false,
  },
)

const emit = defineEmits<{
  zoomIn: []
  zoomOut: []
  reset: []
  toggleFullscreen: []
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Fullscreen Toggle Button (Figma 1097:12209) -->
    <button
      type="button"
      class="flex size-10 items-center justify-center rounded-full border border-line-soft bg-surface text-ink-muted shadow-card transition-all hover:bg-surface-hover hover:text-ink active:scale-95 cursor-pointer"
      :title="isFullscreen ? 'Keluar Mode Layar Penuh' : 'Mode Layar Penuh'"
      @click="emit('toggleFullscreen')"
    >
      <AppIcon :name="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" class="size-4" />
    </button>
    <!-- Zoom In Button -->
    <button
      type="button"
      class="flex size-10 items-center justify-center rounded-full border border-line-soft bg-surface text-ink-muted shadow-card transition-all hover:bg-surface-hover hover:text-ink active:scale-95 cursor-pointer"
      title="Perbesar Tampilan"
      @click="emit('zoomIn')"
    >
      <AppIcon name="zoom-in" class="size-4" />
    </button>

    <!-- Zoom Out Button -->
    <button
      type="button"
      class="flex size-10 items-center justify-center rounded-full border border-line-soft bg-surface text-ink-muted shadow-card transition-all hover:bg-surface-hover hover:text-ink active:scale-95 cursor-pointer"
      title="Perkecil Tampilan"
      @click="emit('zoomOut')"
    >
      <AppIcon name="zoom-out" class="size-4" />
    </button>

    <!-- Reset Zoom Button -->
    <button
      type="button"
      class="flex size-10 items-center justify-center rounded-full border border-line-soft bg-surface text-ink-muted shadow-card transition-all hover:bg-surface-hover hover:text-ink active:scale-95 cursor-pointer"
      title="Kembalikan Skala (100%)"
      @click="emit('reset')"
    >
      <AppIcon name="restart" class="size-4" />
    </button>
  </div>
</template>
