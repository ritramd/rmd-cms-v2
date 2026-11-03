<script setup lang="ts">
// Figma: Table Container on Atur Produk (1097:22044) — entries + category filter, table, pagination footer.
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { CatalogProduct, ProductCategory } from '@/types/product'
import ProductPagination from './ProductPagination.vue'
import ProductTableRow from './ProductTableRow.vue'

const props = defineProps<{
  products: CatalogProduct[]
  total: number
  totalPages: number
  categories: ProductCategory[]
  loading?: boolean
  error?: string | null
}>()

defineEmits<{
  retry: []
  edit: [product: CatalogProduct]
}>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
const categoryId = defineModel<number | null>('categoryId', { default: null })

const pageSizes = [10, 25, 50, 100]
const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)
const summary = computed(() => {
  if (!props.total) return 'No products'
  return `Showing ${firstIndex.value} to ${firstIndex.value + props.products.length - 1} of ${props.total} products`
})
const categoryName = computed(() => props.categories.find((c) => c.id === categoryId.value)?.category)

const columns = [
  { label: 'No', width: 'w-[8%]', class: 'pl-[61px]' },
  { label: 'Product', width: 'w-[27%]' },
  { label: 'SKU', width: 'w-[9%]' },
  { label: 'Display Name', width: 'w-[29%]' },
  { label: 'Price', width: 'w-[13%]' },
  { label: 'Action', width: 'w-[14%]', class: 'pr-[61px] text-center' },
]
</script>

<template>
  <section class="overflow-clip rounded-3xl border border-line bg-surface font-inter shadow-[0_2px_4px_rgb(0_0_0/0.02),0_1px_2px_rgb(0_0_0/0.03)]">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-surface-muted px-8 pt-6 pb-6">
      <label class="flex items-center gap-4 text-sm text-ink-soft">
        Show
        <span class="relative">
          <select
            v-model.number="pageSize"
            class="h-[30px] min-w-11 appearance-none rounded-lg border border-line bg-surface-muted pr-5 pl-[5px] text-sm text-ink-navy"
          >
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
          <AppIcon name="line-chevron-down" class="pointer-events-none absolute top-1/2 right-1 size-4 -translate-y-1/2" />
        </span>
        entries
      </label>

      <label class="relative flex items-center gap-2 text-sm" :class="categoryName ? 'text-ink-navy' : 'text-ink-subtle'">
        <AppIcon name="line-filter" />
        {{ categoryName ?? 'Filter by Category' }}
        <select v-model="categoryId" class="absolute inset-0 cursor-pointer opacity-0" aria-label="Filter by Category">
          <option :value="null">Semua kategori</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.category }}</option>
        </select>
      </label>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[1040px] table-fixed text-left">
        <colgroup>
          <col v-for="col in columns" :key="col.label" :class="col.width" />
        </colgroup>
        <thead class="bg-surface-muted/50">
          <tr class="border-b border-line">
            <th
              v-for="col in columns"
              :key="col.label"
              scope="col"
              class="px-8 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase"
              :class="col.class"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody :aria-busy="loading">
          <tr v-if="loading">
            <td :colspan="columns.length" class="py-16 text-center text-sm text-ink-soft">Memuat produk…</td>
          </tr>
          <tr v-else-if="error">
            <td :colspan="columns.length" class="py-16 text-center text-sm text-ink-soft">
              {{ error }}
              <button type="button" class="ml-2 font-medium text-brand hover:underline" @click="$emit('retry')">Coba lagi</button>
            </td>
          </tr>
          <tr v-else-if="!products.length">
            <td :colspan="columns.length" class="py-16 text-center text-sm text-ink-soft">Tidak ada produk yang cocok.</td>
          </tr>
          <template v-else>
            <ProductTableRow
              v-for="(product, i) in products"
              :key="`${product.code}-${i}`"
              :index="firstIndex + i"
              :product="product"
              @edit="$emit('edit', $event)"
            />
          </template>
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 bg-surface-muted/20 px-8 py-6">
      <p class="text-xs text-ink-soft">{{ loading || error ? '' : summary }}</p>
      <ProductPagination v-if="!loading && !error && totalPages > 1" v-model:page="page" :total-pages="totalPages" />
    </div>
  </section>
</template>
