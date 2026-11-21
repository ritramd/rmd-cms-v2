<script setup lang="ts">
// Figma: "Menghapus User" confirmation dialog (1097:29379)
// Mirrored from rmd-cms v1 (pages/users/index.vue).
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { UserAndVending } from '@/types/user'

defineProps<{
  open: boolean
  busy?: boolean
  user: UserAndVending | null
}>()

defineEmits<{
  close: []
  confirm: [user: UserAndVending]
}>()
</script>

<template>
  <AppModal
    :open="open"
    title="Menghapus User"
    width="w-[540px]"
    :busy="busy"
    @close="$emit('close')"
  >
    <div v-if="user" class="space-y-5">
      <p class="font-inter text-sm text-ink-heading">
        Apakah kamu yakin menghapus user ini?
      </p>

      <!-- Warning Card from Figma 1097:29748 -->
      <div class="rounded-xl bg-[#ffedd5] p-4 text-[#334155] space-y-2 border border-orange-200">
        <div class="flex items-center gap-2">
          <AppIcon name="release-alert" class="size-4 shrink-0 text-orange-500" />
          <h4 class="font-inter text-sm font-bold text-orange-800">
            PERHATIAN!
          </h4>
        </div>
        <p class="font-inter text-xs/relaxed text-orange-950">
          Akun <span class="font-bold">{{ user.userName }} &lt;{{ user.email }}&gt;</span> yang akan dihapus tidak dapat dikembalikan. Semua data tidak dapat diakses kembali dan izin user untuk mengelola dan login ke dashboard ini dihilangkan selamanya juga.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-line-soft">
        <AppButton
          type="button"
          :disabled="busy"
          @click="$emit('close')"
        >
          Batalkan
        </AppButton>
        <AppButton
          type="button"
          variant="danger"
          :disabled="busy"
          @click="$emit('confirm', user)"
        >
          {{ busy ? 'Menghapus...' : 'Hapus User' }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
