<script setup lang="ts">
// Figma: Stok → Stok Vending (1097:23235). Logic from rmd-cms v1 pages/stok-vending/index.vue.
// The design's product search and date fields aren't used here: stock levels are per machine and current.
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import downloadIcon from '@/assets/sales/download.svg'
import PageHeader from '@/components/layout/PageHeader.vue'
import StockReportModal from '@/components/stock/StockReportModal.vue'
import StockTable from '@/components/stock/StockTable.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { downloadStockReport, fetchStockMachines } from '@/services/stock'
import type { Pagination } from '@/types/product'
import type { StockMachine, StockReportType } from '@/types/stock'

const route = useRoute()
const router = useRouter()

// Filters live in the URL like v1 (?search=&page=&itemPerPage=), plus the stock level order.
const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const queryNumber = (key: string, fallback: number) => Number(queryText(key)) || fallback

const search = ref(queryText('search'))
const page = ref(queryNumber('page', 1))
const pageSize = ref(queryNumber('itemPerPage', 10))
const sortDir = ref<'asc' | 'desc'>(queryText('sortDir') === 'desc' ? 'desc' : 'asc')

const machines = shallowRef<StockMachine[]>([])
const pagination = ref<Pagination>({ page: 1, itemPerPage: 10, totalItem: 0, totalPage: 1 })
const selected = ref<StockMachine[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

function syncQuery() {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.search = search.value.trim()
  if (page.value !== 1) query.page = String(page.value)
  if (pageSize.value !== 10) query.itemPerPage = String(pageSize.value)
  if (sortDir.value !== 'asc') query.sortDir = sortDir.value
  void router.replace({ query })
}

let requestId = 0
async function load() {
  const id = ++requestId
  loading.value = true
  error.value = null
  syncQuery()
  try {
    const result = await fetchStockMachines({
      page: page.value,
      itemPerPage: pageSize.value,
      search: search.value.trim() || undefined,
      sortDir: sortDir.value,
    })
    if (id !== requestId) return // a newer request superseded this one
    machines.value = result.data
    pagination.value = result.pagination
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat stok mesin.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function reloadFromFirstPage() {
  if (page.value === 1) void load()
  else page.value = 1
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(reloadFromFirstPage, 300)
})
watch([pageSize, sortDir], reloadFromFirstPage)
watch(page, () => void load())
void load()

// Download: one machine from its row, or the selection from the header; both ask Ringkasan or Detail first.
const downloadFor = ref<StockMachine[] | null>(null)
const downloading = ref<StockReportType | null>(null)
const downloadError = ref<string | null>(null)

function askDownload(list: StockMachine[]) {
  if (!list.length) {
    toast.value = 'Pilih mesin vending terlebih dahulu untuk mengunduh laporan stok.'
    return
  }
  downloadError.value = null
  downloadFor.value = list
}

async function download(type: StockReportType) {
  if (!downloadFor.value) return
  downloading.value = type
  downloadError.value = null
  try {
    await downloadStockReport(type, downloadFor.value)
    downloadFor.value = null
  } catch (err) {
    downloadError.value = err instanceof ApiError ? err.message : 'Gagal mengunduh laporan stok.'
  } finally {
    downloading.value = null
  }
}

// "Lihat" opens the machine's restock history, like v1's (hidden) "Histori Stok Ulang" column.
const detailPath = (code: string) => `/histori-stok-ulang/${encodeURIComponent(code)}`
const emptyText = computed(() => (search.value.trim() ? 'Tidak ada mesin yang cocok.' : 'Belum ada mesin dengan produk.'))
</script>

<template>
  <DashboardLayout title="Stok Vending">
    <template #header>
      <PageHeader v-model:search="search" title="Stok Vending" search-placeholder="Cari mesin...">
        <div class="flex justify-end">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-cta-border bg-cta px-[25px] py-[11px] font-inter text-sm font-medium whitespace-nowrap text-white shadow-hairline transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            @click="askDownload(selected)"
          >
            <img :src="downloadIcon" alt="" />
            {{ selected.length ? `Download (${selected.length})` : 'Download' }}
          </button>
        </div>
      </PageHeader>
    </template>

    <StockTable
      v-model:page="page"
      v-model:page-size="pageSize"
      v-model:sort-dir="sortDir"
      v-model:selected="selected"
      :machines="machines"
      :total="pagination.totalItem"
      :total-pages="pagination.totalPage"
      :detail-path="detailPath"
      :loading="loading"
      :error="error"
      :empty-text="emptyText"
      @retry="load"
      @download="askDownload([$event])"
    />

    <StockReportModal
      :machines="downloadFor"
      :busy="downloading"
      :error="downloadError"
      @download="download"
      @close="downloadFor = null"
    />
    <AppToast v-model="toast" variant="error" />
  </DashboardLayout>
</template>
