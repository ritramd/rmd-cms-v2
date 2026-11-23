<script setup lang="ts">
// Success dialog for completed billing payment (mirroring v1).
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { formatRupiah, formatSubscriptionDate } from '@/utils/format'

withDefaults(
  defineProps<{
    open: boolean
    amount?: number
    /** New subscription end date, when known (self billing). */
    activeUntil?: string | null
  }>(),
  {
    amount: 0,
    activeUntil: null,
  },
)

const emit = defineEmits<{
  confirm: []
}>()
</script>

<template>
  <AppModal :open="open" title="✓ Perlindungan Aktif" width="w-[520px]" @close="emit('confirm')">
    <div class="flex flex-col items-center gap-4 py-2 text-center">
      <p class="text-sm text-ink leading-relaxed">
        Pembayaran Anda telah berhasil diproses. Semua mesin Anda kini terlindungi dengan layanan kami.
      </p>

      <div
        v-if="amount > 0"
        class="inline-flex items-center justify-center rounded-xl border border-success/30 bg-success-soft px-4 py-2 text-base font-bold text-success-strong"
      >
        {{ formatRupiah(amount) }}
      </div>
      <p v-if="activeUntil" class="text-sm font-medium text-ink-strong">{{ formatSubscriptionDate(activeUntil) }}</p>

      <div class="mt-4 flex w-full justify-center">
        <AppButton variant="primary" data-autofocus @click="emit('confirm')">
          Ke Dashboard
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
