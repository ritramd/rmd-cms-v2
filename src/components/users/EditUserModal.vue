<script setup lang="ts">
// Figma: "8.3-D-Ubah User" (1097:28899)
// Mirrored from rmd-cms v1 (pages/users/index.vue).
import { computed, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { UserAndVending, YourVending } from '@/types/user'

const props = defineProps<{
  open: boolean
  busy?: boolean
  user: UserAndVending | null
  yourVendings: YourVending[]
}>()

const emit = defineEmits<{
  close: []
  submit: [user: UserAndVending, newRole: string, selectedMachineIds: number[]]
}>()

const selectedRole = ref('Pro')
const selectedMachineIds = ref<number[]>([])
const machineSearch = ref('')

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

// When user changes or modal opens, initialize fields
watch(
  () => [props.open, props.user] as const,
  ([isOpen, u]) => {
    if (isOpen && u) {
      selectedRole.value = u.roleName || 'Pro'
      machineSearch.value = ''

      // Pre-check machines currently assigned to this user
      const assignedNames = new Set(u.vendingMachineNames ?? [])
      selectedMachineIds.value = props.yourVendings
        .filter((v) => assignedNames.has(v.name))
        .map((v) => v.vendingId)
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!props.user) return
  emit('submit', props.user, selectedRole.value, [...selectedMachineIds.value])
}
</script>

<template>
  <AppModal
    :open="open"
    title="Ubah User"
    width="w-[720px]"
    :busy="busy"
    @close="$emit('close')"
  >
    <form v-if="user" class="space-y-5" @submit.prevent="handleSubmit">
      <!-- Nama User (Disabled in Figma) -->
      <div class="space-y-1.5">
        <label class="block font-inter text-xs font-bold uppercase tracking-wider text-ink-placeholder">
          Nama User
        </label>
        <div class="rounded-lg border border-line-soft bg-line-soft/60 px-3.5 py-2.5 text-sm text-ink-muted">
          {{ user.userName }}
        </div>
      </div>

      <!-- Email (Disabled in Figma) -->
      <div class="space-y-1.5">
        <label class="block font-inter text-xs font-bold uppercase tracking-wider text-ink-placeholder">
          Email
        </label>
        <div class="rounded-lg border border-line-soft bg-line-soft/60 px-3.5 py-2.5 text-sm text-ink-muted">
          {{ user.email }}
        </div>
      </div>

      <!-- Role -->
      <div class="space-y-1.5">
        <label for="edit-user-role" class="block font-inter text-xs font-bold uppercase tracking-wider text-ink-placeholder">
          Role
        </label>
        <div class="relative">
          <select
            id="edit-user-role"
            v-model="selectedRole"
            class="w-full appearance-none cursor-pointer rounded-lg border border-line bg-surface pl-3.5 pr-10 py-2.5 text-sm text-ink-strong shadow-xs transition-colors focus:border-brand focus:outline-none"
            :disabled="busy"
          >
            <option v-for="r in roles" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
          <AppIcon
            name="line-select-chevron"
            class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      <!-- Tambah / Atur Mesin -->
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
