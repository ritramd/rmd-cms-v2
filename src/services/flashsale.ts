// Flash sale API client and domain helpers mirroring legacy rmd-cms and rmd-api-cms.
import { apiGet, apiSendJson } from './api'
import type { Pagination, ProductRecord } from '@/types/product'
import type {
  AddFlashsaleItemsPayload,
  CreateFlashsalePayload,
  FlashsaleItem,
  FlashsaleItemDetail,
  FlashsaleListResponse,
  FlashsaleQuery,
  FlashsaleRule,
} from '@/types/flashsale'

export const DEFAULT_MACHINE_CODE = 'VMJFEL001'
export const DEFAULT_MACHINE_NAME = 'Manage VM – CIMB EVENT XTRA XPO MEDAN 001'

const STORAGE_KEY_FLASHSALES = 'rmd_cms_flashsale_rules'

const INITIAL_DEMO_RULES: FlashsaleRule[] = [
  {
    id: 1,
    vmcode: DEFAULT_MACHINE_CODE,
    name: 'FLASHSALE 1',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    startDate: '2026-04-01',
    endDate: '2026-04-08',
    startTime: '00:00',
    endTime: '00:00',
    discountValue: 12,
    status: 'scheduled',
    items: [
      {
        id: 1,
        flashsaleId: 1,
        productId: 1,
        name: 'Bright Stuff Face Scrub',
        displayName: 'Bright Stuff Face Scrub 50 ml',
        sku: '808',
        price: 21000,
        photo: '',
      },
      {
        id: 2,
        flashsaleId: 1,
        productId: 2,
        name: 'AQUA Mineral Water',
        displayName: 'AQUA Mineral 600ml',
        sku: '1220001',
        price: 5000,
        photo: '',
      },
      {
        id: 3,
        flashsaleId: 1,
        productId: 3,
        name: 'Teh Botol Sosro',
        displayName: 'Teh Botol Sosro Kotak 250ml',
        sku: '330101',
        price: 4500,
        photo: '',
      },
      {
        id: 4,
        flashsaleId: 1,
        productId: 4,
        name: 'Pocari Sweat Can',
        displayName: 'Pocari Sweat Can 330ml',
        sku: '440101',
        price: 8000,
        photo: '',
      },
    ],
  },
  {
    id: 2,
    vmcode: DEFAULT_MACHINE_CODE,
    name: 'FLASHSALE 2',
    days: ['Senin', 'Rabu', 'Jumat'],
    startDate: '2026-04-15',
    endDate: '2026-04-22',
    startTime: '08:00',
    endTime: '20:00',
    discountValue: 15,
    status: 'scheduled',
    items: [
      {
        id: 21,
        flashsaleId: 2,
        productId: 2,
        name: 'AQUA Mineral Water',
        displayName: 'AQUA Mineral 600ml',
        sku: '1220001',
        price: 4500,
        photo: '',
      },
      {
        id: 22,
        flashsaleId: 2,
        productId: 3,
        name: 'Teh Botol Sosro',
        displayName: 'Teh Botol Sosro Kotak 250ml',
        sku: '330101',
        price: 4000,
        photo: '',
      },
    ],
  },
  {
    id: 3,
    vmcode: DEFAULT_MACHINE_CODE,
    name: 'FLASHSALE 3',
    days: ['Selasa', 'Kamis'],
    startDate: '2026-04-20',
    endDate: '2026-04-27',
    startTime: '09:00',
    endTime: '21:00',
    discountValue: 10,
    status: 'scheduled',
    items: [
      {
        id: 31,
        flashsaleId: 3,
        productId: 1,
        name: 'Bright Stuff Face Scrub',
        displayName: 'Bright Stuff Face Scrub 50 ml',
        sku: '808',
        price: 22500,
        photo: '',
      },
    ],
  },
  {
    id: 7,
    vmcode: DEFAULT_MACHINE_CODE,
    name: 'FLASHSALE 7',
    days: ['Minggu'],
    startDate: '2026-05-03',
    endDate: '2026-05-03',
    startTime: '00:00',
    endTime: '23:59',
    discountValue: 30,
    status: 'scheduled',
    items: [
      {
        id: 71,
        flashsaleId: 7,
        productId: 4,
        name: 'Pocari Sweat Can',
        displayName: 'Pocari Sweat Can 330ml',
        sku: '440101',
        price: 7000,
        photo: '',
      },
    ],
  },
  {
    id: 8,
    vmcode: DEFAULT_MACHINE_CODE,
    name: 'FLASHSALE 8',
    days: ['Selasa', 'Rabu', 'Kamis'],
    startDate: '2026-05-05',
    endDate: '2026-05-07',
    startTime: '06:00',
    endTime: '18:00',
    discountValue: 22,
    status: 'scheduled',
    items: [
      {
        id: 81,
        flashsaleId: 8,
        productId: 2,
        name: 'AQUA Mineral Water',
        displayName: 'AQUA Mineral 600ml',
        sku: '1220001',
        price: 4800,
        photo: '',
      },
    ],
  },
]

function getStoredRules(): FlashsaleRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FLASHSALES)
    if (raw) return JSON.parse(raw) as FlashsaleRule[]
  } catch {
    // Ignore storage errors
  }
  return INITIAL_DEMO_RULES
}

function saveStoredRules(rules: FlashsaleRule[]) {
  try {
    localStorage.setItem(STORAGE_KEY_FLASHSALES, JSON.stringify(rules))
  } catch {
    // Ignore storage errors
  }
}

export async function fetchFlashsales(
  vmcode: string,
  query: FlashsaleQuery,
): Promise<FlashsaleListResponse> {
  const params = new URLSearchParams({
    page: String(query.page),
    itemPerPage: String(query.itemPerPage),
  })
  if (query.search?.trim()) params.set('search', query.search.trim())

  try {
    const res = await apiGet<{ data: FlashsaleItem[]; pagination: Pagination }>(
      `/flashsale/${vmcode}?${params}`,
    )
    if (res?.data) {
      return {
        data: res.data,
        pagination: res.pagination ?? {
          page: query.page,
          itemPerPage: query.itemPerPage,
          totalItem: res.data.length,
          totalPage: Math.max(1, Math.ceil(res.data.length / query.itemPerPage)),
        },
      }
    }
  } catch {
    // Fall back to local mock data
  }

  const stored = getStoredRules()
  let filtered = stored.filter((r) => r.vmcode === vmcode || !r.vmcode)
  if (query.search?.trim()) {
    const term = query.search.trim().toLowerCase()
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(term))
  }

  const start = (query.page - 1) * query.itemPerPage
  const paginated = filtered.slice(start, start + query.itemPerPage)

  const items: FlashsaleItem[] = paginated.map((r) => ({
    id: r.id,
    vmcode: r.vmcode,
    product_id: r.items?.[0]?.productId ?? 1,
    amount: r.discountValue,
    start_date: r.startDate,
    end_date: r.endDate,
    start_hour: r.startTime,
    end_hour: r.endTime,
    status: r.status,
    days: r.days.join(', '),
    product: r.name,
    price: r.items?.[0]?.price ?? 200000,
    photo: r.items?.[0]?.photo ?? '',
  }))

  return {
    data: items,
    pagination: {
      page: query.page,
      itemPerPage: query.itemPerPage,
      totalItem: filtered.length,
      totalPage: Math.max(1, Math.ceil(filtered.length / query.itemPerPage)),
    },
  }
}

export async function fetchFlashsaleRules(
  vmcode: string,
  query: FlashsaleQuery,
): Promise<{ data: FlashsaleRule[]; pagination: Pagination }> {
  const stored = getStoredRules()
  let filtered = stored.filter((r) => r.vmcode === vmcode || !r.vmcode)
  if (query.search?.trim()) {
    const term = query.search.trim().toLowerCase()
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(term))
  }

  const start = (query.page - 1) * query.itemPerPage
  const paginated = filtered.slice(start, start + query.itemPerPage)

  return {
    data: paginated,
    pagination: {
      page: query.page,
      itemPerPage: query.itemPerPage,
      totalItem: filtered.length,
      totalPage: Math.max(1, Math.ceil(filtered.length / query.itemPerPage)),
    },
  }
}

export async function createFlashsale(
  payload: CreateFlashsalePayload,
): Promise<{ id: number; message: string }> {
  try {
    const body = {
      vmcode: payload.vmcode,
      product_id: payload.productIds ?? [],
      start_date: payload.startDate,
      end_date: payload.endDate,
      start_hour: payload.startTime,
      end_hour: payload.endTime,
      amount: payload.discountValue,
      days: payload.days,
    }
    await apiSendJson(`/flashsale/${payload.vmcode}`, 'POST', body)
  } catch {
    // Fall back to local store
  }

  const stored = getStoredRules()
  const newId = Date.now()
  const newRule: FlashsaleRule = {
    id: newId,
    vmcode: payload.vmcode,
    name: payload.name || `FLASHSALE ${stored.length + 1}`,
    days: payload.days,
    startDate: payload.startDate,
    endDate: payload.endDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
    discountValue: payload.discountValue,
    status: 'scheduled',
    items: [],
  }

  stored.unshift(newRule)
  saveStoredRules(stored)

  return { id: newId, message: 'Flashsale berhasil ditambahkan!' }
}

export function getFlashsaleRuleById(id: number): FlashsaleRule | undefined {
  const stored = getStoredRules()
  return stored.find((r) => r.id === id)
}

export function updateStoredRuleItem(ruleId: number, item: Partial<FlashsaleItemDetail> & { id: number }): void {
  const stored = getStoredRules()
  const rule = stored.find((r) => r.id === ruleId)
  if (rule && rule.items) {
    const idx = rule.items.findIndex((i) => i.id === item.id)
    if (idx >= 0) {
      rule.items[idx] = { ...rule.items[idx], ...item }
      saveStoredRules(stored)
    }
  }
}

export function deleteStoredRuleItem(ruleId: number, itemId: number): void {
  const stored = getStoredRules()
  const rule = stored.find((r) => r.id === ruleId)
  if (rule && rule.items) {
    rule.items = rule.items.filter((i) => i.id !== itemId)
    saveStoredRules(stored)
  }
}

export async function addItemsToFlashsale(
  payload: AddFlashsaleItemsPayload,
): Promise<{ message: string; addedItems?: FlashsaleItemDetail[] }> {
  try {
    const body = {
      product_id: payload.items.map((i) => i.productId),
      vmcode: payload.vmcode,
    }
    await apiSendJson(`/flashsale/${payload.vmcode}`, 'POST', body)
  } catch {
    // Fall back to local store
  }

  const stored = getStoredRules()
  const rule = stored.find((r) => r.id === payload.flashsaleId)
  const added: FlashsaleItemDetail[] = []

  let catalogProds: ProductRecord[] = []
  try {
    catalogProds = await fetchMachineProducts(payload.vmcode)
  } catch {
    // ignore
  }

  if (rule) {
    if (!rule.items) rule.items = []
    payload.items.forEach((item) => {
      const prod = catalogProds.find((p) => p.id === item.productId)
      const newItem: FlashsaleItemDetail = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        flashsaleId: payload.flashsaleId,
        productId: item.productId,
        name: prod?.name || prod?.display_name || '150#AQUA Mineral - 1220001',
        displayName: prod?.display_name || prod?.name || 'AQUA Mineral',
        sku: prod?.sku || '1220001',
        price: item.price,
        photo: prod?.photo || '',
      }
      rule.items!.unshift(newItem)
      added.push(newItem)
    })
    saveStoredRules(stored)
  }

  return { message: 'Item berhasil ditambahkan ke flashsale!', addedItems: added }
}

export async function updateFlashsaleStatus(
  id: number,
  status: 'scheduled' | 'suspended',
): Promise<void> {
  try {
    await apiSendJson('/flashsale', 'PUT', { id, status })
  } catch {
    // Fall back to local store
  }

  const stored = getStoredRules()
  const rule = stored.find((r) => r.id === id)
  if (rule) {
    rule.status = status
    saveStoredRules(stored)
  }
}

export async function deleteFlashsales(ids: number[]): Promise<void> {
  try {
    await apiSendJson('/flashsale', 'DELETE', { id: ids })
  } catch {
    // Fall back to local store
  }

  const stored = getStoredRules().filter((r) => !ids.includes(r.id))
  saveStoredRules(stored)
}

export async function fetchMachineProducts(
  vmcode: string,
  search?: string,
): Promise<ProductRecord[]> {
  try {
    const params = new URLSearchParams()
    if (search?.trim()) params.set('search', search.trim())
    const res = await apiGet<{ data: ProductRecord[] }>(`/products/${vmcode}?${params}`)
    if (res?.data && res.data.length > 0) return res.data
  } catch {
    // Fall back to catalog products
  }

  // Fallback demo product
  return [
    {
      id: 1,
      name: 'Bright Stuff Face Scrub',
      display_name: 'Bright Stuff Face Scrub 50 ml',
      sku: '808',
      price: 21000,
      categories: 'Skincare',
      photo: 'face-scrub.png',
      ownership: 1,
      category_id: 1,
    },
    {
      id: 2,
      name: 'Bright Stuff Moisturizing Cream',
      display_name: 'Moisturizing Cream 20 ml',
      sku: '809',
      price: 26000,
      categories: 'Skincare',
      photo: '',
      ownership: 1,
      category_id: 1,
    },
  ]
}
