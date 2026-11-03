<script setup lang="ts">
// Figma: Penjualan → Vending Sales Digital (1097:20195). The same layout serves Vending Sales;
// logic from rmd-cms v1 (pages/vending-sales/index.vue, pages/sales-digital/index.vue).
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import downloadIcon from '@/assets/sales/download.svg'
import filterIcon from '@/assets/sales/filter.svg'
import PageHeader from '@/components/layout/PageHeader.vue'
import DateField from '@/components/sales/DateField.vue'
import SalesMachineTable from '@/components/sales/SalesMachineTable.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { downloadSales, fetchSalesMachines } from '@/services/sales'
import type { Pagination } from '@/types/product'
import type { SalesChannel, SalesMachine } from '@/types/sales'

const props = defineProps<{
  channel: SalesChannel
}>()

const route = useRoute()
const router = useRouter()

// Filters live in the URL like v1 (?startDate=&endDate=&page=&itemPerPage=&search=), so "back" from a detail page keeps them.
const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const queryNumber = (key: string, fallback: number) => Number(queryText(key)) || fallback

const startDate = ref(queryText('startDate'))
const endDate = ref(queryText('endDate'))
const search = ref(queryText('search'))
const page = ref(queryNumber('page', 1))
const pageSize = ref(queryNumber('itemPerPage', 10))

const machines = shallowRef<SalesMachine[]>([])
const pagination = ref<Pagination>({ page: 1, itemPerPage: 10, totalItem: 0, totalPage: 1 })
const selected = ref<SalesMachine[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

function syncQuery() {
  const query: Record<string, string> = {}
  if (startDate.value) query.startDate = startDate.value
  if (endDate.value) query.endDate = endDate.value
  if (search.value.trim()) query.search = search.value.trim()
  if (page.value !== 1) query.page = String(page.value)
  if (pageSize.value !== 10) query.itemPerPage = String(pageSize.value)
  void router.replace({ query })
}

let requestId = 0
async function load() {
  const id = ++requestId
  loading.value = true
  error.value = null
  syncQuery()
  try {
    const result = await fetchSalesMachines({
      page: page.value,
      itemPerPage: pageSize.value,
      search: search.value.trim() || undefined,
    })
    if (id !== requestId) return // a newer request superseded this one
    machines.value = result.data
    pagination.value = result.pagination
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat daftar mesin.'
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
watch(pageSize, reloadFromFirstPage)
watch(page, () => void load())
void load()

const rangeError = computed(() =>
  startDate.value && endDate.value && endDate.value < startDate.value
    ? 'Tanggal akhir tidak boleh sebelum tanggal awal.'
    : null,
)

// The machine list itself isn't date-filtered (same as v1): the dates apply to the downloads.
function applyFilter() {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  reloadFromFirstPage()
}

const downloadingId = ref<number | null>(null)
const bulkDownloading = ref(false)

async function runDownload(list: SalesMachine[]) {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  try {
    await downloadSales(props.channel, list, { startDate: startDate.value, endDate: endDate.value })
  } catch (err) {
    toast.value = err instanceof ApiError ? err.message : 'Gagal mengunduh data penjualan.'
  }
}

async function downloadOne(machine: SalesMachine) {
  downloadingId.value = machine.id
  await runDownload([machine])
  downloadingId.value = null
}

async function downloadSelected() {
  if (!selected.value.length) {
    toast.value = 'Pilih mesin vending terlebih dahulu untuk mengunduh data penjualan.'
    return
  }
  bulkDownloading.value = true
  await runDownload(selected.value)
  bulkDownloading.value = false
}

const detailBase = computed(() => (props.channel === 'digital' ? '/sales-digital' : '/vending-sales'))
const detailPath = (code: string) => `${detailBase.value}/${encodeURIComponent(code)}`

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg font-inter text-sm font-medium whitespace-nowrap text-white shadow-hairline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70'
</script>

<template>
  <DashboardLayout :title="channel === 'digital' ? 'Vending Sales Digital' : 'Vending Sales'">
    <template #header>
      <PageHeader v-model:search="search" title="Daftar Mesin Vending" search-placeholder="Cari mesin...">
        <!-- novalidate: the min/max hints on the date pickers shouldn't block submit; applyFilter explains a bad range. -->
        <form class="flex flex-wrap items-end gap-6" novalidate @submit.prevent="applyFilter">
          <div class="flex flex-wrap gap-6">
            <DateField v-model="startDate" label="Start Date" :max="endDate || undefined" />
            <DateField v-model="endDate" label="End Date" :min="startDate || undefined" />
          </div>
          <div class="ml-auto flex items-center gap-4">
            <button type="submit" :class="buttonClass" class="bg-action-dark px-6 py-2.5 hover:bg-ink-deep">
              <img :src="filterIcon" alt="" />
              Apply Filter
            </button>
            <button
              type="button"
              :class="buttonClass"
              class="border border-cta-border bg-cta px-[25px] py-[11px] hover:bg-primary"
              :disabled="bulkDownloading"
              @click="downloadSelected"
            >
              <img :src="downloadIcon" alt="" />
              {{ bulkDownloading ? 'Mengunduh…' : selected.length ? `Download (${selected.length})` : 'Download' }}
            </button>
          </div>
        </form>
      </PageHeader>
    </template>

    <SalesMachineTable
      v-model:page="page"
      v-model:page-size="pageSize"
      v-model:selected="selected"
      :machines="machines"
      :total="pagination.totalItem"
      :total-pages="pagination.totalPage"
      :detail-path="detailPath"
      :downloading-id="downloadingId"
      :loading="loading"
      :error="error"
      @retry="load"
      @download="downloadOne"
    />

    <AppToast v-model="toast" variant="error" />
  </DashboardLayout>
</template>
