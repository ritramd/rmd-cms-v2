<script setup lang="ts">
// VM & Machine Config (sidebar "Configs"). Mirrors v1 pages/vm-config/index.vue: pick a machine,
// edit its kiosk config (PUT /config) and hardware config (PUT /vm/config), save both together.
// No Figma frame; layout and fields follow the other v2 dashboard pages.
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MachineConfigForm from '@/components/configs/MachineConfigForm.vue'
import VmConfigForm from '@/components/configs/VmConfigForm.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import MachineSearchField from '@/components/sales/MachineSearchField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToast from '@/components/ui/AppToast.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { getSession } from '@/services/auth'
import {
  fetchConfigMachines,
  fetchMachineConfig,
  fetchVmConfig,
  saveMachineConfig,
  saveVmConfig,
} from '@/services/vmConfig'
import type { SalesMachine } from '@/types/sales'
import type { ConfigErrors, MachineConfigForm as MachineForm, VmConfigForm as VmForm } from '@/types/vmConfig'
import { canSeeVmConfig, hasVmConfigPackage } from '@/utils/access'
import { validateMachineConfig, validateVmConfig } from '@/utils/vmConfig'

const route = useRoute()
const router = useRouter()

const session = getSession()
const pkg = session?.package ?? ''
const isDev = (session?.subRole ?? '').includes('dev')
/** Main clients only (the menu is hidden for others); the URL can still be opened directly. */
const isMainClient = canSeeVmConfig(session)
/** v1 opens the page to Pro and Priority packages only. */
const hasPackage = hasVmConfigPackage(session)
const hasAccess = isMainClient && hasPackage
/** v1: Cart Purchase journey for Priority / Pro packages and dev. */
const canUseCart = pkg === 'Priority' || pkg === 'Pro' || isDev

const machines = shallowRef<SalesMachine[]>([])
const machinesLoading = ref(false)
const machinesError = ref<string | null>(null)
const machineSearch = ref('')
const selectedCode = ref(typeof route.query.vmcode === 'string' ? route.query.vmcode.toUpperCase() : '')
const selectedMachine = computed(() => machines.value.find((m) => m.code === selectedCode.value) ?? null)

const loading = ref(false)
const loadError = ref<string | null>(null)
const configExists = ref(false)
const vmForm = ref<VmForm | null>(null)
const machineForm = ref<MachineForm | null>(null)
const vmErrors = ref<ConfigErrors<VmForm>>({})
const machineErrors = ref<ConfigErrors<MachineForm>>({})

const confirmOpen = ref(false)
const saving = ref(false)
const saveError = ref<string | null>(null)
const toast = ref<string | null>(null)
const toastVariant = ref<'error' | 'success'>('error')

function showToast(message: string, variant: 'error' | 'success') {
  toastVariant.value = variant
  toast.value = message
}

async function loadMachines() {
  machinesLoading.value = true
  machinesError.value = null
  try {
    machines.value = await fetchConfigMachines()
  } catch (err) {
    machinesError.value = err instanceof ApiError ? err.message : 'Gagal memuat daftar mesin.'
  } finally {
    machinesLoading.value = false
  }
}

let requestId = 0
async function loadConfigs(code: string) {
  const id = ++requestId
  loading.value = true
  loadError.value = null
  vmErrors.value = {}
  machineErrors.value = {}
  try {
    const [vm, machine] = await Promise.all([fetchVmConfig(code), fetchMachineConfig(code)])
    if (id !== requestId) return
    configExists.value = vm.exists
    vmForm.value = vm.form
    machineForm.value = machine
  } catch (err) {
    if (id !== requestId) return
    vmForm.value = null
    machineForm.value = null
    loadError.value = err instanceof ApiError ? err.message : 'Gagal memuat konfigurasi mesin.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function selectMachine(machine: SalesMachine) {
  selectedCode.value = machine.code
}

// Keep ?vmcode= in the URL so a machine's config can be linked and survives a reload.
watch(selectedCode, (code) => {
  void router.replace({ query: { ...route.query, vmcode: code || undefined } })
  vmForm.value = null
  machineForm.value = null
  if (code) void loadConfigs(code)
})

/** Same checks as v1 before asking for confirmation; the QRIS message first, as v1 shows it. */
function requestSave() {
  if (!vmForm.value || !machineForm.value) return
  vmErrors.value = validateVmConfig(vmForm.value)
  machineErrors.value = validateMachineConfig(machineForm.value)

  if (vmForm.value.isQris && (!vmForm.value.mid.trim() || !vmForm.value.tid.trim())) {
    showToast('MID dan TID wajib diisi jika QRIS aktif.', 'error')
    return
  }
  if (Object.keys(vmErrors.value).length || Object.keys(machineErrors.value).length) {
    showToast('Lengkapi semua kolom yang wajib diisi.', 'error')
    return
  }
  saveError.value = null
  confirmOpen.value = true
}

async function confirmSave() {
  if (!vmForm.value || !machineForm.value || !selectedCode.value) return
  saving.value = true
  saveError.value = null
  try {
    await saveVmConfig(selectedCode.value, vmForm.value)
    await saveMachineConfig(selectedCode.value, machineForm.value)
    confirmOpen.value = false
    showToast('Konfigurasi berhasil disimpan.', 'success')
    // v1 reloads the page; reload from the server so the form shows what was stored.
    void loadConfigs(selectedCode.value)
  } catch (err) {
    saveError.value = err instanceof ApiError ? err.message : 'Konfigurasi gagal disimpan. Silakan coba lagi.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!hasAccess) return
  void loadMachines()
  if (selectedCode.value) {
    machineSearch.value = selectedCode.value
    void loadConfigs(selectedCode.value)
  }
})
</script>

<template>
  <DashboardLayout title="Konfigurasi Mesin">
    <template #header>
      <PageHeader title="Konfigurasi Mesin" />
    </template>

    <section v-if="!isMainClient" class="rounded-2xl bg-surface p-8 text-center shadow-card">
      <p class="text-sm font-bold text-ink-strong">Halaman ini hanya untuk akun utama.</p>
      <p class="mt-1 text-sm text-ink-muted">Hubungi pemilik akun untuk mengubah konfigurasi mesin.</p>
    </section>
    <section v-else-if="!hasPackage" class="rounded-2xl bg-surface p-8 text-center shadow-card">
      <p class="text-sm font-bold text-ink-strong">Halaman ini tersedia untuk paket Pro dan Priority.</p>
      <p class="mt-1 text-sm text-ink-muted">Upgrade paket untuk mengatur konfigurasi mesin.</p>
    </section>

    <template v-else>
      <section class="flex flex-col gap-3 rounded-2xl bg-surface p-6 shadow-card">
        <div class="flex flex-col gap-1">
          <h2 class="text-sm font-bold text-ink-strong">Pilih Mesin</h2>
          <p class="text-xs text-ink-muted">Pilih mesin vending untuk melihat dan mengubah konfigurasinya.</p>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <MachineSearchField
            v-model="machineSearch"
            :machines="machines"
            :placeholder="machinesLoading ? 'Memuat daftar mesin…' : 'Cari kode atau nama mesin'"
            @select="selectMachine"
          />
          <p v-if="selectedMachine" class="text-sm text-ink">
            <span class="font-bold text-ink-strong">{{ selectedMachine.code }}</span>
            <template v-if="selectedMachine.name"> · {{ selectedMachine.name }}</template>
          </p>
        </div>
        <p v-if="machinesError" role="alert" class="flex items-center gap-2 text-sm text-danger-strong">
          {{ machinesError }}
          <button type="button" class="font-bold text-primary hover:underline" @click="loadMachines">Coba lagi</button>
        </p>
      </section>

      <p v-if="!selectedCode" class="py-10 text-center text-sm text-ink-muted">
        Belum ada mesin yang dipilih.
      </p>
      <p v-else-if="loading" class="py-10 text-center text-sm text-ink-muted">Memuat konfigurasi…</p>
      <div v-else-if="loadError" class="flex flex-col items-center gap-2 py-10 text-sm text-ink-muted">
        {{ loadError }}
        <button type="button" class="font-bold text-primary hover:underline" @click="loadConfigs(selectedCode)">
          Coba lagi
        </button>
      </div>

      <template v-else-if="vmForm && machineForm">
        <div class="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <VmConfigForm
            v-model="vmForm"
            :code="selectedCode"
            :exists="configExists"
            :errors="vmErrors"
            :is-dev="isDev"
            :can-use-cart="canUseCart"
          />
          <MachineConfigForm v-model="machineForm" :code="selectedCode" :errors="machineErrors" :is-dev="isDev" />
        </div>

        <div
          class="sticky bottom-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface px-6 py-4 shadow-card"
        >
          <p class="text-sm text-ink-muted">Perubahan diterapkan ke mesin sekitar 15 menit setelah disimpan.</p>
          <AppButton variant="primary" :disabled="saving" @click="requestSave">Simpan Konfigurasi</AppButton>
        </div>
      </template>
    </template>

    <ConfirmDialog
      :open="confirmOpen"
      title="Simpan konfigurasi?"
      :message="`Pastikan semua pengaturan untuk ${selectedCode} sudah benar. Perubahan akan diterapkan ke mesin sekitar 15 menit setelah disimpan.`"
      confirm-label="Ya, Simpan"
      :busy="saving"
      :error="saveError"
      @confirm="confirmSave"
      @close="confirmOpen = false"
    />
    <AppToast v-model="toast" :variant="toastVariant" />
  </DashboardLayout>
</template>
