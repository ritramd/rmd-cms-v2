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
    <td class="py-[42px] pr-8 pl-[61px] text-ink-subtle">{{ index }}</td>
    <td class="px-8 py-6">
      <div class="flex items-center gap-4">
        <div class="size-14 shrink-0 overflow-clip rounded-lg border border-line bg-surface p-[5px] shadow-xs">
          <img v-if="product.image" :src="product.image" :alt="product.name" class="size-full object-cover" loading="lazy" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-ink-navy">{{ product.name }}</p>
          <p class="truncate text-xs text-ink-subtle">{{ product.variant }}</p>
        </div>
      </div>
    </td>
    <td class="truncate px-8 py-[42px] font-mono text-ink-soft">{{ product.code }}</td>
    <td class="truncate px-8 py-[42px] text-ink-gray">{{ product.description }}</td>
    <td class="px-8 py-[42px] whitespace-nowrap text-ink-navy">{{ formatRupiah(product.price) }}</td>
    <td class="py-4 pr-[61px] pl-8 text-center">
      <EditButton :label="`Ubah ${product.name}`" @click="$emit('edit', product)" />
    </td>
  </tr>
</template>
