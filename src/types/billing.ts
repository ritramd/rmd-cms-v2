// Types for Billing and Voucher Redeem mirrored from rmd-cms v1 and rmd-api-cms.

export interface VoucherData {
  id?: number
  voucher: string
  clientId: number
  duration: number
  billingAmount: string | number
  vmId: string
  subscription_level?: string
  created_at?: string
  isUsed?: number | null
  client?: string
  [key: string]: unknown
}

export interface ValidateVoucherRequest {
  clientId: number
  voucher: string
}

export interface ValidateVoucherResponse {
  code?: number
  message: boolean
  data: VoucherData | string
}

export interface PaymentTokenRequest {
  duration: number
  candidateUserId: number
  billingAmount: number
  vmId: string
  voucherCode: string
}

export interface PaymentTokenResponse {
  transaction_token: string
  redirect_url?: string
}

export interface PaymentConfirmedRequest {
  order_id: string
}

export interface PaymentConfirmedResponse {
  message: boolean
  data?: unknown
}

// ─── Self billing (v1 composables/useSelfBilling.ts, pages/subscription-end.vue; rmd-api-cms
// billingPaymentController.ts selfBilling*) ──────────────────────────────────────────────────

export type SubscriptionPackage = 'starter' | 'pro' | 'priority'

/** Payment method tabs of the billing page. */
export type BillingTab = 'self' | 'voucher'

/** A machine the payer owns; GET /vending-machines?searchThisParentId=<payer>. */
export interface BillingMachine {
  id: number
  code: string
  name: string | null
}

/** GET /billing-payment/self/outstanding: machine whose subscription lapsed before today. */
export interface OutstandingMachine {
  machine_id: number
  code: string
  name?: string
  subscription_end_date: string | null
  /** Calendar months between expiry and today. */
  outstanding_months: number
  /** Period labels, e.g. ["2026-03", "2026-04"]. */
  periods: string[]
  /** outstanding_months × the current package's monthly price, before tax. */
  amount: number
}

export interface OutstandingBilling {
  has_outstanding: boolean
  machines: OutstandingMachine[]
  total_outstanding_months: number
  total_outstanding_amount: number
}

/** POST /billing-payment/self/create-session body (userId, parentId, package come from the token). */
export interface SelfBillingSessionRequest {
  /** Must equal the server's own calculation (±Rp 1) or the session is refused. */
  billingAmount: number
  /** Comma-separated machine ids; machines with outstanding months are always added. */
  vmId: string
  baseAmount: number
  includePPH: boolean
  subscriptionPackage: SubscriptionPackage
  newSubscriptionMonths: number
  outstandingMonths: number
}

export interface SelfBillingSession {
  orderId: string
  userId: number
  billingAmount: number
  vmId: string
  durationMonths: number
  subscriptionEndDate: string
}

export type SelfBillingTransactionStatus =
  | 'pending'
  | 'settlement'
  | 'capture'
  | 'expire'
  | 'deny'
  | 'cancel'
  | 'failure'

/** GET /billing-payment/self/session-status */
export interface SelfBillingStatus {
  order_id: string
  transaction_status: SelfBillingTransactionStatus
  gross_amount: string
  subscription_end_date?: string
}

/** How a self billing payment ended, as the page needs to know. */
export type SelfBillingOutcome =
  | { kind: 'settlement'; subscriptionEndDate: string | null; amount: number }
  | { kind: 'failed'; status: SelfBillingTransactionStatus }
  | { kind: 'pending' }
  /** Popup closed without paying (nothing to report). */
  | { kind: 'closed' }
  | { kind: 'error'; message: string }

export interface MidtransSnapResult {
  status_code: string
  status_message?: string
  transaction_id?: string
  order_id: string
  gross_amount: string
  payment_type?: string
  transaction_time?: string
  transaction_status: string
  fraud_status?: string
  finish_redirect_url?: string
}

export interface MidtransSnapOptions {
  onSuccess?: (result: MidtransSnapResult) => void
  onPending?: (result: MidtransSnapResult) => void
  onError?: (result: MidtransSnapResult | { message: string }) => void
  onClose?: () => void
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: MidtransSnapOptions) => void
    }
  }
}
