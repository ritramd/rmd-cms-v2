<script setup lang="ts">
// Figma: Penjualan → Vending Sales detail (1097:33354). Logic from rmd-cms v1 pages/vending-sales/[machine].vue.
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import downloadIcon from '@/assets/sales/download.svg'
import PageHeader from '@/components/layout/PageHeader.vue'
import DateField from '@/components/sales/DateField.vue'
import MachineSalesTable from '@/components/sales/MachineSalesTable.vue'
import ProductSearchField from '@/components/sales/ProductSearchField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { downloadMachineSales, fetchSoldProducts, fetchMachineName, fetchMachineSales } from '@/services/sales'
import type { Pagination } from '@/types/product'
import type { SoldProduct, SaleRecord, SaleSortKey } from '@/types/sales'

const props = defineProps<{
  /** Machine code from the URL, e.g. "VMENIG010". */
  machine: string
}>()

const route = useRoute()
const router = useRouter()

// Filters live in the URL like v1 (?productId=&startDate=&endDate=&page=&itemPerPage=), plus the sort.
// productId holds one or more ids, comma-separated.
const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const queryNumber = (key: string) => Number(queryText(key)) || null

const productIds = ref<number[]>(
  queryText('productId')
    .split(',')
    .map(Number)
    .filter((id) => id > 0),
)
const startDate = ref(queryText('startDate'))
const endDate = ref(queryText('endDate'))
const page = ref(queryNumber('page') ?? 1)
const pageSize = ref(queryNumber('itemPerPage') ?? 10)
const sortBy = ref<SaleSortKey>(queryText('sortBy') === 'payment_type' ? 'payment_type' : 'transaction_time')
const sortDir = ref<'asc' | 'desc'>(queryText('sortDir') === 'asc' ? 'asc' : 'desc')

const sales = shallowRef<SaleRecord[]>([])
const pagination = ref<Pagination>({ page: 1, itemPerPage: 10, totalItem: 0, totalPage: 1 })
const products = shallowRef<SoldProduct[]>([])
const machineName = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

const rangeError = computed(() =>
  startDate.value && endDate.value && endDate.value < startDate.value
    ? 'Tanggal akhir tidak boleh sebelum tanggal awal.'
    : null,
)
const hasFilters = computed(() => Boolean(productIds.value.length || startDate.value || endDate.value))

function syncQuery() {
  const query: Record<string, string> = {}
  if (productIds.value.length) query.productId = productIds.value.join(',')
  if (startDate.value) query.startDate = startDate.value
  if (endDate.value) query.endDate = endDate.value
  if (page.value !== 1) query.page = String(page.value)
  if (pageSize.value !== 10) query.itemPerPage = String(pageSize.value)
  if (sortBy.value !== 'transaction_time' || sortDir.value !== 'desc') {
    query.sortBy = sortBy.value
    query.sortDir = sortDir.value
  }
  void router.replace({ query })
}

let requestId = 0
async function load() {
  // A half-finished range would only confuse the list; the toast explains it.
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  const id = ++requestId
  loading.value = true
  error.value = null
  syncQuery()
  try {
    const result = await fetchMachineSales(props.machine, {
      page: page.value,
      itemPerPage: pageSize.value,
      productIds: productIds.value,
      startDate: startDate.value,
      endDate: endDate.value,
      sortBy: sortBy.value,
      sortDir: sortDir.value,
    })
    if (id !== requestId) return // a newer request superseded this one
    sales.value = result.data
    pagination.value = result.pagination
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat transaksi.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function reloadFromFirstPage() {
  if (page.value === 1) void load()
  else page.value = 1
}

// No "Apply" button in this design: filters apply as soon as they change.
watch([productIds, startDate, endDate, pageSize, sortBy, sortDir], reloadFromFirstPage)
watch(page, () => void load())

onMounted(() => {
  void load()
  fetchMachineName(props.machine)
    .then((name) => (machineName.value = name))
    .catch(() => (machineName.value = null)) // the title falls back to the code
  fetchSoldProducts(props.machine)
    .then((list) => (products.value = list))
    .catch(() => (products.value = [])) // the product search just stays empty
})

function resetFilters() {
  productIds.value = []
  startDate.value = ''
  endDate.value = ''
}

const downloading = ref(false)
async function download() {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  downloading.value = true
  try {
    await downloadMachineSales(props.machine, {
      productIds: productIds.value,
      startDate: startDate.value,
      endDate: endDate.value,
    })
  } catch (err) {
    toast.value = err instanceof ApiError ? err.message : 'Gagal mengunduh data penjualan.'
  } finally {
    downloading.value = false
  }
}

// The header search looks for machines: Enter goes back to the list with that search.
const machineSearch = ref('')
function searchMachines(query: string) {
  void router.push({ name: 'vending-sales', query: query.trim() ? { search: query.trim() } : {} })
}

const title = computed(() => `Manage ${machineName.value ?? props.machine}`)
const emptyText = computed(() =>
  hasFilters.value ? 'Tidak ada transaksi yang cocok dengan filter.' : 'Belum ada transaksi di mesin ini.',
)
</script>

<template>
  <DashboardLayout :title="`Vending Sales ${machine}`">
    <template #header>
      <PageHeader
        v-model:search="machineSearch"
        :title="title"
        search-placeholder="Cari mesin..."
        @submit="searchMachines"
      >
        <!-- One row on desktop (fields shrink to fit), wrapping on smaller screens. -->
        <div class="flex flex-wrap items-end gap-6 lg:flex-nowrap">
          <ProductSearchField v-model="productIds" :products="products" />
          <DateField v-model="startDate" label="Start Date" :max="endDate || undefined" />
          <DateField v-model="endDate" label="End Date" :min="startDate || undefined" />
          <div class="ml-auto flex shrink-0 items-center gap-4">
            <AppButton v-if="hasFilters" icon="line-rotate-ccw" @click="resetFilters">Reset</AppButton>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg border border-cta-border bg-cta px-[25px] py-[11px] font-inter text-sm font-medium whitespace-nowrap text-white shadow-hairline transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
              :disabled="downloading"
              @click="download"
            >
              <img :src="downloadIcon" alt="" />
              {{ downloading ? 'Mengunduh…' : 'Download' }}
            </button>
          </div>
        </div>
      </PageHeader>
    </template>

    <MachineSalesTable
      v-model:page="page"
      v-model:page-size="pageSize"
      v-model:sort-by="sortBy"
      v-model:sort-dir="sortDir"
      :sales="sales"
      :total="pagination.totalItem"
      :total-pages="pagination.totalPage"
      :loading="loading"
      :error="error"
      :empty-text="emptyText"
      @retry="load"
    />

    <AppToast v-model="toast" variant="error" />
  </DashboardLayout>
</template>
