<script setup lang="ts">
// Modal for adding or editing a tutorial/troubleshoot document (Admin only).
// Mirrored from legacy rmd-cms/components/bantuan/tutorial.vue & troubleshoot.vue.
import { ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { GuideItem, GuideType } from '@/types/support'

const props = defineProps<{
  open: boolean
  guide?: GuideItem | null
  busy?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: { id?: number; title: string; type: GuideType; status: 'publish' | 'draft'; file: File | null }]
}>()

const title = ref('')
const type = ref<GuideType>('tutorial')
const status = ref<'publish' | 'draft'>('publish')
const file = ref<File | null>(null)
const fileError = ref<string | null>(null)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      if (props.guide) {
        title.value = props.guide.title
        type.value = props.guide.type
        status.value = props.guide.status === 'draft' ? 'draft' : 'publish'
        file.value = null
      } else {
        title.value = ''
        type.value = 'tutorial'
        status.value = 'publish'
        file.value = null
      }
      fileError.value = null
    }
  },
  { immediate: true },
)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = input.files?.[0] ?? null
  fileError.value = null

  if (!selected) {
    file.value = null
    return
  }

  // Max 5MB (same as legacy)
  if (selected.size > 5 * 1024 * 1024) {
    fileError.value = 'Ukuran file melebihi batas maksimal 5 MB.'
    input.value = ''
    file.value = null
    return
  }

  const ext = selected.name.split('.').pop()?.toLowerCase()
  if (ext !== 'pdf') {
    fileError.value = 'Tipe file harus PDF.'
    input.value = ''
    file.value = null
    return
  }

  file.value = selected
}

function onSubmit() {
  if (!title.value.trim()) return
  if (!props.guide && !file.value) {
    fileError.value = 'File dokumen PDF wajib diunggah.'
    return
  }

  emit('submit', {
    id: props.guide?.id,
    title: title.value.trim(),
    type: type.value,
    status: status.value,
    file: file.value,
  })
}
</script>

<template>
  <AppModal
    :open="open"
    :title="guide ? 'Ubah Dokumen Panduan' : 'Tambah Dokumen Panduan'"
    :busy="busy"
    width="w-[540px]"
    @close="$emit('close')"
  >
    <form class="flex flex-col gap-4 font-inter" @submit.prevent="onSubmit">
      <!-- Error notification -->
      <div v-if="error" role="alert" class="rounded-lg bg-danger-soft p-3 text-xs font-medium text-danger-strong">
        {{ error }}
      </div>

      <!-- Type selector -->
      <div class="flex flex-col gap-1.5">
        <label for="guide-type" class="text-xs font-semibold text-ink-strong">Kategori Dokumen</label>
        <select
          id="guide-type"
          v-model="type"
          :disabled="busy || !!guide"
          class="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink-strong outline-none focus:border-primary disabled:opacity-60"
        >
          <option value="tutorial">Tutorial</option>
          <option value="troubleshoot">Troubleshoot</option>
        </select>
      </div>

      <!-- Title input -->
      <div class="flex flex-col gap-1.5">
        <label for="guide-title" class="text-xs font-semibold text-ink-strong">Judul Dokumen</label>
        <textarea
          id="guide-title"
          v-model="title"
          rows="3"
          required
          :disabled="busy"
          placeholder="Masukkan judul tutorial atau troubleshoot..."
          class="rounded-lg border border-line bg-surface p-3 text-sm text-ink-strong outline-none placeholder:text-ink-subtle focus:border-primary"
        ></textarea>
      </div>

      <!-- Status toggle -->
      <div class="flex flex-col gap-1.5">
        <label for="guide-status" class="text-xs font-semibold text-ink-strong">Status Publikasi</label>
        <select
          id="guide-status"
          v-model="status"
          :disabled="busy"
          class="h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink-strong outline-none focus:border-primary"
        >
          <option value="publish">Publish (Terlihat oleh pengguna)</option>
          <option value="draft">Draft (Hanya admin)</option>
        </select>
      </div>

      <!-- File upload input -->
      <div class="flex flex-col gap-1.5">
        <label for="guide-file" class="text-xs font-semibold text-ink-strong">
          File PDF {{ guide ? '(Kosongkan jika tidak diubah)' : '(Wajib)' }}
        </label>
        <input
          id="guide-file"
          type="file"
          accept="application/pdf"
          :disabled="busy"
          class="block w-full text-xs text-ink-muted file:mr-4 file:rounded-lg file:border-0 file:bg-surface-muted file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-ink-strong hover:file:bg-line-faint"
          @change="onFileChange"
        />
        <p class="text-[11px] text-ink-muted">Maksimal 5MB, format dokumen PDF.</p>
        <p v-if="fileError" class="text-xs font-medium text-danger-strong">{{ fileError }}</p>
      </div>

      <!-- Action buttons -->
      <div class="mt-4 flex items-center justify-end gap-3 border-t border-line-soft pt-4">
        <AppButton type="button" :disabled="busy" @click="$emit('close')">
          Batal
        </AppButton>
        <AppButton type="submit" variant="primary" :disabled="busy || !title.trim()">
          {{ busy ? 'Menyimpan…' : 'Simpan' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
