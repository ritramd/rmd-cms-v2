<script setup lang="ts">
// Figma: 5.15-D-Tambah Konten (1097:19197) & 5.16-D-Tambah Konten With Jadwal (1097:19663)
import { reactive, ref, watch } from 'vue'
import uploadIcon from '@/assets/form/upload.svg'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { createAdvertisement } from '@/services/advertisements'
import type { Advertisement, AdvertisementClient, AdvertisementSpot } from '@/types/advertisement'

const props = defineProps<{
  open: boolean
  clients: AdvertisementClient[]
}>()

const emit = defineEmits<{
  close: []
  saved: [ad: Advertisement]
}>()

const SPOTS: { value: AdvertisementSpot; label: string; desc: string }[] = [
  { value: 'header', label: 'Header', desc: 'Banner bagian atas layar' },
  { value: 'idle', label: 'Idle', desc: 'Layar siaga saat tidak ada transaksi' },
  { value: 'footer', label: 'Footer', desc: 'Banner bagian bawah layar' },
  { value: 'dispense view', label: 'Dispense view', desc: 'Layar saat produk dikeluarkan' },
  { value: 'banner promo', label: 'Banner Promo', desc: 'Banner pop-up promosi khusus' },
]

const form = reactive({
  advertiser: '',
  description: '',
  spot: 'header' as AdvertisementSpot,
  useSchedule: false,
  startDate: '',
  endDate: '',
  startHour: '08:00',
  endHour: '21:00',
})

const file = ref<File | null>(null)
const filePreview = ref<string | null>(null)
const isVideo = ref(false)
const isDragging = ref(false)
const busy = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.open,
  (val) => {
    if (val) {
      resetForm()
      if (props.clients.length > 0) {
        form.advertiser = props.clients[0].name
      }
    }
  },
)

function resetForm() {
  form.advertiser = ''
  form.description = ''
  form.spot = 'header'
  form.useSchedule = false
  form.startDate = ''
  form.endDate = ''
  form.startHour = '08:00'
  form.endHour = '21:00'
  file.value = null
  if (filePreview.value) {
    URL.revokeObjectURL(filePreview.value)
    filePreview.value = null
  }
  isVideo.value = false
  errorMessage.value = null
  busy.value = false
}

function handleFileSelect(selected: File | null) {
  if (!selected) return
  errorMessage.value = null

  // Validate file type
  const type = selected.type
  const isValidType =
    type.startsWith('image/') ||
    type === 'video/mp4' ||
    type === 'video/webm' ||
    type === 'video/quicktime'

  if (!isValidType) {
    errorMessage.value = 'Format file tidak didukung. Harap upload file gambar (JPG, PNG) atau video MP4.'
    return
  }

  // Validate size (max 50MB)
  if (selected.size > 50 * 1024 * 1024) {
    errorMessage.value = 'Ukuran file melebihi batas maksimal 50MB.'
    return
  }

  file.value = selected
  isVideo.value = type.startsWith('video/')
  filePreview.value = URL.createObjectURL(selected)
}

function onFileInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFileSelect(target.files[0])
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    handleFileSelect(event.dataTransfer.files[0])
  }
}

function removeFile() {
  file.value = null
  if (filePreview.value) {
    URL.revokeObjectURL(filePreview.value)
    filePreview.value = null
  }
  isVideo.value = false
}

async function handleSubmit() {
  if (!form.advertiser.trim()) {
    errorMessage.value = 'Pengiklan wajib diisi.'
    return
  }
  if (!form.description.trim()) {
    errorMessage.value = 'Deskripsi konten wajib diisi.'
    return
  }
  if (!file.value) {
    errorMessage.value = 'File media wajib diunggah.'
    return
  }
  if (form.useSchedule && (!form.startDate || !form.endDate)) {
    errorMessage.value = 'Tanggal mulai dan berakhir jadwal wajib diisi jika Atur Jadwal diaktifkan.'
    return
  }

  busy.value = true
  errorMessage.value = null

  try {
    const fd = new FormData()
    fd.append('advertiser', form.advertiser.trim())
    fd.append('description', form.description.trim())
    fd.append('spot', form.spot)
    fd.append('file', file.value)

    if (form.useSchedule) {
      if (form.startDate) fd.append('start_date', form.startDate)
      if (form.endDate) fd.append('end_date', form.endDate)
      if (form.startHour) fd.append('start_hour', form.startHour)
      if (form.endHour) fd.append('end_hour', form.endHour)
    }

    const created = await createAdvertisement(fd)
    emit('saved', created)
    emit('close')
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal mengunggah konten iklan.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AppModal
    :open="open"
    title="Tambah Konten"
    width="w-[900px]"
    :busy="busy"
    @close="$emit('close')"
  >
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Error Banner -->
      <div
        v-if="errorMessage"
        class="rounded-xl border border-danger bg-danger-soft p-4 text-sm font-semibold text-danger-strong"
      >
        {{ errorMessage }}
      </div>

      <!-- Pengiklan & Deskripsi -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Pengiklan <span class="text-danger">*</span>
          </label>
          <div class="relative">
            <input
              v-if="clients.length === 0"
              v-model="form.advertiser"
              type="text"
              placeholder="Masukkan nama pengiklan..."
              class="w-full rounded-xl border border-line bg-surface py-2.5 px-3.5 text-sm font-semibold text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
            <select
              v-else
              v-model="form.advertiser"
              class="w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pr-10 pl-3.5 text-sm font-semibold text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="" disabled>Pilih Pengiklan</option>
              <option v-for="c in clients" :key="c.id" :value="c.name">{{ c.name }}</option>
            </select>
            <span
              v-if="clients.length > 0"
              class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-subtle"
            >
              <AppIcon name="line-chevron-down" class="size-4" />
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
            Deskripsi Konten <span class="text-danger">*</span>
          </label>
          <input
            v-model="form.description"
            type="text"
            placeholder="Contoh: Promo Diskon Hari Kemerdekaan 50%"
            class="w-full rounded-xl border border-line bg-surface py-2.5 px-3.5 text-sm font-semibold text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
      </div>

      <!-- Posisi Spot Selector -->
      <div class="flex flex-col gap-2">
        <label class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
          Posisi Tayang <span class="text-danger">*</span>
        </label>
        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          <button
            v-for="s in SPOTS"
            :key="s.value"
            type="button"
            class="flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all"
            :class="
              form.spot === s.value
                ? 'border-primary bg-primary-soft text-primary font-bold ring-2 ring-primary/20 shadow-sm'
                : 'border-line bg-surface text-ink hover:border-line-strong'
            "
            @click="form.spot = s.value"
          >
            <span class="text-sm font-bold capitalize">{{ s.label }}</span>
            <span class="mt-1 text-[10px] text-ink-subtle">{{ s.desc }}</span>
          </button>
        </div>
      </div>

      <!-- Atur Jadwal Toggle & Fields -->
      <div class="rounded-2xl border border-line bg-surface-muted/30 p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-ink-heading">Atur Jadwal Tayang</span>
            <span class="text-xs text-ink-subtle">(Opsional - batasi periode atau jam tayang)</span>
          </div>

          <!-- Custom Toggle Switch -->
          <label class="relative inline-flex cursor-pointer items-center">
            <input v-model="form.useSchedule" type="checkbox" class="peer sr-only" />
            <div class="peer h-6 w-11 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:left-[2px] after:size-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus:outline-none" />
          </label>
        </div>

        <!-- Conditional Schedule Controls -->
        <div v-if="form.useSchedule" class="mt-4 space-y-4 pt-4 border-t border-line-soft">
          <!-- Attention Banner -->
          <div class="flex items-start gap-3 rounded-xl border border-warning-strong/30 bg-warning-soft/60 p-4 text-xs text-warning-strong">
            <AppIcon name="release-alert" class="size-5 shrink-0 mt-0.5 text-warning-strong" />
            <div>
              <p class="font-bold">PERHATIAN!</p>
              <p class="mt-0.5 text-ink-muted">
                Jadwal ini akan otomatis menonaktifkan konten saat periode berakhir atau di luar jam operasional yang ditentukan.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Start Date & Time -->
            <div class="space-y-2">
              <label class="text-xs font-semibold text-ink-subtle">Mulai Tayang</label>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model="form.startDate"
                  type="date"
                  class="rounded-xl border border-line bg-surface p-2 text-xs font-medium text-ink outline-none focus:border-primary"
                  required
                />
                <input
                  v-model="form.startHour"
                  type="time"
                  class="rounded-xl border border-line bg-surface p-2 text-xs font-medium text-ink outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <!-- End Date & Time -->
            <div class="space-y-2">
              <label class="text-xs font-semibold text-ink-subtle">Berakhir Tayang</label>
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model="form.endDate"
                  type="date"
                  class="rounded-xl border border-line bg-surface p-2 text-xs font-medium text-ink outline-none focus:border-primary"
                  required
                />
                <input
                  v-model="form.endHour"
                  type="time"
                  class="rounded-xl border border-line bg-surface p-2 text-xs font-medium text-ink outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- File Upload Box (Drag and Drop) -->
      <div class="flex flex-col gap-2">
        <label class="text-xs font-bold uppercase tracking-wider text-ink-subtle">
          Upload File Media <span class="text-danger">*</span>
        </label>

        <!-- Preview when file selected -->
        <div
          v-if="file && filePreview"
          class="relative flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-sm"
        >
          <div class="flex items-center gap-4">
            <div class="size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas">
              <video v-if="isVideo" :src="filePreview" class="size-full object-cover" muted />
              <img v-else :src="filePreview" alt="Preview" class="size-full object-cover" />
            </div>

            <div class="space-y-1">
              <p class="text-sm font-bold text-ink-heading">{{ file.name }}</p>
              <p class="text-xs text-ink-subtle">
                {{ (file.size / (1024 * 1024)).toFixed(2) }} MB • {{ isVideo ? 'Video MP4' : 'Gambar' }}
              </p>
              <span class="inline-flex rounded bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success-strong">
                Siap Diunggah
              </span>
            </div>
          </div>

          <button
            type="button"
            class="rounded-lg border border-line p-2 text-ink-subtle hover:bg-danger-soft hover:text-danger-strong transition"
            title="Hapus file"
            @click="removeFile"
          >
            <AppIcon name="close" class="size-5" />
          </button>
        </div>

        <!-- Dropzone area -->
        <div
          v-else
          class="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer"
          :class="
            isDragging
              ? 'border-primary bg-primary-soft/40'
              : 'border-line-strong bg-canvas hover:border-primary hover:bg-surface-muted/30'
          "
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
          @click="($refs.fileInput as HTMLInputElement)?.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4"
            class="hidden"
            @change="onFileInputChange"
          />

          <div class="flex size-14 items-center justify-center rounded-2xl bg-surface shadow-sm">
            <img :src="uploadIcon" alt="" class="size-7" />
          </div>

          <p class="mt-4 text-sm font-bold text-ink-heading">
            Tarik & Lepas file di sini, atau <span class="text-primary underline">Jelajahi</span>
          </p>
          <p class="mt-1 text-xs text-ink-subtle">
            Mendukung JPG, JPEG, PNG, MP4 (Maks. 50MB)
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 border-t border-line-soft pt-4">
        <AppButton variant="secondary" :disabled="busy" @click="$emit('close')">
          Batal
        </AppButton>
        <AppButton variant="primary" type="submit" :disabled="busy">
          {{ busy ? 'Mengunggah…' : 'Simpan Konten' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
