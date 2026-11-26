// Procedural 3D Model Builder for SV 22 CHILLER (Studio-Grade Hardware Model)
// Exact CAD Blueprint Dimensions (PT RITRA MEDIA DISTRIBUSI, Skala 1:20 & sv 22.jpg):
// Overall Width: 128 cm (89 cm Left Glass Door + 39 cm Right Tower = 1.28 m)
// Depth: 75.5 cm (0.755 m) | Body Height: 188 cm (1.88 m) + Casters: 9 cm (0.09 m) = 1.97 m
// Glass Window: 78.5 x 124 cm (top 6.5, left 5.0, right 5.5)
// Dispenser Flap: 41 x 18 cm (11.5 cm below glass)
// 22" Portrait Screen: 29 x 47 cm (top 27.5 cm) | Payment Console: 29 x 34.5 cm (5 cm below screen, 74 cm to bottom)

import * as THREE from 'three'
import type { StickerSide, VendingModelInstance } from '@/types/editor3d'

export type SV22ModelInstance = VendingModelInstance

/**
 * Factory default clean industrial pearl-white surface with subtle panel seams & Smartven badge
 */
function createDefaultSV22SideTexture(
  side: StickerSide,
  aspectRatio: number,
): THREE.CanvasTexture {
  const height = 1024
  const width = Math.round(height * aspectRatio)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Clean studio powder-coated satin pearl white / soft cool gray gradient
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, '#F8FAFC')
    grad.addColorStop(0.5, '#F1F5F9')
    grad.addColorStop(1, '#E2E8F0')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Subtle brushed top highlight & bottom kick-guard strip
    ctx.fillStyle = 'rgba(15, 23, 42, 0.04)'
    ctx.fillRect(0, Math.round(height * 0.96), width, Math.round(height * 0.04))

    // Thin edge border shading for panel crispness
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, width - 4, height - 4)

    if (side === 'front') {
      // Vertical door seam split at 89 / 128 width ratio
      const splitX = Math.round(width * (89 / 128))
      ctx.fillStyle = '#94A3B8'
      ctx.fillRect(splitX - 1, 0, 2, height)

      // Subtle Smartven top accent header strip above tower & door
      ctx.fillStyle = '#1E293B'
      ctx.fillRect(splitX + 2, 0, width - splitX - 2, Math.round(height * 0.036))

      // Minimalist wordmark at top of right tower (within 27.5cm top margin above screen)
      ctx.fillStyle = '#475569'
      ctx.font = `bold ${Math.round(height * 0.02)}px sans-serif`
      ctx.textAlign = 'center'
      const towerCenterX = splitX + (width - splitX) / 2
      ctx.fillText('SMARTVEN', towerCenterX, Math.round(height * 0.088))
      ctx.fillStyle = '#6495ED'
      ctx.fillRect(towerCenterX - Math.round(width * 0.04), Math.round(height * 0.098), Math.round(width * 0.08), 3)

      // Subtle lower compressor ventilation louvers on right console bottom
      const ventX = splitX + Math.round((width - splitX) * 0.22)
      const ventW = Math.round((width - splitX) * 0.56)
      const ventStartY = Math.round(height * 0.84)
      ctx.fillStyle = '#CBD5E1'
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(ventX, ventStartY + i * 14, ventW, 5)
      }
      ctx.textAlign = 'start'
    } else if (side === 'back') {
      // Rear power & cooling vent grille plate near bottom
      ctx.fillStyle = '#E2E8F0'
      ctx.strokeStyle = '#CBD5E1'
      ctx.lineWidth = 3
      const plateW = Math.round(width * 0.42)
      const plateH = Math.round(height * 0.16)
      const plateX = Math.round((width - plateW) / 2)
      const plateY = Math.round(height * 0.78)
      ctx.fillRect(plateX, plateY, plateW, plateH)
      ctx.strokeRect(plateX, plateY, plateW, plateH)

      ctx.fillStyle = '#94A3B8'
      for (let row = 0; row < 5; row++) {
        ctx.fillRect(plateX + 24, plateY + 22 + row * 24, plateW - 48, 8)
      }
    } else {
      // Subtle vertical Smartven watermarks on Left & Right panels
      ctx.fillStyle = 'rgba(100, 116, 139, 0.16)'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('SMARTVEN', width / 2, Math.round(height * 0.12))
      ctx.textAlign = 'start'
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Creates crisp 22" vertical touchscreen UI texture
 */
function createScreenTexture(accentColor = '#5F93EC'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 830 // 29cm x 47cm aspect
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 830)
    bgGrad.addColorStop(0, '#0F172A')
    bgGrad.addColorStop(1, '#1E293B')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, 512, 830)

    // Top status bar
    ctx.fillStyle = '#334155'
    ctx.fillRect(0, 0, 512, 48)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText('SMARTVEN 22"', 24, 32)
    ctx.fillStyle = '#10B981'
    ctx.beginPath()
    ctx.arc(470, 24, 7, 0, Math.PI * 2)
    ctx.fill()

    // Hero banner
    ctx.fillStyle = accentColor
    ctx.beginPath()
    ctx.roundRect(24, 70, 464, 180, 16)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText('Haus?', 50, 130)
    ctx.font = 'normal 20px sans-serif'
    ctx.fillText('Pilih minuman segar favoritmu.', 50, 170)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.beginPath()
    ctx.roundRect(50, 195, 160, 36, 18)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('SENTUH UNTUK BELI', 65, 219)

    // Product Grid Preview
    const items = [
      { name: 'Cold Cola', price: 'Rp 8.000', color: '#EF4444' },
      { name: 'Fresh Water', price: 'Rp 5.000', color: '#3B82F6' },
      { name: 'Orange Fizz', price: 'Rp 9.000', color: '#F97316' },
      { name: 'Green Tea', price: 'Rp 7.500', color: '#10B981' },
    ]

    items.forEach((item, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      const x = 24 + col * 240
      const y = 280 + row * 220

      ctx.fillStyle = '#1E293B'
      ctx.beginPath()
      ctx.roundRect(x, y, 224, 200, 16)
      ctx.fill()

      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.roundRect(x + 82, y + 25, 60, 95, 12)
      ctx.fill()

      ctx.fillStyle = '#F8FAFC'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText(item.name, x + 20, y + 150)
      ctx.fillStyle = '#94A3B8'
      ctx.font = 'normal 16px sans-serif'
      ctx.fillText(item.price, x + 20, y + 175)
    })

    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 740, 512, 90)
    ctx.fillStyle = '#64748B'
    ctx.font = '16px sans-serif'
    ctx.fillText('Bayar Mudah dengan QRIS & E-Money', 24, 785)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Creates payment module texture (29cm x 34.5cm)
 */
function createPaymentTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 608
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, 512, 608)

    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 8
    ctx.strokeRect(8, 8, 496, 592)

    // NFC Card Tap Reader
    ctx.fillStyle = '#1E293B'
    ctx.beginPath()
    ctx.roundRect(44, 36, 424, 165, 14)
    ctx.fill()
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = '#60A5FA'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('TEMPEL KARTU / NFC TAP', 256, 108)
    ctx.fillStyle = '#94A3B8'
    ctx.font = '16px sans-serif'
    ctx.fillText('Flazz • e-Money • TapCash • Brizzi', 256, 145)

    // Cash Bill Acceptor Module
    ctx.fillStyle = '#1E293B'
    ctx.beginPath()
    ctx.roundRect(44, 228, 424, 175, 14)
    ctx.fill()
    ctx.strokeStyle = '#22C55E'
    ctx.lineWidth = 3
    ctx.stroke()

    // Glowing green bill slot opening
    ctx.fillStyle = '#020617'
    ctx.beginPath()
    ctx.roundRect(96, 266, 320, 48, 8)
    ctx.fill()
    ctx.strokeStyle = '#4ADE80'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = '#4ADE80'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('MASUKKAN UANG KERTAS', 256, 355)
    ctx.fillStyle = '#94A3B8'
    ctx.font = '15px sans-serif'
    ctx.fillText('Pecahan Rp 2.000 - Rp 50.000', 256, 382)

    // QRIS Instruction Badge
    ctx.fillStyle = '#1E293B'
    ctx.beginPath()
    ctx.roundRect(44, 430, 424, 136, 14)
    ctx.fill()
    ctx.fillStyle = '#F8FAFC'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText('QRIS DINAMIS DI LAYAR', 256, 486)
    ctx.fillStyle = '#94A3B8'
    ctx.font = '15px sans-serif'
    ctx.fillText('GoPay • OVO • DANA • ShopeePay • BCA', 256, 520)
    ctx.textAlign = 'start'
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Creates a full-front ShapeGeometry (W x H) with normalized 0..1 UVs and punched glass hole
 */
function createFrontWrapGeometry(
  W: number,
  H: number,
  holeLeft: number,
  holeBottom: number,
  holeW: number,
  holeH: number,
): THREE.ShapeGeometry {
  const outer = new THREE.Shape()
  outer.moveTo(-W / 2, 0)
  outer.lineTo(W / 2, 0)
  outer.lineTo(W / 2, H)
  outer.lineTo(-W / 2, H)
  outer.closePath()

  const hole = new THREE.Path()
  hole.moveTo(holeLeft, holeBottom)
  hole.lineTo(holeLeft, holeBottom + holeH)
  hole.lineTo(holeLeft + holeW, holeBottom + holeH)
  hole.lineTo(holeLeft + holeW, holeBottom)
  hole.closePath()
  outer.holes.push(hole)

  const geom = new THREE.ShapeGeometry(outer)
  const posAttr = geom.attributes.position
  const uvAttr = geom.attributes.uv
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i)
    const py = posAttr.getY(i)
    uvAttr.setXY(i, (px + W / 2) / W, py / H)
  }
  uvAttr.needsUpdate = true
  return geom
}

/**
 * Builds the enhanced studio-grade 3D model of SV 22 CHILLER
 */
export function buildSV22Model(): SV22ModelInstance {
  const root = new THREE.Group()
  root.name = 'SV22_Chiller_Root'

  // Exact CAD blueprint dimensions (Meters):
  // Width: 128 cm (89 cm Glass Door + 39 cm Tower) | Depth: 75.5 cm | Body Height: 188 cm + 9 cm Casters
  const W = 1.280
  const H = 1.880
  const D = 0.755
  const feetH = 0.090
  const doorW = 0.890
  const towerW = 0.390

  const bodyCenterY = feetH + H / 2
  const doorCenterX = -W / 2 + doorW / 2 // -0.195m
  const towerCenterX = W / 2 - towerW / 2 // +0.445m

  // Glass Display Window (CAD: 78.5 cm x 124 cm; Top margin 6.5 cm, Left margin 5.0 cm, Right margin 5.5 cm)
  const glassW = 0.785
  const glassH = 1.240
  const glassMarginTop = 0.065
  const glassMarginLeft = 0.050
  const glassLeft = -W / 2 + glassMarginLeft // -0.590m
  const glassCenterX = glassLeft + glassW / 2 // -0.1975m
  const glassBottomFromBody = H - glassMarginTop - glassH // 0.575m
  const glassCenterY = feetH + glassBottomFromBody + glassH / 2 // 1.385m

  // Shared Industrial Materials
  const bodyCoreMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    metalness: 0.25,
    roughness: 0.35,
  })

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    metalness: 0.55,
    roughness: 0.35,
  })

  const brushedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x94A3B8,
    metalness: 0.78,
    roughness: 0.24,
  })

  const interiorDarkMat = new THREE.MeshStandardMaterial({
    color: 0x0B1120,
    roughness: 0.85,
    metalness: 0.15,
  })

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xF0F9FF,
    transmission: 0.94,
    opacity: 0.22,
    transparent: true,
    roughness: 0.04,
    metalness: 0.08,
    ior: 1.5,
    thickness: 0.015,
  })

  const casterRubberMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    metalness: 0.2,
    roughness: 0.7,
  })

  // 1. STRUCTURAL CHASSIS PANELS (Hollow architecture behind glass window)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.04), bodyCoreMat)
  backWall.position.set(0, bodyCenterY, -D / 2 + 0.02)
  backWall.castShadow = true
  backWall.receiveShadow = true
  root.add(backWall)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), bodyCoreMat)
  roof.position.set(0, feetH + H - 0.02, 0)
  roof.castShadow = true
  root.add(roof)

  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), bodyCoreMat)
  basePlate.position.set(0, feetH + 0.02, 0)
  basePlate.receiveShadow = true
  root.add(basePlate)

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.04, H, D), bodyCoreMat)
  leftWall.position.set(-W / 2 + 0.02, bodyCenterY, 0)
  leftWall.castShadow = true
  leftWall.receiveShadow = true
  root.add(leftWall)

  // Right Control Tower Cabinet (39cm wide)
  const towerCore = new THREE.Mesh(new THREE.BoxGeometry(towerW, H, D), bodyCoreMat)
  towerCore.position.set(towerCenterX, bodyCenterY, 0)
  towerCore.castShadow = true
  towerCore.receiveShadow = true
  root.add(towerCore)

  // Front lower plate (57.5 cm tall below glass window) & top header plate (6.5 cm tall)
  const frontLowerPlate = new THREE.Mesh(
    new THREE.BoxGeometry(doorW, glassBottomFromBody, 0.04),
    bodyCoreMat,
  )
  frontLowerPlate.position.set(doorCenterX, feetH + glassBottomFromBody / 2, D / 2 - 0.02)
  root.add(frontLowerPlate)

  const frontTopPlate = new THREE.Mesh(
    new THREE.BoxGeometry(doorW, glassMarginTop, 0.04),
    bodyCoreMat,
  )
  frontTopPlate.position.set(doorCenterX, feetH + H - glassMarginTop / 2, D / 2 - 0.02)
  root.add(frontTopPlate)

  // 2. ILLUMINATED DISPLAY CAVITY & SHELVES WITH BEVERAGE CANS/BOTTLES
  const cavityW = glassW + 0.02
  const cavityH = glassH
  const cavityD = D - 0.12
  const cavityCenterZ = 0.02

  const interiorBack = new THREE.Mesh(new THREE.PlaneGeometry(cavityW, cavityH), interiorDarkMat)
  interiorBack.position.set(glassCenterX, glassCenterY, -cavityD / 2 + 0.02)
  root.add(interiorBack)

  // Cool white top LED bar + point light inside chiller
  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(cavityW - 0.04, 0.015, 0.025),
    new THREE.MeshBasicMaterial({ color: 0xF8FAFC }),
  )
  ledStrip.position.set(glassCenterX, glassCenterY + cavityH / 2 - 0.018, D / 2 - 0.05)
  root.add(ledStrip)

  const chillerLight = new THREE.PointLight(0xFFFFFF, 1.5, 2.6)
  chillerLight.position.set(glassCenterX, glassCenterY + cavityH / 2 - 0.06, 0.12)
  root.add(chillerLight)

  // 5 Metallic Shelves with Spiral Dispensing Coils & Beverage Cans/Bottles
  const shelfCount = 5
  const shelfSpacing = cavityH / (shelfCount + 1)
  const canColors = [0xDC2626, 0x2563EB, 0xEA580C, 0x16A34A, 0x7C3AED, 0xEAB308, 0x0EA5E9]
  const coilMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    metalness: 0.85,
    roughness: 0.2,
  })

  for (let s = 0; s < shelfCount; s++) {
    const sY = glassCenterY - cavityH / 2 + (s + 1) * shelfSpacing

    // Steel shelf deck
    const sMesh = new THREE.Mesh(
      new THREE.BoxGeometry(cavityW - 0.03, 0.014, cavityD - 0.08),
      brushedSteelMat,
    )
    sMesh.position.set(glassCenterX, sY, cavityCenterZ)
    sMesh.receiveShadow = true
    root.add(sMesh)

    // Front price tag rail
    const railMesh = new THREE.Mesh(
      new THREE.BoxGeometry(cavityW - 0.03, 0.018, 0.012),
      darkMetalMat,
    )
    railMesh.position.set(glassCenterX, sY + 0.004, cavityCenterZ + (cavityD - 0.08) / 2)
    root.add(railMesh)

    // 7 Beverage lanes per shelf (can/bottle + metallic rim + spiral coil)
    const lanes = 7
    const laneSpacing = (cavityW - 0.08) / lanes
    for (let c = 0; c < lanes; c++) {
      const cX = glassCenterX - (cavityW - 0.08) / 2 + (c + 0.5) * laneSpacing
      const isBottle = s % 2 === 1
      const drinkH = isBottle ? 0.118 : 0.095
      const drinkR = isBottle ? 0.021 : 0.024

      const canBodyMat = new THREE.MeshStandardMaterial({
        color: canColors[(s * lanes + c) % canColors.length],
        metalness: isBottle ? 0.15 : 0.55,
        roughness: isBottle ? 0.2 : 0.28,
      })
      const canMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(drinkR, drinkR, drinkH, 16),
        canBodyMat,
      )
      canMesh.position.set(cX, sY + drinkH / 2 + 0.007, cavityCenterZ + 0.08)
      canMesh.castShadow = true
      root.add(canMesh)

      // Silver pull-tab lid or bottle cap
      const capGeom = isBottle
        ? new THREE.CylinderGeometry(0.011, 0.011, 0.018, 12)
        : new THREE.CylinderGeometry(drinkR * 0.92, drinkR, 0.008, 16)
      const capMesh = new THREE.Mesh(capGeom, brushedSteelMat)
      capMesh.position.set(cX, sY + drinkH + 0.008, cavityCenterZ + 0.08)
      root.add(capMesh)

      // Spiral dispensing ring in front of drink
      const coilMesh = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.003, 6, 16), coilMat)
      coilMesh.position.set(cX, sY + 0.035, cavityCenterZ + 0.125)
      root.add(coilMesh)
    }
  }

  // 3. CLOSED 4-SIDED GLASS DOOR FRAME & TRANSPARENT PANE (3.5 cm Door Protrusion per CAD)
  const frontZ = D / 2
  const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.008), glassMat)
  glassMesh.position.set(glassCenterX, glassCenterY, frontZ + 0.018)
  root.add(glassMesh)

  const bezelThickness = 0.022
  const bezelDepth = 0.026
  const bezelZ = frontZ + 0.014

  const topBezel = new THREE.Mesh(
    new THREE.BoxGeometry(glassW + bezelThickness * 2, bezelThickness, bezelDepth),
    darkMetalMat,
  )
  topBezel.position.set(glassCenterX, glassCenterY + glassH / 2 + bezelThickness / 2, bezelZ)
  root.add(topBezel)

  const bottomBezel = new THREE.Mesh(
    new THREE.BoxGeometry(glassW + bezelThickness * 2, bezelThickness, bezelDepth),
    darkMetalMat,
  )
  bottomBezel.position.set(glassCenterX, glassCenterY - glassH / 2 - bezelThickness / 2, bezelZ)
  root.add(bottomBezel)

  const leftBezel = new THREE.Mesh(
    new THREE.BoxGeometry(bezelThickness, glassH, bezelDepth),
    darkMetalMat,
  )
  leftBezel.position.set(glassCenterX - glassW / 2 - bezelThickness / 2, glassCenterY, bezelZ)
  root.add(leftBezel)

  const rightBezel = new THREE.Mesh(
    new THREE.BoxGeometry(bezelThickness, glassH, bezelDepth),
    darkMetalMat,
  )
  rightBezel.position.set(glassCenterX + glassW / 2 + bezelThickness / 2, glassCenterY, bezelZ)
  root.add(rightBezel)

  // 4. RETRIEVAL DISPENSER BIN (CAD: 41 cm wide x 18 cm tall, 11.5 cm below glass window)
  const dispenserW = 0.410
  const dispenserH = 0.180
  const dispenserTopFromBody = glassBottomFromBody - 0.115 // 0.575 - 0.115 = 0.460m
  const dispenserY = feetH + dispenserTopFromBody - dispenserH / 2 // 0.090 + 0.370 = 0.460m

  const dispenserFrame = new THREE.Mesh(
    new THREE.BoxGeometry(dispenserW + 0.036, dispenserH + 0.036, 0.028),
    darkMetalMat,
  )
  dispenserFrame.position.set(doorCenterX, dispenserY, frontZ + 0.012)
  root.add(dispenserFrame)

  // Brushed aluminum push flap & rubber top handle bar
  const flapMesh = new THREE.Mesh(
    new THREE.BoxGeometry(dispenserW - 0.01, dispenserH - 0.01, 0.012),
    brushedSteelMat,
  )
  flapMesh.position.set(doorCenterX, dispenserY, frontZ + 0.024)
  root.add(flapMesh)

  const flapHandle = new THREE.Mesh(
    new THREE.BoxGeometry(dispenserW - 0.04, 0.022, 0.018),
    darkMetalMat,
  )
  flapHandle.position.set(doorCenterX, dispenserY + dispenserH / 2 - 0.025, frontZ + 0.028)
  root.add(flapHandle)

  // 5. RIGHT CONSOLE TOWER HARDWARE (CAD: Screen 29x47 @ top 27.5, Payment 29x34.5 @ 5 below)
  const screenW = 0.290
  const screenH = 0.470
  const screenY = feetH + (H - 0.275 - screenH / 2) // 0.090 + 1.370 = 1.460m

  const screenBezel = new THREE.Mesh(
    new THREE.BoxGeometry(screenW + 0.028, screenH + 0.028, 0.02),
    darkMetalMat,
  )
  screenBezel.position.set(towerCenterX, screenY, frontZ + 0.01)
  root.add(screenBezel)

  const screenTexture = createScreenTexture('#5F93EC')
  const screenMaterial = new THREE.MeshStandardMaterial({
    map: screenTexture,
    roughness: 0.15,
    metalness: 0.1,
    emissive: 0x334155,
    emissiveIntensity: 0.22,
  })
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMaterial)
  screenMesh.position.set(towerCenterX, screenY, frontZ + 0.021)
  root.add(screenMesh)

  // Payment Console (CAD: 29 cm x 34.5 cm, 5 cm below screen, 74 cm above bottom)
  const paymentW = 0.290
  const paymentH = 0.345
  const paymentY = feetH + (0.740 + paymentH / 2) // 0.090 + 0.9125 = 1.0025m

  const paymentFrame = new THREE.Mesh(
    new THREE.BoxGeometry(paymentW + 0.024, paymentH + 0.024, 0.018),
    darkMetalMat,
  )
  paymentFrame.position.set(towerCenterX, paymentY, frontZ + 0.009)
  root.add(paymentFrame)

  const paymentTexture = createPaymentTexture()
  const paymentMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(paymentW, paymentH),
    new THREE.MeshStandardMaterial({ map: paymentTexture, roughness: 0.35, metalness: 0.2 }),
  )
  paymentMesh.position.set(towerCenterX, paymentY, frontZ + 0.019)
  root.add(paymentMesh)

  // T-Handle Door Lock & Keyhole (CAD: 4.0 x 4.5 cm near left edge of tower, between screen & payment)
  const lockHousing = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.095, 0.022), darkMetalMat)
  lockHousing.position.set(W / 2 - towerW + 0.028, feetH + 1.18, frontZ + 0.012)
  root.add(lockHousing)

  const lockLatch = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.045, 0.015), brushedSteelMat)
  lockLatch.position.set(W / 2 - towerW + 0.028, feetH + 1.18, frontZ + 0.024)
  root.add(lockLatch)

  // Right-Side Door Hinges ("Engsel Pintu" from sv 22.jpg reference)
  const hingeYPositions = [feetH + H - 0.14, feetH + 0.14]
  hingeYPositions.forEach((hy) => {
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.065, 0.032), darkMetalMat)
    hinge.position.set(W / 2 + 0.005, hy, frontZ - 0.005)
    root.add(hinge)
  })

  // 6. HEAVY-DUTY CASTER WHEELS & PLATES (CAD: 9.00 cm total height, 3.00 cm mounting stem/plate)
  const wheelRadius = 0.032
  const wheelWidth = 0.030
  const feetOffsetW = W / 2 - 0.09
  const feetOffsetD = D / 2 - 0.09
  const wheelCorners = [
    [-feetOffsetW, -feetOffsetD],
    [feetOffsetW, -feetOffsetD],
    [-feetOffsetW, feetOffsetD],
    [feetOffsetW, feetOffsetD],
  ]

  wheelCorners.forEach(([wx, wz]) => {
    // Mounting plate + stem (top 3cm)
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.035, 16), brushedSteelMat)
    stem.position.set(wx, feetH - 0.0175, wz)
    root.add(stem)

    // Rotating caster wheel cylinder (touching y = 0)
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 20),
      casterRubberMat,
    )
    wheel.rotation.z = Math.PI / 2
    wheel.position.set(wx, wheelRadius, wz)
    wheel.castShadow = true
    root.add(wheel)
  })

  // 7. FULL-COVERAGE STICKER WRAP MESHES (Front w/ glass hole, Left, Right, Back)
  const defaultFrontTex = createDefaultSV22SideTexture('front', W / H)
  const defaultLeftTex = createDefaultSV22SideTexture('left', D / H)
  const defaultRightTex = createDefaultSV22SideTexture('right', D / H)
  const defaultBackTex = createDefaultSV22SideTexture('back', W / H)

  const defaultTextures: Record<StickerSide, THREE.CanvasTexture> = {
    front: defaultFrontTex,
    left: defaultLeftTex,
    right: defaultRightTex,
    back: defaultBackTex,
  }

  // A. Full Front Wrap (covers 1.28 x 1.88 m around the 78.5 x 124 cm glass cutout)
  const frontWrapGeom = createFrontWrapGeometry(
    W,
    H,
    glassLeft,
    glassBottomFromBody,
    glassW,
    glassH,
  )
  const frontStickerMesh = new THREE.Mesh(
    frontWrapGeom,
    new THREE.MeshStandardMaterial({
      map: defaultFrontTex,
      roughness: 0.3,
      metalness: 0.1,
    }),
  )
  frontStickerMesh.name = 'Sticker_Front'
  frontStickerMesh.position.set(0, feetH, frontZ + 0.002)
  root.add(frontStickerMesh)

  // B. Full Left Panel Wrap (75.5 cm x 188 cm)
  const leftStickerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(D, H),
    new THREE.MeshStandardMaterial({
      map: defaultLeftTex,
      roughness: 0.3,
      metalness: 0.1,
    }),
  )
  leftStickerMesh.name = 'Sticker_Left'
  leftStickerMesh.rotation.y = -Math.PI / 2
  leftStickerMesh.position.set(-W / 2 - 0.002, bodyCenterY, 0)
  root.add(leftStickerMesh)

  // C. Full Right Panel Wrap (75.5 cm x 188 cm)
  const rightStickerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(D, H),
    new THREE.MeshStandardMaterial({
      map: defaultRightTex,
      roughness: 0.3,
      metalness: 0.1,
    }),
  )
  rightStickerMesh.name = 'Sticker_Right'
  rightStickerMesh.rotation.y = Math.PI / 2
  rightStickerMesh.position.set(W / 2 + 0.002, bodyCenterY, 0)
  root.add(rightStickerMesh)

  // D. Full Back Panel Wrap (128 cm x 188 cm)
  const backStickerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(W, H),
    new THREE.MeshStandardMaterial({
      map: defaultBackTex,
      roughness: 0.3,
      metalness: 0.1,
    }),
  )
  backStickerMesh.name = 'Sticker_Back'
  backStickerMesh.rotation.y = Math.PI
  backStickerMesh.position.set(0, bodyCenterY, -D / 2 - 0.002)
  root.add(backStickerMesh)

  const stickerMeshes: Record<
    StickerSide,
    THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  > = {
    front: frontStickerMesh as unknown as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshStandardMaterial
    >,
    left: leftStickerMesh as unknown as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshStandardMaterial
    >,
    right: rightStickerMesh as unknown as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshStandardMaterial
    >,
    back: backStickerMesh as unknown as THREE.Mesh<
      THREE.BufferGeometry,
      THREE.MeshStandardMaterial
    >,
  }

  function resetStickerMaterial(side: StickerSide) {
    const mesh = stickerMeshes[side]
    if (!mesh) return
    mesh.material.map = defaultTextures[side]
    mesh.material.color.setHex(0xFFFFFF)
    mesh.material.needsUpdate = true
  }

  function updateScreenTexture(accentColor?: string) {
    const newTex = createScreenTexture(accentColor)
    screenMesh.material.map?.dispose()
    screenMesh.material.map = newTex
    screenMesh.material.needsUpdate = true
  }

  function dispose() {
    defaultFrontTex.dispose()
    defaultLeftTex.dispose()
    defaultRightTex.dispose()
    defaultBackTex.dispose()
    screenTexture.dispose()
    paymentTexture.dispose()
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
