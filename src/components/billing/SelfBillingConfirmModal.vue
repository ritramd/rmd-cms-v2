<script setup lang="ts">
// "Konfirmasi Pembayaran" of v1 pages/subscription-end.vue (a SweetAlert table there), on AppModal.
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { OutstandingMachine } from '@/types/billing'
import { formatRupiah } from '@/utils/format'
import type { SelfBillingInvoice } from '@/utils/selfBilling'

defineProps<{
  open: boolean
  invoice: SelfBillingInvoice
  machineCount: number
  packageLabel: string
  months: number
  outstanding: OutstandingMachine[]
  busy?: boolean
}>()

defineEmits<{
  close: []
  confirm: []
}>()

const rowClass = 'flex justify-between gap-4 border-b border-line-soft py-2'
</script>

<template>
  <AppModal :open="open" title="Konfirmasi Pembayaran" width="w-[560px]" :busy="busy" @close="$emit('close')">
    <dl class="flex flex-col text-sm">
      <div :class="rowClass"><dt class="text-ink-muted">Mesin dipilih</dt><dd class="font-semibold">{{ machineCount }} unit</dd></div>
      <div :class="rowClass"><dt class="text-ink-muted">Paket baru</dt><dd class="font-semibold">{{ packageLabel }}</dd></div>
      <div :class="rowClass"><dt class="text-ink-muted">Durasi baru</dt><dd class="font-semibold">{{ months }} bulan</dd></div>

      <template v-if="outstanding.length">
        <div class="mt-2 rounded-lg bg-danger-soft px-3 py-2">
          <dt class="mb-1 text-xs font-bold text-danger-strong">Tagihan tertunggak</dt>
          <dd class="flex flex-col gap-1">
            <span v-for="m in outstanding" :key="m.machine_id" class="flex justify-between gap-4 text-xs">
              <span class="text-ink-muted">{{ m.code }} · {{ m.periods.join(', ') }}</span>
              <span class="font-semibold whitespace-nowrap text-danger-strong">{{ formatRupiah(m.amount) }}</span>
            </span>
          </dd>
        </div>
      </template>

      <div :class="rowClass"><dt class="text-ink-muted">Langganan baru</dt><dd>{{ formatRupiah(invoice.newSubscriptionBase) }}</dd></div>
      <div :class="rowClass"><dt class="text-ink-muted">Biaya dasar total</dt><dd>{{ formatRupiah(invoice.totalBase) }}</dd></div>
      <div :class="rowClass"><dt class="text-ink-muted">PPN 11%</dt><dd class="text-success-strong">+ {{ formatRupiah(invoice.ppn) }}</dd></div>
      <div v-if="invoice.pph > 0" :class="rowClass">
        <dt class="text-ink-muted">Potongan PPh 2%</dt><dd class="text-danger-strong">− {{ formatRupiah(invoice.pph) }}</dd>
      </div>
      <div :class="rowClass"><dt class="text-ink-muted">Biaya transaksi (MDR)</dt><dd>+ {{ formatRupiah(invoice.mdr) }}</dd></div>
      <div class="mt-2 flex items-baseline justify-between gap-4 rounded-lg bg-success-soft px-3 py-3">
        <dt class="font-bold text-ink-strong">Total yang dibayar</dt>
        <dd class="text-lg font-bold text-success-strong">{{ formatRupiah(invoice.total) }}</dd>
      </div>
    </dl>
    <p class="text-xs text-ink-muted">
      Total = (biaya dasar × {{ invoice.pph > 0 ? '1,09' : '1,11' }}) + MDR. Pembayaran diproses melalui Midtrans; langganan
      aktif setelah transaksi berhasil.
    </p>
    <div class="flex justify-end gap-3">
      <AppButton :disabled="busy" @click="$emit('close')">Batal</AppButton>
      <AppButton variant="primary" :disabled="busy" data-autofocus @click="$emit('confirm')">
        {{ busy ? 'Memproses…' : 'Lanjutkan Pembayaran' }}
      </AppButton>
    </div>
  </AppModal>
</template>
