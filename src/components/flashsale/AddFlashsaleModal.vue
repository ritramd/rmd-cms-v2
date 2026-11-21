<script setup lang="ts">
// Figma: Add New Flashsale Modal (1097:39795 / 1097:40210)
import { reactive, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import OnboardingTooltip from '@/components/ui/OnboardingTooltip.vue'
import type { CreateFlashsalePayload } from '@/types/flashsale'

const props = defineProps<{
  open: boolean
  vmcode: string
  showTooltip?: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: [payload: CreateFlashsalePayload]
  tooltipNext: []
  tooltipClose: []
}>()

const DAYS_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

const form = reactive({
  name: 'Flashsale 1',
  startDate: '',
  endDate: '',
  startTime: '00:00',
  endTime: '00:00',
  days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as string[],
  discountValue: 12,
})

const submitting = ref(false)
const errorMessage = ref<string | null>(null)

function toggleDay(day: string) {
  const idx = form.days.indexOf(day)
  if (idx >= 0) {
    form.days.splice(idx, 1)
  } else {
    form.days.push(day)
  }
}

function reset() {
  form.name = 'Flashsale 1'
  form.startDate = ''
  form.endDate = ''
  form.startTime = '00:00'
  form.endTime = '00:00'
  form.days = [...DAYS_LIST]
  form.discountValue = 12
  errorMessage.value = null
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) reset()
  },
)

function submit() {
  if (!form.name.trim()) {
    errorMessage.value = 'Nama Flashsale wajib diisi.'
    return
  }
  if (!form.discountValue || form.discountValue <= 0) {
    errorMessage.value = 'Nilai diskon harus lebih besar dari 0%.'
    return
  }

  const payload: CreateFlashsalePayload = {
    vmcode: props.vmcode,
    name: form.name.trim(),
    startDate: form.startDate || new Date().toISOString().slice(0, 10),
    endDate: form.endDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    startTime: form.startTime || '00:00',
    endTime: form.endTime || '23:59',
    days: form.days.length > 0 ? form.days : [...DAYS_LIST],
    discountValue: form.discountValue,
  }

  emit('saved', payload)
}
</script>

<template>
  <AppModal
    :open="open"
    title="Add New Flashsale"
    max-width="max-w-[900px]"
    :busy="submitting"
    @close="emit('close')"
  >
    <template #outside>
      <div
        v-if="showTooltip"
        id="tooltip-modal-info"
        class="absolute -left-[335px] top-1/2 -translate-y-1/2 z-50 hidden lg:block"
      >
        <OnboardingTooltip
          title="Tambahkan Info&#10;Flashsale"
          description="Switch between your profiles for unique app experiences"
          button-text="Lanjut"
          pointer-position="right"
          @next="emit('tooltipNext')"
          @close="emit('tooltipClose')"
        />
      </div>
    </template>

    <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
      <!-- Flashsale Name -->
      <div class="flex flex-col gap-1.5">
        <label class="font-inter text-xs font-bold uppercase tracking-wider text-ink-subtle">
          FLASHSALE NAME
        </label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Flashsale 1"
          class="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm font-medium text-ink-heading placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
        />
      </div>

      <!-- Date Range -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <label class="font-inter text-xs font-medium text-ink-muted">
            Start Date
          </label>
          <div class="relative flex items-center">
            <span class="pointer-events-none absolute left-3.5 text-ink-subtle">
              <svg width="15" height="15" viewBox="0 0 13.5 15" fill="none">
                <path d="M1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V3C0 2.5875 0.146875 2.23438 0.440625 1.94062C0.734375 1.64687 1.0875 1.5 1.5 1.5H2.25V0H3.75V1.5H9.75V0H11.25V1.5H12C12.4125 1.5 12.7656 1.64687 13.0594 1.94062C13.3531 2.23438 13.5 2.5875 13.5 3V13.5C13.5 13.9125 13.3531 14.2656 13.0594 14.5594C12.7656 14.8531 12.4125 15 12 15H1.5ZM1.5 13.5H12V6H1.5V13.5ZM1.5 4.5H12V3H1.5V4.5Z" fill="#94A3B8" />
              </svg>
            </span>
            <input
              v-model="form.startDate"
              type="date"
              class="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm font-medium text-ink-heading focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-inter text-xs font-medium text-ink-muted">
            End Date
          </label>
          <div class="relative flex items-center">
            <span class="pointer-events-none absolute left-3.5 text-ink-subtle">
              <svg width="15" height="15" viewBox="0 0 13.5 15" fill="none">
                <path d="M1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V3C0 2.5875 0.146875 2.23438 0.440625 1.94062C0.734375 1.64687 1.0875 1.5 1.5 1.5H2.25V0H3.75V1.5H9.75V0H11.25V1.5H12C12.4125 1.5 12.7656 1.64687 13.0594 1.94062C13.3531 2.23438 13.5 2.5875 13.5 3V13.5C13.5 13.9125 13.3531 14.2656 13.0594 14.5594C12.7656 14.8531 12.4125 15 12 15H1.5ZM1.5 13.5H12V6H1.5V13.5ZM1.5 4.5H12V3H1.5V4.5Z" fill="#94A3B8" />
              </svg>
            </span>
            <input
              v-model="form.endDate"
              type="date"
              class="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm font-medium text-ink-heading focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
        </div>
      </div>

      <!-- Time Range -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-1.5">
          <label class="font-inter text-xs font-medium text-ink-muted">
            Start Time
          </label>
          <div class="relative flex items-center">
            <span class="pointer-events-none absolute left-3.5 text-ink-subtle">
              <AppIcon name="clock" class="size-4" />
            </span>
            <input
              v-model="form.startTime"
              type="time"
              class="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm font-medium text-ink-heading focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-inter text-xs font-medium text-ink-muted">
            END Time
          </label>
          <div class="relative flex items-center">
            <span class="pointer-events-none absolute left-3.5 text-ink-subtle">
              <AppIcon name="clock" class="size-4" />
            </span>
            <input
              v-model="form.endTime"
              type="time"
              class="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm font-medium text-ink-heading focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
        </div>
      </div>

      <!-- Days Applied -->
      <div class="flex flex-col gap-2">
        <label class="font-inter text-xs font-bold uppercase tracking-wider text-ink-subtle">
          DAYS APPLIED
        </label>
        <div class="flex flex-wrap items-center gap-6 pt-1">
          <label
            v-for="day in DAYS_LIST"
            :key="day"
            class="flex cursor-pointer items-center gap-2 font-inter text-sm text-ink-heading"
          >
            <AppCheckbox
              :label="`Pilih hari ${day}`"
              :model-value="form.days.includes(day)"
              @update:model-value="toggleDay(day)"
            />
            <span>{{ day }}</span>
          </label>
        </div>
      </div>

      <!-- Discount Value -->
      <div class="flex flex-col gap-1.5">
        <label class="font-inter text-xs font-bold uppercase tracking-wider text-ink-subtle">
          Discount Value
        </label>
        <div class="relative flex w-36 items-center">
          <input
            v-model.number="form.discountValue"
            type="number"
            min="1"
            max="100"
            class="h-11 w-full rounded-xl border border-line bg-surface pl-3.5 pr-11 text-sm font-medium text-ink-heading focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span
            class="pointer-events-none absolute right-0 flex h-full w-10 items-center justify-center rounded-r-xl border-l border-line bg-surface-muted text-xs font-semibold text-ink-muted"
          >
            %
          </span>
        </div>
      </div>

      <p v-if="errorMessage" role="alert" class="text-sm text-danger-strong">
        {{ errorMessage }}
      </p>

      <!-- Footer Buttons -->
      <div class="sticky -bottom-5 -mx-6 -mb-5 flex items-center justify-end gap-3 px-6 py-4 border-t border-line/40 bg-surface z-10">
        <AppButton type="button" @click="emit('close')">
          Cancel
        </AppButton>
        <AppButton type="submit" variant="primary" :disabled="submitting">
          Save &amp; Continue Add Items
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
