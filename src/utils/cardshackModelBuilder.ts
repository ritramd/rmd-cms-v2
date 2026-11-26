// Procedural 3D Model Builder for Cardshack Indonesia Full-Wrap Vending Machine
// Based on Cardshack Vending_Indonesia_Mock_02 Nov 2026.ai (Scale 1:10):
// Overall Width: 1255 mm (880 mm Left Glass Door + 375 mm Right Tower = 1.255 m)
// Depth: 790 mm (0.790 m) | Body Height: 1855 mm (1.855 m) + Recessed Glides
// Glass Window: 780 mm x 1240 mm | Retrieval Flap: 430 mm x 220 mm
// Full-coverage vinyl wrap across Front (cutout around glass), Left, Right, and Back.

import * as THREE from 'three'
import type { StickerSide, VendingModelInstance } from '@/types/editor3d'

/**
 * Draws the Cardshack 4-card fan mark and wordmark on a 2D canvas context
 */
function drawCardshackBrandMark(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  scale = 1,
) {
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.scale(scale, scale)

  // Draw fanned cards (4 cards angled from left to right)
  const angles = [-0.42, -0.18, 0.08, 0.34]
  const cardW = 46
  const cardH = 68

  angles.forEach((angle, idx) => {
    ctx.save()
    ctx.translate((idx - 1.5) * 14, Math.abs(idx - 1.5) * 3 - 26)
    ctx.rotate(angle)

    ctx.fillStyle = '#D62324'
    ctx.strokeStyle = '#18181B'
    ctx.lineWidth = 2.6
    ctx.beginPath()
    ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 4)
    ctx.fill()
    ctx.stroke()

    // Inner card border
    ctx.strokeStyle = '#18181B'
    ctx.lineWidth = 1.2
    ctx.strokeRect(-cardW / 2 + 5, -cardH / 2 + 5, cardW - 10, cardH - 10)

    // Front-most right card features "INDONESIA"
    if (idx === 3) {
      ctx.save()
      ctx.fillStyle = '#18181B'
      ctx.font = 'bold 7.5px sans-serif'
      ctx.textAlign = 'center'
      ctx.rotate(-Math.PI / 4)
      ctx.fillText('INDONESIA', 0, -2)
      ctx.beginPath()
      ctx.arc(0, 8, 2.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    ctx.restore()
  })

  // Wordmark below fan
  ctx.fillStyle = '#18181B'
  ctx.font = 'bold 34px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('CARDSHACK', 0, 56)

  ctx.restore()
}

/**
 * Creates the factory default wrap CanvasTexture matching Cardshack Mock (Red top, black stripe, white bottom)
 */
function createDefaultSideTexture(
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
    // Upper ~49% red, ~2.5% black stripe, remaining lower white (matching mock-up proportions)
    const redSplitY = Math.round(height * 0.485)
    const stripeH = Math.round(height * 0.024)

    // Upper crimson red (#D62324)
    ctx.fillStyle = '#D62324'
    ctx.fillRect(0, 0, width, redSplitY)

    // Horizontal black dividing stripe
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, redSplitY, width, stripeH)

    // Lower clean white wrap
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, redSplitY + stripeH, width, height - redSplitY - stripeH)

    // Bottom plinth double pinstripe lines (seen across Left, Front, Right, Back in mock)
    const line1Y = Math.round(height * 0.962)
    const line2Y = Math.round(height * 0.985)
    ctx.fillStyle = '#18181B'
    ctx.fillRect(0, line1Y, width, Math.max(3, Math.round(height * 0.005)))
    ctx.fillRect(0, line2Y, width, Math.max(3, Math.round(height * 0.005)))

    if (side === 'left' || side === 'right' || side === 'back') {
      const markScale = side === 'back' ? 1.55 : 1.25
      drawCardshackBrandMark(ctx, width / 2, redSplitY * 0.56, markScale)
    } else if (side === 'front') {
      // Door split vertical hairline at 880 / 1255 width ratio
      const doorSplitX = Math.round(width * (880 / 1255))
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
      ctx.fillRect(doorSplitX - 1, 0, 2, height)

      // Upper Right Column: Yellow Returns Policy & Contact Info box (aligned with tower)
      const towerCenterX = doorSplitX + (width - doorSplitX) / 2
      const boxW = Math.round((width - doorSplitX) * 0.68)
      const boxH = Math.round(height * 0.09)
      const boxX = towerCenterX - boxW / 2
      const boxY = Math.round(height * 0.05)

      ctx.fillStyle = '#FDE047'
      ctx.strokeStyle = '#18181B'
      ctx.lineWidth = 2
      ctx.fillRect(boxX, boxY, boxW, boxH)
      ctx.strokeRect(boxX, boxY, boxW, boxH)

      ctx.fillStyle = '#111827'
      ctx.font = `bold ${Math.max(10, Math.round(height * 0.011))}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('Returns Policy', towerCenterX, boxY + Math.round(boxH * 0.28))
      ctx.font = `${Math.max(8, Math.round(height * 0.0085))}px sans-serif`
      ctx.fillText('All items are sold as-is.', towerCenterX, boxY + Math.round(boxH * 0.50))
      ctx.fillText('Contact Information:', towerCenterX, boxY + Math.round(boxH * 0.74))

      // Below Black Stripe on Tower: Yellow "IMPORTANT!!!" Caution Notice
      const warnW = Math.round((width - doorSplitX) * 0.36)
      const warnH = Math.round(height * 0.048)
      const warnX = doorSplitX + Math.round((width - doorSplitX) * 0.28)
      const warnY = redSplitY + stripeH + Math.round(height * 0.018)

      ctx.fillStyle = '#FDE047'
      ctx.fillRect(warnX, warnY, warnW, warnH)
      ctx.strokeRect(warnX, warnY, warnW, warnH)
      ctx.fillStyle = '#111827'
      ctx.font = `bold ${Math.max(8, Math.round(height * 0.009))}px sans-serif`
      ctx.fillText('IMPORTANT!!!', warnX + warnW / 2, warnY + Math.round(warnH * 0.45))

      // Above Pickup Box: Green LED strip + yellow Left/Right arrows indicator strip
      const doorCenterX = doorSplitX / 2
      const arrowY = Math.round(height * 0.745)
      const arrowPillW = Math.round(width * 0.095)
      const arrowPillH = Math.round(height * 0.018)
      ctx.fillStyle = '#22C55E'
      ctx.beginPath()
      ctx.roundRect(doorCenterX - arrowPillW / 2, arrowY - arrowPillH / 2, arrowPillW, arrowPillH, 4)
      ctx.fill()

      ctx.fillStyle = '#FACC15'
      ctx.strokeStyle = '#18181B'
      ctx.lineWidth = 1.5
      // Left arrow indicator
      ctx.fillRect(doorCenterX - arrowPillW, arrowY - arrowPillH / 2, Math.round(arrowPillW * 0.35), arrowPillH)
      // Right arrow indicator
      ctx.fillRect(doorCenterX + arrowPillW * 0.65, arrowY - arrowPillH / 2, Math.round(arrowPillW * 0.35), arrowPillH)
      ctx.textAlign = 'start'
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Creates 22" vertical touchscreen UI texture for Cardshack
 */
function createCardshackScreenTexture(accentColor = '#D62324'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 830
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 830)
    grad.addColorStop(0, '#18181B')
    grad.addColorStop(1, '#09090B')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 830)

    // Top Cardshack Bar
    ctx.fillStyle = accentColor
    ctx.fillRect(0, 0, 512, 96)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText('CARDSHACK', 28, 56)
    ctx.font = '16px sans-serif'
    ctx.fillText('INDONESIA • COLLECTIBLES', 28, 80)

    // Card packs showcase
    const packs = [
      { title: 'Booster Box', price: 'Rp 850.000', color: '#DC2626' },
      { title: 'Graded Slab', price: 'Rp 450.000', color: '#2563EB' },
      { title: 'Mystery Pack', price: 'Rp 150.000', color: '#CA8A04' },
      { title: 'Starter Deck', price: 'Rp 220.000', color: '#16A34A' },
    ]

    packs.forEach((pack, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 26 + col * 238
      const y = 130 + row * 265

      ctx.fillStyle = '#27272A'
      ctx.beginPath()
      ctx.roundRect(x, y, 220, 245, 16)
      ctx.fill()

      ctx.fillStyle = pack.color
      ctx.beginPath()
      ctx.roundRect(x + 62, y + 24, 96, 130, 8)
      ctx.fill()

      ctx.fillStyle = '#FAFAFA'
      ctx.font = 'bold 20px sans-serif'
      ctx.fillText(pack.title, x + 20, y + 188)
      ctx.fillStyle = '#A1A1AA'
      ctx.font = '16px sans-serif'
      ctx.fillText(pack.price, x + 20, y + 216)
    })

    // Bottom CTA
    ctx.fillStyle = accentColor
    ctx.beginPath()
    ctx.roundRect(26, 700, 460, 84, 16)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('PILIH KARTU FAVORITMU', 256, 750)
    ctx.textAlign = 'start'
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Builds the Pickup Flap texture matching Cardshack front (430mm x 220mm)
 */
function createPickupFlapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 328
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#F8FAFC'
    ctx.fillRect(0, 0, 640, 328)
    ctx.strokeStyle = '#18181B'
    ctx.lineWidth = 10
    ctx.strokeRect(5, 5, 630, 318)

    // Side downward arrows
    ctx.fillStyle = '#18181B'
    ctx.font = 'bold 42px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('↓', 46, 175)
    ctx.fillText('↓', 594, 175)

    // Mini Cardshack logo & wordmark
    drawCardshackBrandMark(ctx, 320, 108, 0.92)

    // Yellow Warning Strip at Bottom
    ctx.fillStyle = '#FDE047'
    ctx.strokeStyle = '#18181B'
    ctx.lineWidth = 3
    ctx.fillRect(110, 212, 420, 62)
    ctx.strokeRect(110, 212, 420, 62)

    ctx.fillStyle = '#18181B'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('WAIT for the blinking light before opening.', 320, 238)
    ctx.font = 'bold 17px sans-serif'
    ctx.fillText('DO NOT force it open.', 320, 262)
    ctx.textAlign = 'start'
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Builds a ShapeGeometry covering full front panel (W x H) with normalized 0..1 UVs
 * and cleanly punches a cutout hole for the glass window so the transparent interior shines through.
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

  // Glass window rectangular cutout (clockwise hole path)
  const hole = new THREE.Path()
  hole.moveTo(holeLeft, holeBottom)
  hole.lineTo(holeLeft, holeBottom + holeH)
  hole.lineTo(holeLeft + holeW, holeBottom + holeH)
  hole.lineTo(holeLeft + holeW, holeBottom)
  hole.closePath()
  outer.holes.push(hole)

  const geom = new THREE.ShapeGeometry(outer)

  // Remap UVs to [0..1] across full W x H front face
  const posAttr = geom.attributes.position
  const uvAttr = geom.attributes.uv
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i)
    const py = posAttr.getY(i)
    const u = (px + W / 2) / W
    const v = py / H
    uvAttr.setXY(i, u, v)
  }
  uvAttr.needsUpdate = true

  return geom
}

/**
 * Builds the 3D Model for Cardshack Indonesia Full-Wrap Vending Machine
 */
export function buildCardshackModel(): VendingModelInstance {
  const root = new THREE.Group()
  root.name = 'Cardshack_Vending_Root'

  // Exact dimensions from Cardshack Vending_Indonesia_Mock_02 Nov 2026.ai (meters):
  // Width: 1255 mm (880 mm Left Door + 375 mm Right Tower), Depth: 790 mm, Height: 1855 mm
  const W = 1.255
  const H = 1.855
  const D = 0.790
  const feetH = 0.04
  const doorW = 0.880
  const towerW = 0.375

  const bodyCenterY = feetH + H / 2
  const doorCenterX = -W / 2 + doorW / 2 // -0.1875m
  const towerCenterX = W / 2 - towerW / 2 // +0.440m

  // Glass window dimensions: 780mm x 1240mm
  const glassW = 0.780
  const glassH = 1.240
  const glassMarginTop = 0.055
  const glassBottomFromBody = H - glassMarginTop - glassH // 1.855 - 0.055 - 1.240 = 0.560m
  const glassLeft = doorCenterX - glassW / 2
  const glassCenterY = feetH + glassBottomFromBody + glassH / 2

  // Shared materials
  const bodyCoreMat = new THREE.MeshStandardMaterial({
    color: 0x18181B,
    metalness: 0.35,
    roughness: 0.45,
  })

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.6,
    roughness: 0.35,
  })

  const interiorDarkMat = new THREE.MeshStandardMaterial({
    color: 0x090D16,
    roughness: 0.85,
    metalness: 0.15,
  })

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xF8FAFC,
    transmission: 0.94,
    opacity: 0.2,
    transparent: true,
    roughness: 0.04,
    metalness: 0.08,
    ior: 1.5,
    thickness: 0.015,
  })

  const shelfMat = new THREE.MeshStandardMaterial({
    color: 0x94A3B8,
    metalness: 0.7,
    roughness: 0.3,
  })

  // 1. STRUCTURAL CABINET ENCLOSURE (Hollow display cavity behind left glass door)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.04), bodyCoreMat)
  backWall.position.set(0, bodyCenterY, -D / 2 + 0.02)
  backWall.castShadow = true
  backWall.receiveShadow = true
  root.add(backWall)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), bodyCoreMat)
  roof.position.set(0, feetH + H - 0.02, 0)
  roof.castShadow = true
  root.add(roof)

  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(W, 0.04, D), bodyCoreMat)
  baseMesh.position.set(0, feetH + 0.02, 0)
  baseMesh.receiveShadow = true
  root.add(baseMesh)

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.04, H, D), bodyCoreMat)
  leftWall.position.set(-W / 2 + 0.02, bodyCenterY, 0)
  leftWall.castShadow = true
  leftWall.receiveShadow = true
  root.add(leftWall)

  // Tower solid core (Right 375mm column)
  const towerCore = new THREE.Mesh(new THREE.BoxGeometry(towerW, H, D), bodyCoreMat)
  towerCore.position.set(towerCenterX, bodyCenterY, 0)
  towerCore.castShadow = true
  towerCore.receiveShadow = true
  root.add(towerCore)

  // Front lower plate (below glass window, supporting retrieval flap & wrap)
  const frontLowerPlate = new THREE.Mesh(
    new THREE.BoxGeometry(doorW, glassBottomFromBody, 0.04),
    bodyCoreMat,
  )
  frontLowerPlate.position.set(doorCenterX, feetH + glassBottomFromBody / 2, D / 2 - 0.02)
  root.add(frontLowerPlate)

  // Front top plate above glass window
  const frontTopPlate = new THREE.Mesh(
    new THREE.BoxGeometry(doorW, glassMarginTop, 0.04),
    bodyCoreMat,
  )
  frontTopPlate.position.set(doorCenterX, feetH + H - glassMarginTop / 2, D / 2 - 0.02)
  root.add(frontTopPlate)

  // 2. INNER CAVITY & TRADING CARD PACKS / COLLECTIBLES BEHIND GLASS
  const cavityW = doorW - 0.06
  const cavityH = glassH
  const cavityD = D - 0.12
  const cavityCenterZ = 0.02

  const interiorBack = new THREE.Mesh(new THREE.PlaneGeometry(cavityW, cavityH), interiorDarkMat)
  interiorBack.position.set(doorCenterX, glassCenterY, -cavityD / 2 + 0.02)
  root.add(interiorBack)

  // Bright chiller interior display LED lighting
  const displayLight = new THREE.PointLight(0xFFFFFF, 1.5, 2.6)
  displayLight.position.set(doorCenterX, glassCenterY + cavityH / 2 - 0.05, 0.12)
  root.add(displayLight)

  // 5 Shelves stocked with collectible trading card booster boxes & graded card slabs
  const shelfCount = 5
  const shelfSpacing = cavityH / (shelfCount + 1)
  const packColors = [0xDC2626, 0x2563EB, 0xF59E0B, 0x10B981, 0x7C3AED, 0xEC4899]

  for (let s = 0; s < shelfCount; s++) {
    const sY = glassCenterY - cavityH / 2 + (s + 1) * shelfSpacing
    const sMesh = new THREE.Mesh(new THREE.BoxGeometry(cavityW - 0.02, 0.014, cavityD - 0.08), shelfMat)
    sMesh.position.set(doorCenterX, sY, cavityCenterZ)
    sMesh.receiveShadow = true
    root.add(sMesh)

    const railMesh = new THREE.Mesh(new THREE.BoxGeometry(cavityW - 0.02, 0.018, 0.01), darkMetalMat)
    railMesh.position.set(doorCenterX, sY + 0.005, cavityCenterZ + (cavityD - 0.08) / 2)
    root.add(railMesh)

    // Rows of card boxes & graded slabs on each shelf
    const itemsPerShelf = 6
    const spacing = (cavityW - 0.1) / itemsPerShelf
    for (let c = 0; c < itemsPerShelf; c++) {
      const ix = doorCenterX - (cavityW - 0.1) / 2 + (c + 0.5) * spacing
      const isSlab = (s + c) % 2 === 0
      const boxW = isSlab ? 0.068 : 0.078
      const boxH = isSlab ? 0.105 : 0.095
      const boxD = isSlab ? 0.016 : 0.048
      const itemMat = new THREE.MeshStandardMaterial({
        color: packColors[(s * itemsPerShelf + c) % packColors.length],
        metalness: 0.25,
        roughness: 0.35,
      })
      const itemMesh = new THREE.Mesh(new THREE.BoxGeometry(boxW, boxH, boxD), itemMat)
      itemMesh.position.set(ix, sY + boxH / 2 + 0.007, cavityCenterZ + 0.1)
      itemMesh.castShadow = true
      root.add(itemMesh)
    }
  }

  // 3. TRANSPARENT GLASS PANE & BLACK FRAME
  const frontZ = D / 2
  const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.008), glassMat)
  glassMesh.position.set(doorCenterX, glassCenterY, frontZ + 0.01)
  root.add(glassMesh)

  // Thin crisp black rubber gasket bezel around glass opening (matches mock black border)
  const gasketThickness = 0.016
  const topGasket = new THREE.Mesh(new THREE.BoxGeometry(glassW + 0.032, gasketThickness, 0.016), darkMetalMat)
  topGasket.position.set(doorCenterX, glassCenterY + glassH / 2 + gasketThickness / 2, frontZ + 0.008)
  root.add(topGasket)

  const bottomGasket = new THREE.Mesh(new THREE.BoxGeometry(glassW + 0.032, gasketThickness, 0.016), darkMetalMat)
  bottomGasket.position.set(doorCenterX, glassCenterY - glassH / 2 - gasketThickness / 2, frontZ + 0.008)
  root.add(bottomGasket)

  const leftGasket = new THREE.Mesh(new THREE.BoxGeometry(gasketThickness, glassH, 0.016), darkMetalMat)
  leftGasket.position.set(doorCenterX - glassW / 2 - gasketThickness / 2, glassCenterY, frontZ + 0.008)
  root.add(leftGasket)

  const rightGasket = new THREE.Mesh(new THREE.BoxGeometry(gasketThickness, glassH, 0.016), darkMetalMat)
  rightGasket.position.set(doorCenterX + glassW / 2 + gasketThickness / 2, glassCenterY, frontZ + 0.008)
  root.add(rightGasket)

  // 4. FRONT HARDWARE OVERLAYS (Proud of Sticker_Front plane)
  // A. Retrieval Pickup Dispenser Box (430mm x 220mm)
  const pickupW = 0.430
  const pickupH = 0.220
  const pickupY = feetH + 0.275
  const pickupFrame = new THREE.Mesh(
    new THREE.BoxGeometry(pickupW + 0.025, pickupH + 0.025, 0.02),
    darkMetalMat,
  )
  pickupFrame.position.set(doorCenterX, pickupY, frontZ + 0.008)
  root.add(pickupFrame)

  const pickupFlapTexture = createPickupFlapTexture()
  const pickupFlapMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(pickupW, pickupH),
    new THREE.MeshStandardMaterial({ map: pickupFlapTexture, roughness: 0.3, metalness: 0.1 }),
  )
  pickupFlapMesh.position.set(doorCenterX, pickupY, frontZ + 0.019)
  root.add(pickupFlapMesh)

  // B. 22" Vertical Touchscreen on Right Console Tower
  const screenW = 0.265
  const screenH = 0.430
  const screenY = feetH + 1.245
  const screenTexture = createCardshackScreenTexture('#D62324')
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTexture,
    roughness: 0.15,
    metalness: 0.1,
    emissive: 0x1E293B,
    emissiveIntensity: 0.22,
  })
  const screenBezel = new THREE.Mesh(
    new THREE.BoxGeometry(screenW + 0.024, screenH + 0.024, 0.016),
    darkMetalMat,
  )
  screenBezel.position.set(towerCenterX, screenY, frontZ + 0.008)
  root.add(screenBezel)

  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMat)
  screenMesh.position.set(towerCenterX, screenY, frontZ + 0.017)
  root.add(screenMesh)

  // C. Console Door Handle & Card/Coin Hardware Cluster (just below divider stripe)
  const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.11, 0.022), darkMetalMat)
  doorHandle.position.set(W / 2 - towerW + 0.028, feetH + 0.90, frontZ + 0.012)
  root.add(doorHandle)

  // Two compact circular buttons / card readers below handle
  const readerCircle1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.014, 16),
    shelfMat,
  )
  readerCircle1.rotation.x = Math.PI / 2
  readerCircle1.position.set(towerCenterX - 0.025, feetH + 0.80, frontZ + 0.009)
  root.add(readerCircle1)

  const readerCircle2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.014, 16),
    shelfMat,
  )
  readerCircle2.rotation.x = Math.PI / 2
  readerCircle2.position.set(towerCenterX + 0.035, feetH + 0.80, frontZ + 0.009)
  root.add(readerCircle2)

  // D. Bottom-Right Vent / Scanner Cutout (aligned vertically with pickup flap)
  const lowerCutout = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.135, 0.018), darkMetalMat)
  lowerCutout.position.set(towerCenterX, feetH + 0.275, frontZ + 0.009)
  root.add(lowerCutout)

  // 5. RECESSED GLIDE FEET (4 cm)
  const footRadius = 0.032
  const footOffsets = [
    [-W / 2 + 0.08, -D / 2 + 0.08],
    [W / 2 - 0.08, -D / 2 + 0.08],
    [-W / 2 + 0.08, D / 2 - 0.08],
    [W / 2 - 0.08, D / 2 - 0.08],
  ]
  footOffsets.forEach(([fx, fz]) => {
    const footMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(footRadius, footRadius, feetH, 16),
      darkMetalMat,
    )
    footMesh.position.set(fx, feetH / 2, fz)
    footMesh.castShadow = true
    root.add(footMesh)
  })

  // 6. FULL-COVERAGE STICKER WRAP MESHES (Front w/ glass hole, Left, Right, Back)
  const defaultFrontTex = createDefaultSideTexture('front', W / H)
  const defaultLeftTex = createDefaultSideTexture('left', D / H)
  const defaultRightTex = createDefaultSideTexture('right', D / H)
  const defaultBackTex = createDefaultSideTexture('back', W / H)

  const defaultTextures: Record<StickerSide, THREE.CanvasTexture> = {
    front: defaultFrontTex,
    left: defaultLeftTex,
    right: defaultRightTex,
    back: defaultBackTex,
  }

  // A. Full Front Wrap (ShapeGeometry with cutout hole for 780x1240mm glass window)
  const frontWrapGeom = createFrontWrapGeometry(
    W,
    H,
    glassLeft,
    glassBottomFromBody,
    glassW,
    glassH,
  )
  const frontWrapMat = new THREE.MeshStandardMaterial({
    map: defaultFrontTex,
    roughness: 0.3,
    metalness: 0.05,
  })
  const frontStickerMesh = new THREE.Mesh(frontWrapGeom, frontWrapMat)
  frontStickerMesh.name = 'Sticker_Front'
  frontStickerMesh.position.set(0, feetH, frontZ + 0.002)
  root.add(frontStickerMesh)

  // B. Full Left Wrap (790mm x 1855mm)
  const leftWrapMat = new THREE.MeshStandardMaterial({
    map: defaultLeftTex,
    roughness: 0.3,
    metalness: 0.05,
  })
  const leftStickerMesh = new THREE.Mesh(new THREE.PlaneGeometry(D, H), leftWrapMat)
  leftStickerMesh.name = 'Sticker_Left'
  leftStickerMesh.rotation.y = -Math.PI / 2
  leftStickerMesh.position.set(-W / 2 - 0.002, bodyCenterY, 0)
  root.add(leftStickerMesh)

  // C. Full Right Wrap (790mm x 1855mm)
  const rightWrapMat = new THREE.MeshStandardMaterial({
    map: defaultRightTex,
    roughness: 0.3,
    metalness: 0.05,
  })
  const rightStickerMesh = new THREE.Mesh(new THREE.PlaneGeometry(D, H), rightWrapMat)
  rightStickerMesh.name = 'Sticker_Right'
  rightStickerMesh.rotation.y = Math.PI / 2
  rightStickerMesh.position.set(W / 2 + 0.002, bodyCenterY, 0)
  root.add(rightStickerMesh)

  // D. Full Back Wrap (1255mm x 1855mm)
  const backWrapMat = new THREE.MeshStandardMaterial({
    map: defaultBackTex,
    roughness: 0.3,
    metalness: 0.05,
  })
  const backStickerMesh = new THREE.Mesh(new THREE.PlaneGeometry(W, H), backWrapMat)
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
    const newTex = createCardshackScreenTexture(accentColor)
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
    pickupFlapTexture.dispose()
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
