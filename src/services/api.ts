import { API_BASE } from '@/config/env'
import { router } from '@/router'
import { saveFile } from '@/utils/download'
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
  if (router.currentRoute.value.path === '/subscription-end' || router.currentRoute.value.path === '/billing') {
    return
  }
  clearSession()
  const redirect = router.currentRoute.value.fullPath
  void router.push({ name: 'login', query: { redirect } })
}

/** Authenticated request against the CMS API. Redirects to login when the session is no longer valid. */
async function send(
  path: string,
  init: { method: string; body?: FormData | object; download?: boolean },
): Promise<Response> {
  const token = await getValidToken()
  if (!token) {
    sendToLogin()
    throw new ApiError(401, MESSAGES[401])
  }

  const isForm = init.body instanceof FormData
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  // No Content-Type for FormData: the browser sets the multipart boundary.
  if (init.body && !isForm) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: init.method,
      body: init.body === undefined ? undefined : isForm ? (init.body as FormData) : JSON.stringify(init.body),
      credentials: 'include',
      headers,
    })
  } catch {
    throw new ApiError(0, UNREACHABLE)
  }

  if (response.status === 401) sendToLogin()
  if (response.status === 498) {
    if (router.currentRoute.value.path !== '/subscription-end' && router.currentRoute.value.path !== '/billing') {
      void router.push('/subscription-end')
    }
  }
  if (!response.ok) {
    // Write and download endpoints explain why they refused in { message } (validation, sub-user 403, …): prefer that.
    const explains = init.method !== 'GET' || init.download
    const detail = explains ? await readMessage(response) : undefined
    const verb = init.download ? 'mengunduh' : init.method === 'GET' ? 'memuat' : 'menyimpan'
    throw new ApiError(
      response.status,
      detail ?? MESSAGES[response.status] ?? `Gagal ${verb} data (HTTP ${response.status}).`,
    )
  }
  return response
}

async function request<T>(path: string, init: { method: string; body?: FormData | object }): Promise<T> {
  const response = await send(path, init)
  // Some endpoints answer 204 with an empty body (e.g. /announcements/:permalink when not found).
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

async function readMessage(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { message?: unknown }
    return typeof body.message === 'string' && body.message ? body.message : undefined
  } catch {
    return undefined
  }
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

/** POST/PUT a multipart form (v1 sends product forms this way). */
export function apiSendForm<T>(path: string, method: 'POST' | 'PUT', body: FormData): Promise<T> {
  return request<T>(path, { method, body })
}

/** POST/PUT a JSON body. */
export function apiSendJson<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body: object): Promise<T> {
  return request<T>(path, { method, body })
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}

/**
 * GET a file (e.g. an .xlsx export) and save it. Uses the server's Content-Disposition name when
 * the browser can read it, otherwise `fallbackName`.
 */
export async function apiDownload(path: string, fallbackName: string): Promise<void> {
  const response = await send(path, { method: 'GET', download: true })
  const disposition = response.headers.get('content-disposition')
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)/i)
  saveFile(await response.blob(), match ? decodeURIComponent(match[1].trim()) : fallbackName)
}
