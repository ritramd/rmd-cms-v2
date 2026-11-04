<script setup lang="ts">
// Figma: 11.1-D-Billing (1097:27746)
// Centered card prompting user to enter a redeem voucher when subscription has ended.
import { ref } from 'vue'

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
</script>

<template>
  <div class="flex min-h-[580px] w-full items-center justify-center rounded-2xl border border-line-soft bg-surface p-8 lg:min-h-[640px]">
    <div class="flex w-full max-w-[585px] flex-col items-center gap-4 text-center">
      <!-- Title & Subtitle -->
      <div class="flex flex-col items-center gap-2">
        <h1 class="text-2xl font-bold text-ink-strong">Langganan Anda Telah Habis</h1>
        <p class="max-w-[480px] text-[13px] leading-[19.5px] text-[#8899a6]">
          Mohon hubungi tim Smartven untuk mendapatkan kode voucher untuk melakukan pembayaran.
        </p>
      </div>

      <!-- Voucher Redeem Form -->
      <form class="flex w-[360px] max-w-full flex-col items-start gap-1 text-left" @submit.prevent="handleSubmit">
        <label for="redeem-code" class="text-sm font-bold tracking-wide text-ink-subtle">
          KODE REDEEM*
        </label>

        <div class="w-full">
          <input
            id="redeem-code"
            v-model="voucherCode"
            type="text"
            maxlength="50"
            autocomplete="off"
            placeholder="Masukkan Kode Redeem yang valid"
            :disabled="loading"
            class="w-full rounded-lg border border-line bg-surface-muted px-3.5 py-2.5 text-sm text-ink-strong placeholder:text-ink-subtle outline-none transition-colors focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <!-- Inline error alert if validation fails -->
        <p v-if="error" role="alert" class="mt-1 w-full rounded-lg border border-danger/20 bg-danger-soft p-2.5 text-xs text-danger-strong">
          {{ error }}
        </p>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="!voucherCode.trim() || loading"
          class="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#5f93ec] px-6 py-[11px] text-sm font-medium text-white shadow-hairline transition-colors hover:bg-[#4b82db] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            v-if="loading"
            class="size-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>{{ loading ? 'Memproses…' : 'Redeem' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
