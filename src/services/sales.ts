import type { Pagination } from '@/types/product'
import type {
  RecapSales,
  SaleRecord,
  SaleSortKey,
  SalesChannel,
  SalesFilter,
  SalesMachine,
  SoldProduct,
} from '@/types/sales'
import { ApiError, apiDownload, apiGet } from './api'

/** Month-to-date / week-to-date / today sales for the logged-in account. */
export async function fetchRecapSales(): Promise<RecapSales> {
  const body = await apiGet<{ data: RecapSales | null }>('/recap-sales')
  // The backend answers { data: null } when its query fails.
  if (!body.data) throw new ApiError(500, 'Data penjualan tidak tersedia saat ini.')
  return body.data
}

export interface SalesMachineQuery {
  page: number
  itemPerPage: number
  search?: string
}

/** Machines the account can see (GET /vending-machines, same call as v1's sales pages). Search matches name or code. */
export async function fetchSalesMachines(
  query: SalesMachineQuery,
): Promise<{ data: SalesMachine[]; pagination: Pagination }> {
  const params = new URLSearchParams({ page: String(query.page), itemPerPage: String(query.itemPerPage) })
  if (query.search) params.set('search', query.search)
  const body = await apiGet<{ data: SalesMachine[]; pagination: Pagination }>(`/vending-machines?${params}`)
  return { data: body.data ?? [], pagination: body.pagination }
}

function filterParams(filter: SalesFilter): URLSearchParams {
  const params = new URLSearchParams()
  if (filter.startDate) params.set('startDate', filter.startDate)
  if (filter.endDate) params.set('endDate', filter.endDate)
  if (filter.productIds?.length) params.set('productId', filter.productIds.join(','))
  return params
}

const today = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD in local time

/**
 * Settled sales of the given machines as .xlsx, with the same query v1 sends:
 * vending → GET /sales/download (one machine by code, several by id with multiple=1);
 * digital → GET /sales-digital/download (codes, comma-separated).
 */
export function downloadSales(channel: SalesChannel, machines: SalesMachine[], filter: SalesFilter): Promise<void> {
  const params = filterParams(filter)

  if (channel === 'digital') {
    params.set('vmcode', machines.map((m) => m.code).join(','))
    return apiDownload(`/sales-digital/download?${params}`, `sales-digital-${today()}.xlsx`)
  }
  if (machines.length === 1) return downloadMachineSales(machines[0].code, filter)
  params.set('machines', machines.map((m) => m.id).join(','))
  params.set('multiple', '1')
  return apiDownload(`/sales/download?${params}`, `vending-sales-${today()}.xlsx`)
}

/** One vending machine's settled sales as .xlsx (GET /sales/download?machines=<code>). */
export function downloadMachineSales(code: string, filter: SalesFilter): Promise<void> {
  const params = filterParams(filter)
  params.set('machines', code)
  return apiDownload(`/sales/download?${params}`, `vending-sales-${code}-${today()}.xlsx`)
}

/** Machine name for a code, looked up through the same list endpoint (the sales API doesn't return it). */
export async function fetchMachineName(code: string): Promise<string | null> {
  const { data } = await fetchSalesMachines({ page: 1, itemPerPage: 10, search: code })
  return data.find((m) => m.code === code)?.name ?? null
}

export interface MachineSalesQuery extends SalesFilter {
  page: number
  itemPerPage: number
  sortBy: SaleSortKey
  sortDir: 'asc' | 'desc'
}

/**
 * Settled sales of one machine (GET /sales/:vmcode, same call as v1). 204 — unknown machine or
 * no access — resolves to an empty page.
 */
export async function fetchMachineSales(
  code: string,
  query: MachineSalesQuery,
): Promise<{ data: SaleRecord[]; pagination: Pagination }> {
  const params = filterParams(query)
  params.set('page', String(query.page))
  params.set('itemPerPage', String(query.itemPerPage))
  params.set('sortBy', query.sortBy)
  params.set('sortDir', query.sortDir)
  const body = await apiGet<{ data: SaleRecord[]; pagination: Pagination } | undefined>(
    `/sales/${encodeURIComponent(code)}?${params}`,
  )
  return {
    data: body?.data ?? [],
    pagination: body?.pagination ?? { page: 1, itemPerPage: query.itemPerPage, totalItem: 0, totalPage: 1 },
  }
}

/** Products ever sold (settled) on this machine (GET /sales/:vmcode/products). 204 → none. */
export async function fetchSoldProducts(code: string): Promise<SoldProduct[]> {
  const body = await apiGet<{ data: SoldProduct[] } | undefined>(`/sales/${encodeURIComponent(code)}/products`)
  return body?.data ?? []
}
