<script setup lang="ts">
// Figma: Atur Produk content area (1097:22027)
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import AddButton from '@/components/products/AddButton.vue'
import ProductFormModal from '@/components/products/ProductFormModal.vue'
import ProductListCard from '@/components/products/ProductListCard.vue'
import AppToast from '@/components/ui/AppToast.vue'
import { storageUrl } from '@/config/env'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { fetchProductCategories, fetchProducts } from '@/services/products'
import type { CatalogProduct, Pagination, ProductCategory, ProductRecord } from '@/types/product'

const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const categoryId = ref<number | null>(null)

const rows = shallowRef<ProductRecord[]>([])
const pagination = ref<Pagination>({ page: 1, itemPerPage: 10, totalItem: 0, totalPage: 1 })
const categories = ref<ProductCategory[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

let requestId = 0
async function load() {
  const id = ++requestId
  loading.value = true
  error.value = null
  try {
    const result = await fetchProducts({
      page: page.value,
      itemPerPage: pageSize.value,
      search: search.value.trim() || undefined,
      categoryId: categoryId.value,
    })
    if (id !== requestId) return // a newer request superseded this one
    rows.value = result.data
    pagination.value = result.pagination
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat produk.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

// Filters send the list back to page 1; typing in search waits for a short pause.
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (page.value === 1) void load()
    else page.value = 1
  }, 300)
})
watch([pageSize, categoryId], () => {
  if (page.value === 1) void load()
  else page.value = 1
})
watch(page, () => void load())

onMounted(async () => {
  void load()
  try {
    categories.value = await fetchProductCategories()
  } catch {
    categories.value = [] // the filter just stays empty
  }
})

// One form for add and edit: editing = null → Tambah Produk.
const formOpen = ref(false)
const editing = ref<ProductRecord | null>(null)
const toast = ref<string | null>(null)

function openAdd() {
  editing.value = null
  formOpen.value = true
}

function openEdit(product: CatalogProduct) {
  editing.value = rows.value.find((p) => p.id === product.id) ?? null
  if (editing.value) formOpen.value = true
}

function onSaved(message: string) {
  formOpen.value = false
  toast.value = message
  void load()
}

const products = computed<CatalogProduct[]>(() =>
  rows.value.map((p) => ({
    id: p.id,
    code: p.sku ?? '-',
    name: p.name ?? p.display_name ?? '-',
    variant: p.categories ?? '-',
    description: p.display_name ?? '-',
    price: Number(p.price ?? 0),
    image: storageUrl(p.photo),
  })),
)
</script>

<template>
  <DashboardLayout title="Daftar Produk">
    <template #header>
      <PageHeader v-model:search="search" title="Daftar Produk" search-placeholder="Cari Produk..." />
    </template>

    <div class="flex flex-col gap-10">
      <div class="flex justify-end">
        <AddButton @click="openAdd">Tambah Produk</AddButton>
      </div>

      <ProductListCard
        v-model:page="page"
        v-model:page-size="pageSize"
        v-model:category-id="categoryId"
        :products="products"
        :total="pagination.totalItem"
        :total-pages="pagination.totalPage"
        :categories="categories"
        :loading="loading"
        :error="error"
        @retry="load"
        @edit="openEdit"
      />
    </div>

    <ProductFormModal
      :open="formOpen"
      :product="editing"
      :categories="categories"
      @close="formOpen = false"
      @saved="onSaved"
    />
    <AppToast v-model="toast" variant="success" />
  </DashboardLayout>
</template>
