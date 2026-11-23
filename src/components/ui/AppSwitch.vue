<script setup lang="ts">
// On/off switch for settings (replaces v1's el-switch). Not in Figma; uses the primary color tokens.
defineProps<{
  /** Accessible name; the visible label usually sits next to the switch. */
  label: string
  disabled?: boolean
}>()

const checked = defineModel<boolean>({ required: true })
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="checked"
    :aria-label="label"
    :disabled="disabled"
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
    :class="checked ? 'bg-primary' : 'bg-line-strong'"
    @click="checked = !checked"
  >
    <span
      class="inline-block size-5 rounded-full bg-white shadow-hairline transition-transform"
      :class="checked ? 'translate-x-[22px]' : 'translate-x-0.5'"
    />
  </button>
</template>
