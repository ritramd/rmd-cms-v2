<script setup lang="ts">
// Figma: 3.2-D-Penjualan-Vending Sales (1097:20490)
// Download confirmation dialog warning user that sales data is limited to the last 30 days.
import { nextTick, onMounted, ref, useId, watch } from 'vue'
import closeIcon from '@/assets/form/close.svg'
import releaseAlertIcon from '@/assets/icons/release-alert.svg'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    targetName?: string
    busy?: boolean
  }>(),
  {
    title: 'Mengunduh Daftar Mesin Vending',
    targetName: 'Daftar Mesin Vending',
    busy: false,
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const titleId = useId()

function requestClose() {
  if (!props.busy) emit('close')
}

function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value) requestClose()
}

function onDialogCancel(event: Event) {
  event.preventDefault()
  requestClose()
}

async function sync(open: boolean) {
  if (open && !dialog.value?.open) {
    dialog.value?.showModal()
    await nextTick()
    const target = panel.value?.querySelector<HTMLElement>('[data-autofocus]')
    target?.focus()
  } else if (!open && dialog.value?.open) {
    dialog.value.close()
  }
}

watch(() => props.open, sync)
onMounted(() => {
  void sync(props.open)
})
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-visible rounded-2xl bg-transparent p-0 backdrop:bg-black/60 focus:outline-none"
    :aria-labelledby="titleId"
    @click="onDialogClick"
    @cancel="onDialogCancel"
  >
    <div
      ref="panel"
      class="flex max-h-[calc(100vh-2.5rem)] w-[900px] max-w-[calc(100vw-2rem)] flex-col gap-4 rounded-2xl bg-surface p-5 shadow-2xl"
    >
      <!-- Header: Title & Close Button -->
      <div class="flex items-center justify-between gap-4">
        <h2 :id="titleId" class="text-2xl font-bold font-sans text-ink-strong">
          {{ title }}
        </h2>
        <button
          type="button"
          aria-label="Tutup"
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-lg p-1 text-ink-subtle hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 cursor-pointer transition-colors"
          :disabled="busy"
          @click="requestClose"
        >
          <img :src="closeIcon" alt="" class="size-6" />
        </button>
      </div>

      <!-- Warning Banner (Figma 1097:20863) -->
      <div class="flex flex-col gap-1 rounded-xl bg-warning-soft p-4">
        <div class="flex items-center gap-1.5">
          <img :src="releaseAlertIcon" alt="" class="size-4 shrink-0" />
          <span class="font-inter text-sm font-bold text-ink-heading">PERHATIAN!</span>
        </div>
        <p class="font-inter text-sm text-ink-heading leading-5">
          Data pada <strong class="font-bold">{{ targetName }}</strong> hanya tersedia data 30 hari terakhir
        </p>
      </div>

      <!-- Actions (Figma 1097:20869) -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          class="rounded-xl border border-cta-border bg-surface px-[17px] py-[11px] font-sans text-sm font-medium text-ink shadow-sm hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 cursor-pointer transition-colors"
          :disabled="busy"
          @click="requestClose"
        >
          Batalkan
        </button>
        <button
          type="button"
          data-autofocus
          class="rounded-xl bg-primary px-4 py-[11px] font-sans text-sm font-bold text-white shadow-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-70 cursor-pointer transition-colors"
          :disabled="busy"
          @click="$emit('confirm')"
        >
          {{ busy ? 'Mengunduh…' : 'Unduh Sekarang' }}
        </button>
      </div>
    </div>
  </dialog>
</template>
