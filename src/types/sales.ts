// Response of GET /recap-sales (rmd-api-cms dashboard.model.ts → salesRecap; v1 types/recapSales.d.ts).
export interface RecapSales {
  /** Human-readable ranges, e.g. "2026-11-01 sampai 2026-11-03". */
  time: { monthlySales: string; dailySales: string; weeklySales: string }
  /** Items sold. */
  count: { monthlySales: number; dailySales: number; weeklySales: number }
  /** Gross amount (settled transactions), in Rupiah. */
  total: { monthlySales: number; dailySales: number; weeklySales: number }
}
