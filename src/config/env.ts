/** Backend base URL (v1: NUXT_PUBLIC_API_BASE). */
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:9913'

/** Where uploaded files (e.g. product photos "products/photos/…") are served; same as v1's storageBase. */
export const STORAGE_BASE = import.meta.env.VITE_STORAGE_BASE ?? 'https://cms.ritramd.id/storage/'

/** Absolute URL for a stored file path; leaves absolute URLs untouched. */
export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path
  return STORAGE_BASE.replace(/\/?$/, '/') + path.replace(/^\//, '')
}
