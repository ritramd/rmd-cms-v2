<script setup lang="ts">
// "Rincian Tagihan", the PPh option for companies, and "Bayar Sekarang" of v1 pages/subscription-end.vue.
import AppButton from '@/components/ui/AppButton.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import { formatRupiah } from '@/utils/format'
import type { SelfBillingInvoice } from '@/utils/selfBilling'

defineProps<{
  invoice: SelfBillingInvoice
  months: number
  machineCount: number
  /** Company accounts (category "perusahaan") may pay with a PPh deduction. */
  canUsePph: boolean
  canPay: boolean
  /** Shown on the button while a payment is being set up or confirmed. */
  busyLabel?: string | null
}>()

defineEmits<{ pay: [] }>()

const includePPH = defineModel<boolean>('includePph', { required: true })
</script>

<template>
  <section class="flex flex-col gap-4 rounded-2xl bg-surface p-6 shadow-card">
    <h2 class="text-lg font-bold text-ink-strong">Rincian Tagihan</h2>

    <dl class="flex flex-col gap-2 text-sm">
      <div v-if="invoice.outstandingBase > 0" class="flex justify-between gap-4 text-danger-strong">
        <dt>Tertunggak</dt>
        <dd class="font-semibold whitespace-nowrap">{{ formatRupiah(invoice.outstandingBase) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">Langganan baru ({{ months }} bln × {{ machineCount }} mesin)</dt>
        <dd class="whitespace-nowrap text-ink-strong">{{ formatRupiah(invoice.newSubscriptionBase) }}</dd>
      </div>
      <div class="flex justify-between gap-4 border-t border-line-soft pt-2">
        <dt class="text-ink-muted">Biaya dasar</dt>
        <dd class="whitespace-nowrap text-ink-strong">{{ formatRupiah(invoice.totalBase) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">PPN 11%</dt>
        <dd class="whitespace-nowrap text-success-strong">+ {{ formatRupiah(invoice.ppn) }}</dd>
      </div>
      <div v-if="invoice.pph > 0" class="flex justify-between gap-4">
        <dt class="text-ink-muted">Potongan PPh 2%</dt>
        <dd class="whitespace-nowrap text-danger-strong">− {{ formatRupiah(invoice.pph) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-ink-muted">Biaya transaksi (MDR)</dt>
        <dd class="whitespace-nowrap text-ink-strong">+ {{ formatRupiah(invoice.mdr) }}</dd>
      </div>
      <div class="mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <dt class="font-bold text-ink-strong">Total bayar</dt>
        <dd class="text-xl font-bold whitespace-nowrap text-primary">{{ formatRupiah(invoice.total) }}</dd>
      </div>
    </dl>

    <template v-if="canUsePph">
      <label class="flex items-center gap-2 text-sm text-ink">
        <AppCheckbox v-model="includePPH" label="Bayar dengan potongan PPh" />
        Bayar dengan potongan PPh
      </label>
      <p v-if="includePPH" class="rounded-lg border border-danger/20 bg-danger-soft p-3 text-xs text-danger-strong">
        Dengan potongan PPh, bukti potong wajib dikirim ke Smartven melalui email
        <span class="font-bold">accountingtax@ritramd.id</span> paling lambat <span class="font-bold">20 hari</span>
        setelah transaksi berhasil.
      </p>
    </template>

    <AppButton variant="primary" class="justify-center" :disabled="!canPay || !!busyLabel" @click="$emit('pay')">
      {{ busyLabel ?? 'Bayar Sekarang' }}
    </AppButton>
    <p class="text-center text-xs text-ink-muted">Pembayaran diproses dengan aman melalui Midtrans.</p>
  </section>
</template>
