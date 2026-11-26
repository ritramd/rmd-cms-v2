<script setup lang="ts">
// Figma: 5.10-D-Physics UI Preview (1097:21468) & 5.9-D-Editor Visual Fullscreen (1097:12209)
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBreadcrumb from '@/components/ui/AppBreadcrumb.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppToast from '@/components/ui/AppToast.vue'
import LivePreviewControls from '@/components/editor/LivePreviewControls.vue'
import LivePreviewEditorSidebar from '@/components/editor/LivePreviewEditorSidebar.vue'
import LivePreviewFullscreenHeader from '@/components/editor/LivePreviewFullscreenHeader.vue'
import LivePreviewMachineMockup from '@/components/editor/LivePreviewMachineMockup.vue'
import VendingMachine3DViewer from '@/components/editor/VendingMachine3DViewer.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { fetchKelolaVendingMachines } from '@/services/kelolaVending'
import {
  fetchMachineConfig,
  fetchVmConfig,
  updateMachineConfig,
  updateVmConfig,
} from '@/services/vmConfig'
import {
  VENDING_3D_MODEL_GROUPS,
  VENDING_3D_MODELS,
  type StickerItem,
  type StickerSide,
  type Vending3DModelType,
} from '@/types/editor3d'
import {
  DEFAULT_PAYMENT_CONFIG,
  DEFAULT_PHYSICAL_CONFIG,
  DEFAULT_UI_CONFIG,
  type PaymentConfig,
  type PhysicalConfig,
  type UiEditorConfig,
} from '@/types/editor'
import type { KelolaVendingMachine } from '@/types/kelolaVending'

const route = useRoute()
const router = useRouter()

// Machine selection
const machines = ref<KelolaVendingMachine[]>([])
const selectedMachineCode = ref((route.query.machine as string) || 'VMENIG010')

// Fullscreen mode state
const isFullscreen = ref(
  route.query.mode === 'fullscreen' ||
    route.query.fullscreen === 'true' ||
    route.path === '/editor-visual',
)

// Reactive configuration state
const uiConfig = ref<UiEditorConfig>({ ...DEFAULT_UI_CONFIG })
const physicalConfig = ref<PhysicalConfig>({ ...DEFAULT_PHYSICAL_CONFIG })
const paymentConfig = ref<PaymentConfig>({ ...DEFAULT_PAYMENT_CONFIG })
const activeTab = ref<'antarmuka' | 'fisik' | 'pembayaran'>('antarmuka')

// Canvas scale, saving & toast
const scale = ref(1)
const autoFitScale = ref(1)
const previewContainerRef = ref<HTMLElement | null>(null)
const saving = ref(false)
const toast = ref<string | null>(null)
const toastVariant = ref<'success' | 'error'>('success')

// 3D Model Viewer state (SV 22 Chiller & Cardshack) & sticker wraps
const viewer3DRef = ref<InstanceType<typeof VendingMachine3DViewer> | null>(null)
const previewMode = ref<'3d' | 'screen'>('3d')
const model3dType = ref<Vending3DModelType>('SV22')
const stickers = ref<Record<StickerSide, StickerItem | null>>({
  front: null,
  back: null,
  left: null,
  right: null,
})

const SIDE_LABELS: Record<StickerSide, string> = {
  front: 'depan',
  back: 'belakang',
  left: 'kiri',
  right: 'kanan',
}

const active3DModelMeta = computed(() => {
  return VENDING_3D_MODELS.find((m) => m.id === model3dType.value) ?? VENDING_3D_MODELS[0]
})

// Auto sync preview mode when sidebar tab switches
watch(activeTab, (tab) => {
  if (tab === 'fisik') {
    previewMode.value = '3d'
  } else if (tab === 'antarmuka') {
    previewMode.value = 'screen'
  }
})

async function handleStickerUpload(side: StickerSide, file: File) {
  previewMode.value = '3d'
  await nextTick()
  if (viewer3DRef.value) {
    try {
      await viewer3DRef.value.applySticker(side, file)
      stickers.value = { ...viewer3DRef.value.stickers }
      toastVariant.value = 'success'
      toast.value = `Sticker sisi ${SIDE_LABELS[side]} berhasil diterapkan ke model 3D.`
    } catch {
      toastVariant.value = 'error'
      toast.value = `Gagal memuat gambar sticker sisi ${SIDE_LABELS[side]}.`
    }
  }
}

function handleStickerRemove(side: StickerSide) {
  if (viewer3DRef.value) {
    viewer3DRef.value.removeSticker(side)
    stickers.value = { ...viewer3DRef.value.stickers }
    toastVariant.value = 'success'
    toast.value = `Sticker sisi ${SIDE_LABELS[side]} berhasil dihapus.`
  }
}

function handleDownloadPreview() {
  if (viewer3DRef.value) {
    const prefix = active3DModelMeta.value.filePrefix
    viewer3DRef.value.captureSnapshot(`${prefix}_${selectedMachineCode.value || 'Preview'}_3D.png`)
    toastVariant.value = 'success'
    toast.value = 'Pratinjau 3D berhasil diunduh.'
  }
}

const effectiveScale = computed(() => {
  return Number((scale.value * autoFitScale.value).toFixed(2))
})

function updateAutoFit() {
  if (!previewContainerRef.value) return
  const rect = previewContainerRef.value.getBoundingClientRect()
  // Mockup base height is 640px + shadow ~660px.
  // Leave 80px buffer for floating controls / breadcrumbs breathing room
  const availableH = rect.height - 80
  if (availableH < 660 && availableH > 200) {
    autoFitScale.value = Math.max(0.65, Number((availableH / 660).toFixed(2)))
  } else {
    autoFitScale.value = 1
  }
}

const selectedMachine = computed(() => {
  return (
    machines.value.find((m) => m.code === selectedMachineCode.value) ||
    machines.value[0] ||
    null
  )
})

async function loadMachines() {
  try {
    machines.value = await fetchKelolaVendingMachines()
    if (!route.query.machine && machines.value.length > 0) {
      selectedMachineCode.value = machines.value[0].code
    }
  } catch {
    // Graceful fallback
  }
}

async function loadMachineConfig(code: string) {
  if (!code) return
  try {
    const [vmConf, machConf] = await Promise.all([
      fetchVmConfig(code),
      fetchMachineConfig(code),
    ])

    const form = vmConf?.form
    if (form) {
      paymentConfig.value.qris = form.isQris
      paymentConfig.value.cash = form.isCash
      paymentConfig.value.card = form.isEmoney
      if (form.buttonColor) {
        uiConfig.value.warnaAksen = form.buttonColor
      }
      if (form.journey) {
        uiConfig.value.journey = form.journey
      }
      if (form.module) {
        uiConfig.value.module = form.module
      }
      if (form.prefixUrl) {
        uiConfig.value.templateUrl = form.prefixUrl
      }
    }

    if (machConf) {
      physicalConfig.value.dropSensorEnabled = machConf.isDropSensor
      if (machConf.type_machine === 'TCN22' || machConf.type_machine === 'TCN49') {
        physicalConfig.value.machineType = machConf.type_machine
      }
    }
  } catch (err) {
    console.error('Gagal memuat konfigurasi mesin:', err)
  }
}

watch(
  selectedMachineCode,
  (code) => {
    if (code) {
      void router.replace({ query: { ...route.query, machine: code } })
      void loadMachineConfig(code)
    }
  },
  { immediate: true },
)

watch(
  () => [route.query, route.path],
  ([query, path]) => {
    isFullscreen.value =
      (query as Record<string, string>).mode === 'fullscreen' ||
      (query as Record<string, string>).fullscreen === 'true' ||
      path === '/editor-visual'
  },
)

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  const query = { ...route.query }
  if (isFullscreen.value) {
    query.mode = 'fullscreen'
  } else {
    delete query.mode
    delete query.fullscreen
  }
  if (route.path === '/editor-visual' && !isFullscreen.value) {
    void router.push({ path: '/live-preview', query })
  } else {
    void router.replace({ query })
  }
}

function exitFullscreen() {
  isFullscreen.value = false
  const query = { ...route.query }
  delete query.mode
  delete query.fullscreen
  if (route.path === '/editor-visual') {
    void router.push({ path: '/live-preview', query })
  } else {
    void router.replace({ query })
  }
}

function zoomIn() {
  if (scale.value < 1.3) {
    scale.value = Number((scale.value + 0.1).toFixed(1))
  }
}

function zoomOut() {
  if (scale.value > 0.7) {
    scale.value = Number((scale.value - 0.1).toFixed(1))
  }
}

function resetZoom() {
  scale.value = 1
}

async function handleReset() {
  uiConfig.value = { ...DEFAULT_UI_CONFIG }
  physicalConfig.value = { ...DEFAULT_PHYSICAL_CONFIG }
  paymentConfig.value = { ...DEFAULT_PAYMENT_CONFIG }
  scale.value = 1
  if (viewer3DRef.value) {
    viewer3DRef.value.resetAll()
    stickers.value = { front: null, back: null, left: null, right: null }
  }
  if (selectedMachineCode.value) {
    await loadMachineConfig(selectedMachineCode.value)
  }
  toastVariant.value = 'success'
  toast.value = 'Pengaturan antarmuka & mesin berhasil dikembalikan ke default.'
}

async function handleSave() {
  if (!selectedMachineCode.value) return
  saving.value = true
  try {
    const code = selectedMachineCode.value

    // 1. Simpan konfigurasi VM ke backend (PUT /config)
    await updateVmConfig(code, {
      isQris: paymentConfig.value.qris,
      isCash: paymentConfig.value.cash,
      isEmoney: paymentConfig.value.card,
      buttonColor: uiConfig.value.warnaAksen,
      journey: uiConfig.value.journey,
      module: uiConfig.value.module,
      prefixUrl: uiConfig.value.templateUrl,
    })

    // 2. Simpan konfigurasi Mesin ke backend (PUT /vm/config)
    await updateMachineConfig(code, {
      isDropSensor: physicalConfig.value.dropSensorEnabled,
      type_machine: physicalConfig.value.machineType,
    })

    toastVariant.value = 'success'
    toast.value = 'Konfigurasi mesin berhasil disimpan ke backend.'
  } catch (err) {
    console.error('Gagal menyimpan konfigurasi mesin:', err)
    toastVariant.value = 'error'
    toast.value = 'Gagal menyimpan konfigurasi ke backend.'
  } finally {
    saving.value = false
  }
}

function handleLogoUpload(file: File) {
  const url = URL.createObjectURL(file)
  const sizeKb = Math.round(file.size / 1024)
  uiConfig.value = {
    ...uiConfig.value,
    logoHeaderName: file.name,
    logoHeaderSize: `${file.type.split('/')[1]?.toUpperCase() || 'IMG'} • ${sizeKb} KB`,
    logoHeaderUrl: url,
  }
  toastVariant.value = 'success'
  toast.value = `Logo "${file.name}" berhasil diunggah.`
}

onMounted(async () => {
  await loadMachines()
  updateAutoFit()
  window.addEventListener('resize', updateAutoFit)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateAutoFit)
})
</script>

<template>
  <!-- ================= FULLSCREEN MODE (Figma: 5.9-D-Editor Visual 1097:12209) ================= -->
  <div
    v-if="isFullscreen"
    class="flex h-screen w-screen flex-col bg-[#eff6ff] overflow-hidden select-none"
  >
    <!-- TopNavBar (Figma: 1097:12210) -->
    <LivePreviewFullscreenHeader
      :saving="saving"
      @exit-fullscreen="exitFullscreen"
      @save="handleSave"
    />

    <!-- Main Content Area (Figma: 1097:12230) -->
    <div class="relative flex flex-1 w-full min-h-0 overflow-hidden">
      <!-- Left Sidebar: Editor (Figma: 1097:12231) -->
      <LivePreviewEditorSidebar
        v-model:active-tab="activeTab"
        v-model:config="uiConfig"
        v-model:physical-config="physicalConfig"
        v-model:payment-config="paymentConfig"
        v-model:model3d-type="model3dType"
        :stickers="stickers"
        :machine-code="selectedMachine?.code"
        :machine-name="selectedMachine?.name"
        :fullscreen="true"
        :saving="saving"
        @reset="handleReset"
        @save="handleSave"
        @logo-upload="handleLogoUpload"
        @upload-sticker="handleStickerUpload"
        @remove-sticker="handleStickerRemove"
        @download-preview="handleDownloadPreview"
      />

      <!-- Right: Preview Area (Figma: 1097:12333) -->
      <div
        class="relative flex flex-1 flex-col items-center justify-between overflow-hidden bg-[#eff6ff]"
      >
        <!-- Floating Top Bar: Label, 3D Model Type Dropdown & View Switcher -->
        <div class="absolute inset-x-6 top-6 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <!-- Floating Label (Figma: 1097:12341) -->
          <div class="pointer-events-auto flex max-w-[360px] items-center gap-2 rounded-full border border-white/60 bg-white/85 px-4 py-2 shadow-xs backdrop-blur-md">
            <span class="relative flex size-2 shrink-0">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <div class="flex min-w-0 items-center gap-1 text-xs text-[#4b5563]">
              <span class="shrink-0 font-medium">Live Preview:</span>
              <span
                class="truncate font-bold text-[#111827]"
                :title="selectedMachine ? `${selectedMachine.code} - ${selectedMachine.name}` : 'SmartVen Alpha'"
              >
                {{ selectedMachine ? `${selectedMachine.code} - ${selectedMachine.name}` : 'SmartVen Alpha' }}
              </span>
            </div>
            <!-- Quick Machine Selector dropdown -->
            <div v-if="machines.length > 1" class="relative shrink-0 flex items-center pl-1 cursor-pointer">
              <select
                v-model="selectedMachineCode"
                class="absolute inset-0 size-full cursor-pointer opacity-0"
                title="Pilih Mesin"
              >
                <option v-for="m in machines" :key="m.code" :value="m.code">
                  {{ m.code }} - {{ m.name }}
                </option>
              </select>
              <AppIcon name="line-chevron-down" class="size-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div class="pointer-events-auto flex flex-wrap items-center gap-2.5">
            <!-- 3D Model Selector Pill Dropdown (SV 22 vs Cardshack) -->
            <div
              v-if="previewMode === '3d'"
              class="relative flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3.5 py-1.5 shadow-xs backdrop-blur-md transition hover:bg-white cursor-pointer"
            >
              <span class="text-[11px] font-semibold text-ink-subtle">Tipe 3D:</span>
              <span class="text-xs font-bold text-ink-heading">{{ active3DModelMeta.shortName }}</span>
              <AppIcon name="line-chevron-down" class="size-3 text-slate-400 pointer-events-none" />
              <select
                v-model="model3dType"
                class="absolute inset-0 size-full cursor-pointer opacity-0"
                title="Pilih Tipe Vending 3D"
              >
                <optgroup v-for="group in VENDING_3D_MODEL_GROUPS" :key="group.category" :label="group.category">
                  <option v-for="m in group.items" :key="m.id" :value="m.id">
                    {{ m.label }}
                  </option>
                </optgroup>
              </select>
            </div>

            <!-- View Mode Switcher Pill (3D vs 2D Screen Mockup) -->
            <div class="flex items-center gap-1 rounded-full border border-white/70 bg-white/90 p-1 shadow-xs backdrop-blur-md">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                :class="previewMode === '3d' ? 'bg-primary text-white shadow-xs' : 'text-ink-subtle hover:text-ink-heading hover:bg-slate-100'"
                @click="previewMode = '3d'"
              >
                <span>Model 3D</span>
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                :class="previewMode === 'screen' ? 'bg-primary text-white shadow-xs' : 'text-ink-subtle hover:text-ink-heading hover:bg-slate-100'"
                @click="previewMode = 'screen'"
              >
                <span>Layar UI Mockup</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 3D Vending Canvas View (v-show preserves WebGL scene & textures across mode switches) -->
        <div v-show="previewMode === '3d'" class="size-full">
          <VendingMachine3DViewer
            ref="viewer3DRef"
            :machine-name="selectedMachine?.name"
            :machine-code="selectedMachine?.code"
            :accent-color="uiConfig.warnaAksen"
            :model-type="model3dType"
            :initial-stickers="stickers"
            class="size-full"
          />
        </div>

        <!-- 2D Screen UI Editor View -->
        <template v-if="previewMode === 'screen'">
          <div class="relative z-10 my-auto flex size-full items-center justify-center p-8 overflow-hidden">
            <LivePreviewMachineMockup
              :config="uiConfig"
              :physical-config="physicalConfig"
              :machine-name="selectedMachine?.name"
              :machine-code="selectedMachine?.code"
              :scale="effectiveScale"
            />
          </div>

          <!-- View Controls (Figma: 1097:12336 at bottom-right) -->
          <div class="absolute bottom-8 right-8 z-20">
            <LivePreviewControls
              :scale="scale"
              :is-fullscreen="true"
              @zoom-in="zoomIn"
              @zoom-out="zoomOut"
              @reset="resetZoom"
              @toggle-fullscreen="toggleFullscreen"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Notification Toast -->
    <AppToast v-model="toast" :variant="toastVariant" />
  </div>

  <!-- ================= STANDARD MODE (Figma: 5.5-D-Planogram 1097:21680 & 5.10-D-Physics UI Preview 1097:21468) ================= -->
  <DashboardLayout v-else title="Live Preview" :no-padding="true" :hide-header="true">
    <div class="flex h-screen w-full overflow-hidden bg-canvas">
      <!-- CENTER: PREVIEW AREA (Figma: 1097:21735 / 1097:21523) -->
      <div
        ref="previewContainerRef"
        class="relative flex flex-1 items-center justify-center overflow-hidden bg-[#eff6ff] select-none"
        style="
          background-image: radial-gradient(circle, rgba(148, 163, 184, 0.25) 1px, transparent 1px);
          background-size: 20px 20px;
        "
      >
        <!-- Floating Top Bar: Breadcrumb, Machine Selector, 3D Type Dropdown & View Switcher -->
        <div class="pointer-events-none absolute inset-x-6 top-5 z-20 flex flex-wrap items-center justify-between gap-2.5">
          <div class="pointer-events-auto flex flex-wrap items-center gap-2.5">
            <!-- Breadcrumb (Figma: 1097:21737) -->
            <AppBreadcrumb
              class="shrink-0 whitespace-nowrap"
              :items="[
                { label: 'Home', to: '/' },
                { label: 'Daftar Vending', to: '/kelola-vending' },
                { label: 'Live Preview' },
              ]"
            />

            <!-- Machine Quick Selector Pill -->
            <div
              class="relative flex min-w-[160px] max-w-[230px] shrink-0 items-center gap-2 rounded-2xl border border-line-soft bg-surface/95 px-3.5 py-2 shadow-xs backdrop-blur transition hover:border-line hover:bg-surface cursor-pointer select-none"
              :title="selectedMachine ? `${selectedMachine.code} - ${selectedMachine.name}` : selectedMachineCode"
            >
              <span class="shrink-0 text-xs font-semibold text-ink-subtle">Mesin:</span>
              <span class="min-w-0 flex-1 truncate text-xs font-bold text-ink-strong">
                {{ selectedMachine ? `${selectedMachine.code} - ${selectedMachine.name}` : selectedMachineCode || 'Pilih Mesin' }}
              </span>
              <AppIcon name="line-chevron-down" class="size-3.5 shrink-0 text-ink-subtle pointer-events-none" />

              <!-- Invisible native select overlay for accessible click interaction -->
              <select
                v-model="selectedMachineCode"
                class="absolute inset-0 size-full cursor-pointer opacity-0"
                title="Pilih Mesin"
              >
                <option v-for="m in machines" :key="m.code" :value="m.code">
                  {{ m.code }} - {{ m.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="pointer-events-auto flex flex-wrap items-center gap-2">
            <!-- 3D Model Selector Pill Dropdown (SV 22 vs Cardshack) -->
            <div
              v-if="previewMode === '3d'"
              class="relative flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3.5 py-1.5 shadow-xs backdrop-blur-md transition hover:bg-white cursor-pointer"
            >
              <span class="text-[11px] font-semibold text-ink-subtle">Tipe 3D:</span>
              <span class="text-xs font-bold text-ink-heading">{{ active3DModelMeta.shortName }}</span>
              <AppIcon name="line-chevron-down" class="size-3 text-slate-400 pointer-events-none" />
              <select
                v-model="model3dType"
                class="absolute inset-0 size-full cursor-pointer opacity-0"
                title="Pilih Tipe Vending 3D"
              >
                <optgroup v-for="group in VENDING_3D_MODEL_GROUPS" :key="group.category" :label="group.category">
                  <option v-for="m in group.items" :key="m.id" :value="m.id">
                    {{ m.label }}
                  </option>
                </optgroup>
              </select>
            </div>

            <!-- View Mode Switcher Pill (Model 3D vs Layar UI Mockup) -->
            <div class="flex items-center gap-1 rounded-full border border-white/70 bg-white/95 p-1 shadow-xs backdrop-blur-md">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                :class="previewMode === '3d' ? 'bg-primary text-white shadow-xs' : 'text-ink-subtle hover:text-ink-heading hover:bg-slate-100'"
                @click="previewMode = '3d'"
              >
                <span>Model 3D</span>
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                :class="previewMode === 'screen' ? 'bg-primary text-white shadow-xs' : 'text-ink-subtle hover:text-ink-heading hover:bg-slate-100'"
                @click="previewMode = 'screen'"
              >
                <span>Layar UI Mockup</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 3D Vending Canvas View (v-show preserves WebGL scene & textures across mode switches) -->
        <div v-show="previewMode === '3d'" class="size-full">
          <VendingMachine3DViewer
            ref="viewer3DRef"
            :machine-name="selectedMachine?.name"
            :machine-code="selectedMachine?.code"
            :accent-color="uiConfig.warnaAksen"
            :model-type="model3dType"
            :initial-stickers="stickers"
            class="size-full"
          />
        </div>

        <!-- 2D Screen UI Editor View -->
        <template v-if="previewMode === 'screen'">
          <div class="relative z-10 flex size-full items-center justify-center py-4">
            <LivePreviewMachineMockup
              :config="uiConfig"
              :physical-config="physicalConfig"
              :machine-name="selectedMachine?.name"
              :machine-code="selectedMachine?.code"
              :scale="effectiveScale"
            />
          </div>

          <!-- Floating Bottom Left: Status Label (Figma: 1097:21749) -->
          <div class="absolute bottom-8 left-8 z-20 flex max-w-[calc(50%-180px)] items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
            <span class="relative flex size-2 shrink-0">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <div class="flex min-w-0 items-center gap-1 text-xs text-[#4b5563]">
              <span class="shrink-0 font-medium">Live Preview:</span>
              <span
                class="truncate font-bold text-[#111827]"
                :title="selectedMachine ? `${selectedMachine.code} - ${selectedMachine.name}` : 'SmartVen Alpha'"
              >
                {{ selectedMachine ? `${selectedMachine.code} - ${selectedMachine.name}` : 'SmartVen Alpha' }}
              </span>
            </div>
          </div>

          <!-- Floating Bottom Right: View Controls (Figma: 1097:21744) -->
          <div class="absolute bottom-8 right-8 z-20">
            <LivePreviewControls
              :scale="scale"
              :is-fullscreen="false"
              @zoom-in="zoomIn"
              @zoom-out="zoomOut"
              @reset="resetZoom"
              @toggle-fullscreen="toggleFullscreen"
            />
          </div>
        </template>
      </div>

      <!-- RIGHT: EDITOR SIDEBAR (Figma: 1097:21756) -->
      <LivePreviewEditorSidebar
        v-model:active-tab="activeTab"
        v-model:config="uiConfig"
        v-model:physical-config="physicalConfig"
        v-model:payment-config="paymentConfig"
        v-model:model3d-type="model3dType"
        :stickers="stickers"
        :machine-code="selectedMachine?.code"
        :machine-name="selectedMachine?.name"
        :fullscreen="false"
        :saving="saving"
        @reset="handleReset"
        @save="handleSave"
        @logo-upload="handleLogoUpload"
        @upload-sticker="handleStickerUpload"
        @remove-sticker="handleStickerRemove"
        @download-preview="handleDownloadPreview"
      />
    </div>

    <!-- Notification Toast -->
    <AppToast v-model="toast" :variant="toastVariant" />
  </DashboardLayout>
</template>
