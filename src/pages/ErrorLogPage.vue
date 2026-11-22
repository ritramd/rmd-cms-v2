<script setup lang="ts">
// Log Error of one machine (v1 pages/log-error/[machine].vue). No Figma frame; header follows Vending Sales
// detail (1097:33354). No download: v1's was "coming soon" and the backend has no /log-error/download.
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import ErrorLogTable from '@/components/logs/ErrorLogTable.vue'
import DateField from '@/components/sales/DateField.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { fetchErrorLog } from '@/services/logs'
import { fetchMachineName } from '@/services/sales'
import type { ErrorLogRecord } from '@/types/logs'
import type { Pagination } from '@/types/product'

const props = defineProps<{
  /** Machine code from the URL, e.g. "VMENIG010". */
  machine: string
}>()

const route = useRoute()
const router = useRouter()

const queryText = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')
const startDate = ref(queryText('startDate'))
const endDate = ref(queryText('endDate'))
const page = ref(Number(queryText('page')) || 1)
const pageSize = ref(Number(queryText('itemPerPage')) || 10)

const rows = shallowRef<ErrorLogRecord[]>([])
const pagination = ref<Pagination | null>(null)
const machineName = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const toast = ref<string | null>(null)

const rangeError = computed(() =>
  startDate.value && endDate.value && endDate.value < startDate.value
    ? 'Tanggal akhir tidak boleh sebelum tanggal awal.'
    : null,
)
const hasFilters = computed(() => Boolean(startDate.value || endDate.value))

function syncQuery() {
  const query: Record<string, string> = {}
  if (startDate.value) query.startDate = startDate.value
  if (endDate.value) query.endDate = endDate.value
  if (page.value !== 1) query.page = String(page.value)
  if (pageSize.value !== 10) query.itemPerPage = String(pageSize.value)
  void router.replace({ query })
}

let requestId = 0
async function load() {
  if (rangeError.value) {
    toast.value = rangeError.value
    return
  }
  const id = ++requestId
  loading.value = true
  error.value = null
  syncQuery()
  try {
    const result = await fetchErrorLog(props.machine, {
      page: page.value,
      itemPerPage: pageSize.value,
      // Whole days; older backends compare these as-is, so send the full bounds.
      startDate: startDate.value ? `${startDate.value} 00:00:00` : undefined,
      endDate: endDate.value ? `${endDate.value} 23:59:59` : undefined,
    })
    if (id !== requestId) return // a newer request superseded this one
    rows.value = result.data
    pagination.value = result.pagination
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat log error.'
  } finally {
    if (id === requestId) loading.value = false
  }
}

function reloadFromFirstPage() {
  if (page.value === 1) void load()
  else page.value = 1
}

// Filters apply as soon as they change, like the other v2 pages (v1 had a "Terapkan" button).
watch([startDate, endDate, pageSize], reloadFromFirstPage)
watch(page, () => void load())

onMounted(() => {
  void load()
  fetchMachineName(props.machine)
    .then((name) => (machineName.value = name))
    .catch(() => (machineName.value = null)) // the title falls back to the code
})

function resetFilters() {
  startDate.value = ''
  endDate.value = ''
}

const title = computed(() => `Log Error ${machineName.value ?? props.machine}`)
const emptyText = computed(() =>
  hasFilters.value ? 'Tidak ada error pada rentang tanggal ini.' : 'Belum ada error tercatat di mesin ini.',
)
</script>

<template>
  <DashboardLayout :title="`Log Error ${machine}`">
    <template #header>
      <PageHeader :title="title">
        <div class="flex flex-wrap items-end gap-6 lg:flex-nowrap">
          <div class="flex flex-wrap gap-6 sm:flex-nowrap">
            <DateField v-model="startDate" label="Tanggal Awal" :max="endDate || undefined" />
            <DateField v-model="endDate" label="Tanggal Akhir" :min="startDate || undefined" />
          </div>
          <div class="ml-auto flex shrink-0 items-center gap-4">
            <AppButton v-if="hasFilters" icon="line-rotate-ccw" @click="resetFilters">Reset</AppButton>
          </div>
        </div>
      </PageHeader>
    </template>

    <ErrorLogTable
      v-model:page="page"
      v-model:page-size="pageSize"
      :rows="rows"
      :pagination="pagination"
      :loading="loading"
      :error="error"
      :empty-text="emptyText"
      @retry="load"
    />

    <AppToast v-model="toast" variant="error" />
  </DashboardLayout>
</template>
