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

/** User and assigned vending machines list item from GET /userAndVendings */
export interface UserAndVending {
  userId: number
  roleId: number
  roleName: string
  category?: string
  email: string
  lastUpdate: string
  userName: string
  vendingMachineNames: string[]
  totalCount: number
  parentId?: number
}

/** Vending machine owned by the client from GET /your/vendings */
export interface YourVending {
  vendingId: number
  name: string
}

/** Parent user from GET /list/parent */
export interface ListParent {
  id: number
  name: string
}

/** Payload for POST /add/user */
export interface AddUserPayload {
  newName: string
  newEmail: string
  newCategory?: string
  newPackage: string
  crossUser?: number | string
  newSubRole?: string
  userId?: number
}

/** Payload for PUT /user/package/management/:userId */
export interface UpdateUserPackagePayload {
  role_id?: number
  subscription_end_date?: string | null
  sub_role?: string
  parent_id?: number
  category?: string
}

/** Payload for PUT /assign/vending */
export interface AssignVendingPayload {
  assignVendingId: number[]
  assignUserId: number
}

export type UserSortField = 'totalCount' | 'lastUpdate' | 'userName' | 'roleName' | 'email'
export type SortDir = 'asc' | 'desc'
