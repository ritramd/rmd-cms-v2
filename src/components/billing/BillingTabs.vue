<script setup lang="ts">
// "Self Billing" / "Redeem Voucher" switch of v1 pages/subscription-end.vue, in the v2 tab style
// (NotificationMenu tabs).
import type { BillingTab } from '@/types/billing'

const tab = defineModel<BillingTab>({ required: true })

const tabs: { id: BillingTab; label: string }[] = [
  { id: 'self', label: 'Self Billing' },
  { id: 'voucher', label: 'Redeem Voucher' },
]
</script>

<template>
  <div role="tablist" aria-label="Metode pembayaran" class="flex w-full max-w-md gap-2 rounded-xl bg-surface p-2 shadow-card">
    <button
      v-for="t in tabs"
      :key="t.id"
      type="button"
      role="tab"
      :aria-selected="tab === t.id"
      class="flex-1 rounded-xl px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :class="
        tab === t.id
          ? 'bg-primary py-[11px] font-bold text-white shadow-primary'
          : 'py-2.5 font-medium text-ink hover:bg-surface-muted'
      "
      @click="tab = t.id"
    >
      {{ t.label }}
    </button>
  </div>
</template>
