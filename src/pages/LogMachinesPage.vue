<script setup lang="ts">
// Log Transaksi / Log Error: machine list leading to each machine's log (v1 pages/log-transaksi/index.vue,
// pages/log-error/index.vue). No Figma frame; the Penjualan machine list layout (1097:20195) is reused.
// v1's error-log downloads point at /log-error/download, which the backend doesn't have, so there are none here.
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import LogNotice from '@/components/logs/LogNotice.vue'
import MachineSearchField from '@/components/sales/MachineSearchField.vue'
import SalesMachineTable from '@/components/sales/SalesMachineTable.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { getSession } from '@/services/auth'
import { fetchSalesMachines } from '@/services/sales'
import type { Pagination } from '@/types/product'
import type { SalesMachine } from '@/types/sales'
import { hasAnyPackage } from '@/utils/access'

const props = defineProps<{
  kind: 'transaction' | 'error'
}>()

const route = useRoute()
const router = useRouter()

const title = computed(() => (props.kind === 'transaction' ? 'Log Transaksi' : 'Log Error'))
const basePath = computed(() => (props.kind === 'transaction' ? '/log-transaksi' : '/log-error'))
const detailPath = (code: string) => `${basePath.value}/${encodeURIComponent(code)}`
/** v1: Log Transaksi needs a package (ALL_CAN); Log Error has no package gate. */
const hasAccess = props.kind === 'error' || hasAnyPackage(getSession())

// Filters live in the URL like v1 (?search=&page=&itemPerPage=), so "back" from a machine keeps them.
const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const search = ref(queryText('search'))
const page = ref(Number(queryText('page')) || 1)
const pageSize = ref(Number(queryText('itemPerPage')) || 10)

const machines = shallowRef<SalesMachine[]>([])
const pagination = ref<Pagination>({ page: 1, itemPerPage: 10, totalItem: 0, totalPage: 1 })
const loading = ref(true)
const error = ref<string | null>(null)

function syncQuery() {
  const query: Record<string, string> = {}
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
if (hasAccess) void load()
</script>

<template>
  <DashboardLayout :title="title">
    <template #header>
      <PageHeader :title="title">
        <div v-if="hasAccess" class="flex flex-wrap items-end gap-6">
          <MachineSearchField v-model="search" :machines="machines" placeholder="Cari kode atau nama mesin" />
        </div>
      </PageHeader>
    </template>

    <LogNotice
      v-if="!hasAccess"
      title="Halaman ini tersedia untuk akun berlangganan."
      message="Aktifkan paket Starter, Pro, atau Priority untuk melihat log transaksi."
    />
    <SalesMachineTable
      v-else
      v-model:page="page"
      v-model:page-size="pageSize"
      :machines="machines"
      :total="pagination.totalItem"
      :total-pages="pagination.totalPage"
      :detail-path="detailPath"
      :selectable="false"
      :downloadable="false"
      :loading="loading"
      :error="error"
      @retry="load"
    />
  </DashboardLayout>
</template>
