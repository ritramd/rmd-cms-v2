// API services for Help & Support (Tutorial, Troubleshoot, FAQ).
// Mirrored from legacy rmd-cms (pages/tutorial/index.vue, pages/faq/index.vue).

import { storageUrl } from '@/config/env'
import { apiDelete, apiGet, apiSendForm } from './api'
import type { FaqItem, GuideItem, GuideType, Troubleshoot, Tutorial } from '@/types/support'

interface JsonApiResponse<T> {
  code?: number
  message?: string
  data: T
}

/**
 * Resolves the absolute download URL for a tutorial or troubleshoot document.
 */
export function getGuideDownloadUrl(guide: { type: GuideType; file: string }): string {
  if (!guide.file) return ''
  // If file is already an absolute HTTP(S) URL, keep it
  if (/^https?:\/\//i.test(guide.file)) return guide.file
  const folder = guide.type === 'tutorial' ? 'tutorials' : 'troubleshoots'
  return storageUrl(`${folder}/${guide.file}`) ?? guide.file
}

/**
 * Fetches tutorials from GET /tutorial.
 */
export async function fetchTutorials(): Promise<Tutorial[]> {
  const resp = await apiGet<JsonApiResponse<Tutorial[]> | Tutorial[]>('/tutorial')
  if (Array.isArray(resp)) return resp
  return resp?.data ?? []
}

/**
 * Fetches troubleshoot guides from GET /troubleshoot.
 */
export async function fetchTroubleshoots(): Promise<Troubleshoot[]> {
  const resp = await apiGet<JsonApiResponse<Troubleshoot[]> | Troubleshoot[]>('/troubleshoot')
  if (Array.isArray(resp)) return resp
  return resp?.data ?? []
}

/**
 * Fetches both tutorials and troubleshoot guides into a unified list.
 */
export async function fetchGuides(): Promise<GuideItem[]> {
  const [tutorials, troubleshoots] = await Promise.all([
    fetchTutorials().catch(() => [] as Tutorial[]),
    fetchTroubleshoots().catch(() => [] as Troubleshoot[]),
  ])

  return [
    ...tutorials.map((t) => ({ ...t, type: 'tutorial' as const })),
    ...troubleshoots.map((ts) => ({ ...ts, type: 'troubleshoot' as const })),
  ]
}

/**
 * Creates a new tutorial document (Super Admin).
 */
export async function createTutorial(formData: FormData): Promise<Tutorial> {
  const resp = await apiSendForm<JsonApiResponse<Tutorial>>('/tutorial', 'POST', formData)
  return resp.data
}

/**
 * Updates an existing tutorial document (Super Admin).
 */
export async function updateTutorial(id: number, formData: FormData): Promise<Tutorial> {
  const resp = await apiSendForm<JsonApiResponse<Tutorial>>(`/tutorial/${id}`, 'PUT', formData)
  return resp.data
}

/**
 * Deletes a tutorial document (Super Admin).
 */
export async function deleteTutorial(id: number): Promise<void> {
  await apiDelete(`/tutorial/${id}`)
}

/**
 * Creates a new troubleshoot document (Super Admin).
 */
export async function createTroubleshoot(formData: FormData): Promise<Troubleshoot> {
  const resp = await apiSendForm<JsonApiResponse<Troubleshoot>>('/troubleshoot', 'POST', formData)
  return resp.data
}

/**
 * Updates an existing troubleshoot document (Super Admin).
 */
export async function updateTroubleshoot(id: number, formData: FormData): Promise<Troubleshoot> {
  const resp = await apiSendForm<JsonApiResponse<Troubleshoot>>(`/troubleshoot/${id}`, 'PUT', formData)
  return resp.data
}

/**
 * Deletes a troubleshoot document (Super Admin).
 */
export async function deleteTroubleshoot(id: number): Promise<void> {
  await apiDelete(`/troubleshoot/${id}`)
}

/**
 * Fetches FAQs from GET /faq.
 */
export async function fetchFaqs(): Promise<FaqItem[]> {
  const resp = await apiGet<JsonApiResponse<FaqItem[]> | FaqItem[]>('/faq')
  if (Array.isArray(resp)) return resp
  return resp?.data ?? []
}
