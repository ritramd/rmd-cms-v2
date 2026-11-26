import type { Pagination } from '@/types/product'
import type {
  ChangeLogFilter,
  ChangeLogRecord,
  ErrorLogFilter,
  ErrorLogRecord,
  LogDateRange,
  LogPageQuery,
  TransactionLogFilter,
  TransactionLogRecord,
} from '@/types/logs'
import { apiDownload, apiGet } from './api'

const today = () => new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD in local time

function rangeParams(range: LogDateRange & { status?: string }): URLSearchParams {
  const params = new URLSearchParams()
  if (range.startDate) params.set('startDate', range.startDate)
  if (range.endDate) params.set('endDate', range.endDate)
  if (range.status) params.set('status', range.status)
  return params
}

function pageParams(query: LogPageQuery & { status?: string }): URLSearchParams {
  const params = rangeParams(query)
  params.set('page', String(query.page))
  params.set('itemPerPage', String(query.itemPerPage))
  return params
}

const emptyPage = (itemPerPage: number): Pagination => ({ page: 1, itemPerPage, totalItem: 0, totalPage: 1 })

/**
 * Transactions of one machine that never settled (GET /transaction-log/:vmcode, as v1). 204 — no
 * rows, unknown machine or no access — resolves to an empty page.
 */
export async function fetchTransactionLog(
  code: string,
  query: LogPageQuery & TransactionLogFilter,
): Promise<{ data: TransactionLogRecord[]; pagination: Pagination }> {
  const body = await apiGet<{ data: TransactionLogRecord[]; pagination: Pagination } | undefined>(
    `/transaction-log/${encodeURIComponent(code)}?${pageParams(query)}`,
  )
  return { data: body?.data ?? [], pagination: body?.pagination ?? emptyPage(query.itemPerPage) }
}

/** The machine's transaction log as .xlsx (GET /transaction-log/download?machines=<code>), same filters as the page. */
export function downloadTransactionLog(code: string, filter: TransactionLogFilter): Promise<void> {
  const params = rangeParams(filter)
  params.set('machines', code)
  return apiDownload(`/transaction-log/download?${params}`, `log_transaksi_${code}_${today()}.xlsx`)
}

/**
 * One page of a machine's error log, newest first (GET /log-error/:vmcode). `pagination` is null on
 * backends from before it was added; the caller then only knows a full page may have a next one.
 * 204 — unknown machine or no access — resolves to an empty page.
 */
export async function fetchErrorLog(
  code: string,
  query: LogPageQuery & ErrorLogFilter,
): Promise<{ data: ErrorLogRecord[]; pagination: Pagination | null }> {
  const body = await apiGet<{ data?: ErrorLogRecord[]; pagination?: Pagination } | undefined>(
    `/log-error/${encodeURIComponent(code)}?${pageParams(query)}`,
  )
  return { data: body?.data ?? [], pagination: body ? (body.pagination ?? null) : emptyPage(query.itemPerPage) }
}

/** The machine's error log as .xlsx (GET /log-error/download?machines=<code>), same filters as the page. */
export function downloadErrorLog(code: string, filter: ErrorLogFilter): Promise<void> {
  const params = rangeParams(filter)
  params.set('machines', code)
  return apiDownload(`/log-error/download?${params}`, `log_error_${code}_${today()}.xlsx`)
}

function changeLogParams(filter: ChangeLogFilter): URLSearchParams {
  const params = rangeParams(filter)
  if (filter.entityType) params.set('entityType', filter.entityType)
  if (filter.action) params.set('action', filter.action)
  if (filter.search) params.set('search', filter.search)
  return params
}

/** Price, product and planogram changes the user may see, newest first (GET /change-logs). */
export async function fetchChangeLogs(
  filter: ChangeLogFilter & { page: number; itemPerPage: number },
): Promise<{ data: ChangeLogRecord[]; pagination: Pagination }> {
  const params = changeLogParams(filter)
  params.set('page', String(filter.page))
  params.set('itemPerPage', String(filter.itemPerPage))
  const body = await apiGet<{ data: ChangeLogRecord[]; pagination: Pagination } | undefined>(`/change-logs?${params}`)
  return { data: body?.data ?? [], pagination: body?.pagination ?? emptyPage(filter.itemPerPage) }
}

/** The filtered change log as .xlsx (GET /change-logs/download). */
export function downloadChangeLogs(filter: ChangeLogFilter): Promise<void> {
  return apiDownload(
    `/change-logs/download?${changeLogParams(filter)}`,
    `log-perubahan-${filter.startDate || 'awal'}_${filter.endDate || 'akhir'}.xlsx`,
  )
}
