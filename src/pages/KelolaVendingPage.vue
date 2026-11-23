<script setup lang="ts">
// Figma: 5.1-D-Daftar Vending (1097:20872), 5.2-D-Popup Edit (1097:20943), 5.8-D-Daftar Vending inline edit (1097:16027)
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import VendingCard from '@/components/kelola-vending/VendingCard.vue'
import VendingDetailModal from '@/components/kelola-vending/VendingDetailModal.vue'
import VendingFilterBar from '@/components/kelola-vending/VendingFilterBar.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  fetchKelolaVendingMachines,
  updateVendingMachineName,
} from '@/services/kelolaVending'
import type { KelolaVendingMachine } from '@/types/kelolaVending'

const route = useRoute()
const router = useRouter()

const search = ref((route.query.search as string) || '')
const selectedFilter = ref((route.query.machine as string) || 'Semua')

const machines = ref<KelolaVendingMachine[]>([])
const loading = ref(true)
const toast = ref<string | null>(null)
const toastVariant = ref<'success' | 'error'>('success')

const activeDetailMachine = ref<KelolaVendingMachine | null>(null)

async function loadMachines() {
  loading.value = true
  try {
    machines.value = await fetchKelolaVendingMachines(search.value)
  } catch {
    toastVariant.value = 'error'
    toast.value = 'Gagal memuat daftar vending machine.'
  } finally {
    loading.value = false
  }
}

// Filtered list based on dropdown selection
const filteredMachines = computed(() => {
  if (selectedFilter.value === 'Semua') return machines.value
  return machines.value.filter((m) => m.code === selectedFilter.value)
})

let searchDebounce: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    void loadMachines()
    syncUrl()
  }, 300)
})

function syncUrl() {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.search = search.value.trim()
  if (selectedFilter.value !== 'Semua') query.machine = selectedFilter.value
  void router.replace({ query })
}

function onMachineSelect() {
  syncUrl()
}

async function handleRename(code: string, newName: string) {
  const success = await updateVendingMachineName(code, newName)
  if (success) {
    const idx = machines.value.findIndex((m) => m.code === code)
    if (idx !== -1) {
      machines.value[idx].name = newName
    }
    if (activeDetailMachine.value?.code === code) {
      activeDetailMachine.value.name = newName
    }
    toastVariant.value = 'success'
    toast.value = `Nama mesin ${code} berhasil diperbarui menjadi "${newName}".`
  } else {
    toastVariant.value = 'error'
    toast.value = `Gagal memperbarui nama mesin ${code}.`
  }
}

function openDetail(machine: KelolaVendingMachine) {
  activeDetailMachine.value = machine
}

function handleLivePreview(machine: KelolaVendingMachine) {
  void router.push({
    path: '/live-preview',
    query: { machine: machine.code, from: 'daftar-vending' },
  })
}

function handleAddMachine() {
  toastVariant.value = 'success'
  toast.value = 'Silakan hubungi administrator Smartven untuk menambahkan unit vending machine baru.'
}

onMounted(async () => {
  await loadMachines()
  if (route.query.machine && route.query.detail === 'true') {
    const found = machines.value.find((m) => m.code === route.query.machine)
    if (found) activeDetailMachine.value = found
  }
})
</script>

<template>
  <DashboardLayout title="Daftar Vending">
    <template #header>
      <PageHeader
        title="Daftar Vending"
        subtitle="Kelola unit vending machine, pantau suhu, dan konfigurasi profil mesin"
      />
    </template>

    <div class="space-y-6">
      <!-- Filter Bar -->
      <VendingFilterBar
        v-model:selected-machine="selectedFilter"
        v-model:search="search"
        :machines="machines"
        @select="onMachineSelect"
        @add-machine="handleAddMachine"
      />

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="i in 8"
          :key="i"
          class="h-72 animate-pulse rounded-2xl border border-line bg-surface-muted/60 p-5 shadow-card"
        />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredMachines.length === 0"
        class="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface py-16 px-4 text-center shadow-card"
      >
        <p class="text-base font-semibold text-ink-heading">Tidak ada vending machine yang cocok</p>
        <p class="mt-1 text-sm text-ink-muted">Coba ubah kata kunci pencarian atau filter mesin di atas.</p>
      </div>

      <!-- Machine Cards Grid -->
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <VendingCard
          v-for="machine in filteredMachines"
          :key="machine.code"
          :machine="machine"
          @select="openDetail"
          @rename="handleRename"
        />
      </div>
    </div>

    <!-- Detail Modal -->
    <VendingDetailModal
      :open="!!activeDetailMachine"
      :machine="activeDetailMachine"
      @close="activeDetailMachine = null"
      @rename="handleRename"
      @live-preview="handleLivePreview"
    />

    <!-- Toast Notification -->
    <AppToast v-model="toast" :variant="toastVariant" />
  </DashboardLayout>
</template>
