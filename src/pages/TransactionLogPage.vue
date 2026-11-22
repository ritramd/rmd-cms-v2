<script setup lang="ts">
// Log Transaksi of one machine: transactions that never settled (v1 pages/log-transaksi/[machine].vue).
// No Figma frame; header and table follow Vending Sales detail (1097:33354). v1's search box is left out:
// GET /transaction-log/:vmcode ignores `search`.
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import LogDownloadButton from '@/components/log/LogDownloadButton.vue'
import LogNotice from '@/components/log/LogNotice.vue'
import TransactionLogTable from '@/components/log/TransactionLogTable.vue'
import DateField from '@/components/sales/DateField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { getSession } from '@/services/auth'
import { downloadTransactionLog, fetchTransactionLog } from '@/services/logs'
import { fetchMachineName } from '@/services/sales'
import type { TransactionLogRecord } from '@/types/logs'
import type { Pagination } from '@/types/product'
import { hasAnyPackage } from '@/utils/access'

const props = defineProps<{
  /** Machine code from the URL, e.g. "VMENIG010". */
  machine: string
}>()

const route = useRoute()
const router = useRouter()
const hasAccess = hasAnyPackage(getSession())

const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const startDate = ref(queryText('startDate'))
const endDate = ref(queryText('endDate'))
const page = ref(Number(queryText('page')) || 1)
const pageSize = ref(Number(queryText('itemPerPage')) || 10)

const rows = shallowRef<TransactionLogRecord[]>([])
const pagination = ref<Pagination>({ page: 1, itemPerPage: 10, totalItem: 0, totalPage: 1 })
const machineName = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

const rangeError = computed(() =>
  startDate.value && endDate.value && endDate.value < startDate.value
    ? 'Tanggal akhir tidak boleh sebelum tanggal awal.'
    : null,
)
const hasFilters = computed(() => Boolean(startDate.value || endDate.value))

function syncQuery() {
  const query: Record<string, string> = {}
  if (startDate.value) query.startDate = startDate.value
  if (endDate.value) query.endDate = endDate.value
  if (page.value !== 1) query.page = String(page.value)
  if (pageSize.value !== 10) query.itemPerPage = String(pageSize.value)
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
    const result = await fetchTransactionLog(props.machine, {
      page: page.value,
      itemPerPage: pageSize.value,
      startDate: startDate.value,
      endDate: endDate.value,
    })
    if (id !== requestId) return // a newer request superseded this one
    rows.value = result.data
    pagination.value = result.pagination
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat log transaksi.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function reloadFromFirstPage() {
  if (page.value === 1) void load()
  else page.value = 1
}

// Filters apply as soon as they change, like the other v2 pages (v1 had a "Terapkan" button).
watch([startDate, endDate, pageSize], reloadFromFirstPage)
watch(page, () => void load())

onMounted(() => {
  if (!hasAccess) return
  void load()
  fetchMachineName(props.machine)
    .then((name) => (machineName.value = name))
    .catch(() => (machineName.value = null)) // the title falls back to the code
})

function resetFilters() {
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
    await downloadTransactionLog(props.machine, { startDate: startDate.value, endDate: endDate.value })
  } catch (err) {
    toast.value = err instanceof ApiError ? err.message : 'Gagal mengunduh log transaksi.'
  } finally {
    downloading.value = false
  }
}

const title = computed(() => `Log Transaksi ${machineName.value ?? props.machine}`)
const emptyText = computed(() =>
  hasFilters.value
    ? 'Tidak ada transaksi gagal atau tertunda pada rentang tanggal ini.'
    : 'Belum ada transaksi gagal atau tertunda di mesin ini.',
)
</script>

<template>
  <DashboardLayout :title="`Log Transaksi ${machine}`">
    <template #header>
      <PageHeader :title="title">
        <div v-if="hasAccess" class="flex flex-wrap items-end gap-6 lg:flex-nowrap">
          <div class="flex flex-wrap gap-6 sm:flex-nowrap">
            <DateField v-model="startDate" label="Tanggal Awal" :max="endDate || undefined" />
            <DateField v-model="endDate" label="Tanggal Akhir" :min="startDate || undefined" />
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
      title="Halaman ini tersedia untuk akun berlangganan."
      message="Aktifkan paket Starter, Pro, atau Priority untuk melihat log transaksi."
    />
    <template v-else>
      <p class="-mt-4 text-sm text-ink-muted">
        Transaksi yang tidak selesai dibayar: menunggu, kedaluwarsa, gagal, dibatalkan, atau di-refund.
      </p>
      <TransactionLogTable
        v-model:page="page"
        v-model:page-size="pageSize"
        :rows="rows"
        :total="pagination.totalItem"
        :total-pages="pagination.totalPage"
        :loading="loading"
        :error="error"
        :empty-text="emptyText"
        @retry="load"
      />
    </template>

    <AppToast v-model="toast" variant="error" />
  </DashboardLayout>
</template>
