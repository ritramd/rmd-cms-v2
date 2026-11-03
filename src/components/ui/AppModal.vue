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
    class="m-auto max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl bg-transparent p-0 backdrop:bg-black/60"
    :class="width"
    :aria-labelledby="titleId"
    @click="onDialogClick"
    @cancel.prevent="requestClose"
  >
    <div ref="panel" class="flex flex-col gap-4 bg-surface p-5">
      <div class="flex items-center gap-1">
        <h2 :id="titleId" class="flex-1 text-2xl/[43px] font-bold text-ink-strong">{{ title }}</h2>
        <button
          type="button"
          aria-label="Tutup"
          class="shrink-0 rounded-lg hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
          :disabled="busy"
          @click="requestClose"
        >
          <img :src="closeIcon" alt="" />
        </button>
      </div>
      <slot />
    </div>
  </dialog>
</template>
