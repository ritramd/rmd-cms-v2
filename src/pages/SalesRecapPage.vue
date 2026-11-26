<script setup lang="ts">
// Rekap Penjualan: settled sales of all the account's machines per day, month or year
// (v1 pages/sales-recap/index.vue, same path). No Figma frame; header and filters follow Vending Sales
// (1097:20239). Filters apply as they change, like the other v2 pages (v1 had a "Terapkan" button).
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import LogDownloadButton from '@/components/log/LogDownloadButton.vue'
import LogFilterSelect from '@/components/log/LogFilterSelect.vue'
import DateField from '@/components/sales/DateField.vue'
import RecapStatCard from '@/components/sales-recap/RecapStatCard.vue'
import SalesRecapTable from '@/components/sales-recap/SalesRecapTable.vue'
import AppSwitch from '@/components/ui/AppSwitch.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { downloadSalesRecap, fetchSalesRecap, RECAP_MAX_RANGE_DAYS } from '@/services/salesRecap'
import type { SalesRecapGroupBy, SalesRecapRow, SalesRecapSummary } from '@/types/salesRecap'
import { formatRupiah } from '@/utils/format'
import { defaultRecapRange, formatCount, recapRangeError } from '@/utils/salesRecap'

const GROUP_OPTIONS: { label: string; value: SalesRecapGroupBy }[] = [
  { label: 'Harian', value: 'day' },
  { label: 'Bulanan', value: 'month' },
  { label: 'Tahunan', value: 'year' },
]

const route = useRoute()
const router = useRouter()

// Same query as v1 (?groupBy=&startDate=&endDate=).
const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const initialGroup = GROUP_OPTIONS.find((o) => o.value === queryText('groupBy'))?.value ?? 'day'
const [defaultStart, defaultEnd] = defaultRecapRange(initialGroup)

const groupBy = ref<SalesRecapGroupBy | ''>(initialGroup)
const startDate = ref(queryText('startDate') || defaultStart)
const endDate = ref(queryText('endDate') || defaultEnd)
const hideEmpty = ref(false)

const rows = shallowRef<SalesRecapRow[]>([])
const summary = shallowRef<SalesRecapSummary | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

// LogFilterSelect allows '' (an "all" option); this one has none, so it is always set.
const group = computed<SalesRecapGroupBy>(() => groupBy.value || 'day')
const groupLabel = computed(() => GROUP_OPTIONS.find((o) => o.value === group.value)?.label ?? '')
const rangeError = computed(() =>
  recapRangeError(
    startDate.value,
    endDate.value,
    RECAP_MAX_RANGE_DAYS[group.value],
    `untuk rekap ${groupLabel.value.toLowerCase()}`,
  ),
)
const query = computed(() => ({ groupBy: group.value, startDate: startDate.value, endDate: endDate.value }))
const visibleRows = computed(() => (hideEmpty.value ? rows.value.filter((r) => r.transactions > 0) : rows.value))

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
    const result = await fetchSalesRecap(query.value)
    if (id !== requestId) return // a newer request superseded this one
    rows.value = result?.data ?? []
    summary.value = result?.summary ?? null
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat rekap penjualan.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

// v1: another granularity starts from its default range.
watch(group, (value) => {
  ;[startDate.value, endDate.value] = defaultRecapRange(value)
})
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
    await downloadSalesRecap(query.value)
  } catch (err) {
    toast.value = err instanceof ApiError ? err.message : 'Gagal mengunduh rekap penjualan.'
  } finally {
    downloading.value = false
  }
}

const emptyText = computed(() =>
  hideEmpty.value && rows.value.length ? 'Tidak ada periode dengan penjualan.' : 'Tidak ada data pada rentang ini.',
)
</script>

<template>
  <DashboardLayout title="Rekap Penjualan">
    <template #header>
      <PageHeader title="Rekap Penjualan">
        <div class="flex flex-wrap items-end gap-6 lg:flex-nowrap">
          <LogFilterSelect v-model="groupBy" label="Rekap" :options="GROUP_OPTIONS" />
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
      Rekap penjualan (transaksi settlement) dari semua vending machine Anda, dijumlahkan per hari, bulan, atau
      tahun.
    </p>

    <div v-if="summary && !loading && !error" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <RecapStatCard label="Total Penjualan (Gross)" :value="formatRupiah(summary.gross)" />
      <RecapStatCard label="Transaksi" :value="formatCount(summary.transactions)" />
      <RecapStatCard label="Qty Terjual" :value="formatCount(summary.qty)" />
      <RecapStatCard
        label="Mesin Bertransaksi"
        :value="`${formatCount(summary.machines)} / ${formatCount(summary.totalMachines)}`"
      />
    </div>

    <label class="flex w-fit cursor-pointer items-center gap-3 text-sm text-ink">
      <AppSwitch v-model="hideEmpty" label="Sembunyikan periode tanpa penjualan" />
      Sembunyikan periode tanpa penjualan
    </label>

    <SalesRecapTable
      :rows="visibleRows"
      :summary="summary"
      :group-by="group"
      :group-label="groupLabel"
      :loading="loading"
      :error="error"
      :empty-text="emptyText"
      @retry="load"
    />

    <AppToast v-model="toast" variant="error" />
  </DashboardLayout>
</template>
