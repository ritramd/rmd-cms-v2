export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`
}

/**
 * Formats an ISO date range for captions, e.g. ("2026-11-01", "2026-11-03") → "1–3 Nov 2026".
 * Falls back to the raw input when either date can't be parsed.
 */
export function formatDateRange(start: string, end: string): string {
  const [a, b] = [new Date(`${start}T00:00:00`), new Date(`${end}T00:00:00`)]
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return `${start} – ${end}`
  const full = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  if (a.getTime() === b.getTime()) return full.format(a)
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) return `${a.getDate()}–${full.format(b)}`
  return `${full.format(a)} – ${full.format(b)}`
}

/** Short form used in compact labels, e.g. 150_000_000 → "Rp 150jt". */
export function formatRupiahCompact(value: number): string {
  const units: [number, string][] = [
    [1e12, 'T'],
    [1e9, 'M'],
    [1e6, 'jt'],
    [1e3, 'rb'],
  ]
  const [size, suffix] = units.find(([size]) => Math.abs(value) >= size) ?? [1, '']
  return `Rp ${(value / size).toLocaleString('id-ID', { maximumFractionDigits: 1 })}${suffix}`
}

/**
 * Formats a subscription end date (e.g. "2026-08-21") into Indonesian label:
 * "Berlaku s/d 21 Agu 2026" (matches Figma 1097:12689).
 */
export function formatSubscriptionDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Tidak terbatas'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return `Berlaku s/d ${dateStr}`
  const formatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
  return `Berlaku s/d ${formatted}`
}
