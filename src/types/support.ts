// Domain types for Help & Support (Tutorial, Troubleshoot, FAQ).
// Mirrored from legacy rmd-cms (types/tutorial.d.ts, troubleshoot.d.ts, faq.d.ts).

export type GuideType = 'tutorial' | 'troubleshoot'

export interface Tutorial {
  id: number
  title: string
  status: string
  file: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface Troubleshoot {
  id: number
  title: string
  status: string
  file: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface GuideItem {
  id: number
  title: string
  type: GuideType
  status: string
  file: string
  created_at?: string
  updated_at?: string
}

export interface FaqItem {
  id: number
  question: string
  answer: string
  status: string
  created_at?: string
  updated_at?: string
}

export interface GuideQuery {
  search?: string
  type?: 'all' | GuideType
  page?: number
  perPage?: number
}
