<script setup lang="ts">
// Confirmation for destructive actions (replaces v1's SweetAlert prompts), on the AppModal shell.
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    busy?: boolean
    /** Shown inside the dialog when the action failed. */
    error?: string | null
  }>(),
  { confirmLabel: 'Ya, Hapus', cancelLabel: 'Batal' },
)

defineEmits<{
  confirm: []
  close: []
}>()
</script>

<template>
  <AppModal :open="open" :title="title" :busy="busy" width="w-[480px]" @close="$emit('close')">
    <p class="text-sm text-ink">{{ message }}</p>
    <p v-if="error" role="alert" class="text-sm text-danger-strong">{{ error }}</p>
    <div class="flex justify-end gap-3">
      <AppButton :disabled="busy" @click="$emit('close')">{{ cancelLabel }}</AppButton>
      <AppButton variant="danger" :disabled="busy" data-autofocus @click="$emit('confirm')">
        {{ busy ? 'Memproses…' : confirmLabel }}
      </AppButton>
    </div>
  </AppModal>
</template>
