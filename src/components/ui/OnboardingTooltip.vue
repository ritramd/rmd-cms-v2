<script setup lang="ts">
// Figma: Onboarding tooltip components (1097:22297, 1097:22425, 1097:36118, 1097:40400, 1097:41485, 1097:30271)
withDefaults(
  defineProps<{
    title: string
    description: string
    buttonText?: string
    pointerPosition?: 'left' | 'right' | 'top' | 'top-right' | 'bottom'
    showClose?: boolean
  }>(),
  {
    buttonText: 'Lanjut',
    pointerPosition: 'left',
    showClose: true,
  },
)

const emit = defineEmits<{
  next: []
  close: []
}>()
</script>

<template>
  <div
    class="relative z-50 flex w-[313px] flex-col gap-4 rounded-[16px] bg-[#2563eb] p-6 text-white shadow-xl"
    role="dialog"
    aria-modal="true"
  >
    <!-- Pointer triangle -->
    <!-- Pointing LEFT (towards sidebar) -->
    <div
      v-if="pointerPosition === 'left'"
      class="pointer-events-none absolute -left-[14px] top-6 flex h-[30px] w-[15px] items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      <svg width="15" height="30" viewBox="0 0 15 30" fill="none">
        <path d="M15 0L0 15L15 30V0Z" fill="#2563eb" />
      </svg>
    </div>

    <!-- Pointing RIGHT (towards modal) -->
    <div
      v-else-if="pointerPosition === 'right'"
      class="pointer-events-none absolute -right-[14px] top-6 flex h-[30px] w-[15px] items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      <svg width="15" height="30" viewBox="0 0 15 30" fill="none">
        <path d="M0 0L15 15L0 30V0Z" fill="#2563eb" />
      </svg>
    </div>

    <!-- Pointing TOP-RIGHT (towards Tambah Flashsale button) -->
    <div
      v-else-if="pointerPosition === 'top-right'"
      class="pointer-events-none absolute -top-[14px] right-6 flex h-[15px] w-[30px] items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      <svg width="30" height="15" viewBox="0 0 30 15" fill="none">
        <path d="M0 15L15 0L30 15H0Z" fill="#2563eb" />
      </svg>
    </div>

    <!-- Pointing TOP (centered, pointing up towards table row) -->
    <div
      v-else-if="pointerPosition === 'top'"
      class="pointer-events-none absolute -top-[14px] left-1/2 -translate-x-1/2 flex h-[15px] w-[30px] items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      <svg width="30" height="15" viewBox="0 0 30 15" fill="none">
        <path d="M0 15L15 0L30 15H0Z" fill="#2563eb" />
      </svg>
    </div>

    <!-- Pointing BOTTOM (centered, pointing down) -->
    <div
      v-else-if="pointerPosition === 'bottom'"
      class="pointer-events-none absolute -bottom-[14px] left-1/2 -translate-x-1/2 flex h-[15px] w-[30px] items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      <svg width="30" height="15" viewBox="0 0 30 15" fill="none">
        <path d="M0 0L15 15L30 0H0Z" fill="#2563eb" />
      </svg>
    </div>

    <!-- Content header -->
    <div class="flex items-start justify-between gap-2">
      <h3 class="whitespace-pre-line font-sans text-[20px] font-semibold leading-tight text-white">
        {{ title }}
      </h3>
      <button
        v-if="showClose"
        type="button"
        class="flex size-6 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Tutup panduan"
        @click="emit('close')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Content description -->
    <p class="font-inter text-[16px] font-normal leading-[1.5] text-white">
      {{ description }}
    </p>

    <!-- Action button -->
    <div class="pt-1">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-[45px] bg-white px-5 py-2 font-inter text-[16px] font-medium text-[#1f2937] transition-all hover:bg-slate-100 hover:shadow-md focus-visible:outline-2 focus-visible:outline-white"
        @click="emit('next')"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>
