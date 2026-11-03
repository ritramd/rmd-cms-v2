<script setup lang="ts">
// Figma: Status Vending card (1097:42322)
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusCountCard from '@/components/ui/StatusCountCard.vue'

defineProps<{
  total: number | null
  online: number | null
  offline: number | null
  loading?: boolean
  error?: string | null
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <section
    class="flex flex-col justify-between gap-4 rounded-[32px] border border-white bg-surface p-6 shadow-card"
    :aria-busy="loading"
  >
    <div class="flex items-start justify-between">
      <div class="flex flex-col gap-1">
        <h2 class="text-sm font-medium text-ink-muted">Status Vending</h2>
        <div v-if="loading" class="h-8 w-28 animate-pulse rounded-lg bg-surface-muted" />
        <p v-else-if="!error" class="text-2xl font-bold text-ink-strong">{{ total }} Mesin</p>
      </div>
      <span class="rounded-xl bg-success-soft px-2 pt-2 pb-3.5"><AppIcon name="dns" /></span>
    </div>

    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 2" :key="i" class="h-12 animate-pulse rounded-xl bg-surface-muted" />
    </div>
    <div v-else-if="error" class="flex flex-col items-start gap-2">
      <p class="text-sm text-ink-muted">{{ error }}</p>
      <button type="button" class="text-sm font-bold text-primary hover:underline" @click="$emit('retry')">
        Coba lagi
      </button>
    </div>
    <div v-else class="flex flex-col gap-3">
      <StatusCountCard status="online" label="Online" :count="online ?? 0" />
      <StatusCountCard status="offline" label="Offline" :count="offline ?? 0" />
    </div>
  </section>
</template>
