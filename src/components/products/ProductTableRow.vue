<script setup lang="ts">
// Figma: Component 14 / "Component 4" (187:3394), as used on Atur Produk (1097:22073): regular weights.
// Renders a <tr>; use inside a <table class="table-fixed"> whose header cells use the same padding.
import type { CatalogProduct } from '@/types/product'
import { formatRupiah } from '@/utils/format'
import EditButton from './EditButton.vue'

defineProps<{
  index: number
  product: CatalogProduct
}>()

defineEmits<{
  edit: [product: CatalogProduct]
}>()
</script>

<template>
  <tr class="border-t border-surface-muted font-inter text-sm transition-colors first:border-t-0 hover:bg-surface-muted/30">
    <td class="px-8 py-6 align-middle text-ink-subtle">{{ index }}</td>
    <td class="max-w-0 px-8 py-6 align-middle">
      <div class="flex items-center gap-4 min-w-0">
        <div
          class="size-14 shrink-0 overflow-clip rounded-lg border border-line bg-surface p-[5px] shadow-xs cursor-pointer transition-transform hover:scale-105"
          :title="`Ubah ${product.name}`"
          @click="$emit('edit', product)"
        >
          <img v-if="product.image" :src="product.image" :alt="product.name" class="size-full object-cover" loading="lazy" />
        </div>
        <div class="min-w-0 flex-1">
          <button
            type="button"
            class="block w-full truncate text-left font-medium text-ink-navy transition-colors hover:text-brand focus-visible:underline cursor-pointer"
            :title="`Ubah ${product.name}`"
            @click="$emit('edit', product)"
          >
            {{ product.name }}
          </button>
          <p class="block w-full truncate text-xs text-ink-subtle" :title="product.variant || undefined">{{ product.variant || 'N/A' }}</p>
        </div>
      </div>
    </td>
    <td class="max-w-0 px-8 py-6 align-middle font-mono text-ink-soft">
      <span class="block truncate" :title="product.code">{{ product.code }}</span>
    </td>
    <td class="max-w-0 px-8 py-6 align-middle text-ink-gray">
      <span class="block truncate" :title="product.description">{{ product.description }}</span>
    </td>
    <td class="px-8 py-6 align-middle whitespace-nowrap text-ink-navy">{{ formatRupiah(product.price) }}</td>
    <td class="px-8 py-6 align-middle text-center">
      <EditButton :label="`Ubah ${product.name}`" @click="$emit('edit', product)" />
    </td>
  </tr>
</template>
