<script setup lang="ts">
// Figma: login form field (1097:13179 / 1097:13198)
import { useId } from 'vue'

defineProps<{
  label: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autocomplete?: string
  invalid?: boolean
}>()

const value = defineModel<string>({ required: true })
const id = useId()
</script>

<template>
  <div class="flex w-full flex-col gap-1">
    <label :for="id" class="font-inter text-sm font-bold text-ink-subtle uppercase">{{ label }}</label>
    <input
      :id="id"
      v-model="value"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="invalid || undefined"
      class="w-full rounded-lg border bg-surface-muted px-[13px] py-2 font-inter text-sm font-semibold text-ink-strong outline-none placeholder:text-ink-subtle focus:ring-2"
      :class="invalid ? 'border-input-error focus:ring-input-error/20' : 'border-line focus:border-primary focus:ring-primary/20'"
    />
  </div>
</template>
