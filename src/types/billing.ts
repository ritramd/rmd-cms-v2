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
