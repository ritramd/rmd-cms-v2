// Row of GET /vending-stock (rmd-api-cms vendingStock.model.ts → vendingStock).
export interface StockMachine {
  id: number
  vmcode: string
  /** vm.name; v1 shows it as "Lokasi". */
  name: string | null
  /** sum(stock) / sum(capacity), 0–1 with two decimals; null when the machine has no capacity set. */
  isi: number | string | null
}

/** v1's "Laporan Keluaran": totals per product, or per slot. */
export type StockReportType = 'summary' | 'detail'

// Row of GET /restock-history[/:vmcode] (rmd-api-cms restockHistory.model.ts → history_restock_new + product).
export interface RestockRecord {
  id: number
  vmcode: string
  /** vm.name; null when the machine was deleted. */
  machine_name: string | null
  /** Product display name. */
  product: string | null
  slot: number | string | null
  stock_before: number | string | null
  stock_after: number | string | null
  /** "DD-MM-YYYY HH:mm:ss", formatted by the backend. */
  created_at: string | null
}

export interface RestockFilter {
  /** Product name. */
  search?: string
  /** Machine name or code; only for the all-machines list. */
  machine?: string
  /** YYYY-MM-DD, both days included. */
  startDate?: string
  endDate?: string
}
