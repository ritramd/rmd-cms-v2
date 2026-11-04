<script setup lang="ts">
// Figma: 10.1-D-Vending Sales (1097:27375) - Tutorial & Troubleshoot (Pure Figma)
// Legacy parity: rmd-cms/pages/tutorial/index.vue
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppToast from '@/components/ui/AppToast.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import TutorialFormModal from '@/components/support/TutorialFormModal.vue'
import TutorialTable from '@/components/support/TutorialTable.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { getSession } from '@/services/auth'
import {
  createTroubleshoot,
  createTutorial,
  deleteTroubleshoot,
  deleteTutorial,
  fetchGuides,
  updateTroubleshoot,
  updateTutorial,
} from '@/services/support'
import type { GuideItem, GuideType } from '@/types/support'

const route = useRoute()
const router = useRouter()

// Session & permissions (v1 parity: role_id == 1 is Super Admin)
const user = getSession()
const isAdmin = computed(() => user?.role_id === 1)

// Reactive filters & pagination
const search = ref((route.query.search as string) || '')
const page = ref(Number(route.query.page) || 1)
const perPage = ref(Number(route.query.itemPerPage) || 10)

// Data state
const guides = ref<GuideItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Toast state
const toastMessage = ref<string | null>(null)
const toastVariant = ref<'success' | 'error'>('success')

function showToast(message: string, variant: 'success' | 'error' = 'success') {
  toastMessage.value = message
  toastVariant.value = variant
}

// Modal state
const formModalOpen = ref(false)
const selectedGuide = ref<GuideItem | null>(null)
const formBusy = ref(false)
const formError = ref<string | null>(null)

// Delete dialog state
const deleteDialogOpen = ref(false)
const guideToDelete = ref<GuideItem | null>(null)
const deleteBusy = ref(false)
const deleteError = ref<string | null>(null)

// Race condition protection
let requestId = 0

async function loadData() {
  const id = ++requestId
  loading.value = true
  error.value = null
  try {
    const list = await fetchGuides()
    if (id !== requestId) return
    guides.value = list
  } catch (err) {
    if (id !== requestId) return
    error.value = err instanceof ApiError || err instanceof Error ? err.message : 'Gagal memuat panduan.'
    showToast(error.value, 'error')
  } finally {
    if (id === requestId) loading.value = false
  }
}

// Filtered items (all guides searchable via "Cari panduan apa")
const filteredGuides = computed(() => {
  let list = guides.value

  if (search.value.trim()) {
    const q = search.value.toLowerCase().trim()
    list = list.filter((g) => g.title.toLowerCase().includes(q))
  }

  return list
})

// Client paginated items
const paginatedItems = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredGuides.value.slice(start, start + perPage.value)
})

// Sync query string to URL
watch([search, page, perPage], () => {
  const query: Record<string, string> = {}
  if (search.value.trim()) query.search = search.value.trim()
  if (page.value > 1) query.page = String(page.value)
  if (perPage.value !== 10) query.itemPerPage = String(perPage.value)

  router.replace({ query })
})

// Reset page when search changes
watch(search, () => {
  page.value = 1
})

// Admin Modal Handlers
function onOpenAddModal() {
  selectedGuide.value = null
  formError.value = null
  formModalOpen.value = true
}

function onOpenEditModal(item: GuideItem) {
  selectedGuide.value = item
  formError.value = null
  formModalOpen.value = true
}

async function handleFormSubmit(payload: {
  id?: number
  title: string
  type: GuideType
  status: 'publish' | 'draft'
  file: File | null
}) {
  formBusy.value = true
  formError.value = null

  try {
    const formData = new FormData()
    formData.append('title', payload.title)
    formData.append('status', payload.status)
    if (payload.file) {
      formData.append('file', payload.file)
    }

    if (payload.id) {
      // Update
      if (payload.type === 'tutorial') {
        await updateTutorial(payload.id, formData)
      } else {
        await updateTroubleshoot(payload.id, formData)
      }
      showToast('Data panduan berhasil diperbarui!')
    } else {
      // Create
      if (payload.type === 'tutorial') {
        await createTutorial(formData)
      } else {
        await createTroubleshoot(formData)
      }
      showToast('Data panduan berhasil disimpan!')
    }

    formModalOpen.value = false
    await loadData()
  } catch (err) {
    formError.value = err instanceof ApiError || err instanceof Error ? err.message : 'Gagal menyimpan data.'
  } finally {
    formBusy.value = false
  }
}

function onConfirmDelete(item: GuideItem) {
  guideToDelete.value = item
  deleteError.value = null
  deleteDialogOpen.value = true
}

async function executeDelete() {
  if (!guideToDelete.value) return
  deleteBusy.value = true
  deleteError.value = null

  try {
    const item = guideToDelete.value
    if (item.type === 'tutorial') {
      await deleteTutorial(item.id)
    } else {
      await deleteTroubleshoot(item.id)
    }

    showToast('Data panduan berhasil dihapus!')
    deleteDialogOpen.value = false
    guideToDelete.value = null
    await loadData()
  } catch (err) {
    deleteError.value = err instanceof ApiError || err instanceof Error ? err.message : 'Gagal menghapus data.'
  } finally {
    deleteBusy.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <DashboardLayout title="Tutorial & Troubleshoot">
    <!-- Figma Subheader: Search Guide Input (1097:27493 - 480px width) -->
    <div class="flex items-center">
      <div class="relative w-full max-w-[480px]">
        <input
          v-model="search"
          type="search"
          placeholder="Cari panduan apa"
          class="w-full rounded-lg border border-line bg-surface py-3 pr-4 pl-10 text-sm text-ink-strong shadow-xs placeholder:text-ink-subtle focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        />
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <AppIcon name="search" class="size-4.5 text-ink-placeholder" />
        </div>
      </div>
    </div>

    <!-- Domain Table Component (Figma 1097:27510) -->
    <TutorialTable
      v-model:page="page"
      v-model:per-page="perPage"
      :items="paginatedItems"
      :total-items="filteredGuides.length"
      :loading="loading"
      :is-admin="isAdmin"
      @add="onOpenAddModal"
      @edit="onOpenEditModal"
      @delete="onConfirmDelete"
    />

    <!-- Admin Form Modal for Add/Edit -->
    <TutorialFormModal
      :open="formModalOpen"
      :guide="selectedGuide"
      :busy="formBusy"
      :error="formError"
      @close="formModalOpen = false"
      @submit="handleFormSubmit"
    />

    <!-- Admin Confirm Delete Dialog -->
    <ConfirmDialog
      :open="deleteDialogOpen"
      title="Hapus Panduan?"
      :message="`Apakah kamu yakin ingin menghapus data panduan '${guideToDelete?.title}'?`"
      confirm-label="Hapus"
      cancel-label="Batal"
      :busy="deleteBusy"
      :error="deleteError"
      @confirm="executeDelete"
      @close="deleteDialogOpen = false"
    />

    <!-- User Feedback Toast -->
    <AppToast v-model="toastMessage" :variant="toastVariant" />
  </DashboardLayout>
</template>
