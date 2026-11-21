<script setup lang="ts">
// Figma: 11.2-D-Konfirmasi Pembayaran (1097:27910)
// Confirmation dialog for promotion voucher payment.
import { computed } from 'vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { VoucherData } from '@/types/billing'
import { formatRupiah } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    open: boolean
    voucher: VoucherData | null
    busy?: boolean
  }>(),
  {
    busy: false,
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const durationMonths = computed(() => props.voucher?.duration ?? 1)

const machineCount = computed(() => {
  if (!props.voucher?.vmId) return 0
  return String(props.voucher.vmId)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean).length
})

const totalInvestasi = computed(() => {
  const raw = props.voucher?.billingAmount
  const num = typeof raw === 'number' ? raw : parseFloat(String(raw || '0'))
  return Number.isNaN(num) ? 0 : num
})

const mdrAmount = computed(() => (totalInvestasi.value > 0 ? 4400 : 0))

const subtotalWithoutMdr = computed(() => Math.max(0, totalInvestasi.value - mdrAmount.value))

const baseAmount = computed(() => Math.round(subtotalWithoutMdr.value / 1.11))

const ppnAmount = computed(() => subtotalWithoutMdr.value - baseAmount.value)
</script>

<template>
  <AppModal
    :open="open"
    title="Konfirmasi Pembayaran Promosi?"
    width="w-[900px]"
    :busy="busy"
    @close="emit('close')"
  >
    <!-- Bordered summary box matching Figma (#5b47e0 / indigo accent) -->
    <div class="flex flex-col gap-2 rounded-[10px] border border-[#5b47e0] bg-surface p-[17px]">
      <!-- Perpanjang Layanan -->
      <div class="flex items-center justify-between text-ink-heading">
        <span class="font-inter text-base">Perpanjang Layanan</span>
        <span class="text-lg font-bold">{{ durationMonths }} Bulan</span>
      </div>

      <!-- Mesin Terlindung -->
      <div class="flex items-center justify-between text-ink-heading">
        <span class="font-inter text-base">Mesin Terlindung</span>
        <span class="text-lg font-bold">{{ machineCount }} unit</span>
      </div>

      <!-- Horizontal Divider -->
      <hr class="my-1 border-t border-line-soft" />

      <!-- PPN 11% -->
      <div class="flex items-center justify-between text-sm text-[#12a150]">
        <span>+ PPN 11%</span>
        <span>{{ formatRupiah(ppnAmount) }}</span>
      </div>

      <!-- MDR -->
      <div class="flex items-center justify-between text-sm text-[#12a150]">
        <span>+ MDR</span>
        <span>{{ formatRupiah(mdrAmount) }}</span>
      </div>

      <!-- Total Investasi -->
      <div class="flex items-center justify-between pt-1 text-ink-heading">
        <span class="font-inter text-base">Total Investasi</span>
        <span class="text-lg font-bold">{{ formatRupiah(totalInvestasi) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-2 flex items-center justify-end gap-3">
      <button
        type="button"
        :disabled="busy"
        class="inline-flex items-center justify-center rounded-xl border border-line bg-surface px-[17px] py-[11px] text-sm font-medium text-ink shadow-hairline transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        @click="emit('close')"
      >
        Batal
      </button>

      <button
        type="button"
        :disabled="busy"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-[11px] text-sm font-bold text-white shadow-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        @click="emit('confirm')"
      >
        <svg
          v-if="busy"
          class="size-4 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>{{ busy ? 'Memproses…' : 'Bayar Sekarang' }}</span>
      </button>
    </div>
  </AppModal>
</template>
