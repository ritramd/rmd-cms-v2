<script setup lang="ts">
// Figma: bell (1097:12400) → Pengumuman panel (1097:21859)
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import announcementIcon from '@/assets/announcement/tab-announcement.svg'
import notificationIcon from '@/assets/announcement/tab-notification.svg'
import AnnouncementItem from '@/components/announcement/AnnouncementItem.vue'
import NotificationButton from '@/components/ui/NotificationButton.vue'
import TintedIcon from '@/components/ui/TintedIcon.vue'
import { ApiError } from '@/services/api'
import { fetchAnnouncements, fetchUnreadCount, markAnnouncementRead } from '@/services/announcements'
import type { Announcement, AnnouncementCategory } from '@/types/announcement'

type Tab = 'notifications' | 'announcements'

const root = ref<HTMLElement | null>(null)
const panelId = useId()
const open = ref(false)
const tab = ref<Tab>('announcements')

const unreadCount = ref(0)
const announcements = ref<Announcement[]>([])
const categories = ref<AnnouncementCategory[]>([])
const loading = ref(false)
const loaded = ref(false)
const error = ref<string | null>(null)
const expandedId = ref<number | null>(null)

async function loadUnreadCount() {
  try {
    unreadCount.value = await fetchUnreadCount()
  } catch {
    // The badge is optional (e.g. plans without access get 403); keep it hidden.
    unreadCount.value = 0
  }
}

async function loadAnnouncements() {
  loading.value = true
  error.value = null
  try {
    const result = await fetchAnnouncements()
    announcements.value = result.announcements
    categories.value = result.categories
    loaded.value = true
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Gagal memuat pengumuman.'
  } finally {
    loading.value = false
  }
}

function toggleOpen() {
  open.value = !open.value
  if (open.value && !loaded.value && !loading.value) void loadAnnouncements()
}

async function toggleItem(item: Announcement) {
  expandedId.value = expandedId.value === item.id ? null : item.id
  if (expandedId.value !== item.id || item.read_state === 1) return

  // Opening it is what marks it read on the backend; update locally right away.
  item.read_state = 1
  unreadCount.value = Math.max(0, unreadCount.value - 1)
  try {
    await markAnnouncementRead(item.permalink)
  } catch {
    void loadUnreadCount()
  }
}

// The design alternates orange / red tiles; tie the color to the category so it stays stable.
const categoryOrder = computed(() => new Map(categories.value.map((c, i) => [c.id, i])))
function toneFor(item: Announcement): 'warning' | 'danger' {
  const index = item.id_category === null ? 0 : (categoryOrder.value.get(item.id_category) ?? item.id_category)
  return index % 2 === 0 ? 'warning' : 'danger'
}

function onPointerDown(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  void loadUnreadCount()
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'notifications', label: 'Notifikasi', icon: notificationIcon },
  { id: 'announcements', label: 'Pengumuman', icon: announcementIcon },
]
</script>

<template>
  <div ref="root" class="relative">
    <NotificationButton
      :has-unread="unreadCount > 0"
      :label="unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi'"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="toggleOpen"
    />

    <div
      v-if="open"
      :id="panelId"
      class="absolute top-full right-0 z-20 mt-3 flex max-h-[min(640px,calc(100vh-8rem))] w-[568px] max-w-[calc(100vw-2rem)] flex-col rounded-[32px] bg-surface p-6 shadow-popover"
    >
      <div role="tablist" class="flex shrink-0 gap-2 rounded-xl bg-surface-muted p-2">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          role="tab"
          :aria-selected="tab === t.id"
          class="flex flex-1 items-center gap-2 rounded-xl px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :class="
            tab === t.id
              ? 'bg-primary py-[11px] font-bold text-white shadow-primary'
              : 'border border-cta-border bg-surface py-2.5 font-medium text-ink shadow-hairline hover:bg-surface-muted'
          "
          @click="tab = t.id"
        >
          <!-- Figma exports the notification icon in gray and the announcement icon in white only. -->
          <TintedIcon :src="t.icon" :color="tab === t.id ? 'bg-white' : 'bg-ink-subtle'" class="size-6 shrink-0" />
          {{ t.label }}
        </button>
      </div>

      <div class="mt-2 min-h-0 flex-1 overflow-y-auto pr-1" role="tabpanel">
        <template v-if="tab === 'announcements'">
          <p v-if="loading" class="py-10 text-center text-sm text-ink-muted">Memuat pengumuman…</p>
          <div v-else-if="error" class="flex flex-col items-center gap-2 py-10 text-sm text-ink-muted">
            {{ error }}
            <button type="button" class="font-bold text-primary hover:underline" @click="loadAnnouncements">Coba lagi</button>
          </div>
          <p v-else-if="!announcements.length" class="py-10 text-center text-sm text-ink-muted">Belum ada pengumuman.</p>
          <ul v-else class="flex flex-col divide-y divide-line-soft">
            <AnnouncementItem
              v-for="item in announcements"
              :key="item.id"
              :announcement="item"
              :open="expandedId === item.id"
              :tone="toneFor(item)"
              class="py-4 first:pt-2 last:pb-0"
              @toggle="toggleItem(item)"
            />
          </ul>
        </template>
        <p v-else class="py-10 text-center text-sm text-ink-muted">Belum ada notifikasi.</p>
      </div>
    </div>
  </div>
</template>
