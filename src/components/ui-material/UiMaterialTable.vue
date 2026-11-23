<script setup lang="ts">
// Figma: 5.7-D-UI Material (1097:16416, 1097:16514) Table
import { computed } from 'vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import UiMaterialRow from './UiMaterialRow.vue'
import type { Advertisement } from '@/types/advertisement'

const props = defineProps<{
  items: Advertisement[]
  selectedIds: number[]
  loading?: boolean
}>()

const emit = defineEmits<{
  toggleSelectAll: []
  toggleSelect: [id: number]
  previewMedia: [ad: Advertisement]
  apply: [ad: Advertisement]
  delete: [ad: Advertisement]
}>()

const allSelected = computed(() => {
  return props.items.length > 0 && props.selectedIds.length === props.items.length
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left font-inter border-collapse min-w-[1000px]">
      <thead class="border-b border-[#f1f5f9]">
        <tr class="text-[12px] font-semibold uppercase tracking-[0.6px] text-[#94a3b8]">
          <th scope="col" class="w-[64px] px-[24px] py-[16px] text-center">
            <AppCheckbox
              :model-value="allSelected"
              label="Pilih semua konten"
              :disabled="items.length === 0"
              @update:model-value="emit('toggleSelectAll')"
            />
          </th>
          <th scope="col" class="w-[84px] px-[24px] py-[16px] text-left">No</th>
          <th scope="col" class="min-w-[160px] px-[24px] py-[16px] text-left">Advertiser</th>
          <th scope="col" class="min-w-[160px] px-[24px] py-[16px] text-left">Deskripsi</th>
          <th scope="col" class="min-w-[140px] px-[24px] py-[16px] text-left">POSISI</th>
          <th scope="col" class="w-[200px] px-[24px] py-[16px] text-center">PRATINJAU</th>
          <th scope="col" class="min-w-[140px] px-[24px] py-[16px] text-right">Dibuat Pada</th>
          <th scope="col" class="min-w-[140px] px-[24px] py-[16px] text-center">Daftar VM</th>
          <th scope="col" class="min-w-[120px] px-[24px] py-[16px] text-right">Jadwal</th>
          <th scope="col" class="w-[140px] px-[24px] py-[16px] text-right">Action</th>
        </tr>
      </thead>

      <tbody v-if="loading" class="divide-y divide-[#f1f5f9]">
        <tr v-for="i in 5" :key="i" class="animate-pulse">
          <td colspan="10" class="px-[24px] py-[16px]">
            <div class="h-6 w-full rounded bg-[#f1f5f9]" />
          </td>
        </tr>
      </tbody>

      <tbody v-else-if="items.length === 0">
        <tr>
          <td colspan="10" class="py-16 px-4 text-center">
            <p class="text-base font-semibold text-[#0f172a]">Tidak ada data UI Material</p>
            <p class="mt-1 text-sm text-[#64748b]">Belum ada konten iklan atau tidak ada data yang cocok dengan rentang tanggal.</p>
          </td>
        </tr>
      </tbody>

      <tbody v-else class="divide-y divide-[#f1f5f9]">
        <UiMaterialRow
          v-for="(item, idx) in items"
          :key="item.id"
          :ad="item"
          :index="idx + 1"
          :selected="selectedIds.includes(item.id)"
          @toggle-select="emit('toggleSelect', $event)"
          @preview-media="emit('previewMedia', $event)"
          @apply="emit('apply', $event)"
          @delete="emit('delete', $event)"
        />
      </tbody>
    </table>
  </div>
</template>
