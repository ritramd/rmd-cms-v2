<script setup lang="ts">
// One on/off setting: label and hint on the left, switch on the right.
import AppSwitch from '@/components/ui/AppSwitch.vue'

defineProps<{
  label: string
  hint?: string
  /** Read-only for this user (v1: editable by dev only). */
  locked?: boolean
}>()

const checked = defineModel<boolean>({ required: true })
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-3">
    <span class="flex min-w-0 flex-col gap-0.5">
      <span class="flex items-center gap-2 text-sm font-medium text-ink-strong">
        {{ label }}
        <span v-if="locked" class="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-ink-subtle">
          Khusus dev
        </span>
      </span>
      <span v-if="hint" class="text-xs text-ink-muted">{{ hint }}</span>
    </span>
    <AppSwitch v-model="checked" :label="label" :disabled="locked" />
  </div>
</template>
