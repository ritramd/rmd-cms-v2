// User Profile and Account Management services.
// Mirrored from legacy rmd-cms (utils/promptGlobalLogout.ts, pages/ganti-password/index.vue).

import { router } from '@/router'
import { apiDelete, apiSendJson } from './api'
import { clearSession } from './auth'
import type { ChangePasswordPayload, ChangePasswordResponse } from '@/types/profile'

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
