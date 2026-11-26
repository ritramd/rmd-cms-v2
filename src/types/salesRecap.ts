// Rekap Penjualan pages (v1 pages/sales-recap, pages/sales-recap-product;
// rmd-api-cms salesRecap.controller.ts / salesRecap.model.ts).

export type SalesRecapGroupBy = 'day' | 'month' | 'year'

export interface SalesRecapQuery {
  groupBy: SalesRecapGroupBy
  /** YYYY-MM-DD */
  startDate: string
  endDate: string
}

/** One period of GET /sales/recap; periods without sales come back as zeros. */
export interface SalesRecapRow {
  /** "YYYY-MM-DD", "YYYY-MM" or "YYYY", per groupBy. */
  period: string
  transactions: number
  qty: number
  /** Rupiah, settled transactions. */
  gross: number
  /** Machines with at least one sale in the period. */
  machines: number
}

export interface SalesRecapSummary extends SalesRecapRow {
  /** Machines the account has, for "machines / totalMachines". */
  totalMachines: number
}

export interface SalesRecapResult {
  data: SalesRecapRow[]
  summary: SalesRecapSummary
}

export interface ProductRecapQuery {
  startDate: string
  endDate: string
}

/** One product of GET /sales/recap/product. */
export interface ProductRecapRow {
  product_id: number | null
  product: string
  sku: string | null
  transactions: number
  qty: number
  gross: number
}

export interface ProductRecapSummary {
  transactions: number
  qty: number
  gross: number
  /** Distinct products sold. */
  products: number
}

export interface ProductRecapResult {
  data: ProductRecapRow[]
  summary: ProductRecapSummary
}

/** Columns the product recap table sorts by. */
export type ProductRecapSortKey = 'product' | 'transactions' | 'qty' | 'gross'
