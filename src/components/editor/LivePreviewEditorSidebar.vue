<script setup lang="ts">
// Figma: Left Sidebar: Editor (1097:21544, 1097:12231)
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StickerUploadItem from './StickerUploadItem.vue'
import type { PaymentConfig, PhysicalConfig, UiEditorConfig } from '@/types/editor'
import {
  VENDING_3D_MODEL_GROUPS,
  type StickerItem,
  type StickerSide,
  type Vending3DModelType,
} from '@/types/editor3d'

const props = withDefaults(
  defineProps<{
    config: UiEditorConfig
    physicalConfig: PhysicalConfig
    paymentConfig: PaymentConfig
    activeTab: 'antarmuka' | 'fisik' | 'pembayaran'
    fullscreen?: boolean
    saving?: boolean
    machineCode?: string
    machineName?: string
    model3dType?: Vending3DModelType
    stickers?: Record<StickerSide, StickerItem | null>
  }>(),
  {
    fullscreen: false,
    saving: false,
    machineCode: 'VMENIG010',
    machineName: 'SmartVen Alpha',
    model3dType: 'SV22',
    stickers: () => ({ front: null, back: null, left: null, right: null }),
  },
)

const emit = defineEmits<{
  'update:activeTab': [tab: 'antarmuka' | 'fisik' | 'pembayaran']
  'update:config': [config: UiEditorConfig]
  'update:physicalConfig': [config: PhysicalConfig]
  'update:paymentConfig': [config: PaymentConfig]
  'update:model3dType': [modelType: Vending3DModelType]
  reset: []
  save: []
  logoUpload: [file: File]
  uploadSticker: [side: StickerSide, file: File]
  removeSticker: [side: StickerSide]
  downloadPreview: []
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const showHardwareSettings = ref(false)

const gridSliderValue = computed(() => {
  if (props.config.productGrid === '2 x 2') return 1
  if (props.config.productGrid === '3 x 3') return 2
  return 3
})

function onGridSliderChange(event: Event) {
  const val = Number((event.target as HTMLInputElement).value)
  const map: Record<number, string> = {
    1: '2 x 2',
    2: '3 x 3',
    3: '3 x 4',
  }
  emit('update:config', {
    ...props.config,
    productGrid: map[val] || '3 x 4',
  })
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    emit('logoUpload', target.files[0])
  }
}
</script>

<template>
  <div
    class="flex h-full w-[440px] max-w-[440px] shrink-0 flex-col bg-surface shadow-card overflow-hidden z-20"
    :class="fullscreen ? 'border-r border-line-soft' : 'border-l border-line-soft'"
  >
    <!-- Header: Status & Version (Figma: Header Text 1097:21545 / 1097:12232) -->
    <div v-if="fullscreen" class="border-b border-line-soft px-8 pt-8 pb-6 space-y-3">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center rounded-lg bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
          Online
        </span>
        <span class="text-xs font-medium text-ink-subtle">
          Versi 2.4.0
        </span>
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#111827]">
          Editor Visual
        </h1>
        <p class="mt-1 text-sm text-[#6b7280] leading-relaxed">
          Sesuaikan tampilan fisik dan antarmuka digital mesin Vending Alpha Anda secara real-time.
        </p>
      </div>
    </div>
    <div v-else class="flex items-center justify-between border-b border-line-soft px-8 py-5">
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center rounded-lg bg-[#dcfce7] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#15803d]">
          Online
        </span>
        <span class="text-xs font-medium text-ink-subtle">
          Versi 2.4.0
        </span>
      </div>
    </div>

    <!-- Navigation Tabs (Figma: Tabs 1097:21675) -->
    <div class="flex border-b border-line-soft px-8">
      <button
        type="button"
        class="flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        :class="
          activeTab === 'fisik'
            ? 'border-primary text-primary'
            : 'border-transparent text-ink-subtle hover:text-ink'
        "
        @click="emit('update:activeTab', 'fisik')"
      >
        <AppIcon name="devices" class="size-4" />
        <span>Fisik</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        :class="
          activeTab === 'antarmuka'
            ? 'border-primary text-primary'
            : 'border-transparent text-ink-subtle hover:text-ink'
        "
        @click="emit('update:activeTab', 'antarmuka')"
      >
        <AppIcon name="smartphone" class="size-4" />
        <span>Antarmuka</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 border-b-2 py-3.5 px-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        :class="
          activeTab === 'pembayaran'
            ? 'border-primary text-primary'
            : 'border-transparent text-ink-subtle hover:text-ink'
        "
        @click="emit('update:activeTab', 'pembayaran')"
      >
        <AppIcon name="payments" class="size-4" />
        <span>Pembayaran</span>
      </button>
    </div>

    <!-- Scrollable Editor Controls -->
    <div class="flex-1 overflow-y-auto p-8 space-y-6">
      <!-- ================= TAB 1: ANTARMUKA ================= -->
      <template v-if="activeTab === 'antarmuka'">
        <!-- SECTION 1: TEMA & WARNA -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Tema & Warna
          </h3>

          <!-- Control: Warna Dominan -->
          <div class="flex items-center justify-between border-b border-line-soft pb-3.5">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                Warna Dominan
              </p>
              <p class="text-[10px] text-ink-subtle">
                Background layar utama
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs text-ink-muted uppercase">
                {{ config.warnaDominan }}
              </span>
              <div class="relative size-8 rounded-2xl border border-line-strong shadow-sm overflow-hidden cursor-pointer">
                <div
                  class="size-full"
                  :style="{ backgroundColor: config.warnaDominan }"
                />
                <input
                  type="color"
                  :value="config.warnaDominan"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                  @input="
                    emit('update:config', {
                      ...config,
                      warnaDominan: ($event.target as HTMLInputElement).value,
                    })
                  "
                />
              </div>
            </div>
          </div>

          <!-- Control: Warna Aksen -->
          <div class="flex items-center justify-between border-b border-line-soft pb-3.5">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                Warna Aksen
              </p>
              <p class="text-[10px] text-ink-subtle">
                Tombol dan highlight
              </p>
            </div>
            <div class="flex items-center gap-3">
              <span class="font-mono text-xs text-ink-muted uppercase">
                {{ config.warnaAksen }}
              </span>
              <div class="relative size-8 rounded-2xl border border-line-strong shadow-sm overflow-hidden cursor-pointer">
                <div
                  class="size-full"
                  :style="{ backgroundColor: config.warnaAksen }"
                />
                <input
                  type="color"
                  :value="config.warnaAksen"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                  @input="
                    emit('update:config', {
                      ...config,
                      warnaAksen: ($event.target as HTMLInputElement).value,
                    })
                  "
                />
              </div>
            </div>
          </div>

          <!-- Control: Mode Gelap -->
          <div class="flex items-center justify-between border-b border-line-soft pb-3.5">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                Mode Gelap
              </p>
              <p class="text-[10px] text-ink-subtle">
                Otomatis sesuaikan tema gelap
              </p>
            </div>
            <button
              type="button"
              class="relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer"
              :class="config.isDarkMode ? 'bg-primary' : 'bg-surface-muted border border-line'"
              @click="
                emit('update:config', {
                  ...config,
                  isDarkMode: !config.isDarkMode,
                })
              "
            >
              <span
                class="absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="config.isDarkMode ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>

        <!-- SECTION 2: ASET GRAFIS -->
        <div class="space-y-4 pt-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Aset Grafis
          </h3>

          <!-- Control: Logo Header -->
          <div class="space-y-3 border-b border-line-soft pb-3.5">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                Logo Header
              </p>
              <button
                type="button"
                class="text-xs font-bold text-primary hover:underline cursor-pointer"
                @click="triggerUpload"
              >
                Ubah
              </button>
            </div>

            <div
              class="flex items-center gap-4 rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f7f9fc] p-3 transition hover:border-primary cursor-pointer"
              @click="triggerUpload"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface shadow-sm border border-line-soft overflow-hidden">
                <img
                  v-if="config.logoHeaderUrl"
                  :src="config.logoHeaderUrl"
                  alt="Logo"
                  class="size-6 object-contain"
                />
                <span v-else class="text-xs font-black text-primary">S</span>
              </div>
              <div class="flex flex-col truncate">
                <span class="text-xs font-medium text-ink-heading truncate">
                  {{ config.logoHeaderName }}
                </span>
                <span class="text-[10px] text-ink-subtle">
                  {{ config.logoHeaderSize }}
                </span>
              </div>
            </div>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileSelected"
            />
          </div>

          <!-- Control: Jenis Huruf -->
          <div class="flex items-center justify-between border-b border-line-soft pb-3.5">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                Jenis Huruf
              </p>
              <p class="text-[10px] text-ink-subtle">
                Font utama antarmuka
              </p>
            </div>
            <div class="relative min-w-[120px]">
              <select
                :value="config.fontFamily"
                class="w-full appearance-none rounded-lg border border-line bg-[#f7f9fc] py-1.5 pr-8 pl-3 text-xs font-medium text-ink-heading outline-none transition focus:border-primary"
                @change="
                  emit('update:config', {
                    ...config,
                    fontFamily: ($event.target as HTMLSelectElement).value as UiEditorConfig['fontFamily'],
                  })
                "
              >
                <option value="Inter">Inter</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Roboto">Roboto</option>
                <option value="Poppins">Poppins</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-subtle">
                <AppIcon name="line-chevron-down" class="size-3" />
              </span>
            </div>
          </div>
        </div>

        <!-- SECTION 3: TATA LETAK (Figma: 1097:12308) -->
        <div class="space-y-4 pt-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Tata Letak
          </h3>

          <!-- Control: Grid Produk (Figma: Range Slider 1097:12311) -->
          <div class="space-y-2 border-b border-line-soft pb-3.5">
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                Grid Produk
              </p>
              <span class="rounded-lg bg-[#f3f4f8] px-2 py-0.5 text-xs font-medium text-[#6b7280]">
                {{ config.productGrid || '3 x 4' }}
              </span>
            </div>

            <!-- Range Slider -->
            <div class="space-y-1 pt-1">
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                :value="gridSliderValue"
                class="w-full accent-primary cursor-pointer"
                @input="onGridSliderChange"
              />
              <div class="flex items-center justify-between text-[10px] text-ink-subtle">
                <span>Padat</span>
                <span>Longgar</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 4: JOURNEY -->
        <div class="space-y-2 pt-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Journey
          </h3>
          <div class="relative w-full border-b border-line-soft pb-3.5">
            <select
              :value="config.journey"
              class="w-full appearance-none rounded-lg border border-line bg-[#f7f9fc] py-2 pr-9 pl-3 text-xs font-medium text-ink-heading outline-none transition focus:border-primary"
              @change="
                emit('update:config', {
                  ...config,
                  journey: ($event.target as HTMLSelectElement).value,
                })
              "
            >
              <option value="default">Pilih Journey (Default Flow)</option>
              <option value="direct">Direct Product Selection</option>
              <option value="promo">Promo Banner First Journey</option>
              <option value="event">Special Event Kiosk Journey</option>
            </select>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pb-3.5 text-ink-subtle">
              <AppIcon name="line-chevron-down" class="size-3.5" />
            </span>
          </div>
        </div>

        <!-- SECTION 5: MODULE -->
        <div class="space-y-2 pt-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Module
          </h3>
          <div class="relative w-full border-b border-line-soft pb-3.5">
            <select
              :value="config.module"
              class="w-full appearance-none rounded-lg border border-line bg-[#f7f9fc] py-2 pr-9 pl-3 text-xs font-medium text-ink-heading outline-none transition focus:border-primary"
              @change="
                emit('update:config', {
                  ...config,
                  module: ($event.target as HTMLSelectElement).value,
                })
              "
            >
              <option value="standard">Pilih Modul (Standard Beverage)</option>
              <option value="combo">Combo Snack & Beverage</option>
              <option value="coffee">Smart Coffee Brewing Machine</option>
              <option value="merch">Merchandise & Digital Voucher</option>
            </select>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pb-3.5 text-ink-subtle">
              <AppIcon name="line-chevron-down" class="size-3.5" />
            </span>
          </div>
        </div>

        <!-- SECTION 6: TEMPLATE -->
        <div class="space-y-2 pt-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Template
          </h3>
          <div class="relative w-full border-b border-line-soft pb-3.5">
            <select
              :value="config.templateUrl"
              class="w-full appearance-none rounded-lg border border-line bg-[#f7f9fc] py-2 pr-9 pl-3 text-xs font-medium text-ink-heading outline-none transition focus:border-primary"
              @change="
                emit('update:config', {
                  ...config,
                  templateUrl: ($event.target as HTMLSelectElement).value,
                })
              "
            >
              <option value="https://kiosk.smartven.com/template/alpha-v2">Pilih URL (SmartVen Alpha v2)</option>
              <option value="https://kiosk.smartven.com/template/modern-blue">SmartVen Modern Blue</option>
              <option value="https://kiosk.smartven.com/template/dark-edition">SmartVen Dark Edition</option>
            </select>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pb-3.5 text-ink-subtle">
              <AppIcon name="line-chevron-down" class="size-3.5" />
            </span>
          </div>
        </div>
      </template>

      <!-- ================= TAB 2: FISIK (Figma 1097:21058: 5.3-D-UI Settings) ================= -->
      <template v-else-if="activeTab === 'fisik'">
        <div class="space-y-4">
          <!-- SECTION 1: NAMA MESIN (Figma 1097:21189) -->
          <div class="space-y-1.5 pt-1">
            <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
              Nama Mesin
            </h3>
            <div class="border-b border-line pb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                {{ machineCode || 'VMENIG010' }}
              </span>
            </div>
          </div>

          <!-- SECTION 2: TIPE MODEL 3D (Dropdown pilih seluruh model 3D vending) -->
          <div class="space-y-1.5 pt-1">
            <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
              Model 3D Vending
            </h3>
            <div class="relative w-full border-b border-line-soft pb-3.5">
              <select
                :value="model3dType"
                class="w-full appearance-none rounded-lg border border-line bg-[#f7f9fc] py-2 pr-9 pl-3 text-xs font-medium text-ink-heading outline-none transition focus:border-primary"
                @change="
                  emit(
                    'update:model3dType',
                    ($event.target as HTMLSelectElement).value as Vending3DModelType,
                  )
                "
              >
                <optgroup v-for="group in VENDING_3D_MODEL_GROUPS" :key="group.category" :label="group.category">
                  <option v-for="model in group.items" :key="model.id" :value="model.id">
                    {{ model.label }}
                  </option>
                </optgroup>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pb-3.5 text-ink-subtle">
                <AppIcon name="line-chevron-down" class="size-3.5" />
              </span>
            </div>
          </div>

          <!-- SECTION 3: TIPE MESIN (Backend Config) -->
          <div class="space-y-1.5 pt-1">
            <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
              Tipe Mesin
            </h3>
            <div class="relative w-full border-b border-line-soft pb-3.5">
              <select
                :value="physicalConfig.machineType"
                class="w-full appearance-none rounded-lg border border-line bg-[#f7f9fc] py-2 pr-9 pl-3 text-xs font-medium text-ink-heading outline-none transition focus:border-primary"
                @change="
                  emit('update:physicalConfig', {
                    ...physicalConfig,
                    machineType: ($event.target as HTMLSelectElement).value as 'TCN22' | 'TCN49',
                  })
                "
              >
                <option value="TCN22">Smartven SV-22 Chiller (Layar 22 Inch)</option>
                <option value="TCN49">Smartven TCN-49 (Layar 49 Inch Full Touch)</option>
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pb-3.5 text-ink-subtle">
                <AppIcon name="line-chevron-down" class="size-3.5" />
              </span>
            </div>
          </div>

          <!-- SECTION 4: UPLOAD STICKER DI DEPAN (Figma 1097:21217) -->
          <StickerUploadItem
            title="UPLOAD Sticker di Depan"
            side="front"
            :sticker="stickers?.front ?? null"
            @upload="(side, file) => emit('uploadSticker', side, file)"
            @remove="(side) => emit('removeSticker', side)"
          />

          <!-- SECTION 5: UPLOAD STICKER DI BELAKANG -->
          <StickerUploadItem
            title="UPLOAD Sticker di Belakang"
            side="back"
            :sticker="stickers?.back ?? null"
            @upload="(side, file) => emit('uploadSticker', side, file)"
            @remove="(side) => emit('removeSticker', side)"
          />

          <!-- SECTION 6: UPLOAD STICKER DI KIRI (Figma 1097:21231) -->
          <StickerUploadItem
            title="UPLOAD Sticker di Kiri"
            side="left"
            :sticker="stickers?.left ?? null"
            @upload="(side, file) => emit('uploadSticker', side, file)"
            @remove="(side) => emit('removeSticker', side)"
          />

          <!-- SECTION 7: UPLOAD STICKER DI KANAN (Figma 1097:21245) -->
          <StickerUploadItem
            title="UPLOAD Sticker di Kanan"
            side="right"
            :sticker="stickers?.right ?? null"
            @upload="(side, file) => emit('uploadSticker', side, file)"
            @remove="(side) => emit('removeSticker', side)"
          />

          <!-- UNDUH PREVIEW 3D BUTTON (Figma 1097:21259) -->
          <div class="pt-2">
            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-[0.98] cursor-pointer"
              @click="emit('downloadPreview')"
            >
              <AppIcon name="download" class="size-4" />
              <span>Unduh Preview 3D</span>
            </button>
          </div>

          <!-- COLLAPSIBLE: PENGATURAN SUHU & SENSOR (Backend Supported) -->
          <div class="rounded-xl border border-line-soft bg-surface-muted/40 p-3 pt-2">
            <button
              type="button"
              class="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-subtle cursor-pointer"
              @click="showHardwareSettings = !showHardwareSettings"
            >
              <span>Pengaturan Sensor & Suhu</span>
              <AppIcon
                name="line-chevron-down"
                class="size-3.5 transition-transform duration-200"
                :class="showHardwareSettings ? 'rotate-180' : ''"
              />
            </button>

            <div v-show="showHardwareSettings" class="mt-3 space-y-3.5 border-t border-line-soft pt-3">
              <!-- Target Suhu -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <p class="text-xs font-medium text-ink-heading">Target Suhu Pendingin</p>
                  <span class="text-xs font-bold text-primary">{{ physicalConfig.targetTemperature }}°C</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="25"
                  step="1"
                  :value="physicalConfig.targetTemperature"
                  class="w-full accent-primary"
                  @input="
                    emit('update:physicalConfig', {
                      ...physicalConfig,
                      targetTemperature: Number(($event.target as HTMLInputElement).value),
                    })
                  "
                />
                <p class="text-[10px] text-ink-subtle">Rentang optimal: 12°C - 19°C</p>
              </div>

              <!-- Lampu LED -->
              <div class="flex items-center justify-between pt-1">
                <div>
                  <p class="text-xs font-medium text-ink-heading">Lampu LED Kiosk</p>
                  <p class="text-[10px] text-ink-subtle">Penerangan etalase & panel</p>
                </div>
                <button
                  type="button"
                  class="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
                  :class="physicalConfig.ledLightEnabled ? 'bg-primary' : 'bg-surface-muted border border-line'"
                  @click="
                    emit('update:physicalConfig', {
                      ...physicalConfig,
                      ledLightEnabled: !physicalConfig.ledLightEnabled,
                    })
                  "
                >
                  <span
                    class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-xs transition-transform duration-200"
                    :class="physicalConfig.ledLightEnabled ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Sensor Jatuh -->
              <div class="flex items-center justify-between pt-1">
                <div>
                  <p class="text-xs font-medium text-ink-heading">Sensor Deteksi Jatuh</p>
                  <p class="text-[10px] text-ink-subtle">Verifikasi barang sampai ke dispenser</p>
                </div>
                <button
                  type="button"
                  class="relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer"
                  :class="physicalConfig.dropSensorEnabled ? 'bg-primary' : 'bg-surface-muted border border-line'"
                  @click="
                    emit('update:physicalConfig', {
                      ...physicalConfig,
                      dropSensorEnabled: !physicalConfig.dropSensorEnabled,
                    })
                  "
                >
                  <span
                    class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-xs transition-transform duration-200"
                    :class="physicalConfig.dropSensorEnabled ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ================= TAB 3: PEMBAYARAN ================= -->
      <template v-else-if="activeTab === 'pembayaran'">
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Metode & Aturan Pembayaran
          </h3>

          <!-- QRIS -->
          <div class="flex items-center justify-between border-b border-line-soft pb-3.5">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                QRIS Dinamis
              </p>
              <p class="text-[10px] text-ink-subtle">GoPay, OVO, Dana, ShopeePay, BCA</p>
            </div>
            <button
              type="button"
              class="relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer"
              :class="paymentConfig.qris ? 'bg-primary' : 'bg-surface-muted border border-line'"
              @click="
                emit('update:paymentConfig', {
                  ...paymentConfig,
                  qris: !paymentConfig.qris,
                })
              "
            >
              <span
                class="absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="paymentConfig.qris ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Uang Tunai -->
          <div class="flex items-center justify-between border-b border-line-soft pb-3.5">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                Akseptor Uang Kertas
              </p>
              <p class="text-[10px] text-ink-subtle">Pecahan Rp 2.000 s/d Rp 50.000</p>
            </div>
            <button
              type="button"
              class="relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer"
              :class="paymentConfig.cash ? 'bg-primary' : 'bg-surface-muted border border-line'"
              @click="
                emit('update:paymentConfig', {
                  ...paymentConfig,
                  cash: !paymentConfig.cash,
                })
              "
            >
              <span
                class="absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="paymentConfig.cash ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Kartu Uang Elektronik -->
          <div class="flex items-center justify-between border-b border-line-soft pb-3.5">
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
                Kartu Elektronik (NFC Tap)
              </p>
              <p class="text-[10px] text-ink-subtle">Flazz, e-Money, TapCash, Brizzi</p>
            </div>
            <button
              type="button"
              class="relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer"
              :class="paymentConfig.card ? 'bg-primary' : 'bg-surface-muted border border-line'"
              @click="
                emit('update:paymentConfig', {
                  ...paymentConfig,
                  card: !paymentConfig.card,
                })
              "
            >
              <span
                class="absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="paymentConfig.card ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Timeout Transaksi -->
          <div class="space-y-1.5 border-b border-line-soft pb-3.5">
            <p class="text-xs font-bold uppercase tracking-wider text-ink-heading">
              Batas Waktu Transaksi
            </p>
            <select
              :value="paymentConfig.timeoutSeconds"
              class="w-full rounded-lg border border-line bg-[#f7f9fc] py-2 px-3 text-xs font-medium text-ink outline-none focus:border-primary"
              @change="
                emit('update:paymentConfig', {
                  ...paymentConfig,
                  timeoutSeconds: Number(($event.target as HTMLSelectElement).value),
                })
              "
            >
              <option :value="60">60 Detik</option>
              <option :value="90">90 Detik</option>
              <option :value="120">120 Detik (Disarankan)</option>
              <option :value="180">180 Detik</option>
            </select>
          </div>
        </div>
      </template>
    </div>

    <!-- Sticky Bottom Action Bar (Figma: Bottom Action 1097:21672) -->
    <div class="border-t border-line-soft bg-[#f7f9fc] p-6 shrink-0 flex items-center gap-3">
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-2xl border border-line-strong bg-surface py-3 px-4 text-sm font-bold text-[#334155] shadow-sm transition hover:bg-surface-hover active:scale-[0.98] cursor-pointer"
        :class="fullscreen ? 'w-full' : 'flex-1'"
        @click="emit('reset')"
      >
        <AppIcon name="restart" class="size-4 text-[#334155]" />
        <span>Reset ke Default</span>
      </button>

      <button
        v-if="!fullscreen"
        type="button"
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover active:scale-[0.98] cursor-pointer disabled:opacity-60"
        :disabled="saving"
        @click="emit('save')"
      >
        <span v-if="saving" class="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        <span>{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
      </button>
    </div>
  </div>
</template>
