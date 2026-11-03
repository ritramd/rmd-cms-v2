import { API_BASE } from '@/config/env'
import { router } from '@/router'
import { clearSession, getValidToken, UNREACHABLE } from './auth'

/** Failed API call; `message` is safe to show to the user. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Status handling mirrors v1's plugins/fetcher.ts.
const MESSAGES: Record<number, string> = {
  401: 'Sesi kamu sudah berakhir. Silakan login kembali.',
  403: 'Paket akun kamu tidak memiliki akses ke data ini.',
  498: 'Langganan kamu sudah berakhir.',
}

function sendToLogin() {
  clearSession()
  const redirect = router.currentRoute.value.fullPath
  void router.push({ name: 'login', query: { redirect } })
}

/** Authenticated GET against the CMS API. Redirects to login when the session is no longer valid. */
export async function apiGet<T>(path: string): Promise<T> {
  const token = await getValidToken()
  if (!token) {
    sendToLogin()
    throw new ApiError(401, MESSAGES[401])
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
  } catch {
    throw new ApiError(0, UNREACHABLE)
  }

  if (response.status === 401) sendToLogin()
  if (!response.ok) {
    throw new ApiError(response.status, MESSAGES[response.status] ?? `Gagal memuat data (HTTP ${response.status}).`)
  }
  // Some endpoints answer 204 with an empty body (e.g. /announcements/:permalink when not found).
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
