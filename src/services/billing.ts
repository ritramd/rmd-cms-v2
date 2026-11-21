import { apiSendJson } from './api'
import type {
  PaymentConfirmedRequest,
  PaymentConfirmedResponse,
  PaymentTokenRequest,
  PaymentTokenResponse,
  ValidateVoucherRequest,
  ValidateVoucherResponse,
  VoucherData,
} from '@/types/billing'

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
