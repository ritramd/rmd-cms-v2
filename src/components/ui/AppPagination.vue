<script setup lang="ts">
import { usePageWindow } from '@/composables/usePageWindow'
import PageButton from './PageButton.vue'

const props = withDefaults(
  defineProps<{
    totalPages: number
    /** Number of page buttons shown at once. */
    window?: number
  }>(),
  { window: 5 },
)

const page = defineModel<number>('page', { required: true })

const pages = usePageWindow(page, () => props.totalPages, () => props.window)

function goTo(target: number) {
  page.value = Math.min(Math.max(target, 1), props.totalPages)
}
</script>

<template>
  <nav aria-label="Pagination" class="flex items-center gap-2">
    <PageButton kind="prev" :disabled="page <= 1" @click="goTo(page - 1)" />
    <PageButton
      v-for="p in pages"
      :key="p"
      kind="page"
      :page="p"
      :active="p === page"
      @click="goTo(p)"
    />
    <PageButton kind="next" :disabled="page >= totalPages" @click="goTo(page + 1)" />
  </nav>
</template>
