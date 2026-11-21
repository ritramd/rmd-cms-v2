import type { Pagination } from './product'

export interface FlashsaleItem {
  id: number
  vmcode: string
  product_id: number
  amount: number
  start_date: string
  end_date: string
  start_hour: string
  end_hour: string
  status: 'scheduled' | 'suspended'
  days: string
  product: string
  price: number
  photo: string
}

export interface FlashsaleRule {
  id: number
  vmcode: string
  name: string
  days: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  discountValue: number
  status: 'scheduled' | 'suspended'
  items?: FlashsaleItemDetail[]
}

export interface FlashsaleItemDetail {
  id: number
  flashsaleId?: number
  productId: number
  name: string
  displayName?: string
  sku: string
  price: number
  photo: string
}

export interface FlashsaleQuery {
  page: number
  itemPerPage: number
  search?: string
}

export interface CreateFlashsalePayload {
  vmcode: string
  name: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  days: string[]
  discountValue: number
  productIds?: number[]
}

export interface AddFlashsaleItemsPayload {
  flashsaleId: number
  vmcode: string
  items: Array<{
    productId: number
    price: number
  }>
}

export type OnboardingStep =
  | 'product_kelola_vending' // 1097:22194
  | 'product_endorse_flashsale' // 1097:22306
  | 'flashsale_tambah_button' // 1097:35691
  | 'flashsale_modal_info' // 1097:39795
  | 'flashsale_modal_item' // 1097:40947
  | 'flashsale_final_success' // 1097:30083
  | null

export interface FlashsaleListResponse {
  data: FlashsaleItem[]
  pagination: Pagination
}
