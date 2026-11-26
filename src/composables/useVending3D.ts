// Composable: useVending3D
// Orchestrates Three.js WebGL scene across all 11 Smartven & Custom 3D vending machine models,
// per-model camera framing presets, OrbitControls, 4-side live sticker texture mapping, and snapshot export.

import { ref, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  getVending3DModelMeta,
  type StickerItem,
  type StickerSide,
  type Vending3DModelType,
  type VendingModelInstance,
} from '@/types/editor3d'
import { buildSV22Model } from '@/utils/sv22ModelBuilder'
import { buildCardshackModel } from '@/utils/cardshackModelBuilder'
import { buildSVSeriesModel } from '@/utils/svSeriesModelBuilder'

export function useVending3D() {
  const containerRef = shallowRef<HTMLElement | null>(null)
  const isLoaded = ref(false)
  const isAutoRotating = ref(false)
  const isPanning = ref(false)
  const currentModelType = ref<Vending3DModelType>('SV22')

  // Reactive sticker state (all 4 faces)
  const stickers = ref<Record<StickerSide, StickerItem | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
  })

  // Three.js non-reactive internals (kept outside Vue reactivity for 60fps performance)
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let controls: OrbitControls | null = null
  let modelInstance: VendingModelInstance | null = null
  let animationFrameId: number | null = null
  let resizeObserver: ResizeObserver | null = null

  const activeCamPos = new THREE.Vector3(2.45, 1.45, 2.95)
  const activeTarget = new THREE.Vector3(0, 1.02, 0)

  // Active custom uploaded textures map to dispose cleanly without touching model defaults
  const activeTextures = new Map<StickerSide, THREE.Texture>()

  function buildModelByType(type: Vending3DModelType): VendingModelInstance {
    if (type === 'CARDSHACK') return buildCardshackModel()
    if (type === 'SV22') return buildSV22Model()
    return buildSVSeriesModel(type) ?? buildSV22Model()
  }

  function applyCameraPreset(type: Vending3DModelType) {
    const meta = getVending3DModelMeta(type)
    activeCamPos.set(...meta.cameraPos)
    activeTarget.set(...meta.cameraTarget)
    if (camera && controls) {
      camera.position.copy(activeCamPos)
      controls.target.copy(activeTarget)
      controls.update()
    }
  }

  /**
   * Initializes WebGL scene inside the provided DOM element
   */
  function init(container: HTMLElement, initialType: Vending3DModelType = 'SV22') {
    if (renderer) return
    containerRef.value = container
    currentModelType.value = initialType

    const meta = getVending3DModelMeta(initialType)
    activeCamPos.set(...meta.cameraPos)
    activeTarget.set(...meta.cameraTarget)

    const width = container.clientWidth || 800
    const height = container.clientHeight || 600

    // 1. Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xF0F7FF)

    // 2. Camera
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50)
    camera.position.copy(activeCamPos)

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.replaceChildren(renderer.domElement)

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 1.15)
    keyLight.position.set(3.5, 4.5, 3.5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 15
    keyLight.shadow.bias = -0.001
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xE0EEFF, 0.75)
    fillLight.position.set(-3.5, 2.5, -3.0)
    scene.add(fillLight)

    const topLight = new THREE.DirectionalLight(0xFFFFFF, 0.4)
    topLight.position.set(0, 5, 1)
    scene.add(topLight)

    // 5. Contact Shadow & Ground Plane
    const groundGeom = new THREE.PlaneGeometry(12, 12)
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.14 })
    const groundMesh = new THREE.Mesh(groundGeom, groundMat)
    groundMesh.rotation.x = -Math.PI / 2
    groundMesh.position.y = 0
    groundMesh.receiveShadow = true
    scene.add(groundMesh)

    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 256
    const sCtx = shadowCanvas.getContext('2d')
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 20, 128, 128, 128)
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.35)')
      grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.15)')
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)')
      sCtx.fillStyle = grad
      sCtx.fillRect(0, 0, 256, 256)
    }
    const contactShadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const contactShadowGeom = new THREE.PlaneGeometry(2.4, 1.8)
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTexture,
      transparent: true,
      depthWrite: false,
    })
    const contactShadowMesh = new THREE.Mesh(contactShadowGeom, contactShadowMat)
    contactShadowMesh.rotation.x = -Math.PI / 2
    contactShadowMesh.position.set(0, 0.001, 0)
    scene.add(contactShadowMesh)

    // 6. Active 3D Model Instance
    modelInstance = buildModelByType(initialType)
    scene.add(modelInstance.root)

    // 7. OrbitControls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.target.copy(activeTarget)
    controls.minDistance = 0.9
    controls.maxDistance = 6.0
    controls.maxPolarAngle = Math.PI / 2 + 0.02
    controls.autoRotate = false
    controls.autoRotateSpeed = 2.0

    // 8. Render loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      if (controls) controls.update()
      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    }
    animate()

    // 9. Resize Observer
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        if (w > 0 && h > 0 && camera && renderer) {
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
      }
    })
    resizeObserver.observe(container)

    isLoaded.value = true
  }

  /**
   * Switches the active 3D model geometry while preserving all custom uploaded stickers
   */
  function setModelType(type: Vending3DModelType, accentColor?: string) {
    if (currentModelType.value === type && modelInstance) return
    currentModelType.value = type

    if (!scene) return

    if (modelInstance) {
      scene.remove(modelInstance.root)
      modelInstance.dispose()
      modelInstance = null
    }

    modelInstance = buildModelByType(type)
    scene.add(modelInstance.root)
    applyCameraPreset(type)

    if (accentColor) {
      modelInstance.updateScreenTexture(accentColor)
    }

    const sides: StickerSide[] = ['front', 'back', 'left', 'right']
    sides.forEach((side) => {
      const customTex = activeTextures.get(side)
      const targetMesh = modelInstance?.stickerMeshes[side]
      if (customTex && targetMesh) {
        targetMesh.material.map = customTex
        targetMesh.material.color.setHex(0xFFFFFF)
        targetMesh.material.needsUpdate = true
      }
    })
  }

  /**
   * Applies an uploaded sticker image to the specified side of the active vending model
   */
  async function applySticker(
    side: StickerSide,
    fileOrUrl: File | string,
    fileName?: string,
  ): Promise<void> {
    if (!modelInstance) return

    let url: string
    let name: string
    let sizeFormatted = 'PNG • Custom'

    if (fileOrUrl instanceof File) {
      url = URL.createObjectURL(fileOrUrl)
      name = fileOrUrl.name
      const kb = Math.round(fileOrUrl.size / 1024)
      sizeFormatted = `${fileOrUrl.type.split('/')[1]?.toUpperCase() || 'IMG'} • ${kb} KB`
    } else {
      url = fileOrUrl
      name = fileName || `${side}_sticker.png`
    }

    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader()
      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          texture.flipY = true
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping

          const oldTex = activeTextures.get(side)
          if (oldTex) oldTex.dispose()
          activeTextures.set(side, texture)

          const prevItem = stickers.value[side]
          if (prevItem?.url.startsWith('blob:') && prevItem.url !== url) {
            URL.revokeObjectURL(prevItem.url)
          }

          const targetMesh = modelInstance?.stickerMeshes[side]
          if (targetMesh) {
            targetMesh.material.map = texture
            targetMesh.material.color.setHex(0xFFFFFF)
            targetMesh.material.needsUpdate = true
          }

          stickers.value[side] = {
            side,
            url,
            name,
            sizeFormatted,
            file: fileOrUrl instanceof File ? fileOrUrl : undefined,
          }

          resolve()
        },
        undefined,
        (err) => {
          console.error(`[useVending3D] Failed to load sticker for side ${side}:`, err)
          reject(err)
        },
      )
    })
  }

  /**
   * Removes an applied sticker and reverts the side back to the model's factory default finish
   */
  function removeSticker(side: StickerSide) {
    if (!modelInstance) return

    const oldTex = activeTextures.get(side)
    if (oldTex) {
      oldTex.dispose()
      activeTextures.delete(side)
    }

    const currentItem = stickers.value[side]
    if (currentItem?.url.startsWith('blob:')) {
      URL.revokeObjectURL(currentItem.url)
    }

    modelInstance.resetStickerMaterial(side)
    stickers.value[side] = null
  }

  function setScreenAccent(color: string) {
    modelInstance?.updateScreenTexture(color)
  }

  function resetCamera() {
    applyCameraPreset(currentModelType.value)
  }

  function resetAll() {
    resetCamera()
    removeSticker('front')
    removeSticker('back')
    removeSticker('left')
    removeSticker('right')
  }

  function toggleAutoRotate(force?: boolean) {
    if (!controls) return
    isAutoRotating.value = force !== undefined ? force : !isAutoRotating.value
    controls.autoRotate = isAutoRotating.value
  }

  function rotateByStep(angle: number) {
    if (!camera || !controls) return
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target)
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
    camera.position.copy(controls.target).add(offset)
    controls.update()
  }

  function zoom(delta: number) {
    if (!camera || !controls) return
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target)
    const len = dir.length()
    const newLen = THREE.MathUtils.clamp(len + delta, controls.minDistance, controls.maxDistance)
    dir.normalize().multiplyScalar(newLen)
    camera.position.copy(controls.target).add(dir)
    controls.update()
  }

  function captureSnapshot(filename = 'Vending_3D_Preview.png') {
    if (!renderer || !scene || !camera) return
    renderer.render(scene, camera)
    const dataUrl = renderer.domElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function dispose() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }

    activeTextures.forEach((tex) => tex.dispose())
    activeTextures.clear()

    modelInstance?.dispose()
    modelInstance = null

    controls?.dispose()
    controls = null

    if (renderer) {
      renderer.dispose()
      renderer.domElement.remove()
      renderer = null
    }

    scene = null
    camera = null
    isLoaded.value = false
  }

  return {
    containerRef,
    isLoaded,
    isAutoRotating,
    isPanning,
    currentModelType,
    stickers,
    init,
    setModelType,
    applySticker,
    removeSticker,
    setScreenAccent,
    resetCamera,
    resetAll,
    toggleAutoRotate,
    rotateByStep,
    zoom,
    captureSnapshot,
    dispose,
  }
}
