<script setup lang="ts">
// "Redeem Voucher" tab of the billing page (v1 pages/subscription-end.vue). Figma 11.1-D-Billing
// (1097:27746) had a centred "Langganan Anda Telah Habis" card; the subscription status now lives in
// SubscriptionStatusBanner, so this follows the Self Billing tab: form card plus a how-to card.
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    error?: string | null
  }>(),
  {
    loading: false,
    error: null,
  },
)

const emit = defineEmits<{
  submit: [voucher: string]
}>()

const voucherCode = ref('')

function handleSubmit() {
  const code = voucherCode.value.trim()
  if (!code || props.loading) return
  emit('submit', code)
}

// billingPaymentController.validateVoucher rejects codes created more than a month ago.
const STEPS = [
  { title: 'Dapatkan kode voucher', body: 'Hubungi tim Smartven untuk mendapatkan kode. Kode berlaku 1 bulan sejak diterbitkan.' },
  { title: 'Masukkan dan cek kode', body: 'Ketik kode voucher, lalu klik Cek Voucher untuk melihat paket, durasi, dan nominalnya.' },
  { title: 'Bayar lewat Midtrans', body: 'Periksa rinciannya, lalu selesaikan pembayaran di jendela Midtrans.' },
  { title: 'Masa aktif diperbarui', body: 'Setelah pembayaran berhasil, masa aktif subscription langsung bertambah.' },
]
</script>

<template>
  <div class="grid w-full items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <section class="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-card">
      <header class="flex flex-col gap-1">
        <h2 class="text-lg font-bold text-ink-strong">Redeem Voucher</h2>
        <p class="text-sm text-ink-muted">
          Punya kode voucher dari tim Smartven? Gunakan untuk memperpanjang subscription dengan paket dan harga yang sudah
          disepakati.
        </p>
      </header>

      <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="redeem-code" class="text-xs font-bold tracking-[1.2px] text-ink-subtle uppercase">Kode Voucher</label>
          <div class="flex flex-col gap-3 sm:flex-row">
            <input
              id="redeem-code"
              v-model="voucherCode"
              type="text"
              maxlength="50"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              placeholder="Masukkan kode voucher"
              :aria-invalid="!!error"
              :aria-describedby="error ? 'redeem-error' : undefined"
              :disabled="loading"
              class="min-w-0 flex-1 rounded-lg border bg-surface px-3.5 py-2.5 font-mono text-sm tracking-wider text-ink-strong outline-none transition placeholder:font-inter placeholder:tracking-normal placeholder:text-ink-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              :class="error ? 'border-danger' : 'border-line'"
            />
            <AppButton variant="primary" type="submit" :disabled="!voucherCode.trim() || loading">
              {{ loading ? 'Memeriksa…' : 'Cek Voucher' }}
            </AppButton>
          </div>
          <p v-if="error" id="redeem-error" role="alert" class="text-xs font-medium text-danger-strong">{{ error }}</p>
        </div>
      </form>
    </section>

    <section class="flex flex-col gap-5 rounded-2xl bg-surface p-6 shadow-card xl:sticky xl:top-6">
      <h2 class="text-lg font-bold text-ink-strong">Cara Pakai Voucher</h2>
      <ol class="flex flex-col gap-4">
        <li v-for="(step, i) in STEPS" :key="step.title" class="flex gap-3">
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-tint text-sm font-bold text-primary"
            aria-hidden="true"
          >
            {{ i + 1 }}
          </span>
          <div class="flex flex-col gap-0.5">
            <p class="text-sm font-bold text-ink-strong">{{ step.title }}</p>
            <p class="text-sm text-ink-muted">{{ step.body }}</p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>
