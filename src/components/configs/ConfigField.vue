<script setup lang="ts">
// Label, control (default slot), "dev only" marker and error message of one config field.
import { fieldLabelClass } from '@/components/products/formStyles'

defineProps<{
  label: string
  /** Shown under the label when set. */
  error?: string
  /** The field is read-only for this user (v1: editable by dev only). */
  locked?: boolean
}>()
</script>

<template>
  <label class="flex flex-col gap-1.5">
    <span class="flex items-center gap-2">
      <span :class="fieldLabelClass">{{ label }}</span>
      <span v-if="locked" class="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold text-ink-subtle">
        Hanya dev
      </span>
    </span>
    <slot />
    <span v-if="error" role="alert" class="text-xs text-danger-strong">{{ error }}</span>
  </label>
</template>
