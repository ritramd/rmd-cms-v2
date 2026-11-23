<script setup lang="ts">
// Figma: 5.14-D-Apply Filter / Terapkan Konten (1097:18682)
import { computed, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { updateAdvertisement } from '@/services/advertisements'
import type { Advertisement } from '@/types/advertisement'
import type { KelolaVendingMachine } from '@/types/kelolaVending'

const props = defineProps<{
  open: boolean
  ad: Advertisement | null
  machines: KelolaVendingMachine[]
}>()

const emit = defineEmits<{
  close: []
  applied: [adId: number]
}>()

const search = ref('')
const selectedMachineIds = ref<number[]>([])
const useSchedule = ref(false)
const startDate = ref('')
const endDate = ref('')
const startHour = ref('08:00')
const endHour = ref('21:00')
const busy = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.ad,
  (val) => {
    if (val) {
      selectedMachineIds.value = [...(val.vmid || [])]
      useSchedule.value = Boolean(val.start_date || val.start_hour)
      startDate.value = val.start_date || ''
      endDate.value = val.end_date || ''
      startHour.value = val.start_hour || '08:00'
      endHour.value = val.end_hour || '21:00'
      search.value = ''
      errorMessage.value = null
    }
  },
  { immediate: true },
)

const filteredMachines = computed(() => {
  if (!search.value.trim()) return props.machines
  const s = search.value.toLowerCase()
  return props.machines.filter(
    (m) => m.code.toLowerCase().includes(s) || m.name.toLowerCase().includes(s),
  )
})

const isAllSelected = computed(() => {
  if (props.machines.length === 0) return false
  return props.machines.every((m) => selectedMachineIds.value.includes(m.id))
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedMachineIds.value = []
  } else {
    selectedMachineIds.value = props.machines.map((m) => m.id)
  }
}

function toggleMachine(id: number) {
  const idx = selectedMachineIds.value.indexOf(id)
  if (idx !== -1) {
    selectedMachineIds.value.splice(idx, 1)
  } else {
    selectedMachineIds.value.push(id)
  }
}

async function handleApply() {
  if (!props.ad) return
  busy.value = true
  errorMessage.value = null

  try {
    const selectedMachines = props.machines.filter((m) => selectedMachineIds.value.includes(m.id))
    const vmcodes = selectedMachines.map((m) => m.code)

    await updateAdvertisement(
      props.ad.id,
      {
        vending_machine_id: selectedMachineIds.value,
        start_date: useSchedule.value && startDate.value ? startDate.value : null,
        end_date: useSchedule.value && endDate.value ? endDate.value : null,
        start_hour: useSchedule.value && startHour.value ? startHour.value : null,
        end_hour: useSchedule.value && endHour.value ? endHour.value : null,
      },
      vmcodes,
    )

    emit('applied', props.ad.id)
    emit('close')
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal menerapkan konten ke vending machine.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AppModal
    :open="open && !!ad"
    title="Terapkan Konten"
    width="w-[850px]"
    :busy="busy"
    @close="$emit('close')"
  >
    <div v-if="ad" class="space-y-6">
      <!-- Error Banner -->
      <div
        v-if="errorMessage"
        class="rounded-xl border border-danger bg-danger-soft p-4 text-sm font-semibold text-danger-strong"
      >
        {{ errorMessage }}
      </div>

      <!-- Content Summary Banner -->
      <div class="flex items-center gap-4 rounded-2xl border border-line bg-canvas p-4">
        <div class="size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
          <img :src="ad.file" :alt="ad.description" class="size-full object-cover" />
        </div>
        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-ink-heading">{{ ad.advertiser }}</span>
            <span class="rounded bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
              {{ ad.spot }}
            </span>
          </div>
          <p class="truncate text-xs font-medium text-ink-muted">{{ ad.description }}</p>
        </div>
      </div>

      <!-- Machine Multi-Selection -->
      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <label class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Pilih Vending Machine Target ({{ selectedMachineIds.length }} Terpilih)
          </label>
          <button
            type="button"
            class="text-xs font-semibold text-primary hover:underline"
            @click="toggleSelectAll"
          >
            {{ isAllSelected ? 'Batalkan Semua' : 'Pilih Semua Mesin' }}
          </button>
        </div>

        <!-- Search input for machine list -->
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="Cari kode atau nama vending..."
            class="w-full rounded-xl border border-line bg-surface py-2 pr-4 pl-9 text-xs text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-subtle">
            <AppIcon name="line-search" class="size-3.5" />
          </span>
        </div>

        <!-- Machine list container with checkboxes -->
        <div class="max-h-56 overflow-y-auto rounded-xl border border-line bg-surface divide-y divide-line-soft">
          <div
            v-for="machine in filteredMachines"
            :key="machine.id"
            class="flex items-center justify-between p-3 transition hover:bg-canvas cursor-pointer"
            @click="toggleMachine(machine.id)"
          >
            <div class="flex items-center gap-3">
              <AppCheckbox
                :model-value="selectedMachineIds.includes(machine.id)"
                :label="`Pilih mesin ${machine.code}`"
                @update:model-value="toggleMachine(machine.id)"
              />
              <div>
                <span class="text-xs font-bold text-ink-heading uppercase">{{ machine.code }}</span>
                <span class="ml-2 text-xs text-ink-muted">{{ machine.name }}</span>
              </div>
            </div>

            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              :class="
                machine.isOnline
                  ? 'bg-success-soft text-success-strong'
                  : 'bg-surface-muted text-ink-subtle'
              "
            >
              {{ machine.isOnline ? 'Online' : 'Offline' }}
            </span>
          </div>

          <div v-if="filteredMachines.length === 0" class="p-6 text-center text-xs text-ink-subtle">
            Tidak ada vending machine yang cocok dengan pencarian.
          </div>
        </div>
      </div>

      <!-- Jadwal Configuration -->
      <div class="rounded-2xl border border-line bg-surface-muted/30 p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-ink-heading">Atur Jadwal Tayang Pada Mesin</span>
          </div>

          <label class="relative inline-flex cursor-pointer items-center">
            <input v-model="useSchedule" type="checkbox" class="peer sr-only" />
            <div class="peer h-6 w-11 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:left-[2px] after:size-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none" />
          </label>
        </div>

        <div v-if="useSchedule" class="mt-4 grid grid-cols-1 gap-4 pt-4 border-t border-line-soft sm:grid-cols-2">
          <!-- Start Date & Time -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-ink-subtle">Mulai Tayang</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="startDate"
                type="date"
                class="rounded-xl border border-line bg-surface p-2 text-xs font-medium text-ink outline-none focus:border-primary"
              />
              <input
                v-model="startHour"
                type="time"
                class="rounded-xl border border-line bg-surface p-2 text-xs font-medium text-ink outline-none focus:border-primary"
              />
            </div>
          </div>

          <!-- End Date & Time -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-ink-subtle">Berakhir Tayang</label>
            <div class="grid grid-cols-2 gap-2">
              <input
                v-model="endDate"
                type="date"
                class="rounded-xl border border-line bg-surface p-2 text-xs font-medium text-ink outline-none focus:border-primary"
              />
              <input
                v-model="endHour"
                type="time"
                class="rounded-xl border border-line bg-surface p-2 text-xs font-medium text-ink outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 border-t border-line-soft pt-4">
        <AppButton variant="secondary" :disabled="busy" @click="$emit('close')">
          Batal
        </AppButton>
        <AppButton variant="primary" :disabled="busy" @click="handleApply">
          {{ busy ? 'Menyimpan…' : 'Terapkan Konten' }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
