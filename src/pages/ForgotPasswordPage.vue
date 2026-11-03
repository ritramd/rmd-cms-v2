<script setup lang="ts">
// Figma: 0.5-D-Reset Pass (1097:13751)
import { ref } from 'vue'
import AuthButton from '@/components/auth/AuthButton.vue'
import AuthField from '@/components/auth/AuthField.vue'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AppToast from '@/components/ui/AppToast.vue'
import { AuthError, requestPasswordReset } from '@/services/auth'
import { isValidEmail } from '@/utils/validation'

const email = ref('')
const invalid = ref(false)
const submitting = ref(false)
const toast = ref<string | null>(null)
const toastVariant = ref<'error' | 'success'>('success')

function showToast(variant: 'error' | 'success', message: string) {
  toastVariant.value = variant
  toast.value = message
}

async function submit() {
  const error = !email.value ? 'Email wajib diisi.' : !isValidEmail(email.value) ? 'Format email tidak valid.' : null
  if (error) {
    invalid.value = true
    showToast('error', error)
    return
  }

  submitting.value = true
  toast.value = null
  try {
    await requestPasswordReset(email.value)
    email.value = ''
    showToast('success', 'Jika Email benar, link reset password akan terkirim ke email tersebut.')
  } catch (err) {
    showToast('error', err instanceof AuthError ? err.message : String(err))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthLayout title="Masukkan email Anda untuk menerima link reset password">
    <form class="flex w-full max-w-[360px] flex-col items-center gap-4" novalidate @submit.prevent="submit">
      <AuthField
        v-model="email"
        label="Email*"
        type="email"
        placeholder="user@email.com"
        autocomplete="email"
        :invalid="invalid"
        @update:model-value="invalid = false"
      />
      <AuthButton :loading="submitting">Reset Password</AuthButton>
      <RouterLink to="/login" class="text-sm font-medium text-ink-strong underline hover:text-primary-hover">
        ← Kembali ke Halaman Login
      </RouterLink>
    </form>
  </AuthLayout>
  <AppToast v-model="toast" :variant="toastVariant" />
</template>
