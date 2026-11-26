// Unified Procedural 3D Model Builders for All Smartven Blueprint Series:
// - SV 22 Frozen Elevator | SV 49 Frozen Elevator | SV 49 TCN Chiller
// - SV 55" Touchscreen | SV Wall-Mounted | VM Fuji Pink
// - SV 10 XY Slim | TCN SV 10 Big | SV 10 Slim TCN
// All dimensions derived strictly from /Users/kickavenue/Downloads/SV Gambar Kerja CAD PDFs.

import * as THREE from 'three'
import type {
  StickerSide,
  Vending3DModelType,
  VendingModelInstance,
} from '@/types/editor3d'
import {
  buildBaseFeet,
  buildDisplayInterior,
  buildDispenserHatch,
  buildRectWindowAndBezel,
  createDefaultSkinTexture,
  createFrontWrapGeometry,
  createInteractiveScreenTexture,
  rectHolePoints,
  type DispenserStyle,
  type InteriorProductKind,
  type ScreenPreset,
  type SkinTheme,
} from './vending3dPrimitives'

interface StandardChillerGlassSpec {
  W: number
  H: number
  D: number
  feetH: number
  doorW: number
  glassW: number
  glassH: number
  glassLeftMargin: number
  glassTopMargin: number
  bezelColor?: number
  dispenserW: number
  dispenserH: number
  dispenserCenterX: number
  dispenserBottomOffset: number
  dispenserStyle: DispenserStyle
  interiorKind: InteriorProductKind
  interiorLanes: number
  ledColor?: number
  feetStyle: 'casters' | 'tapered_legs'
  skinTheme: SkinTheme
  screenPreset: ScreenPreset
  /** Optional screen in console tower (x from left edge of tower center, w, h, topMargin) */
  towerScreen?: { w: number; h: number; topMargin: number }
  /** Optional lower payment box in tower */
  towerPaymentBottomMargin?: { w: number; h: number; bottomMargin: number }
  /** Vertical slim payment strip (SV49_FROZEN / SV49_TCN) */
  slimTowerBar?: { w: number; h: number; topMargin: number; xOffsetFromRight?: number; color: number; handleBeside?: boolean }
  /** Stacked green buttons (TCN SV 10 BIG) */
  tcnButtons?: { x: number; startY: number }
  /** Overhanging side-mounted 10" box on slim doors (XY_SLIM / TVN_SLIM) */
  sideMountBox?: { w: number; h: number; d: number; topMargin: number; screen?: { w: number; h: number; topInset: number } }
  /** Vertical door lock / handle */
  handle?: { x: number; y: number; h: number }
}

const STANDARD_SPECS: Partial<Record<Vending3DModelType, StandardChillerGlassSpec>> = {
  SV22_FROZEN: {
    W: 1.380,
    H: 1.890,
    D: 0.880,
    feetH: 0.090,
    doorW: 0.980,
    glassW: 0.780,
    glassH: 1.075,
    glassLeftMargin: 0.100,
    glassTopMargin: 0.100,
    bezelColor: 0x1E293B,
    dispenserW: 0.485,
    dispenserH: 0.310,
    dispenserCenterX: -1.380 / 2 + 0.245 + 0.485 / 2,
    dispenserBottomOffset: 0.285,
    dispenserStyle: 'yellow_frozen',
    interiorKind: 'frozen_boxes',
    interiorLanes: 6,
    ledColor: 0xE0F7FA,
    feetStyle: 'casters',
    skinTheme: {
      topColor: '#F4F7FB',
      midColor: '#E8EFF6',
      bottomColor: '#DCE6F0',
      brandTitle: 'SV 22 FROZEN',
      accentHex: '#0284C7',
      doorSplitRatio: 98 / 138,
    },
    screenPreset: 'frozen',
    towerScreen: { w: 0.280, h: 0.515, topMargin: 0.270 },
    towerPaymentBottomMargin: { w: 0.270, h: 0.350, bottomMargin: 0.665 },
    handle: { x: 1.380 / 2 - 0.400 + 0.025, y: 1.05, h: 0.09 },
  },

  SV49_FROZEN: {
    W: 1.160,
    H: 1.870,
    D: 0.945,
    feetH: 0.100,
    doorW: 0.980,
    glassW: 0.610,
    glassH: 1.080,
    glassLeftMargin: 0.185,
    glassTopMargin: 0.100,
    bezelColor: 0x1E293B,
    dispenserW: 0.500,
    dispenserH: 0.360,
    dispenserCenterX: -1.160 / 2 + 0.240 + 0.500 / 2,
    dispenserBottomOffset: 0.230,
    dispenserStyle: 'yellow_frozen',
    interiorKind: 'frozen_boxes',
    interiorLanes: 5,
    ledColor: 0xE0F7FA,
    feetStyle: 'casters',
    skinTheme: {
      topColor: '#F4F7FB',
      midColor: '#E8EFF6',
      bottomColor: '#DCE6F0',
      brandTitle: 'SV 49 FROZEN',
      accentHex: '#0284C7',
      doorSplitRatio: 98 / 116,
    },
    screenPreset: 'frozen',
    slimTowerBar: { w: 0.105, h: 0.410, topMargin: 0.350, color: 0x0F172A, handleBeside: true },
  },

  SV49_TCN: {
    W: 1.055,
    H: 1.880,
    D: 0.900,
    feetH: 0.090,
    doorW: 0.850,
    glassW: 0.650,
    glassH: 1.080,
    glassLeftMargin: 0.100,
    glassTopMargin: 0.102,
    bezelColor: 0x1E293B,
    dispenserW: 0.410,
    dispenserH: 0.180,
    dispenserCenterX: -1.055 / 2 + 0.155 + 0.410 / 2 + 0.04,
    dispenserBottomOffset: 0.320,
    dispenserStyle: 'green_tcn',
    interiorKind: 'drinks',
    interiorLanes: 6,
    feetStyle: 'casters',
    skinTheme: {
      topColor: '#F8FAFC',
      midColor: '#EFF3F8',
      bottomColor: '#E2E8F0',
      brandTitle: 'SV 49 TCN',
      accentHex: '#10B981',
      doorSplitRatio: 84.5 / 105.5,
    },
    screenPreset: 'chiller',
    slimTowerBar: { w: 0.075, h: 0.705, topMargin: 0.375, xOffsetFromRight: 0.135, color: 0x16A34A, handleBeside: true },
  },

  VM_TCN_SV10_BIG: {
    W: 1.030,
    H: 1.860,
    D: 0.740,
    feetH: 0.030,
    doorW: 0.870,
    glassW: 0.780,
    glassH: 1.260,
    glassLeftMargin: 0.045,
    glassTopMargin: 0.045,
    bezelColor: 0xE2E8F0, // Signature brushed aluminum bezel
    dispenserW: 0.410,
    dispenserH: 0.170,
    dispenserCenterX: -1.030 / 2 + 0.870 / 2,
    dispenserBottomOffset: 0.190,
    dispenserStyle: 'green_tcn',
    interiorKind: 'snacks',
    interiorLanes: 6,
    feetStyle: 'tapered_legs',
    skinTheme: {
      topColor: '#52565C',
      midColor: '#484C52',
      bottomColor: '#3E4248',
      brandTitle: 'TCN SV 10',
      accentHex: '#4CAF50',
      darkBody: true,
      doorSplitRatio: 87 / 103,
    },
    screenPreset: 'slim10',
    towerScreen: { w: 0.105, h: 0.215, topMargin: 0.230 },
    tcnButtons: { x: 1.030 / 2 - 0.080, startY: 1.860 - 0.50 },
  },

  VM_SV10_XY_SLIM: {
    W: 0.595,
    H: 1.840,
    D: 0.860,
    feetH: 0.040,
    doorW: 0.595,
    glassW: 0.430,
    glassH: 1.180,
    glassLeftMargin: 0.085,
    glassTopMargin: 0.085,
    bezelColor: 0x334155,
    dispenserW: 0.335,
    dispenserH: 0.265,
    dispenserCenterX: 0,
    dispenserBottomOffset: 0.195,
    dispenserStyle: 'gold_xy',
    interiorKind: 'drinks',
    interiorLanes: 4,
    feetStyle: 'tapered_legs',
    skinTheme: {
      topColor: '#C8CDD3',
      midColor: '#BAC0C7',
      bottomColor: '#ADB4BC',
      brandTitle: 'SV 10 SLIM',
      accentHex: '#CA8A04',
    },
    screenPreset: 'slim10',
    sideMountBox: { w: 0.163, h: 0.290, d: 0.055, topMargin: 0.350 },
    handle: { x: -0.595 / 2 + 0.032, y: 0.67, h: 0.14 },
  },

  VM_TVN_SV10_SLIM: {
    W: 0.570,
    H: 1.860,
    D: 0.755,
    feetH: 0.040,
    doorW: 0.570,
    glassW: 0.450,
    glassH: 1.240,
    glassLeftMargin: 0.060,
    glassTopMargin: 0.060,
    bezelColor: 0x64748B,
    dispenserW: 0.360,
    dispenserH: 0.225,
    dispenserCenterX: 0,
    dispenserBottomOffset: 0.130,
    dispenserStyle: 'taupe_slim',
    interiorKind: 'snacks',
    interiorLanes: 4,
    feetStyle: 'tapered_legs',
    skinTheme: {
      topColor: '#CFA0A9',
      midColor: '#C08A94',
      bottomColor: '#AE7983',
      brandTitle: 'TVN SV 10',
      accentHex: '#F43F5E',
    },
    screenPreset: 'slim10',
    sideMountBox: {
      w: 0.210,
      h: 0.500,
      d: 0.055,
      topMargin: 0.300,
      screen: { w: 0.140, h: 0.215, topInset: 0.075 },
    },
    handle: { x: -0.570 / 2 + 0.025, y: 0.84, h: 0.11 },
  },
}

/**
 * Parameterized builder covering all glass-front cabinet architectures cleanly
 */
function buildStandardVendingModel(spec: StandardChillerGlassSpec): VendingModelInstance {
  const root = new THREE.Group()
  const { W, H, D, feetH, doorW } = spec
  const bodyCenterY = feetH + H / 2
  const frontZ = D / 2

  const glassLeftX = -W / 2 + spec.glassLeftMargin
  const glassCenterX = glassLeftX + spec.glassW / 2
  const glassBottomFromBody = H - spec.glassTopMargin - spec.glassH
  const glassCenterY = feetH + glassBottomFromBody + spec.glassH / 2

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    metalness: 0.55,
    roughness: 0.35,
  })
  const coreMat = new THREE.MeshStandardMaterial({
    color: spec.skinTheme.darkBody ? 0x3F4349 : 0xCBD5E1,
    metalness: 0.3,
    roughness: 0.4,
  })
  const extraTextures: THREE.Texture[] = []

  // 1. Hollow structural chassis around display cavity
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.04), coreMat)
  backWall.position.set(0, bodyCenterY, -D / 2 + 0.02)
  backWall.castShadow = true
  backWall.receiveShadow = true
  root.add(backWall)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), coreMat)
  roof.position.set(0, feetH + H - 0.02, 0)
  roof.castShadow = true
  root.add(roof)

  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), coreMat)
  basePlate.position.set(0, feetH + 0.02, 0)
  basePlate.receiveShadow = true
  root.add(basePlate)

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.04, H, D), coreMat)
  leftWall.position.set(-W / 2 + 0.02, bodyCenterY, 0)
  leftWall.castShadow = true
  root.add(leftWall)

  // Right wall or tower block
  const towerW = W - doorW
  if (towerW > 0.08) {
    const towerCore = new THREE.Mesh(new THREE.BoxGeometry(towerW, H, D), coreMat)
    towerCore.position.set(W / 2 - towerW / 2, bodyCenterY, 0)
    towerCore.castShadow = true
    towerCore.receiveShadow = true
    root.add(towerCore)
  } else {
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.04, H, D), coreMat)
    rightWall.position.set(W / 2 - 0.02, bodyCenterY, 0)
    rightWall.castShadow = true
    root.add(rightWall)
  }

  // Front framing plates above/below glass cavity
  const lowerPlate = new THREE.Mesh(
    new THREE.BoxGeometry(doorW, glassBottomFromBody, 0.04),
    coreMat,
  )
  lowerPlate.position.set(-W / 2 + doorW / 2, feetH + glassBottomFromBody / 2, frontZ - 0.02)
  root.add(lowerPlate)

  const upperPlate = new THREE.Mesh(
    new THREE.BoxGeometry(doorW, spec.glassTopMargin, 0.04),
    coreMat,
  )
  upperPlate.position.set(-W / 2 + doorW / 2, feetH + H - spec.glassTopMargin / 2, frontZ - 0.02)
  root.add(upperPlate)

  // 2. Display cavity interior & shelves
  buildDisplayInterior(root, {
    centerX: glassCenterX,
    centerY: glassCenterY,
    centerZ: 0.02,
    width: spec.glassW + 0.02,
    height: spec.glassH,
    depth: D - 0.12,
    shelfCount: 5,
    lanes: spec.interiorLanes,
    productKind: spec.interiorKind,
    ledColor: spec.ledColor,
  })

  // 3. Glass window + closed 4-sided frame
  buildRectWindowAndBezel(root, {
    cx: glassCenterX,
    cy: glassCenterY,
    z: frontZ + 0.015,
    w: spec.glassW,
    h: spec.glassH,
    bezelColor: spec.bezelColor,
  })

  // 4. Dispenser chute
  const dispenserCY = feetH + spec.dispenserBottomOffset + spec.dispenserH / 2
  const dispTex = buildDispenserHatch(root, {
    cx: spec.dispenserCenterX,
    cy: dispenserCY,
    z: frontZ + 0.008,
    w: spec.dispenserW,
    h: spec.dispenserH,
    style: spec.dispenserStyle,
  })
  if (dispTex) extraTextures.push(dispTex)

  // 5. Screen & Console Controls
  const screenTex = createInteractiveScreenTexture(spec.screenPreset)
  let screenMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>

  if (spec.towerScreen) {
    const { w, h, topMargin } = spec.towerScreen
    const tx = W / 2 - towerW / 2
    const ty = feetH + H - topMargin - h / 2
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.024, h + 0.024, 0.02), darkMetalMat)
    bezel.position.set(tx, ty, frontZ + 0.01)
    root.add(bezel)

    screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.16, emissive: 0x1E293B, emissiveIntensity: 0.2 }),
    ) as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
    screenMesh.position.set(tx, ty, frontZ + 0.021)
    root.add(screenMesh)
  } else if (spec.sideMountBox) {
    const sb = spec.sideMountBox
    const boxX = W / 2 - sb.w / 2 - 0.015
    const boxY = feetH + H - sb.topMargin - sb.h / 2
    const box = new THREE.Mesh(new THREE.BoxGeometry(sb.w, sb.h, sb.d), darkMetalMat)
    box.position.set(boxX, boxY, frontZ + sb.d / 2)
    box.castShadow = true
    root.add(box)

    const sw = sb.screen?.w ?? sb.w - 0.03
    const sh = sb.screen?.h ?? sb.h - 0.06
    const sy = sb.screen
      ? boxY + sb.h / 2 - sb.screen.topInset - sh / 2
      : boxY
    screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(sw, sh),
      new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.16, emissive: 0x1E293B, emissiveIntensity: 0.2 }),
    ) as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
    screenMesh.position.set(boxX, sy, frontZ + sb.d + 0.002)
    root.add(screenMesh)
  } else {
    // Fallback / slim tower vertical screen strip (SV49_FROZEN, SV49_TCN)
    const bar = spec.slimTowerBar ?? { w: 0.105, h: 0.41, topMargin: 0.35, color: 0x0F172A }
    const barX = bar.xOffsetFromRight
      ? W / 2 - bar.xOffsetFromRight - bar.w / 2
      : W / 2 - towerW / 2
    const barY = feetH + H - bar.topMargin - bar.h / 2

    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(bar.w + 0.02, bar.h + 0.02, 0.018),
      new THREE.MeshStandardMaterial({ color: bar.color, metalness: 0.4, roughness: 0.3 }),
    )
    bezel.position.set(barX, barY, frontZ + 0.009)
    root.add(bezel)

    screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(bar.w, bar.h),
      new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.16, emissive: 0x1E293B, emissiveIntensity: 0.22 }),
    ) as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
    screenMesh.position.set(barX, barY, frontZ + 0.019)
    root.add(screenMesh)

    if (bar.handleBeside) {
      const latch = new THREE.Mesh(
        new THREE.BoxGeometry(0.024, 0.085, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xCA8A04, metalness: 0.5, roughness: 0.3 }),
      )
      latch.position.set(barX + bar.w / 2 + 0.032, barY - bar.h / 2 + 0.08, frontZ + 0.012)
      root.add(latch)
    }
  }

  // Optional lower payment console (SV22_FROZEN)
  if (spec.towerPaymentBottomMargin) {
    const pm = spec.towerPaymentBottomMargin
    const px = W / 2 - towerW / 2
    const py = feetH + pm.bottomMargin + pm.h / 2
    const pFrame = new THREE.Mesh(new THREE.BoxGeometry(pm.w + 0.02, pm.h + 0.02, 0.016), darkMetalMat)
    pFrame.position.set(px, py, frontZ + 0.008)
    root.add(pFrame)
    const pFace = new THREE.Mesh(
      new THREE.PlaneGeometry(pm.w, pm.h),
      new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.35, metalness: 0.2 }),
    )
    pFace.position.set(px, py, frontZ + 0.017)
    root.add(pFace)
  }

  // Optional TCN stacked green buttons & indicator
  if (spec.tcnButtons) {
    const greenBtnMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.3, metalness: 0.2 })
    const { x, startY } = spec.tcnButtons
    ;[0, -0.09].forEach((dy) => {
      const btn = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.072, 0.016), greenBtnMat)
      btn.position.set(x, feetH + startY + dy, frontZ + 0.01)
      root.add(btn)
    })
    const coinSlot = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.025, 0.016), darkMetalMat)
    coinSlot.position.set(x, feetH + startY - 0.17, frontZ + 0.01)
    root.add(coinSlot)
  }

  // Optional handle
  if (spec.handle) {
    const hMesh = new THREE.Mesh(new THREE.BoxGeometry(0.026, spec.handle.h, 0.022), darkMetalMat)
    hMesh.position.set(spec.handle.x, feetH + spec.handle.y, frontZ + 0.014)
    root.add(hMesh)
  }

  // 6. Feet / Casters
  buildBaseFeet(root, { W, D, feetH, style: spec.feetStyle })

  // 7. Full-Coverage 4-Side Stickers
  const holePoints = rectHolePoints(glassLeftX, glassBottomFromBody, spec.glassW, spec.glassH)
  const frontGeom = createFrontWrapGeometry(W, H, holePoints)

  return attachFourSideStickers(root, {
    W,
    H,
    D,
    feetH,
    frontGeom,
    skinTheme: spec.skinTheme,
    screenMesh,
    screenTex,
    screenPreset: spec.screenPreset,
    extraTextures,
  })
}

/**
 * SV 55: Massive 55" Digital Touchscreen Vending (No transparent glass window; 127 x 89.3 x 192.5 cm)
 */
function buildSV55Model(): VendingModelInstance {
  const root = new THREE.Group()
  const W = 1.270
  const H = 1.875
  const D = 0.893
  const feetH = 0.040
  const bodyCenterY = feetH + H / 2
  const frontZ = D / 2

  const coreMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.25, roughness: 0.35 })
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.5, roughness: 0.35 })

  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), coreMat)
  body.position.set(0, bodyCenterY, 0)
  body.castShadow = true
  body.receiveShadow = true
  root.add(body)

  // Huge 55" Portrait Screen (67.9 x 110.7 cm on left 95cm door; 13.6cm margin, 18.7cm top margin)
  const sw = 0.679
  const sh = 1.107
  const sx = -W / 2 + 0.136 + sw / 2 // -0.1595m
  const sy = feetH + (H - 0.187 - sh / 2)

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(sw + 0.04, sh + 0.04, 0.022), darkMetalMat)
  bezel.position.set(sx, sy, frontZ + 0.011)
  root.add(bezel)

  const screenTex = createInteractiveScreenTexture('big55')
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(sw, sh),
    new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.12, emissive: 0x1E293B, emissiveIntensity: 0.25 }),
  ) as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  screenMesh.position.set(sx, sy, frontZ + 0.023)
  root.add(screenMesh)

  // Green + Dual Yellow Arrows Dispenser Chute (45.9 x 30.0 cm, 4.0 cm below 55" screen)
  const chuteTex = buildDispenserHatch(root, {
    cx: sx,
    cy: feetH + 0.241 + 0.150,
    z: frontZ + 0.008,
    w: 0.459,
    h: 0.300,
    style: 'green_arrows_55',
  })

  // Vertical door latch on right column (85.8 cm from bottom)
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.095, 0.022), darkMetalMat)
  handle.position.set(W / 2 - 0.31 + 0.032, feetH + 0.858, frontZ + 0.012)
  root.add(handle)

  buildBaseFeet(root, { W, D, feetH, style: 'casters' })

  return attachFourSideStickers(root, {
    W,
    H,
    D,
    feetH,
    frontGeom: createFrontWrapGeometry(W, H),
    skinTheme: {
      topColor: '#F8FAFC',
      midColor: '#EEF2F6',
      bottomColor: '#E2E8F0',
      brandTitle: 'SV 55 ULTRA',
      accentHex: '#22C55E',
      doorSplitRatio: 95 / 127,
    },
    screenMesh,
    screenTex,
    screenPreset: 'big55',
    extraTextures: chuteTex ? [chuteTex] : [],
  })
}

/**
 * SV WM: Wall-Mounted Compact Kiosk (700 x 313 x 1000 mm, elevated at wall height)
 */
function buildSVWMModel(): VendingModelInstance {
  const root = new THREE.Group()
  const W = 0.700
  const H = 1.000
  const D = 0.313
  const feetH = 0.460 // Elevated at wall-mount viewing height (~0.46m to ~1.46m)
  const bodyCenterY = feetH + H / 2
  const frontZ = D / 2

  const darkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 })
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.35, roughness: 0.4 })

  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), coreMat)
  body.position.set(0, bodyCenterY, 0)
  body.castShadow = true
  body.receiveShadow = true
  root.add(body)

  // Subtle rear wall mounting bar bracket
  const mountBar = new THREE.Mesh(new THREE.BoxGeometry(W * 0.75, 0.05, 0.02), darkMat)
  mountBar.position.set(0, bodyCenterY, -D / 2 - 0.01)
  root.add(mountBar)

  // LCD 21.5" Portrait Display (270 x 479 mm) on front door
  const sw = 0.270
  const sh = 0.479
  const sx = -0.055
  const sy = feetH + 0.625

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(sw + 0.028, sh + 0.028, 0.02), darkMat)
  bezel.position.set(sx, sy, frontZ + 0.01)
  root.add(bezel)

  const screenTex = createInteractiveScreenTexture('wallmount')
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(sw, sh),
    new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.16, emissive: 0x1E293B, emissiveIntensity: 0.2 }),
  ) as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  screenMesh.position.set(sx, sy, frontZ + 0.021)
  root.add(screenMesh)

  // Lower compact pickup tray (365 x 140 mm)
  buildDispenserHatch(root, {
    cx: sx,
    cy: feetH + 0.20,
    z: frontZ + 0.008,
    w: 0.365,
    h: 0.140,
    style: 'wall_chute',
  })

  // Right control room scanner / keypad module
  const ctrlBox = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.11, 0.018), darkMat)
  ctrlBox.position.set(0.24, feetH + 0.35, frontZ + 0.01)
  root.add(ctrlBox)

  return attachFourSideStickers(root, {
    W,
    H,
    D,
    feetH,
    frontGeom: createFrontWrapGeometry(W, H),
    skinTheme: {
      topColor: '#CBD5E1',
      midColor: '#B8C4D0',
      bottomColor: '#94A3B8',
      brandTitle: 'SV WALL MOUNT',
      accentHex: '#3B82F6',
      doorSplitRatio: 560 / 700,
    },
    screenMesh,
    screenTex,
    screenPreset: 'wallmount',
  })
}

/**
 * VM FUJI PINK: Signature 45-degree Chamfered Corner Window & Asymmetric Silver Console (140 x 92.5 x 200 cm)
 */
function buildVMFujiPinkModel(): VendingModelInstance {
  const root = new THREE.Group()
  const W = 1.400
  const H = 1.920
  const D = 0.925
  const feetH = 0.080
  const doorW = 0.990
  const bodyCenterY = feetH + H / 2
  const frontZ = D / 2

  // Chamfered Display Window polygon hole inside left door (W 77cm x H 160cm, top 8cm + grille 8cm -> top 16cm? Note 192 - 160 - 8 bottom = 24 -> top grille 16cm + bottom 16cm -> check PDF: bottom 8cm below bezel, glass H 160cm, top vent 16cm)
  const gxLeft = -W / 2 + 0.105 // -0.595
  const gw = 0.770
  const gh = 1.560
  const gyBottom = 0.160
  const gyTop = gyBottom + gh // 1.720
  const gxRight = gxLeft + gw // +0.175
  const chamfer = 0.240 // 45-degree diagonal bottom-right chamfer!

  // CW polygon winding for hole inside CCW outer rect
  const polyHole: Array<[number, number]> = [
    [gxLeft, gyBottom],
    [gxLeft, gyTop],
    [gxRight, gyTop],
    [gxRight, gyBottom + chamfer],
    [gxRight - chamfer, gyBottom],
  ]

  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.55, roughness: 0.35 })
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xB8C0C8, metalness: 0.72, roughness: 0.28 })
  const pinkMat = new THREE.MeshStandardMaterial({ color: 0xE5737A, metalness: 0.15, roughness: 0.4 })

  // 1. Hollow cabinet shell
  const back = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.04), pinkMat)
  back.position.set(0, bodyCenterY, -D / 2 + 0.02)
  back.castShadow = true
  root.add(back)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), pinkMat)
  roof.position.set(0, feetH + H - 0.02, 0)
  roof.castShadow = true
  root.add(roof)

  const base = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), pinkMat)
  base.position.set(0, feetH + 0.02, 0)
  base.receiveShadow = true
  root.add(base)

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.04, H, D), pinkMat)
  leftWall.position.set(-W / 2 + 0.02, bodyCenterY, 0)
  leftWall.castShadow = true
  root.add(leftWall)

  const towerW = W - doorW // 0.410
  const towerCore = new THREE.Mesh(new THREE.BoxGeometry(towerW, H, D), pinkMat)
  towerCore.position.set(W / 2 - towerW / 2, bodyCenterY, 0)
  towerCore.castShadow = true
  root.add(towerCore)

  // Top/Bottom door plates around chamfered glass cavity
  const lowDoorPlate = new THREE.Mesh(new THREE.BoxGeometry(doorW, gyBottom, 0.04), pinkMat)
  lowDoorPlate.position.set(-W / 2 + doorW / 2, feetH + gyBottom / 2, frontZ - 0.02)
  root.add(lowDoorPlate)

  const topDoorPlate = new THREE.Mesh(new THREE.BoxGeometry(doorW, H - gyTop, 0.04), pinkMat)
  topDoorPlate.position.set(-W / 2 + doorW / 2, feetH + gyTop + (H - gyTop) / 2, frontZ - 0.02)
  root.add(topDoorPlate)

  // 2. Interior display (Cosmetics / Lifestyle / Pink aesthetic)
  buildDisplayInterior(root, {
    centerX: gxLeft + gw / 2,
    centerY: feetH + gyBottom + gh / 2,
    centerZ: 0.02,
    width: gw + 0.02,
    height: gh,
    depth: D - 0.12,
    shelfCount: 6,
    lanes: 6,
    productKind: 'cosmetics',
  })

  // 3. Custom chamfered polygonal glass pane + bezel segments
  const glassShape = new THREE.Shape()
  glassShape.moveTo(polyHole[0][0], polyHole[0][1])
  for (let i = 1; i < polyHole.length; i++) glassShape.lineTo(polyHole[i][0], polyHole[i][1])
  glassShape.closePath()
  const glassMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(glassShape),
    new THREE.MeshPhysicalMaterial({
      color: 0xFFF1F2,
      transmission: 0.92,
      opacity: 0.22,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
    }),
  )
  glassMesh.position.set(0, feetH, frontZ + 0.012)
  root.add(glassMesh)

  // Matching 5-edge outer dark window frame + diagonal chamfer bar
  const bt = 0.024
  const bz = frontZ + 0.014
  const bd = 0.024

  const leftFrameBar = new THREE.Mesh(new THREE.BoxGeometry(bt, gh + bt, bd), darkMat)
  leftFrameBar.position.set(gxLeft - bt / 2, feetH + gyBottom + gh / 2, bz)
  root.add(leftFrameBar)

  const topFrameBar = new THREE.Mesh(new THREE.BoxGeometry(gw + bt * 2, bt, bd), darkMat)
  topFrameBar.position.set(gxLeft + gw / 2, feetH + gyTop + bt / 2, bz)
  root.add(topFrameBar)

  const rightBarH = gh - chamfer
  const rightFrameBar = new THREE.Mesh(new THREE.BoxGeometry(bt, rightBarH + bt, bd), darkMat)
  rightFrameBar.position.set(gxRight + bt / 2, feetH + gyBottom + chamfer + rightBarH / 2, bz)
  root.add(rightFrameBar)

  const botBarW = gw - chamfer
  const botFrameBar = new THREE.Mesh(new THREE.BoxGeometry(botBarW + bt, bt, bd), darkMat)
  botFrameBar.position.set(gxLeft + botBarW / 2, feetH + gyBottom - bt / 2, bz)
  root.add(botFrameBar)

  const diagLen = Math.hypot(chamfer, chamfer)
  const diagBar = new THREE.Mesh(new THREE.BoxGeometry(diagLen + bt * 0.7, bt, bd), darkMat)
  diagBar.position.set(gxRight - chamfer / 2 + bt * 0.25, feetH + gyBottom + chamfer / 2 - bt * 0.25, bz)
  diagBar.rotation.z = Math.PI / 4
  root.add(diagBar)

  // Top slotted cooling grilles above Fuji Pink window
  for (let i = 0; i < 11; i++) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.06, 0.014), darkMat)
    slot.position.set(-W / 2 + 0.16 + i * 0.034, feetH + H - 0.11, frontZ + 0.01)
    root.add(slot)
  }

  // 4. Right Silver Metallic Console Column (signature proud brushed titanium panel)
  const towerCX = W / 2 - 0.205
  const silverTowerOverlay = new THREE.Mesh(new THREE.BoxGeometry(0.355, H - 0.04, 0.018), silverMat)
  silverTowerOverlay.position.set(towerCX, bodyCenterY, frontZ + 0.01)
  root.add(silverTowerOverlay)

  // 22" Screen (Fuji Pink theme)
  const sw = 0.255
  const sh = 0.515
  const sy = feetH + H - 0.315 - sh / 2
  const screenBezel = new THREE.Mesh(new THREE.BoxGeometry(sw + 0.026, sh + 0.026, 0.022), darkMat)
  screenBezel.position.set(towerCX, sy, frontZ + 0.022)
  root.add(screenBezel)

  const screenTex = createInteractiveScreenTexture('fuji')
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(sw, sh),
    new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.16, emissive: 0x2E1025, emissiveIntensity: 0.22 }),
  ) as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  screenMesh.position.set(towerCX, sy, frontZ + 0.034)
  root.add(screenMesh)

  // Signature keypad + QR card reader squares below screen (7cm below screen)
  const qrSquare = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.016), darkMat)
  qrSquare.position.set(towerCX - 0.075, sy - sh / 2 - 0.075, frontZ + 0.02)
  root.add(qrSquare)

  const cardReader = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.105, 0.018), darkMat)
  cardReader.position.set(towerCX + 0.065, sy - sh / 2 - 0.075, frontZ + 0.02)
  root.add(cardReader)

  // Signature middle yellow-rimmed pickup chute + overhanging chevron wings!
  buildDispenserHatch(root, {
    cx: towerCX,
    cy: feetH + 0.52,
    z: frontZ + 0.018,
    w: 0.195,
    h: 0.205,
    style: 'fuji_pickup',
    protrusion: 0.018,
  })

  // Left chevron pointer trim overlapping chamfer boundary (`<`)
  const chevronWing = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.15, 0.026), silverMat)
  chevronWing.position.set(towerCX - 0.21, feetH + 0.52, frontZ + 0.018)
  chevronWing.rotation.z = Math.PI / 4
  root.add(chevronWing)

  // Side latch protrusion
  const sideLatch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 0.08), darkMat)
  sideLatch.position.set(W / 2 + 0.01, feetH + 0.52, frontZ - 0.04)
  root.add(sideLatch)

  buildBaseFeet(root, { W, D, feetH, style: 'casters' })

  return attachFourSideStickers(root, {
    W,
    H,
    D,
    feetH,
    frontGeom: createFrontWrapGeometry(W, H, polyHole),
    skinTheme: {
      topColor: '#F17A82',
      midColor: '#E56770',
      bottomColor: '#D6565F',
      brandTitle: 'FUJI PINK',
      accentHex: '#F472B6',
      doorSplitRatio: 99 / 140,
    },
    screenMesh,
    screenTex,
    screenPreset: 'fuji',
  })
}

/**
 * Attaches the 4 full-coverage sticker wrap planes (Front, Left, Right, Back) & returns unified instance
 */
function attachFourSideStickers(
  root: THREE.Group,
  opts: {
    W: number
    H: number
    D: number
    feetH: number
    frontGeom: THREE.BufferGeometry
    skinTheme: SkinTheme
    screenMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
    screenTex: THREE.CanvasTexture
    screenPreset: ScreenPreset
    extraTextures?: THREE.Texture[]
  },
): VendingModelInstance {
  const { W, H, D, feetH, frontGeom, skinTheme, screenMesh, screenPreset } = opts
  const bodyCenterY = feetH + H / 2
  const frontZ = D / 2

  const defaultFront = createDefaultSkinTexture('front', W / H, skinTheme)
  const defaultLeft = createDefaultSkinTexture('left', D / H, skinTheme)
  const defaultRight = createDefaultSkinTexture('right', D / H, skinTheme)
  const defaultBack = createDefaultSkinTexture('back', W / H, skinTheme)

  const defaults: Record<StickerSide, THREE.CanvasTexture> = {
    front: defaultFront,
    left: defaultLeft,
    right: defaultRight,
    back: defaultBack,
  }

  const makeWrapMat = (tex: THREE.CanvasTexture) =>
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.32, metalness: 0.08 })

  const frontMesh = new THREE.Mesh(frontGeom, makeWrapMat(defaultFront))
  frontMesh.name = 'Sticker_Front'
  frontMesh.position.set(0, feetH, frontZ + 0.002)
  root.add(frontMesh)

  const leftMesh = new THREE.Mesh(new THREE.PlaneGeometry(D, H), makeWrapMat(defaultLeft))
  leftMesh.name = 'Sticker_Left'
  leftMesh.rotation.y = -Math.PI / 2
  leftMesh.position.set(-W / 2 - 0.002, bodyCenterY, 0)
  root.add(leftMesh)

  const rightMesh = new THREE.Mesh(new THREE.PlaneGeometry(D, H), makeWrapMat(defaultRight))
  rightMesh.name = 'Sticker_Right'
  rightMesh.rotation.y = Math.PI / 2
  rightMesh.position.set(W / 2 + 0.002, bodyCenterY, 0)
  root.add(rightMesh)

  const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H), makeWrapMat(defaultBack))
  backMesh.name = 'Sticker_Back'
  backMesh.rotation.y = Math.PI
  backMesh.position.set(0, bodyCenterY, -D / 2 - 0.002)
  root.add(backMesh)

  const stickerMeshes: Record<
    StickerSide,
    THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  > = {
    front: frontMesh as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>,
    left: leftMesh as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>,
    right: rightMesh as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>,
    back: backMesh as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>,
  }

  function resetStickerMaterial(side: StickerSide) {
    const mesh = stickerMeshes[side]
    if (!mesh) return
    mesh.material.map = defaults[side]
    mesh.material.color.setHex(0xFFFFFF)
    mesh.material.needsUpdate = true
  }

  function updateScreenTexture(accentColor?: string) {
    const newTex = createInteractiveScreenTexture(screenPreset, accentColor)
    screenMesh.material.map?.dispose()
    screenMesh.material.map = newTex
    screenMesh.material.needsUpdate = true
  }

  function dispose() {
    defaultFront.dispose()
    defaultLeft.dispose()
    defaultRight.dispose()
    defaultBack.dispose()
    opts.screenTex.dispose()
    opts.extraTextures?.forEach((t) => t.dispose())
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        } else if (child.material) {
          child.material.dispose()
        }
      }
    })
  }

  return {
    root,
    stickerMeshes,
    screenMesh,
    updateScreenTexture,
    resetStickerMaterial,
    dispose,
  }
}

/**
 * Dispatcher building any of the 9 models defined in /Users/kickavenue/Downloads/SV Gambar Kerja
 */
export function buildSVSeriesModel(type: Vending3DModelType): VendingModelInstance | null {
  if (type === 'SV55') return buildSV55Model()
  if (type === 'SV_WM') return buildSVWMModel()
  if (type === 'VM_FUJI_PINK') return buildVMFujiPinkModel()

  const spec = STANDARD_SPECS[type]
  if (!spec) return null
  return buildStandardVendingModel(spec)
}
