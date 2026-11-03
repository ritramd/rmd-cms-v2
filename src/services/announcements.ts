import type { Announcement, AnnouncementCategory } from '@/types/announcement'
import { apiGet } from './api'

/** Published announcements for the logged-in user, unread first (GET /announcements). */
export async function fetchAnnouncements(): Promise<{ announcements: Announcement[]; categories: AnnouncementCategory[] }> {
  const body = await apiGet<{ data?: { announcement?: Announcement[]; category?: AnnouncementCategory[] } }>(
    '/announcements',
  )
  return { announcements: body.data?.announcement ?? [], categories: body.data?.category ?? [] }
}

/** Number of unread announcements (GET /announcements/notif). */
export async function fetchUnreadCount(): Promise<number> {
  const body = await apiGet<{ data: number | string | null }>('/announcements/notif')
  return Number(body.data ?? 0)
}

/** Opening an announcement by permalink is what marks it as read on the backend. */
export async function markAnnouncementRead(permalink: string): Promise<void> {
  await apiGet(`/announcements/${encodeURIComponent(permalink)}`)
}
