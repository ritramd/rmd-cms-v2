<script setup lang="ts">
// Figma: "Kelola Vending" group (1097:42255), "Produk" group (1097:21994), "User Management" group (1097:28128)
import { useId } from 'vue'
import { useRouter } from 'vue-router'
import { icons, isFlippedGlyph, type IconName } from '@/assets/icons'
import AppIcon from '@/components/ui/AppIcon.vue'
import TintedIcon from '@/components/ui/TintedIcon.vue'

const props = defineProps<{
  label: string
  /** Any 24px single-color icon; it's painted gray when closed and blue when open/hovered. */
  icon: IconName
  /** Optional direct navigation destination for the group header */
  to?: string
}>()

const open = defineModel<boolean>('open', { default: false })
const panelId = useId()
const router = useRouter()

function handleHeaderClick() {
  if (props.to) {
    open.value = true
    void router.push(props.to)
  } else {
    open.value = !open.value
  }
}

function toggleChevron(e: Event) {
  e.stopPropagation()
  open.value = !open.value
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <div
      role="button"
      tabindex="0"
      :aria-expanded="open"
      :aria-controls="panelId"
      class="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer select-none"
      :class="open && 'bg-surface-muted'"
      @click="handleHeaderClick"
      @keydown.enter="handleHeaderClick"
      @keydown.space.prevent="handleHeaderClick"
    >
      <span class="flex min-w-0 flex-1 items-center gap-3.5 text-left">
        <!-- Painted via mask so one asset covers both states (Figma ships some group icons in one color only). -->
        <TintedIcon
          :src="icons[icon]"
          :color="open ? 'bg-primary' : 'bg-ink-muted group-hover:bg-primary'"
          class="size-6 shrink-0"
          :class="isFlippedGlyph(icon) && '-scale-y-100'"
        />
        <span
          class="min-w-0 flex-1 truncate text-left text-sm font-medium whitespace-nowrap"
          :class="open ? 'font-semibold text-ink-strong' : 'text-ink-muted group-hover:text-primary'"
        >
          {{ label }}
        </span>
      </span>
      <button
        type="button"
        class="flex size-6 items-center justify-center rounded-md p-1 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
        :aria-label="open ? `Tutup ${label}` : `Buka ${label}`"
        @click="toggleChevron"
      >
        <AppIcon name="chevron-expand" class="size-4 shrink-0 transition-transform" :class="open && 'rotate-180'" />
      </button>
    </div>
    <div v-show="open" :id="panelId" class="flex flex-col gap-1 pl-4">
      <slot />
    </div>
  </div>
</template>
