<script setup lang="ts">
// Figma: 1.7-D-Final Homepage (1097:42239)
import { computed, ref } from 'vue'
import AttentionCard from '@/components/dashboard/AttentionCard.vue'
import MachineTable from '@/components/dashboard/MachineTable.vue'
import RevenueCard from '@/components/dashboard/RevenueCard.vue'
import RevenueTargetModal from '@/components/dashboard/RevenueTargetModal.vue'
import VendingStatusCard from '@/components/dashboard/VendingStatusCard.vue'
import AppToast from '@/components/ui/AppToast.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { getSession } from '@/services/auth'
import { fetchRecapSales, fetchRevenueTarget, saveRevenueTarget } from '@/services/sales'
import { fetchVendingMachines, fetchVendingStatus } from '@/services/vending'
import type { AttentionItem } from '@/types/dashboard'
import type { RevenueTargetProgress } from '@/types/sales'
import type { MachineFilterOptions, VendingMachine } from '@/types/vending'
import { canEditRevenueTarget } from '@/utils/access'
import { buildAttentionItems } from '@/utils/attention'
import { downloadCsv } from '@/utils/csv'
import { formatDateRange, formatRupiah } from '@/utils/format'
import { currentWibPeriod, defaultRevenueTarget } from '@/utils/revenueTarget'

const search = ref('')
const filters = ref<MachineFilterOptions>({
  status: 'all',
  stockRange: 'all',
  type: 'all',
})
const greeting = `Selamat datang kembali, ${getSession()?.name ?? 'Admin'}.`

const recap = useAsyncData(fetchRecapSales, 'Gagal memuat total pendapatan.') // GET /recap-sales
const revenueTarget = useAsyncData(fetchRevenueTarget, 'Gagal memuat target pendapatan.') // GET /client/revenue-target
const status = useAsyncData(fetchVendingStatus, 'Gagal memuat status mesin.') // GET /status-vending/resume
const list = useAsyncData(fetchVendingMachines, 'Gagal memuat daftar mesin.') // GET /status-vending

/** Preview machines matching Figma 1097:42239 when account has no live machines */
const DEFAULT_DASHBOARD_MACHINES: VendingMachine[] = [
  { id: '829232', name: 'VM-001 Snack', type: 'snack', location: 'Lobby Utama', status: 'online', stock: 85, revenue: 1250000 },
  { id: '829235', name: 'VM-002 Minuman', type: 'drink', location: 'Kantin Lt. 2', status: 'offline', stock: 32, revenue: 450000 },
  { id: '829240', name: 'VM-003 Snack', type: 'snack', location: 'Area Parkir B', status: 'online', stock: 49, revenue: 890000 },
  { id: '829299', name: 'VM-004 Kopi', type: 'coffee', location: 'Ruang Meeting', status: 'maintenance', stock: 95, revenue: 0 },
]

/** "2026-11-01 sampai 2026-11-03" → "Bulan ini · 1–3 Nov 2026" */
const revenuePeriod = computed(() => {
  const [start, end] = recap.data.value?.time.monthlySales.split(' sampai ') ?? []
  return start && end ? `Bulan ini · ${formatDateRange(start, end)}` : 'Bulan ini'
})

/**
 * Figma sample data only for an account whose machine list has loaded and is empty. Never while
 * loading: the samples used to flash in (growth badge, target bar, VM-001…) and vanish once the
 * real list arrived. Never after an error either, where they would pass for real figures.
 */
const isDefaultMachines = computed(() => !list.loading.value && !list.error.value && !list.data.value?.length)

// Real figures whenever /recap-sales answered; the Figma sample values only for the demo dashboard.
const revenueGrowth = computed(() => {
  if (recap.data.value) return recap.data.value.growth?.monthlySales.percentage
  if (recap.loading.value) return undefined
  return isDefaultMachines.value ? 12.5 : undefined
})

/** "2026-10-01 00:00:00 sampai 2026-10-21 14:30:00" → "Dibanding 1–21 Okt 2026" */
const growthCompare = computed(() => {
  const period = recap.data.value?.growth?.monthlySales.previousPeriod
  const [start, end] = period?.split(' sampai ').map((part) => part.slice(0, 10)) ?? []
  return start && end ? `Dibanding ${formatDateRange(start, end)}` : undefined
})

/** Machines the client runs, for the default target; /status-vending/resume when the list failed. */
const machineCount = computed(() => list.data.value?.length || Number(status.data.value?.total ?? 0))
const defaultTarget = computed(() => defaultRevenueTarget(machineCount.value))

/**
 * The month's saved target (0 means none); otherwise Rp 10 jt per machine, marked as the default.
 * Waits for everything it depends on so no sample or partial figure flashes in first.
 */
const revenueTargetView = computed<{ amount: number; isDefault: boolean } | null>(() => {
  const saved = revenueTarget.data.value?.target_amount
  if (saved) return { amount: saved, isDefault: false }
  if (revenueTarget.loading.value || recap.loading.value || list.loading.value || status.loading.value) return null
  if (isDefaultMachines.value && !recap.data.value) return { amount: 150000000, isDefault: false }
  return { amount: defaultTarget.value, isDefault: true }
})

const canEditTarget = canEditRevenueTarget(getSession())
const targetPeriod = computed(() => {
  const data = revenueTarget.data.value
  return data ? { year: data.year, month: data.month } : currentWibPeriod()
})
/** { year: 2026, month: 11 } → "November 2026" */
const targetPeriodLabel = computed(() =>
  new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
    new Date(targetPeriod.value.year, targetPeriod.value.month - 1, 1),
  ),
)

const targetModalOpen = ref(false)
const savingTarget = ref(false)
const targetError = ref<string | null>(null)
const toastMessage = ref<string | null>(null)

function openTargetModal() {
  targetError.value = null
  targetModalOpen.value = true
}

async function onSaveTarget(amount: number) {
  savingTarget.value = true
  targetError.value = null
  const period = targetPeriod.value
  try {
    await saveRevenueTarget({ ...period, target_amount: amount })
    // Show the new target right away; the reload keeps it while it fetches the fresh progress.
    const current = revenueTarget.data.value
    const next: RevenueTargetProgress = current
      ? { ...current, target_amount: amount }
      : { target_amount: amount, current_revenue: 0, percentage_achieved: 0, remaining_gap: amount, ...period }
    revenueTarget.data.value = next
    targetModalOpen.value = false
    toastMessage.value = `Target ${targetPeriodLabel.value} disimpan: ${formatRupiah(amount)}.`
    void revenueTarget.reload()
  } catch (err) {
    targetError.value = err instanceof ApiError ? err.message : 'Gagal menyimpan target. Silakan coba lagi.'
  } finally {
    savingTarget.value = false
  }
}

const machines = computed(() => (isDefaultMachines.value ? DEFAULT_DASHBOARD_MACHINES : (list.data.value ?? [])))
const attention = computed(() => buildAttentionItems(machines.value))

const vendingSummary = computed(() => {
  if (isDefaultMachines.value) {
    return { total: 24, online: 21, offline: 3 }
  }
  const apiTotal = Number(status.data.value?.total ?? 0)
  const apiOnline = Number(status.data.value?.online ?? 0)
  const apiOffline = Number(status.data.value?.offline ?? 0)

  if (apiTotal > 0) {
    return { total: apiTotal, online: apiOnline, offline: apiOffline }
  }

  const total = machines.value.length
  const online = machines.value.filter((m) => m.status === 'online').length
  const offline = machines.value.filter((m) => m.status === 'offline').length
  return { total, online, offline }
})

const filteredMachines = computed(() => {
  const q = search.value.trim().toLowerCase()
  return machines.value.filter((m) => {
    if (q) {
      const matchQuery = [m.name, m.location, m.id].some((field) => field?.toLowerCase().includes(q))
      if (!matchQuery) return false
    }

    if (filters.value.status !== 'all' && m.status !== filters.value.status) {
      return false
    }

    if (filters.value.stockRange !== 'all') {
      const stock = m.stock ?? 0
      if (filters.value.stockRange === 'critical' && stock >= 40) return false
      if (filters.value.stockRange === 'medium' && (stock < 40 || stock > 70)) return false
      if (filters.value.stockRange === 'safe' && stock <= 70) return false
    }

    if (filters.value.type !== 'all' && m.type !== filters.value.type) {
      return false
    }

    return true
  })
})

function onSelectStatus(status: 'online' | 'offline') {
  filters.value.status = filters.value.status === status ? 'all' : status
}

function onSelectAttention(item: AttentionItem) {
  if (item.kind === 'low-stock') {
    filters.value.stockRange = filters.value.stockRange === 'critical' ? 'all' : 'critical'
  } else if (item.kind === 'disconnected') {
    filters.value.status = filters.value.status === 'offline' ? 'all' : 'offline'
  }
}

function exportMachines() {
  downloadCsv(
    `daftar-mesin-${new Date().toISOString().slice(0, 10)}.csv`,
    ['Kode Mesin', 'Nama Mesin', 'Status', 'Kapasitas Stok (%)', 'Penjualan Hari Ini'],
    filteredMachines.value.map((m) => [m.id, m.name, m.status, m.stock ?? '', m.revenue ?? '']),
  )
}
</script>

<template>
  <DashboardLayout v-model:search="search" title="Ringkasan Bisnis" :subtitle="greeting">
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <!-- Growth from /recap-sales (month to date vs. the same days last month); target from /client/revenue-target, main clients set it by clicking it. -->
      <RevenueCard
        class="md:col-span-2 xl:col-span-2"
        :revenue="recap.data.value?.total.monthlySales ?? (isDefaultMachines ? 124500000 : null)"
        :loading="recap.loading.value"
        :error="recap.error.value"
        :period-label="revenuePeriod"
        :target="revenueTargetView?.amount"
        :target-is-default="revenueTargetView?.isDefault"
        :target-editable="canEditTarget"
        :growth="revenueGrowth"
        :growth-compare="growthCompare"
        @retry="recap.reload"
        @edit-target="openTargetModal"
      />
      <VendingStatusCard
        class="xl:col-span-1"
        :total="vendingSummary.total"
        :online="vendingSummary.online"
        :offline="vendingSummary.offline"
        :active-status="filters.status"
        :loading="status.loading.value && list.loading.value"
        :error="status.error.value && list.error.value"
        @retry="status.reload"
        @select-status="onSelectStatus"
      />
      <AttentionCard
        class="xl:col-span-1"
        :items="attention"
        :loading="list.loading.value"
        :error="list.error.value"
        @retry="list.reload"
        @select-item="onSelectAttention"
      />
    </div>

    <MachineTable
      v-model:filters="filters"
      :machines="filteredMachines"
      :loading="list.loading.value"
      :error="list.error.value"
      @retry="list.reload"
      @download="exportMachines"
    >
      <template #subtitle>
        {{ list.loading.value ? 'Memuat data mesin…' : `Memantau performa ${isDefaultMachines ? 24 : machines.length} mesin aktif hari ini` }}
      </template>
    </MachineTable>

    <RevenueTargetModal
      :open="targetModalOpen"
      :current="revenueTarget.data.value?.target_amount || undefined"
      :default-target="defaultTarget"
      :machine-count="machineCount"
      :period-label="targetPeriodLabel"
      :busy="savingTarget"
      :error="targetError"
      @close="targetModalOpen = false"
      @submit="onSaveTarget"
    />
    <AppToast v-model="toastMessage" variant="success" />
  </DashboardLayout>
</template>
