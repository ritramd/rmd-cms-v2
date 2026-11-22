// GET /notifications (rmd-api-cms notification.controller.ts → notification.model.ts, table user_notifications).
// Rows are written by rmd-api-cms services/notificationTrigger.service.ts.

/** Extra data stored with a notification; which keys are set depends on `type`. */
export interface NotificationMetadata {
  vmid?: number
  vmcode?: string
  /** low_stock: "low" (under 60%) or "critical" (under 25%) */
  level?: 'low' | 'critical'
  stockPercentage?: number
  /** machine_offline: last report, WIB "YYYY-MM-DD HH:mm:ss" */
  lastOnline?: string
  /** machine_error_cleared: when the machine marked it solved, WIB */
  solvedAt?: string
  /** eligible_refund */
  orderId?: string
  amount?: number
  /** machine_error */
  errorMessage?: string
}

export interface AppNotification {
  id: number
  /**
   * "low_stock" | "machine_error" | "machine_error_cleared" | "machine_offline" | "maintenance" |
   * "eligible_refund"; unknown types still render (orange).
   */
  type: string
  title: string
  message: string
  metadata: NotificationMetadata | null
  /** CMS path to open, e.g. "/stok-vending?search=VM001". */
  action_url: string | null
  is_read: boolean
  created_at: string
}
