<script setup lang="ts">
// Figma: 5.10-D-Physics UI Preview (1097:21468, 1097:21531)
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { PhysicalConfig, UiEditorConfig } from '@/types/editor'
import imgOrangeJuice from '@/assets/demo/orange-juice.png'
import imgMineralWater from '@/assets/demo/mineral-water.png'
import imgGrapeSoda from '@/assets/demo/grape-soda.png'
import imgClassicCola from '@/assets/demo/classic-cola.png'

const props = withDefaults(
  defineProps<{
    config: UiEditorConfig
    physicalConfig?: PhysicalConfig
    machineName?: string
    machineCode?: string
    scale?: number
  }>(),
  {
    scale: 1,
    machineName: 'SmartVen Alpha',
    machineCode: 'VMENIG010',
  },
)

const fontFamilyClass = computed(() => {
  switch (props.config.fontFamily) {
    case 'Plus Jakarta Sans':
      return 'font-sans'
    case 'Roboto':
      return 'font-sans'
    case 'Poppins':
      return 'font-sans'
    case 'Inter':
    default:
      return 'font-sans'
  }
})

const screenBgStyle = computed(() => {
  if (props.config.isDarkMode) {
    return {
      backgroundColor: '#0f172a',
      color: '#f8fafc',
    }
  }
  return {
    backgroundColor: props.config.warnaDominan || '#FFFFFF',
    color: '#1f2937',
  }
})

const accentStyle = computed(() => ({
  backgroundColor: props.config.warnaAksen || '#5F93EC',
  color: '#FFFFFF',
}))

const accentTextStyle = computed(() => ({
  color: props.config.warnaAksen || '#5F93EC',
}))

const gridClass = computed(() => {
  if (props.config.productGrid === '3 x 3') {
    return 'my-auto grid grid-cols-3 gap-1.5'
  }
  if (props.config.productGrid === '2 x 2') {
    return 'my-auto grid grid-cols-2 gap-3'
  }
  return 'my-auto grid grid-cols-2 gap-2'
})
</script>

<template>
  <div
    class="relative flex flex-col items-center transition-transform duration-200 select-none shrink-0"
    :style="{ transform: `scale(${scale})`, transformOrigin: 'center center' }"
  >
    <!-- Machine Outer Frame (Figma: Machine Body 1097:21531) -->
    <div
      class="relative flex h-[640px] w-[340px] flex-col justify-between overflow-hidden rounded-[32px] border-[8px] border-[#f3f4f8] bg-white shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.18)]"
      :class="fontFamilyClass"
    >
      <!-- Top Fake Kiosk Status Bar (Figma: Top Status Bar 1097:21531) -->
      <div class="relative z-10 flex h-[32px] shrink-0 items-center justify-between bg-black px-6 text-[10px] text-white/50">
        <div class="flex items-center gap-1.5">
          <span class="size-1 rounded-full bg-white/50" />
          <span class="size-1 rounded-full bg-white/50" />
          <span class="size-1 rounded-full bg-white/50" />
        </div>
        <span class="font-mono text-[10px] tracking-wider text-white/50">12:45 PM</span>
      </div>

      <!-- Digital Screen Area (The Interface being edited) -->
      <div
        class="relative flex flex-1 flex-col justify-between overflow-hidden transition-colors duration-300"
        :style="screenBgStyle"
      >
        <!-- Glossy Reflection Highlight -->
        <div
          class="pointer-events-none absolute -top-12 -left-12 h-64 w-80 -rotate-12 bg-gradient-to-b from-white/20 via-white/5 to-transparent blur-[1px] opacity-40 z-20"
        />

        <!-- Screen Content Container -->
        <div class="relative z-10 flex flex-1 flex-col justify-between p-4 pb-2">
          <!-- Screen Header: Logo & Title -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <!-- Header Brand Logo Icon Button -->
              <div
                class="flex size-11 items-center justify-center overflow-hidden rounded-[20px] shadow-md transition-all"
                :style="accentStyle"
              >
                <img
                  v-if="config.logoHeaderUrl"
                  :src="config.logoHeaderUrl"
                  alt="Logo"
                  class="size-8 object-contain"
                />
                <span v-else class="text-base font-black tracking-wider text-white">S</span>
              </div>

              <!-- Cart Button -->
              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-[14px] shadow-sm transition"
                :class="config.isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700'"
              >
                <AppIcon name="shopping-cart" class="size-4" />
              </button>
            </div>

            <!-- Greeting / Title -->
            <div>
              <h2
                class="text-2xl font-black tracking-tight"
                :class="config.isDarkMode ? 'text-white' : 'text-[#1f2937]'"
              >
                Haus?
              </h2>
              <p
                class="text-xs"
                :class="config.isDarkMode ? 'text-slate-400' : 'text-[#6b7280]'"
              >
                Pilih minuman segar favoritmu.
              </p>
            </div>
          </div>

          <!-- Product Grid (Mockup responsive to productGrid setting) -->
          <div :class="gridClass">
            <!-- Product 1: Jus Jeruk -->
            <div
              class="flex flex-col gap-1.5 rounded-[16px] border p-2.5 shadow-sm transition hover:shadow-md"
              :class="
                config.isDarkMode
                  ? 'border-slate-800 bg-slate-800/80 text-white'
                  : 'border-[#f3f4f8] bg-white text-[#1f2937]'
              "
            >
              <div class="flex h-20 items-center justify-center rounded-[18px] bg-gradient-to-br from-orange-200/50 to-yellow-200/50 p-1.5 overflow-hidden">
                <img
                  :src="imgOrangeJuice"
                  alt="Jus Jeruk"
                  class="h-14 w-auto object-contain drop-shadow"
                />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold truncate">Jus Jeruk</span>
                <span class="text-[10px] font-semibold text-[#9ca3af]">Rp 15.000</span>
              </div>
            </div>

            <!-- Product 2: Air Mineral -->
            <div
              class="flex flex-col gap-1.5 rounded-[16px] border p-2.5 shadow-sm transition hover:shadow-md"
              :class="
                config.isDarkMode
                  ? 'border-slate-800 bg-slate-800/80 text-white'
                  : 'border-[#f3f4f8] bg-white text-[#1f2937]'
              "
            >
              <div class="flex h-20 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-200/50 to-cyan-200/50 p-1.5 overflow-hidden">
                <img
                  :src="imgMineralWater"
                  alt="Air Mineral"
                  class="h-14 w-auto object-contain drop-shadow"
                />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold truncate">Air Mineral</span>
                <span class="text-[10px] font-semibold text-[#9ca3af]">Rp 5.000</span>
              </div>
            </div>

            <!-- Product 3: Soda Anggur -->
            <div
              class="flex flex-col gap-1.5 rounded-[16px] border p-2.5 shadow-sm transition hover:shadow-md"
              :class="
                config.isDarkMode
                  ? 'border-slate-800 bg-slate-800/80 text-white'
                  : 'border-[#f3f4f8] bg-white text-[#1f2937]'
              "
            >
              <div class="flex h-20 items-center justify-center rounded-[18px] bg-gradient-to-br from-purple-200/50 to-pink-200/50 p-1.5 overflow-hidden">
                <img
                  :src="imgGrapeSoda"
                  alt="Soda Anggur"
                  class="h-14 w-auto object-contain drop-shadow"
                />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold truncate">Soda Anggur</span>
                <span class="text-[10px] font-semibold text-[#9ca3af]">Rp 12.000</span>
              </div>
            </div>

            <!-- Product 4: Cola Klasik -->
            <div
              class="flex flex-col gap-1.5 rounded-[16px] border p-2.5 shadow-sm transition hover:shadow-md"
              :class="
                config.isDarkMode
                  ? 'border-slate-800 bg-slate-800/80 text-white'
                  : 'border-[#f3f4f8] bg-white text-[#1f2937]'
              "
            >
              <div class="flex h-20 items-center justify-center rounded-[18px] bg-gradient-to-br from-red-200/50 to-orange-200/50 p-1.5 overflow-hidden">
                <img
                  :src="imgClassicCola"
                  alt="Cola Klasik"
                  class="h-14 w-auto object-contain drop-shadow"
                />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold truncate">Cola Klasik</span>
                <span class="text-[10px] font-semibold text-[#9ca3af]">Rp 10.000</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Screen Navigation -->
        <div
          class="relative z-10 flex items-center justify-around border-t py-2.5 px-4 text-center backdrop-blur-md"
          :class="
            config.isDarkMode
              ? 'border-slate-800 bg-slate-900/85 text-slate-400'
              : 'border-[#e3e8ee] bg-white/85 text-slate-500'
          "
        >
          <!-- Active Tab: Menu -->
          <div class="flex flex-col items-center gap-0.5" :style="accentTextStyle">
            <AppIcon name="devices" class="size-4" />
            <span class="text-[10px] font-bold">Menu</span>
          </div>

          <!-- Tab: Cari -->
          <div class="flex flex-col items-center gap-0.5 text-[#9ca3af]">
            <AppIcon name="search" class="size-4" />
            <span class="text-[10px] font-medium">Cari</span>
          </div>

          <!-- Tab: Keranjang -->
          <div class="flex flex-col items-center gap-0.5 text-[#9ca3af]">
            <AppIcon name="shopping-cart" class="size-4" />
            <span class="text-[10px] font-medium">Keranjang</span>
          </div>
        </div>
      </div>

      <!-- Dispenser Area at bottom of kiosk (Figma: Dispenser Area 1097:21531) -->
      <div class="relative z-10 flex h-[52px] shrink-0 items-center justify-center border-t-4 border-[#e3e8ee] bg-[#f3f4f8] px-4">
        <div class="flex h-[36px] w-[216px] items-center justify-center rounded-[14px] border-b border-white/40 bg-[#cbd5e1] shadow-inner">
          <span class="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
            {{ physicalConfig?.machineType === 'TCN49' ? 'Dispenser TCN-49' : 'Dispenser Unit' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Floating Shadow below machine -->
    <div class="h-6 w-[260px] rounded-full bg-black/15 blur-lg -mt-3" />
  </div>
</template>
