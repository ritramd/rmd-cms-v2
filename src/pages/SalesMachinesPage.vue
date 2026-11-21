<script setup lang="ts">
// Figma: Penjualan → Vending Sales Digital (1097:20195). The same layout serves Vending Sales;
// logic from rmd-cms v1 (pages/vending-sales/index.vue, pages/sales-digital/index.vue).
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import downloadIcon from '@/assets/sales/download.svg'
import PageHeader from '@/components/layout/PageHeader.vue'
import DateField from '@/components/sales/DateField.vue'
import DownloadConfirmModal from '@/components/sales/DownloadConfirmModal.vue'
import MachineSearchField from '@/components/sales/MachineSearchField.vue'
import SalesMachineTable from '@/components/sales/SalesMachineTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
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

const hasFilters = computed(() => Boolean(search.value || startDate.value || endDate.value))

function resetFilters() {
  search.value = ''
  startDate.value = ''
  endDate.value = ''
}

// No "Apply" button: dates auto-sync and validate as soon as they change.
watch([startDate, endDate], () => {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  syncQuery()
})

const isConfirmOpen = ref(false)
const pendingMachines = ref<SalesMachine[]>([])
const downloadingId = ref<number | null>(null)
const bulkDownloading = ref(false)
const isConfirmBusy = computed(() => Boolean(downloadingId.value || bulkDownloading.value))

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

function requestDownloadOne(machine: SalesMachine) {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  pendingMachines.value = [machine]
  isConfirmOpen.value = true
}

function requestDownloadSelected() {
  if (!selected.value.length) {
    toast.value = 'Pilih mesin vending terlebih dahulu untuk mengunduh data penjualan.'
    return
  }
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  pendingMachines.value = [...selected.value]
  isConfirmOpen.value = true
}

function closeConfirm() {
  if (isConfirmBusy.value) return
  isConfirmOpen.value = false
  pendingMachines.value = []
}

async function handleConfirmDownload() {
  if (!pendingMachines.value.length) return
  const list = pendingMachines.value
  const isSingle = list.length === 1
  if (isSingle) {
    downloadingId.value = list[0].id
  } else {
    bulkDownloading.value = true
  }
  try {
    await runDownload(list)
    isConfirmOpen.value = false
    pendingMachines.value = []
  } finally {
    downloadingId.value = null
    bulkDownloading.value = false
  }
}

const detailBase = computed(() => (props.channel === 'digital' ? '/sales-digital' : '/vending-sales'))
const detailPath = (code: string) => `${detailBase.value}/${encodeURIComponent(code)}`

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg font-inter text-sm font-medium whitespace-nowrap text-white shadow-hairline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70'
</script>

<template>
  <DashboardLayout :title="channel === 'digital' ? 'Vending Sales Digital' : 'Vending Sales'">
    <template #header>
      <PageHeader :title="channel === 'digital' ? 'Vending Sales Digital' : 'Daftar Mesin Vending'">
        <!-- One row on desktop (fields shrink to fit), wrapping on smaller screens. -->
        <div class="flex flex-wrap items-end gap-6 lg:flex-nowrap">
          <MachineSearchField v-model="search" :machines="machines" placeholder="Cari mesin apa" />
          <div class="flex flex-wrap gap-6 sm:flex-nowrap">
            <DateField v-model="startDate" label="Start Date" :max="endDate || undefined" />
            <DateField v-model="endDate" label="End Date" :min="startDate || undefined" />
          </div>
          <div class="ml-auto flex shrink-0 items-center gap-4">
            <AppButton v-if="hasFilters" icon="line-rotate-ccw" @click="resetFilters">Reset</AppButton>
            <button
              type="button"
              :class="buttonClass"
              class="border border-cta-border bg-cta px-[25px] py-[11px] hover:bg-primary"
              :disabled="bulkDownloading"
              @click="requestDownloadSelected"
            >
              <img :src="downloadIcon" alt="" />
              {{ bulkDownloading ? 'Mengunduh…' : selected.length ? `Download (${selected.length})` : 'Download' }}
            </button>
          </div>
        </div>
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
      @download="requestDownloadOne"
    />

    <DownloadConfirmModal
      :open="isConfirmOpen"
      :busy="isConfirmBusy"
      @close="closeConfirm"
      @confirm="handleConfirmDownload"
    />

    <AppToast v-model="toast" variant="error" />
  </DashboardLayout>
</template>
