<script setup lang="ts">
// Figma: Tambah Items ke Flashsale (1097:40947 / 1097:41362)
import { onMounted, reactive, ref, watch } from 'vue'
import defaultFaceScrub from '@/assets/demo/face-scrub.png'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import OnboardingTooltip from '@/components/ui/OnboardingTooltip.vue'
import { storageUrl } from '@/config/env'
import { fetchMachineProducts } from '@/services/flashsale'
import type { AddFlashsaleItemsPayload } from '@/types/flashsale'
import type { ProductRecord } from '@/types/product'
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/format'

const props = defineProps<{
  open: boolean
  flashsaleId: number
  flashsaleName?: string
  vmcode: string
  showTooltip?: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: [payload: AddFlashsaleItemsPayload]
  tooltipNext: []
  tooltipClose: []
}>()

interface FormItem {
  productId: number | null
  price: number | null
}

const products = ref<ProductRecord[]>([])
const loadingProducts = ref(false)

const items = reactive<FormItem[]>([
  {
    productId: 1,
    price: 200000,
  },
])

const submitting = ref(false)
const errorMessage = ref<string | null>(null)

async function loadProducts() {
  loadingProducts.value = true
  try {
    const list = await fetchMachineProducts(props.vmcode)
    products.value = list
    if (items[0] && !items[0].productId && list.length > 0) {
      items[0].productId = list[0].id
      items[0].price = Number(list[0].price ?? 200000)
    }
  } catch {
    // Keep fallback list
  } finally {
    loadingProducts.value = false
  }
}

function addItem() {
  const prod = products.value[0]
  items.push({
    productId: prod?.id ?? null,
    price: prod ? Number(prod.price ?? 200000) : 200000,
  })
}

function removeItem(index: number) {
  if (items.length > 1) {
    items.splice(index, 1)
  }
}

function onProductSelected(index: number, id: number) {
  items[index].productId = id
  const prod = products.value.find((p) => p.id === id)
  if (prod) {
    items[index].price = Number(prod.price ?? 0)
  }
}

function onPriceInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const rawNum = parseCurrencyInput(target.value)
  items[index].price = rawNum > 0 ? rawNum : null
  target.value = formatCurrencyInput(items[index].price)
}

function onPriceBlur(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  target.value = formatCurrencyInput(items[index].price)
}

function getSelectedProduct(id: number | null): ProductRecord | undefined {
  return products.value.find((p) => p.id === id)
}

function getProductPhoto(prod?: ProductRecord): string {
  if (!prod) return defaultFaceScrub
  if (prod.photo) return storageUrl(prod.photo) ?? defaultFaceScrub
  return defaultFaceScrub
}

function reset() {
  items.splice(0, items.length, {
    productId: products.value[0]?.id ?? 1,
    price: 200000,
  })
  errorMessage.value = null
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      reset()
      void loadProducts()
    }
  },
)

onMounted(() => {
  void loadProducts()
})

function submit() {
  const validItems = items.filter((i) => i.productId !== null)
  if (validItems.length === 0) {
    errorMessage.value = 'Silakan pilih setidaknya satu produk.'
    return
  }

  const payload: AddFlashsaleItemsPayload = {
    flashsaleId: props.flashsaleId,
    vmcode: props.vmcode,
    items: validItems.map((i) => ({
      productId: i.productId!,
      price: i.price ?? 0,
    })),
  }

  emit('saved', payload)
}
</script>

<template>
  <AppModal
    :open="open"
    :title="`Tambah Items ke ${flashsaleName || 'Flashsale 1'}`"
    max-width="max-w-[900px]"
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

    <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="flex flex-col gap-4 border-b border-line-soft pb-4 sm:flex-row sm:items-end"
      >
        <!-- Select Item -->
        <div class="flex-1">
          <label class="mb-2 block font-inter text-xs font-bold uppercase tracking-wider text-ink-subtle">
            PILIH ITEM
          </label>
          <div class="relative flex h-[58px] items-center rounded-xl border border-line bg-surface px-3 py-1.5 shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <!-- Thumbnail preview -->
            <div class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-muted p-1 shadow-sm">
              <img
                :src="getProductPhoto(getSelectedProduct(item.productId))"
                :alt="getSelectedProduct(item.productId)?.name ?? 'Product'"
                class="size-full object-contain"
              />
            </div>

            <!-- Custom info / Select drop -->
            <div class="relative ml-3 flex-1 min-w-0">
              <select
                :value="item.productId"
                class="w-full appearance-none bg-transparent pr-8 text-sm font-semibold text-ink-heading focus:outline-none cursor-pointer truncate"
                @change="onProductSelected(idx, Number(($event.target as HTMLSelectElement).value))"
              >
                <option v-for="p in products" :key="p.id" :value="p.id">
                  {{ p.name }} - {{ p.sku }}
                </option>
              </select>
              <div class="pointer-events-none mt-0.5 text-xs text-ink-subtle truncate">
                {{ getSelectedProduct(item.productId)?.display_name || getSelectedProduct(item.productId)?.sku || '50 ml' }}
              </div>
            </div>

            <div class="pointer-events-none pr-1 text-ink-subtle shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Price Input -->
        <div class="w-full sm:w-64">
          <label class="mb-2 block font-inter text-xs font-bold uppercase tracking-wider text-ink-subtle">
            PRICE
          </label>
          <div class="relative flex h-[58px] items-center rounded-xl border border-line bg-surface px-3.5 shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <span class="text-sm font-semibold text-ink-muted shrink-0 mr-3 select-none">
              Rp
            </span>
            <input
              :value="formatCurrencyInput(item.price)"
              type="text"
              inputmode="numeric"
              class="h-full w-full bg-transparent text-sm font-semibold text-ink-heading placeholder:text-ink-subtle focus:outline-none"
              placeholder="0"
              @input="onPriceInput(idx, $event)"
              @blur="onPriceBlur(idx, $event)"
            />
          </div>
        </div>

        <!-- Remove row button (if multiple) -->
        <button
          v-if="items.length > 1"
          type="button"
          class="flex size-[58px] shrink-0 items-center justify-center rounded-xl text-ink-subtle hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer"
          aria-label="Hapus item"
          @click="removeItem(idx)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <!-- Add more items button -->
      <div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-primary transition-all hover:bg-primary-hover active:scale-95"
          @click="addItem"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Item Lainnya
        </button>
      </div>

      <p v-if="errorMessage" role="alert" class="text-sm text-danger-strong">
        {{ errorMessage }}
      </p>

      <!-- Footer Buttons -->
      <div class="sticky -bottom-5 -mx-6 -mb-5 flex items-center justify-end gap-3 px-6 py-4 border-t border-line/40 bg-surface z-10">
        <AppButton type="button" @click="emit('close')">
          Cancel
        </AppButton>
        <AppButton type="submit" variant="primary" :disabled="submitting">
          Save
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
