<script setup lang="ts">
// Color picker with its hex value next to it (replaces v1's el-color-picker).
import { fieldClass, fieldStateClass } from '@/components/products/formStyles'

defineProps<{
  label: string
  invalid?: boolean
}>()

const color = defineModel<string>({ required: true })

/** Accepts typed "#RRGGBB"; ignores anything else so the picker always has a valid value. */
function onHexInput(event: Event) {
  const value = (event.target as HTMLInputElement).value.trim()
  if (/^#[0-9a-f]{6}$/i.test(value)) color.value = value.toUpperCase()
}
</script>

<template>
  <span class="flex items-center gap-2">
    <input
      v-model="color"
      type="color"
      :aria-label="`${label} (pemilih warna)`"
      class="size-8 shrink-0 cursor-pointer rounded-lg border border-line bg-surface-muted p-0.5"
    />
    <input
      :value="color"
      type="text"
      maxlength="7"
      :aria-label="`${label} (kode hex)`"
      :class="[fieldClass, fieldStateClass(!!invalid), 'font-mono uppercase']"
      @change="onHexInput"
    />
  </span>
</template>
