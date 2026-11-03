<script setup lang="ts">
// Figma: 0.2-D-Login (1097:12965)
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthButton from '@/components/auth/AuthButton.vue'
import AuthField from '@/components/auth/AuthField.vue'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import AppToast from '@/components/ui/AppToast.vue'
import { AuthError, login, saveSession } from '@/services/auth'
import { isValidEmail } from '@/utils/validation'

const router = useRouter()
const route = useRoute()

/** Page the auth guard sent us from; only same-app paths are accepted. */
function redirectTarget(): string {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/'
}

const form = reactive({ email: '', password: '' })
const invalid = reactive({ email: false, password: false })
const submitting = ref(false)
const toast = ref<string | null>(null)

/** Same rules as v1. Marks invalid fields and returns the first message, or null when valid. */
function validate(): string | null {
  const emailError = !form.email
    ? 'Email wajib diisi.'
    : !isValidEmail(form.email)
      ? 'Format email tidak valid.'
      : null
  const passwordError = !form.password
    ? 'Password wajib diisi.'
    : form.password.length < 6
      ? 'Password minimal 6 karakter.'
      : null

  invalid.email = emailError !== null
  invalid.password = passwordError !== null
  return emailError ?? passwordError
}

async function submit() {
  const error = validate()
  if (error) {
    toast.value = error
    return
  }

  submitting.value = true
  toast.value = null
  try {
    saveSession(await login(form))
    await router.push(redirectTarget())
  } catch (err) {
    invalid.email = invalid.password = true
    toast.value = err instanceof AuthError ? err.message : String(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthLayout title="Selamat Datang di Cloud Management System">
    <form class="flex w-full max-w-[360px] flex-col items-center gap-4" novalidate @submit.prevent="submit">
      <AuthField
        v-model="form.email"
        label="Email*"
        type="email"
        placeholder="user@email.com"
        autocomplete="email"
        :invalid="invalid.email"
        @update:model-value="invalid.email = false"
      />
      <AuthField
        v-model="form.password"
        label="Password*"
        type="password"
        placeholder="Masukkan Password"
        autocomplete="current-password"
        :invalid="invalid.password"
        @update:model-value="invalid.password = false"
      />
      <RouterLink to="/lupa-password" class="text-sm font-medium text-ink-strong underline hover:text-primary-hover">
        Lupa Password?
      </RouterLink>
      <AuthButton :loading="submitting">Masuk</AuthButton>
    </form>
  </AuthLayout>
  <AppToast v-model="toast" />
</template>
