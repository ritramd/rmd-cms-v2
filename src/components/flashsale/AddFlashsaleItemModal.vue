<script setup lang="ts">
// Figma: Flashsale Item Modal (1097:37474 / 1097:37897)
// Sliced from node 1097:37897 matching Figma layout, styling tokens, staged items, and confirmed items.
import { computed, onMounted, ref, watch } from 'vue'
import defaultFaceScrub from '@/assets/demo/face-scrub.png'
import AppModal from '@/components/ui/AppModal.vue'
import OnboardingTooltip from '@/components/ui/OnboardingTooltip.vue'
import { storageUrl } from '@/config/env'
import { fetchMachineProducts } from '@/services/flashsale'
import type { AddFlashsaleItemsPayload, FlashsaleItemDetail } from '@/types/flashsale'
import type { ProductRecord } from '@/types/product'
import { formatCurrencyInput, formatRupiah, parseCurrencyInput } from '@/utils/format'

interface StagedItem {
  id: string
  productId: number | null
  price: number | null
}

const props = withDefaults(
  defineProps<{
    open: boolean
    flashsaleId: number
    flashsaleName?: string
    vmcode: string
    showTooltip?: boolean
    existingItems?: FlashsaleItemDetail[]
  }>(),
  {
    flashsaleName: 'Flashsale 1',
    showTooltip: false,
    existingItems: () => [],
  },
)

const emit = defineEmits<{
  close: []
  saved: [payload: AddFlashsaleItemsPayload]
  deleteItem: [item: FlashsaleItemDetail]
  tooltipNext: []
  tooltipClose: []
}>()

const searchQuery = ref('')
const products = ref<ProductRecord[]>([])
const loadingProducts = ref(false)
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const successFeedback = ref<string | null>(null)

// Confirmed items inside the modal
const confirmedItems = ref<FlashsaleItemDetail[]>([])

// Staged items being configured in the "New Items" section
const stagedItems = ref<StagedItem[]>([])

let stagedCounter = 0
function createDefaultStagedItem(): StagedItem {
  stagedCounter++
  const defaultProd = products.value[0]
  return {
    id: `staged-${Date.now()}-${stagedCounter}`,
    productId: defaultProd?.id ?? 1,
    price: defaultProd ? Number(defaultProd.price ?? 200000) : 200000,
  }
}

async function loadProducts() {
  loadingProducts.value = true
  try {
    const list = await fetchMachineProducts(props.vmcode)
    products.value = list
    // Sync default product into staged items if any item has null productId
    stagedItems.value.forEach((item) => {
      if (!item.productId && list.length > 0) {
        item.productId = list[0].id
        item.price = Number(list[0].price ?? 200000)
      }
    })
  } catch {
    // Keep fallback list
  } finally {
    loadingProducts.value = false
  }
}

function initData() {
  searchQuery.value = ''
  errorMessage.value = null
  successFeedback.value = null
  // Initialize confirmed items clone from props
  confirmedItems.value = props.existingItems ? [...props.existingItems] : []
  // Initialize staged items: start with 2 staged items as in Figma 1097:37897
  stagedItems.value = [
    createDefaultStagedItem(),
    createDefaultStagedItem(),
  ]
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      initData()
      void loadProducts()
    }
  },
)

watch(
  () => props.existingItems,
  (newItems) => {
    if (props.open && newItems) {
      confirmedItems.value = [...newItems]
    }
  },
  { deep: true },
)

onMounted(() => {
  if (props.open) {
    initData()
  }
  void loadProducts()
})

function addStagedItem() {
  stagedItems.value.push(createDefaultStagedItem())
}

function removeStagedItem(index: number) {
  stagedItems.value.splice(index, 1)
}

function onProductSelected(index: number, id: number) {
  stagedItems.value[index].productId = id
  const prod = products.value.find((p) => p.id === id)
  if (prod) {
    stagedItems.value[index].price = Number(prod.price ?? 200000)
  }
}

function onPriceInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const rawNum = parseCurrencyInput(target.value)
  stagedItems.value[index].price = rawNum > 0 ? rawNum : null
  target.value = formatCurrencyInput(stagedItems.value[index].price)
}

function onPriceBlur(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  target.value = formatCurrencyInput(stagedItems.value[index].price)
}

function getSelectedProduct(id: number | null): ProductRecord | undefined {
  return products.value.find((p) => p.id === id)
}

function getProductPhoto(prod?: ProductRecord | FlashsaleItemDetail): string {
  if (!prod) return defaultFaceScrub
  if (prod.photo) {
    if (prod.photo.startsWith('http') || prod.photo.startsWith('/')) return prod.photo
    return storageUrl(prod.photo) ?? defaultFaceScrub
  }
  return defaultFaceScrub
}

function confirmStagedItems() {
  errorMessage.value = null
  const validStaged = stagedItems.value.filter((i) => i.productId !== null)
  if (validStaged.length === 0) {
    errorMessage.value = 'Silakan pilih produk yang valid terlebih dahulu.'
    return
  }

  validStaged.forEach((staged) => {
    const prod = getSelectedProduct(staged.productId)
    const newItem: FlashsaleItemDetail = {
      id: Date.now() + Math.floor(Math.random() * 100000),
      flashsaleId: props.flashsaleId,
      productId: staged.productId!,
      name: prod?.name || 'Bright Stuff Face Scrub',
      displayName: prod?.display_name || prod?.name || '22#Internal 50 ml',
      sku: prod?.sku || '808',
      price: staged.price ?? Number(prod?.price ?? 200000),
      photo: prod?.photo || '',
    }
    confirmedItems.value.unshift(newItem)
  })

  // Clear staged items after confirming
  stagedItems.value = []
  successFeedback.value = 'Item berhasil dikonfirmasi ke daftar!'
  setTimeout(() => {
    if (successFeedback.value) successFeedback.value = null
  }, 3000)
}

function removeConfirmedItem(item: FlashsaleItemDetail) {
  const idx = confirmedItems.value.findIndex((i) => i.id === item.id)
  if (idx >= 0) {
    confirmedItems.value.splice(idx, 1)
  }
  emit('deleteItem', item)
}

const filteredExistingItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return confirmedItems.value
  return confirmedItems.value.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(query)
    const displayMatch = item.displayName ? item.displayName.toLowerCase().includes(query) : false
    const skuMatch = item.sku ? item.sku.toLowerCase().includes(query) : false
    return nameMatch || displayMatch || skuMatch
  })
})

function saveAndContinue() {
  // If there are still staged items, confirm them automatically
  if (stagedItems.value.length > 0) {
    const validStaged = stagedItems.value.filter((i) => i.productId !== null)
    validStaged.forEach((staged) => {
      const prod = getSelectedProduct(staged.productId)
      const newItem: FlashsaleItemDetail = {
        id: Date.now() + Math.floor(Math.random() * 100000),
        flashsaleId: props.flashsaleId,
        productId: staged.productId!,
        name: prod?.name || 'Bright Stuff Face Scrub',
        displayName: prod?.display_name || prod?.name || '22#Internal 50 ml',
        sku: prod?.sku || '808',
        price: staged.price ?? Number(prod?.price ?? 200000),
        photo: prod?.photo || '',
      }
      confirmedItems.value.unshift(newItem)
    })
    stagedItems.value = []
  }

  if (confirmedItems.value.length === 0) {
    errorMessage.value = 'Silakan tambahkan setidaknya satu item flashsale.'
    return
  }

  const payload: AddFlashsaleItemsPayload = {
    flashsaleId: props.flashsaleId,
    vmcode: props.vmcode,
    items: confirmedItems.value.map((i) => ({
      productId: i.productId,
      price: i.price,
    })),
  }

  emit('saved', payload)
}
</script>

<template>
  <AppModal
    :open="open"
    title="Flashsale Item"
    width="w-full max-w-[1331px]"
    :busy="submitting"
    @close="emit('close')"
  >
    <template #outside>
      <div
        v-if="showTooltip"
        id="tooltip-modal-item"
        class="absolute -left-[335px] top-1/2 -translate-y-1/2 z-50 hidden lg:block"
      >
        <OnboardingTooltip
          title="Pilih Item Flashsale"
          description="Switch between your profiles for unique app experiences"
          button-text="Lanjut"
          pointer-position="right"
          @next="emit('tooltipNext')"
          @close="emit('tooltipClose')"
        />
      </div>
    </template>

    <div class="flex flex-col gap-5 font-sans">
      <!-- Search & Add More Bar (Figma 1097:37921) -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <!-- Search input (1097:37922) -->
        <div class="relative w-full max-w-[482px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari produk apa"
            class="h-[44px] w-full rounded-lg border border-[#e3e8ee] bg-white pl-10 pr-4 text-sm text-[#1f2937] placeholder:text-[#9ca3af] shadow-xs transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>

        <!-- Tambah Item Lainnya Button (1097:37928) -->
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-[12px] bg-[#6495ed] px-4 py-2.5 font-sans text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(59,130,246,0.2),0px_4px_6px_-4px_rgba(59,130,246,0.2)] transition-all hover:bg-blue-600 active:scale-95 cursor-pointer whitespace-nowrap"
          @click="addStagedItem"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path
              d="M13.5 8.26172H9.73828V4.5C9.73828 4.07812 9.42188 3.76172 9 3.76172C8.57812 3.76172 8.26172 4.07812 8.26172 4.5V8.26172H4.5C4.07812 8.26172 3.76172 8.57812 3.76172 9C3.76172 9.42188 4.07812 9.73828 4.5 9.73828H8.26172V13.5C8.26172 13.9219 8.57812 14.2383 9 14.2383C9.42188 14.2383 9.73828 13.9219 9.73828 13.5V9.73828H13.5C13.9219 9.73828 14.2383 9.42188 14.2383 9C14.2383 8.57812 13.9219 8.26172 13.5 8.26172Z"
              fill="white"
            />
          </svg>
          Tambah Item Lainnya
        </button>
      </div>

      <!-- Feedback notifications -->
      <div v-if="errorMessage" class="rounded-lg bg-danger-soft px-4 py-2 text-sm text-danger-strong">
        {{ errorMessage }}
      </div>
      <div v-if="successFeedback" class="rounded-lg bg-success-soft px-4 py-2 text-sm text-success-strong">
        {{ successFeedback }}
      </div>

      <!-- Main Table Container (1097:37929) -->
      <div class="overflow-x-auto rounded-xl border border-line-soft bg-white">
        <!-- Table Header (1097:37931) -->
        <div class="flex min-w-[900px] items-center border-b border-[#f1f5f9] bg-surface-muted/30 py-3.5 text-xs font-semibold uppercase tracking-[0.6px] text-[#94a3b8]">
          <div class="w-20 pl-6 shrink-0">No</div>
          <div class="w-32 pl-4 shrink-0">Photo</div>
          <div class="flex-1 min-w-[200px] px-4">Product Name</div>
          <div class="w-64 px-4 shrink-0">Price</div>
          <div class="w-28 pr-6 shrink-0 text-center">Action</div>
        </div>

        <!-- STAGED NEW ITEMS SECTION (Frame 61, 1097:37946) -->
        <div v-if="stagedItems.length > 0" class="flex flex-col bg-blue-50/10">
          <div
            v-for="(item, idx) in stagedItems"
            :key="item.id"
            class="flex min-w-[900px] items-center border-b border-[#f3f4f8] py-3.5 transition-colors hover:bg-slate-50/60"
          >
            <!-- Col 1: No -->
            <div class="w-20 pl-6 shrink-0 text-sm font-normal text-[#94a3b8]">
              {{ idx + 1 }}
            </div>

            <!-- Col 2 & 3: Photo + Product Selector (1097:37953) -->
            <div class="flex-1 min-w-[332px] px-4">
              <div class="mb-1 text-[12px] font-bold uppercase tracking-[1.2px] text-[#9ca3af]">
                NEW Item #{{ idx + 1 }}
              </div>
              <div class="relative flex h-[52px] items-center rounded-lg border border-[#e3e8ee] bg-white px-2.5 shadow-xs transition-colors focus-within:border-primary">
                <!-- Thumbnail -->
                <div class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-muted p-1 border border-line-soft">
                  <img
                    :src="getProductPhoto(getSelectedProduct(item.productId))"
                    :alt="getSelectedProduct(item.productId)?.name ?? 'Product'"
                    class="size-full object-contain"
                  />
                </div>

                <!-- Product Name & Subtitle -->
                <div class="ml-3 flex-1 min-w-0 pr-2">
                  <p class="truncate text-sm font-normal text-[#1a1f36] leading-tight">
                    {{ getSelectedProduct(item.productId)?.name || 'Pilih Produk' }}
                  </p>
                  <p class="truncate text-xs text-[#9ca3af] leading-tight">
                    {{ getSelectedProduct(item.productId)?.display_name || getSelectedProduct(item.productId)?.sku || '50 ml' }}
                  </p>
                </div>

                <!-- Chevron -->
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" class="shrink-0 text-[#6B7280]">
                  <path d="M5.4 7.2L9 10.8L12.6 7.2" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" />
                </svg>

                <!-- Select Dropdown Overlay -->
                <select
                  :value="item.productId"
                  class="absolute inset-0 size-full cursor-pointer opacity-0"
                  aria-label="Pilih Produk"
                  @change="onProductSelected(idx, Number(($event.target as HTMLSelectElement).value))"
                >
                  <option v-for="p in products" :key="p.id" :value="p.id">
                    {{ p.name }} - {{ p.display_name || p.sku }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Col 4: Price Input (1097:37983) -->
            <div class="w-64 px-4 shrink-0">
              <div class="mb-1 text-[12px] font-medium uppercase tracking-[0.3px] text-[#64748b]">
                Price
              </div>
              <div class="relative flex h-[52px] items-center rounded-lg border border-[#e2e8f0] bg-white shadow-xs overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                <span class="flex h-full w-10 shrink-0 items-center justify-center bg-[#cbd5e1] text-sm font-medium text-[#334155] select-none">
                  Rp
                </span>
                <input
                  :value="formatCurrencyInput(item.price)"
                  type="text"
                  inputmode="numeric"
                  placeholder="0"
                  class="h-full w-full px-3 text-sm font-semibold text-ink-heading placeholder:text-[#94a3b8] focus:outline-none"
                  @input="onPriceInput(idx, $event)"
                  @blur="onPriceBlur(idx, $event)"
                />
              </div>
            </div>

            <!-- Col 5: Minus Button (1097:38052) -->
            <div class="w-28 pr-6 shrink-0 flex items-center justify-center">
              <button
                type="button"
                class="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-[#9ca3af] text-white hover:bg-gray-500 transition-colors shadow-xs cursor-pointer active:scale-95"
                title="Hapus baris"
                @click="removeStagedItem(idx)"
              >
                <svg width="18" height="12" viewBox="0 0 24 16" fill="none">
                  <path d="M19 9H5V7H19V9Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Konfirmasi Button below staged rows (1097:38172) -->
          <div class="flex justify-end px-6 py-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-[12px] bg-[#22c55e] px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-600 transition-all active:scale-95 cursor-pointer"
              @click="confirmStagedItems"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13.3333 4L6 11.3333L2.66667 8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Konfirmasi
            </button>
          </div>
        </div>

        <!-- DIVIDER (Frame 63, 1097:38173) -->
        <div class="h-px w-full bg-[#f1f5f9]" />

        <!-- CONFIRMED EXISTING ITEMS SECTION (1097:38175) -->
        <div class="flex flex-col">
          <div v-if="filteredExistingItems.length === 0" class="py-12 text-center text-sm text-ink-soft">
            <p v-if="searchQuery">Tidak ada produk yang cocok dengan pencarian "{{ searchQuery }}".</p>
            <p v-else>Belum ada produk dalam flashsale ini. Klik <strong class="text-primary font-semibold">Tambah Item Lainnya</strong> di atas untuk menambahkan produk.</p>
          </div>

          <div
            v-for="(item, i) in filteredExistingItems"
            :key="item.id"
            class="flex min-w-[900px] items-center border-b border-[#f1f5f9] py-3.5 transition-colors hover:bg-slate-50/50"
          >
            <!-- Col 1: No -->
            <div class="w-20 pl-6 shrink-0 text-sm font-normal text-[#64748b]">
              {{ i + 1 }}
            </div>

            <!-- Col 2: Photo (1097:38182) -->
            <div class="w-32 pl-4 shrink-0 flex items-center">
              <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted p-1 border border-line-soft shadow-xs">
                <img
                  :src="getProductPhoto(item)"
                  :alt="item.name"
                  class="size-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            <!-- Col 3: Product Name (1097:38185) -->
            <div class="flex-1 min-w-[200px] px-4 min-w-0">
              <p class="truncate text-sm font-normal text-[#475569]">
                {{ item.name }}
              </p>
              <p v-if="item.displayName && item.displayName !== item.name" class="truncate text-xs text-[#9ca3af]">
                {{ item.displayName }}
              </p>
            </div>

            <!-- Col 4: Price (1097:38187) -->
            <div class="w-64 px-4 shrink-0 text-sm font-normal text-[#475569]">
              {{ formatRupiah(item.price) }}
            </div>

            <!-- Col 5: Red Delete Button (1097:38192) -->
            <div class="w-28 pr-6 shrink-0 flex items-center justify-center">
              <button
                type="button"
                class="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-[#ef4444] text-white hover:bg-red-600 transition-colors shadow-xs cursor-pointer active:scale-95"
                title="Hapus produk dari flashsale"
                @click="removeConfirmedItem(item)"
              >
                <svg width="16" height="12" viewBox="0 0 24 16" fill="none">
                  <path
                    d="M8.3943 13.025L6.9873 11.625L10.6053 8L6.9873 4.4L8.3943 3L12.0123 6.615L15.6053 3L17.0123 4.4L13.3943 8L17.0123 11.625L15.6053 13.025L12.0123 9.41L8.3943 13.025Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER BUTTONS (Figma 1097:38326) -->
      <div class="sticky -bottom-5 -mx-6 -mb-5 flex items-center justify-end gap-3 px-6 py-4 border-t border-line/40 bg-surface z-10">
        <button
          type="button"
          class="rounded-[12px] border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-surface-muted transition-colors cursor-pointer"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-[12px] bg-[#6495ed] px-5 py-2.5 text-sm font-bold text-white shadow-primary hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
          :disabled="submitting"
          @click="saveAndContinue"
        >
          Save & Continue Add Items
        </button>
      </div>
    </div>
  </AppModal>
</template>
