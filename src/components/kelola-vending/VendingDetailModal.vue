<script setup lang="ts">
// Figma: 5.2-D-Popup Edit (1097:20943)
import { nextTick, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { KelolaVendingMachine } from '@/types/kelolaVending'

const props = defineProps<{
  open: boolean
  machine: KelolaVendingMachine | null
}>()

const emit = defineEmits<{
  close: []
  rename: [code: string, newName: string]
  livePreview: [machine: KelolaVendingMachine]
}>()

const isEditingName = ref(false)
const editedName = ref('')
const nameInputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.machine,
  (val) => {
    if (val) {
      editedName.value = val.name
      isEditingName.value = false
    }
  },
  { immediate: true },
)

function startEdit() {
  if (!props.machine) return
  isEditingName.value = true
  editedName.value = props.machine.name
  void nextTick(() => {
    nameInputRef.value?.focus()
    nameInputRef.value?.select()
  })
}

function cancelEdit() {
  if (!props.machine) return
  isEditingName.value = false
  editedName.value = props.machine.name
}

function saveEdit() {
  if (!props.machine) return
  const trimmed = editedName.value.trim()
  if (trimmed && trimmed !== props.machine.name) {
    emit('rename', props.machine.code, trimmed)
  }
  isEditingName.value = false
}

function getMachineImage(): string {
  if (!props.machine) return '/img/kelola-vending/sv22.png'
  if (props.machine.snapshot) return props.machine.snapshot
  if (props.machine.type_machine?.includes('49')) return '/img/kelola-vending/sv49.png'
  return '/img/kelola-vending/sv22.png'
}
</script>

<template>
  <AppModal
    :open="open && !!machine"
    :title="`Detail Mesin: ${machine?.code ?? ''}`"
    width="w-[920px]"
    @close="$emit('close')"
  >
    <div v-if="machine" class="grid grid-cols-1 gap-6 md:grid-cols-12">
      <!-- Left side: Machine graphic & status -->
      <div
        class="flex flex-col items-center justify-center rounded-2xl bg-canvas p-6 border border-line-soft md:col-span-5"
      >
        <div class="relative flex h-64 w-full items-center justify-center">
          <img
            :src="getMachineImage()"
            :alt="machine.name"
            class="max-h-full max-w-full object-contain drop-shadow-md"
          />
        </div>

        <div class="mt-4 flex flex-col items-center gap-1.5 text-center">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            :class="
              machine.isOnline
                ? 'bg-success-soft text-success-strong'
                : 'bg-surface-muted text-ink-subtle border border-line'
            "
          >
            <span
              class="size-2 rounded-full"
              :class="machine.isOnline ? 'bg-success animate-pulse' : 'bg-ink-subtle'"
            />
            {{ machine.isOnline ? 'Mesin Online' : 'Mesin Offline' }}
          </span>

          <span class="text-xs font-medium text-ink-subtle">
            Tipe: {{ machine.type_machine || 'TCN-DCC-22N' }}
          </span>
        </div>
      </div>

      <!-- Right side: Details & editable name -->
      <div class="flex flex-col justify-between md:col-span-7">
        <div class="space-y-4">
          <!-- Machine Name editing card -->
          <div class="rounded-xl border border-line bg-surface-muted/50 p-4">
            <div class="mb-1 flex items-center justify-between">
              <span class="text-xs font-semibold uppercase text-ink-subtle">Nama Mesin</span>
              <button
                v-if="!isEditingName"
                type="button"
                class="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                @click="startEdit"
              >
                <AppIcon name="tabler-edit" class="size-3.5" />
                <span>Ubah</span>
              </button>
            </div>

            <div v-if="isEditingName" class="mt-2 flex items-center gap-2">
              <input
                ref="nameInputRef"
                v-model="editedName"
                type="text"
                class="w-full rounded-lg border border-primary bg-surface px-3 py-1.5 text-sm font-semibold text-ink outline-none ring-2 ring-primary/20"
                @keydown.enter="saveEdit"
                @keydown.esc="cancelEdit"
              />
              <button
                type="button"
                class="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
                @click="saveEdit"
              >
                Simpan
              </button>
              <button
                type="button"
                class="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-muted transition"
                @click="cancelEdit"
              >
                Batal
              </button>
            </div>

            <div v-else class="text-base font-bold text-ink-heading">
              {{ machine.name }}
            </div>
          </div>

          <!-- Attributes Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl border border-line-soft bg-surface p-3.5 shadow-hairline">
              <span class="text-[11px] font-semibold uppercase text-ink-subtle">Suhu Internal</span>
              <div class="mt-1 flex items-center gap-2">
                <AppIcon name="thermometer" class="size-5 text-warning-strong" />
                <span class="text-base font-bold text-ink-heading">
                  {{ machine.temperature || '19°C' }}
                </span>
              </div>
            </div>

            <div class="rounded-xl border border-line-soft bg-surface p-3.5 shadow-hairline">
              <span class="text-[11px] font-semibold uppercase text-ink-subtle">Status Sensor Drop</span>
              <div class="mt-1 flex items-center gap-1.5">
                <span
                  class="size-2 rounded-full"
                  :class="machine.isDropSensor ? 'bg-success' : 'bg-ink-subtle'"
                />
                <span class="text-sm font-bold text-ink">
                  {{ machine.isDropSensor ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </div>
            </div>

            <div class="rounded-xl border border-line-soft bg-surface p-3.5 shadow-hairline">
              <span class="text-[11px] font-semibold uppercase text-ink-subtle">Terakhir Online</span>
              <div class="mt-1 text-xs font-medium text-ink truncate" :title="machine.last_online ?? '-'">
                {{ machine.last_online ?? '-' }}
              </div>
            </div>

            <div class="rounded-xl border border-line-soft bg-surface p-3.5 shadow-hairline">
              <span class="text-[11px] font-semibold uppercase text-ink-subtle">Kunjungan Terakhir</span>
              <div class="mt-1 text-xs font-medium text-ink truncate" :title="machine.last_visit ?? '-'">
                {{ machine.last_visit ?? '-' }}
              </div>
            </div>

            <div class="rounded-xl border border-line-soft bg-surface p-3.5 shadow-hairline col-span-2">
              <span class="text-[11px] font-semibold uppercase text-ink-subtle">Alamat / Lokasi</span>
              <div class="mt-1 text-xs font-medium text-ink">
                {{ machine.alamat || machine.description?.city || 'Kantor Smartven' }}
              </div>
            </div>

            <div class="rounded-xl border border-line-soft bg-surface p-3.5 shadow-hairline col-span-2">
              <span class="text-[11px] font-semibold uppercase text-ink-subtle">Masa Berlaku Langganan</span>
              <div class="mt-1 text-xs font-medium text-ink">
                {{ machine.subscription_end_date ? machine.subscription_end_date.split('T')[0] : 'Tidak ada batas' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-6 flex items-center justify-end gap-3 border-t border-line-soft pt-4">
          <AppButton variant="secondary" @click="$emit('close')">
            Tutup
          </AppButton>
          <AppButton
            variant="primary"
            @click="$emit('livePreview', machine)"
          >
            Live Preview
          </AppButton>
        </div>
      </div>
    </div>
  </AppModal>
</template>
