import type { RecapSales } from '@/types/sales'
import { ApiError, apiGet } from './api'

/** Month-to-date / week-to-date / today sales for the logged-in account. */
export async function fetchRecapSales(): Promise<RecapSales> {
  const body = await apiGet<{ data: RecapSales | null }>('/recap-sales')
  // The backend answers { data: null } when its query fails.
  if (!body.data) throw new ApiError(500, 'Data penjualan tidak tersedia saat ini.')
  return body.data
}
