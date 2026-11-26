// Date helpers of the Rekap Penjualan pages, as v1 pages/sales-recap and pages/sales-recap-product.
import type { SalesRecapGroupBy } from '@/types/salesRecap'

const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** v1 defaults: this month by day, this year by month, the last five years by year. */
export function defaultRecapRange(groupBy: SalesRecapGroupBy): [string, string] {
  const today = new Date()
  if (groupBy === 'day') return [toYmd(new Date(today.getFullYear(), today.getMonth(), 1)), toYmd(today)]
  if (groupBy === 'month') return [toYmd(new Date(today.getFullYear(), 0, 1)), toYmd(today)]
  return [toYmd(new Date(today.getFullYear() - 4, 0, 1)), toYmd(today)]
}

/** Why the range can't be sent (v1 validateRange), or null. `what` completes "Rentang tanggal … maksimal". */
export function recapRangeError(startDate: string, endDate: string, maxDays: number, what: string): string | null {
  if (!startDate || !endDate) return 'Tanggal awal dan tanggal akhir wajib diisi.'
  if (endDate < startDate) return 'Tanggal akhir tidak boleh sebelum tanggal awal.'
  const days = Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86_400_000)
  return days > maxDays ? `Rentang tanggal ${what} maksimal ${maxDays} hari.` : null
}

/** "2026-11-03" → "Sel, 03 Nov 2026"; "2026-11" → "November 2026"; years as they are (v1 formatPeriod). */
export function formatRecapPeriod(period: string, groupBy: SalesRecapGroupBy): string {
  if (groupBy === 'day') {
    return new Date(`${period}T00:00:00`).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }
  if (groupBy === 'month') {
    return new Date(`${period}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }
  return period
}

export const formatCount = (n: number) => Number(n || 0).toLocaleString('id-ID')
