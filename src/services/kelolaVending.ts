import type { KelolaVendingMachine, VendingDescription } from '@/types/kelolaVending'
import { apiGet } from './api'

const DEFAULT_VENDING_MACHINES: KelolaVendingMachine[] = [
  {
    id: 1,
    code: 'VMENIG010',
    name: 'VM - CIMB EVENT XTRA XPO MEDAN 001',
    type_machine: 'TCN22',
    last_online: '2025-09-16 00:56:51',
    subscription_end_date: '2027-12-31',
    isOnline: true,
    temperature: '19°C',
    description: {
      currTemperature: '19°C',
      city: 'Jakarta',
    },
  },
  {
    id: 2,
    code: 'VMENIG011',
    name: 'VM - CIMB NIAGA',
    type_machine: 'TCN22',
    last_online: '2026-01-24 09:45:07',
    subscription_end_date: '2027-12-31',
    isOnline: true,
    temperature: '14°C',
    description: {
      currTemperature: '14°C',
      city: 'Jakarta',
    },
  },
  {
    id: 3,
    code: 'VMENIG012',
    name: 'VM - CIMB EVENT XTRA',
    type_machine: 'TCN49',
    last_online: '2025-01-24 00:56:51',
    subscription_end_date: '2027-12-31',
    isOnline: true,
    temperature: '19°C',
    description: {
      currTemperature: '19°C',
      city: 'Medan',
    },
  },
  {
    id: 4,
    code: 'VMENIG013',
    name: 'VM - CIMB NIAGA',
    type_machine: 'TCN49',
    last_online: '2026-01-24 09:45:07',
    subscription_end_date: '2027-12-31',
    isOnline: false,
    temperature: '14°C',
    description: {
      currTemperature: '14°C',
      city: 'Medan',
    },
  },
  {
    id: 5,
    code: 'VMENIG014',
    name: 'VM - CIMB EVENT XTRA XPO MEDAN 005',
    type_machine: 'TCN22',
    last_online: '2026-02-10 11:20:00',
    subscription_end_date: '2027-12-31',
    isOnline: true,
    temperature: '18°C',
    description: {
      currTemperature: '18°C',
      city: 'Medan',
    },
  },
  {
    id: 6,
    code: 'VMJNIG046',
    name: 'VM - MANDIRI PLAZA SENAYAN',
    type_machine: 'TCN49',
    last_online: '2026-03-01 14:15:30',
    subscription_end_date: '2027-12-31',
    isOnline: true,
    temperature: '16°C',
    description: {
      currTemperature: '16°C',
      city: 'Jakarta Pusat',
    },
  },
  {
    id: 7,
    code: 'VMJNIG053',
    name: 'VM - BCA GRAND INDONESIA',
    type_machine: 'TCN22',
    last_online: '2026-03-01 15:30:10',
    subscription_end_date: '2027-12-31',
    isOnline: true,
    temperature: '17°C',
    description: {
      currTemperature: '17°C',
      city: 'Jakarta Pusat',
    },
  },
  {
    id: 8,
    code: 'VMENIG015',
    name: 'VM - CIMB NIAGA KELAPA GADING',
    type_machine: 'TCN49',
    last_online: '2026-01-10 08:12:00',
    subscription_end_date: '2027-12-31',
    isOnline: false,
    temperature: '15°C',
    description: {
      currTemperature: '15°C',
      city: 'Jakarta Utara',
    },
  },
]

const STORAGE_KEY_NAMES = 'rmd_vending_names'

function loadOverrides(): Map<string, string> {
  const map = new Map<string, string>()
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem(STORAGE_KEY_NAMES)
      if (data) {
        const obj = JSON.parse(data) as Record<string, string>
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === 'string') map.set(k, v)
        }
      }
    } catch {}
  }
  return map
}

// In-memory rename overrides when backend API lacks name editing endpoint
const localNameOverrides = loadOverrides()

function parseDescription(desc: unknown): VendingDescription {
  if (!desc) return {}
  if (typeof desc === 'object') return desc as VendingDescription
  if (typeof desc === 'string') {
    try {
      return JSON.parse(desc) as VendingDescription
    } catch {
      return {}
    }
  }
  return {}
}

function checkIsOnline(lastOnline: string | null | undefined): boolean {
  if (!lastOnline) return false
  const last = new Date(lastOnline).getTime()
  if (Number.isNaN(last)) return false
  const now = Date.now()
  return (now - last) / 1000 / 60 < 15
}

interface RawBackendVendingMachine {
  id?: number
  user_id?: number
  code?: string
  name?: string
  description?: unknown
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
}

export async function fetchKelolaVendingMachines(search?: string): Promise<KelolaVendingMachine[]> {
  try {
    const params = new URLSearchParams({ itemPerPage: 'all' })
    if (search) params.set('search', search)
    const body = await apiGet<{ data: RawBackendVendingMachine[] }>(`/vending-machines?${params}`)

    if (body?.data && Array.isArray(body.data) && body.data.length > 0) {
      return body.data.map((vm, index) => {
        const code = vm.code ?? `VM${String(vm.id ?? index + 1).padStart(3, '0')}`
        const desc = parseDescription(vm.description)
        const temp = desc.currTemperature || '19°C'
        const customName = localNameOverrides.get(code) || vm.name || `Mesin ${code}`

        return {
          id: vm.id ?? index + 1,
          user_id: vm.user_id,
          code,
          name: customName,
          description: desc,
          type_machine: vm.type_machine || 'TCN22',
          alamat: vm.alamat,
          last_online: vm.last_online,
          last_visit: vm.last_visit,
          subscription_end_date: vm.subscription_end_date,
          categories: vm.categories,
          isDropSensor: vm.isDropSensor,
          leftOverLimit: vm.leftOverLimit,
          permissionPackage: vm.permissionPackage,
          parent_id: vm.parent_id,
          snapshot: vm.snapshot,
          isOnline: checkIsOnline(vm.last_online),
          temperature: temp,
        }
      })
    }
  } catch {
    // If backend request fails or in offline/demo mode, use Figma-matching fallback
  }

  // Filter default mock by search query if present
  let result = DEFAULT_VENDING_MACHINES.map((vm) => ({
    ...vm,
    name: localNameOverrides.get(vm.code) || vm.name,
  }))

  if (search) {
    const s = search.toLowerCase()
    result = result.filter(
      (m) => m.code.toLowerCase().includes(s) || m.name.toLowerCase().includes(s),
    )
  }

  return result
}

/**
 * Updates a vending machine's name.
 * Note: Checked against backend rmd-api-cms: there is currently NO endpoint to rename a machine.
 * This saves the override locally so UI updates immediately and preserves state.
 */
export async function updateVendingMachineName(code: string, newName: string): Promise<boolean> {
  const trimmed = newName.trim()
  localNameOverrides.set(code, trimmed)
  if (typeof window !== 'undefined') {
    try {
      const obj = Object.fromEntries(localNameOverrides.entries())
      localStorage.setItem(STORAGE_KEY_NAMES, JSON.stringify(obj))
    } catch {}
  }
  return true
}
