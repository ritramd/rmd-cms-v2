// Validation of the VM & Machine Config form: the same rules and messages as v1 (pages/vm-config/index.vue).
import type { ConfigErrors, MachineConfigForm, VmConfigForm } from '@/types/vmConfig'

export function validateVmConfig(form: VmConfigForm): ConfigErrors<VmConfigForm> {
  const errors: ConfigErrors<VmConfigForm> = {}
  if (!form.journey) errors.journey = 'Harus pilih Journey'
  if (!form.module) errors.module = 'Harus pilih Modul'
  else if (form.module === 'keypad' && form.journey !== 'SinglePurchase') {
    errors.module = 'Keypad hanya berlaku untuk Journey single purchase!'
  }
  if (!form.prefixUrl.trim()) errors.prefixUrl = 'Harus pilih Template'
  if (!form.buttonColor) errors.buttonColor = 'Harus pilih warna button'
  if (!form.fontColor) errors.fontColor = 'Harus pilih warna font'
  if (!form.qrProviders.trim()) errors.qrProviders = 'Harus pilih Payment Gateway'
  if (!form.mid.trim()) errors.mid = 'Harus tetapkan MID'
  if (form.isQris && !form.tid.trim()) errors.tid = 'MID & TID tidak boleh kosong jika Qris diaktifkan'
  return errors
}

export function validateMachineConfig(form: MachineConfigForm): ConfigErrors<MachineConfigForm> {
  return form.categories ? {} : { categories: 'Pilih Categori' }
}
