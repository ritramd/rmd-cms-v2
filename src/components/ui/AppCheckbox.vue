<script setup lang="ts">
// Figma: row checkbox on Penjualan (1097:20308) — 16px, white, slate border; checked state from Stok Vending
// (1097:23235, "check" 249:6070). Indeterminate isn't in the design and uses the same blue with a dash.
import checkedIcon from '@/assets/form/checkbox-checked.svg'

defineProps<{
  label: string
  indeterminate?: boolean
}>()

const checked = defineModel<boolean>({ default: false })
</script>

<template>
  <span class="relative inline-flex size-4 shrink-0">
    <input
      v-model="checked"
      type="checkbox"
      :aria-label="label"
      :indeterminate="indeterminate"
      class="peer size-4 cursor-pointer appearance-none rounded border border-line-strong bg-surface transition-colors indeterminate:border-primary-hover indeterminate:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-hover"
    />
    <img
      :src="checkedIcon"
      alt=""
      class="pointer-events-none absolute inset-0 hidden peer-checked:block peer-indeterminate:hidden"
    />
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      class="pointer-events-none absolute inset-0 hidden peer-indeterminate:block"
      aria-hidden="true"
    >
      <path d="M4.5 8h7" />
    </svg>
  </span>
</template>
