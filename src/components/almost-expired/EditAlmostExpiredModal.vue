<script setup lang="ts">
// Figma: 7.12-D-Vending Sales-almost expired-Items (1097:30646) & 7.13-D- (1097:31104)
// Modal for editing price of single or batch almost expired items
import { ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import defaultProductImg from '@/assets/demo/face-scrub.png'
import closeIcon from '@/assets/form/close.svg'
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/format'
import type { AlmostExpiredItem, UpdateAlmostExpiredItemPayload } from '@/types/almostExpired'

const props = defineProps<{
  open: boolean
  items: AlmostExpiredItem[]
  busy?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [payload: UpdateAlmostExpiredItemPayload[]]
}>()

interface ItemEditState {
  item: AlmostExpiredItem
  priceInput: string
}

const editStates = ref<ItemEditState[]>([])

watch(
  () => props.items,
  (newItems) => {
    editStates.value = newItems.map((item) => ({
      item,
      priceInput: formatCurrencyInput(item.price),
    }))
  },
  { immediate: true, deep: true },
)

function onPriceChange(state: ItemEditState, event: Event) {
  const input = event.target as HTMLInputElement
  const rawNum = parseCurrencyInput(input.value)
  state.priceInput = rawNum > 0 ? formatCurrencyInput(rawNum) : input.value.replace(/[^0-9]/g, '')
}

function handleSave() {
  const payload: UpdateAlmostExpiredItemPayload[] = editStates.value.map((state) => ({
    id: state.item.id,
    productId: state.item.productId,
    price: parseCurrencyInput(state.priceInput),
  }))
  emit('save', payload)
}

function handleClose() {
  if (!props.busy) emit('close')
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-inter"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      class="relative flex w-full max-w-[900px] flex-col rounded-2xl bg-surface p-6 shadow-2xl overflow-hidden max-h-[90vh]"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-line-soft">
        <h2 id="modal-title" class="font-jakarta text-2xl font-bold text-ink-strong">
          Edit Items Kedaluwarsa
        </h2>
        <button
          type="button"
          aria-label="Tutup"
          class="shrink-0 rounded-lg p-1.5 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 cursor-pointer transition-colors"
          :disabled="busy"
          @click="handleClose"
        >
          <img :src="closeIcon" alt="" class="size-6" />
        </button>
      </div>

      <!-- Modal Body (scrollable if multiple items) -->
      <div class="my-6 overflow-y-auto max-h-[60vh] pr-2 space-y-6">
        <div
          v-for="state in editStates"
          :key="state.item.id"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start"
        >
          <!-- Left: Pilih Item selector display -->
          <div class="flex flex-col gap-1.5">
            <span class="block text-xs font-bold uppercase tracking-[1px] text-[#9ca3af] leading-5">
              PILIH ITEM
            </span>
            <div
              class="flex h-[48px] items-center justify-between rounded-lg border border-[#e3e8ee] bg-surface px-3 shadow-2xs transition"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="size-[34px] shrink-0 overflow-hidden rounded-md border border-line-soft bg-surface-muted p-0.5"
                >
                  <img
                    :src="state.item.photo || defaultProductImg"
                    :alt="state.item.name"
                    class="size-full object-contain pointer-events-none"
                  />
                </div>
                <div class="min-w-0 flex flex-col justify-center">
                  <p class="truncate text-sm font-normal text-ink-strong leading-tight">
                    {{ state.item.internalName || state.item.name }}
                  </p>
                  <p class="truncate text-xs text-ink-muted leading-tight mt-0.5">
                    {{ state.item.name }}
                  </p>
                </div>
              </div>
              <div class="shrink-0 text-ink-muted pl-2">
                <AppIcon name="line-chevron-down" class="size-4" />
              </div>
            </div>
          </div>

          <!-- Right: Price input -->
          <div class="flex flex-col gap-1.5">
            <label
              :for="'price-input-' + state.item.id"
              class="block text-xs font-bold uppercase tracking-[1px] text-[#9ca3af] leading-5"
            >
              PRICE
            </label>
            <div
              class="flex h-[48px] w-full items-stretch rounded-lg border border-[#e2e8f0] bg-surface shadow-2xs transition focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden"
            >
              <span
                class="flex h-full w-10 shrink-0 items-center justify-center border-r border-[#e2e8f0] bg-[#cbd5e1] text-sm font-normal text-[#334155]"
              >
                Rp
              </span>
              <input
                :id="'price-input-' + state.item.id"
                :value="state.priceInput"
                type="text"
                placeholder="0"
                class="h-full w-full bg-transparent px-3 text-sm text-ink-strong outline-none placeholder:text-ink-subtle"
                @input="onPriceChange(state, $event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-line-soft">
        <button
          type="button"
          class="rounded-xl border border-[#e2e8f0] bg-surface px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary transition cursor-pointer"
          :disabled="busy"
          @click="handleClose"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-xl bg-[#6495ed] px-5 py-2.5 text-sm font-bold text-white shadow-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 transition cursor-pointer"
          :disabled="busy"
          @click="handleSave"
        >
          <span v-if="busy">Menyimpan...</span>
          <span v-else>Save</span>
        </button>
      </div>
    </div>
  </div>
</template>
