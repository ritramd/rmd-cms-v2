<script setup lang="ts">
// Figma: Flashsale 1-flow architecture & Onboarding
// List of Flashsales (Rules Table: 1097:22366 / 1097:39795) -> Detail of Flashsale (Items Table: 1097:22366 / 1097:30083)
// Connected with Breadcrumb navigation, interactive filtering, add items, and edit dialog (1097:23067).
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AddFlashsaleItemModal from '@/components/flashsale/AddFlashsaleItemModal.vue'
import AddFlashsaleModal from '@/components/flashsale/AddFlashsaleModal.vue'
import FlashsaleEmptyState from '@/components/flashsale/FlashsaleEmptyState.vue'
import FlashsaleItemsTable from '@/components/flashsale/FlashsaleItemsTable.vue'
import FlashsaleRulesTable from '@/components/flashsale/FlashsaleRulesTable.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import ProductFormModal from '@/components/products/ProductFormModal.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppToast from '@/components/ui/AppToast.vue'
import OnboardingTooltip from '@/components/ui/OnboardingTooltip.vue'
import { useOnboarding } from '@/composables/useOnboarding'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  addItemsToFlashsale,
  createFlashsale,
  DEFAULT_MACHINE_CODE,
  DEFAULT_MACHINE_NAME,
  deleteStoredRuleItem,
  fetchFlashsaleRules,
  getFlashsaleRuleById,
  updateStoredRuleItem,
} from '@/services/flashsale'
import { fetchProductCategories } from '@/services/products'
import type {
  AddFlashsaleItemsPayload,
  CreateFlashsalePayload,
  FlashsaleItemDetail,
  FlashsaleRule,
  OnboardingStep,
} from '@/types/flashsale'
import type { ProductCategory, ProductFormValues, ProductRecord } from '@/types/product'

const route = useRoute()
const router = useRouter()
const { currentStep, nextStep, closeOnboarding, setStep } = useOnboarding()

const vmcode = computed(() => (route.params.machine as string) || DEFAULT_MACHINE_CODE)
const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(100)
const totalPages = ref(10)
const loading = ref(false)

const rules = ref<FlashsaleRule[]>([])
const activeRule = ref<FlashsaleRule | null>(null)
const categories = ref<ProductCategory[]>([])

// Modals
const addModalOpen = ref(false)
const addItemModalOpen = ref(false)
const productModalOpen = ref(false)
const editingProduct = ref<ProductRecord | null>(null)
const toast = ref<string | null>(null)

const pageTitle = computed(() => {
  if (activeRule.value) {
    return activeRule.value.name
  }
  return DEFAULT_MACHINE_NAME
})

const activeRuleItems = computed<FlashsaleItemDetail[]>(() => {
  return activeRule.value?.items ?? []
})

async function loadData() {
  loading.value = true
  try {
    const res = await fetchFlashsaleRules(vmcode.value, {
      page: page.value,
      itemPerPage: pageSize.value,
      search: search.value,
    })
    rules.value = res.data
    total.value = res.pagination.totalItem || res.data.length
    totalPages.value = res.pagination.totalPage || 1

    // If active rule was selected, refresh its reference from latest rules
    if (activeRule.value) {
      const refreshed = rules.value.find((r) => r.id === activeRule.value?.id)
      if (refreshed) activeRule.value = refreshed
    }
  } finally {
    loading.value = false
  }
}

// Watchers
watch([page, pageSize], () => void loadData())
watch(search, () => {
  page.value = 1
  void loadData()
})

// Sync activeRule from URL query
function syncRuleFromQuery() {
  const queryRuleId = route.query.ruleId ? Number(route.query.ruleId) : null
  if (queryRuleId) {
    const found = rules.value.find((r) => r.id === queryRuleId) || getFlashsaleRuleById(queryRuleId)
    if (found) {
      activeRule.value = found
      return
    }
  }
  if (!route.query.ruleId && (!currentStep.value || !['flashsale_final_success', 'flashsale_modal_item'].includes(currentStep.value))) {
    activeRule.value = null
  }
}

watch(() => route.query.ruleId, () => syncRuleFromQuery())

onMounted(async () => {
  await loadData()
  try {
    categories.value = await fetchProductCategories()
  } catch {
    categories.value = []
  }

  // Handle explicit query or onboarding steps
  if (route.query.ruleId) {
    syncRuleFromQuery()
  } else if (currentStep.value === 'flashsale_final_success') {
    if (rules.value.length > 0) activeRule.value = rules.value[0]
  } else if (currentStep.value === 'flashsale_modal_info') {
    addModalOpen.value = true
  } else if (currentStep.value === 'flashsale_modal_item') {
    if (rules.value.length > 0) activeRule.value = rules.value[0]
    addItemModalOpen.value = true
  }

  if (route.query.step) {
    setStep(route.query.step as OnboardingStep)
  }
})

// Onboarding step changes
watch(currentStep, (step) => {
  if (step === 'flashsale_tambah_button') {
    activeRule.value = null
    addModalOpen.value = false
    addItemModalOpen.value = false
  } else if (step === 'flashsale_modal_info') {
    addModalOpen.value = true
    addItemModalOpen.value = false
  } else if (step === 'flashsale_modal_item') {
    addModalOpen.value = false
    addItemModalOpen.value = true
    if (!activeRule.value && rules.value.length > 0) {
      activeRule.value = rules.value[0]
    }
  } else if (step === 'flashsale_final_success') {
    addModalOpen.value = false
    addItemModalOpen.value = false
    if (!activeRule.value && rules.value.length > 0) {
      activeRule.value = rules.value[0]
    }
  }
})

function onAddFlashsaleClick() {
  if (currentStep.value === 'flashsale_tambah_button') {
    nextStep() // advances to 'flashsale_modal_info'
  }
  addModalOpen.value = true
}

async function onSaveRule(payload: CreateFlashsalePayload) {
  const res = await createFlashsale(payload)
  toast.value = res.message
  addModalOpen.value = false
  await loadData()

  const newRule = rules.value.find((r) => r.id === res.id) || rules.value[0]
  if (newRule) {
    activeRule.value = newRule
    void router.replace({ query: { ...route.query, ruleId: newRule.id } })
  }

  if (currentStep.value === 'flashsale_modal_info') {
    nextStep() // advances to 'flashsale_modal_item'
    addItemModalOpen.value = true
  }
}

function onSelectRule(rule: FlashsaleRule) {
  activeRule.value = rule
  void router.replace({ query: { ...route.query, ruleId: rule.id } })
}

function onOpenAddItem(rule: FlashsaleRule) {
  activeRule.value = rule
  addItemModalOpen.value = true
}

async function onSaveItems(payload: AddFlashsaleItemsPayload) {
  const res = await addItemsToFlashsale(payload)
  toast.value = res.message
  addItemModalOpen.value = false

  await loadData()
  if (res.addedItems && activeRule.value) {
    if (!activeRule.value.items) activeRule.value.items = []
    res.addedItems.forEach((item) => {
      if (!activeRule.value?.items?.some((i) => i.id === item.id)) {
        activeRule.value?.items?.unshift(item)
      }
    })
  }

  if (currentStep.value === 'flashsale_modal_item') {
    nextStep() // advances to 'flashsale_final_success'
  }
}

function backToList() {
  activeRule.value = null
  const query = { ...route.query }
  delete query.ruleId
  void router.replace({ query })
}

function onEditItem(item: FlashsaleItemDetail) {
  editingProduct.value = {
    id: item.productId || item.id,
    sku: item.sku || '',
    name: item.name,
    display_name: item.displayName || item.name,
    price: item.price,
    photo: item.photo || '',
    category_id: null,
    categories: item.displayName ? item.displayName.split(' ')[0] : 'Umum',
    ownership: null,
  }
  productModalOpen.value = true
}

function onProductSaved(message: string, formValues?: ProductFormValues) {
  productModalOpen.value = false
  toast.value = message || 'Produk berhasil diubah.'
  if (activeRule.value && editingProduct.value) {
    const targetId = editingProduct.value.id
    const itm = activeRule.value.items?.find((i) => i.productId === targetId || i.id === targetId)
    if (itm) {
      if (formValues) {
        itm.name = formValues.name || itm.name
        itm.displayName = formValues.displayName || itm.displayName
        itm.sku = formValues.sku || itm.sku
        itm.price = Number(formValues.price ?? itm.price)
      }
      updateStoredRuleItem(activeRule.value.id, itm)
    }
  }
}

function onDeleteItem(item: FlashsaleItemDetail) {
  if (activeRule.value && activeRule.value.items) {
    activeRule.value.items = activeRule.value.items.filter((i) => i.id !== item.id)
    deleteStoredRuleItem(activeRule.value.id, item.id)
    toast.value = 'Item flashsale berhasil dihapus.'
  }
}

function handleTooltipNext() {
  if (currentStep.value === 'flashsale_tambah_button') {
    onAddFlashsaleClick()
  } else if (currentStep.value === 'flashsale_modal_info') {
    addModalOpen.value = false
    nextStep()
    if (rules.value.length > 0) activeRule.value = rules.value[0]
    addItemModalOpen.value = true
  } else if (currentStep.value === 'flashsale_modal_item') {
    addItemModalOpen.value = false
    if (rules.value.length > 0) activeRule.value = rules.value[0]
    nextStep()
  } else if (currentStep.value === 'flashsale_final_success') {
    closeOnboarding()
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}
</script>

<template>
  <DashboardLayout :title="pageTitle">
    <template #header>
      <PageHeader
        v-model:search="search"
        :title="pageTitle"
        :search-placeholder="activeRule ? 'Cari produk dalam flashsale…' : 'Cari mesin / flashsale…'"
      />
    </template>

    <div class="relative flex flex-col gap-6">
      <!-- 1. BREADCRUMB & HEADER FOR DETAIL VIEW -->
      <div v-if="activeRule" class="flex flex-col gap-4">
        <!-- Breadcrumb row -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="inline-flex size-9 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft shadow-xs transition-colors hover:bg-surface-muted hover:text-ink-navy cursor-pointer"
              title="Kembali ke Daftar Flashsale"
              @click="backToList"
            >
              <AppIcon name="line-chevron-left" class="size-4" />
            </button>
            <nav class="flex items-center gap-2 text-sm">
              <button
                type="button"
                class="font-medium text-ink-soft hover:text-primary transition-colors cursor-pointer"
                @click="backToList"
              >
                Flashsale
              </button>
              <span class="text-ink-subtle">/</span>
              <span class="font-semibold text-ink-navy">{{ activeRule.name }}</span>
            </nav>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button
              id="btn-tambah-item-flashsale"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-primary transition-all hover:bg-primary-hover active:scale-95 cursor-pointer"
              @click="onOpenAddItem(activeRule)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Item
            </button>
          </div>
        </div>

        <!-- Rule Details Info Card -->
        <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div class="flex flex-col gap-1">
            <div class="flex flex-wrap items-center gap-2.5">
              <h2 class="text-lg font-bold text-ink-navy">{{ activeRule.name }}</h2>
              <span class="inline-flex items-center rounded-lg bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                Diskon {{ activeRule.discountValue }}%
              </span>
              <span class="inline-flex items-center rounded-lg bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success-strong capitalize">
                {{ activeRule.status === 'scheduled' ? 'Aktif' : 'Non-aktif' }}
              </span>
            </div>
            <p class="text-xs text-ink-soft">
              {{ activeRule.days.join(', ') }} • {{ formatDate(activeRule.startDate) }} s/d {{ formatDate(activeRule.endDate) }} • {{ activeRule.startTime }} - {{ activeRule.endTime }} WIB
            </p>
          </div>

          <div class="text-xs text-ink-muted">
            Total <span class="font-semibold text-ink-navy">{{ activeRuleItems.length }}</span> produk diatur
          </div>
        </div>

        <!-- Flashsale Items Table View (1097:22366 & 1097:30083) -->
        <div class="relative">
          <FlashsaleItemsTable
            v-model:page="page"
            v-model:pageSize="pageSize"
            :items="activeRuleItems"
            :total="activeRuleItems.length"
            :loading="loading"
            @delete-item="onDeleteItem"
            @edit-item="onEditItem"
          />

          <!-- Final Tooltip pointing UP to table row (1097:30271) -->
          <div
            v-if="currentStep === 'flashsale_final_success'"
            id="tooltip-final-success"
            class="absolute left-20 top-[220px] z-50"
          >
            <OnboardingTooltip
              title="Yay! Item Flashsale&#10;berhasil ditambahkan"
              description="Item tersebut akan tampil sesuai jadwal Flashsale"
              button-text="Mengerti"
              pointer-position="top"
              @next="handleTooltipNext"
              @close="closeOnboarding"
            />
          </div>
        </div>
      </div>

      <!-- 2. MAIN LIST VIEW OF FLASHSALES -->
      <div v-else class="flex flex-col gap-6">
        <!-- Top Action Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- Search input -->
          <div class="relative w-full max-w-md">
            <input
              v-model="search"
              type="text"
              placeholder="Cari flashsale apa…"
              class="h-10.5 w-full rounded-lg border border-line bg-surface pl-10 pr-4 text-sm text-ink-heading placeholder:text-ink-subtle shadow-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>

          <!-- Tambah Flashsale Button (1097:35796) -->
          <div class="relative">
            <button
              id="btn-tambah-flashsale"
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-[#6495ed] px-4 py-2.5 font-sans text-sm font-bold text-white shadow-primary transition-all hover:bg-primary-hover active:scale-95 cursor-pointer"
              @click="onAddFlashsaleClick"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Flashsale
            </button>

            <!-- Tooltip pointing to Tambah Flashsale button (1097:36118) -->
            <div
              v-if="currentStep === 'flashsale_tambah_button'"
              id="tooltip-tambah-flashsale"
              class="absolute right-0 top-14 z-50"
            >
              <OnboardingTooltip
                title="Tambahkan Item&#10;Flashsale"
                description="Switch between your profiles for unique app experiences"
                button-text="Lanjut"
                pointer-position="top-right"
                @next="handleTooltipNext"
                @close="closeOnboarding"
              />
            </div>
          </div>
        </div>

        <!-- Empty State if no rules exist (1097:35691) -->
        <div
          v-if="!loading && rules.length === 0"
          class="relative rounded-2xl border border-line-faint bg-surface p-8 shadow-card"
        >
          <FlashsaleEmptyState />
        </div>

        <!-- Rules Table View (Figma 1097:22366 / 1097:39795) -->
        <div v-else>
          <FlashsaleRulesTable
            v-model:page="page"
            v-model:pageSize="pageSize"
            :rules="rules"
            :total="total"
            :total-pages="totalPages"
            :loading="loading"
            @select-rule="onSelectRule"
            @add-item="onOpenAddItem"
            @edit="onSelectRule"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- 1. Add New Flashsale Modal (1097:39795) with its Tooltip (1097:40400) -->
    <AddFlashsaleModal
      :open="addModalOpen"
      :vmcode="vmcode"
      :show-tooltip="currentStep === 'flashsale_modal_info'"
      @close="addModalOpen = false"
      @saved="onSaveRule"
      @tooltip-next="handleTooltipNext"
      @tooltip-close="closeOnboarding"
    />

    <!-- 2. Add Items to Flashsale Modal (1097:40947) with its Tooltip (1097:41485) -->
    <AddFlashsaleItemModal
      :open="addItemModalOpen"
      :flashsale-id="activeRule?.id ?? 1"
      :flashsale-name="activeRule?.name ?? 'Flashsale 1'"
      :vmcode="vmcode"
      :show-tooltip="currentStep === 'flashsale_modal_item'"
      @close="addItemModalOpen = false"
      @saved="onSaveItems"
      @tooltip-next="handleTooltipNext"
      @tooltip-close="closeOnboarding"
    />

    <!-- 3. Edit Produk Modal (1097:23067) -->
    <ProductFormModal
      :open="productModalOpen"
      :product="editingProduct"
      :categories="categories"
      @close="productModalOpen = false"
      @saved="onProductSaved"
    />

    <AppToast v-model="toast" variant="success" />
  </DashboardLayout>
</template>
