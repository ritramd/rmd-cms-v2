import type {
  ProductRecapQuery,
  ProductRecapResult,
  SalesRecapGroupBy,
  SalesRecapQuery,
  SalesRecapResult,
} from '@/types/salesRecap'
import { apiDownload, apiGet } from './api'

/**
 * Longest range per granularity, in days. Must match MAX_RANGE_DAYS / PRODUCT_MAX_RANGE_DAYS in
 * rmd-api-cms salesRecap.controller.ts (the backend answers 400 beyond them).
 */
export const RECAP_MAX_RANGE_DAYS: Record<SalesRecapGroupBy, number> = {
  day: 366,
  month: 366 * 5,
  year: 366 * 10,
}
export const PRODUCT_RECAP_MAX_RANGE_DAYS = 366

const recapParams = (query: SalesRecapQuery) => new URLSearchParams({ ...query })
const rangeParams = (query: ProductRecapQuery) => new URLSearchParams({ ...query })

/** Settled sales of every machine the account sees, summed per day, month or year (GET /sales/recap). */
export async function fetchSalesRecap(query: SalesRecapQuery): Promise<SalesRecapResult | null> {
  return (await apiGet<SalesRecapResult | undefined>(`/sales/recap?${recapParams(query)}`)) ?? null
}

/** The same recap as .xlsx (GET /sales/recap/download), with v1's file name. */
export function downloadSalesRecap(query: SalesRecapQuery): Promise<void> {
  return apiDownload(
    `/sales/recap/download?${recapParams(query)}`,
    `rekap_penjualan_${query.groupBy}_${query.startDate}_${query.endDate}.xlsx`,
  )
}

/** Settled sales per product across the account's machines (GET /sales/recap/product). */
export async function fetchProductRecap(query: ProductRecapQuery): Promise<ProductRecapResult | null> {
  return (await apiGet<ProductRecapResult | undefined>(`/sales/recap/product?${rangeParams(query)}`)) ?? null
}

/** The product recap as .xlsx (GET /sales/recap/product/download). */
export function downloadProductRecap(query: ProductRecapQuery): Promise<void> {
  return apiDownload(
    `/sales/recap/product/download?${rangeParams(query)}`,
    `rekap_penjualan_produk_${query.startDate}_${query.endDate}.xlsx`,
  )
}
