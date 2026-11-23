export interface VendingDescription {
  categories?: string
  owner?: string
  city?: string
  currTemperature?: string
  last_temperature_check?: string
}

export interface KelolaVendingMachine {
  id: number
  user_id?: number
  code: string
  name: string
  description?: VendingDescription
  type_machine?: string
  alamat?: string
  last_online?: string | null
  last_visit?: string | null
  subscription_end_date?: string | null
  categories?: string | null
  isDropSensor?: boolean | string | null
  leftOverLimit?: number | null
  permissionPackage?: string | null
  parent_id?: number | null
  snapshot?: string | null
  isOnline: boolean
  temperature: string
}

export interface KelolaVendingQuery {
  page?: number
  itemPerPage?: number | 'all'
  search?: string
}
