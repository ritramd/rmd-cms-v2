<script setup lang="ts" generic="T extends string">
// Labelled dropdown for the log filter rows, styled like DateField (Figma 1097:20254).
import { useId } from 'vue'

defineProps<{
  label: string
  options: { label: string; value: T | '' }[]
}>()

const value = defineModel<T | ''>({ required: true })
const id = useId()
</script>

<template>
  <div class="flex w-full flex-col gap-1.5 font-inter sm:w-auto sm:min-w-36 sm:flex-[0_1_200px]">
    <label :for="id" class="text-xs font-medium tracking-[0.3px] text-ink-muted uppercase">{{ label }}</label>
    <select
      :id="id"
      v-model="value"
      class="h-[45px] w-full cursor-pointer rounded-lg border border-cta-border bg-surface px-3 text-sm text-ink-heading shadow-[0_1px_2px_rgb(0_0_0/0.05)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
  </div>
</template>
