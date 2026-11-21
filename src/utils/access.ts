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

/** The page itself also needs a Pro or Priority package (v1 usePageRoles: vm-config → PRO_PRIORITY). */
export function hasVmConfigPackage(user: User | null): boolean {
  return ['Pro', 'Priority'].some((pkg) => (user?.package ?? '').includes(pkg))
}
