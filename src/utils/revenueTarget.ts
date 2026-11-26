// Monthly revenue target on the dashboard (rmd-api-cms /client/revenue-target).

/** Suggested target for a month without one: Rp 10 jt for every machine the client runs. */
export const TARGET_PER_MACHINE = 10_000_000

/** Targets under this need a second confirmation, to catch a mistyped amount (a missing zero or two). */
export const LOW_TARGET_THRESHOLD = 10_000_000

export function defaultRevenueTarget(machineCount: number): number {
  return TARGET_PER_MACHINE * Math.max(1, machineCount)
}

/** The month in WIB, which is what the backend's sales dates and target periods use. */
export function currentWibPeriod(): { year: number; month: number } {
  const [year, month] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' })
    .format(new Date())
    .split('-')
    .map(Number)
  return { year, month }
}
