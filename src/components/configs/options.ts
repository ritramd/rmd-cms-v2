// Choices of the VM & Machine Config form, as listed in v1 (pages/vm-config/index.vue).
import type { ConfigOption } from '@/types/vmConfig'

export const JOURNEY_OPTIONS: ConfigOption[] = [
  { label: 'Single Purchase', value: 'SinglePurchase' },
  /** Pro / Priority packages and dev only. */
  { label: 'Cart Purchase', value: 'CartPurchase' },
]

export const MODULE_OPTIONS: ConfigOption[] = [
  { label: 'Product Showcase', value: 'showcase' },
  /** Single Purchase journey only. */
  { label: 'Keypad', value: 'keypad' },
  { label: 'Spin The Wheel', value: 'spinwheel' },
]

/** Suggestions; v1 also accepts any other template name. */
export const TEMPLATE_OPTIONS: ConfigOption[] = [
  { label: 'Smartven', value: 'smartven' },
  { label: 'Free Dispense', value: 'free_kors' },
  { label: 'Claw Machine', value: 'claw_machine' },
]

/** Suggestions; v1 also accepts any other provider name. */
export const QR_PROVIDER_OPTIONS: ConfigOption[] = [
  { label: 'Midtrans', value: 'midtrans' },
  { label: 'CIMB', value: 'cimb' },
  { label: 'CIMB SNAP', value: 'cimb_snap' },
  { label: 'PosPay', value: 'pospay' },
  { label: 'BPR Karyajatnika Sadaya', value: 'bprks' },
]

export const MACHINE_CATEGORY_OPTIONS: ConfigOption[] = [
  { label: 'Chiller', value: 'chiller' },
  { label: 'Frozen', value: 'frozen' },
  { label: 'Wall Mounted', value: 'wall_mounted' },
  { label: 'Lifter CRC', value: 'lifter_crc' },
  { label: 'XY', value: 'xy' },
  { label: 'Claw Machine', value: 'claw_machine' },
]

/** v1 fills these in when the machine has no color yet. */
export const DEFAULT_BUTTON_COLOR = '#2E3385'
export const DEFAULT_FONT_COLOR = '#000000'
