import type { AppNotification } from '@/types/notification'
import type { Pagination } from '@/types/product'
import { apiGet, apiSendJson } from './api'

/** The user's in-app notifications, newest first (GET /notifications). */
export async function fetchNotifications(
  page: number,
  itemPerPage: number,
): Promise<{ notifications: AppNotification[]; pagination: Pagination }> {
  const params = new URLSearchParams({ page: String(page), itemPerPage: String(itemPerPage) })
  const body = await apiGet<{ data?: AppNotification[]; pagination?: Pagination }>(`/notifications?${params}`)
  return {
    notifications: body.data ?? [],
    pagination: body.pagination ?? { page, itemPerPage, totalItem: 0, totalPage: 1 },
  }
}

/** Number of unread notifications (GET /notifications/unread-count). */
export async function fetchNotificationUnreadCount(): Promise<number> {
  const body = await apiGet<{ data?: { unread_count?: number } }>('/notifications/unread-count')
  return Number(body.data?.unread_count ?? 0)
}

/** PUT /notifications/:id/read */
export async function markNotificationRead(id: number): Promise<void> {
  await apiSendJson(`/notifications/${id}/read`, 'PUT', {})
}
