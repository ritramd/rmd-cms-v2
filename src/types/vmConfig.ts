// VM & Machine Config (v1: pages/vm-config/index.vue, types/vmConfig.d.ts).
// GET /config/:vmCode and PUT /config → rmd-api-cms vmConfig.controller.ts (table vending_machines_configs).
// GET /vm/admin/:code and PUT /vm/config → kelolaVending.controller.ts (table vending_machines).

/** Flags come back as booleans, 0/1 or "0"/"1" depending on the column and driver. */
export type ConfigFlag = boolean | number | string | null | undefined

/** Row of vending_machines_configs as GET /config/:vmCode returns it (data is null when none exists). */
export interface VmConfigRow {
  code: string
  isIdleScreen?: ConfigFlag
  isCash?: ConfigFlag
  isQris?: ConfigFlag
  isEmoney?: ConfigFlag
  isVoucher?: ConfigFlag
  isMaintenance?: ConfigFlag
  journey?: string | null
  module?: string | null
  prefixUrl?: string | null
  buttonColor?: string | null
  fontColor?: string | null
  qrProviders?: string | null
  mid?: string | null
  tid?: string | null
  mid_emoney?: string | null
  tid_emoney?: string | null
}

/** Editable kiosk settings of one machine ("VM Configuration"). */
export interface VmConfigForm {
  isIdleScreen: boolean
  isCash: boolean
  isQris: boolean
  isEmoney: boolean
  isVoucher: boolean
  isMaintenance: boolean
  journey: string
  module: string
  prefixUrl: string
  buttonColor: string
  fontColor: string
  qrProviders: string
  mid: string
  tid: string
  mid_emoney: string
  tid_emoney: string
}

/** Hardware settings stored on vending_machines ("Machine Configuration (ALO)"). */
export interface MachineConfigForm {
  categories: string
  isDropSensor: boolean
}

export interface ConfigOption {
  label: string
  value: string
}

/** Field name → message, for the fields that failed validation. */
export type ConfigErrors<T> = Partial<Record<keyof T, string>>
