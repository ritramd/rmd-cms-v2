<script setup lang="ts">
// Figma: 1.7-D-Final Homepage (1097:42239)
import { computed, ref } from 'vue'
import AttentionCard from '@/components/dashboard/AttentionCard.vue'
import MachineTable from '@/components/dashboard/MachineTable.vue'
import RevenueCard from '@/components/dashboard/RevenueCard.vue'
import VendingStatusCard from '@/components/dashboard/VendingStatusCard.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { getSession } from '@/services/auth'
import { fetchRecapSales } from '@/services/sales'
import { fetchVendingMachines, fetchVendingStatus } from '@/services/vending'
import { buildAttentionItems } from '@/utils/attention'
import { downloadCsv } from '@/utils/csv'
import { formatDateRange } from '@/utils/format'

const search = ref('')
const greeting = `Selamat datang kembali, ${getSession()?.name ?? 'Admin'}.`

const recap = useAsyncData(fetchRecapSales, 'Gagal memuat total pendapatan.') // GET /recap-sales
const status = useAsyncData(fetchVendingStatus, 'Gagal memuat status mesin.') // GET /status-vending/resume
const list = useAsyncData(fetchVendingMachines, 'Gagal memuat daftar mesin.') // GET /status-vending

/** "2026-11-01 sampai 2026-11-03" → "Bulan ini · 1–3 Nov 2026" */
const revenuePeriod = computed(() => {
  const [start, end] = recap.data.value?.time.monthlySales.split(' sampai ') ?? []
  return start && end ? `Bulan ini · ${formatDateRange(start, end)}` : 'Bulan ini'
})

const machines = computed(() => list.data.value ?? [])
const attention = computed(() => buildAttentionItems(machines.value))

const filteredMachines = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return machines.value
  return machines.value.filter((m) => [m.name, m.location, m.id].some((field) => field?.toLowerCase().includes(q)))
})

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
    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,788fr)_minmax(0,382fr)_minmax(0,382fr)]">
      <!-- /recap-sales has no target or growth figures, so the card shows the period instead. -->
      <RevenueCard
        class="md:col-span-2 xl:col-span-1"
        :revenue="recap.data.value?.total.monthlySales ?? null"
        :loading="recap.loading.value"
        :error="recap.error.value"
        :period-label="revenuePeriod"
        @retry="recap.reload"
      />
      <VendingStatusCard
        :total="status.data.value?.total ?? null"
        :online="status.data.value?.online ?? null"
        :offline="status.data.value?.offline ?? null"
        :loading="status.loading.value"
        :error="status.error.value"
        @retry="status.reload"
      />
      <AttentionCard
        :items="attention"
        :loading="list.loading.value"
        :error="list.error.value"
        @retry="list.reload"
      />
    </div>

    <MachineTable
      :machines="filteredMachines"
      :loading="list.loading.value"
      :error="list.error.value"
      @retry="list.reload"
      @download="exportMachines"
    >
      <template #subtitle>
        {{ list.loading.value ? 'Memuat data mesin…' : `Memantau performa ${machines.length} mesin hari ini` }}
      </template>
    </MachineTable>
  </DashboardLayout>
</template>
