export interface VmConfig {
  id?: number
  code: string
  isIdleScreen?: boolean | string | number | null
  isCash?: boolean | string | number | null
  isQris?: boolean | string | number | null
  isEmoney?: boolean | string | number | null
  isVoucher?: boolean | string | number | null
  isMaintenance?: boolean | string | number | null
  journey?: string | null
  prefixUrl?: string | null
  buttonColor?: string
  fontColor?: string
  qrProviders?: string | null
  mid?: string | null
  tid?: string | null
  mid_emoney?: string | null
  tid_emoney?: string | null
  module?: string | null
  updated_at?: string | null
}

export interface VmMachineDetail {
  id?: number
  code: string
  name?: string
  type_machine?: string
  categories?: string
  isDropSensor?: boolean | string | number | null
  isOnline?: boolean
  temperature?: string
  last_online?: string
  subscription_end_date?: string
}
