// 3D Vending Machine Model & Sticker Configuration
// References:
// - Gambar Kerja SV 22 Chiller & Figma 5.3-D-UI Settings (1097:21058)
// - Cardshack Indonesia Mock-up (Cardshack Vending_Indonesia_Mock_02 Nov 2026.ai)
// - SV Gambar Kerja (SV 22 Frozen, SV 49 Frozen, SV 49 TCN, SV 55, SV WM, VM Fuji Pink, SV 10 XY Slim, TCN SV 10 Big, SV 10 Slim TCN)

import type * as THREE from 'three'

export type StickerSide = 'front' | 'left' | 'right' | 'back'

export type Vending3DModelType =
  | 'SV22'
  | 'CARDSHACK'
  | 'SV22_FROZEN'
  | 'SV49_FROZEN'
  | 'SV49_TCN'
  | 'SV55'
  | 'SV_WM'
  | 'VM_FUJI_PINK'
  | 'VM_SV10_XY_SLIM'
  | 'VM_TCN_SV10_BIG'
  | 'VM_TVN_SV10_SLIM'

export interface Vending3DModelMeta {
  id: Vending3DModelType
  label: string
  shortName: string
  dimensionsLabel: string
  filePrefix: string
  category: string
  cameraPos: [number, number, number]
  cameraTarget: [number, number, number]
}

export const VENDING_3D_MODELS: Vending3DModelMeta[] = [
  {
    id: 'SV22',
    label: 'SV 22 Chiller (128 × 75.5 × 197 cm)',
    shortName: 'SV 22 Chiller',
    dimensionsLabel: '128 × 75.5 × 197 cm',
    filePrefix: 'SV22_Chiller',
    category: 'Chiller Series',
    cameraPos: [2.45, 1.45, 2.95],
    cameraTarget: [0, 1.02, 0],
  },
  {
    id: 'CARDSHACK',
    label: 'Cardshack Full-Wrap (125.5 × 79 × 185.5 cm)',
    shortName: 'Cardshack Vending',
    dimensionsLabel: '125.5 × 79 × 185.5 cm',
    filePrefix: 'Cardshack_Vending',
    category: 'Custom Series',
    cameraPos: [2.45, 1.45, 2.95],
    cameraTarget: [0, 0.98, 0],
  },
  {
    id: 'SV22_FROZEN',
    label: 'SV 22 Frozen Elevator (138 × 88 × 198 cm)',
    shortName: 'SV 22 Frozen',
    dimensionsLabel: '138 × 88 × 198 cm',
    filePrefix: 'SV22_Frozen',
    category: 'Frozen Series',
    cameraPos: [2.55, 1.48, 3.05],
    cameraTarget: [0, 1.02, 0],
  },
  {
    id: 'SV49_FROZEN',
    label: 'SV 49 Frozen Elevator (116 × 94.5 × 197 cm)',
    shortName: 'SV 49 Frozen',
    dimensionsLabel: '116 × 94.5 × 197 cm',
    filePrefix: 'SV49_Frozen',
    category: 'Frozen Series',
    cameraPos: [2.45, 1.45, 2.95],
    cameraTarget: [0, 1.02, 0],
  },
  {
    id: 'SV49_TCN',
    label: 'SV 49 TCN Chiller (105.5 × 90 × 197 cm)',
    shortName: 'SV 49 TCN Chiller',
    dimensionsLabel: '105.5 × 90 × 197 cm',
    filePrefix: 'SV49_TCN_Chiller',
    category: 'Chiller Series',
    cameraPos: [2.35, 1.45, 2.9],
    cameraTarget: [0, 1.02, 0],
  },
  {
    id: 'SV55',
    label: 'SV 55" Full Touchscreen (127 × 89.3 × 192.5 cm)',
    shortName: 'SV 55 Touchscreen',
    dimensionsLabel: '127 × 89.3 × 192.5 cm',
    filePrefix: 'SV55_Touchscreen',
    category: 'Digital Display',
    cameraPos: [2.45, 1.45, 2.95],
    cameraTarget: [0, 1.0, 0],
  },
  {
    id: 'SV_WM',
    label: 'SV Wall-Mounted Vending (70 × 31.3 × 100 cm)',
    shortName: 'SV Wall-Mounted',
    dimensionsLabel: '70 × 31.3 × 100 cm',
    filePrefix: 'SV_WallMounted',
    category: 'Compact / Wall',
    cameraPos: [1.72, 1.08, 2.08],
    cameraTarget: [0, 0.96, 0],
  },
  {
    id: 'VM_FUJI_PINK',
    label: 'VM Fuji Pink (140 × 92.5 × 200 cm)',
    shortName: 'VM Fuji Pink',
    dimensionsLabel: '140 × 92.5 × 200 cm',
    filePrefix: 'VM_Fuji_Pink',
    category: 'Custom Series',
    cameraPos: [2.6, 1.5, 3.1],
    cameraTarget: [0, 1.04, 0],
  },
  {
    id: 'VM_SV10_XY_SLIM',
    label: 'SV 10 XY Slim Elevator (59.5 × 86 × 188 cm)',
    shortName: 'SV 10 XY Slim',
    dimensionsLabel: '59.5 × 86 × 188 cm',
    filePrefix: 'SV10_XY_Slim',
    category: 'Slim 10" Series',
    cameraPos: [2.42, 1.44, 2.95],
    cameraTarget: [0, 0.98, 0],
  },
  {
    id: 'VM_TCN_SV10_BIG',
    label: 'TCN SV 10 Big (103 × 74 × 189 cm)',
    shortName: 'TCN SV 10 Big',
    dimensionsLabel: '103 × 74 × 189 cm',
    filePrefix: 'TCN_SV10_Big',
    category: '10" Series',
    cameraPos: [2.35, 1.42, 2.88],
    cameraTarget: [0, 0.98, 0],
  },
  {
    id: 'VM_TVN_SV10_SLIM',
    label: 'SV 10 Slim TCN (57 × 75.5 × 190 cm)',
    shortName: 'SV 10 Slim TCN',
    dimensionsLabel: '57 × 75.5 × 190 cm',
    filePrefix: 'SV10_Slim_TCN',
    category: 'Slim 10" Series',
    cameraPos: [2.42, 1.44, 2.95],
    cameraTarget: [0, 0.98, 0],
  },
]

export function getVending3DModelMeta(type: Vending3DModelType): Vending3DModelMeta {
  return VENDING_3D_MODELS.find((m) => m.id === type) ?? VENDING_3D_MODELS[0]
}

export const VENDING_3D_MODEL_GROUPS: Array<{ category: string; items: Vending3DModelMeta[] }> =
  Array.from(
    VENDING_3D_MODELS.reduce((map, model) => {
      const existing = map.get(model.category) ?? []
      existing.push(model)
      map.set(model.category, existing)
      return map
    }, new Map<string, Vending3DModelMeta[]>()),
    ([category, items]) => ({ category, items }),
  )

export interface VendingModelInstance {
  root: THREE.Group
  stickerMeshes: Record<StickerSide, THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>
  screenMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  updateScreenTexture: (accentColor?: string) => void
  resetStickerMaterial: (side: StickerSide) => void
  dispose: () => void
}

export interface StickerItem {
  side: StickerSide
  file?: File
  url: string
  name: string
  sizeFormatted: string
  width?: number
  height?: number
}

export interface MachineDimensions {
  width: number
  height: number
  depth: number
  feetHeight: number
  doorWidth: number
  towerWidth: number
}

export interface Vending3DState {
  machineCode: string
  machineName: string
  machineType: string
  model3dType: Vending3DModelType
  stickers: Record<StickerSide, StickerItem | null>
  isAutoRotating: boolean
  isWireframe: boolean
  cameraFov: number
}
