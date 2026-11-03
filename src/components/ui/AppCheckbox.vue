<script setup lang="ts">
// Figma: row checkbox on Penjualan (1097:20308) — 16px, white, slate border. Checked state isn't in the design.
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
      class="peer size-4 cursor-pointer appearance-none rounded border border-line-strong bg-surface transition-colors checked:border-link checked:bg-link indeterminate:border-link indeterminate:bg-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
    />
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="pointer-events-none absolute inset-0 hidden peer-checked:block peer-indeterminate:block"
      aria-hidden="true"
    >
      <path v-if="indeterminate" d="M4.5 8h7" />
      <path v-else d="M4.5 8.5l2.25 2.25L11.5 5.5" />
    </svg>
  </span>
</template>
