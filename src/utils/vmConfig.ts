// Validation of the VM & Machine Config form: v1's rules (pages/vm-config/index.vue), with clearer messages.
import type { ConfigErrors, MachineConfigForm, VmConfigForm } from '@/types/vmConfig'

export function validateVmConfig(form: VmConfigForm): ConfigErrors<VmConfigForm> {
  const errors: ConfigErrors<VmConfigForm> = {}
  if (!form.journey) errors.journey = 'Pilih alur belanja.'
  if (!form.module) errors.module = 'Pilih modul.'
  else if (form.module === 'keypad' && form.journey !== 'SinglePurchase') {
    errors.module = 'Keypad hanya bisa dipakai dengan alur Single Purchase.'
  }
  if (!form.prefixUrl.trim()) errors.prefixUrl = 'Pilih atau ketik template.'
  if (!form.buttonColor) errors.buttonColor = 'Pilih warna tombol.'
  if (!form.fontColor) errors.fontColor = 'Pilih warna teks.'
  if (!form.qrProviders.trim()) errors.qrProviders = 'Pilih penyedia QR.'
  if (!form.mid.trim()) errors.mid = 'MID wajib diisi.'
  if (form.isQris && !form.tid.trim()) errors.tid = 'TID wajib diisi jika QRIS aktif.'
  return errors
}

export function validateMachineConfig(form: MachineConfigForm): ConfigErrors<MachineConfigForm> {
  return form.categories ? {} : { categories: 'Pilih kategori mesin.' }
}
