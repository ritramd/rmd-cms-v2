// Shared Modular 3D Geometry, Material & Canvas Texture Primitives for Smartven Vending Models
import * as THREE from 'three'
import type { StickerSide } from '@/types/editor3d'

export interface SkinTheme {
  topColor: string
  midColor: string
  bottomColor: string
  brandTitle: string
  accentHex: string
  darkBody?: boolean
  doorSplitRatio?: number // e.g. 98 / 138
  rearVent?: boolean
}

export type ScreenPreset = 'chiller' | 'frozen' | 'big55' | 'fuji' | 'slim10' | 'wallmount'

export type DispenserStyle =
  | 'push_flap'
  | 'yellow_frozen'
  | 'green_arrows_55'
  | 'green_tcn'
  | 'gold_xy'
  | 'taupe_slim'
  | 'fuji_pickup'
  | 'wall_chute'

export type InteriorProductKind = 'drinks' | 'frozen_boxes' | 'cosmetics' | 'snacks'

/**
 * Normalizes a 2D ShapeGeometry UVs onto [0..1] across full width W and height H (y: 0..H)
 */
export function normalizePlanarUVs(geom: THREE.BufferGeometry, W: number, H: number) {
  const posAttr = geom.attributes.position
  const uvAttr = geom.attributes.uv
  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i)
    const py = posAttr.getY(i)
    uvAttr.setXY(i, (px + W / 2) / W, py / H)
  }
  uvAttr.needsUpdate = true
}

/**
 * Creates a full-front ShapeGeometry (W x H) with an optional cutout polygon (holePoints in [x, y] meters).
 * Note: outer rectangle is CCW; holePoints should be wound CW (top-left -> top-right -> bottom-right -> bottom-left).
 */
export function createFrontWrapGeometry(
  W: number,
  H: number,
  holePoints?: Array<[number, number]>,
): THREE.BufferGeometry {
  if (!holePoints || holePoints.length < 3) {
    const plane = new THREE.PlaneGeometry(W, H)
    // Shift so bottom edge sits at y = 0 (matching ShapeGeometry convention)
    plane.translate(0, H / 2, 0)
    return plane
  }

  const outer = new THREE.Shape()
  outer.moveTo(-W / 2, 0)
  outer.lineTo(W / 2, 0)
  outer.lineTo(W / 2, H)
  outer.lineTo(-W / 2, H)
  outer.closePath()

  const hole = new THREE.Path()
  hole.moveTo(holePoints[0][0], holePoints[0][1])
  for (let i = 1; i < holePoints.length; i++) {
    hole.lineTo(holePoints[i][0], holePoints[i][1])
  }
  hole.closePath()
  outer.holes.push(hole)

  const geom = new THREE.ShapeGeometry(outer)
  normalizePlanarUVs(geom, W, H)
  return geom
}

/**
 * Helper to create a clockwise rectangular hole path centered at (cx, bottomY..bottomY+h)
 */
export function rectHolePoints(
  leftX: number,
  bottomY: number,
  w: number,
  h: number,
): Array<[number, number]> {
  return [
    [leftX, bottomY],
    [leftX, bottomY + h],
    [leftX + w, bottomY + h],
    [leftX + w, bottomY],
  ]
}

/**
 * Generates clean factory powder-coat / painted metal panel CanvasTexture for any face
 */
export function createDefaultSkinTexture(
  side: StickerSide,
  aspectRatio: number,
  theme: SkinTheme,
): THREE.CanvasTexture {
  const height = 1024
  const width = Math.max(256, Math.round(height * aspectRatio))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, theme.topColor)
    grad.addColorStop(0.55, theme.midColor)
    grad.addColorStop(1, theme.bottomColor)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Subtle metallic sheen & bottom kickplate shadow
    ctx.fillStyle = theme.darkBody ? 'rgba(0,0,0,0.22)' : 'rgba(15,23,42,0.04)'
    ctx.fillRect(0, Math.round(height * 0.96), width, Math.round(height * 0.04))

    ctx.strokeStyle = theme.darkBody ? 'rgba(255,255,255,0.12)' : 'rgba(100,116,139,0.28)'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, width - 4, height - 4)

    if (side === 'front' && theme.doorSplitRatio && theme.doorSplitRatio > 0 && theme.doorSplitRatio < 1) {
      const splitX = Math.round(width * theme.doorSplitRatio)
      ctx.fillStyle = theme.darkBody ? 'rgba(0,0,0,0.5)' : 'rgba(15,23,42,0.28)'
      ctx.fillRect(splitX - 1, 0, 2, height)

      // Top header badge on right tower if wide enough
      const towerWidth = width - splitX
      if (towerWidth > width * 0.14) {
        const towerCenterX = splitX + towerWidth / 2
        ctx.fillStyle = theme.darkBody ? '#F8FAFC' : '#334155'
        ctx.font = `bold ${Math.round(height * 0.018)}px sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(theme.brandTitle, towerCenterX, Math.round(height * 0.075))
        ctx.fillStyle = theme.accentHex
        ctx.fillRect(towerCenterX - Math.round(width * 0.03), Math.round(height * 0.084), Math.round(width * 0.06), 3)
        ctx.textAlign = 'start'
      }
    } else if (side === 'back' && theme.rearVent !== false) {
      const plateW = Math.round(width * 0.44)
      const plateH = Math.round(height * 0.16)
      const plateX = Math.round((width - plateW) / 2)
      const plateY = Math.round(height * 0.77)

      ctx.fillStyle = theme.darkBody ? 'rgba(0,0,0,0.25)' : 'rgba(15,23,42,0.06)'
      ctx.strokeStyle = theme.darkBody ? 'rgba(255,255,255,0.18)' : 'rgba(100,116,139,0.25)'
      ctx.lineWidth = 3
      ctx.fillRect(plateX, plateY, plateW, plateH)
      ctx.strokeRect(plateX, plateY, plateW, plateH)

      ctx.fillStyle = theme.darkBody ? 'rgba(255,255,255,0.2)' : 'rgba(71,85,105,0.28)'
      for (let r = 0; r < 5; r++) {
        ctx.fillRect(plateX + 20, plateY + 20 + r * 24, plateW - 40, 8)
      }
    } else if (side === 'left' || side === 'right') {
      ctx.fillStyle = theme.darkBody ? 'rgba(255,255,255,0.14)' : 'rgba(51,65,85,0.16)'
      ctx.font = 'bold 26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(theme.brandTitle, width / 2, Math.round(height * 0.12))
      ctx.textAlign = 'start'
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Generates crisp interactive kiosk UI screen texture matching each screen preset
 */
export function createInteractiveScreenTexture(
  preset: ScreenPreset,
  accentColor = '#5F93EC',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = preset === 'big55' ? 836 : 830
  const ctx = canvas.getContext('2d')

  if (ctx) {
    const paletteMap: Record<ScreenPreset, { bg1: string; bg2: string; title: string; subtitle: string; heroBg: string; cards: Array<{ n: string; p: string; c: string }> }> = {
      chiller: {
        bg1: '#0F172A',
        bg2: '#1E293B',
        title: 'SMARTVEN 22"',
        subtitle: 'Minuman Segar & Dingin',
        heroBg: accentColor,
        cards: [
          { n: 'Cold Cola', p: 'Rp 8.000', c: '#EF4444' },
          { n: 'Mineral Water', p: 'Rp 5.000', c: '#3B82F6' },
          { n: 'Orange Fizz', p: 'Rp 9.000', c: '#F97316' },
          { n: 'Green Tea', p: 'Rp 7.500', c: '#10B981' },
        ],
      },
      frozen: {
        bg1: '#0C192C',
        bg2: '#162A45',
        title: 'SMARTVEN FROZEN',
        subtitle: 'Suhu Terjaga -18°C • Elevator System',
        heroBg: '#0284C7',
        cards: [
          { n: 'Ice Cream Tub', p: 'Rp 35.000', c: '#38BDF8' },
          { n: 'Frozen Bento', p: 'Rp 42.000', c: '#F59E0B' },
          { n: 'Gelato Cup', p: 'Rp 28.000', c: '#EC4899' },
          { n: 'Frozen Dimsum', p: 'Rp 32.000', c: '#22C55E' },
        ],
      },
      big55: {
        bg1: '#090D16',
        bg2: '#131B2E',
        title: 'SMARTVEN 55" ULTRA',
        subtitle: 'Sentuh Layar Untuk Memilih Produk',
        heroBg: accentColor,
        cards: [
          { n: 'Blind Box Vol.1', p: 'Rp 149.000', c: '#F43F5E' },
          { n: 'Limited Figure', p: 'Rp 189.000', c: '#8B5CF6' },
          { n: 'Special Edition', p: 'Rp 220.000', c: '#0EA5E9' },
          { n: 'Gift Bundle', p: 'Rp 125.000', c: '#10B981' },
        ],
      },
      fuji: {
        bg1: '#23131A',
        bg2: '#331A24',
        title: 'FUJI BEAUTY & DRINK',
        subtitle: 'Tap Untuk Memulai',
        heroBg: '#EC4899',
        cards: [
          { n: 'Lip Tint', p: 'Rp 65.000', c: '#F472B6' },
          { n: 'Face Mist', p: 'Rp 85.000', c: '#FB7185' },
          { n: 'Collagen Drink', p: 'Rp 28.000', c: '#FBBF24' },
          { n: 'Sunscreen', p: 'Rp 95.000', c: '#38BDF8' },
        ],
      },
      slim10: {
        bg1: '#0F172A',
        bg2: '#1E293B',
        title: 'SV 10 EXPRESS',
        subtitle: 'Pilih Item -> Scan QRIS',
        heroBg: accentColor,
        cards: [
          { n: 'Snack A1', p: 'Rp 10.000', c: '#EF4444' },
          { n: 'Drink B2', p: 'Rp 8.000', c: '#3B82F6' },
          { n: 'Pouch C3', p: 'Rp 15.000', c: '#22C55E' },
          { n: 'Treat D4', p: 'Rp 12.000', c: '#EAB308' },
        ],
      },
      wallmount: {
        bg1: '#0B1324',
        bg2: '#172542',
        title: 'SMARTVEN MINI 21.5"',
        subtitle: 'Compact Wall Kiosk',
        heroBg: accentColor,
        cards: [
          { n: 'Travel Kit', p: 'Rp 25.000', c: '#38BDF8' },
          { n: 'Pod Refill', p: 'Rp 45.000', c: '#A855F7' },
          { n: 'Amenity Pack', p: 'Rp 18.000', c: '#10B981' },
          { n: 'Care Box', p: 'Rp 30.000', c: '#F97316' },
        ],
      },
    }

    const cfg = paletteMap[preset]
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, cfg.bg1)
    grad.addColorStop(1, cfg.bg2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, canvas.height)

    // Header bar
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(0, 0, 512, 54)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText(cfg.title, 24, 34)
    ctx.fillStyle = '#10B981'
    ctx.beginPath()
    ctx.arc(470, 27, 7, 0, Math.PI * 2)
    ctx.fill()

    // Hero block
    ctx.fillStyle = cfg.heroBg
    ctx.beginPath()
    ctx.roundRect(24, 74, 464, 175, 18)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 34px sans-serif'
    ctx.fillText(preset === 'frozen' ? 'Beku & Higienis' : 'Pilih Produk', 48, 132)
    ctx.font = '18px sans-serif'
    ctx.fillText(cfg.subtitle, 48, 168)

    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.beginPath()
    ctx.roundRect(48, 192, 180, 36, 18)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 15px sans-serif'
    ctx.fillText('MULAI TRANSAKSI', 66, 216)

    // Product 2x2 grid
    cfg.cards.forEach((item, idx) => {
      const col = idx % 2
      const row = Math.floor(idx / 2)
      const x = 24 + col * 240
      const y = 276 + row * 224

      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      ctx.beginPath()
      ctx.roundRect(x, y, 224, 206, 16)
      ctx.fill()

      ctx.fillStyle = item.c
      ctx.beginPath()
      ctx.roundRect(x + 76, y + 24, 72, 100, 12)
      ctx.fill()

      ctx.fillStyle = '#F8FAFC'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText(item.n, x + 20, y + 154)
      ctx.fillStyle = '#94A3B8'
      ctx.font = '16px sans-serif'
      ctx.fillText(item.p, x + 20, y + 180)
    })

    // Footer bar
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fillRect(0, canvas.height - 82, 512, 82)
    ctx.fillStyle = '#94A3B8'
    ctx.font = '16px sans-serif'
    ctx.fillText('Pembayaran: QRIS • E-Money • NFC', 24, canvas.height - 36)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Generates special arrow chute graphic for SV 55 (Green frame with 2 bold downward yellow arrows)
 */
export function createSV55ArrowsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 336
  const ctx = canvas.getContext('2d')

  if (ctx) {
    ctx.fillStyle = '#0F172A'
    ctx.fillRect(0, 0, 512, 336)

    // Green border
    ctx.strokeStyle = '#22C55E'
    ctx.lineWidth = 28
    ctx.strokeRect(14, 14, 484, 308)

    // Draw two thick downward yellow arrows matching SV 55.pdf
    const drawArrow = (cx: number, cy: number) => {
      ctx.fillStyle = '#FACC15'
      ctx.strokeStyle = '#18181B'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(cx - 32, cy - 54)
      ctx.lineTo(cx + 32, cy - 54)
      ctx.lineTo(cx + 32, cy + 4)
      ctx.lineTo(cx + 58, cy - 12)
      ctx.lineTo(cx, cy + 56)
      ctx.lineTo(cx - 58, cy - 12)
      ctx.lineTo(cx - 32, cy + 4)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    drawArrow(168, 168)
    drawArrow(344, 168)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Builds an illuminated display interior cavity with shelves, rails, coils & themed products
 */
export function buildDisplayInterior(
  parent: THREE.Group,
  opts: {
    centerX: number
    centerY: number
    centerZ: number
    width: number
    height: number
    depth: number
    shelfCount: number
    lanes: number
    productKind: InteriorProductKind
    ledColor?: number
  },
) {
  const darkCavityMat = new THREE.MeshStandardMaterial({
    color: opts.productKind === 'frozen_boxes' ? 0x0D1B2A : 0x0B1120,
    roughness: 0.85,
    metalness: 0.15,
  })
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x94A3B8,
    metalness: 0.78,
    roughness: 0.24,
  })
  const darkRailMat = new THREE.MeshStandardMaterial({
    color: 0x1E293B,
    metalness: 0.55,
    roughness: 0.35,
  })
  const coilMat = new THREE.MeshStandardMaterial({
    color: 0xCBD5E1,
    metalness: 0.85,
    roughness: 0.2,
  })

  // Back liner
  const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(opts.width, opts.height), darkCavityMat)
  backPlane.position.set(opts.centerX, opts.centerY, opts.centerZ - opts.depth / 2 + 0.02)
  parent.add(backPlane)

  // LED light strip + interior illumination
  const ledStrip = new THREE.Mesh(
    new THREE.BoxGeometry(opts.width - 0.04, 0.014, 0.022),
    new THREE.MeshBasicMaterial({ color: opts.ledColor ?? 0xF8FAFC }),
  )
  ledStrip.position.set(opts.centerX, opts.centerY + opts.height / 2 - 0.018, opts.centerZ + opts.depth / 2 - 0.04)
  parent.add(ledStrip)

  const pointLight = new THREE.PointLight(opts.ledColor ?? 0xFFFFFF, 1.45, 2.5)
  pointLight.position.set(opts.centerX, opts.centerY + opts.height / 2 - 0.05, opts.centerZ + 0.1)
  parent.add(pointLight)

  const palette =
    opts.productKind === 'cosmetics'
      ? [0xF472B6, 0xFB7185, 0xFBBF24, 0xC084FC, 0x38BDF8]
      : opts.productKind === 'frozen_boxes'
        ? [0x38BDF8, 0xF43F5E, 0xFBBF24, 0x22C55E, 0x818CF8, 0xEC4899]
        : [0xDC2626, 0x2563EB, 0xEA580C, 0x16A34A, 0x7C3AED, 0xEAB308, 0x0EA5E9]

  const spacingY = opts.height / (opts.shelfCount + 1)
  const shelfDepth = Math.max(0.2, opts.depth - 0.08)

  for (let s = 0; s < opts.shelfCount; s++) {
    const sy = opts.centerY - opts.height / 2 + (s + 1) * spacingY

    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(opts.width - 0.03, 0.013, shelfDepth),
      steelMat,
    )
    shelf.position.set(opts.centerX, sy, opts.centerZ)
    shelf.receiveShadow = true
    parent.add(shelf)

    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(opts.width - 0.03, 0.017, 0.01),
      darkRailMat,
    )
    rail.position.set(opts.centerX, sy + 0.004, opts.centerZ + shelfDepth / 2)
    parent.add(rail)

    const laneW = (opts.width - 0.07) / opts.lanes
    const itemZ = opts.centerZ + Math.min(0.09, shelfDepth * 0.25)

    for (let c = 0; c < opts.lanes; c++) {
      const cx = opts.centerX - (opts.width - 0.07) / 2 + (c + 0.5) * laneW
      const color = palette[(s * opts.lanes + c) % palette.length]
      const itemMat = new THREE.MeshStandardMaterial({
        color,
        metalness: opts.productKind === 'drinks' ? 0.5 : 0.22,
        roughness: 0.3,
      })

      if (opts.productKind === 'frozen_boxes' || opts.productKind === 'snacks' || opts.productKind === 'cosmetics') {
        const bw = Math.min(0.072, laneW * 0.72)
        const bh = opts.productKind === 'frozen_boxes' ? 0.085 : 0.098
        const bd = opts.productKind === 'cosmetics' ? 0.042 : 0.056
        const box = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), itemMat)
        box.position.set(cx, sy + bh / 2 + 0.007, itemZ)
        box.castShadow = true
        parent.add(box)
      } else {
        const isBottle = s % 2 === 1
        const dh = isBottle ? 0.115 : 0.092
        const dr = Math.min(0.023, laneW * 0.34)
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(dr, dr, dh, 14), itemMat)
        cyl.position.set(cx, sy + dh / 2 + 0.007, itemZ)
        cyl.castShadow = true
        parent.add(cyl)

        const cap = new THREE.Mesh(
          isBottle
            ? new THREE.CylinderGeometry(dr * 0.45, dr * 0.45, 0.015, 10)
            : new THREE.CylinderGeometry(dr * 0.9, dr, 0.007, 14),
          steelMat,
        )
        cap.position.set(cx, sy + dh + 0.008, itemZ)
        parent.add(cap)

        const coil = new THREE.Mesh(new THREE.TorusGeometry(dr * 1.05, 0.003, 6, 14), coilMat)
        coil.position.set(cx, sy + 0.034, itemZ + 0.04)
        parent.add(coil)
      }
    }
  }
}

/**
 * Builds a 4-sided rectangular closed window bezel + glass pane
 */
export function buildRectWindowAndBezel(
  parent: THREE.Group,
  opts: {
    cx: number
    cy: number
    z: number
    w: number
    h: number
    bezelColor?: number
    bezelThickness?: number
  },
) {
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
  const bezelMat = new THREE.MeshStandardMaterial({
    color: opts.bezelColor ?? 0x1E293B,
    metalness: 0.65,
    roughness: 0.3,
  })

  const glass = new THREE.Mesh(new THREE.BoxGeometry(opts.w, opts.h, 0.008), glassMat)
  glass.position.set(opts.cx, opts.cy, opts.z + 0.004)
  parent.add(glass)

  const bt = opts.bezelThickness ?? 0.022
  const bd = 0.024

  const top = new THREE.Mesh(new THREE.BoxGeometry(opts.w + bt * 2, bt, bd), bezelMat)
  top.position.set(opts.cx, opts.cy + opts.h / 2 + bt / 2, opts.z)
  parent.add(top)

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(opts.w + bt * 2, bt, bd), bezelMat)
  bottom.position.set(opts.cx, opts.cy - opts.h / 2 - bt / 2, opts.z)
  parent.add(bottom)

  const left = new THREE.Mesh(new THREE.BoxGeometry(bt, opts.h, bd), bezelMat)
  left.position.set(opts.cx - opts.w / 2 - bt / 2, opts.cy, opts.z)
  parent.add(left)

  const right = new THREE.Mesh(new THREE.BoxGeometry(bt, opts.h, bd), bezelMat)
  right.position.set(opts.cx + opts.w / 2 + bt / 2, opts.cy, opts.z)
  parent.add(right)
}

/**
 * Builds a dispenser hatch matching the exact hardware blueprint style
 */
export function buildDispenserHatch(
  parent: THREE.Group,
  opts: {
    cx: number
    cy: number
    z: number
    w: number
    h: number
    style: DispenserStyle
    protrusion?: number
  },
): THREE.Texture | null {
  let createdTex: THREE.Texture | null = null
  const pro = opts.protrusion ?? 0.014

  const colorMap: Record<DispenserStyle, { frame: number; flap: number }> = {
    push_flap: { frame: 0x1E293B, flap: 0x94A3B8 },
    yellow_frozen: { frame: 0xEAB308, flap: 0x334155 }, // Heated insulated frozen elevator door
    green_arrows_55: { frame: 0x22C55E, flap: 0x0F172A },
    green_tcn: { frame: 0x1E293B, flap: 0x4CAF50 },
    gold_xy: { frame: 0xB48B22, flap: 0xD4BF68 },
    taupe_slim: { frame: 0x7E6D5F, flap: 0xA8988A },
    fuji_pickup: { frame: 0xD4AF37, flap: 0x475569 },
    wall_chute: { frame: 0x334155, flap: 0x64748B },
  }

  const colors = colorMap[opts.style]
  const frameMat = new THREE.MeshStandardMaterial({
    color: colors.frame,
    metalness: 0.45,
    roughness: 0.35,
  })
  const flapMat = new THREE.MeshStandardMaterial({
    color: colors.flap,
    metalness: 0.35,
    roughness: 0.4,
  })

  // Outer surround collar
  const outer = new THREE.Mesh(
    new THREE.BoxGeometry(opts.w + 0.032, opts.h + 0.032, pro * 1.4),
    frameMat,
  )
  outer.position.set(opts.cx, opts.cy, opts.z + pro * 0.4)
  parent.add(outer)

  if (opts.style === 'green_arrows_55') {
    const tex = createSV55ArrowsTexture()
    createdTex = tex
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(opts.w, opts.h),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, metalness: 0.1 }),
    )
    face.position.set(opts.cx, opts.cy, opts.z + pro * 1.15)
    parent.add(face)
  } else {
    const flap = new THREE.Mesh(
      new THREE.BoxGeometry(opts.w - 0.02, opts.h - 0.02, 0.012),
      flapMat,
    )
    flap.position.set(opts.cx, opts.cy, opts.z + pro)
    parent.add(flap)

    // Handle bar at top of flap
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(opts.w * 0.8, 0.018, 0.016),
      new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.6, roughness: 0.3 }),
    )
    handle.position.set(opts.cx, opts.cy + opts.h / 2 - 0.025, opts.z + pro + 0.008)
    parent.add(handle)
  }

  return createdTex
}

/**
 * Builds floor caster wheels or tapered machine feet at the 4 corners
 */
export function buildBaseFeet(
  parent: THREE.Group,
  opts: {
    W: number
    D: number
    feetH: number
    style: 'casters' | 'tapered_legs' | 'none'
  },
) {
  if (opts.style === 'none' || opts.feetH <= 0) return

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x94A3B8,
    metalness: 0.78,
    roughness: 0.25,
  })
  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x0F172A,
    metalness: 0.2,
    roughness: 0.75,
  })

  const ox = opts.W / 2 - Math.min(0.08, opts.W * 0.14)
  const oz = opts.D / 2 - Math.min(0.08, opts.D * 0.12)
  const corners: Array<[number, number]> = [
    [-ox, -oz],
    [ox, -oz],
    [-ox, oz],
    [ox, oz],
  ]

  corners.forEach(([x, z]) => {
    if (opts.style === 'casters') {
      const wheelR = Math.min(0.032, opts.feetH * 0.42)
      const stemH = Math.max(0.015, opts.feetH - wheelR * 2)
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.025, stemH, 14),
        steelMat,
      )
      stem.position.set(x, opts.feetH - stemH / 2, z)
      parent.add(stem)

      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(wheelR, wheelR, 0.03, 18),
        rubberMat,
      )
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(x, wheelR, z)
      wheel.castShadow = true
      parent.add(wheel)
    } else {
      // Tapered chrome leveling leg
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.026, opts.feetH, 16),
        steelMat,
      )
      leg.position.set(x, opts.feetH / 2, z)
      leg.castShadow = true
      parent.add(leg)
    }
  })
}
