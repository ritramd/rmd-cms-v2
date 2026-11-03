<script setup lang="ts">
// Figma: Perlu Perhatian card (1097:42336)
import type { IconName } from '@/assets/icons'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { AttentionItem } from '@/types/dashboard'

defineProps<{
  items: AttentionItem[]
  loading?: boolean
  error?: string | null
}>()

defineEmits<{
  retry: []
}>()

const kinds: Record<AttentionItem['kind'], { icon: IconName; tile: string; highlight: string }> = {
  'low-stock': { icon: 'restock', tile: 'bg-warning-soft', highlight: 'text-warning' },
  disconnected: { icon: 'power-off', tile: 'bg-danger-soft', highlight: 'text-danger' },
}
</script>

<template>
  <section
    class="flex flex-col gap-6 rounded-[32px] border border-white bg-surface p-6 shadow-card"
    :aria-busy="loading"
  >
    <h2 class="text-sm font-medium text-ink-muted">Perlu Perhatian</h2>
    <div v-if="loading" class="flex flex-1 flex-col justify-center gap-4">
      <div v-for="i in 2" :key="i" class="h-11 animate-pulse rounded-xl bg-surface-muted" />
    </div>
    <div v-else-if="error" class="flex flex-1 flex-col items-start justify-center gap-2">
      <p class="text-sm text-ink-muted">{{ error }}</p>
      <button type="button" class="text-sm font-bold text-primary hover:underline" @click="$emit('retry')">
        Coba lagi
      </button>
    </div>
    <ul v-else-if="items.length" class="flex flex-1 flex-col justify-center divide-y divide-line-soft">
      <li v-for="item in items" :key="item.id" class="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
        <span class="mt-1 shrink-0 rounded-lg px-2 pt-[9px] pb-[11px]" :class="kinds[item.kind].tile">
          <AppIcon :name="kinds[item.kind].icon" class="my-[3px]" />
        </span>
        <div class="min-w-0">
          <p class="text-sm font-bold text-ink-strong">{{ item.title }}</p>
          <p class="text-xs text-ink-muted">
            {{ item.machine }} -
            <span class="font-medium" :class="kinds[item.kind].highlight">{{ item.detail }}</span>
          </p>
        </div>
      </li>
    </ul>
    <p v-else class="flex flex-1 items-center text-sm text-ink-muted">Semua mesin dalam kondisi baik.</p>
  </section>
</template>
