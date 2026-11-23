<script setup lang="ts">
// Figma: 5.7-D-UI Material (1097:16416) Filter Bar
import AppIcon from '@/components/ui/AppIcon.vue'

withDefaults(
  defineProps<{
    startDate?: string
    endDate?: string
    showDateFilter?: boolean
  }>(),
  {
    startDate: '',
    endDate: '',
    showDateFilter: false,
  },
)

const emit = defineEmits<{
  'update:startDate': [value: string]
  'update:endDate': [value: string]
  applyFilter: []
  resetFilter: []
  addContent: []
  openEditor: []
}>()

function onInputClick(event: MouseEvent) {
  const el = event.target as HTMLInputElement
  el.showPicker?.()
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-6 w-full">
    <!-- Left Section: START DATE & END DATE (Hidden by default because backend GET /advertisements does not filter by date) -->
    <div v-if="showDateFilter" class="flex flex-wrap items-end gap-6">
      <!-- Start Date Field -->
      <div class="flex flex-col gap-1.5 w-full sm:w-[268px]">
        <label class="font-inter text-[12px] font-medium uppercase tracking-[0.3px] text-[#64748b]">
          Start Date
        </label>
        <div class="relative w-full">
          <input
            :value="startDate"
            type="date"
            placeholder="Select date"
            class="h-[44px] w-full rounded-[8px] border border-[#e2e8f0] bg-white pl-[41px] pr-3 font-inter text-[14px] text-[#0f172a] shadow-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            @input="emit('update:startDate', ($event.target as HTMLInputElement).value)"
            @click="onInputClick"
          />
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[14px] text-[#64748b]">
            <AppIcon name="calendar-outline" class="size-[15px] text-[#64748b]" />
          </div>
        </div>
      </div>

      <!-- End Date Field -->
      <div class="flex flex-col gap-1.5 w-full sm:w-[268px]">
        <label class="font-inter text-[12px] font-medium uppercase tracking-[0.3px] text-[#64748b]">
          End Date
        </label>
        <div class="relative w-full">
          <input
            :value="endDate"
            type="date"
            placeholder="Select date"
            class="h-[44px] w-full rounded-[8px] border border-[#e2e8f0] bg-white pl-[41px] pr-3 font-inter text-[14px] text-[#0f172a] shadow-xs outline-none transition focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            @input="emit('update:endDate', ($event.target as HTMLInputElement).value)"
            @click="onInputClick"
          />
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[14px] text-[#64748b]">
            <AppIcon name="calendar-outline" class="size-[15px] text-[#64748b]" />
          </div>
        </div>
      </div>
    </div>
    <div v-else />

    <!-- Right Section: Action Buttons -->
    <div class="flex flex-wrap items-center gap-4 ml-auto">
      <!-- Reset button (if either date is active) -->
      <button
        v-if="showDateFilter && (startDate || endDate)"
        type="button"
        class="h-[44px] px-3 font-inter text-[14px] font-medium text-[#64748b] hover:text-[#0f172a] transition cursor-pointer"
        title="Reset tanggal"
        @click="emit('resetFilter')"
      >
        Reset
      </button>

      <!-- UI Editor Button -->
      <button
        type="button"
        class="flex h-[44px] items-center justify-center gap-2 rounded-[8px] border border-[#e2e8f0] bg-white px-5 font-inter text-[14px] font-medium text-[#334155] shadow-xs transition hover:bg-[#f8fafc] cursor-pointer"
        @click="emit('openEditor')"
      >
        <AppIcon name="devices" class="size-[18px] text-[#64748b]" />
        <span>UI Editor</span>
      </button>

      <!-- Apply Filter Button (Hidden because backend has no date filter endpoint and legacy CMS does not have this button) -->
      <button
        v-if="showDateFilter"
        type="button"
        class="flex h-[44px] items-center justify-center gap-2 rounded-[8px] bg-[#1e293b] px-6 font-inter text-[14px] font-medium text-white shadow-xs transition hover:bg-[#0f172a] cursor-pointer"
        @click="emit('applyFilter')"
      >
        <AppIcon name="filter-funnel" class="size-[14px] text-white" />
        <span>Apply Filter</span>
      </button>

      <!-- Tambah Button (Blue button matching Figma 1097:16495) -->
      <button
        type="button"
        class="flex h-[44px] items-center justify-center gap-2 rounded-[8px] border border-[#e2e8f0] bg-[#5f93ec] px-6 font-inter text-[14px] font-medium text-white shadow-xs transition hover:bg-[#4b7ecc] cursor-pointer"
        @click="emit('addContent')"
      >
        <AppIcon name="add" class="size-[18px] text-white" />
        <span>Tambah</span>
      </button>
    </div>
  </div>
</template>
