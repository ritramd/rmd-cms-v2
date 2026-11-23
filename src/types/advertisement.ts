export type AdvertisementSpot = 'header' | 'footer' | 'idle' | 'dispense view' | 'banner promo'

export interface Advertisement {
  id: number
  client_id: number
  advertiser: string
  description: string
  file_type?: string
  spot: AdvertisementSpot | string
  start_date: string | null
  end_date: string | null
  start_hour: string | null
  end_hour: string | null
  vmcode: string[]
  vmid: number[]
  file: string
  created_at: string
  updated_at?: string
}

export interface VendingAdvertisement {
  id?: number
  advertisement_id: number
  vending_machine_id: number
  code: string
}

export interface AdvertisementClient {
  id: number
  name: string
}

export interface AdvertisementQuery {
  advertiser?: string
  spot?: string
  vmcode?: string
  startDate?: string
  endDate?: string
}

export interface UpdateAdvertisementPayload {
  vending_machine_id: number[]
  start_date?: string | null
  end_date?: string | null
  start_hour?: string | null
  end_hour?: string | null
}
