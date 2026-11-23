<script setup lang="ts">
// Riwayat Perpanjangan: the client's subscription renewals (v1 pages/dashboard/billing-history.vue,
// which only dev accounts could open). No Figma frame; header and filters follow the log pages.
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BillingHistoryTable from '@/components/billing/BillingHistoryTable.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import LogDownloadButton from '@/components/log/LogDownloadButton.vue'
import LogFilterSelect from '@/components/log/LogFilterSelect.vue'
import LogNotice from '@/components/log/LogNotice.vue'
import DateField from '@/components/sales/DateField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { getSession } from '@/services/auth'
import { downloadBillingHistory, fetchBillingHistory } from '@/services/billing'
import type { BillingHistoryRecord, BillingHistoryStatusFilter } from '@/types/billing'
import type { Pagination } from '@/types/product'
import { canSeeBilling } from '@/utils/access'

const route = useRoute()
const router = useRouter()
const hasAccess = canSeeBilling(getSession())

const STATUS_OPTIONS: { label: string; value: BillingHistoryStatusFilter | '' }[] = [
  { label: 'Semua status', value: '' },
  { label: 'Berhasil', value: 'success' },
  { label: 'Diproses', value: 'in_progress' },
  { label: 'Gagal', value: 'failed' },
]
const isStatus = (value: string): value is BillingHistoryStatusFilter =>
  STATUS_OPTIONS.some((o) => o.value && o.value === value)

const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const search = ref(queryText('search'))
const status = ref<BillingHistoryStatusFilter | ''>(isStatus(queryText('status')) ? (queryText('status') as BillingHistoryStatusFilter) : '')
const startDate = ref(queryText('startDate'))
const endDate = ref(queryText('endDate'))
const page = ref(Number(queryText('page')) || 1)
const pageSize = ref(Number(queryText('itemPerPage')) || 10)

const rows = shallowRef<BillingHistoryRecord[]>([])
const pagination = ref<Pagination | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const downloading = ref(false)
const toast = ref<string | null>(null)

const rangeError = computed(() =>
  startDate.value && endDate.value && endDate.value < startDate.value
    ? 'Tanggal akhir tidak boleh sebelum tanggal awal.'
    : null,
)
const hasFilters = computed(() => Boolean(search.value.trim() || status.value || startDate.value || endDate.value))

const filters = () => ({
  search: search.value.trim() || undefined,
  status: status.value || undefined,
  startDate: startDate.value || undefined,
  endDate: endDate.value || undefined,
})

function syncQuery() {
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(filters())) if (value) query[key] = value
  if (page.value !== 1) query.page = String(page.value)
  if (pageSize.value !== 10) query.itemPerPage = String(pageSize.value)
  void router.replace({ query })
}

let requestId = 0
async function load() {
  if (!hasAccess) return
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  const id = ++requestId
  loading.value = true
  error.value = null
  syncQuery()
  try {
    const result = await fetchBillingHistory({ page: page.value, itemPerPage: pageSize.value, ...filters() })
    if (id !== requestId) return // a newer request superseded this one
    rows.value = result.data
    pagination.value = result.pagination
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat riwayat perpanjangan.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function reloadFromFirstPage() {
  if (page.value === 1) void load()
  else page.value = 1
}

// Filters apply as soon as they change; typing in the search waits for a short pause.
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(reloadFromFirstPage, 400)
})
watch([status, startDate, endDate, pageSize], reloadFromFirstPage)
watch(page, () => void load())
onMounted(() => void load())
onBeforeUnmount(() => clearTimeout(searchTimer))

function resetFilters() {
  search.value = ''
  status.value = ''
  startDate.value = ''
  endDate.value = ''
}

async function download() {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  downloading.value = true
  try {
    await downloadBillingHistory(filters())
  } catch (err) {
    toast.value = err instanceof ApiError ? err.message : 'Gagal mengunduh riwayat perpanjangan.'
  } finally {
    downloading.value = false
  }
}

const emptyText = computed(() =>
  hasFilters.value ? 'Tidak ada perpanjangan yang cocok dengan filter ini.' : 'Belum ada riwayat perpanjangan subscription.',
)
</script>

<template>
  <DashboardLayout title="Riwayat Perpanjangan">
    <template #header>
      <PageHeader
        v-model:search="search"
        title="Riwayat Perpanjangan"
        :search-placeholder="hasAccess ? 'Cari order ID atau voucher…' : ''"
      >
        <div v-if="hasAccess" class="flex flex-wrap items-end gap-6 lg:flex-nowrap">
          <div class="flex w-full flex-wrap gap-6 sm:w-auto sm:flex-nowrap">
            <DateField v-model="startDate" label="Tanggal Awal" :max="endDate || undefined" />
            <DateField v-model="endDate" label="Tanggal Akhir" :min="startDate || undefined" />
            <LogFilterSelect v-model="status" label="Status" :options="STATUS_OPTIONS" />
          </div>
          <div class="ml-auto flex shrink-0 items-center gap-4">
            <AppButton v-if="hasFilters" icon="line-rotate-ccw" @click="resetFilters">Reset</AppButton>
            <LogDownloadButton :busy="downloading" @click="download" />
          </div>
        </div>
      </PageHeader>
    </template>

    <LogNotice
      v-if="!hasAccess"
      title="Riwayat perpanjangan tidak tersedia"
      message="Hanya akun utama yang dapat melihat riwayat perpanjangan subscription."
    />
    <BillingHistoryTable
      v-else
      v-model:page="page"
      v-model:page-size="pageSize"
      :rows="rows"
      :pagination="pagination"
      :loading="loading"
      :error="error"
      :empty-text="emptyText"
      @retry="load"
    />

    <AppToast v-model="toast" variant="error" />
  </DashboardLayout>
</template>
