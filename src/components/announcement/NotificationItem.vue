<script setup lang="ts">
// Figma: notification row in 1.2-D-Notification (1097:15553 low stock, 1097:15565 machine down).
// Same anatomy as AnnouncementItem; the subtitle is "<machine> - <accent>" with the accent tinted.
import { computed, useId } from 'vue'
import { useRouter } from 'vue-router'
import type { IconName } from '@/assets/icons'
import chevronIcon from '@/assets/announcement/chevron.svg'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { AppNotification } from '@/types/notification'

const props = defineProps<{
  notification: AppNotification
  open: boolean
}>()

defineEmits<{
  toggle: []
  /** "Lihat detail" followed, so the panel can close. */
  navigate: []
}>()

const router = useRouter()
const bodyId = useId()

// Machine faults are red in the design, stock (and refunds) orange.
const DANGER_TYPES = new Set(['machine_error', 'maintenance'])
const tone = computed(() => (DANGER_TYPES.has(props.notification.type) ? 'danger' : 'warning'))
const tones: Record<'warning' | 'danger', { icon: IconName; tile: string; accent: string }> = {
  warning: { icon: 'restock', tile: 'bg-warning-soft', accent: 'text-warning' },
  danger: { icon: 'power-off', tile: 'bg-danger-soft', accent: 'text-danger' },
}

/**
 * DATETIME columns hold WIB wall-clock time, but the API serialises them as if UTC
 * ("2026-11-21T21:57:33.000Z" means 21:57 WIB), so read the digits as +07:00.
 */
function parseWib(value: string): Date {
  return new Date(`${value.replace(' ', 'T').slice(0, 19)}+07:00`)
}

function timeAgo(value: string): string {
  const date = parseWib(value)
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000)
  if (Number.isNaN(minutes)) return ''
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

const machine = computed(() => props.notification.metadata?.vmcode ?? '')
const accent = computed(() => {
  const { type, metadata, created_at } = props.notification
  if (type === 'low_stock' && typeof metadata?.stockPercentage === 'number') {
    return `Sisa ${metadata.stockPercentage}%`
  }
  return timeAgo(created_at)
})

/** Only link to pages that exist in v2; others (e.g. ticketing) would land on the not-migrated page. */
const detailLink = computed(() => {
  const url = props.notification.action_url
  if (!url || !url.startsWith('/')) return null
  return router.resolve(url).name === 'not-migrated' ? null : url
})
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
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="flex items-center gap-1.5 text-sm font-bold text-ink-strong">
          <span v-if="!notification.is_read" class="size-1.5 shrink-0 rounded-full bg-primary" title="Belum dibaca" />
          <span :class="!open && 'truncate'">{{ notification.title }}</span>
        </span>
        <span class="truncate text-xs text-ink-muted">
          <template v-if="machine">{{ machine }} - </template>
          <span :class="tones[tone].accent">{{ accent }}</span>
        </span>
      </span>
      <img
        :src="chevronIcon"
        alt=""
        class="shrink-0 transition-transform"
        :class="open ? '-rotate-90' : 'rotate-90'"
      />
    </button>
    <!-- Sits under the title column: tile (30px) + gap (12px). -->
    <div v-if="open" :id="bodyId" class="mt-2 mr-11 ml-[42px] flex flex-col items-start gap-2 text-sm text-black/85">
      <p>{{ notification.message }}</p>
      <RouterLink
        v-if="detailLink"
        :to="detailLink"
        class="font-bold text-primary hover:underline"
        @click="$emit('navigate')"
      >
        Lihat detail
      </RouterLink>
    </div>
  </li>
</template>
