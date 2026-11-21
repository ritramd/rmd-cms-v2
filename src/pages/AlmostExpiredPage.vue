<script setup lang="ts">
// Figma: 7.10-D-Vending Sales-almost expired (1097:27019)
// Main Almost Expired vending machines list orchestrator
// Mirrored from legacy rmd-cms (pages/diskon-kedaluarsa/index.vue)
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import AlmostExpiredMachineTable from '@/components/almost-expired/AlmostExpiredMachineTable.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { fetchAlmostExpiredMachines } from '@/services/almostExpired'
import type { AlmostExpiredMachine } from '@/types/almostExpired'

const route = useRoute()
const router = useRouter()

// Reactive state
const machines = shallowRef<AlmostExpiredMachine[]>([])
const loading = ref(false)
const totalItems = ref(0)
const totalPages = ref(1)

// Query params & filter state
const searchQuery = ref((route.query.search as string) || '')
const pageSize = ref(Number(route.query.itemPerPage) || 10)
const page = ref(Number(route.query.page) || 1)

const startIndex = computed(() => (page.value - 1) * pageSize.value + 1)

// Sync URL query params
function syncQueryParams() {
  const query: Record<string, string> = {}
  if (searchQuery.value) query.search = searchQuery.value
  if (page.value > 1) query.page = String(page.value)
  if (pageSize.value !== 10) query.itemPerPage = String(pageSize.value)

  void router.replace({ query })
}

let requestId = 0
async function loadData() {
  const currentReq = ++requestId
  loading.value = true
  try {
    const result = await fetchAlmostExpiredMachines({
      page: page.value,
      itemPerPage: pageSize.value,
      search: searchQuery.value || undefined,
    })

    if (currentReq !== requestId) return

    machines.value = result.data
    totalItems.value = result.pagination.totalItem
    totalPages.value = result.pagination.totalPage
  } catch {
    if (currentReq !== requestId) return
    machines.value = []
    totalItems.value = 0
    totalPages.value = 1
  } finally {
    if (currentReq === requestId) {
      loading.value = false
    }
  }
}

// Watchers for filtering and pagination
watch([pageSize, searchQuery], () => {
  page.value = 1
  syncQueryParams()
  void loadData()
})

watch(page, () => {
  syncQueryParams()
  void loadData()
})

onMounted(() => {
  void loadData()
})
</script>

<template>
  <DashboardLayout title="Almost Expired Item">
    <template #header>
      <PageHeader
        v-model:search="searchQuery"
        title="Almost Expired Item"
        search-placeholder="Cari mesin..."
        @submit="loadData"
      >
        <!-- Secondary Search bar matching Figma 1097:27135 -->
        <div class="flex items-center gap-6">
          <div class="relative w-[480px] max-w-full">
            <span class="sr-only">Cari produk apa</span>
            <AppIcon
              name="search-sm"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-placeholder"
            />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari produk apa"
              class="w-full rounded-lg border border-line bg-surface py-2.5 pr-3.5 pl-9 text-sm text-ink-strong outline-none placeholder:text-ink-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              @keydown.enter="loadData"
            />
          </div>
        </div>
      </PageHeader>
    </template>

    <div class="rounded-2xl border border-line-faint bg-surface p-8 shadow-card font-inter">
      <!-- Table top bar: Show Entries -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <EntriesSelect v-model="pageSize" />
      </div>

      <!-- Machines Table -->
      <AlmostExpiredMachineTable
        :machines="machines"
        :loading="loading"
        :start-index="startIndex"
      />

      <!-- Table Footer: Showing X to Y of Z entries + Pagination -->
      <EntriesFooter
        v-model:page="page"
        :page-size="pageSize"
        :count="machines.length"
        :total="totalItems"
        :total-pages="totalPages"
        :hidden="loading && machines.length === 0"
      />
    </div>
  </DashboardLayout>
</template>
