import { apiGet, apiSendJson } from './api'
import type { VmConfig, VmMachineDetail } from '@/types/vmConfig'

// In-memory fallback cache for development or when backend is temporarily offline
const localVmConfigCache = new Map<string, Partial<VmConfig>>()
const localMachineConfigCache = new Map<string, Partial<VmMachineDetail>>()

export function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true'
  return false
}

/**
 * Fetch VM configuration (QRIS, Cash, E-Money, Button Color, Journey, Module, etc.)
 * Mirrors legacy Nuxt 3: GET /config/:vmCode
 */
export async function fetchVmConfig(code: string): Promise<VmConfig | null> {
  const normalizedCode = code.toUpperCase().trim()
  try {
    const res = await apiGet<{ data?: VmConfig } | undefined>(`/config/${encodeURIComponent(normalizedCode)}`)
    if (res?.data) {
      localVmConfigCache.set(normalizedCode, res.data)
      return res.data
    }
  } catch (err) {
    // Graceful fallback to cache or defaults
    console.warn(`[vmConfig] Unable to fetch /config/${normalizedCode}, using local cache/defaults:`, err)
  }

  const cached = localVmConfigCache.get(normalizedCode)
  if (cached) {
    return {
      code: normalizedCode,
      ...cached,
    }
  }

  return {
    code: normalizedCode,
    isQris: true,
    isCash: true,
    isEmoney: true,
    buttonColor: '#5F93EC',
    journey: 'default',
    module: 'standard',
  }
}

/**
 * Fetch Vending Machine detail (Drop Sensor, categories, type_machine)
 * Mirrors legacy Nuxt 3: GET /vm/admin/:vmCode
 */
export async function fetchMachineConfig(code: string): Promise<VmMachineDetail | null> {
  const normalizedCode = code.toUpperCase().trim()
  try {
    const res = await apiGet<{ data?: VmMachineDetail } | undefined>(`/vm/admin/${encodeURIComponent(normalizedCode)}`)
    if (res?.data) {
      localMachineConfigCache.set(normalizedCode, res.data)
      return res.data
    }
  } catch (err) {
    console.warn(`[vmConfig] Unable to fetch /vm/admin/${normalizedCode}, using local cache/defaults:`, err)
  }

  const cached = localMachineConfigCache.get(normalizedCode)
  if (cached) {
    return {
      code: normalizedCode,
      ...cached,
    }
  }

  return {
    code: normalizedCode,
    isDropSensor: true,
    type_machine: 'TCN22',
  }
}

/**
 * Save VM Configuration (QRIS, Cash, E-Money, Color, Journey, etc.)
 * Mirrors legacy Nuxt 3: PUT /config with body { configData: { ...config, code } }
 */
export async function updateVmConfig(code: string, config: Partial<VmConfig>): Promise<void> {
  const normalizedCode = code.toUpperCase().trim()
  const payload = {
    ...config,
    code: normalizedCode,
  }

  // Update local cache immediately
  localVmConfigCache.set(normalizedCode, {
    ...(localVmConfigCache.get(normalizedCode) || {}),
    ...payload,
  })

  try {
    await apiSendJson<{ data: string }>('/config', 'PUT', { configData: payload })
  } catch (err) {
    console.warn(`[vmConfig] Backend PUT /config failed, cached locally:`, err)
    // If running in local demo without backend, cache update is preserved
  }
}

/**
 * Save Machine Configuration (Drop Sensor, type_machine, categories)
 * Mirrors legacy Nuxt 3: PUT /vm/config with body { configData: { ...machine, code } }
 */
export async function updateMachineConfig(code: string, machine: Partial<VmMachineDetail>): Promise<void> {
  const normalizedCode = code.toUpperCase().trim()
  const payload = {
    ...machine,
    code: normalizedCode,
  }

  // Update local cache immediately
  localMachineConfigCache.set(normalizedCode, {
    ...(localMachineConfigCache.get(normalizedCode) || {}),
    ...payload,
  })

  try {
    await apiSendJson<{ data: string }>('/vm/config', 'PUT', { configData: payload })
  } catch (err) {
    console.warn(`[vmConfig] Backend PUT /vm/config failed, cached locally:`, err)
  }
}
