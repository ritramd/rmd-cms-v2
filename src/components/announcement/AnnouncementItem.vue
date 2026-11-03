<script setup lang="ts">
// Figma: announcement row, collapsed (1097:21887) and expanded (1097:21936)
import { computed, useId } from 'vue'
import type { IconName } from '@/assets/icons'
import chevronIcon from '@/assets/announcement/chevron.svg'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { Announcement } from '@/types/announcement'
import { htmlToText, sanitizeHtml } from '@/utils/html'

const props = defineProps<{
  announcement: Announcement
  open: boolean
  tone: 'warning' | 'danger'
}>()

defineEmits<{
  toggle: []
}>()

const bodyId = useId()
const tones: Record<'warning' | 'danger', { icon: IconName; tile: string }> = {
  warning: { icon: 'restock', tile: 'bg-warning-soft' },
  danger: { icon: 'power-off', tile: 'bg-danger-soft' },
}

const unread = computed(() => props.announcement.read_state !== 1)
const preview = computed(() => props.announcement.description || htmlToText(props.announcement.content))
// Only parse/sanitize the full HTML once the row is opened.
const body = computed(() => (props.open ? sanitizeHtml(props.announcement.content) : ''))
</script>

<template>
  <li>
    <button
      type="button"
      class="flex w-full gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      :class="open ? 'items-start' : 'items-center'"
      :aria-expanded="open"
      :aria-controls="bodyId"
      @click="$emit('toggle')"
    >
      <span class="shrink-0 rounded-lg px-2 pt-[9px] pb-[11px]" :class="tones[tone].tile">
        <AppIcon :name="tones[tone].icon" class="my-[3px]" />
      </span>
      <span class="flex min-w-0 flex-1 flex-col" :class="open && 'gap-2'">
        <span class="flex items-center gap-1.5 text-sm font-bold text-ink-strong">
          <span v-if="unread" class="size-1.5 shrink-0 rounded-full bg-primary" title="Belum dibaca" />
          <span :class="!open && 'truncate'">{{ announcement.title }}</span>
        </span>
        <span v-if="!open" class="truncate text-xs text-ink-muted">{{ preview }}</span>
      </span>
      <img
        :src="chevronIcon"
        alt=""
        class="shrink-0 transition-transform"
        :class="open ? '-rotate-90' : 'rotate-90'"
      />
    </button>
    <!-- Sits under the title column: tile (30px) + gap (12px). -->
    <div
      v-if="open"
      :id="bodyId"
      class="mt-2 mr-11 ml-[42px] text-sm text-black/85 [&_a]:text-primary [&_a]:underline [&_img]:mt-2 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-lg [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-2 [&_ul]:list-disc"
      v-html="body"
    />
  </li>
</template>
