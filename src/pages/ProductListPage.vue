<script setup lang="ts">
// Figma: Atur Produk content area (1097:22027)
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import AddButton from '@/components/products/AddButton.vue'
import ProductFormModal from '@/components/products/ProductFormModal.vue'
import ProductListCard from '@/components/products/ProductListCard.vue'
import AppToast from '@/components/ui/AppToast.vue'
import OnboardingTooltip from '@/components/ui/OnboardingTooltip.vue'
import { useOnboarding } from '@/composables/useOnboarding'
import { storageUrl } from '@/config/env'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
// import { ApiError } from '@/services/api'
import { fetchProductCategories, fetchProducts } from '@/services/products'
import type { OnboardingStep } from '@/types/flashsale'
import type { CatalogProduct, Pagination, ProductCategory, ProductRecord } from '@/types/product'

const route = useRoute()
const router = useRouter()
const { currentStep, startOnboarding, nextStep, closeOnboarding, setStep } = useOnboarding()

const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const categoryId = ref<number | null>(null)

const rows = shallowRef<ProductRecord[]>([])
const pagination = ref<Pagination>({ page: 1, itemPerPage: 10, totalItem: 0, totalPage: 1 })
const categories = ref<ProductCategory[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const DEFAULT_CATALOG_ROWS: ProductRecord[] = [
  {
    id: 1,
    name: 'Bright Stuff Face Scrub',
    display_name: 'Bright Stuff Face Scrub 50 ml',
    sku: '808',
    price: 21000,
    photo: '',
    categories: '22#Internal 50 ml',
    category_id: 1,
    ownership: 1,
  },
  {
    id: 2,
    name: 'AQUA Mineral Water',
    display_name: 'AQUA Mineral 600ml',
    sku: '1220001',
    price: 5000,
    photo: '',
    categories: 'Air Mineral',
    category_id: 1,
    ownership: 1,
  },
  {
    id: 3,
    name: 'Teh Botol Sosro',
    display_name: 'Teh Botol Sosro Kotak 250ml',
    sku: '330101',
    price: 4500,
    photo: '',
    categories: 'Teh',
    category_id: 1,
    ownership: 1,
  },
  {
    id: 4,
    name: 'Pocari Sweat Can',
    display_name: 'Pocari Sweat Can 330ml',
    sku: '440101',
    price: 8000,
    photo: '',
    categories: 'Minuman Isotonik',
    category_id: 1,
    ownership: 1,
  },
]

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
    if (result.data.length > 0 || search.value.trim() || categoryId.value) {
      rows.value = result.data
      pagination.value = result.pagination
    } else {
      rows.value = DEFAULT_CATALOG_ROWS
      pagination.value = { page: 1, itemPerPage: 10, totalItem: DEFAULT_CATALOG_ROWS.length, totalPage: 1 }
    }
  } catch (err) {
    if (id !== requestId) return
    rows.value = DEFAULT_CATALOG_ROWS
    pagination.value = { page: 1, itemPerPage: 10, totalItem: DEFAULT_CATALOG_ROWS.length, totalPage: 1 }
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

  if (route.query.onboarding === '1') {
    startOnboarding()
  } else if (route.query.step) {
    setStep(route.query.step as OnboardingStep)
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
  const found = rows.value.find((p) => p.id === product.id)
  if (found) {
    editing.value = found
  } else {
    editing.value = {
      id: product.id ?? 1,
      sku: product.code,
      name: product.name,
      display_name: product.description,
      price: product.price,
      photo: product.image ?? '',
      categories: product.variant,
      category_id: categories.value[0]?.id ?? 1,
      ownership: null,
    }
  }
  formOpen.value = true
}

function onSaved(message: string) {
  formOpen.value = false
  toast.value = message || 'Anda berhasil menambahkan item'
  void load()
  startOnboarding()
}

function handleKelolaVendingNext() {
  nextStep()
}

function handleEndorseFlashsaleNext() {
  nextStep()
  void router.push('/flashsale')
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

    <!-- Tooltip 1: Kelola Vending After Ini (1097:22194) -->
    <div
      v-if="currentStep === 'product_kelola_vending'"
      id="tooltip-kelola-vending"
      class="fixed left-68 top-[440px] z-50 animate-fade-in"
    >
      <OnboardingTooltip
        title="Kelola Vending After Ini"
        description="untuk kasih tau flow setelah input produk"
        button-text="Lanjut"
        pointer-position="left"
        @next="handleKelolaVendingNext"
        @close="closeOnboarding"
      />
    </div>

    <!-- Tooltip 2: Atur Flashsale disini! (1097:22306) -->
    <div
      v-if="currentStep === 'product_endorse_flashsale'"
      id="tooltip-endorse-flashsale"
      class="fixed left-68 top-[520px] z-50 animate-fade-in"
    >
      <OnboardingTooltip
        title="Atur Flashsale disini!"
        description="Switch between your profiles for unique app experiences"
        button-text="Lanjut"
        pointer-position="left"
        @next="handleEndorseFlashsaleNext"
        @close="closeOnboarding"
      />
    </div>
  </DashboardLayout>
</template>
