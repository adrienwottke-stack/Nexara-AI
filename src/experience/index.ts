import * as THREE from 'three'
import { FluidField } from './fluid'
import { ProjectWindow } from './project-window'
import { RangerHelmet } from './ranger-helmet'
import { RangerPhotoSurface } from './ranger-photo-surface'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { backgroundFragment, flatVertex, portraitFragment, portraitVertex, rangerCompositeFragment } from './shaders'
import type { ExperienceController, ExperienceOptions, ExperienceState, ViewportRect } from './types'

export type { ExperienceController, ExperienceOptions, ExperienceState, ViewportRect } from './types'

const clamp = (value: number, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value))
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress
const smooth = (from: number, to: number, value: number) => { const p = clamp((value - from) / (to - from)); return p * p * (3 - 2 * p) }
const finiteRect = (rect: ViewportRect | undefined): rect is ViewportRect => !!rect && [rect.left, rect.top, rect.width, rect.height].every(Number.isFinite) && rect.width > 1 && rect.height > 1
const bezier = (a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2, d: THREE.Vector2, t: number) => {
  const inverse = 1 - t
  return new THREE.Vector2(
    inverse ** 3 * a.x + 3 * inverse ** 2 * t * b.x + 3 * inverse * t * t * c.x + t ** 3 * d.x,
    inverse ** 3 * a.y + 3 * inverse ** 2 * t * b.y + 3 * inverse * t * t * c.y + t ** 3 * d.y,
  )
}

/**
 * Original spatial scene: authored portrait relief, GPU fluid reveal and physical project frame.
 * Coordinates passed to update are viewport/host rectangles. No scrolling is installed here.
 */
export async function createExperience(host: HTMLElement, options: ExperienceOptions): Promise<ExperienceController> {
  let renderer: THREE.WebGLRenderer | undefined
  let fluid: FluidField | undefined
  let windowObject: ProjectWindow | undefined
  let rangerHelmet: RangerHelmet | RangerPhotoSurface | undefined
  let environmentTarget: THREE.WebGLRenderTarget | undefined
  let heroTarget: THREE.WebGLRenderTarget | undefined
  let helmetTarget: THREE.WebGLRenderTarget | undefined
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const textures: THREE.Texture[] = []
  let frame = 0
  let disposed = false
  let released = false
  let failed = false
  let errorNotified = false
  let ready = false
  let shaderFailure: Error | undefined
  let width = innerWidth
  let height = innerHeight
  let pixelRatio = Math.min(devicePixelRatio || 1, width < 650 ? 1.5 : 1.25)
  let previousTime = 0
  let elapsed = 0
  let lastInput = performance.now()
  let lastPointerTime = lastInput
  let hasPointerInput = false
  let rangerAmount = 0
  let slowSamples = 0
  let measuredFrames = 0
  let measuredTime = 0
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
  let state: ExperienceState = { heroProgress: 0, flightProgress: 0, visible: true }
  const pointer = new THREE.Vector2(0.5, 0.5)
  const relaxedPointer = new THREE.Vector2(0.5, 0.5)
  const force = new THREE.Vector2()
  const previousPointer = new THREE.Vector2(0.5, 0.5)
  let removeListeners = () => {}
  const reportError = (error: unknown) => {
    if (errorNotified) return
    errorNotified = true
    options.onError?.(error)
  }

  const release = () => {
    if (released) return
    released = true
    cancelAnimationFrame(frame)
    removeListeners()
    fluid?.dispose()
    windowObject?.dispose()
    rangerHelmet?.dispose()
    heroTarget?.dispose()
    helmetTarget?.dispose()
    environmentTarget?.dispose()
    for (const geometry of geometries) geometry.dispose()
    for (const material of materials) material.dispose()
    for (const texture of textures) texture.dispose()
    if (renderer) {
      renderer.domElement.remove()
      renderer.dispose()
      if (!renderer.getContext().isContextLost()) renderer.forceContextLoss()
    }
  }
  const fail = (error: unknown) => {
    if (disposed || failed) return
    failed = true
    cancelAnimationFrame(frame)
    if (renderer) renderer.domElement.hidden = true
    release()
    reportError(error)
  }

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance', premultipliedAlpha: true })
    const render = renderer
    render.setPixelRatio(pixelRatio)
    render.setSize(width, height, false)
    render.outputColorSpace = THREE.SRGBColorSpace
    render.toneMapping = THREE.ACESFilmicToneMapping
    render.toneMappingExposure = 1.45
    render.autoClear = true
    render.debug.checkShaderErrors = true
    render.debug.onShaderError = (_gl, _program, _vertex, fragment) => {
      shaderFailure = new Error(`The spatial scene shader could not compile: ${render.getContext().getShaderInfoLog(fragment) ?? 'unknown shader error'}`)
    }
    const canvas = render.domElement
    canvas.className = 'spatial-experience-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;'
    host.append(canvas)
    const onContextLost = (event: Event) => { event.preventDefault(); fail(new Error('The spatial graphics context was lost.')) }
    canvas.addEventListener('webglcontextlost', onContextLost)
    removeListeners = () => canvas.removeEventListener('webglcontextlost', onContextLost)

    const loader = new THREE.TextureLoader()
    const results = await Promise.allSettled([
      loader.loadAsync(options.portraitUrl), loader.loadAsync(options.projectUrl),
      ...(options.rangerEnabled && options.rangerPortraitUrl ? [loader.loadAsync(options.rangerPortraitUrl)] : []),
    ])
    for (const result of results) if (result.status === 'fulfilled') {
      if (released) result.value.dispose()
      else textures.push(result.value)
    }
    if (released || render.getContext().isContextLost()) throw new Error('The spatial graphics context became unavailable while loading images.')
    const rejected = results.slice(0, 2).find(result => result.status === 'rejected')
    if (rejected?.status === 'rejected') throw rejected.reason
    // A resize can occur while the asynchronous image work is still pending.
    width = Math.max(1, innerWidth)
    height = Math.max(1, innerHeight)
    pixelRatio = Math.min(pixelRatio, devicePixelRatio || 1, width < 650 ? 1.5 : 1.25)
    render.setPixelRatio(pixelRatio)
    render.setSize(width, height, false)
    const portraitTexture = (results[0] as PromiseFulfilledResult<THREE.Texture>).value
    const projectTexture = (results[1] as PromiseFulfilledResult<THREE.Texture>).value
    const rangerTexture = results[2]?.status === 'fulfilled' ? results[2].value : undefined
    lastInput = lastPointerTime = performance.now()
    for (const texture of textures) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = Math.min(4, render.capabilities.getMaxAnisotropy())
    }

    fluid = new FluidField(render, width, height)
    const fluidField = fluid
    const targetRatio = () => Math.min(pixelRatio, 1800 / width, 1500 / height)
    const fboWidth = () => Math.max(1, Math.round(width * targetRatio()))
    const fboHeight = () => Math.max(1, Math.round(height * targetRatio()))
    heroTarget = new THREE.WebGLRenderTarget(fboWidth(), fboHeight(), {
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      depthBuffer: true, stencilBuffer: false,
    })
    const portraitTarget = heroTarget
    const geometry = <T extends THREE.BufferGeometry>(value: T): T => { geometries.push(value); return value }
    const material = <T extends THREE.Material>(value: T): T => { materials.push(value); return value }

    const heroScene = new THREE.Scene()
    const heroCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 3000)
    heroCamera.position.z = 800
    const sharedUniforms = () => ({
      uFluid: { value: fluidField.texture },
      uViewport: { value: new THREE.Vector2(width, height) },
      uFboSize: { value: new THREE.Vector2(portraitTarget.width, portraitTarget.height) },
      uRect: { value: new THREE.Vector4(0, 0, width, height) },
      uPhase: { value: 0 }, uReveal: { value: 1 },
    })
    const backgroundMaterial = material(new THREE.ShaderMaterial({
      vertexShader: flatVertex, fragmentShader: backgroundFragment,
      depthTest: false, depthWrite: false, toneMapped: false,
      uniforms: { ...sharedUniforms(), uTime: { value: 0 }, uPointer: { value: relaxedPointer } },
    }))
    const background = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1, 1)), backgroundMaterial)
    background.position.z = -150
    background.renderOrder = -1
    heroScene.add(background)

    const portraitMaterial = material(new THREE.ShaderMaterial({
      vertexShader: portraitVertex, fragmentShader: portraitFragment,
      transparent: true, depthWrite: false, toneMapped: false,
      uniforms: { ...sharedUniforms(), uPortrait: { value: portraitTexture }, uDepth: { value: 50 } },
    }))
    const portrait = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1, 1, 112, 112)), portraitMaterial)
    const portraitPivot = new THREE.Group()
    portraitPivot.add(portrait)
    heroScene.add(portraitPivot)

    const helmetScene = new THREE.Scene()
    const helmetPivot = new THREE.Group()
    if (options.rangerEnabled) {
      const hdr = render.extensions.has('EXT_color_buffer_float')
      const gl = render.getContext() as WebGL2RenderingContext
      const availableSamples = hdr ? [...gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA16F, gl.SAMPLES) as Int32Array] : []
      helmetTarget = new THREE.WebGLRenderTarget(fboWidth(), fboHeight(), {
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
        depthBuffer: true, stencilBuffer: false,
        type: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType,
        colorSpace: THREE.LinearSRGBColorSpace,
        samples: hdr ? Math.max(0, ...availableSamples.filter(samples => samples <= 2)) : Math.min(2, render.capabilities.maxSamples),
      })
      rangerHelmet = rangerTexture ? new RangerPhotoSurface(rangerTexture) : new RangerHelmet()
      helmetPivot.add(rangerHelmet.group)
      helmetScene.add(helmetPivot)
      if (!rangerTexture) {
        const pmrem = new THREE.PMREMGenerator(render)
        try {
          const studio = await new RGBELoader().loadAsync('/media/ranger/studio-small-09-1k.hdr')
          if (released) { studio.dispose(); throw new Error('Scene disposed while loading its studio environment.') }
          textures.push(studio)
          environmentTarget = pmrem.fromEquirectangular(studio)
        } catch (error) {
          if (released) throw error
          const room = new RoomEnvironment()
          environmentTarget = pmrem.fromScene(room, .04)
          room.dispose()
        } finally { pmrem.dispose() }
        helmetScene.environment = environmentTarget.texture
        helmetScene.environmentIntensity = .8
      }
      helmetScene.add(new THREE.HemisphereLight(0xf0eee8, 0x303632, .35))
      const helmetKey = new THREE.DirectionalLight(0xfff9ed, 1.8)
      helmetKey.position.set(-480, 700, 900)
      helmetScene.add(helmetKey)
      const helmetFill = new THREE.DirectionalLight(0xf2f5f4, .45)
      helmetFill.position.set(650, 120, 350)
      helmetScene.add(helmetFill)
      const helmetRim = new THREE.DirectionalLight(0xe3f2cb, .8)
      helmetRim.position.set(200, 550, -550)
      helmetScene.add(helmetRim)
    }

    const displayScene = new THREE.Scene()
    const displayCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 3000)
    displayCamera.position.z = 1000
    const surfaceMaterial = material(new THREE.ShaderMaterial({
      vertexShader: flatVertex, fragmentShader: rangerCompositeFragment,
      transparent: true, toneMapped: true, depthTest: false, depthWrite: false,
      uniforms: {
        uPortraitFrame: { value: portraitTarget.texture },
        uHelmetFrame: { value: helmetTarget?.texture ?? portraitTarget.texture },
        uFluid: { value: fluidField.texture },
        uViewport: { value: new THREE.Vector2(width, height) },
        uRect: { value: new THREE.Vector4(0, 0, width, height) },
        uRangerEnabled: { value: options.rangerEnabled ? 1 : 0 },
        uHelmetToneMapping: { value: rangerTexture ? 0 : 1 },
        uRangerAmount: { value: 0 }, uReveal: { value: 1 }, uTime: { value: 0 }, uPointer: { value: relaxedPointer },
      },
    }))
    const surface = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1, 1)), surfaceMaterial)
    displayScene.add(surface)

    const objectScene = new THREE.Scene()
    const objectCamera = new THREE.PerspectiveCamera(35, width / height, 1, 6000)
    const setObjectCamera = () => {
      objectCamera.aspect = width / height
      objectCamera.position.z = height / (2 * Math.tan(THREE.MathUtils.degToRad(35) / 2))
      objectCamera.updateProjectionMatrix()
    }
    setObjectCamera()
    objectScene.add(new THREE.HemisphereLight(0xf4f7e9, 0x1a291d, 2.7))
    const key = new THREE.DirectionalLight(0xfff5e0, 4)
    key.position.set(-600, 800, 1000)
    objectScene.add(key)
    const rim = new THREE.DirectionalLight(0xd9ffa2, 2.3)
    rim.position.set(800, -50, -100)
    objectScene.add(rim)
    windowObject = new ProjectWindow(projectTexture)
    const projectWindow = windowObject
    objectScene.add(projectWindow.group)
    render.compile(heroScene, heroCamera)
    render.compile(displayScene, displayCamera)
    render.compile(objectScene, objectCamera)
    if (options.rangerEnabled) render.compile(helmetScene, heroCamera)

    const defaultTarget = (): ViewportRect => ({ left: width * 0.25, top: height * 0.23, width: width * 0.5, height: height * 0.54 })
    const heroRect = (): ViewportRect => {
      const transition = reducedMotion.matches ? 0 : smooth(0.10, 0.95, state.heroProgress)
      const target = finiteRect(state.heroTarget) ? state.heroTarget : defaultTarget()
      return {
        left: mix(0, target.left, transition), top: mix(0, target.top, transition),
        width: mix(width, target.width, transition), height: mix(height, target.height, transition),
      }
    }

    const portraitLayout = (rect: ViewportRect, phase: number) => {
      const initialHeight = width < 650
        ? Math.min(rect.height * 1.70, Math.max(1, rect.width - 24) / RangerPhotoSurface.alphaWidthPerPortraitHeight)
        : rect.height * 2.12
      const imageHeight = mix(initialHeight, rect.height * 1.44, phase)
      const imageWidth = imageHeight * .8
      const top = mix(width < 650 ? .012 : -.035, -.015, phase) * rect.height
      const imageCenterY = rect.height / 2 - top - imageHeight / 2
      const offsetX = width < 650 ? imageWidth * (.5 - 710 / 1440) : 0
      return { imageHeight, imageWidth, top, imageCenterY, offsetX }
    }

    const updatePortrait = (rect: ViewportRect, delta: number) => {
      const phase = reducedMotion.matches ? 0 : smooth(0.10, 0.95, state.heroProgress)
      heroCamera.left = -rect.width / 2; heroCamera.right = rect.width / 2
      heroCamera.top = rect.height / 2; heroCamera.bottom = -rect.height / 2
      heroCamera.updateProjectionMatrix()
      background.scale.set(rect.width, rect.height, 1)
      const { imageHeight, imageWidth, imageCenterY, offsetX } = portraitLayout(rect, phase)
      const faceY = imageCenterY + imageHeight * 0.255
      portraitPivot.position.set(offsetX, faceY, 0)
      portrait.position.set(0, -imageHeight * 0.255, 0)
      portrait.scale.set(imageWidth, imageHeight, 1)
      const relax = 1 - Math.exp(-delta * 8)
      const rotationY = reducedMotion.matches ? 0 : (relaxedPointer.x - 0.5) * 0.16 * (1 - phase * 0.8)
      const rotationX = reducedMotion.matches ? 0 : (relaxedPointer.y - 0.5) * 0.06 * (1 - phase * 0.8)
      portraitPivot.rotation.y = mix(portraitPivot.rotation.y, rotationY, relax)
      portraitPivot.rotation.x = mix(portraitPivot.rotation.x, rotationX, relax)
      const portraitDepth = Math.min(75, rect.height * .075) * (1 - phase * .4)
      if (rangerHelmet) {
        helmetPivot.position.copy(portraitPivot.position)
        helmetPivot.rotation.copy(portraitPivot.rotation)
        if (rangerHelmet instanceof RangerPhotoSurface) {
          rangerHelmet.group.position.set(imageWidth * RangerPhotoSurface.fitOffsetX, imageHeight * RangerPhotoSurface.fitOffsetY, 0)
          rangerHelmet.group.scale.set(imageHeight * RangerPhotoSurface.fitScale, imageHeight * RangerPhotoSurface.fitScale, 1)
          rangerHelmet.setPortraitDepth(portraitDepth)
        } else {
          rangerHelmet.group.position.set(-imageWidth * .007, imageHeight * .034, 9)
          rangerHelmet.group.scale.set(imageWidth * .155, imageHeight * .160, imageHeight * .108)
        }
      }
      portraitMaterial.uniforms.uDepth.value = portraitDepth
      for (const shader of [portraitMaterial, backgroundMaterial]) {
        shader.uniforms.uFluid.value = fluidField.texture
        shader.uniforms.uViewport.value.set(width, height)
        shader.uniforms.uFboSize.value.set(portraitTarget.width, portraitTarget.height)
        shader.uniforms.uRect.value.set(rect.left, height - rect.top - rect.height, rect.width, rect.height)
        shader.uniforms.uPhase.value = phase
        shader.uniforms.uReveal.value = reducedMotion.matches ? 0 : (1 - phase * 0.85)
      }
      backgroundMaterial.uniforms.uTime.value = reducedMotion.matches ? 0 : elapsed
      rangerAmount = mix(rangerAmount, clamp(state.rangerAmount ?? 0), 1 - Math.exp(-delta * 10))
      surfaceMaterial.uniforms.uFluid.value = fluidField.texture
      surfaceMaterial.uniforms.uViewport.value.set(width, height)
      surfaceMaterial.uniforms.uRect.value.set(rect.left, height - rect.top - rect.height, rect.width, rect.height)
      surfaceMaterial.uniforms.uRangerAmount.value = rangerAmount
      surfaceMaterial.uniforms.uTime.value = reducedMotion.matches ? 0 : elapsed
      surfaceMaterial.uniforms.uReveal.value = reducedMotion.matches ? 0 : 1 - phase * 0.85
      surface.position.set(rect.left + rect.width / 2 - width / 2, height / 2 - rect.top - rect.height / 2, 0)
      surface.scale.set(rect.width, rect.height, 1)
    }

    const updateWindow = () => {
      if (!finiteRect(state.projectTarget) || state.heroProgress < 0.96) {
        projectWindow.group.visible = false
        return
      }
      const p = reducedMotion.matches ? 1 : clamp(state.flightProgress)
      const target = state.projectTarget
      const start = new THREE.Vector2(width * 0.01, height * 0.56)
      const middle = new THREE.Vector2(width * 0.64, height * 0.43)
      const final = new THREE.Vector2(target.left + target.width / 2, target.top + target.height / 2)
      const approach = new THREE.Vector2(width * 0.85, height * 0.20)
      // Match derivatives in progress space across the differently sized segments.
      const departure = middle.clone().add(middle.clone().sub(approach).multiplyScalar(0.48 / 0.52))
      const point = p <= 0.52
        ? bezier(start, new THREE.Vector2(width * 0.11, height * 0.17), approach, middle, p / 0.52)
        : bezier(middle, departure, new THREE.Vector2(final.x - width * 0.12, final.y - height * 0.21), final, (p - 0.52) / 0.48)
      const landingScale = Math.min(target.width / 1.44, target.height / 0.90)
      const startScale = width * (width < 650 ? 1.08 : 0.88) / 1.60
      const middleScale = width * (width < 650 ? 0.66 : 0.49) / 1.60
      const scale = p <= 0.52 ? mix(startScale, middleScale, smooth(0, 1, p / 0.52)) : mix(middleScale, landingScale, smooth(0, 1, (p - 0.52) / 0.48))
      const z = Math.sin(p * Math.PI) * 110
      const cameraScale = (objectCamera.position.z - z) / objectCamera.position.z
      projectWindow.group.scale.setScalar(scale * cameraScale)
      const screenOffset = 0.025 * scale * smooth(0.72, 1, p)
      projectWindow.group.position.set(point.x - width / 2, height / 2 - point.y + screenOffset, z)
      projectWindow.group.rotation.set(
        Math.sin(p * Math.PI * 2) * 0.32 - (1 - p) * 0.16,
        mix(-0.75, Math.PI * 4, p),
        -(1 - p) * 0.13 + Math.sin(p * Math.PI * 2) * 0.08,
      )
      const opacity = reducedMotion.matches ? 0 : 1 - smooth(0.965, 1, p)
      projectWindow.setOpacity(opacity)
      projectWindow.group.visible = opacity > 0.002
    }

    const paint = (delta: number, now: number) => {
      if (disposed || failed || !state.visible || document.hidden) return
      const inputAge = now - lastInput
      const useIdle = inputAge > 2200 && !reducedMotion.matches
      const rect = heroRect()
      let strength = 0
      if (useIdle) {
        const phase = smooth(0.10, 0.95, state.heroProgress)
        const { imageHeight, imageWidth, top, offsetX } = portraitLayout(rect, phase)
        const headX = (rect.left + rect.width / 2 + offsetX - imageWidth * .007) / width
        const headY = 1 - (rect.top + top + imageHeight * (1 - 0.789)) / height
        pointer.set(clamp(headX + Math.sin(elapsed * 0.71) * 0.10), clamp(headY + Math.cos(elapsed * 0.53) * 0.105))
        force.set(Math.cos(elapsed * 0.71) * 0.09, -Math.sin(elapsed * 0.53) * 0.075)
        strength = 0.23 + Math.sin(elapsed * 0.7) ** 2 * 0.08
      } else {
        strength = hasPointerInput ? Math.exp(-inputAge / 160) * 1.2 : 0
        force.multiplyScalar(Math.exp(-delta * 3.5))
      }
      if (reducedMotion.matches) { strength = 0; pointer.set(0.5, 0.5) }
      relaxedPointer.lerp(pointer, 1 - Math.exp(-delta * 8))
      if (options.rangerEnabled && !reducedMotion.matches && state.heroProgress < 0.99) fluidField.step(delta, elapsed, { pointer, force, strength })
      const portraitVisible = rect.top < height && rect.top + rect.height > 0 && rect.left < width && rect.left + rect.width > 0 && !finiteRect(state.projectTarget)
      render.autoClear = true
      if (portraitVisible) {
        updatePortrait(rect, delta)
        render.setRenderTarget(portraitTarget)
        render.setClearColor(0x000000, 0)
        render.render(heroScene, heroCamera)
        if (helmetTarget) {
          render.setRenderTarget(helmetTarget)
          render.setClearColor(0x000000, 0)
          render.render(helmetScene, heroCamera)
        }
      }
      render.setRenderTarget(null)
      render.setClearColor(0x000000, 0)
      render.clear()
      if (portraitVisible) render.render(displayScene, displayCamera)
      updateWindow()
      if (projectWindow.group.visible) {
        render.autoClear = false
        render.clearDepth()
        render.render(objectScene, objectCamera)
        render.autoClear = true
      }
      if (shaderFailure) throw shaderFailure
      if (render.getContext().isContextLost()) throw new Error('The spatial graphics context became unavailable while drawing.')
      if (!ready) {
        ready = true
        options.onReady?.()
      }
    }

    const tick = (now: number) => {
      frame = 0
      if (disposed || failed || !state.visible || document.hidden || reducedMotion.matches) return
      const rawDelta = previousTime ? (now - previousTime) / 1000 : 1 / 60
      previousTime = now
      const delta = Math.min(rawDelta, 1 / 30)
      elapsed += delta
      try {
        paint(delta, now)
        if (rawDelta > 0.008 && rawDelta < 0.1) { measuredFrames++; measuredTime += rawDelta }
        if (measuredFrames >= 90) {
          if (measuredTime / measuredFrames > 0.029) slowSamples++
          else slowSamples = 0
          measuredFrames = 0; measuredTime = 0
          if (slowSamples > 1 && pixelRatio > 0.85) {
            pixelRatio = Math.max(0.85, pixelRatio * 0.84)
            controller.resize()
            slowSamples = 0
          }
        }
        // resize() may already have requested the next frame during adaptive quality work.
        if (!frame && !disposed && !failed && state.visible && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(tick)
      } catch (error) { fail(error) }
    }
    const resume = () => {
      if (disposed || failed || !state.visible || document.hidden) return
      if (reducedMotion.matches) {
        try { paint(1 / 60, performance.now()) } catch (error) { fail(error) }
      } else if (!frame) { previousTime = 0; frame = requestAnimationFrame(tick) }
    }

    const onPointer = (event: PointerEvent) => {
      if (disposed || failed || !state.visible || reducedMotion.matches) return
      const bounds = host.getBoundingClientRect()
      const now = performance.now()
      const next = new THREE.Vector2(clamp((event.clientX - bounds.left) / width), clamp(1 - (event.clientY - bounds.top) / height))
      const delta = Math.max(0.016, (now - lastPointerTime) / 1000)
      force.copy(next).sub(previousPointer).divideScalar(delta).clampLength(0, 1.1)
      previousPointer.copy(next)
      pointer.copy(next)
      hasPointerInput = true
      lastInput = lastPointerTime = now
    }
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousTime = 0 }
      else resume()
    }
    const onMotion = () => { cancelAnimationFrame(frame); frame = 0; resume() }
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    reducedMotion.addEventListener('change', onMotion)
    removeListeners = () => {
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      reducedMotion.removeEventListener('change', onMotion)
      canvas.removeEventListener('webglcontextlost', onContextLost)
    }

    const controller: ExperienceController = {
      update(next) {
        if (disposed || failed) return
        const wasVisible = state.visible
        state = { ...next, heroProgress: clamp(next.heroProgress), flightProgress: clamp(next.flightProgress) }
        if (!state.visible) {
          cancelAnimationFrame(frame); frame = 0; previousTime = 0
          if (wasVisible) { render.setRenderTarget(null); render.setClearColor(0x000000, 0); render.clear() }
        } else resume()
      },
      resize() {
        if (disposed || failed) return
        width = Math.max(1, innerWidth); height = Math.max(1, innerHeight)
        pixelRatio = Math.min(pixelRatio, devicePixelRatio || 1, width < 650 ? 1.5 : 1.25)
        render.setPixelRatio(pixelRatio)
        render.setSize(width, height, false)
        portraitTarget.setSize(fboWidth(), fboHeight())
        helmetTarget?.setSize(fboWidth(), fboHeight())
        fluidField.resize(width, height)
        displayCamera.left = -width / 2; displayCamera.right = width / 2
        displayCamera.top = height / 2; displayCamera.bottom = -height / 2
        displayCamera.updateProjectionMatrix()
        setObjectCamera()
        resume()
      },
      dispose() {
        if (disposed) return
        disposed = true
        release()
        heroScene.clear(); displayScene.clear(); objectScene.clear(); helmetScene.clear()
      },
    }
    // The ready callback is deliberately after image decoding, shader setup and a real frame.
    paint(1 / 60, performance.now())
    resume()
    return controller
  } catch (error) {
    failed = true
    release()
    if (!ready) reportError(error)
    throw error
  }
}
