// Account subscription status, as v1 utils/checkLogin.ts reads it: the subscription_end_date saved
// with the session at login (and refreshed after a self billing payment).
import type { User } from '@/types/user'

export type SubscriptionStatus =
  /** Internal dev/ops/ts accounts: never sent to the billing page. */
  | { kind: 'exempt' }
  /** No end date, or it is before today: everything but the billing pages is closed. */
  | { kind: 'expired'; endDate: string | null }
  /** Active through `endDate` (inclusive); `daysLeft` is 0 on the last day. */
  | { kind: 'active'; endDate: string; daysLeft: number }

/** Days before the end date from which the billing page and menu urge a renewal. */
export const RENEWAL_WARNING_DAYS = 14

/** v1 specialSubroleList ("['dev']", "['ops']", "['ts']", "['ts','ops']"). */
const EXEMPT_SUB_ROLES = ['dev', 'ops', 'ts']

/** Today as "YYYY-MM-DD" in WIB, the calendar the end dates are written in. */
function todayWib(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

export function subscriptionStatus(user: User | null): SubscriptionStatus {
  const subRole = user?.subRole ?? ''
  if (EXEMPT_SUB_ROLES.some((role) => subRole.includes(role))) return { kind: 'exempt' }

  const endDate = user?.subscription_end_date?.slice(0, 10) || null
  const today = todayWib()
  // v1: null, or a date before today, means the subscription has ended.
  if (!endDate || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || endDate < today) return { kind: 'expired', endDate }

  const daysLeft = Math.round((Date.parse(endDate) - Date.parse(today)) / 86_400_000)
  return { kind: 'active', endDate, daysLeft }
}

export function isSubscriptionExpired(user: User | null): boolean {
  return subscriptionStatus(user).kind === 'expired'
}

export interface SubscriptionBadge {
  label: string
  tone: 'danger' | 'warning'
}

/** Pill next to "Perpanjang Subscription" in the sidebar: ended, or ending soon. */
export function subscriptionBadge(user: User | null): SubscriptionBadge | null {
  const status = subscriptionStatus(user)
  if (status.kind === 'expired') return { label: 'Habis', tone: 'danger' }
  if (status.kind === 'active' && status.daysLeft <= RENEWAL_WARNING_DAYS) {
    return { label: status.daysLeft === 0 ? 'Hari ini' : `${status.daysLeft} hari`, tone: 'warning' }
  }
  return null
}
