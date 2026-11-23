<script setup lang="ts">
// "Paket Baru" and "Bulan Baru" of v1 pages/subscription-end.vue: package for the new months and
// how many months to add (1–12, the range the server accepts).
import { useId } from 'vue'
import { fieldLabelClass } from '@/components/products/formStyles'
import type { SubscriptionPackage } from '@/types/billing'
import { formatRupiah } from '@/utils/format'
import { PACKAGE_PRICES } from '@/utils/selfBilling'

const pkg = defineModel<SubscriptionPackage>('pkg', { required: true })
const months = defineModel<number>('months', { required: true })

const groupId = useId()
const PACKAGES: { value: SubscriptionPackage; label: string }[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'priority', label: 'Priority' },
]
const MIN_MONTHS = 1
const MAX_MONTHS = 12

const stepperClass =
  'flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-lg font-bold text-ink-strong transition-colors enabled:hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40'
</script>

<template>
  <div class="flex flex-col gap-5">
    <fieldset class="flex flex-col gap-2">
      <legend :id="groupId" :class="fieldLabelClass" class="mb-2">Paket Baru</legend>
      <div class="grid gap-2 sm:grid-cols-3">
        <label
          v-for="p in PACKAGES"
          :key="p.value"
          class="flex cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 transition-colors"
          :class="pkg === p.value ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong'"
        >
          <span class="flex items-center gap-2">
            <input v-model="pkg" type="radio" :name="groupId" :value="p.value" class="accent-primary" />
            <span class="text-sm font-bold" :class="pkg === p.value ? 'text-primary' : 'text-ink-strong'">{{ p.label }}</span>
          </span>
          <span class="text-xs text-ink-muted">{{ formatRupiah(PACKAGE_PRICES[p.value]) }} / mesin / bulan</span>
        </label>
      </div>
    </fieldset>

    <div class="flex flex-col gap-2">
      <span :class="fieldLabelClass">Durasi Baru</span>
      <div class="flex items-center gap-3">
        <button
          type="button"
          :class="stepperClass"
          :disabled="months <= MIN_MONTHS"
          aria-label="Kurangi satu bulan"
          @click="months = Math.max(MIN_MONTHS, months - 1)"
        >
          −
        </button>
        <span class="w-20 text-center text-sm font-bold text-ink-strong" aria-live="polite">{{ months }} bulan</span>
        <button
          type="button"
          :class="stepperClass"
          :disabled="months >= MAX_MONTHS"
          aria-label="Tambah satu bulan"
          @click="months = Math.min(MAX_MONTHS, months + 1)"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>
