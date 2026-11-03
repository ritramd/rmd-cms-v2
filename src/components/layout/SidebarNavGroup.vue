<script setup lang="ts">
// Figma: "Kelola Vending" group (1097:42255)
import { useId } from 'vue'
import { icons, isFlippedGlyph, type IconName } from '@/assets/icons'
import AppIcon from '@/components/ui/AppIcon.vue'
import TintedIcon from '@/components/ui/TintedIcon.vue'

defineProps<{
  label: string
  icon: IconName
}>()

const open = defineModel<boolean>('open', { default: false })
const panelId = useId()
</script>

<template>
  <div class="flex flex-col gap-1 py-2">
    <button
      type="button"
      :aria-expanded="open"
      :aria-controls="panelId"
      class="group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :class="open && 'bg-surface-muted'"
      @click="open = !open"
    >
      <span class="flex items-center gap-4">
        <span class="relative my-1 size-6 shrink-0">
          <AppIcon :name="icon" class="absolute inset-0" :class="!open && 'invisible group-hover:visible'" />
          <!-- Figma only ships the blue icon; while closed it's painted in the idle gray like other items. -->
          <TintedIcon
            v-if="!open"
            :src="icons[icon]"
            color="bg-ink-muted"
            class="absolute inset-0 group-hover:invisible"
            :class="isFlippedGlyph(icon) && '-scale-y-100'"
          />
        </span>
        <span
          class="text-base"
          :class="open ? 'font-semibold text-ink-strong' : 'font-medium text-ink-muted group-hover:text-primary'"
        >
          {{ label }}
        </span>
      </span>
      <AppIcon name="chevron-expand" class="my-1 shrink-0 transition-transform" :class="open && 'rotate-180'" />
    </button>
    <div v-show="open" :id="panelId" class="flex flex-col gap-1 pl-4">
      <slot />
    </div>
  </div>
</template>
