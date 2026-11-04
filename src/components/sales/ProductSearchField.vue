<script setup lang="ts">
// Figma: product search on Vending Sales detail (1097:33454), multi-select with chips (1097:34995).
// Typing searches the products sold on this machine (by name or SKU); each pick adds a chip and filters
// the sales by all product ids behind that name.
import { computed, ref, useId } from 'vue'
import chipCloseIcon from '@/assets/sales/chip-close.svg'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { SoldProduct } from '@/types/sales'

const props = defineProps<{
  products: SoldProduct[]
}>()

/** Selected product ids; empty = all products. */
const productIds = defineModel<number[]>({ default: () => [] })

const listId = useId()
const input = ref<HTMLInputElement>()
const text = ref('')
const open = ref(false)
const highlighted = ref(0)

const isSelected = (product: SoldProduct) => product.ids.some((id) => productIds.value.includes(id))

// Ids from the URL may arrive before the product list; those chips show once it loads.
const selected = computed(() => props.products.filter(isSelected))

// The whole list scrolls; machines sell a few dozen products at most.
const matches = computed(() => {
  const q = text.value.trim().toLowerCase()
  if (!q) return props.products
  return props.products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.skus.some((sku) => sku.toLowerCase().includes(q)),
  )
})

function remove(product: SoldProduct) {
  productIds.value = productIds.value.filter((id) => !product.ids.includes(id))
}

function toggle(product: SoldProduct) {
  if (isSelected(product)) remove(product)
  else productIds.value = [...productIds.value, ...product.ids]
  text.value = ''
  highlighted.value = 0
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    open.value = true
    const step = event.key === 'ArrowDown' ? 1 : -1
    highlighted.value = (highlighted.value + step + matches.value.length) % Math.max(matches.value.length, 1)
  } else if (event.key === 'Enter' && open.value && matches.value[highlighted.value]) {
    event.preventDefault()
    toggle(matches.value[highlighted.value])
  } else if (event.key === 'Backspace' && !text.value && selected.value.length) {
    remove(selected.value[selected.value.length - 1])
  } else if (event.key === 'Escape') {
    open.value = false
  }
}
</script>

<template>
  <div class="relative w-full min-w-56 sm:w-auto sm:flex-[0_1_480px]">
    <!-- Clicking anywhere in the box (outside a chip's ×) focuses the text input. -->
    <div
      class="flex min-h-[46px] cursor-text items-center gap-1 rounded-lg border border-line bg-surface py-[7px] pr-[13px] pl-[37px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
      @mousedown.self.prevent="input?.focus()"
    >
      <AppIcon name="search-sm" class="pointer-events-none absolute top-[23px] left-3 -translate-y-1/2" />
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1" @mousedown.self.prevent="input?.focus()">
        <span
          v-for="product in selected"
          :key="product.name"
          class="flex max-w-full items-center gap-1 rounded-2xl bg-success-soft px-4 py-1 font-inter text-sm text-ink-deep"
        >
          <span class="truncate">{{ product.name }}</span>
          <button
            type="button"
            :aria-label="`Hapus ${product.name}`"
            class="shrink-0 rounded-full hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-primary"
            @click="remove(product)"
          >
            <img :src="chipCloseIcon" alt="" />
          </button>
        </span>
        <input
          ref="input"
          v-model="text"
          type="search"
          role="combobox"
          aria-label="Cari produk"
          aria-autocomplete="list"
          :aria-expanded="open && matches.length > 0"
          :aria-controls="listId"
          :aria-activedescendant="open && matches.length ? `${listId}-${highlighted}` : undefined"
          :placeholder="selected.length ? '' : 'Cari produk apa'"
          autocomplete="off"
          class="h-7 bg-transparent text-sm text-ink-strong outline-none placeholder:text-ink-subtle"
          :class="selected.length && !open ? 'w-0 min-w-0' : 'min-w-24 flex-1'"
          @focus="open = true"
          @input="((open = true), (highlighted = 0))"
          @keydown="onKeydown"
          @blur="((open = false), (text = ''))"
        />
      </div>
      <AppIcon
        name="line-select-chevron"
        class="shrink-0 transition-transform"
        :class="open && 'rotate-180'"
        @mousedown.prevent="input?.focus()"
      />
    </div>
    <ul
      v-show="open && matches.length"
      :id="listId"
      role="listbox"
      aria-multiselectable="true"
      class="absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-line bg-surface py-1 text-sm shadow-card"
    >
      <li
        v-for="(product, i) in matches"
        :id="`${listId}-${i}`"
        :key="product.name"
        role="option"
        :aria-selected="isSelected(product)"
        class="flex cursor-pointer items-center gap-3 px-3 py-2"
        :class="i === highlighted ? 'bg-surface-muted text-ink-strong' : 'text-ink'"
        @mousedown.prevent="toggle(product)"
        @mouseenter="highlighted = i"
      >
        <span
          class="flex size-4 shrink-0 items-center justify-center rounded border"
          :class="isSelected(product) ? 'border-primary-hover bg-primary-hover' : 'border-line-strong bg-surface'"
          aria-hidden="true"
        >
          <svg v-if="isSelected(product)" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4">
            <path d="M4.5 8.5l2.25 2.25L11.5 5.5" />
          </svg>
        </span>
        <span class="min-w-0 flex-1 truncate">{{ product.name }}</span>
        <span v-if="product.skus.length" class="shrink-0 text-xs text-ink-subtle">{{ product.skus.join(', ') }}</span>
      </li>
    </ul>
  </div>
</template>
