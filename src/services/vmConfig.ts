import { DEFAULT_BUTTON_COLOR, DEFAULT_FONT_COLOR } from '@/components/configs/options'
import type { SalesMachine } from '@/types/sales'
import type { ConfigFlag, MachineConfigForm, VmConfigForm, VmConfigRow } from '@/types/vmConfig'
import { apiGet, apiSendJson } from './api'

const isOn = (flag: ConfigFlag) => flag === true || flag === 1 || flag === '1'

/** Every machine the account can configure (GET /vending-machines?itemPerPage=all, as v1). */
export async function fetchConfigMachines(): Promise<SalesMachine[]> {
  const body = await apiGet<{ data?: SalesMachine[] } | undefined>('/vending-machines?itemPerPage=all')
  return body?.data ?? []
}

/**
 * Kiosk settings of a machine (GET /config/:vmCode). `exists` is false when the machine has no
 * config row yet; the form then starts empty, with v1's default colors.
 */
export async function fetchVmConfig(code: string): Promise<{ exists: boolean; form: VmConfigForm }> {
  const body = await apiGet<{ data?: VmConfigRow | null } | undefined>(`/config/${encodeURIComponent(code)}`)
  const row = body?.data ?? null
  return {
    exists: row !== null,
    form: {
      isIdleScreen: isOn(row?.isIdleScreen),
      isCash: isOn(row?.isCash),
      isQris: isOn(row?.isQris),
      isEmoney: isOn(row?.isEmoney),
      isVoucher: isOn(row?.isVoucher),
      isMaintenance: isOn(row?.isMaintenance),
      journey: row?.journey ?? '',
      module: row?.module ?? '',
      prefixUrl: row?.prefixUrl ?? '',
      buttonColor: row?.buttonColor || DEFAULT_BUTTON_COLOR,
      fontColor: row?.fontColor || DEFAULT_FONT_COLOR,
      qrProviders: row?.qrProviders ?? '',
      mid: row?.mid ?? '',
      tid: row?.tid ?? '',
      mid_emoney: row?.mid_emoney ?? '',
      tid_emoney: row?.tid_emoney ?? '',
    },
  }
}

/** Hardware settings of a machine (GET /vm/admin/:code; 204 when the machine is unknown). */
export async function fetchMachineConfig(code: string): Promise<MachineConfigForm> {
  const body = await apiGet<{ data?: { categories?: string | null; isDropSensor?: ConfigFlag } | null } | undefined>(
    `/vm/admin/${encodeURIComponent(code)}`,
  )
  return {
    categories: body?.data?.categories ?? '',
    isDropSensor: isOn(body?.data?.isDropSensor),
  }
}

/** PUT /config: creates or updates the machine's config row. */
export async function saveVmConfig(code: string, form: VmConfigForm): Promise<void> {
  await apiSendJson('/config', 'PUT', { configData: { code, ...form } })
}

/**
 * PUT /vm/config. The endpoint writes every column it receives onto vending_machines, so only the
 * two edited fields are sent: v1 sent the whole row it had loaded, overwriting values the machine
 * had reported since (last_online, cash_remain, description, …) with stale ones.
 */
export async function saveMachineConfig(code: string, form: MachineConfigForm): Promise<void> {
  await apiSendJson('/vm/config', 'PUT', {
    configData: { code, categories: form.categories, isDropSensor: form.isDropSensor },
  })
}
