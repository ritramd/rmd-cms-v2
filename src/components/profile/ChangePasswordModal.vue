<script setup lang="ts">
// Figma: Ganti Password Dialog (1097:41893 masked, 1097:42038 unmasked)
// Legacy parity: rmd-cms/pages/ganti-password/index.vue and rmd-api-cms /change-pwd
import { ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import { ApiError } from '@/services/api'
import { changePassword } from '@/services/user'

const props = withDefaults(
  defineProps<{
    open: boolean
  }>(),
  { open: false },
)

const emit = defineEmits<{
  close: []
  success: [message: string]
}>()

// Form fields
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Password visibility toggles
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

// State
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

// Reset form when modal opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      oldPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      showOld.value = false
      showNew.value = false
      showConfirm.value = false
      errorMessage.value = null
      submitting.value = false
    }
  },
)

async function handleSubmit() {
  errorMessage.value = null

  if (!oldPassword.value.trim()) {
    errorMessage.value = 'Password lama wajib diisi.'
    return
  }
  if (!newPassword.value.trim()) {
    errorMessage.value = 'Password baru wajib diisi.'
    return
  }
  if (!confirmPassword.value.trim()) {
    errorMessage.value = 'Konfirmasi password baru wajib diisi.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Password tidak sama, silakan coba lagi.'
    return
  }
  if (newPassword.value.length < 6) {
    errorMessage.value = 'Password baru minimal 6 karakter.'
    return
  }

  submitting.value = true
  try {
    const resp = await changePassword({
      pwd: newPassword.value,
      retype_pwd: confirmPassword.value,
      old_pwd: oldPassword.value,
    })
    emit('success', resp.message || 'Password berhasil diubah!')
    emit('close')
  } catch (err) {
    errorMessage.value =
      err instanceof ApiError || err instanceof Error
        ? err.message
        : 'Gagal mengubah password. Silakan coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppModal
    :open="open"
    title="Ganti Password"
    width="w-[520px]"
    :busy="submitting"
    @close="$emit('close')"
  >
    <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" role="alert" class="rounded-lg bg-danger-soft p-3 text-xs font-medium text-danger-strong">
        {{ errorMessage }}
      </div>

      <!-- Password Lama -->
      <div class="flex flex-col gap-1.5">
        <label for="old-pwd" class="text-xs font-bold uppercase tracking-[1.2px] text-ink-subtle">
          Password Lama
        </label>
        <div class="relative flex items-center rounded-lg border border-line bg-surface transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <input
            id="old-pwd"
            v-model="oldPassword"
            :type="showOld ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Masukkan password lama"
            class="w-full bg-transparent px-3.5 py-2.5 text-xs font-medium text-ink-strong outline-none placeholder:text-ink-subtle"
          />
          <button
            type="button"
            class="flex size-9 shrink-0 items-center justify-center p-2 text-ink-subtle transition hover:text-ink cursor-pointer"
            :aria-label="showOld ? 'Sembunyikan password' : 'Lihat password'"
            @click="showOld = !showOld"
          >
            <AppIcon :name="showOld ? 'eye-off' : 'eye'" class="size-4" />
          </button>
        </div>
      </div>

      <!-- Divider line matching Figma 1097:41939 -->
      <div class="h-px w-full bg-line-soft" />

      <!-- Password Baru -->
      <div class="flex flex-col gap-1.5">
        <label for="new-pwd" class="text-xs font-bold uppercase tracking-[1.2px] text-ink-subtle">
          Password Baru
        </label>
        <div class="relative flex items-center rounded-lg border border-line bg-surface transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <input
            id="new-pwd"
            v-model="newPassword"
            :type="showNew ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Masukkan password baru"
            class="w-full bg-transparent px-3.5 py-2.5 text-xs font-medium text-ink-strong outline-none placeholder:text-ink-subtle"
          />
          <button
            type="button"
            class="flex size-9 shrink-0 items-center justify-center p-2 text-ink-subtle transition hover:text-ink cursor-pointer"
            :aria-label="showNew ? 'Sembunyikan password' : 'Lihat password'"
            @click="showNew = !showNew"
          >
            <AppIcon :name="showNew ? 'eye-off' : 'eye'" class="size-4" />
          </button>
        </div>
      </div>

      <!-- Ulangi Password Baru -->
      <div class="flex flex-col gap-1.5">
        <label for="confirm-pwd" class="text-xs font-bold uppercase tracking-[1.2px] text-ink-subtle">
          Ulangi Password Baru
        </label>
        <div class="relative flex items-center rounded-lg border border-line bg-surface transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <input
            id="confirm-pwd"
            v-model="confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Ulangi password baru"
            class="w-full bg-transparent px-3.5 py-2.5 text-xs font-medium text-ink-strong outline-none placeholder:text-ink-subtle"
          />
          <button
            type="button"
            class="flex size-9 shrink-0 items-center justify-center p-2 text-ink-subtle transition hover:text-ink cursor-pointer"
            :aria-label="showConfirm ? 'Sembunyikan password' : 'Lihat password'"
            @click="showConfirm = !showConfirm"
          >
            <AppIcon :name="showConfirm ? 'eye-off' : 'eye'" class="size-4" />
          </button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          class="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-muted shadow-xs transition hover:bg-surface-muted cursor-pointer"
          :disabled="submitting"
          @click="$emit('close')"
        >
          Batal
        </button>
        <button
          type="submit"
          class="rounded-xl bg-[#6495ed] px-4 py-2.5 text-sm font-bold text-white shadow-primary transition hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
          :disabled="submitting"
        >
          {{ submitting ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </form>
  </AppModal>
</template>
