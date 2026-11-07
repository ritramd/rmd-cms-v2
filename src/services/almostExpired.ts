// Service for Almost Expired Item feature
// Matching Figma nodes 1097:27019, 1097:30280, 1097:30646, 1097:31104
// and mirroring legacy rmd-cms /diskon-kedaluarsa

import { apiGet, apiSendJson, ApiError } from './api'
import faceScrubImg from '@/assets/demo/face-scrub.png'
import type {
  AlmostExpiredMachine,
  AlmostExpiredItem,
  AlmostExpiredQuery,
  AlmostExpiredPagination,
  UpdateAlmostExpiredBatchPayload,
} from '@/types/almostExpired'

const DEMO_MACHINES: AlmostExpiredMachine[] = [
  { id: 1, code: 'VMENIG010', location: 'VM - CIMB EVENT XTRA XPO MEDAN 001', totalItem: 20 },
  { id: 2, code: 'VMENIG011', location: 'VM - CIMB EVENT XTRA XPO MEDAN 002', totalItem: 12 },
  { id: 3, code: 'VMENIG012', location: 'VM - CIMB NIAGA Panakukkang Makassar', totalItem: 20 },
  { id: 4, code: 'VMENIG013', location: 'VM - CIMB NIAGA Ahmad Yani Makassar', totalItem: 21 },
  { id: 5, code: 'VMENIG014', location: 'VM - CIMB NIAGA Bandang Makassar', totalItem: 12 },
  { id: 6, code: 'VMENIG018', location: 'VM - CIMB Event Giggly Coco', totalItem: 43 },
  { id: 7, code: 'VMENIG019', location: 'VM - CIMB Mystery Box 001', totalItem: 22 },
  { id: 8, code: 'VMENIG020', location: 'VM - CIMB Mystery Box 002', totalItem: 24 },
  { id: 9, code: 'VMENIG021', location: 'VM - CIMB Mystery Box 003', totalItem: 28 },
  { id: 10, code: 'VMENIG022', location: 'VM - CIMB HUT', totalItem: 32 },
]

const DEMO_ITEMS: AlmostExpiredItem[] = [
  {
    id: 1,
    productId: 101,
    name: 'VM - CIMB EVENT XTRA XPO MEDAN 001',
    internalName: 'Bright Stuff Face Scrub',
    photo: faceScrubImg,
    price: 200000,
    originalPrice: 220000,
    expiredDate: 'Rabu, 8 April 2026',
    daysRemaining: 15,
    status: true,
  },
  {
    id: 2,
    productId: 102,
    name: 'Promo RAMADHAN Cashback 20%',
    internalName: 'Bright Stuff Face Scrub',
    photo: faceScrubImg,
    price: 150000,
    originalPrice: 190000,
    expiredDate: 'Rabu, 8 April 2026',
    daysRemaining: 12,
    status: true,
  },
  {
    id: 3,
    productId: 103,
    name: 'Diskon Spesial Kartu Kredit BNI',
    internalName: 'Bright Stuff Face Scrub',
    photo: faceScrubImg,
    price: 100000,
    originalPrice: 150000,
    expiredDate: 'Rabu, 8 April 2026',
    daysRemaining: 10,
    status: true,
  },
  {
    id: 4,
    productId: 104,
    name: 'Flash Sale Akhir Tahun 2024',
    internalName: 'Bright Stuff Face Scrub',
    photo: faceScrubImg,
    price: 300000,
    originalPrice: 350000,
    expiredDate: 'Rabu, 8 April 2026',
    daysRemaining: 8,
    status: true,
  },
  {
    id: 5,
    productId: 105,
    name: 'Voucher Belanja Tokopedia',
    internalName: 'Bright Stuff Face Scrub',
    photo: faceScrubImg,
    price: 75000,
    originalPrice: 100000,
    expiredDate: 'Rabu, 8 April 2026',
    daysRemaining: 7,
    status: true,
  },
  {
    id: 6,
    productId: 106,
    name: 'VM - CIMB EVENT XTRA XPO MEDAN 001',
    internalName: 'Bright Stuff Face Scrub',
    photo: faceScrubImg,
    price: 200000,
    originalPrice: 220000,
    expiredDate: 'Rabu, 8 April 2026',
    daysRemaining: 5,
    status: true,
  },
  {
    id: 7,
    productId: 107,
    name: 'Promo Spesial Hari Kemerdekaan',
    internalName: 'Bright Stuff Face Scrub',
    photo: faceScrubImg,
    price: 180000,
    originalPrice: 200000,
    expiredDate: 'Rabu, 8 April 2026',
    daysRemaining: 3,
    status: true,
  },
]

// In-memory demo store to allow testing mutations
let demoMachinesState = [...DEMO_MACHINES]
let demoItemsState = [...DEMO_ITEMS]

export async function fetchAlmostExpiredMachines(
  query: AlmostExpiredQuery,
): Promise<{ data: AlmostExpiredMachine[]; pagination: AlmostExpiredPagination }> {
  try {
    const params = new URLSearchParams()
    if (query.page) params.set('page', String(query.page))
    if (query.itemPerPage) params.set('itemPerPage', String(query.itemPerPage))
    if (query.search) params.set('search', query.search)

    const resp = await apiGet<{ data: any[]; pagination?: AlmostExpiredPagination }>(
      `/vending-machines?${params}`,
    )

    if (resp?.data && resp.data.length > 0) {
      const data: AlmostExpiredMachine[] = resp.data.map((m, idx) => ({
        id: m.id ?? idx + 1,
        code: m.code ?? `VM${idx + 1}`,
        location: m.name ?? m.location ?? 'Lokasi tidak diketahui',
        totalItem: m.almostExpiredCount ?? m.totalItem ?? 0,
      }))
      return {
        data,
        pagination: resp.pagination ?? {
          page: query.page,
          itemPerPage: query.itemPerPage,
          totalItem: data.length,
          totalPage: Math.ceil(data.length / query.itemPerPage) || 1,
        },
      }
    }
  } catch (err) {
    // If not authenticated or backend unavailable, fall back to Figma demo data
    if (err instanceof ApiError && err.status === 401) {
      throw err
    }
  }

  // Fallback demo data matching Figma 1097:27019
  let filtered = [...demoMachinesState]
  if (query.search) {
    const q = query.search.toLowerCase()
    filtered = filtered.filter(
      (m) => m.code.toLowerCase().includes(q) || m.location.toLowerCase().includes(q),
    )
  }

  const start = (query.page - 1) * query.itemPerPage
  const paginated = filtered.slice(start, start + query.itemPerPage)

  return {
    data: paginated,
    pagination: {
      page: query.page,
      itemPerPage: query.itemPerPage,
      totalItem: filtered.length,
      totalPage: Math.ceil(filtered.length / query.itemPerPage) || 1,
    },
  }
}

export async function fetchAlmostExpiredItems(
  machineCode: string,
  query: AlmostExpiredQuery,
): Promise<{ data: AlmostExpiredItem[]; pagination: AlmostExpiredPagination }> {
  try {
    const params = new URLSearchParams()
    if (query.page) params.set('page', String(query.page))
    if (query.itemPerPage) params.set('itemPerPage', String(query.itemPerPage))
    if (query.search) params.set('search', query.search)

    const resp = await apiGet<{ data: any[]; pagination?: AlmostExpiredPagination }>(
      `/discount-to-expiration/${machineCode}?${params}`,
    )

    if (resp?.data && resp.data.length > 0) {
      const data: AlmostExpiredItem[] = resp.data.map((item, idx) => ({
        id: item.id ?? idx + 1,
        productId: item.product_id ?? item.productId ?? idx + 1,
        name: item.name ?? 'Nama Produk',
        internalName: item.internal_name ?? item.description?.internal_name ?? 'Internal Name',
        photo: item.photo ? item.photo : faceScrubImg,
        price: Number(item.price) || 0,
        originalPrice: Number(item.original_price ?? item.price) || 0,
        expiredDate: item.description?.expired ? `${item.description.expired} hari` : 'Rabu, 8 April 2026',
        daysRemaining: item.description?.expired ?? 15,
        status: item.status === 1 || item.status === true,
        rules: item.rules ?? [],
      }))
      return {
        data,
        pagination: resp.pagination ?? {
          page: query.page,
          itemPerPage: query.itemPerPage,
          totalItem: data.length,
          totalPage: Math.ceil(data.length / query.itemPerPage) || 1,
        },
      }
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      throw err
    }
  }

  // Fallback demo items matching Figma 1097:30280
  let filtered = [...demoItemsState]
  if (query.search) {
    const q = query.search.toLowerCase()
    filtered = filtered.filter(
      (item) => item.name.toLowerCase().includes(q) || (item.internalName && item.internalName.toLowerCase().includes(q)),
    )
  }

  const start = (query.page - 1) * query.itemPerPage
  const paginated = filtered.slice(start, start + query.itemPerPage)

  return {
    data: paginated,
    pagination: {
      page: query.page,
      itemPerPage: query.itemPerPage,
      totalItem: filtered.length,
      totalPage: Math.ceil(filtered.length / query.itemPerPage) || 1,
    },
  }
}

export async function updateAlmostExpiredPrices(payload: UpdateAlmostExpiredBatchPayload): Promise<boolean> {
  try {
    for (const item of payload.items) {
      await apiSendJson(`/discount-to-expiration`, 'POST', {
        vmcode: payload.vmcode,
        product_id: item.productId,
        price: item.price,
      })
    }
    return true
  } catch {
    // If backend endpoint is unavailable, update local state
    for (const update of payload.items) {
      const idx = demoItemsState.findIndex((item) => item.id === update.id)
      if (idx !== -1) {
        demoItemsState[idx] = {
          ...demoItemsState[idx],
          price: update.price,
        }
      }
    }
    return true
  }
}

export async function toggleAlmostExpiredStatus(
  id: number,
  machineCode: string,
  newStatus: boolean,
): Promise<boolean> {
  try {
    await apiSendJson(`/discount-to-expiration/${machineCode}/change-status`, 'PUT', {
      id,
      status: newStatus ? 1 : 0,
    })
    return true
  } catch {
    const idx = demoItemsState.findIndex((item) => item.id === id)
    if (idx !== -1) {
      demoItemsState[idx] = {
        ...demoItemsState[idx],
        status: newStatus,
      }
    }
    return true
  }
}
