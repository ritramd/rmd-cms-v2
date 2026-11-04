import type { Pagination } from '@/types/product'
import type { RestockFilter, RestockRecord, StockMachine, StockReportType } from '@/types/stock'
import { apiDownload, apiGet } from './api'

export interface StockQuery {
  page: number
  itemPerPage: number
  /** Machine name or code. */
  search?: string
  /** Stock level order; the API defaults to lowest first. */
  sortDir: 'asc' | 'desc'
}

/** Stock level per machine (GET /vending-stock, as v1). 204 → empty page. */
export async function fetchStockMachines(query: StockQuery): Promise<{ data: StockMachine[]; pagination: Pagination }> {
  const params = new URLSearchParams({
    page: String(query.page),
    itemPerPage: String(query.itemPerPage),
    sortDir: query.sortDir,
  })
  if (query.search) params.set('search', query.search)
  const body = await apiGet<{ data: StockMachine[]; pagination: Pagination } | undefined>(`/vending-stock?${params}`)
  return {
    data: body?.data ?? [],
    pagination: body?.pagination ?? { page: 1, itemPerPage: query.itemPerPage, totalItem: 0, totalPage: 1 },
  }
}

const today = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD in local time

/** Stock report .xlsx for one or more machines (GET /vending-stock/{summary|detail}/download?vmid=1,2). */
export function downloadStockReport(type: StockReportType, machines: StockMachine[]): Promise<void> {
  const vmid = machines.map((m) => m.id).join(',')
  const name = type === 'summary' ? 'stock-summary' : 'stock-detail'
  const suffix = machines.length === 1 ? `-${machines[0].vmcode}` : ''
  return apiDownload(`/vending-stock/${type}/download?vmid=${vmid}`, `${name}${suffix}-${today()}.xlsx`)
}

/**
 * One machine's name and stock level, from the same list endpoint (searched by code). Null when the machine
 * isn't in the account's stock list.
 */
export async function fetchStockMachine(code: string): Promise<StockMachine | null> {
  const { data } = await fetchStockMachines({ page: 1, itemPerPage: 10, search: code, sortDir: 'asc' })
  return data.find((m) => m.vmcode === code) ?? null
}

function restockParams(filter: RestockFilter): URLSearchParams {
  const params = new URLSearchParams()
  if (filter.search) params.set('search', filter.search)
  if (filter.machine) params.set('machine', filter.machine)
  if (filter.startDate) params.set('startDate', filter.startDate)
  if (filter.endDate) params.set('endDate', filter.endDate)
  return params
}

export interface RestockQuery extends RestockFilter {
  page: number
  itemPerPage: number
  /** Order of "Dibuat Pada"; the API defaults to newest first. */
  sortDir: 'asc' | 'desc'
}

/**
 * Restock entries (table history_restock_new) of one machine (GET /restock-history/:vmcode, as v1),
 * or of every machine the account can see when `code` is null (GET /restock-history).
 */
export async function fetchRestockHistory(
  code: string | null,
  query: RestockQuery,
): Promise<{ data: RestockRecord[]; pagination: Pagination }> {
  const params = restockParams(query)
  params.set('page', String(query.page))
  params.set('itemPerPage', String(query.itemPerPage))
  params.set('sortDir', query.sortDir)
  const body = await apiGet<{ data: RestockRecord[] | null; pagination: Pagination } | undefined>(
    `/restock-history${code ? `/${encodeURIComponent(code)}` : ''}?${params}`,
  )
  return {
    data: body?.data ?? [],
    pagination: body?.pagination ?? { page: 1, itemPerPage: query.itemPerPage, totalItem: 0, totalPage: 1 },
  }
}

/**
 * Restock history .xlsx (GET /restock-history/download) for the given machines, or for every machine
 * the account can see (narrowed by `filter.machine`) when `codes` is empty.
 */
export function downloadRestockHistory(codes: string[], filter: RestockFilter): Promise<void> {
  const params = restockParams(filter)
  if (codes.length) params.set('vmcode', codes.join(','))
  const suffix = codes.length === 1 ? `-${codes[0]}` : ''
  return apiDownload(`/restock-history/download?${params}`, `restock-history${suffix}-${today()}.xlsx`)
}
