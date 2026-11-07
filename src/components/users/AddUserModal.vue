<script setup lang="ts">
// Figma: "8.2-D-Tambah User" (1097:28419)
// Mirrored from rmd-cms v1 (pages/users/index.vue).
import { computed, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { AddUserPayload, ListParent, YourVending } from '@/types/user'

const props = defineProps<{
  open: boolean
  busy?: boolean
  yourVendings: YourVending[]
  listParent?: ListParent[]
  isInternalUser?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: AddUserPayload, selectedMachineIds: number[]]
}>()

const form = ref({
  newName: '',
  newEmail: '',
  newPackage: 'Pro',
  crossUser: '' as string | number,
  newSubRole: 'main-client',
})

const selectedMachineIds = ref<number[]>([])
const machineSearch = ref('')
const validationError = ref<string | null>(null)

// Role options matching legacy & Figma
const roles = [
  { label: 'Basic (Starter)', value: 'Starter' },
  { label: 'Pro', value: 'Pro' },
  { label: 'Priority', value: 'Priority' },
]

const filteredVendings = computed(() => {
  if (!machineSearch.value.trim()) return props.yourVendings
  const q = machineSearch.value.toLowerCase()
  return props.yourVendings.filter((v) => v.name.toLowerCase().includes(q))
})

function isMachineChecked(id: number): boolean {
  return selectedMachineIds.value.includes(id)
}

function toggleMachine(id: number, checked: boolean) {
  if (checked) {
    if (!selectedMachineIds.value.includes(id)) {
      selectedMachineIds.value.push(id)
    }
  } else {
    selectedMachineIds.value = selectedMachineIds.value.filter((mId) => mId !== id)
  }
}

function selectAllMachines() {
  selectedMachineIds.value = props.yourVendings.map((v) => v.vendingId)
}

function clearAllMachines() {
  selectedMachineIds.value = []
}

function validate(): boolean {
  validationError.value = null
  if (!form.value.newName.trim()) {
    validationError.value = 'Nama user wajib diisi.'
    return false
  }
  if (!form.value.newEmail.trim()) {
    validationError.value = 'Email wajib diisi.'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.newEmail.trim())) {
    validationError.value = 'Format email tidak valid.'
    return false
  }
  if (!form.value.newPackage) {
    validationError.value = 'Silakan pilih role.'
    return false
  }
  return true
}

function handleSubmit() {
  if (!validate()) return

  const payload: AddUserPayload = {
    newName: form.value.newName.trim(),
    newEmail: form.value.newEmail.trim(),
    newPackage: form.value.newPackage,
    newCategory: 'perorangan',
    crossUser: form.value.crossUser || undefined,
    newSubRole: form.value.newSubRole || undefined,
  }

  emit('submit', payload, [...selectedMachineIds.value])
}

// Reset form when modal opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.value = {
        newName: '',
        newEmail: '',
        newPackage: 'Pro',
        crossUser: '',
        newSubRole: 'main-client',
      }
      selectedMachineIds.value = []
      machineSearch.value = ''
      validationError.value = null
    }
  },
)
</script>

<template>
  <AppModal
    :open="open"
    title="Tambah User"
    width="w-[720px]"
    :busy="busy"
    @close="$emit('close')"
  >
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <!-- Error Banner -->
      <div
        v-if="validationError"
        role="alert"
        class="rounded-xl border border-danger/30 bg-danger-soft p-3 text-xs font-medium text-danger-strong"
      >
        {{ validationError }}
      </div>

      <!-- Nama User -->
      <div class="space-y-1.5">
        <label for="new-user-name" class="block font-inter text-xs font-bold uppercase tracking-wider text-ink-placeholder">
          Nama User
        </label>
        <input
          id="new-user-name"
          v-model="form.newName"
          type="text"
          placeholder="Masukkan nama user..."
          class="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink-strong shadow-xs transition-colors placeholder:text-ink-placeholder focus:border-brand focus:outline-none"
          :disabled="busy"
        />
      </div>

      <!-- Email -->
      <div class="space-y-1.5">
        <label for="new-user-email" class="block font-inter text-xs font-bold uppercase tracking-wider text-ink-placeholder">
          Email
        </label>
        <input
          id="new-user-email"
          v-model="form.newEmail"
          type="email"
          placeholder="contoh: user@gmail.com"
          class="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink-strong shadow-xs transition-colors placeholder:text-ink-placeholder focus:border-brand focus:outline-none"
          :disabled="busy"
        />
      </div>

      <!-- Role -->
      <div class="space-y-1.5">
        <label for="new-user-role" class="block font-inter text-xs font-bold uppercase tracking-wider text-ink-placeholder">
          Role
        </label>
        <select
          id="new-user-role"
          v-model="form.newPackage"
          class="w-full cursor-pointer rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink-strong shadow-xs transition-colors focus:border-brand focus:outline-none"
          :disabled="busy"
        >
          <option v-for="r in roles" :key="r.value" :value="r.value">
            {{ r.label }}
          </option>
        </select>
      </div>

      <!-- Dev/Ops: Parent User selector -->
      <div v-if="isInternalUser && listParent && listParent.length > 0" class="space-y-1.5">
        <label for="new-user-parent" class="block font-inter text-xs font-bold uppercase tracking-wider text-ink-placeholder">
          Parent User (Dev / Ops)
        </label>
        <select
          id="new-user-parent"
          v-model="form.crossUser"
          class="w-full cursor-pointer rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink-strong shadow-xs transition-colors focus:border-brand focus:outline-none"
          :disabled="busy"
        >
          <option value="">Pilih Parent User (Default: Akun Saat Ini)</option>
          <option v-for="p in listParent" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>
      </div>

      <!-- Tambah Mesin -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="block font-inter text-xs font-bold uppercase tracking-wider text-ink-placeholder">
            Tambah Mesin
          </label>
          <div v-if="yourVendings.length > 0" class="flex gap-2 text-xs">
            <button
              type="button"
              class="text-brand hover:underline cursor-pointer"
              @click="selectAllMachines"
            >
              Pilih Semua ({{ yourVendings.length }})
            </button>
            <span class="text-ink-placeholder">•</span>
            <button
              type="button"
              class="text-ink-muted hover:underline cursor-pointer"
              @click="clearAllMachines"
            >
              Hapus Pilihan
            </button>
          </div>
        </div>

        <!-- Search Mesin -->
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-placeholder">
            <AppIcon name="search" class="size-4" />
          </span>
          <input
            v-model="machineSearch"
            type="text"
            placeholder="Cari mesin untuk dikelola user"
            class="w-full rounded-lg border border-line bg-surface pl-9 pr-3.5 py-2 text-sm text-ink-strong shadow-xs transition-colors placeholder:text-ink-placeholder focus:border-brand focus:outline-none"
            :disabled="busy"
          />
        </div>

        <!-- Mesin List -->
        <div
          v-if="yourVendings.length > 0"
          class="grid max-h-48 grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-line-soft bg-surface-muted/30 p-2.5"
        >
          <div
            v-for="vending in filteredVendings"
            :key="vending.vendingId"
            class="flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-surface"
          >
            <AppCheckbox
              :label="vending.name"
              :model-value="isMachineChecked(vending.vendingId)"
              @update:model-value="(val) => toggleMachine(vending.vendingId, val)"
            />
            <span class="text-xs font-medium text-ink-strong truncate" :title="vending.name">
              {{ vending.name }}
            </span>
          </div>
          <div v-if="filteredVendings.length === 0" class="col-span-full py-4 text-center text-xs text-ink-muted">
            Tidak ada mesin sesuai pencarian.
          </div>
        </div>
        <p v-else class="text-xs text-ink-muted italic">
          Belum ada mesin Smartven terdaftar di akun ini.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-line-soft">
        <AppButton
          type="button"
          :disabled="busy"
          @click="$emit('close')"
        >
          Cancel
        </AppButton>
        <AppButton
          type="submit"
          variant="primary"
          :disabled="busy"
        >
          {{ busy ? 'Menyimpan...' : 'Save' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
