import { API_BASE } from '@/config/env'
import type { JsonApi, User } from '@/types/user'

const SESSION_KEY = 'smartven.user'

/** Error with a message that can be shown to the user as-is. */
export class AuthError extends Error {}

export const UNREACHABLE = 'Server tidak dapat dijangkau. Pastikan API backend aktif.'

async function post(path: string, body: unknown): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new AuthError(UNREACHABLE)
  }
}

/** POST /login, same contract as rmd-cms v1. */
export async function login(credentials: { email: string; password: string }): Promise<User> {
  const response = await post('/login', credentials)
  if (response.status === 401) throw new AuthError('Login gagal: email atau password kamu salah.')
  if (!response.ok) throw new AuthError(`Login gagal (HTTP ${response.status}).`)

  const body = (await response.json()) as JsonApi<User>
  if (!body.data?.token) throw new AuthError('Login gagal: data tidak valid.')
  return body.data
}

/**
 * POST /forgot-password, same contract as rmd-cms v1.
 * An unknown email (404) resolves like success so the page doesn't reveal which emails are registered.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await post('/forgot-password', { email })
  if (response.status === 404) return
  if (response.status === 429) throw new AuthError('Terlalu banyak permintaan. Silakan coba lagi nanti.')
  if (!response.ok) throw new AuthError(`Gagal mengirim link reset password (HTTP ${response.status}).`)
}

// TODO: move to a store once state management is chosen for v2.
export function saveSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Same flow as v1's fetcher: reuse the token until its JWT `exp` passes, then ask
 * GET /regenerate-token (refresh cookie) for a new one. Returns null when the session is gone.
 */
export async function getValidToken(): Promise<string | null> {
  const user = getSession()
  if (!user?.token) return null
  if (!isExpired(user.token)) return user.token

  try {
    const response = await fetch(`${API_BASE}/regenerate-token`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return null
    const body = (await response.json()) as JsonApi<{ token: string }>
    if (!body.data?.token) return null
    saveSession({ ...user, token: body.data.token })
    return body.data.token
  } catch {
    return null
  }
}

function isExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload)) as { exp?: number }
    return typeof exp === 'number' && exp * 1000 < Date.now()
  } catch {
    // Not a JWT we can read; let the API decide.
    return false
  }
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}
