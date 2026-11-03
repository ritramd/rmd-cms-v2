<script setup lang="ts">
// Figma: "Alert" toaster (1097:13225 error, 1097:14012 success). Annotation: disappears after a few seconds.
import { onBeforeUnmount, watch } from 'vue'
import closeIcon from '@/assets/toast/close.svg'
import errorIcon from '@/assets/toast/error.svg'
import successIcon from '@/assets/toast/success.svg'

const props = withDefaults(
  defineProps<{
    variant?: 'error' | 'success'
    /** Auto-dismiss delay in ms; 0 keeps the toast open. */
    duration?: number
  }>(),
  { variant: 'error', duration: 5000 },
)

const message = defineModel<string | null>({ required: true })

let timer: ReturnType<typeof setTimeout> | undefined

watch(
  message,
  (value) => {
    clearTimeout(timer)
    if (value && props.duration > 0) timer = setTimeout(() => (message.value = null), props.duration)
  },
  { immediate: true },
)

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <Transition
    enter-from-class="translate-y-2 opacity-0"
    enter-active-class="transition duration-200"
    leave-to-class="opacity-0"
    leave-active-class="transition duration-200"
  >
    <div
      v-if="message"
      :role="variant === 'error' ? 'alert' : 'status'"
      class="fixed top-6 right-4 left-4 z-50 flex gap-3 overflow-clip rounded-2xl bg-toast p-6 font-inter shadow-toast sm:left-auto sm:w-[360px] lg:top-[104px] lg:right-10"
    >
      <!-- The design keeps the red tint behind the success icon as well. -->
      <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-toast-error-tint">
        <img :src="variant === 'success' ? successIcon : errorIcon" alt="" />
      </span>
      <p class="min-w-0 flex-1 text-base font-bold text-white">{{ message }}</p>
      <button
        type="button"
        aria-label="Tutup"
        class="shrink-0 self-start rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        @click="message = null"
      >
        <img :src="closeIcon" alt="" />
      </button>
    </div>
  </Transition>
</template>
