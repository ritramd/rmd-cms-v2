// Ported from rmd-cms v1 (types/user.d.ts, types/jsonApi.d.ts).

export interface User {
  id: number
  name: string
  email: string
  role_id: number
  parentId: number | null
  token: string
  package: string
  subRole: string
  subscription_end_date: string | null
  client_id?: number
  client_name?: string
}

export interface JsonApi<T> {
  data?: T
  errors?: unknown
}
