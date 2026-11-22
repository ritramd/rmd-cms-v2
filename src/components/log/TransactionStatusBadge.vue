<script setup lang="ts">
// Status pill of an unsettled transaction (v1 shows the raw transaction_status). Pill style from StatusBadge.
import { computed } from 'vue'

const props = defineProps<{
  status: string | null
}>()

type Tone = 'warning' | 'danger' | 'neutral'
const STATUSES: Record<string, { label: string; tone: Tone }> = {
  initiated: { label: 'Dimulai', tone: 'warning' },
  pending: { label: 'Menunggu', tone: 'warning' },
  expire: { label: 'Kedaluwarsa', tone: 'danger' },
  failure: { label: 'Gagal', tone: 'danger' },
  failed: { label: 'Gagal', tone: 'danger' },
  deny: { label: 'Ditolak', tone: 'danger' },
  cancel: { label: 'Dibatalkan', tone: 'danger' },
  refund: { label: 'Refund', tone: 'neutral' },
}
const TONES: Record<Tone, string> = {
  warning: 'bg-warning-soft text-warning-strong',
  danger: 'bg-danger-soft text-danger-strong',
  neutral: 'bg-surface-muted text-ink',
}

const info = computed(() => STATUSES[props.status ?? ''] ?? { label: props.status || '-', tone: 'neutral' as Tone })
</script>

<template>
  <span class="inline-flex rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap" :class="TONES[info.tone]">
    {{ info.label }}
  </span>
</template>
