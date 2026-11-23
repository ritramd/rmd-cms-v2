<script setup lang="ts">
// Figma: 5.1-D-Daftar Vending (1097:20872), 5.8-D-Daftar Vending inline edit (1097:16027), 1097:16086
import { nextTick, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { KelolaVendingMachine } from '@/types/kelolaVending'

const props = defineProps<{
  machine: KelolaVendingMachine
}>()

const emit = defineEmits<{
  select: [machine: KelolaVendingMachine]
  rename: [code: string, newName: string]
}>()

const isEditing = ref(false)
const editedName = ref(props.machine.name)
const inputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.machine.name,
  (val) => {
    editedName.value = val
  },
)

function startEdit() {
  isEditing.value = true
  editedName.value = props.machine.name
  void nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

function cancelEdit() {
  isEditing.value = false
  editedName.value = props.machine.name
}

function saveEdit() {
  const trimmed = editedName.value.trim()
  if (trimmed && trimmed !== props.machine.name) {
    emit('rename', props.machine.code, trimmed)
  }
  isEditing.value = false
}

function onCardClick() {
  if (!isEditing.value) {
    emit('select', props.machine)
  }
}

// Machine image fallback selection based on model type
function getMachineImage(): string {
  if (props.machine.snapshot) return props.machine.snapshot
  if (props.machine.type_machine?.includes('49')) return '/img/kelola-vending/sv49.png'
  return '/img/kelola-vending/sv22.png'
}
</script>

<template>
  <div
    class="group relative flex flex-col justify-between rounded-[12px] bg-white p-[17px] transition-all duration-200 cursor-pointer"
    :class="
      isEditing
        ? 'shadow-[0px_0px_0px_2px_rgba(100,149,237,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]'
        : 'shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-lg'
    "
    @click="onCardClick"
  >
    <!-- Top: Machine Preview Graphic Box -->
    <div class="relative flex h-[192px] w-full items-center justify-center overflow-hidden rounded-[8px] bg-[#f7f9fc] p-6 shrink-0">
      <img
        :src="getMachineImage()"
        :alt="machine.name"
        class="aspect-square h-full max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </div>

    <!-- INLINE EDITING STATE (Figma node 1097:16087 / 1097:16027) -->
    <div v-if="isEditing" class="mt-4 flex flex-col gap-1 w-full" @click.stop>
      <div class="flex flex-col gap-1 w-full">
        <h3 class="text-[18px] font-bold text-[#1f2937] leading-[28px]">
          {{ machine.code }}
        </h3>
        <div class="w-full bg-[#eff6ff]/30 border-2 border-[#bfdbfe] rounded-[6px] px-[10px] py-[9px] transition focus-within:border-primary">
          <input
            ref="inputRef"
            v-model="editedName"
            type="text"
            placeholder="Edit Nama Vending Machine..."
            class="w-full bg-transparent text-[14px] font-normal text-[#1f2937] outline-none placeholder:text-[#9ca3af]"
            @keydown.enter="saveEdit"
            @keydown.esc="cancelEdit"
          />
        </div>
      </div>

      <!-- Action buttons: Save (green check) & Cancel (slate X) -->
      <div class="mt-4 flex items-center justify-center gap-3 w-full">
        <button
          type="button"
          class="size-10 rounded-full bg-[#22c55e] text-white shadow-[0px_10px_15px_-3px_rgba(34,197,94,0.3)] hover:bg-green-600 active:scale-95 transition flex items-center justify-center shrink-0 cursor-pointer"
          title="Simpan"
          @click.stop="saveEdit"
        >
          <AppIcon name="check" class="size-5" />
        </button>
        <button
          type="button"
          class="size-10 rounded-full bg-[#e2e8f0] text-slate-600 hover:bg-slate-300 active:scale-95 transition flex items-center justify-center shrink-0 cursor-pointer"
          title="Batal"
          @click.stop="cancelEdit"
        >
          <AppIcon name="close" class="size-4" />
        </button>
      </div>
    </div>

    <!-- NORMAL VIEW STATE (Figma node 1097:16086) -->
    <div v-else class="mt-4 flex flex-col gap-4 w-full">
      <!-- Title & Machine Name -->
      <div class="flex flex-col gap-1 w-full">
        <div class="flex items-center gap-1 w-full">
          <h3 class="text-[18px] font-bold text-[#1f2937] leading-[28px] truncate">
            {{ machine.code }}
          </h3>
          <button
            type="button"
            class="flex size-6 shrink-0 items-center justify-center rounded text-[#64748b] hover:text-primary transition cursor-pointer"
            title="Edit Nama Vending Machine"
            @click.stop="startEdit"
          >
            <AppIcon name="tabler-edit" class="size-5" />
          </button>
        </div>
        <p class="text-[14px] text-[#64748b] leading-[20px] font-normal truncate" :title="machine.name">
          {{ machine.name }}
        </p>
      </div>

      <!-- Divider & Status Meta -->
      <div class="border-t border-[#f3f4f8] pt-[17px] flex flex-col gap-2 w-full">
        <!-- Suhu Row -->
        <div class="flex items-center text-[12px] text-[#475569] leading-[16px]">
          <AppIcon name="thermometer" class="size-4 shrink-0 mr-2 text-[#9ca3af]" />
          <span>Suhu: {{ machine.temperature || '19°C' }}</span>
        </div>

        <!-- Terakhir Online Row -->
        <div class="flex items-start text-[12px] leading-[16px]">
          <AppIcon name="calendar-outline" class="size-4 shrink-0 mr-2 mt-0.5 text-[#9ca3af]" />
          <div class="flex flex-col">
            <span class="text-[12px] text-[#475569] font-normal leading-[16px]">Terakhir Online</span>
            <span class="text-[12px] text-[#1f2937] font-medium leading-[16px]">
              {{ machine.last_online || '2025-09-16 00:56:51' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
