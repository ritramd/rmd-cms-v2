<script setup lang="ts">
// Figma: Tambah / Edit Produk modal (1097:23067). One form for both; the title and submit label follow the mode.
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import uploadIcon from '@/assets/form/upload.svg'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { storageUrl } from '@/config/env'
import { ApiError } from '@/services/api'
import { canEditInternalName, saveProduct } from '@/services/products'
import type { ProductCategory, ProductFormValues, ProductRecord } from '@/types/product'
import { fieldClass, fieldLabelClass, fieldStateClass } from './formStyles'

const props = defineProps<{
  open: boolean
  /** null → Tambah Produk, a record → Edit Produk */
  product: ProductRecord | null
  categories: ProductCategory[]
}>()

const emit = defineEmits<{
  close: []
  saved: [message: string]
}>()

const DISPLAY_NAME_MAX = 20
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

const fileInput = ref<HTMLInputElement | null>(null)

const isEdit = computed(() => props.product !== null)
const title = computed(() => (isEdit.value ? 'Edit Produk' : 'Tambah Produk'))
const submitLabel = computed(() => (isEdit.value ? 'Simpan Perubahan' : 'Buat Produk'))
const showInternalName = canEditInternalName()

const form = reactive<ProductFormValues>({ categoryId: null, sku: '', displayName: '', name: '', price: null, file: null })
const touched = ref(false)
const submitting = ref(false)
const submitError = ref<string | null>(null)
const dragging = ref(false)
const previewUrl = ref<string | null>(null)

function reset() {
  const p = props.product
  form.categoryId = p?.category_id ?? null
  form.sku = p?.sku ?? ''
  form.displayName = p?.display_name ?? ''
  form.name = p?.name ?? ''
  form.price = p?.price === null || p?.price === undefined ? null : Number(p.price)
  form.file = null
  touched.value = false
  submitError.value = null
  setPreview(null)
}

function setPreview(file: File | null) {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = file ? URL.createObjectURL(file) : null
}

const currentPhoto = computed(() => previewUrl.value ?? storageUrl(props.product?.photo))

const displayNameTooLong = computed(() => form.displayName.length > DISPLAY_NAME_MAX)

const errors = computed(() => ({
  categoryId: !form.categoryId,
  sku: !form.sku.trim(),
  // Older products may already exceed the limit (v1 only capped typing), so only block a changed name.
  displayName:
    !form.displayName.trim() || (displayNameTooLong.value && form.displayName !== props.product?.display_name),
  name: showInternalName && !form.name.trim(),
  price: !form.price || form.price <= 0,
  // A photo is required to create a product (backend rejects it otherwise); optional when editing.
  file: !isEdit.value && !form.file,
}))
const invalid = (field: keyof ProductFormValues) => touched.value && errors.value[field]

function pickFile(file: File | undefined) {
  if (!file) return
  if (!ACCEPTED_TYPES.includes(file.type)) {
    submitError.value = 'Format foto harus PNG atau JPG.'
    return
  }
  submitError.value = null
  form.file = file
  setPreview(file)
}

function onDrop(event: DragEvent) {
  dragging.value = false
  pickFile(event.dataTransfer?.files[0])
}

async function submit() {
  touched.value = true
  submitError.value = null
  if (Object.values(errors.value).some(Boolean)) {
    submitError.value = 'Lengkapi semua kolom yang wajib diisi.'
    return
  }
  submitting.value = true
  try {
    const message = await saveProduct(form, props.categories, props.product)
    emit('saved', message)
  } catch (err) {
    submitError.value = err instanceof ApiError ? err.message : 'Gagal menyimpan produk.'
  } finally {
    submitting.value = false
  }
}

function close() {
  if (!submitting.value) emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) reset()
  },
)

onBeforeUnmount(() => setPreview(null))

const fieldState = fieldStateClass
const labelClass = fieldLabelClass
</script>

<template>
  <AppModal :open="open" :title="title" :busy="submitting" @close="close">
    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div class="flex flex-col gap-6">
        <label class="flex flex-col gap-1">
          <span :class="labelClass">Pilih Kategori</span>
          <span class="relative">
            <select
              v-model="form.categoryId"
              class="appearance-none pr-10"
              :class="[fieldClass, fieldState(invalid('categoryId'))]"
            >
              <option :value="null" disabled>Pilih Kategori</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.category }}</option>
            </select>
            <AppIcon name="line-select-chevron" class="pointer-events-none absolute top-1/2 right-[13px] -translate-y-1/2" />
          </span>
        </label>

        <label class="flex flex-col gap-1">
          <span :class="labelClass">SKU</span>
          <input v-model="form.sku" type="text" placeholder="Masukkan No. SKU" :class="[fieldClass, fieldState(invalid('sku'))]" />
        </label>

        <label class="flex flex-col gap-1">
          <span :class="labelClass">Nama Display</span>
          <input
            v-model="form.displayName"
            type="text"
            :maxlength="DISPLAY_NAME_MAX"
            placeholder="Isi nama display"
            :class="[fieldClass, fieldState(invalid('displayName'))]"
          />
          <span
            class="font-inter text-[10px]/[15px] font-medium"
            :class="displayNameTooLong ? 'text-danger-strong' : 'text-ink-subtle'"
          >
            Maksimal {{ DISPLAY_NAME_MAX }} Karakter · {{ form.displayName.length }}/{{ DISPLAY_NAME_MAX }}
          </span>
        </label>

        <div class="grid gap-4" :class="showInternalName ? 'sm:grid-cols-2' : ''">
          <label v-if="showInternalName" class="flex flex-col gap-1">
            <span :class="labelClass">Nama Internal</span>
            <input v-model="form.name" type="text" placeholder="Isi nama internal" :class="[fieldClass, fieldState(invalid('name'))]" />
          </label>
          <label class="flex flex-col gap-1">
            <span :class="labelClass">Harga</span>
            <span class="relative">
              <span class="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center font-inter text-xs font-medium text-ink-heading">
                Rp
              </span>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                inputmode="numeric"
                placeholder="0"
                class="pl-[51px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                :class="[fieldClass, fieldState(invalid('price'))]"
                @wheel.prevent
              />
            </span>
          </label>
        </div>

        <div class="flex flex-col gap-1">
          <span :class="labelClass">Upload Foto</span>
          <button
            type="button"
            class="flex h-[210px] flex-col items-center justify-center gap-1 rounded-[20px] border-2 border-dashed p-1 transition-colors focus-visible:outline-2 focus-visible:outline-primary"
            :class="[
              dragging ? 'border-brand bg-brand-tint' : 'bg-dropzone',
              invalid('file') ? 'border-input-error' : dragging ? '' : 'border-dropzone-border',
            ]"
            @click="fileInput?.click()"
            @dragover.prevent="dragging = true"
            @dragleave="dragging = false"
            @drop.prevent="onDrop"
          >
            <template v-if="currentPhoto">
              <img :src="currentPhoto" alt="Foto produk" class="max-h-[140px] max-w-[60%] rounded-lg object-contain" />
              <span class="text-sm font-medium text-ink-heading">{{ form.file?.name ?? 'Foto saat ini' }}</span>
              <span class="text-xs text-ink-muted">Klik atau tarik file lain untuk mengganti</span>
            </template>
            <template v-else>
              <img :src="uploadIcon" alt="" />
              <span class="text-center text-xl font-bold text-ink-heading">
                Tarik dan letakkan file disini, atau klik untuk menambahkan file
              </span>
            </template>
          </button>
          <input
            ref="fileInput"
            type="file"
            :accept="ACCEPTED_TYPES.join(',')"
            class="sr-only"
            tabindex="-1"
            aria-label="Upload foto produk"
            @change="pickFile(($event.target as HTMLInputElement).files?.[0]); ($event.target as HTMLInputElement).value = ''"
          />
        </div>
      </div>

      <p v-if="submitError" role="alert" class="text-sm text-danger-strong">{{ submitError }}</p>

      <div class="flex justify-end gap-3">
        <AppButton :disabled="submitting" @click="close">Batalkan</AppButton>
        <AppButton type="submit" variant="primary" :disabled="submitting">
          {{ submitting ? 'Menyimpan…' : submitLabel }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
