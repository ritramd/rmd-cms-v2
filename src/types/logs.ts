// Log pages (v1: pages/log-transaksi, pages/log-error, pages/log-perubahan).
import type { SaleRecord } from './sales'

export interface LogDateRange {
  /** YYYY-MM-DD */
  startDate?: string
  endDate?: string
}

export interface LogPageQuery extends LogDateRange {
  page: number
  itemPerPage: number
}

/**
 * Row of GET /transaction-log/:vmcode: the same rows as GET /sales/:vmcode (rmd-api-cms
 * sales.model.ts → filterSales) but only transactions that never settled.
 */
export interface TransactionLogRecord extends SaleRecord {
  /** pending, initiated, expire, failure, deny, cancel, refund, … */
  transaction_status: string | null
  /** Parsed by the backend when it is JSON; quantity is 1 when missing (v1). */
  actions: { quantity?: number | string } | string | null
}

/** Row of GET /log-error/:vmcode (errorLog.model.ts → getErrorLogByVmcode). */
export interface ErrorLogRecord {
  error_id?: number
  code: string
  error_message: string | null
  /** "YYYY-MM-DD HH:mm:ss", machine local time. */
  error_time: string | null
}

export type ChangeEntityType = 'product' | 'planogram'
export type ChangeAction = 'create' | 'update' | 'delete'

export interface ChangedField {
  field: string
  label: string
  before: string | number | null
  after: string | number | null
}

/** Row of GET /change-logs (changeLog.model.ts → list), scoped to what the user may see. */
export interface ChangeLogRecord {
  id: number
  entity_type: ChangeEntityType
  action: ChangeAction
  product_name: string | null
  sku: string | null
  vending_machine_code: string | null
  slot: number | null
  user_name: string | null
  user_email: string | null
  changed_fields: ChangedField[]
  created_at: string
}

export interface ChangeLogFilter extends LogDateRange {
  entityType?: ChangeEntityType
  action?: ChangeAction
  search?: string
}
