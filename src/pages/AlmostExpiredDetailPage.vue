<script setup lang="ts">
// Figma: 7.11-D-Vending Sales-almost expired-detail (1097:30280)
// Detail view for almost expired items of a specific vending machine
// Mirrored from legacy rmd-cms (pages/diskon-kedaluarsa/[machine].vue)
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import AppBreadcrumb from '@/components/ui/AppBreadcrumb.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppToast from '@/components/ui/AppToast.vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import AlmostExpiredItemTable from '@/components/almost-expired/AlmostExpiredItemTable.vue'
import EditAlmostExpiredModal from '@/components/almost-expired/EditAlmostExpiredModal.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  fetchAlmostExpiredItems,
  updateAlmostExpiredPrices,
} from '@/services/almostExpired'
import type {
  AlmostExpiredItem,
  UpdateAlmostExpiredItemPayload,
} from '@/types/almostExpired'

const route = useRoute()
const router = useRouter()

const machineCode = computed(() => (route.params.machine as string) || 'VMENIG010')

// Reactive state
const items = shallowRef<AlmostExpiredItem[]>([])
const loading = ref(false)
const isSubmitting = ref(false)
const selectedIds = ref<number[]>([])
const totalItems = ref(0)
const totalPages = ref(1)

// Query params & filter state
const searchQuery = ref((route.query.search as string) || '')
const pageSize = ref(Number(route.query.itemPerPage) || 10)
const page = ref(Number(route.query.page) || 1)

// Modal state
const showEditModal = ref(false)
const itemsToEdit = ref<AlmostExpiredItem[]>([])

// Feedback toasts
const toastMessage = ref<string | null>(null)
const toastType = ref<'success' | 'error'>('success')

const breadcrumbItems = computed(() => [
  { label: 'Almost Expired Item', to: { name: 'almost-expired' } },
  { label: machineCode.value },
])

const startIndex = computed(() => (page.value - 1) * pageSize.value + 1)

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
    const result = await fetchAlmostExpiredItems(machineCode.value, {
      page: page.value,
      itemPerPage: pageSize.value,
      search: searchQuery.value || undefined,
    })

    if (currentReq !== requestId) return

    items.value = result.data
    totalItems.value = result.pagination.totalItem
    totalPages.value = result.pagination.totalPage

    // Keep only selections that still exist in fetched items
    const validIds = new Set(result.data.map((i) => i.id))
    selectedIds.value = selectedIds.value.filter((id) => validIds.has(id))
  } catch {
    if (currentReq !== requestId) return
    items.value = []
    totalItems.value = 0
    totalPages.value = 1
  } finally {
    if (currentReq === requestId) {
      loading.value = false
    }
  }
}

// Open modal for a single item (Figma 1097:30646)
function onSingleEdit(item: AlmostExpiredItem) {
  itemsToEdit.value = [item]
  showEditModal.value = true
}

// Open modal for batch selected items (Figma 1097:30408 -> 1097:31104)
function onBatchEdit() {
  if (selectedIds.value.length === 0) {
    // If none checked, default to all visible items
    itemsToEdit.value = [...items.value]
  } else {
    itemsToEdit.value = items.value.filter((i) => selectedIds.value.includes(i.id))
  }
  showEditModal.value = true
}

async function handleSavePrices(updates: UpdateAlmostExpiredItemPayload[]) {
  isSubmitting.value = true
  try {
    await updateAlmostExpiredPrices({
      vmcode: machineCode.value,
      items: updates,
    })
    showEditModal.value = false
    toastMessage.value = updates.length > 1 ? 'Harga item-item berhasil diubah!' : 'Harga item berhasil diubah!'
    toastType.value = 'success'
    void loadData()
  } catch {
    toastMessage.value = 'Gagal menyimpan perubahan harga.'
    toastType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

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
  <DashboardLayout :title="`Almost Expired Item - ${machineCode}`">
    <template #header>
      <PageHeader
        v-model:search="searchQuery"
        title="Almost Expired Item"
        search-placeholder="Cari mesin..."
        @submit="loadData"
      >
        <!-- Secondary Search bar matching Figma 1097:30378 -->
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

    <div class="flex flex-col gap-4 font-inter">
      <!-- Breadcrumb navigation to return to list (Requested by user) -->
      <div class="flex items-center justify-between">
        <AppBreadcrumb :items="breadcrumbItems" />
      </div>

      <!-- Main card container -->
      <div class="rounded-2xl border border-line-faint bg-surface p-8 shadow-card">
        <!-- Table Top Controls: Entries select + "Ubah Harga" button (Figma 1097:30408) -->
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <EntriesSelect v-model="pageSize" />

          <!-- Ubah Harga button (Figma Component 7: 1097:30408) -->
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-[#6495ed] px-4 py-2.5 text-sm font-bold text-white shadow-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary transition cursor-pointer"
            @click="onBatchEdit"
          >
            <AppIcon name="line-pencil" class="size-4" />
            <span>Ubah Harga</span>
          </button>
        </div>

        <!-- Detail Table -->
        <AlmostExpiredItemTable
          v-model:selected-ids="selectedIds"
          :items="items"
          :loading="loading"
          :start-index="startIndex"
          @edit="onSingleEdit"
        />

        <!-- Table Footer: Showing X to Y of Z entries + Pagination -->
        <EntriesFooter
          v-model:page="page"
          :page-size="pageSize"
          :count="items.length"
          :total="totalItems"
          :total-pages="totalPages"
          :hidden="loading && items.length === 0"
        />
      </div>
    </div>

    <!-- Edit Price Modal (Single & Batch) -->
    <EditAlmostExpiredModal
      :open="showEditModal"
      :items="itemsToEdit"
      :busy="isSubmitting"
      @close="showEditModal = false"
      @save="handleSavePrices"
    />

    <!-- Feedback Toast -->
    <AppToast
      v-model="toastMessage"
      :variant="toastType"
    />
  </DashboardLayout>
</template>
