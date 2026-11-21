// User Profile and Account Management services.
// Mirrored from legacy rmd-cms (pages/users/index.vue, pages/ganti-password/index.vue, utils/promptGlobalLogout.ts).

import { router } from '@/router'
import { apiDelete, apiGet, apiSendJson } from './api'
import { clearSession, getSession } from './auth'
import type { ChangePasswordPayload, ChangePasswordResponse } from '@/types/profile'
import type {
  AddUserPayload,
  AssignVendingPayload,
  ListParent,
  UpdateUserPackagePayload,
  UserAndVending,
  YourVending,
} from '@/types/user'

/**
 * Changes user password via PUT /change-pwd.
 * Validates matching passwords and returns server message.
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  return apiSendJson<ChangePasswordResponse>('/change-pwd', 'PUT', payload)
}

/**
 * Executes full logout: calls DELETE /logout on backend, clears local state & cookies,
 * and navigates back to /login.
 * Mirrored from v1 promptGlobalLogout.ts.
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiDelete('/logout')
  } catch {
    // If network or backend fails, proceed with client-side cleanup
  } finally {
    clearSession()

    // Clear all cookies
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim()
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        }
      }
    }

    // Clear session storage active-menu if any
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('active-menu')
    }

    void router.push({ name: 'login', replace: true })
  }
}

/**
 * Fetches user list with assigned vending machines.
 * Mirrored from legacy rmd-cms (GET /userAndVendings).
 */
export async function fetchUsersAndVendings(): Promise<UserAndVending[]> {
  const resp = await apiGet<{ data?: UserAndVending[] }>('/userAndVendings')
  return resp?.data ?? []
}

/**
 * Fetches vending machines owned by current user.
 * Mirrored from legacy rmd-cms (GET /your/vendings).
 */
export async function fetchYourVendings(): Promise<YourVending[]> {
  const resp = await apiGet<{ data?: YourVending[] }>('/your/vendings')
  return resp?.data ?? []
}

/**
 * Fetches list of parent accounts (for Dev / Ops).
 * Mirrored from legacy rmd-cms (GET /list/parent).
 */
export async function fetchListParent(): Promise<ListParent[]> {
  const resp = await apiGet<{ data?: ListParent[] }>('/list/parent')
  return resp?.data ?? []
}

/**
 * Adds a new user to the platform.
 * Mirrored from legacy rmd-cms (POST /add/user).
 */
export async function createUser(payload: AddUserPayload): Promise<boolean> {
  const session = getSession()
  const fullPayload = {
    ...payload,
    userId: payload.userId ?? session?.id,
  }
  const resp = await apiSendJson<{ data?: boolean; message?: string }>('/add/user', 'POST', fullPayload)
  return !!resp?.data
}

/**
 * Assigns vending machines to a user.
 * Mirrored from legacy rmd-cms (PUT /assign/vending).
 */
export async function assignVendingsToUser(payload: AssignVendingPayload): Promise<void> {
  await apiSendJson<{ data?: unknown }>('/assign/vending', 'PUT', payload)
}

/**
 * Updates a user's package, role, or category.
 * Mirrored from legacy rmd-cms (PUT /user/package/management/:userId).
 */
export async function updateUserPackage(userId: number, payload: UpdateUserPackagePayload): Promise<void> {
  await apiSendJson<{ data?: unknown }>(`/user/package/management/${userId}`, 'PUT', payload)
}

/**
 * Deletes a user by their ID.
 * Mirrored from legacy rmd-cms (DELETE /delete/user/:userId).
 */
export async function deleteUserById(userId: number): Promise<void> {
  await apiDelete(`/delete/user/${userId}`)
}
