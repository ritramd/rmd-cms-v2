// Response of GET /recap-sales (rmd-api-cms dashboard.model.ts → salesRecap; v1 types/recapSales.d.ts).
export interface RecapSales {
  /** Human-readable ranges, e.g. "2026-11-01 sampai 2026-11-03". */
  time: { monthlySales: string; dailySales: string; weeklySales: string }
  /** Items sold. */
  count: { monthlySales: number; dailySales: number; weeklySales: number }
  /** Gross amount (settled transactions), in Rupiah. */
  total: { monthlySales: number; dailySales: number; weeklySales: number }
}

/** Sales lists in the Penjualan menu; same pages as v1's /vending-sales and /sales-digital. */
export type SalesChannel = 'vending' | 'digital'

// Row of GET /vending-machines (rmd-api-cms vendingMachine.model.ts → filterByUser, `vm.*`). Only the fields the list uses.
export interface SalesMachine {
  id: number
  /** Machine code (vmcode), e.g. "VMENIG010". */
  code: string
  /** vm.name; v1 shows it as "Lokasi". */
  name: string | null
}

export interface SalesDateRange {
  /** YYYY-MM-DD */
  startDate?: string
  endDate?: string
}

/** Filters of one machine's sales (v1 pages/vending-sales/[machine].vue). */
export interface SalesFilter extends SalesDateRange {
  /** Sent as productId=12,15 (rmd-api-cms accepts one id or a comma-separated list). */
  productIds?: number[]
}

// Row of GET /sales/:vmcode (rmd-api-cms sales.model.ts → filterSales: product, s.*, slot, p.price, sku).
export interface SaleRecord {
  id: number
  order_id: string
  transaction_id: string | null
  /** Product display name. */
  product: string | null
  sku: string | null
  slot: number | string | null
  /** Product list price ("Harga SKU"). */
  price: number | string | null
  /** Amount actually paid ("Harga NETT"). */
  gross_amount: number | string | null
  payment_type: string | null
  /** "DD-MM-YYYY HH:mm:ss", already formatted by the backend. */
  transaction_time: string | null
}

/** Columns GET /sales/:vmcode can order by (sortBy). */
export type SaleSortKey = 'payment_type' | 'transaction_time'

// Entry of GET /sales/:vmcode/products: products with a settled sale on that machine, grouped by the
// name the sales table shows (display_name), so look-alike products are one option.
export interface SoldProduct {
  name: string
  /** All product ids sold under this name; picking the option filters by every one of them. */
  ids: number[]
  skus: string[]
}
