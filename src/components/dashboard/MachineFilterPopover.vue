<script setup lang="ts">
// Filter Popover for Dashboard Machine Table
// Legacy parity: filters by status (online/offline), stock levels (critical <40%, medium 40-70%, safe >70%), and machine type
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { MachineFilterOptions, StockFilterRange, VendingStatus, VendingType } from '@/types/vending'

const props = defineProps<{
  modelValue: MachineFilterOptions
  open: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MachineFilterOptions]
  'update:open': [value: boolean]
  reset: []
}>()

const rootRef = ref<HTMLElement | null>(null)

function setStatus(status: VendingStatus | 'all') {
  emit('update:modelValue', { ...props.modelValue, status })
}

function setStockRange(stockRange: StockFilterRange) {
  emit('update:modelValue', { ...props.modelValue, stockRange })
}

function setType(type: VendingType | 'all') {
  emit('update:modelValue', { ...props.modelValue, type })
}

function resetFilters() {
  emit('reset')
}

function close() {
  emit('update:open', false)
}

function handleClickOutside(event: MouseEvent) {
  if (props.open && rootRef.value && !rootRef.value.contains(event.target as Node)) {
    close()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

const statusOptions: { label: string; value: VendingStatus | 'all'; dot?: string }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Online', value: 'online', dot: 'bg-success shadow-glow-success' },
  { label: 'Offline', value: 'offline', dot: 'bg-danger shadow-glow-danger' },
  { label: 'Maintenance', value: 'maintenance', dot: 'bg-warning shadow-glow-warning' },
]

const stockOptions: { label: string; value: StockFilterRange; tag?: string; tagColor?: string }[] = [
  { label: 'Semua Stok', value: 'all' },
  { label: 'Kritis (< 40%)', value: 'critical', tag: 'Menipis', tagColor: 'bg-danger-soft text-danger' },
  { label: 'Sedang (40% - 70%)', value: 'medium', tag: 'Normal', tagColor: 'bg-warning-soft text-warning' },
  { label: 'Aman (> 70%)', value: 'safe', tag: 'Penuh', tagColor: 'bg-success-soft text-success' },
]

const typeOptions: { label: string; value: VendingType | 'all' }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Snack', value: 'snack' },
  { label: 'Minuman', value: 'drink' },
  { label: 'Kopi', value: 'coffee' },
]
</script>

<template>
  <div ref="rootRef" class="relative inline-block text-left">
    <slot :toggle="() => emit('update:open', !open)" :open="open" />

    <Transition
      enter-from-class="translate-y-1 opacity-0 scale-95"
      enter-active-class="transition duration-150 ease-out"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="translate-y-1 opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full z-40 mt-2 w-84 rounded-2xl border border-line bg-surface p-5 shadow-card focus:outline-none"
        role="dialog"
        aria-label="Filter Mesin"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-line-soft pb-3">
          <h3 class="text-sm font-bold text-ink-strong">Filter Mesin</h3>
          <button
            type="button"
            class="text-xs font-semibold text-primary transition-colors hover:text-primary-hover hover:underline cursor-pointer"
            @click="resetFilters"
          >
            Reset
          </button>
        </div>

        <div class="mt-4 flex flex-col gap-4">
          <!-- Section 1: Status -->
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold tracking-wider text-ink-subtle uppercase">Status Mesin</span>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                v-for="opt in statusOptions"
                :key="opt.value"
                type="button"
                class="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors cursor-pointer"
                :class="
                  modelValue.status === opt.value
                    ? 'bg-primary font-bold text-white shadow-xs'
                    : 'bg-surface-muted font-medium text-ink hover:bg-surface-hover'
                "
                @click="setStatus(opt.value)"
              >
                <span v-if="opt.dot" class="size-1.5 shrink-0 rounded-full" :class="opt.dot" />
                <span>{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Section 2: Kapasitas Stok -->
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold tracking-wider text-ink-subtle uppercase">Kapasitas Stok</span>
            <div class="flex flex-col gap-1.5">
              <button
                v-for="opt in stockOptions"
                :key="opt.value"
                type="button"
                class="flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors cursor-pointer"
                :class="
                  modelValue.stockRange === opt.value
                    ? 'bg-primary font-bold text-white shadow-xs'
                    : 'bg-surface-muted font-medium text-ink hover:bg-surface-hover'
                "
                @click="setStockRange(opt.value)"
              >
                <span>{{ opt.label }}</span>
                <span
                  v-if="opt.tag"
                  class="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                  :class="modelValue.stockRange === opt.value ? 'bg-white/20 text-white' : opt.tagColor"
                >
                  {{ opt.tag }}
                </span>
              </button>
            </div>
          </div>

          <!-- Section 3: Tipe Mesin -->
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold tracking-wider text-ink-subtle uppercase">Tipe Mesin</span>
            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="opt in typeOptions"
                :key="opt.value"
                type="button"
                class="flex items-center justify-center rounded-xl px-2 py-2 text-xs transition-colors cursor-pointer text-center"
                :class="
                  modelValue.type === opt.value
                    ? 'bg-primary font-bold text-white shadow-xs'
                    : 'bg-surface-muted font-medium text-ink hover:bg-surface-hover'
                "
                @click="setType(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-5 border-t border-line-soft pt-4">
          <AppButton variant="primary" class="w-full justify-center" @click="close">
            Terapkan Filter
          </AppButton>
        </div>
      </div>
    </Transition>
  </div>
</template>
