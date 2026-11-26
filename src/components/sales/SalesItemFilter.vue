<script setup lang="ts">
// Item filter of the machine's sales page: a dropdown picks what to search by (Product, SKU or Slot)
// and the field next to it changes with it. Product keeps the multi-select of Figma 1097:33454 /
// 1097:34995; SKU and Slot are plain text (Slot digits only). Not in Figma; same field styling.
import { computed, useId } from 'vue'
import ProductSearchField from '@/components/sales/ProductSearchField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { SalesItemFilterBy, SoldProduct } from '@/types/sales'

defineProps<{
  products: SoldProduct[]
}>()

const by = defineModel<SalesItemFilterBy>('by', { required: true })
const productIds = defineModel<number[]>('productIds', { required: true })
/** SKU or slot text, depending on `by`. */
const text = defineModel<string>('text', { required: true })

const OPTIONS: { label: string; value: SalesItemFilterBy }[] = [
  { label: 'Product', value: 'product' },
  { label: 'SKU', value: 'sku' },
  { label: 'Slot', value: 'slot' },
]

const selectId = useId()
const placeholder = computed(() => (by.value === 'slot' ? 'Cari nomor slot' : 'Cari SKU'))

// One filter at a time: switching drops what the previous kind had.
function onByChange(event: Event) {
  by.value = (event.target as HTMLSelectElement).value as SalesItemFilterBy
  productIds.value = []
  text.value = ''
}

function onTextInput(event: Event) {
  const input = event.target as HTMLInputElement
  text.value = by.value === 'slot' ? input.value.replace(/\D/g, '') : input.value
  input.value = text.value
}
</script>

<template>
  <div class="flex w-full min-w-0 items-start gap-2 sm:w-auto sm:flex-[0_1_600px]">
    <label :for="selectId" class="sr-only">Filter berdasarkan</label>
    <div class="relative shrink-0">
      <select
        :id="selectId"
        :value="by"
        class="h-[46px] w-32 cursor-pointer appearance-none rounded-lg border border-line bg-surface pr-9 pl-3 font-inter text-sm font-medium text-ink-strong outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        @change="onByChange"
      >
        <option v-for="o in OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <AppIcon name="line-select-chevron" class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" />
    </div>

    <ProductSearchField v-if="by === 'product'" v-model="productIds" :products="products" class="min-w-0 flex-1" />
    <div
      v-else
      class="relative flex min-h-[46px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-surface py-[7px] pr-[13px] pl-[37px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
    >
      <AppIcon name="search-sm" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
      <input
        :value="text"
        type="search"
        :inputmode="by === 'slot' ? 'numeric' : 'text'"
        :aria-label="placeholder"
        :placeholder="placeholder"
        autocomplete="off"
        class="h-7 min-w-0 flex-1 bg-transparent text-sm text-ink-strong outline-none placeholder:text-ink-subtle [&::-webkit-search-cancel-button]:appearance-none"
        @input="onTextInput"
      />
      <button
        v-if="text"
        type="button"
        aria-label="Hapus pencarian"
        class="flex size-5 items-center justify-center rounded-full text-xs text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
        @click="text = ''"
      >
        ✕
      </button>
    </div>
  </div>
</template>
