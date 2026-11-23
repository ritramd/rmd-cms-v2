import { ApiError, apiDownload, apiGet, apiSendJson } from './api'
import type { Pagination } from '@/types/product'
import type {
  BillingHistoryQuery,
  BillingHistoryRecord,
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

// ─── Renewal history ──────────────────────────────────────────────────────────

function historyParams(query: Omit<BillingHistoryQuery, 'page' | 'itemPerPage'>): URLSearchParams {
  const params = new URLSearchParams()
  if (query.search) params.set('search', query.search)
  if (query.status) params.set('status', query.status)
  if (query.startDate) params.set('startDate', query.startDate)
  if (query.endDate) params.set('endDate', query.endDate)
  return params
}

/**
 * The paying account's renewals, newest first: self billing and voucher payments together
 * (GET /billing-payment/history; v1 dashboard/billing-history.vue). A sub account sees its parent's.
 */
export async function fetchBillingHistory(
  query: BillingHistoryQuery,
): Promise<{ data: BillingHistoryRecord[]; pagination: Pagination | null }> {
  const params = historyParams(query)
  params.set('page', String(query.page))
  params.set('itemPerPage', String(query.itemPerPage))
  const body = await apiGet<{ data: BillingHistoryRecord[] | null; pagination?: Pagination }>(
    `/billing-payment/history?${params}`,
  )
  // The model answers data: null when its query fails.
  if (!body.data) throw new ApiError(500, 'Riwayat perpanjangan tidak tersedia saat ini.')
  return { data: body.data, pagination: body.pagination ?? null }
}

/** Every matching renewal as an .xlsx (GET /billing-payment/history/download). */
export function downloadBillingHistory(query: Omit<BillingHistoryQuery, 'page' | 'itemPerPage'>): Promise<void> {
  return apiDownload(`/billing-payment/history/download?${historyParams(query)}`, 'riwayat-perpanjangan.xlsx')
}
