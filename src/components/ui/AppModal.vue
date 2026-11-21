<script setup lang="ts">
// Modal shell from the product form design (1097:23067): white panel, 24px bold title, close (X).
// Native <dialog>: focus stays inside, Escape and backdrop clicks close it (unless `busy`).
import { nextTick, onMounted, ref, useId, watch } from 'vue'
import closeIcon from '@/assets/form/close.svg'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    /** Width class for the panel. */
    width?: string
    /** While true (e.g. saving) the modal can't be dismissed. */
    busy?: boolean
  }>(),
  { width: 'w-[900px]' },
)

const emit = defineEmits<{
  close: []
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const titleId = useId()

function requestClose() {
  if (!props.busy) emit('close')
}

// Clicks on the ::backdrop land on the <dialog> element itself; the panel carries all padding.
function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value) requestClose()
}

async function sync(open: boolean) {
  if (open && !dialog.value?.open) {
    dialog.value?.showModal()
    await nextTick()
    const target =
      panel.value?.querySelector<HTMLElement>('[data-autofocus]') ??
      panel.value?.querySelector<HTMLElement>('input, select, textarea')
    target?.focus()
  } else if (!open && dialog.value?.open) {
    dialog.value.close()
  }
}

watch(() => props.open, sync)
onMounted(() => sync(props.open))
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-visible rounded-2xl bg-transparent p-0 backdrop:bg-black/60 focus:outline-none"
    :class="width"
    :aria-labelledby="titleId"
    @click="onDialogClick"
    @cancel.prevent="requestClose"
  >
    <div class="relative flex max-h-[calc(100vh-2.5rem)] flex-col">
      <slot name="outside" />
      <div
        ref="panel"
        class="flex max-h-[calc(100vh-2.5rem)] flex-col rounded-2xl bg-surface shadow-2xl overflow-hidden"
      >
        <div class="flex shrink-0 items-center justify-between gap-2 border-b border-surface-muted/60 px-6 py-4">
          <h2 :id="titleId" class="flex-1 text-2xl/[32px] font-bold text-ink-strong">{{ title }}</h2>
          <button
            type="button"
            aria-label="Tutup"
            class="shrink-0 rounded-lg p-1 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 cursor-pointer transition-colors"
            :disabled="busy"
            @click="requestClose"
          >
            <img :src="closeIcon" alt="" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <slot />
        </div>
      </div>
    </div>
  </dialog>
</template>
