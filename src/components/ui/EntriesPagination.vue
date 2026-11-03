<script setup lang="ts">
// Figma: Penjualan table pagination (1097:20473) — chevrons, a few pages around the current one, "…" and the last page.
import { computed } from 'vue'
import nextIcon from '@/assets/table/page-next.svg'
import prevIcon from '@/assets/table/page-prev.svg'
import { usePageWindow } from '@/composables/usePageWindow'
import TintedIcon from './TintedIcon.vue'

const props = defineProps<{
  totalPages: number
}>()

const page = defineModel<number>('page', { required: true })

const around = usePageWindow(page, () => props.totalPages, 3)
// First and last page stay reachable; gaps become "…".
const items = computed(() => {
  const pages = around.value
  const result: (number | 'gap')[] = []
  if (pages[0] > 1) result.push(1, ...(pages[0] > 2 ? ['gap' as const] : []))
  result.push(...pages)
  const last = pages[pages.length - 1]
  if (last < props.totalPages) result.push(...(last < props.totalPages - 1 ? ['gap' as const] : []), props.totalPages)
  return result
})

function goTo(target: number) {
  page.value = Math.min(Math.max(target, 1), props.totalPages)
}

const buttonClass =
  'flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link'
</script>

<template>
  <nav aria-label="Pagination" class="flex items-center gap-1 font-inter">
    <button
      type="button"
      aria-label="Halaman sebelumnya"
      :disabled="page <= 1"
      :class="buttonClass"
      class="group enabled:hover:bg-line-faint disabled:cursor-not-allowed"
      @click="goTo(page - 1)"
    >
      <TintedIcon :src="prevIcon" color="bg-ink-placeholder group-enabled:bg-ink-muted" class="h-[7px] w-[4.317px]" />
    </button>
    <template v-for="(item, i) in items" :key="i">
      <span v-if="item === 'gap'" class="px-1 text-sm text-ink-placeholder" aria-hidden="true">...</span>
      <button
        v-else
        type="button"
        :aria-current="item === page ? 'page' : undefined"
        :aria-label="`Halaman ${item}`"
        :class="[buttonClass, item === page ? 'bg-link text-white shadow-hairline' : 'text-ink-muted hover:bg-line-faint']"
        @click="goTo(item)"
      >
        {{ item }}
      </button>
    </template>
    <button
      type="button"
      aria-label="Halaman berikutnya"
      :disabled="page >= totalPages"
      :class="buttonClass"
      class="group enabled:hover:bg-line-faint disabled:cursor-not-allowed"
      @click="goTo(page + 1)"
    >
      <TintedIcon :src="nextIcon" color="bg-ink-placeholder group-enabled:bg-ink-muted" class="h-[7px] w-[4.317px]" />
    </button>
  </nav>
</template>
