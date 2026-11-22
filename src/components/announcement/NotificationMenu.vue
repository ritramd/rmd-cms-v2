<script setup lang="ts">
// Figma: bell (1097:12400) → Notifikasi panel (1097:15537) / Pengumuman panel (1097:21859)
// Notifikasi = system alerts per machine (GET /notifications); Pengumuman = admin posts (GET /announcements).
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useId } from 'vue'
import announcementIcon from '@/assets/announcement/tab-announcement.svg'
import notificationIcon from '@/assets/announcement/tab-notification.svg'
import AnnouncementItem from '@/components/announcement/AnnouncementItem.vue'
import NotificationItem from '@/components/announcement/NotificationItem.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import NotificationButton from '@/components/ui/NotificationButton.vue'
import TintedIcon from '@/components/ui/TintedIcon.vue'
import { ApiError } from '@/services/api'
import { fetchAnnouncements, fetchUnreadCount, markAnnouncementRead } from '@/services/announcements'
import { fetchNotifications, fetchNotificationUnreadCount, markNotificationRead } from '@/services/notifications'
import type { Announcement, AnnouncementCategory } from '@/types/announcement'
import type { AppNotification } from '@/types/notification'

type Tab = 'notifications' | 'announcements'

const NOTIFICATIONS_PER_PAGE = 10

withDefaults(
  defineProps<{
    /** "card": dashboard header (1097:12400); "round": compact page header (1097:22037). */
    trigger?: 'card' | 'round'
  }>(),
  { trigger: 'card' },
)

const root = ref<HTMLElement | null>(null)
const panelId = useId()
const open = ref(false)
const tab = ref<Tab>('notifications')

const announcementUnread = ref(0)
const notificationUnread = ref(0)
/** The bell badge covers both tabs. */
const unreadCount = computed(() => announcementUnread.value + notificationUnread.value)

const announcements = ref<Announcement[]>([])
const categories = ref<AnnouncementCategory[]>([])
const loading = ref(false)
const loaded = ref(false)
const error = ref<string | null>(null)
const expandedId = ref<number | null>(null)

const notifications = shallowRef<AppNotification[]>([])
const notifPage = ref(0)
const notifTotalPage = ref(1)
const notifLoading = ref(false)
const notifError = ref<string | null>(null)
const expandedNotifId = ref<number | null>(null)
const notifLoaded = computed(() => notifPage.value > 0)
const hasMoreNotifications = computed(() => notifPage.value < notifTotalPage.value)

// Each badge is optional (e.g. plans without access get 403); a failure keeps that count at 0.
async function loadAnnouncementUnread() {
  try {
    announcementUnread.value = await fetchUnreadCount()
  } catch {
    announcementUnread.value = 0
  }
}
async function loadNotificationUnread() {
  try {
    notificationUnread.value = await fetchNotificationUnreadCount()
  } catch {
    notificationUnread.value = 0
  }
}

/** First page, or the next one when `more` is set ("Muat lebih banyak"). */
async function loadNotifications(more = false) {
  notifLoading.value = true
  notifError.value = null
  try {
    const page = more ? notifPage.value + 1 : 1
    const result = await fetchNotifications(page, NOTIFICATIONS_PER_PAGE)
    notifications.value = more ? [...notifications.value, ...result.notifications] : result.notifications
    notifPage.value = page
    notifTotalPage.value = result.pagination.totalPage
  } catch (err) {
    notifError.value = err instanceof ApiError ? err.message : 'Gagal memuat notifikasi.'
  } finally {
    notifLoading.value = false
  }
}

async function toggleNotification(item: AppNotification) {
  expandedNotifId.value = expandedNotifId.value === item.id ? null : item.id
  if (expandedNotifId.value !== item.id || item.is_read) return

  // Mark read locally right away; the list is a shallowRef, so swap the item.
  notifications.value = notifications.value.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
  notificationUnread.value = Math.max(0, notificationUnread.value - 1)
  try {
    await markNotificationRead(item.id)
  } catch {
    void loadNotificationUnread()
  }
}

function loadTab(target: Tab) {
  if (target === 'notifications' && !notifLoaded.value && !notifLoading.value) void loadNotifications()
  if (target === 'announcements' && !loaded.value && !loading.value) void loadAnnouncements()
}

function selectTab(target: Tab) {
  tab.value = target
  loadTab(target)
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
  if (open.value) loadTab(tab.value)
}

async function toggleItem(item: Announcement) {
  expandedId.value = expandedId.value === item.id ? null : item.id
  if (expandedId.value !== item.id || item.read_state === 1) return

  // Opening it is what marks it read on the backend; update locally right away.
  item.read_state = 1
  announcementUnread.value = Math.max(0, announcementUnread.value - 1)
  try {
    await markAnnouncementRead(item.permalink)
  } catch {
    void loadAnnouncementUnread()
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
  void loadAnnouncementUnread()
  void loadNotificationUnread()
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
      v-if="trigger === 'card'"
      :has-unread="unreadCount > 0"
      :label="unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi'"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="toggleOpen"
    />
    <button
      v-else
      type="button"
      :aria-label="unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi'"
      :aria-expanded="open"
      :aria-controls="panelId"
      class="relative flex size-10 items-center justify-center rounded-full bg-surface shadow-hairline transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      @click="toggleOpen"
    >
      <AppIcon name="bell-outline" />
      <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-white" />
    </button>

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
          @click="selectTab(t.id)"
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
        <template v-else>
          <p v-if="notifLoading && !notifications.length" class="py-10 text-center text-sm text-ink-muted">
            Memuat notifikasi…
          </p>
          <div v-else-if="notifError && !notifications.length" class="flex flex-col items-center gap-2 py-10 text-sm text-ink-muted">
            {{ notifError }}
            <button type="button" class="font-bold text-primary hover:underline" @click="loadNotifications()">Coba lagi</button>
          </div>
          <p v-else-if="!notifications.length" class="py-10 text-center text-sm text-ink-muted">Belum ada notifikasi.</p>
          <template v-else>
            <ul class="flex flex-col divide-y divide-line-soft">
              <NotificationItem
                v-for="item in notifications"
                :key="item.id"
                :notification="item"
                :open="expandedNotifId === item.id"
                class="py-4 first:pt-2 last:pb-0"
                @toggle="toggleNotification(item)"
                @navigate="open = false"
              />
            </ul>
            <p v-if="notifError" class="pt-3 text-center text-sm text-danger">{{ notifError }}</p>
            <button
              v-if="hasMoreNotifications"
              type="button"
              class="mt-3 w-full py-2 text-sm font-bold text-primary hover:underline disabled:opacity-60"
              :disabled="notifLoading"
              @click="loadNotifications(true)"
            >
              {{ notifLoading ? 'Memuat…' : 'Muat lebih banyak' }}
            </button>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
