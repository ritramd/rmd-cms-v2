// API services for Help & Support (Tutorial, Troubleshoot, FAQ).
// Mirrored from legacy rmd-cms (pages/tutorial/index.vue, pages/faq/index.vue).

import { apiGet } from './api'
import type { FaqItem, Troubleshoot, Tutorial } from '@/types/support'

interface JsonApiResponse<T> {
  code?: number
  message?: string
  data: T
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
 * Fetches FAQs from GET /faq.
 */
export async function fetchFaqs(): Promise<FaqItem[]> {
  const resp = await apiGet<JsonApiResponse<FaqItem[]> | FaqItem[]>('/faq')
  if (Array.isArray(resp)) return resp
  return resp?.data ?? []
}
