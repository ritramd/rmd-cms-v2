<script setup lang="ts">
// Lightbox modal for previewing ad media files (image or video)
import AppModal from '@/components/ui/AppModal.vue'
import type { Advertisement } from '@/types/advertisement'

defineProps<{
  open: boolean
  ad: Advertisement | null
}>()

defineEmits<{
  close: []
}>()

function isVideo(url?: string, type?: string): boolean {
  if (!url) return false
  if (type?.includes('video')) return true
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')
}
</script>

<template>
  <AppModal
    :open="open && !!ad"
    :title="ad ? `${ad.advertiser} - ${ad.spot}` : 'Preview Media'"
    width="w-[800px]"
    @close="$emit('close')"
  >
    <div v-if="ad" class="flex flex-col items-center justify-center gap-4">
      <div class="relative flex max-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl bg-black/90 p-2">
        <video
          v-if="isVideo(ad.file, ad.file_type)"
          :src="ad.file"
          controls
          autoplay
          class="max-h-[480px] max-w-full rounded-xl object-contain"
        />
        <img
          v-else
          :src="ad.file"
          :alt="ad.description"
          class="max-h-[480px] max-w-full rounded-xl object-contain"
        />
      </div>

      <div class="w-full rounded-xl border border-line bg-canvas p-4 text-xs text-ink">
        <p class="font-bold text-ink-heading">{{ ad.description }}</p>
        <p class="mt-1 text-ink-subtle">
          Posisi: <span class="capitalize font-semibold text-ink">{{ ad.spot }}</span> • Dibuat: {{ ad.created_at }}
        </p>
      </div>
    </div>
  </AppModal>
</template>
