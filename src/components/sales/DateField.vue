<script setup lang="ts">
// Figma: Start Date / End Date fields on Penjualan (1097:20254, 1097:20265).
import { useId } from 'vue'
import calendarIcon from '@/assets/sales/calendar.svg'

defineProps<{
  label: string
  min?: string
  max?: string
}>()

/** YYYY-MM-DD, or '' when empty. */
const value = defineModel<string>({ default: '' })
const id = useId()

// The native picker indicator is hidden (the design puts the calendar on the left), so the whole field opens it.
function openPicker(event: MouseEvent) {
  ;(event.currentTarget as HTMLInputElement).showPicker?.()
}
</script>

<template>
  <div class="flex w-full flex-col gap-1.5 font-inter sm:w-auto sm:min-w-40 sm:flex-[0_1_268px]">
    <!-- 268px in Figma; may shrink a little when it shares a row with other filters. -->
    <label :for="id" class="text-xs font-medium tracking-[0.3px] text-ink-muted uppercase">{{ label }}</label>
    <div class="relative">
      <img :src="calendarIcon" alt="" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
      <input
        :id="id"
        v-model="value"
        type="date"
        :min="min"
        :max="max"
        class="peer h-[45px] w-full cursor-pointer rounded-lg border border-cta-border bg-surface pr-4 pl-10 text-sm shadow-[0_1px_2px_rgb(0_0_0/0.05)] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-webkit-calendar-picker-indicator]:hidden"
        :class="value ? 'text-ink-heading' : 'text-transparent focus:text-ink-placeholder'"
        @click="openPicker"
      />
      <!-- Date inputs have no placeholder; this stands in for the browser's dd/mm/yyyy until the field is used. -->
      <span
        v-if="!value"
        class="pointer-events-none absolute top-1/2 left-10 -translate-y-1/2 text-sm text-ink-placeholder peer-focus:hidden"
      >
        Select date
      </span>
    </div>
  </div>
</template>
