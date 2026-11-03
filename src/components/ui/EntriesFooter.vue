<script setup lang="ts">
// Figma: Penjualan table footer (1097:20470, 1097:33723) — "Showing 1 to 10 of 100 entries" and pagination.
import { computed } from 'vue'
import EntriesPagination from './EntriesPagination.vue'

const props = defineProps<{
  pageSize: number
  /** Rows on the current page. */
  count: number
  total: number
  totalPages: number
  /** Hides the summary and pagination while the table is loading or failed. */
  hidden?: boolean
}>()

const page = defineModel<number>('page', { required: true })
const first = computed(() => (page.value - 1) * props.pageSize + 1)
</script>

<template>
  <div class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-row-line pt-[25px] font-inter">
    <p v-if="!hidden" class="text-sm text-ink-placeholder">
      <template v-if="total">
        Showing <span class="font-medium text-ink-heading">{{ first }}</span> to
        <span class="font-medium text-ink-heading">{{ first + count - 1 }}</span> of
        <span class="font-medium text-ink-heading">{{ total }}</span> entries
      </template>
      <template v-else>No entries</template>
    </p>
    <span v-else />
    <EntriesPagination v-if="!hidden && totalPages > 1" v-model:page="page" :total-pages="totalPages" />
  </div>
</template>
