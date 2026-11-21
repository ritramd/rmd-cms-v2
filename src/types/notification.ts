// GET /notifications (rmd-api-cms notification.controller.ts → notification.model.ts, table user_notifications).
// Rows are written by rmd-api-cms services/notificationTrigger.service.ts.

/** Extra data stored with a notification; which keys are set depends on `type`. */
export interface NotificationMetadata {
  vmid?: number
  vmcode?: string
  /** low_stock */
  stockPercentage?: number
  /** eligible_refund */
  orderId?: string
  amount?: number
  /** machine_error */
  errorMessage?: string
}

export interface AppNotification {
  id: number
  /** "low_stock" | "machine_error" | "maintenance" | "eligible_refund"; unknown types still render. */
  type: string
  title: string
  message: string
  metadata: NotificationMetadata | null
  /** CMS path to open, e.g. "/stok-vending?search=VM001". */
  action_url: string | null
  is_read: boolean
  created_at: string
}
