<script setup lang="ts">
// Figma: 5.7-D-UI Material (1097:16416, 1097:16536) Table Row
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { Advertisement } from '@/types/advertisement'

const props = defineProps<{
  ad: Advertisement
  index: number
  selected: boolean
}>()

const emit = defineEmits<{
  toggleSelect: [id: number]
  previewMedia: [ad: Advertisement]
  apply: [ad: Advertisement]
  delete: [ad: Advertisement]
}>()

function isVideoFile(url: string, type?: string): boolean {
  if (type?.includes('video')) return true
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')
}

function formatSchedule(ad: Advertisement): string {
  const hasTime = ad.start_hour && ad.end_hour
  const hasDate = ad.start_date && ad.end_date

  if (!hasTime && !hasDate) {
    return '-'
  }

  if (hasTime && hasDate) {
    return `${ad.start_hour} - ${ad.end_hour}`
  }

  if (hasTime) return `${ad.start_hour} - ${ad.end_hour}`
  return `${ad.start_date} s/d ${ad.end_date}`
}
</script>

<template>
  <tr
    class="border-b border-[#f1f5f9] transition-colors hover:bg-[#f8fafc]"
    :class="selected ? 'bg-[#6495ed]/5' : ''"
  >
    <!-- Checkbox selection -->
    <td class="w-[64px] px-[24px] py-[16px] text-center">
      <AppCheckbox
        :model-value="selected"
        :label="`Pilih konten ${ad.advertiser}`"
        @update:model-value="emit('toggleSelect', ad.id)"
      />
    </td>

    <!-- Index Number -->
    <td class="w-[84px] px-[24px] py-[16px] text-left font-inter text-[14px] text-[#64748b]">
      {{ index }}
    </td>

    <!-- Advertiser -->
    <td class="min-w-[160px] px-[24px] py-[16px] text-left font-inter text-[14px] text-[#0f172a]">
      <span class="line-clamp-1" :title="ad.advertiser">
        {{ ad.advertiser }}
      </span>
    </td>

    <!-- Deskripsi -->
    <td class="min-w-[160px] px-[24px] py-[16px] text-left font-inter text-[14px] text-[#0f172a]">
      <p class="line-clamp-2" :title="ad.description">
        {{ ad.description }}
      </p>
    </td>

    <!-- POSISI -->
    <td class="min-w-[140px] px-[24px] py-[16px] text-left font-inter text-[14px] text-[#0f172a] capitalize">
      {{ ad.spot }}
    </td>

    <!-- PRATINJAU (Media Thumbnail) -->
    <td class="w-[200px] py-[16px] text-center">
      <div class="flex items-center justify-center">
        <div
          class="group relative flex h-[70px] w-[90px] cursor-pointer items-center justify-center overflow-hidden rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] transition-all hover:ring-2 hover:ring-[#5f93ec]"
          title="Klik untuk melihat media"
          @click="emit('previewMedia', ad)"
        >
          <template v-if="isVideoFile(ad.file, ad.file_type)">
            <video :src="ad.file" class="size-full object-cover" muted preload="metadata" />
            <div class="absolute inset-0 flex items-center justify-center bg-black/40 text-white transition group-hover:bg-black/20">
              <span class="rounded bg-black/60 px-1 text-[10px] font-bold uppercase">MP4</span>
            </div>
          </template>
          <template v-else>
            <img :src="ad.file" :alt="ad.description" class="size-full object-cover" loading="lazy" />
            <div class="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
              <AppIcon name="eye" class="size-4 drop-shadow" />
            </div>
          </template>
        </div>
      </div>
    </td>

    <!-- Dibuat Pada -->
    <td class="min-w-[140px] px-[24px] py-[16px] text-right font-inter text-[14px] text-[#0f172a]">
      {{ ad.created_at ? ad.created_at.split(' ')[0] : '-' }}
    </td>

    <!-- Daftar VM -->
    <td class="min-w-[140px] px-[24px] py-[16px] text-center">
      <div v-if="ad.vmcode && ad.vmcode.length > 0" class="flex flex-col items-center justify-center gap-1.5">
        <span
          v-for="code in ad.vmcode.slice(0, 2)"
          :key="code"
          class="inline-flex items-center justify-center rounded-[16px] bg-[#f7f9fc] px-4 py-1 font-inter text-[14px] text-[#0f172a] whitespace-nowrap"
        >
          {{ code }}
        </span>
        <span
          v-if="ad.vmcode.length > 2"
          class="text-[12px] font-medium text-[#5f93ec]"
          :title="ad.vmcode.slice(2).join(', ')"
        >
          +{{ ad.vmcode.length - 2 }} lainnya
        </span>
      </div>
      <span v-else class="font-inter text-[14px] text-[#64748b]">
        -
      </span>
    </td>

    <!-- Jadwal -->
    <td class="min-w-[120px] px-[24px] py-[16px] text-right font-inter text-[14px] text-[#0f172a]">
      {{ formatSchedule(ad) }}
    </td>

    <!-- Action -->
    <td class="w-[140px] px-[24px] py-[16px] text-right">
      <div class="flex items-center justify-end gap-2">
        <!-- Edit / Terapkan button -->
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-[12px] bg-[#f7f9fc] text-[#64748b] drop-shadow-xs transition hover:bg-[#edf2f7] hover:text-[#5f93ec] cursor-pointer"
          title="Terapkan ke mesin / Ubah jadwal"
          @click="emit('apply', ad)"
        >
          <AppIcon name="tabler-edit" class="size-4" />
        </button>

        <!-- Delete button -->
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-[12px] bg-[#f7f9fc] text-[#64748b] drop-shadow-xs transition hover:bg-danger-soft hover:text-danger-strong cursor-pointer"
          title="Hapus konten"
          @click="emit('delete', ad)"
        >
          <AppIcon name="line-trash" class="size-4" />
        </button>
      </div>
    </td>
  </tr>
</template>
