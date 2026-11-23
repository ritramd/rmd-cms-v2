<script setup lang="ts">
// Figma: 5.7-D-UI Material (1097:16416), 5.14-D-Apply Filter (1097:18682), 5.15-D-Tambah Konten (1097:19197),
// 5.16-D-Tambah Konten With Jadwal (1097:19663), 5.11-D-UI Editor (1097:17962)
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import AddContentModal from '@/components/ui-material/AddContentModal.vue'
import ApplyContentModal from '@/components/ui-material/ApplyContentModal.vue'
import MediaPreviewModal from '@/components/ui-material/MediaPreviewModal.vue'
import UiEditorModal from '@/components/ui-material/UiEditorModal.vue'
import UiMaterialFilterBar from '@/components/ui-material/UiMaterialFilterBar.vue'
import UiMaterialTable from '@/components/ui-material/UiMaterialTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToast from '@/components/ui/AppToast.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  deleteAdvertisement,
  fetchAdvertisements,
} from '@/services/advertisements'
import { fetchKelolaVendingMachines } from '@/services/kelolaVending'
import type { Advertisement, AdvertisementClient } from '@/types/advertisement'
import type { KelolaVendingMachine } from '@/types/kelolaVending'

const route = useRoute()
const router = useRouter()

// Filter & pagination states
const startDate = ref((route.query.startDate as string) || '')
const endDate = ref((route.query.endDate as string) || '')
const page = ref(1)
const pageSize = ref(10)

// Data states
const items = ref<Advertisement[]>([])
const clients = ref<AdvertisementClient[]>([])
const machines = ref<KelolaVendingMachine[]>([])
const selectedIds = ref<number[]>([])
const loading = ref(true)

// Modals
const showAddModal = ref(false)
const showApplyModal = ref(false)
const activeAdForApply = ref<Advertisement | null>(null)
const showPreviewModal = ref(false)
const activeAdForPreview = ref<Advertisement | null>(null)
const showEditorModal = ref(false)
const showDeleteConfirm = ref(false)
const activeAdForDelete = ref<Advertisement | null>(null)
const deleteBusy = ref(false)
const deleteError = ref<string | null>(null)

// Toast state
const toast = ref<string | null>(null)
const toastVariant = ref<'success' | 'error'>('success')

async function loadData() {
  loading.value = true
  try {
    const [adsResult, machinesResult] = await Promise.all([
      fetchAdvertisements({
        startDate: startDate.value || undefined,
        endDate: endDate.value || undefined,
      }),
      fetchKelolaVendingMachines(),
    ])

    items.value = adsResult.data
    clients.value = adsResult.clients
    machines.value = machinesResult
  } catch {
    toastVariant.value = 'error'
    toast.value = 'Gagal memuat data UI Material.'
  } finally {
    loading.value = false
  }
}

function syncUrl() {
  const query: Record<string, string> = {}
  if (startDate.value) query.startDate = startDate.value
  if (endDate.value) query.endDate = endDate.value
  void router.replace({ query })
}

function handleApplyFilter() {
  page.value = 1
  syncUrl()
  void loadData()
}

function handleResetFilter() {
  startDate.value = ''
  endDate.value = ''
  page.value = 1
  syncUrl()
  void loadData()
}

// Client-side paginated items
const paginatedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return items.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() => {
  return Math.ceil(items.value.length / pageSize.value) || 1
})

// Selection handlers
function toggleSelectAll() {
  if (selectedIds.value.length === items.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = items.value.map((i) => i.id)
  }
}

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx !== -1) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// Media Preview
function handlePreviewMedia(ad: Advertisement) {
  activeAdForPreview.value = ad
  showPreviewModal.value = true
}

// Apply modal
function handleApply(ad: Advertisement) {
  activeAdForApply.value = ad
  showApplyModal.value = true
}

function handleContentApplied() {
  toastVariant.value = 'success'
  toast.value = 'Konten berhasil diterapkan ke mesin target!'
  void loadData()
}

// Delete action
function promptDelete(ad: Advertisement) {
  activeAdForDelete.value = ad
  deleteError.value = null
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!activeAdForDelete.value) return
  deleteBusy.value = true
  deleteError.value = null

  try {
    await deleteAdvertisement(activeAdForDelete.value.id)
    showDeleteConfirm.value = false
    toastVariant.value = 'success'
    toast.value = `Konten "${activeAdForDelete.value.description}" berhasil dihapus.`
    activeAdForDelete.value = null
    void loadData()
  } catch (err: unknown) {
    deleteError.value = err instanceof Error ? err.message : 'Gagal menghapus konten.'
  } finally {
    deleteBusy.value = false
  }
}

function handleSaved(newAd: Advertisement) {
  toastVariant.value = 'success'
  toast.value = `Konten baru "${newAd.description}" berhasil ditambahkan.`
  void loadData()
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <DashboardLayout title="UI Material">
    <template #header>
      <PageHeader
        title="UI Material"
        subtitle="Kelola materi iklan gambar dan video, atur jadwal tayang, dan terapkan ke layar vending machine"
      />
    </template>

    <div class="space-y-8 font-inter">
      <!-- Filter Bar matching Figma 1097:16416 -->
      <UiMaterialFilterBar
        v-model:start-date="startDate"
        v-model:end-date="endDate"
        @apply-filter="handleApplyFilter"
        @reset-filter="handleResetFilter"
        @add-content="showAddModal = true"
        @open-editor="showEditorModal = true"
      />

      <!-- Main White Card Container matching Figma 1097:16499 -->
      <div class="rounded-[16px] border border-[#f1f5f9] bg-white p-6 sm:p-8 shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-6">
        <!-- Top Toolbar: Show entries & Selected items notification -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <EntriesSelect v-model="pageSize" />

          <div v-if="selectedIds.length > 0" class="flex items-center gap-3">
            <span class="text-xs font-semibold text-[#5f93ec]">
              {{ selectedIds.length }} item konten dipilih
            </span>
            <AppButton variant="secondary" size="sm" @click="selectedIds = []">
              Batal Pilih
            </AppButton>
          </div>
        </div>

        <!-- Table Section -->
        <UiMaterialTable
          :items="paginatedItems"
          :selected-ids="selectedIds"
          :loading="loading"
          @toggle-select-all="toggleSelectAll"
          @toggle-select="toggleSelect"
          @preview-media="handlePreviewMedia"
          @apply="handleApply"
          @delete="promptDelete"
        />

        <!-- Bottom Footer: Showing X to Y of Z entries + Pagination -->
        <EntriesFooter
          v-model:page="page"
          :page-size="pageSize"
          :count="paginatedItems.length"
          :total="items.length"
          :total-pages="totalPages"
          :hidden="loading || items.length === 0"
        />
      </div>
    </div>

    <!-- Modals -->
    <AddContentModal
      :open="showAddModal"
      :clients="clients"
      @close="showAddModal = false"
      @saved="handleSaved"
    />

    <ApplyContentModal
      :open="showApplyModal"
      :ad="activeAdForApply"
      :machines="machines"
      @close="showApplyModal = false"
      @applied="handleContentApplied"
    />

    <MediaPreviewModal
      :open="showPreviewModal"
      :ad="activeAdForPreview"
      @close="showPreviewModal = false"
    />

    <UiEditorModal
      :open="showEditorModal"
      :advertisements="items"
      :machines="machines"
      @close="showEditorModal = false"
    />

    <ConfirmDialog
      :open="showDeleteConfirm"
      title="Hapus Konten"
      :message="`Apakah Anda yakin ingin menghapus materi iklan &quot;${activeAdForDelete?.description ?? ''}&quot;? Tindakan ini tidak dapat dibatalkan.`"
      confirm-label="Ya, Hapus"
      :busy="deleteBusy"
      :error="deleteError"
      @close="showDeleteConfirm = false"
      @confirm="confirmDelete"
    />

    <AppToast v-model="toast" :variant="toastVariant" />
  </DashboardLayout>
</template>
