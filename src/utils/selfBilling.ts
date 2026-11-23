// Self billing invoice: the same formula rmd-api-cms checks in selfBillingCreateSession
// (billingPaymentController.calculateExpectedBillingAmount) and v1 pages/subscription-end.vue shows.
// The server refuses a session whose billingAmount differs from its own result by more than Rp 1.
import type { SubscriptionPackage } from '@/types/billing'

/** Monthly price per machine (BillingPaymentModel.PACKAGE_PRICE_MAP). */
export const PACKAGE_PRICES: Record<SubscriptionPackage, number> = {
  starter: 250000,
  pro: 350000,
  priority: 750000,
}

export const PPN_RATE = 0.11
export const PPH_RATE = 0.02
/** Flat Midtrans fee per transaction. */
export const MDR_AMOUNT = 4400

export interface SelfBillingInvoice {
  /** Outstanding months of the selected machines, from the API, before tax. */
  outstandingBase: number
  /** New months × package price × machines, before tax. */
  newSubscriptionBase: number
  totalBase: number
  ppn: number
  /** Only for companies (category "perusahaan") that opt in. */
  pph: number
  mdr: number
  /** floor(totalBase × (1.11, or 1.09 with PPh)) + MDR; 0 when there is nothing to pay. */
  total: number
}

export function computeSelfBillingInvoice(input: {
  outstandingBase: number
  months: number
  pkg: SubscriptionPackage
  machineCount: number
  includePPH: boolean
}): SelfBillingInvoice {
  const newSubscriptionBase = input.months * PACKAGE_PRICES[input.pkg] * input.machineCount
  const totalBase = input.outstandingBase + newSubscriptionBase
  if (totalBase <= 0) {
    return { outstandingBase: input.outstandingBase, newSubscriptionBase, totalBase: 0, ppn: 0, pph: 0, mdr: 0, total: 0 }
  }
  // The same literals as the backend: 1 + 0.11 − 0.02 in floating point isn't exactly 1.09, and
  // floor() of the product could then land a rupiah off the server's figure.
  const multiplier = input.includePPH ? 1.09 : 1.11
  return {
    outstandingBase: input.outstandingBase,
    newSubscriptionBase,
    totalBase,
    ppn: Math.floor(totalBase * PPN_RATE),
    pph: input.includePPH ? Math.floor(totalBase * PPH_RATE) : 0,
    mdr: MDR_AMOUNT,
    total: Math.floor(totalBase * multiplier) + MDR_AMOUNT,
  }
}
