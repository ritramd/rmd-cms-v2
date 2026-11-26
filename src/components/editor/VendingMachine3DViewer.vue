<script setup lang="ts">
// Figma: 5.3-D-UI Settings (Node 1097:21058)
// Interactive 3D Vending Machine Canvas powered by Three.js (SV 22 Chiller & Cardshack Vending)
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useVending3D } from '@/composables/useVending3D'
import {
  VENDING_3D_MODELS,
  type StickerItem,
  type StickerSide,
  type Vending3DModelType,
} from '@/types/editor3d'

const props = withDefaults(
  defineProps<{
    machineName?: string
    machineCode?: string
    accentColor?: string
    modelType?: Vending3DModelType
    initialStickers?: Record<StickerSide, StickerItem | null>
  }>(),
  {
    machineName: 'SmartVen Alpha',
    machineCode: 'VMENIG010',
    accentColor: '#5F93EC',
    modelType: 'SV22',
  },
)

defineEmits<{
  snapshotTaken: [dataUrl: string]
}>()

const canvasMountRef = ref<HTMLElement | null>(null)

const {
  isLoaded,
  isAutoRotating,
  stickers,
  init,
  setModelType,
  applySticker,
  removeSticker,
  setScreenAccent,
  resetCamera,
  resetAll,
  toggleAutoRotate,
  rotateByStep,
  zoom,
  captureSnapshot,
  dispose,
} = useVending3D()

const activeModelMeta = computed(() => {
  return VENDING_3D_MODELS.find((m) => m.id === props.modelType) ?? VENDING_3D_MODELS[0]
})

onMounted(async () => {
  if (canvasMountRef.value) {
    init(canvasMountRef.value, props.modelType)
    if (props.accentColor && props.modelType === 'SV22') {
      setScreenAccent(props.accentColor)
    }
    if (props.initialStickers) {
      const sides: StickerSide[] = ['front', 'back', 'left', 'right']
      for (const side of sides) {
        const existing = props.initialStickers[side]
        if (existing) {
          await applySticker(side, existing.file ?? existing.url, existing.name)
        }
      }
    }
  }
})

onUnmounted(() => {
  dispose()
})

watch(
  () => props.modelType,
  (newType) => {
    setModelType(newType, newType === 'SV22' ? props.accentColor : undefined)
  },
)

watch(
  () => props.accentColor,
  (newColor) => {
    if (newColor && props.modelType === 'SV22') {
      setScreenAccent(newColor)
    }
  },
)

// Expose composable methods so parent component (or sidebar) can trigger sticker uploads and snapshot
defineExpose({
  applySticker: (side: StickerSide, file: File | string, name?: string) =>
    applySticker(side, file, name),
  removeSticker: (side: StickerSide) => removeSticker(side),
  captureSnapshot: (filename?: string) => captureSnapshot(filename),
  setModelType,
  resetAll,
  resetCamera,
  stickers,
})
</script>

<template>
  <div class="relative size-full overflow-hidden bg-gradient-to-br from-[#eff6ff] via-[#f1f5f9] to-[#e2e8f0] select-none">
    <!-- WebGL Canvas Mount Container -->
    <div
      ref="canvasMountRef"
      class="size-full cursor-grab active:cursor-grabbing"
    />

    <!-- Subtle Radial Background Floor Grid -->
    <div
      class="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]"
    />

    <!-- Bottom-Left 3D Dimension Badge (positioned cleanly above Live Preview pill) -->
    <div class="pointer-events-none absolute bottom-20 left-8 flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3.5 py-1.5 shadow-xs backdrop-blur-xs">
      <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
      <span class="text-xs font-semibold text-ink-heading">{{ activeModelMeta.shortName }}</span>
      <span class="text-[11px] text-ink-subtle">{{ activeModelMeta.dimensionsLabel }}</span>
    </div>

    <!-- Bottom-Left Floating Live Preview Label (Figma 1097:21128) -->
    <div class="pointer-events-none absolute bottom-8 left-8 flex items-center gap-2.5 rounded-full border border-white/60 bg-white/85 px-4 py-2 shadow-xs backdrop-blur-sm">
      <span class="relative flex size-2.5">
        <span class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
        <span class="relative inline-flex size-2.5 rounded-full bg-primary" />
      </span>
      <div class="text-xs">
        <span class="font-medium text-ink-subtle">Live 3D Preview: </span>
        <span class="font-bold text-ink-strong">{{ machineName }} ({{ machineCode }})</span>
      </div>
    </div>

    <!-- Center-Bottom Floating 3D Navigation Controls (Figma 1097:21135 & 1097:21140) -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 p-1.5 shadow-lg backdrop-blur-md transition hover:bg-white">
      <!-- Step Rotate Left 45° -->
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-full text-ink-heading hover:bg-slate-100 transition cursor-pointer"
        title="Putar Kiri 45°"
        @click="rotateByStep(Math.PI / 4)"
      >
        <span class="text-sm font-bold">↶</span>
      </button>

      <!-- Auto Rotate / Turntable 360° Toggle -->
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
        :class="
          isAutoRotating
            ? 'bg-primary text-white shadow-xs'
            : 'text-ink-heading hover:bg-slate-100'
        "
        title="Putar Otomatis (360°)"
        @click="toggleAutoRotate()"
      >
        <AppIcon name="line-rotate-ccw" class="size-3.5" />
        <span>{{ isAutoRotating ? 'Berputar' : 'Auto 360°' }}</span>
      </button>

      <!-- Step Rotate Right 45° -->
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-full text-ink-heading hover:bg-slate-100 transition cursor-pointer"
        title="Putar Kanan 45°"
        @click="rotateByStep(-Math.PI / 4)"
      >
        <span class="text-sm font-bold">↷</span>
      </button>

      <div class="h-4 w-px bg-slate-200" />

      <!-- Reset Camera Angle -->
      <button
        type="button"
        class="inline-flex size-9 items-center justify-center rounded-full text-ink-heading hover:bg-slate-100 transition cursor-pointer"
        title="Reset Sudut Pandang"
        @click="resetCamera"
      >
        <AppIcon name="restart" class="size-4" />
      </button>
    </div>

    <!-- Bottom-Right Floating Zoom Controls (Figma 1097:21123) -->
    <div class="absolute bottom-8 right-8 flex flex-col gap-2">
      <!-- Zoom In Button -->
      <button
        type="button"
        class="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-white shadow-md text-ink-heading hover:bg-slate-50 transition cursor-pointer"
        title="Perbesar"
        @click="zoom(-0.4)"
      >
        <AppIcon name="zoom-in" class="size-4" />
      </button>

      <!-- Zoom Out Button -->
      <button
        type="button"
        class="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-white shadow-md text-ink-heading hover:bg-slate-50 transition cursor-pointer"
        title="Perkecil"
        @click="zoom(0.4)"
      >
        <AppIcon name="zoom-out" class="size-4" />
      </button>

      <!-- Center Reset View Button -->
      <button
        type="button"
        class="flex size-10 items-center justify-center rounded-full border border-slate-100 bg-white shadow-md text-ink-heading hover:bg-slate-50 transition cursor-pointer"
        title="Sudut Depan / Default"
        @click="resetCamera"
      >
        <AppIcon name="devices" class="size-4" />
      </button>
    </div>

    <!-- Initial Loading Spinner -->
    <div
      v-if="!isLoaded"
      class="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs"
    >
      <div class="size-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
      <p class="mt-3 text-xs font-semibold text-ink-heading">
        Memuat Model 3D {{ activeModelMeta.shortName }}...
      </p>
    </div>
  </div>
</template>
