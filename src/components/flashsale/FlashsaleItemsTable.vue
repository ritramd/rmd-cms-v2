<script setup lang="ts">
// Figma: Daftar Produk Table Container on Flashsale (1097:22366 / 1097:22044)
import { computed, ref } from 'vue'
import defaultFaceScrub from '@/assets/demo/face-scrub.png'
import EditButton from '@/components/products/EditButton.vue'
import ProductPagination from '@/components/products/ProductPagination.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { storageUrl } from '@/config/env'
import type { FlashsaleItemDetail } from '@/types/flashsale'
import { formatRupiah } from '@/utils/format'

const props = defineProps<{
  items: FlashsaleItemDetail[]
  total?: number
  totalPages?: number
  loading?: boolean
}>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const emit = defineEmits<{
  deleteItem: [item: FlashsaleItemDetail]
  editItem: [item: FlashsaleItemDetail]
}>()

const filterCategory = ref('')

const availableCategories = computed(() => {
  const set = new Set<string>()
  props.items.forEach((item) => {
    if (item.displayName) {
      const parts = item.displayName.split(' ')
      if (parts.length > 0) set.add(parts[0])
    }
  })
  if (set.size === 0) {
    set.add('Perawatan Wajah')
    set.add('Minuman')
    set.add('Snack')
  }
  return Array.from(set)
})

const filteredItems = computed(() => {
  if (!filterCategory.value) return props.items
  return props.items.filter((item) =>
    (item.displayName || item.name).toLowerCase().includes(filterCategory.value.toLowerCase()),
  )
})

const pageSizes = [10, 25, 50, 100]
const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)
const pagesCount = computed(() => props.totalPages ?? Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))
const summary = computed(() => {
  const count = filteredItems.value.length
  if (!count) return 'No products'
  return `Showing ${firstIndex.value} to ${firstIndex.value + count - 1} of ${props.total || count} products`
})

const columns = [
  { label: 'NO', width: 'w-[8%]', class: 'pl-[61px]' },
  { label: 'PRODUCT', width: 'w-[27%]' },
  { label: 'SKU', width: 'w-[9%]' },
  { label: 'DISPLAY NAME', width: 'w-[29%]' },
  { label: 'PRICE', width: 'w-[13%]' },
  { label: 'ACTION', width: 'w-[14%]', class: 'pr-[61px] text-center' },
]

function getPhoto(photo?: string): string {
  if (!photo) return defaultFaceScrub
  if (photo.startsWith('http') || photo.startsWith('/')) return photo
  return storageUrl(photo) ?? defaultFaceScrub
}
</script>

<template>
  <section class="overflow-clip rounded-3xl border border-line bg-surface font-inter shadow-[0_2px_4px_rgb(0_0_0/0.02),0_1px_2px_rgb(0_0_0/0.03)]">
    <!-- Table Filters / Utility (1097:22384) -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-surface-muted px-8 pt-6 pb-6">
      <label class="flex items-center gap-4 text-sm text-ink-soft">
        Show
        <span class="relative">
          <select
            v-model.number="pageSize"
            class="h-[30px] min-w-11 appearance-none rounded-lg border border-line bg-surface-muted pr-5 pl-[5px] text-sm text-ink-navy cursor-pointer"
          >
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
          <AppIcon name="line-chevron-down" class="pointer-events-none absolute top-1/2 right-1 size-4 -translate-y-1/2" />
        </span>
        entries
      </label>

      <label class="relative flex items-center gap-2 text-sm text-ink-subtle hover:text-ink-navy cursor-pointer">
        <AppIcon name="line-filter" />
        <span class="font-medium">{{ filterCategory ? `Kategori: ${filterCategory}` : 'Filter by Category' }}</span>
        <select v-model="filterCategory" class="absolute inset-0 cursor-pointer opacity-0" aria-label="Filter by Category">
          <option value="">Semua Kategori</option>
          <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </label>
    </div>

    <!-- Table Container -->
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
          <tr v-else-if="!filteredItems.length">
            <td :colspan="columns.length" class="py-16 text-center text-sm text-ink-soft">Tidak ada item flashsale yang cocok.</td>
          </tr>
          <template v-else>
            <tr
              v-for="(item, i) in filteredItems"
              :id="`flashsale-item-row-${i}`"
              :key="item.id"
              class="border-t border-surface-muted font-inter text-sm transition-colors first:border-t-0 hover:bg-surface-muted/30"
            >
              <td class="py-[42px] pr-8 pl-[61px] text-ink-subtle">
                {{ firstIndex + i }}
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="size-14 shrink-0 overflow-clip rounded-lg border border-line bg-surface p-[5px] shadow-xs">
                    <img :src="getPhoto(item.photo)" :alt="item.name" class="size-full object-cover" loading="lazy" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-ink-navy font-medium">{{ item.name }}</p>
                    <p class="truncate text-xs text-ink-subtle">{{ item.displayName || '50 ml' }}</p>
                  </div>
                </div>
              </td>
              <td class="truncate px-8 py-[42px] font-mono text-ink-soft">
                {{ item.sku || '-' }}
              </td>
              <td class="truncate px-8 py-[42px] text-ink-gray">
                {{ item.displayName || item.name }}
              </td>
              <td class="px-8 py-[42px] whitespace-nowrap font-medium text-ink-navy">
                {{ formatRupiah(item.price) }}
              </td>
              <td class="py-4 pr-[61px] pl-8 text-center">
                <EditButton :label="`Ubah ${item.name}`" @click="emit('editItem', item)" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Footer Pagination (1097:22416) -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-surface-muted/20 px-8 py-6">
      <p class="text-xs text-ink-soft">{{ loading ? '' : summary }}</p>
      <ProductPagination v-if="!loading && pagesCount > 1" v-model:page="page" :total-pages="pagesCount" />
    </div>
  </section>
</template>
