<script setup lang="ts">
// v1's "Laporan Keluaran" choice (Ringkasan / Detail) before a stock download. Not in Figma; AppModal shell.
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { StockMachine, StockReportType } from '@/types/stock'

defineProps<{
  /** Machines to download; null keeps the modal closed. */
  machines: StockMachine[] | null
  /** Report type being downloaded. */
  busy?: StockReportType | null
  error?: string | null
}>()

defineEmits<{
  download: [type: StockReportType]
  close: []
}>()

const options: { type: StockReportType; label: string; hint: string }[] = [
  { type: 'summary', label: 'Ringkasan', hint: 'Total stok, kapasitas dan kebutuhan isi ulang per produk.' },
  { type: 'detail', label: 'Detail', hint: 'Stok, kapasitas dan kebutuhan isi ulang per slot.' },
]
</script>

<template>
  <AppModal :open="machines !== null" title="Laporan Keluaran" width="w-[480px]" :busy="!!busy" @close="$emit('close')">
    <p class="text-sm text-ink">
      Download laporan stok untuk
      <strong v-if="machines?.length === 1">{{ machines[0].vmcode }}</strong>
      <strong v-else>{{ machines?.length }} mesin terpilih</strong>:
    </p>
    <div class="flex flex-col gap-3">
      <button
        v-for="(option, i) in options"
        :key="option.type"
        type="button"
        :data-autofocus="i === 0 ? '' : undefined"
        :disabled="!!busy"
        class="flex flex-col items-start gap-0.5 rounded-xl border border-line px-4 py-3 text-left transition-colors enabled:hover:border-primary enabled:hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
        @click="$emit('download', option.type)"
      >
        <span class="text-sm font-bold text-ink-strong">
          {{ busy === option.type ? 'Mengunduh…' : `Download ${option.label}` }}
        </span>
        <span class="text-xs text-ink-muted">{{ option.hint }}</span>
      </button>
    </div>
    <p v-if="error" role="alert" class="text-sm text-danger-strong">{{ error }}</p>
    <div class="flex justify-end">
      <AppButton :disabled="!!busy" @click="$emit('close')">Batal</AppButton>
    </div>
  </AppModal>
</template>
