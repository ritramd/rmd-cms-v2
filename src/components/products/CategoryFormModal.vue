<script setup lang="ts">
// Tambah / Edit Kategori Produk (v1: pages/product/categories.vue). One form for both modes,
// on the same modal shell and field styles as the product form.
import { computed, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { ApiError } from '@/services/api'
import { createProductCategory, updateProductCategory } from '@/services/productCategories'
import type { ProductCategory } from '@/types/product'
import { fieldClass, fieldLabelClass, fieldStateClass } from './formStyles'

const props = defineProps<{
  open: boolean
  /** null → Tambah, a category → Edit */
  category: ProductCategory | null
}>()

const emit = defineEmits<{
  close: []
  saved: [message: string]
}>()

const isEdit = computed(() => props.category !== null)
const title = computed(() => (isEdit.value ? 'Edit Kategori Produk' : 'Tambah Kategori Produk'))
const submitLabel = computed(() => (isEdit.value ? 'Simpan Perubahan' : 'Tambah Kategori'))

const name = ref('')
const touched = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const invalid = computed(() => touched.value && !name.value.trim())

watch(
  () => props.open,
  (open) => {
    if (!open) return
    name.value = props.category?.category ?? ''
    touched.value = false
    error.value = null
  },
)

async function submit() {
  touched.value = true
  error.value = null
  if (!name.value.trim()) {
    error.value = 'Nama kategori wajib diisi.'
    return
  }
  submitting.value = true
  try {
    if (props.category) {
      await updateProductCategory(props.category.id, name.value)
      emit('saved', 'Kategori berhasil diperbarui.')
    } else {
      await createProductCategory(name.value)
      emit('saved', 'Kategori baru berhasil ditambahkan.')
    }
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Gagal menyimpan kategori.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppModal :open="open" :title="title" :busy="submitting" width="w-[520px]" @close="emit('close')">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <label class="flex flex-col gap-1">
        <span :class="fieldLabelClass">Nama Kategori</span>
        <input
          v-model="name"
          type="text"
          placeholder="Contoh: Minuman Dingin"
          :class="[fieldClass, fieldStateClass(invalid)]"
        />
      </label>

      <p v-if="error" role="alert" class="text-sm text-danger-strong">{{ error }}</p>

      <div class="flex justify-end gap-3">
        <AppButton :disabled="submitting" @click="emit('close')">Batalkan</AppButton>
        <AppButton type="submit" variant="primary" :disabled="submitting">
          {{ submitting ? 'Menyimpan…' : submitLabel }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
