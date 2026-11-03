// GET /announcements (rmd-api-cms announcement.model.ts → findAll; interfaces/announcement.interface.ts).
export interface Announcement {
  id: number
  id_category: number | null
  /** Category name (joined). */
  category: string | null
  title: string
  /** HTML from the CMS editor; may contain images. */
  content: string
  description: string | null
  permalink: string
  state: 'publish' | 'draft' | ''
  /** 1 once the user has opened it, null/0 otherwise. */
  read_state: number | null
  created_at: string
  updated_at: string | null
}

export interface AnnouncementCategory {
  id: number
  name: string
}
