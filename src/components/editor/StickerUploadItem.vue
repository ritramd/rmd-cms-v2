<script setup lang="ts">
// Figma: Control Item - Upload Sticker (Node 1097:21217, 1097:21058)
import { computed, ref, useId } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { StickerItem, StickerSide } from '@/types/editor3d'

const props = defineProps<{
  title: string
  side: StickerSide
  sticker: StickerItem | null
}>()

const emit = defineEmits<{
  upload: [side: StickerSide, file: File]
  remove: [side: StickerSide]
}>()

const uid = useId()
const inputId = computed(() => `sticker-upload-${props.side}-${uid}`)
const isDragging = ref(false)
const localError = ref<string | null>(null)

const IMAGE_EXT_PATTERN = /\.(png|jpe?g|webp|svg|gif|bmp|avif)$/i

function handleSelectedFile(file: File | undefined) {
  localError.value = null
  if (!file) return

  const isImage = file.type.startsWith('image/') || IMAGE_EXT_PATTERN.test(file.name)
  if (!isImage) {
    localError.value = 'Format file harus berupa gambar (PNG, JPG, WEBP, atau SVG).'
    return
  }

  if (file.size > 15 * 1024 * 1024) {
    localError.value = 'Ukuran gambar maksimal 15 MB.'
    return
  }

  emit('upload', props.side, file)
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  handleSelectedFile(file)
  target.value = '' // Reset so selecting the exact same file again still fires change
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  handleSelectedFile(file)
}
</script>

<template>
  <div class="border-b border-line-soft pb-3.5 pt-2 space-y-2">
    <!-- Native accessible file input using sr-only (avoid display:none so label triggers picker in all browsers) -->
    <input
      :id="inputId"
      type="file"
      accept="image/*"
      class="sr-only"
      @change="onFileChange"
    />

    <!-- Header with title & native label trigger -->
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold uppercase tracking-wider text-ink-heading">
        {{ title }}
      </span>
      <label
        :for="inputId"
        class="text-xs font-bold text-primary hover:underline transition cursor-pointer select-none"
      >
        {{ sticker ? 'Ubah' : 'Pilih File' }}
      </label>
    </div>

    <!-- Uploaded state card (clicking preview/name also lets user pick a replacement image; trash deletes) -->
    <div
      v-if="sticker"
      class="flex items-center gap-3.5 rounded-2xl border border-dashed p-3 transition"
      :class="isDragging ? 'border-primary bg-blue-50/60' : 'border-slate-300 bg-[#f7f9fc] hover:border-slate-400'"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop="onDrop"
    >
      <label
        :for="inputId"
        class="flex min-w-0 flex-1 items-center gap-3.5 cursor-pointer"
        title="Klik untuk ganti gambar sticker"
      >
        <!-- Thumbnail -->
        <div class="size-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
          <img
            :src="sticker.url"
            :alt="sticker.name"
            class="size-full object-cover"
          />
        </div>

        <!-- File info -->
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold text-ink-heading" :title="sticker.name">
            {{ sticker.name }}
          </p>
          <p class="text-[10px] text-ink-subtle">
            {{ sticker.sizeFormatted }}
          </p>
        </div>
      </label>

      <!-- Remove button -->
      <button
        type="button"
        class="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-subtle hover:bg-danger-soft hover:text-danger-strong transition cursor-pointer"
        title="Hapus sticker"
        @click.stop="emit('remove', side)"
      >
        <AppIcon name="line-trash" class="size-4" />
      </button>
    </div>

    <!-- Empty upload dropzone wrapped in native <label> so any click opens OS file picker -->
    <label
      v-else
      :for="inputId"
      class="group flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-3 transition"
      :class="
        isDragging
          ? 'border-primary bg-blue-50/70'
          : 'border-slate-300 bg-[#f7f9fc] hover:border-primary hover:bg-blue-50/40'
      "
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop="onDrop"
    >
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-subtle shadow-xs group-hover:border-primary group-hover:text-primary transition">
        <AppIcon name="add" class="size-5" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-ink-heading group-hover:text-primary transition">
          Klik untuk unggah sticker
        </p>
        <p class="text-[10px] text-ink-subtle">
          PNG, JPG, WEBP atau SVG (Maks. 15 MB)
        </p>
      </div>
    </label>

    <!-- Validation feedback if non-image or oversized file selected -->
    <p v-if="localError" class="text-[11px] font-medium text-danger-strong">
      {{ localError }}
    </p>
  </div>
</template>
