export type VendingStatus = 'online' | 'offline' | 'maintenance'

export type VendingType = 'snack' | 'drink' | 'coffee'

export interface VendingMachine {
  /** Shown as "ID: #…"; the machine code (vmcode) for API data. */
  id: string
  name: string
  /** Unknown for API data; rows then use the generic machine icon. */
  type?: VendingType
  /** Not provided by GET /status-vending. */
  location?: string
  status: VendingStatus
  /** Stock level, 0–100; null when the machine has no capacity configured. */
  stock: number | null
  /** Today's settled sales (GET /status-vending → today_sales). */
  revenue?: number
}
