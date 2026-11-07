<script setup lang="ts">
// Assigned machines list popup for a user
// Mirrored from legacy rmd-cms (showVendingMachines dialog in pages/users/index.vue).
import { computed, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { UserAndVending } from '@/types/user'

const props = defineProps<{
  open: boolean
  user: UserAndVending | null
}>()

defineEmits<{
  close: []
}>()

const search = ref('')

const machines = computed(() => {
  const list = props.user?.vendingMachineNames ?? []
  if (!search.value.trim()) return list
  const q = search.value.toLowerCase()
  return list.filter((m) => m && m.toLowerCase().includes(q))
})
</script>

<template>
  <AppModal
    :open="open"
    :title="`Mesin Dikelola (${user?.vendingMachineNames?.length ?? 0})`"
    width="w-[500px]"
    @close="$emit('close')"
  >
    <div v-if="user" class="space-y-4">
      <p class="text-xs text-ink-muted">
        Daftar mesin vending yang ditugaskan kepada <span class="font-semibold text-ink-heading">{{ user.userName }}</span>:
      </p>

      <!-- Search Input -->
      <div class="relative">
        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-placeholder">
          <AppIcon name="search" class="size-4" />
        </span>
        <input
          v-model="search"
          type="text"
          placeholder="Cari nama mesin..."
          class="w-full rounded-lg border border-line bg-surface pl-9 pr-3.5 py-2 text-sm text-ink-strong shadow-xs placeholder:text-ink-placeholder focus:border-brand focus:outline-none"
        />
      </div>

      <!-- List -->
      <div class="max-h-64 overflow-y-auto rounded-lg border border-line-soft divide-y divide-line-soft">
        <div
          v-for="(machine, index) in machines"
          :key="index"
          class="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-strong hover:bg-surface-muted/30"
        >
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-ink-muted">
            {{ index + 1 }}
          </span>
          <span class="truncate">{{ machine }}</span>
        </div>
        <div v-if="machines.length === 0" class="py-6 text-center text-xs text-ink-muted">
          Tidak ada mesin yang cocok.
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end pt-2 border-t border-line-soft">
        <AppButton @click="$emit('close')">
          Tutup
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
