import { apiGet, apiSendJson } from './api'
import type {
  BillingMachine,
  OutstandingBilling,
  PaymentConfirmedRequest,
  PaymentConfirmedResponse,
  PaymentTokenRequest,
  PaymentTokenResponse,
  SelfBillingSession,
  SelfBillingSessionRequest,
  SelfBillingStatus,
  ValidateVoucherRequest,
  ValidateVoucherResponse,
  VoucherData,
} from '@/types/billing'

// ─── Self billing (v1 composables/useSelfBilling.ts + pages/subscription-end.vue) ─────────────

/**
 * Machines the payer owns (GET /vending-machines?itemPerPage=all&searchThisParentId=<payer>), the
 * scope selfBillingCreateSession accepts. payerId: parentId for a sub account, else the user id.
 */
export async function fetchBillingMachines(payerId: number): Promise<BillingMachine[]> {
  const body = await apiGet<{ data?: BillingMachine[] } | undefined>(
    `/vending-machines?itemPerPage=all&searchThisParentId=${payerId}`,
  )
  return body?.data ?? []
}

/** Lapsed months per machine, priced at the current package (GET /billing-payment/self/outstanding). */
export async function fetchOutstandingBilling(): Promise<OutstandingBilling | null> {
  const body = await apiGet<{ data?: OutstandingBilling } | undefined>('/billing-payment/self/outstanding')
  return body?.data ?? null
}

/** POST /billing-payment/self/create-session — the server re-checks the amount and the machines. */
export async function createSelfBillingSession(payload: SelfBillingSessionRequest): Promise<SelfBillingSession | null> {
  const body = await apiSendJson<{ data?: SelfBillingSession }>('/billing-payment/self/create-session', 'POST', payload)
  return body?.data ?? null
}

/** POST /billing-payment/self/get-token — Midtrans Snap token for a created session. */
export async function getSelfBillingToken(orderId: string): Promise<string | null> {
  const body = await apiSendJson<{ data?: { transactionToken?: string } }>('/billing-payment/self/get-token', 'POST', {
    orderId,
  })
  return body?.data?.transactionToken ?? null
}

/** GET /billing-payment/self/session-status */
export async function fetchSelfBillingStatus(orderId: string): Promise<SelfBillingStatus | null> {
  const body = await apiGet<{ data?: SelfBillingStatus } | undefined>(
    `/billing-payment/self/session-status?orderId=${encodeURIComponent(orderId)}`,
  )
  return body?.data ?? null
}

/** GET /billing-payment/self/pending-session — an unfinished session left from an earlier visit. */
export async function fetchPendingSelfBillingSession(): Promise<{ orderId?: string; transaction_status?: string } | null> {
  const body = await apiGet<{ data?: { orderId?: string; transaction_status?: string } | null } | undefined>(
    '/billing-payment/self/pending-session',
  )
  return body?.data ?? null
}

// ─── Voucher ──────────────────────────────────────────────────────────────────────────────────

/**
 * Validates a voucher code against the backend API.
 * Mirroring v1: /billing-payment/validate-voucher
 */
export async function validateVoucher(payload: ValidateVoucherRequest): Promise<VoucherData> {
  const response = await apiSendJson<ValidateVoucherResponse>(
    '/billing-payment/validate-voucher',
    'POST',
    payload,
  )

  if (!response || !response.message) {
    const errorText = typeof response?.data === 'string' ? response.data : 'Voucher Tidak Valid!'
    throw new Error(errorText)
  }

  return response.data as VoucherData
}

/**
 * Requests a Midtrans transaction token for a validated voucher promotion.
 * Mirroring v1: /billing-payment/get-trx-token-custom
 */
export async function getPaymentToken(payload: PaymentTokenRequest): Promise<PaymentTokenResponse> {
  return apiSendJson<PaymentTokenResponse>('/billing-payment/get-trx-token-custom', 'POST', payload)
}

/**
 * Confirms payment settlement with the backend.
 * Mirroring v1: /billing-payment/payment-confirmed
 */
export async function confirmPayment(payload: PaymentConfirmedRequest): Promise<PaymentConfirmedResponse> {
  return apiSendJson<PaymentConfirmedResponse>('/billing-payment/payment-confirmed', 'POST', payload)
}
