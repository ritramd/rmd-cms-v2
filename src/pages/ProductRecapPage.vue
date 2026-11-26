<script setup lang="ts">
// Rekap Penjualan per Produk: settled sales per product across the account's machines
// (v1 pages/sales-recap-product/index.vue, same path). No Figma frame; header and filters follow Vending
// Sales (1097:20239). The product / SKU search and the sort work on the loaded list, as in v1.
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import LogDownloadButton from '@/components/log/LogDownloadButton.vue'
import DateField from '@/components/sales/DateField.vue'
import ProductRecapTable from '@/components/sales-recap/ProductRecapTable.vue'
import RecapStatCard from '@/components/sales-recap/RecapStatCard.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { downloadProductRecap, fetchProductRecap, PRODUCT_RECAP_MAX_RANGE_DAYS } from '@/services/salesRecap'
import type { ProductRecapRow, ProductRecapSortKey, ProductRecapSummary } from '@/types/salesRecap'
import { formatRupiah } from '@/utils/format'
import { defaultRecapRange, formatCount, recapRangeError } from '@/utils/salesRecap'

const route = useRoute()
const router = useRouter()

// Same query as v1 (?startDate=&endDate=); this month by default.
const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const [defaultStart, defaultEnd] = defaultRecapRange('day')
const startDate = ref(queryText('startDate') || defaultStart)
const endDate = ref(queryText('endDate') || defaultEnd)
const keyword = ref('')
const sortBy = ref<ProductRecapSortKey>('gross')
const sortDir = ref<'asc' | 'desc'>('desc')

const rows = shallowRef<ProductRecapRow[]>([])
const summary = shallowRef<ProductRecapSummary | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

const rangeError = computed(() =>
  recapRangeError(startDate.value, endDate.value, PRODUCT_RECAP_MAX_RANGE_DAYS, 'rekap per produk'),
)
const query = computed(() => ({ startDate: startDate.value, endDate: endDate.value }))

const visibleRows = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  const list = q
    ? rows.value.filter((r) => r.product.toLowerCase().includes(q) || (r.sku ?? '').toLowerCase().includes(q))
    : [...rows.value]
  const dir = sortDir.value === 'asc' ? 1 : -1
  const key = sortBy.value
  return list.sort((a, b) =>
    key === 'product' ? a.product.localeCompare(b.product, 'id') * dir : (a[key] - b[key]) * dir,
  )
})

let requestId = 0
async function load() {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  const id = ++requestId
  loading.value = true
  error.value = null
  void router.replace({ query: { ...query.value } })
  try {
    const result = await fetchProductRecap(query.value)
    if (id !== requestId) return // a newer request superseded this one
    rows.value = result?.data ?? []
    summary.value = result?.summary ?? null
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat rekap penjualan per produk.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

watch(query, () => void load())
onMounted(() => void load())

const downloading = ref(false)
async function download() {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  downloading.value = true
  try {
    await downloadProductRecap(query.value)
  } catch (err) {
    toast.value = err instanceof ApiError ? err.message : 'Gagal mengunduh rekap penjualan per produk.'
  } finally {
    downloading.value = false
  }
}

const emptyText = computed(() =>
  keyword.value.trim() && rows.value.length
    ? 'Tidak ada produk yang cocok dengan pencarian.'
    : 'Belum ada produk terjual pada rentang ini.',
)
</script>

<template>
  <DashboardLayout title="Rekap Penjualan per Produk">
    <template #header>
      <PageHeader v-model:search="keyword" title="Rekap Penjualan per Produk" search-placeholder="Cari produk / SKU">
        <div class="flex flex-wrap items-end gap-6 lg:flex-nowrap">
          <div class="flex flex-wrap gap-6 sm:flex-nowrap">
            <DateField v-model="startDate" label="Tanggal Awal" :max="endDate || undefined" />
            <DateField v-model="endDate" label="Tanggal Akhir" :min="startDate || undefined" />
          </div>
          <div class="ml-auto flex shrink-0 items-center gap-4">
            <LogDownloadButton :busy="downloading" @click="download" />
          </div>
        </div>
      </PageHeader>
    </template>

    <p class="-mt-4 text-sm text-ink-muted">
      Rekap penjualan (transaksi settlement) per produk dari semua vending machine Anda dalam rentang tanggal
      tertentu.
    </p>

    <div v-if="summary && !loading && !error" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <RecapStatCard label="Total Penjualan (Gross)" :value="formatRupiah(summary.gross)" />
      <RecapStatCard label="Produk Terjual" :value="formatCount(summary.products)" />
      <RecapStatCard label="Transaksi" :value="formatCount(summary.transactions)" />
      <RecapStatCard label="Qty Terjual" :value="formatCount(summary.qty)" />
    </div>

    <ProductRecapTable
      v-model:sort-by="sortBy"
      v-model:sort-dir="sortDir"
      :rows="visibleRows"
      :summary="summary"
      :loading="loading"
      :error="error"
      :empty-text="emptyText"
      @retry="load"
    />

    <AppToast v-model="toast" variant="error" />
  </DashboardLayout>
</template>
