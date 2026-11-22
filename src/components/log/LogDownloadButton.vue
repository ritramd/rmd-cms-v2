<script setup lang="ts">
// "Download" call to action of the Penjualan headers (1097:20239), for the log pages.
import downloadIcon from '@/assets/sales/download.svg'

defineProps<{
  busy?: boolean
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center gap-2 rounded-lg border border-cta-border bg-cta px-[25px] py-[11px] font-inter text-sm font-medium whitespace-nowrap text-white shadow-hairline transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70"
    :disabled="busy"
    @click="$emit('click')"
  >
    <img :src="downloadIcon" alt="" />
    {{ busy ? 'Mengunduh…' : 'Download' }}
  </button>
</template>
