<script setup lang="ts">
// Figma: "Show 10 entries" above tables (1097:20293, 1097:27516, 1097:33490).
withDefaults(defineProps<{ sizes?: number[] }>(), { sizes: () => [10, 25, 50, 100] })

const pageSize = defineModel<number>({ required: true })
</script>

<template>
  <label class="flex items-center gap-2 font-inter text-sm text-[#64748b]">
    Show
    <span class="relative inline-flex items-center">
      <select
        v-model.number="pageSize"
        class="h-[30px] min-w-[50px] cursor-pointer appearance-none rounded-md border border-[#e2e8f0] bg-surface pl-2.5 pr-6 text-xs font-medium text-[#334155] shadow-xs outline-none transition focus:border-primary"
      >
        <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
      </select>
      <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#64748b]">
        <svg class="size-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </span>
    entries
  </label>
</template>
