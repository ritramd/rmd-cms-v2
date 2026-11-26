<script setup lang="ts">
// Error log of one machine (v1 pages/log-error/[machine].vue), in the v2 table style. With the
// backend's pagination it shows the usual entries footer; backends from before that return no
// totals, so it falls back to previous / next (a full page means there may be another one).
import { computed } from 'vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import type { ErrorLogRecord } from '@/types/logs'
import type { Pagination } from '@/types/product'

const props = defineProps<{
  rows: ErrorLogRecord[]
  /** Null when the backend sent no totals. */
  pagination: Pagination | null
  loading?: boolean
  error?: string | null
  emptyText: string
}>()

defineEmits<{ retry: [] }>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const firstIndex = computed(() => (page.value - 1) * pageSize.value + 1)
const hasNext = computed(() => props.rows.length === pageSize.value)
const showPager = computed(
  () => !props.pagination && !props.loading && !props.error && (page.value > 1 || hasNext.value),
)

const thClass = 'px-6 py-4 text-xs font-semibold tracking-[0.6px] whitespace-nowrap text-ink-placeholder uppercase'
const pagerClass =
  'rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-hairline transition-colors enabled:hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50'
</script>

<template>
  <section class="rounded-2xl border border-line-faint/50 bg-surface px-8 pt-[29px] pb-6 font-inter shadow-card">
    <EntriesSelect v-model="pageSize" />

    <div class="mt-6 overflow-x-auto">
      <table class="w-full min-w-[720px] table-fixed text-left">
        <colgroup>
          <col class="w-20" />
          <col />
          <col class="w-36" />
          <col class="w-56" />
        </colgroup>
        <thead>
          <tr class="border-b border-line-faint">
            <th scope="col" :class="thClass">No</th>
            <th scope="col" :class="thClass">Pesan Error</th>
            <th scope="col" :class="thClass">Status</th>
            <th scope="col" :class="thClass">Waktu Kejadian</th>
          </tr>
        </thead>
        <tbody :aria-busy="loading" class="text-sm">
          <tr v-if="loading">
            <td colspan="4" class="py-16 text-center text-ink-muted">Memuat log error…</td>
          </tr>
          <tr v-else-if="error">
            <td colspan="4" class="py-16 text-center text-ink-muted">
              {{ error }}
              <button type="button" class="ml-2 font-medium text-link hover:underline" @click="$emit('retry')">Coba lagi</button>
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="4" class="py-16 text-center text-ink-muted">{{ emptyText }}</td>
          </tr>
          <tr
            v-for="(row, i) in rows"
            v-else
            :key="row.error_id ?? `${row.error_time}-${i}`"
            class="border-t border-row-line text-ink transition-colors first:border-t-0 hover:bg-row-line"
          >
            <td class="px-6 py-4 text-ink-muted">{{ firstIndex + i }}</td>
            <td class="px-6 py-4 break-words">{{ row.error_message || '-' }}</td>
            <td class="px-6 py-4">
              <!-- Pill style of TransactionStatusBadge; older backends send no flag. -->
              <span
                v-if="row.solved !== undefined"
                class="inline-flex rounded-lg px-2.5 py-1 text-xs font-bold whitespace-nowrap"
                :class="row.solved ? 'bg-success-soft text-success-strong' : 'bg-danger-soft text-danger-strong'"
              >
                {{ row.solved ? 'Teratasi' : 'Error' }}
              </span>
              <span v-else class="text-ink-muted">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ row.error_time ? `${row.error_time} WIB` : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <EntriesFooter
      v-if="pagination"
      v-model:page="page"
      :page-size="pageSize"
      :count="rows.length"
      :total="pagination.totalItem"
      :total-pages="pagination.totalPage"
      :hidden="loading || !!error"
    />
    <div v-else-if="showPager" class="mt-6 flex items-center justify-end gap-3 border-t border-row-line pt-[25px]">
      <span class="mr-auto text-sm text-ink-placeholder">Halaman {{ page }}</span>
      <button type="button" :class="pagerClass" :disabled="page <= 1" @click="page = page - 1">Sebelumnya</button>
      <button type="button" :class="pagerClass" :disabled="!hasNext" @click="page = page + 1">Berikutnya</button>
    </div>
  </section>
</template>
