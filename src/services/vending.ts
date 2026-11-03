import type { VendingMachine } from '@/types/vending'
import { ApiError, apiGet } from './api'

export interface VendingStatusSummary {
  total: number
  online: number
  offline: number
  subscriptionEndDate: string | null
}

// Raw shape of GET /status-vending/resume (rmd-api-cms dashboard.model.ts → statusVendingResume).
// online/offline are MySQL SUM()s: they can arrive as strings, or null when there are no machines.
interface StatusVendingResume {
  total: number | string | null
  online: number | string | null
  offline: number | string | null
  subscription_end_date?: string | null
}

/** Machine counts for the logged-in account; "online" = seen in the last 15 minutes. */
export async function fetchVendingStatus(): Promise<VendingStatusSummary> {
  const body = await apiGet<{ data: StatusVendingResume | null }>('/status-vending/resume')
  // The backend answers { data: null } when its query fails.
  if (!body.data) throw new ApiError(500, 'Status mesin tidak tersedia saat ini.')
  return {
    total: Number(body.data.total ?? 0),
    online: Number(body.data.online ?? 0),
    offline: Number(body.data.offline ?? 0),
    subscriptionEndDate: body.data.subscription_end_date ?? null,
  }
}

// Raw row of GET /status-vending (rmd-api-cms dashboard.model.ts → dailyStatusQuery; v1 StatusRealtime).
interface StatusRealtime {
  id: number
  vmcode: string
  /** vm.name in the backend (v1 labels it "location"); used as the machine name. */
  location: string
  /** Temperature, or "NA" when the machine doesn't report one. */
  suhu: number | string
  status: 'online' | 'offline'
  /** round(sum(stock) / sum(capacity) * 100); null when capacity is 0. */
  stock: number | string | null
  /** Settled sales today, in Rupiah (MySQL SUM, may be a string). Missing on backends before this field was added. */
  today_sales?: number | string | null
  subscription_end_date?: string | null
}

/**
 * Real-time list of machines (only machines that have products). Ordered by stock, lowest first.
 * The endpoint's pagination totals are unreliable, so this asks for everything in one page
 * and the caller paginates on the client.
 */
export async function fetchVendingMachines(): Promise<VendingMachine[]> {
  const body = await apiGet<{ data: StatusRealtime[] | null }>('/status-vending?page=1&itemPerPage=1000')
  if (!body.data) throw new ApiError(500, 'Daftar mesin tidak tersedia saat ini.')
  return body.data.map((row) => ({
    id: row.vmcode,
    name: row.location,
    status: row.status === 'online' ? 'online' : 'offline',
    stock: row.stock === null || row.stock === '' ? null : Number(row.stock),
    revenue: row.today_sales === undefined || row.today_sales === null ? undefined : Number(row.today_sales),
  }))
}
