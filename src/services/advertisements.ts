import type {
  Advertisement,
  AdvertisementClient,
  AdvertisementQuery,
  UpdateAdvertisementPayload,
  VendingAdvertisement,
} from '@/types/advertisement'
import { apiDelete, apiGet, apiSendForm, apiSendJson } from './api'

const DEFAULT_MOCK_ADS: Advertisement[] = [
  {
    id: 1,
    client_id: 1,
    advertiser: 'ADMIN CIMB',
    description: 'header',
    spot: 'Header',
    start_date: null,
    end_date: null,
    start_hour: null,
    end_hour: null,
    vmcode: ['VMJNIG046', 'VMJNIG053'],
    vmid: [1, 2],
    file: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
    file_type: 'image/jpeg',
    created_at: '08-08-2026 20:52',
  },
  {
    id: 2,
    client_id: 2,
    advertiser: 'USER BCA',
    description: 'footer',
    spot: 'Footer',
    start_date: null,
    end_date: null,
    start_hour: null,
    end_hour: null,
    vmcode: ['ABCD1234', 'EFGH5678'],
    vmid: [3, 4],
    file: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    file_type: 'image/jpeg',
    created_at: '12-12-2027 14:30',
  },
  {
    id: 3,
    client_id: 3,
    advertiser: 'GUEST MANDIRI',
    description: 'content',
    spot: 'Body',
    start_date: null,
    end_date: null,
    start_hour: null,
    end_hour: null,
    vmcode: ['IJKL9012', 'MNOP3456'],
    vmid: [5, 6],
    file: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    file_type: 'image/jpeg',
    created_at: '01-01-2028 10:15',
  },
  {
    id: 4,
    client_id: 4,
    advertiser: 'USER BNI',
    description: 'header',
    spot: 'Header',
    start_date: null,
    end_date: null,
    start_hour: null,
    end_hour: null,
    vmcode: ['QRST7890'],
    vmid: [7],
    file: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    file_type: 'image/jpeg',
    created_at: '15-05-2028 09:00',
  },
  {
    id: 5,
    client_id: 5,
    advertiser: 'PARTNER PERMATA',
    description: 'footer',
    spot: 'Footer',
    start_date: null,
    end_date: null,
    start_hour: null,
    end_hour: null,
    vmcode: ['UVWX1234'],
    vmid: [8],
    file: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    file_type: 'image/jpeg',
    created_at: '20-11-2028 17:45',
  },
  {
    id: 6,
    client_id: 3,
    advertiser: 'GUEST MANDIRI',
    description: 'content',
    spot: 'Body',
    start_date: null,
    end_date: null,
    start_hour: null,
    end_hour: null,
    vmcode: ['XYZ9876', 'LMN5432'],
    vmid: [9, 10],
    file: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    file_type: 'image/jpeg',
    created_at: '01-01-2028 09:15',
  },
]

const DEFAULT_MOCK_CLIENTS: AdvertisementClient[] = [
  { id: 1, name: 'ADMIN CIMB' },
  { id: 2, name: 'USER BCA' },
  { id: 3, name: 'GUEST MANDIRI' },
  { id: 4, name: 'USER BNI' },
  { id: 5, name: 'PARTNER PERMATA' },
]

// In-memory local storage mock store for newly created/updated ads when offline/unsupported
const STORAGE_KEY_ADS = 'rmd_ui_materials'

function getLocalAds(): Advertisement[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADS)
      if (saved) {
        return JSON.parse(saved) as Advertisement[]
      }
    } catch {}
  }
  return [...DEFAULT_MOCK_ADS]
}

function saveLocalAds(ads: Advertisement[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_ADS, JSON.stringify(ads))
    } catch {}
  }
}

interface BackendAdsResponse {
  code: number
  data: {
    vendingDetail: Advertisement[]
    vendingAssignment: VendingAdvertisement[]
  }
}

export async function fetchAdvertisements(
  query?: AdvertisementQuery,
): Promise<{ data: Advertisement[]; clients: AdvertisementClient[] }> {
  try {
    const params = new URLSearchParams()
    if (query?.advertiser) params.set('advertiser', query.advertiser)
    if (query?.spot) params.set('spot', query.spot)
    if (query?.vmcode) params.set('vmcode', query.vmcode)
    if (query?.startDate) params.set('startDate', query.startDate)
    if (query?.endDate) params.set('endDate', query.endDate)

    const qs = params.toString() ? `?${params.toString()}` : ''
    const resp = await apiGet<BackendAdsResponse>(`/advertisements${qs}`)

    if (resp?.code === 200 && resp.data?.vendingDetail) {
      const details = resp.data.vendingDetail
      const assignments = resp.data.vendingAssignment || []

      const merged = details.map((ad) => {
        const adAssignments = assignments.filter((a) => a.advertisement_id === ad.id)
        return {
          ...ad,
          vmcode: adAssignments.map((a) => a.code),
          vmid: adAssignments.map((a) => a.vending_machine_id),
        }
      })

      const clients = await fetchClients()
      return { data: merged, clients }
    }
  } catch {
    // API unavailable or demo fallback
  }

  // Use local mock storage
  let list = getLocalAds()

  if (query?.advertiser && query.advertiser !== 'Semua') {
    const s = query.advertiser.toLowerCase()
    list = list.filter((ad) => ad.advertiser.toLowerCase().includes(s))
  }
  if (query?.spot && query.spot !== 'Semua') {
    const s = query.spot.toLowerCase()
    list = list.filter((ad) => ad.spot.toLowerCase() === s)
  }
  if (query?.vmcode && query.vmcode !== 'Semua') {
    list = list.filter((ad) => ad.vmcode.includes(query.vmcode!))
  }
  if (query?.startDate) {
    list = list.filter((ad) => !ad.start_date || ad.start_date >= query.startDate!)
  }
  if (query?.endDate) {
    list = list.filter((ad) => !ad.end_date || ad.end_date <= query.endDate!)
  }

  const clients = await fetchClients()
  return { data: list, clients }
}

export async function fetchClients(): Promise<AdvertisementClient[]> {
  try {
    const resp = await apiGet<{ code: number; data: AdvertisementClient[] }>('/client/mine')
    if (resp?.code === 200 && Array.isArray(resp.data) && resp.data.length > 0) {
      return resp.data
    }
  } catch {}
  return DEFAULT_MOCK_CLIENTS
}

export async function createAdvertisement(formData: FormData): Promise<Advertisement> {
  try {
    const resp = await apiSendForm<{ code: number; data: Advertisement; message?: string }>(
      '/advertisements',
      'POST',
      formData,
    )
    if (resp?.code === 200 && resp.data) {
      return resp.data
    }
  } catch {}

  // Fallback to local persistence
  const list = getLocalAds()
  const advertiser = String(formData.get('advertiser') || 'Pengiklan')
  const description = String(formData.get('description') || '')
  const spot = String(formData.get('spot') || 'header')
  const startDate = (formData.get('start_date') as string) || null
  const endDate = (formData.get('end_date') as string) || null
  const startHour = (formData.get('start_hour') as string) || null
  const endHour = (formData.get('end_hour') as string) || null
  const file = formData.get('file') as File | null

  let fileUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'
  if (file && typeof window !== 'undefined') {
    fileUrl = URL.createObjectURL(file)
  }

  const newAd: Advertisement = {
    id: Date.now(),
    client_id: 1,
    advertiser,
    description,
    spot,
    file: fileUrl,
    file_type: file?.type || 'image/jpeg',
    start_date: startDate,
    end_date: endDate,
    start_hour: startHour,
    end_hour: endHour,
    vmcode: [],
    vmid: [],
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
  }

  list.unshift(newAd)
  saveLocalAds(list)
  return newAd
}

export async function updateAdvertisement(
  id: number,
  payload: UpdateAdvertisementPayload,
  vmcodes?: string[],
): Promise<void> {
  try {
    await apiSendJson(`/advertisements/${id}`, 'PUT', payload)
    return
  } catch {}

  // Fallback update in local storage
  const list = getLocalAds()
  const idx = list.findIndex((ad) => ad.id === id)
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      vmid: payload.vending_machine_id,
      vmcode: vmcodes || list[idx].vmcode,
      start_date: payload.start_date !== undefined ? payload.start_date : list[idx].start_date,
      end_date: payload.end_date !== undefined ? payload.end_date : list[idx].end_date,
      start_hour: payload.start_hour !== undefined ? payload.start_hour : list[idx].start_hour,
      end_hour: payload.end_hour !== undefined ? payload.end_hour : list[idx].end_hour,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    }
    saveLocalAds(list)
  }
}

export async function deleteAdvertisement(id: number): Promise<void> {
  try {
    await apiDelete(`/advertisements/${id}`)
    return
  } catch {}

  const list = getLocalAds().filter((ad) => ad.id !== id)
  saveLocalAds(list)
}
