// Who may open which page. subRole is a list-like string (e.g. "['main-client']"); v1 tests it with includes().
import type { User } from '@/types/user'

const hasSubRole = (user: User | null, role: string) => (user?.subRole ?? '').includes(role)

/**
 * VM & Machine Config menu (v1 utils/menuItems.ts "Configs"): main clients only. v1 also listed
 * ts/ops/dev; v2 keeps it to main clients. Hidden for the offline role, as in v1.
 */
export function canSeeVmConfig(user: User | null): boolean {
  return hasSubRole(user, 'main-client') && !hasSubRole(user, 'offline')
}

/**
 * Billing menu (v1 utils/menuItems.ts "Billing"): the dev, bvs and main-client sub roles; hidden for
 * the offline role. Only the menu: /subscription-end stays open to everyone, since an expired
 * subscription (HTTP 498) sends any user there, as in v1.
 */
export function canSeeBilling(user: User | null): boolean {
  if (hasSubRole(user, 'offline')) return false
  return ['dev', 'bvs', 'main-client'].some((role) => hasSubRole(user, role))
}

/**
 * Setting the monthly revenue target on the dashboard: main clients only, like the VM config. The
 * backend (clientRevenueTarget.controller setTarget) also refuses sub accounts.
 */
export function canEditRevenueTarget(user: User | null): boolean {
  return hasSubRole(user, 'main-client') && !hasSubRole(user, 'offline')
}

/** Any subscription package (v1 packageAllList / usePageRoles ALL_CAN). */
export function hasAnyPackage(user: User | null): boolean {
  return ['Starter', 'Pro', 'Priority'].some((pkg) => (user?.package ?? '').includes(pkg))
}

/**
 * Log menu (v1 utils/menuItems.ts "Log"): any package, or the internal ts/ops/dev roles; hidden for
 * the offline role. Log Transaksi and Log Perubahan also need a package (v1 ALL_CAN); Log Error doesn't.
 */
export function canSeeLog(user: User | null): boolean {
  if (hasSubRole(user, 'offline')) return false
  return hasAnyPackage(user) || ['ts', 'ops', 'dev'].some((role) => hasSubRole(user, role))
}

/** The page itself also needs a Pro or Priority package (v1 usePageRoles: vm-config → PRO_PRIORITY). */
export function hasVmConfigPackage(user: User | null): boolean {
  return ['Pro', 'Priority'].some((pkg) => (user?.package ?? '').includes(pkg))
}
