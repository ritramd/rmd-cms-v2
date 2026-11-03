<script setup lang="ts">
// Kategori Produk — logic from rmd-cms v1 (pages/product/categories.vue), styled like Atur Produk (1097:22027).
import { computed, onMounted, ref } from 'vue'
import sortIcon from '@/assets/table/sort.svg'
import PageHeader from '@/components/layout/PageHeader.vue'
import AddButton from '@/components/products/AddButton.vue'
import CategoryFormModal from '@/components/products/CategoryFormModal.vue'
import DeleteButton from '@/components/products/DeleteButton.vue'
import EditButton from '@/components/products/EditButton.vue'
import AppToast from '@/components/ui/AppToast.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import {
  canModifyCategory,
  deleteProductCategory,
  fetchProductCategories,
  isSubUser,
  isSystemCategory,
} from '@/services/productCategories'
import type { ProductCategory } from '@/types/product'

const subUser = isSubUser()

const categories = ref<ProductCategory[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')
const toast = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    categories.value = await fetchProductCategories()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat daftar kategori.'
  } finally {
    loading.value = false
  }
}
onMounted(load)

const systemCount = computed(() => categories.value.filter(isSystemCategory).length)
const customCount = computed(() => categories.value.length - systemCount.value)

const rows = computed(() => {
  const q = search.value.trim().toLowerCase()
  const filtered = q ? categories.value.filter((c) => c.category.toLowerCase().includes(q)) : categories.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filtered].sort((a, b) => a.category.localeCompare(b.category, 'id') * dir)
})

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Add / edit: one form, editing = null → Tambah.
const formOpen = ref(false)
const editing = ref<ProductCategory | null>(null)

function openAdd() {
  editing.value = null
  formOpen.value = true
}
function openEdit(category: ProductCategory) {
  if (!canModifyCategory(category)) return
  editing.value = category
  formOpen.value = true
}
function onSaved(message: string) {
  formOpen.value = false
  toast.value = message
  void load()
}

// Delete with confirmation.
const deleting = ref<ProductCategory | null>(null)
const deleteBusy = ref(false)
const deleteError = ref<string | null>(null)

function askDelete(category: ProductCategory) {
  if (!canModifyCategory(category)) return
  deleteError.value = null
  deleting.value = category
}
async function confirmDelete() {
  if (!deleting.value) return
  deleteBusy.value = true
  deleteError.value = null
  try {
    await deleteProductCategory(deleting.value.id)
    deleting.value = null
    toast.value = 'Kategori berhasil dihapus.'
    void load()
  } catch (err) {
    deleteError.value = err instanceof ApiError ? err.message : 'Gagal menghapus kategori.'
  } finally {
    deleteBusy.value = false
  }
}

const thClass = 'px-8 pt-5 pb-5 text-[11px] font-normal tracking-[1.1px] text-ink-subtle uppercase'
</script>

<template>
  <DashboardLayout title="Kategori Produk">
    <template #header>
      <PageHeader v-model:search="search" title="Kategori Produk" search-placeholder="Cari nama kategori..." />
    </template>

    <div class="flex flex-col gap-10">
      <p v-if="subUser" class="rounded-2xl border border-warning/20 bg-warning-soft px-5 py-4 text-sm text-warning-strong">
        Anda masuk sebagai <strong>sub-user</strong>. Anda dapat melihat kategori umum sistem dan kategori milik akun
        utama, namun penambahan dan pengubahan kategori hanya dapat dilakukan oleh akun utama.
      </p>

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap gap-2 font-inter text-xs font-medium">
          <span class="rounded-full bg-surface px-3 py-1 text-ink-soft shadow-hairline">Total Kategori: {{ categories.length }}</span>
          <span class="rounded-full bg-primary-soft px-3 py-1 text-primary">Umum (Sistem): {{ systemCount }}</span>
          <span v-if="customCount" class="rounded-full bg-success-soft px-3 py-1 text-success-strong">
            Kustom Anda: {{ customCount }}
          </span>
        </div>
        <AddButton v-if="!subUser" @click="openAdd">Tambah Kategori</AddButton>
      </div>

      <section class="overflow-clip rounded-3xl border border-line bg-surface font-inter shadow-[0_2px_4px_rgb(0_0_0/0.02),0_1px_2px_rgb(0_0_0/0.03)]">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] table-fixed text-left text-sm">
            <colgroup>
              <col class="w-[10%]" />
              <col class="w-[38%]" />
              <col class="w-[18%]" />
              <col class="w-[18%]" />
              <col class="w-[16%]" />
            </colgroup>
            <thead class="bg-surface-muted/50">
              <tr class="border-b border-line">
                <th scope="col" :class="thClass" class="pl-[61px]">No</th>
                <th scope="col" :class="thClass" :aria-sort="sortDir === 'asc' ? 'ascending' : 'descending'">
                  <button
                    type="button"
                    class="inline-flex items-center uppercase hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-primary"
                    @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'"
                  >
                    Nama Kategori
                    <img :src="sortIcon" alt="" class="-my-1" />
                  </button>
                </th>
                <th scope="col" :class="thClass">Tipe Kategori</th>
                <th scope="col" :class="thClass">Tanggal Dibuat</th>
                <th scope="col" :class="thClass" class="pr-[61px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody :aria-busy="loading">
              <tr v-if="loading">
                <td colspan="5" class="py-16 text-center text-ink-soft">Memuat kategori…</td>
              </tr>
              <tr v-else-if="error">
                <td colspan="5" class="py-16 text-center text-ink-soft">
                  {{ error }}
                  <button type="button" class="ml-2 font-medium text-brand hover:underline" @click="load">Coba lagi</button>
                </td>
              </tr>
              <tr v-else-if="!rows.length">
                <td colspan="5" class="py-16 text-center text-ink-soft">
                  {{ search ? 'Tidak ada kategori yang cocok.' : 'Belum ada kategori.' }}
                </td>
              </tr>
              <tr
                v-for="(category, i) in rows"
                v-else
                :key="category.id"
                class="border-t border-surface-muted transition-colors first:border-t-0 hover:bg-surface-muted/30"
              >
                <td class="py-5 pr-8 pl-[61px] text-ink-subtle">{{ i + 1 }}</td>
                <td class="truncate px-8 py-5 font-medium text-ink-navy">{{ category.category }}</td>
                <td class="px-8 py-5">
                  <span
                    class="rounded-lg px-2.5 py-1 text-xs font-bold"
                    :class="isSystemCategory(category) ? 'bg-surface-hover text-ink-muted' : 'bg-success-soft text-success-strong'"
                  >
                    {{ isSystemCategory(category) ? 'Umum (Sistem)' : 'Kustom Anda' }}
                  </span>
                </td>
                <td class="px-8 py-5 text-xs text-ink-soft">{{ formatDate(category.created_at) }}</td>
                <td class="py-3 pr-[61px] pl-8">
                  <div v-if="canModifyCategory(category)" class="flex justify-center gap-2">
                    <EditButton :label="`Ubah ${category.category}`" @click="openEdit(category)" />
                    <DeleteButton :label="`Hapus ${category.category}`" @click="askDelete(category)" />
                  </div>
                  <p v-else class="text-center text-xs text-ink-subtle italic" title="Kategori umum sistem tidak dapat diubah">
                    Terkunci
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="bg-surface-muted/20 px-8 py-6">
          <p class="text-xs text-ink-soft">
            {{ loading || error ? '' : `Menampilkan ${rows.length} dari ${categories.length} kategori` }}
          </p>
        </div>
      </section>
    </div>

    <CategoryFormModal :open="formOpen" :category="editing" @close="formOpen = false" @saved="onSaved" />
    <ConfirmDialog
      :open="deleting !== null"
      title="Hapus Kategori?"
      :message="`Apakah Anda yakin ingin menghapus kategori “${deleting?.category ?? ''}”?`"
      :busy="deleteBusy"
      :error="deleteError"
      @confirm="confirmDelete"
      @close="deleting = null"
    />
    <AppToast v-model="toast" variant="success" />
  </DashboardLayout>
</template>
