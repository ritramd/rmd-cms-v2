export interface UiEditorConfig {
  warnaDominan: string
  warnaAksen: string
  isDarkMode: boolean
  logoHeaderName: string
  logoHeaderSize: string
  logoHeaderUrl?: string
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Roboto' | 'Poppins'
  journey: string
  module: string
  templateUrl: string
  productGrid: string
}

export interface PhysicalConfig {
  machineType: 'TCN22' | 'TCN49'
  targetTemperature: number
  ledLightEnabled: boolean
  dropSensorEnabled: boolean
}

export interface PaymentConfig {
  qris: boolean
  cash: boolean
  card: boolean
  timeoutSeconds: number
  digitalReceipt: boolean
}

export const DEFAULT_UI_CONFIG: UiEditorConfig = {
  warnaDominan: '#FFFFFF',
  warnaAksen: '#5F93EC',
  isDarkMode: false,
  logoHeaderName: 'smartven_logo_v2.png',
  logoHeaderSize: 'PNG • 245 KB',
  fontFamily: 'Inter',
  journey: 'default',
  module: 'standard',
  templateUrl: 'https://kiosk.smartven.com/template/alpha-v2',
  productGrid: '3 x 4',
}

export const DEFAULT_PHYSICAL_CONFIG: PhysicalConfig = {
  machineType: 'TCN22',
  targetTemperature: 19,
  ledLightEnabled: true,
  dropSensorEnabled: true,
}

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  qris: true,
  cash: true,
  card: true,
  timeoutSeconds: 120,
  digitalReceipt: true,
}
