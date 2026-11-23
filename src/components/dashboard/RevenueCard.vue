<script setup lang="ts">
// Figma: Total Pendapatan card (1097:42296)
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { formatRupiah, formatRupiahCompact } from '@/utils/format'

const props = defineProps<{
  revenue: number | null
  loading?: boolean
  error?: string | null
  /** Left caption at the bottom, e.g. the period the revenue covers. */
  periodLabel?: string
  /** Optional: the progress bar and "Target" caption only show when a target is known. */
  target?: number
  /** The target is the suggested Rp 10 jt × machines, not one the client saved. */
  targetIsDefault?: boolean
  /** Main clients can click the target to change it. */
  targetEditable?: boolean
  /** Optional: change vs. the comparison period, in percent. */
  growth?: number
  /** What `growth` compares against, e.g. "Dibanding 1–21 Okt 2026"; shown as the badge's tooltip. */
  growthCompare?: string
}>()

defineEmits<{
  retry: []
  editTarget: []
}>()

const progress = computed(() =>
  props.target && props.revenue !== null ? Math.min(Math.max(props.revenue / props.target, 0), 1) * 100 : 0,
)
const targetLabel = computed(() =>
  props.target ? `Target${props.targetIsDefault ? ' default' : ''}: ${formatRupiahCompact(props.target)}` : '',
)
const growthLabel = computed(() =>
  props.growth === undefined
    ? null
    : `${props.growth > 0 ? '+' : ''}${props.growth.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`,
)
</script>

<template>
  <section
    class="relative isolate flex h-[230px] flex-col justify-between overflow-clip rounded-[32px] bg-linear-[163.73deg] from-primary to-revenue-end p-8 text-white shadow-primary"
    :aria-busy="loading"
  >
    <div class="absolute -top-12 -right-12 -z-10 size-64 rounded-full bg-white opacity-5 blur-[32px]" aria-hidden="true" />
    <div class="absolute -bottom-8 -left-8 -z-10 size-48 rounded-full bg-revenue-glow opacity-10 blur-[20px]" aria-hidden="true" />

    <div class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 flex-col gap-2">
        <h2 class="flex items-center gap-2 text-base font-medium text-success-soft">
          <span class="rounded-md bg-white/20 px-1 py-1.5"><AppIcon name="wallet" /></span>
          Total Pendapatan
        </h2>
        <div v-if="loading" class="h-12 w-80 max-w-full animate-pulse rounded-xl bg-white/20" />
        <div v-else-if="error" class="flex flex-col items-start gap-2">
          <p class="text-base font-medium">{{ error }}</p>
          <button
            type="button"
            class="rounded-full bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-white"
            @click="$emit('retry')"
          >
            Coba lagi
          </button>
        </div>
        <p v-else class="truncate text-3xl font-bold tracking-[-1px] sm:text-4xl 2xl:text-5xl leading-tight">{{ formatRupiah(revenue ?? 0) }}</p>
      </div>
      <span
        v-if="growthLabel"
        class="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-[2px]"
        :title="growthCompare"
      >
        <!-- The design only has a rising arrow; mirrored for a decline. -->
        <span class="my-[3px] flex" :class="growth !== undefined && growth < 0 && '-scale-y-100'">
          <AppIcon name="trending-up" />
        </span>
        {{ growthLabel }}
        <span v-if="growthCompare" class="sr-only">{{ growthCompare }}</span>
      </span>
    </div>

    <div v-if="periodLabel || target" class="mt-auto flex flex-col gap-2">
      <div class="flex justify-between gap-4 text-xs font-medium text-success-soft">
        <span>{{ periodLabel }}</span>
        <button
          v-if="target && targetEditable"
          type="button"
          class="-mx-1 -my-0.5 inline-flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
          title="Klik untuk mengubah target"
          :aria-label="`${targetLabel}. Ubah target pendapatan`"
          @click="$emit('editTarget')"
        >
          {{ targetLabel }}
          <AppIcon name="line-pencil" class="size-3.5 brightness-0 invert" />
        </button>
        <span v-else-if="target">{{ targetLabel }}</span>
      </div>
      <div
        v-if="target"
        class="h-2 overflow-clip rounded-full bg-black/10"
        role="progressbar"
        :aria-valuenow="Math.round(progress)"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Pencapaian target"
      >
        <div class="h-full rounded-full bg-white" :style="{ width: `${progress}%` }" />
      </div>
    </div>
  </section>
</template>
