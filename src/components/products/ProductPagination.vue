<script setup lang="ts">
import { usePageWindow } from '@/composables/usePageWindow'
import PageArrowButton from './PageArrowButton.vue'
import PageNumberButton from './PageNumberButton.vue'

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
  <nav aria-label="Pagination" class="flex items-center gap-1">
    <PageArrowButton direction="prev" :disabled="page <= 1" @click="goTo(page - 1)" />
    <PageNumberButton v-for="p in pages" :key="p" :page="p" :active="p === page" @click="goTo(p)" />
    <PageArrowButton direction="next" :disabled="page >= totalPages" @click="goTo(page + 1)" />
  </nav>
</template>
