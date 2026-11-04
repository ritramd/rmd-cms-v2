<script setup lang="ts">
// Route orchestrator for /ganti-password (parity with rmd-cms/pages/ganti-password/index.vue)
// Figma: 1097:41893 & 1097:42038
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ChangePasswordModal from '@/components/profile/ChangePasswordModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppToast from '@/components/ui/AppToast.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const router = useRouter()
const showModal = ref(true)
const toastMessage = ref<string | null>(null)

function handleSuccess(message: string) {
  toastMessage.value = message
  setTimeout(() => {
    void router.push('/')
  }, 1200)
}

function handleClose() {
  showModal.value = false
  void router.push('/')
}
</script>

<template>
  <DashboardLayout title="Ganti Password" subtitle="Perbarui kata sandi akun Anda secara berkala demi keamanan">
    <div class="flex min-h-[500px] items-center justify-center">
      <div class="flex flex-col items-center gap-4 text-center">
        <p class="text-sm text-ink-muted">Dialog ganti password sedang aktif.</p>
        <AppButton variant="primary" @click="showModal = true">
          Buka Dialog Ganti Password
        </AppButton>
      </div>
    </div>

    <!-- Modal Dialog -->
    <ChangePasswordModal
      :open="showModal"
      @close="handleClose"
      @success="handleSuccess"
    />

    <!-- Toast Notification -->
    <AppToast v-model="toastMessage" variant="success" />
  </DashboardLayout>
</template>
