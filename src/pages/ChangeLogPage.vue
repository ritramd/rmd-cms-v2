<script setup lang="ts">
// Log Perubahan: price, product and planogram changes with who made them (v1 pages/log-perubahan/index.vue).
// No Figma frame; header and table follow the Penjualan pages. Defaults to the last 30 days, as v1.
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import ChangeLogTable from '@/components/log/ChangeLogTable.vue'
import LogDownloadButton from '@/components/log/LogDownloadButton.vue'
import LogFilterSelect from '@/components/log/LogFilterSelect.vue'
import LogNotice from '@/components/log/LogNotice.vue'
import DateField from '@/components/sales/DateField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { getSession } from '@/services/auth'
import { downloadChangeLogs, fetchChangeLogs } from '@/services/logs'
import type { ChangeAction, ChangeEntityType, ChangeLogFilter, ChangeLogRecord } from '@/types/logs'
import type { Pagination } from '@/types/product'
import { hasAnyPackage } from '@/utils/access'

const route = useRoute()
const router = useRouter()
/** v1: Log Perubahan needs a package (ALL_CAN). */
const hasAccess = hasAnyPackage(getSession())

const ENTITY_OPTIONS: { label: string; value: ChangeEntityType | '' }[] = [
  { label: 'Semua', value: '' },
  { label: 'Produk', value: 'product' },
  { label: 'Planogram', value: 'planogram' },
]
const ACTION_OPTIONS: { label: string; value: ChangeAction | '' }[] = [
  { label: 'Semua', value: '' },
  { label: 'Tambah', value: 'create' },
  { label: 'Ubah', value: 'update' },
  { label: 'Hapus', value: 'delete' },
]

const toYmd = (d: Date) => d.toLocaleDateString('sv-SE') // YYYY-MM-DD in local time
const today = new Date()
const defaultStart = toYmd(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30))
const defaultEnd = toYmd(today)

const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : undefined)
const startDate = ref(queryText('startDate') ?? defaultStart)
const endDate = ref(queryText('endDate') ?? defaultEnd)
const entityType = ref<ChangeEntityType | ''>(
  ENTITY_OPTIONS.some((o) => o.value === queryText('entityType')) ? (queryText('entityType') as ChangeEntityType) : '',
)
const action = ref<ChangeAction | ''>(
  ACTION_OPTIONS.some((o) => o.value === queryText('action')) ? (queryText('action') as ChangeAction) : '',
)
const search = ref(queryText('search') ?? '')
const page = ref(Number(queryText('page')) || 1)
const pageSize = ref(Number(queryText('itemPerPage')) || 10)

const rows = shallowRef<ChangeLogRecord[]>([])
const pagination = ref<Pagination>({ page: 1, itemPerPage: 10, totalItem: 0, totalPage: 1 })
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

const rangeError = computed(() =>
  startDate.value && endDate.value && endDate.value < startDate.value
    ? 'Tanggal awal tidak boleh setelah tanggal akhir.'
    : null,
)
const filter = computed<ChangeLogFilter>(() => ({
  startDate: startDate.value || undefined,
  endDate: endDate.value || undefined,
  entityType: entityType.value || undefined,
  action: action.value || undefined,
  search: search.value.trim() || undefined,
}))
const isDefaultFilter = computed(
  () =>
    startDate.value === defaultStart &&
    endDate.value === defaultEnd &&
    !entityType.value &&
    !action.value &&
    !search.value.trim(),
)

function syncQuery() {
  const query: Record<string, string> = {}
  const f = filter.value
  if (f.startDate) query.startDate = f.startDate
  if (f.endDate) query.endDate = f.endDate
  if (f.entityType) query.entityType = f.entityType
  if (f.action) query.action = f.action
  if (f.search) query.search = f.search
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
    const result = await fetchChangeLogs({ ...filter.value, page: page.value, itemPerPage: pageSize.value })
    if (id !== requestId) return // a newer request superseded this one
    rows.value = result.data
    pagination.value = result.pagination
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat log perubahan.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function reloadFromFirstPage() {
  if (page.value === 1) void load()
  else page.value = 1
}

// Filters apply as soon as they change (v1 had a "Terapkan" button); typing in search waits a moment.
watch([startDate, endDate, entityType, action, pageSize], reloadFromFirstPage)
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(reloadFromFirstPage, 300)
})
watch(page, () => void load())

onMounted(() => {
  if (hasAccess) void load()
})

function resetFilters() {
  startDate.value = defaultStart
  endDate.value = defaultEnd
  entityType.value = ''
  action.value = ''
  search.value = ''
}

const downloading = ref(false)
async function download() {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  downloading.value = true
  try {
    await downloadChangeLogs(filter.value)
  } catch (err) {
    toast.value = err instanceof ApiError ? err.message : 'Gagal mengunduh log perubahan.'
  } finally {
    downloading.value = false
  }
}

const emptyText = computed(() =>
  isDefaultFilter.value
    ? 'Belum ada perubahan dalam 30 hari terakhir.'
    : 'Tidak ada perubahan yang cocok dengan filter.',
)
</script>

<template>
  <DashboardLayout title="Log Perubahan">
    <template #header>
      <PageHeader
        v-model:search="search"
        title="Log Perubahan"
        :search-placeholder="hasAccess ? 'Cari mesin, produk, SKU…' : ''"
      >
        <div v-if="hasAccess" class="flex flex-wrap items-end gap-6 xl:flex-nowrap">
          <div class="flex flex-wrap gap-6 sm:flex-nowrap">
            <DateField v-model="startDate" label="Tanggal Awal" :max="endDate || undefined" />
            <DateField v-model="endDate" label="Tanggal Akhir" :min="startDate || undefined" />
          </div>
          <div class="flex flex-wrap gap-6 sm:flex-nowrap">
            <LogFilterSelect v-model="entityType" label="Tipe" :options="ENTITY_OPTIONS" />
            <LogFilterSelect v-model="action" label="Aksi" :options="ACTION_OPTIONS" />
          </div>
          <div class="ml-auto flex shrink-0 items-center gap-4">
            <AppButton v-if="!isDefaultFilter" icon="line-rotate-ccw" @click="resetFilters">Reset</AppButton>
            <LogDownloadButton :busy="downloading" @click="download" />
          </div>
        </div>
      </PageHeader>
    </template>

    <LogNotice
      v-if="!hasAccess"
      title="Halaman ini tersedia untuk akun berlangganan."
      message="Aktifkan paket Starter, Pro, atau Priority untuk melihat log perubahan."
    />
    <template v-else>
      <p class="-mt-4 text-sm text-ink-muted">
        Riwayat perubahan harga, produk, dan planogram beserta pengguna yang melakukannya.
      </p>
      <ChangeLogTable
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
