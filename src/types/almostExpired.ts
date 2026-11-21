// Type definitions for Almost Expired Item feature
// Matching Figma nodes 1097:27019, 1097:30280, 1097:30646, 1097:31104
// and mirroring legacy rmd-cms /diskon-kedaluarsa

export interface AlmostExpiredMachine {
  id: number | string
  code: string
  location: string
  totalItem: number
}

export interface AlmostExpiredItem {
  id: number
  productId: number
  name: string
  photo?: string
  price: number
  originalPrice?: number
  expiredDate: string
  daysRemaining?: number
  status: boolean
  internalName?: string
  rules?: number[]
}

export interface AlmostExpiredQuery {
  page: number
  itemPerPage: number
  search?: string
}

export interface AlmostExpiredPagination {
  page: number
  itemPerPage: number
  totalItem: number
  totalPage: number
}

export interface UpdateAlmostExpiredItemPayload {
  id: number
  productId: number
  price: number
}

export interface UpdateAlmostExpiredBatchPayload {
  vmcode: string
  items: UpdateAlmostExpiredItemPayload[]
}
