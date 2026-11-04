<script setup lang="ts">
// Figma: Stok → Riwayat Stok Ulang for one machine (1097:34061). Without a machine in the URL the same page lists
// the restock entries of every machine the account can see (history_restock_new via GET /restock-history).
// Logic from rmd-cms v1 pages/histori-stok-ulang/[...machine].vue.
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import downloadIcon from '@/assets/sales/download.svg'
import PageHeader from '@/components/layout/PageHeader.vue'
import DateField from '@/components/sales/DateField.vue'
import RestockTable from '@/components/stock/RestockTable.vue'
import StockLevelBadge from '@/components/stock/StockLevelBadge.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { fetchMachineName } from '@/services/sales'
import { downloadRestockHistory, fetchRestockHistory, fetchStockMachine } from '@/services/stock'
import type { Pagination } from '@/types/product'
import type { RestockRecord } from '@/types/stock'

const props = defineProps<{
  /** Machine code from the URL, e.g. "VMENIG010"; absent on the all-machines list. */
  machine?: string
}>()

const route = useRoute()
const router = useRouter()

// Filters live in the URL like v1 (?search=&startDate=&endDate=&page=&itemPerPage=), plus the sort and,
// on the all-machines list, the machine search.
const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const queryNumber = (key: string, fallback: number) => Number(queryText(key)) || fallback

const search = ref(queryText('search'))
// Header "Cari mesin...": filters the all-machines list; on a machine's page Enter goes to Stok Vending.
const machineSearch = ref(props.machine ? '' : queryText('machine'))
const startDate = ref(queryText('startDate'))
const endDate = ref(queryText('endDate'))
const page = ref(queryNumber('page', 1))
const pageSize = ref(queryNumber('itemPerPage', 10))
const sortDir = ref<'asc' | 'desc'>(queryText('sortDir') === 'asc' ? 'asc' : 'desc')

const records = shallowRef<RestockRecord[]>([])
const pagination = ref<Pagination>({ page: 1, itemPerPage: 10, totalItem: 0, totalPage: 1 })
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

const rangeError = computed(() =>
  startDate.value && endDate.value && endDate.value < startDate.value
    ? 'Tanggal akhir tidak boleh sebelum tanggal awal.'
    : null,
)
const filter = () => ({
  search: search.value.trim() || undefined,
  machine: props.machine ? undefined : machineSearch.value.trim() || undefined,
  startDate: startDate.value || undefined,
  endDate: endDate.value || undefined,
})

function syncQuery() {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.search = search.value.trim()
  if (!props.machine && machineSearch.value.trim()) query.machine = machineSearch.value.trim()
  if (startDate.value) query.startDate = startDate.value
  if (endDate.value) query.endDate = endDate.value
  if (page.value !== 1) query.page = String(page.value)
  if (pageSize.value !== 10) query.itemPerPage = String(pageSize.value)
  if (sortDir.value !== 'desc') query.sortDir = sortDir.value
  void router.replace({ query })
}

let requestId = 0
async function load() {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  const id = ++requestId
  loading.value = true
  error.value = null
  syncQuery()
  try {
    const result = await fetchRestockHistory(props.machine ?? null, {
      ...filter(),
      page: page.value,
      itemPerPage: pageSize.value,
      sortDir: sortDir.value,
    })
    if (id !== requestId) return // a newer request superseded this one
    records.value = result.data
    pagination.value = result.pagination
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat riwayat stok ulang.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function reloadFromFirstPage() {
  if (page.value === 1) void load()
  else page.value = 1
}

// No "Apply" button in this design: filters apply as soon as they change; typing waits for a short pause.
let searchTimer: ReturnType<typeof setTimeout> | undefined
// On a machine's page the header search only navigates, so it doesn't reload the table.
watch([search, () => (props.machine ? '' : machineSearch.value)], () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(reloadFromFirstPage, 300)
})
watch([startDate, endDate, pageSize, sortDir], reloadFromFirstPage)
watch(page, () => void load())

// Title and current stock level. /vending-stock is Pro-only, so the name falls back to the machine list.
const machineName = ref<string | null>(null)
const stockLevel = ref<number | null>(null)

onMounted(async () => {
  void load()
  if (!props.machine) return
  try {
    const stock = await fetchStockMachine(props.machine)
    machineName.value = stock?.name ?? null
    const ratio = stock?.isi === null || stock?.isi === '' || stock?.isi === undefined ? NaN : Number(stock.isi)
    stockLevel.value = Number.isNaN(ratio) ? null : ratio * 100
  } catch {
    stockLevel.value = null
  }
  if (!machineName.value) machineName.value = await fetchMachineName(props.machine).catch(() => null)
})

const downloading = ref(false)
async function download() {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  downloading.value = true
  try {
    await downloadRestockHistory(props.machine ? [props.machine] : [], filter())
  } catch (err) {
    toast.value = err instanceof ApiError ? err.message : 'Gagal mengunduh riwayat stok ulang.'
  } finally {
    downloading.value = false
  }
}

function searchMachines(query: string) {
  if (!props.machine) return // the list already follows the search as you type
  void router.push({ name: 'stock-vending', query: query.trim() ? { search: query.trim() } : {} })
}

const title = computed(() =>
  props.machine ? `Histori Stok Ulang - ${machineName.value ?? props.machine}` : 'Riwayat Stok Ulang',
)
const emptyText = computed(() =>
  search.value.trim() || machineSearch.value.trim() || startDate.value || endDate.value
    ? 'Tidak ada riwayat yang cocok dengan filter.'
    : props.machine
      ? 'Belum ada riwayat stok ulang di mesin ini.'
      : 'Belum ada riwayat stok ulang.',
)
</script>

<template>
  <DashboardLayout :title="machine ? `Histori Stok Ulang ${machine}` : 'Riwayat Stok Ulang'">
    <template #header>
      <PageHeader v-model:search="machineSearch" :title="title" search-placeholder="Cari mesin..." @submit="searchMachines">
        <!-- One row on desktop (fields shrink to fit), wrapping on smaller screens. -->
        <div class="flex flex-wrap items-end gap-6 lg:flex-nowrap">
          <div class="flex w-full min-w-56 items-center gap-6 sm:w-auto sm:flex-[0_1_570px]">
            <StockLevelBadge v-if="stockLevel !== null" :value="stockLevel" class="shrink-0" />
            <label class="relative block min-w-0 flex-1">
              <span class="sr-only">Cari produk</span>
              <AppIcon name="search-sm" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                v-model="search"
                type="search"
                placeholder="Cari produk apa"
                class="w-full rounded-lg border border-line bg-surface py-3 pr-3 pl-[37px] text-sm text-ink-strong outline-none placeholder:text-ink-subtle focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
          <DateField v-model="startDate" label="Start Date" :max="endDate || undefined" />
          <DateField v-model="endDate" label="End Date" :min="startDate || undefined" />
          <div class="ml-auto flex shrink-0 items-center">
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

    <RestockTable
      v-model:page="page"
      :show-machine="!machine"
      v-model:page-size="pageSize"
      v-model:sort-dir="sortDir"
      :records="records"
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
