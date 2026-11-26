<script setup lang="ts">
// Not in Figma: opened from the "Target" figure on the Total Pendapatan card (1097:42296). Same form
// pieces as Ganti Password (1097:41893). The page saves; this only collects a whole-rupiah amount.
// A target under Rp 10 jt asks a second time before it is sent, since that is usually a typo.
import { computed, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { formatCurrencyInput, formatRupiah, parseCurrencyInput } from '@/utils/format'
import { LOW_TARGET_THRESHOLD, TARGET_PER_MACHINE } from '@/utils/revenueTarget'

const props = defineProps<{
  open: boolean
  /** The month's saved target; undefined when none is set yet. */
  current?: number
  /** Suggested target (Rp 10 jt × machines), used when the field is left empty. */
  defaultTarget: number
  machineCount: number
  /** e.g. "November 2026" */
  periodLabel: string
  busy?: boolean
  /** Why the last save failed, from the page. */
  error?: string | null
}>()

const emit = defineEmits<{
  close: []
  submit: [amount: number]
}>()

/** Keeps BIGINT-safe amounts while being far beyond any real target. */
const MAX_TARGET = 999_999_999_999_999

const display = ref('')
const localError = ref<string | null>(null)
/** Amount waiting for the second confirmation; null while editing. */
const confirmAmount = ref<number | null>(null)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    display.value = formatCurrencyInput(props.current)
    localError.value = null
    confirmAmount.value = null
  },
)
// A save that fails goes back to the form, where the page's error shows.
watch(
  () => props.error,
  (error) => {
    if (error) confirmAmount.value = null
  },
)

const message = computed(() => localError.value ?? props.error ?? null)
const defaultHint = computed(
  () =>
    `Kosongkan untuk memakai target default ${formatRupiah(props.defaultTarget)} ` +
    `(${formatRupiah(TARGET_PER_MACHINE)} × ${Math.max(1, props.machineCount)} mesin).`,
)

function onInput(event: Event) {
  confirmAmount.value = null
  const input = event.target as HTMLInputElement
  display.value = formatCurrencyInput(parseCurrencyInput(input.value))
  // Keep the caret at the end after regrouping the thousands.
  input.value = display.value
}

function onSubmit() {
  localError.value = null
  const amount = display.value.trim() ? parseCurrencyInput(display.value) : props.defaultTarget
  if (amount <= 0) {
    localError.value = 'Target harus lebih dari Rp 0.'
    return
  }
  if (amount > MAX_TARGET) {
    localError.value = 'Nominal target terlalu besar.'
    return
  }
  if (amount < LOW_TARGET_THRESHOLD && confirmAmount.value !== amount) {
    confirmAmount.value = amount
    return
  }
  emit('submit', amount)
}
</script>

<template>
  <AppModal :open="open" title="Atur Target Pendapatan" width="w-[480px]" :busy="busy" @close="emit('close')">
    <form class="flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
      <p class="text-sm text-ink-muted">
        Target untuk bulan <span class="font-semibold text-ink-strong">{{ periodLabel }}</span>. Progress di kartu Total
        Pendapatan dihitung dari target ini.
      </p>

      <div v-if="message" role="alert" class="rounded-lg bg-danger-soft p-3 text-xs font-medium text-danger-strong">
        {{ message }}
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="revenue-target" class="text-xs font-bold uppercase tracking-[1.2px] text-ink-subtle">
          Target Bulanan
        </label>
        <div
          class="flex items-center rounded-lg border border-line bg-surface transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
        >
          <span class="pl-3.5 text-sm font-medium text-ink-subtle" aria-hidden="true">Rp</span>
          <input
            id="revenue-target"
            :value="display"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            :placeholder="formatCurrencyInput(defaultTarget)"
            aria-describedby="revenue-target-hint"
            class="w-full bg-transparent px-2 py-2.5 text-sm font-medium text-ink-strong outline-none placeholder:text-ink-subtle"
            :disabled="busy"
            @input="onInput"
          />
        </div>
        <p id="revenue-target-hint" class="text-xs text-ink-subtle">{{ defaultHint }}</p>
      </div>

      <div
        v-if="confirmAmount !== null"
        role="alert"
        class="flex flex-col gap-1 rounded-lg bg-warning-soft p-3 text-xs text-warning-strong"
      >
        <p class="font-bold">Target {{ formatRupiah(confirmAmount) }} di bawah {{ formatRupiah(LOW_TARGET_THRESHOLD) }}.</p>
        <p>Pastikan nominalnya sudah benar. Tekan "Ya, Simpan" sekali lagi untuk menyimpan, atau ubah nominalnya.</p>
      </div>

      <div class="flex items-center justify-end gap-3 pt-1">
        <AppButton v-if="confirmAmount !== null" :disabled="busy" @click="confirmAmount = null">Ubah Nominal</AppButton>
        <AppButton v-else :disabled="busy" @click="emit('close')">Batal</AppButton>
        <AppButton variant="primary" type="submit" :disabled="busy">
          {{ busy ? 'Menyimpan…' : confirmAmount !== null ? 'Ya, Simpan' : 'Simpan Target' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
