import * as THREE from 'three'

function roundedShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

function drawingTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Project-window artwork could not be prepared.')
  draw(ctx)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Procedural, original physical browser frame. The project image is replaceable. */
export class ProjectWindow {
  readonly group = new THREE.Group()
  private readonly geometries: THREE.BufferGeometry[] = []
  private readonly materials: THREE.Material[] = []
  private readonly textures: THREE.Texture[] = []

  constructor(project: THREE.Texture) {
    const geometry = <T extends THREE.BufferGeometry>(value: T): T => { this.geometries.push(value); return value }
    const material = <T extends THREE.Material>(value: T): T => { this.materials.push(value); return value }
    const body = geometry(new THREE.ExtrudeGeometry(roundedShape(1.60, 1.15, 0.065), {
      depth: 0.092, bevelEnabled: true, bevelSize: 0.013, bevelThickness: 0.013, bevelSegments: 3, curveSegments: 16,
    }))
    body.translate(0, 0, -0.05)
    const face = material(new THREE.MeshStandardMaterial({ color: 0x314437, roughness: 0.45, metalness: 0.38 }))
    const edge = material(new THREE.MeshStandardMaterial({ color: 0x738577, roughness: 0.25, metalness: 0.68 }))
    this.group.add(new THREE.Mesh(body, [face, edge]))

    const rim = roundedShape(1.555, 1.105, 0.055)
    const hole = new THREE.Path(roundedShape(1.46, 0.985, 0.027).getPoints(16).reverse())
    rim.holes.push(hole)
    const rimGeometry = geometry(new THREE.ExtrudeGeometry(rim, { depth: 0.011, bevelEnabled: false, curveSegments: 16 }))
    rimGeometry.translate(0, 0, 0.062)
    this.group.add(new THREE.Mesh(rimGeometry, material(new THREE.MeshStandardMaterial({ color: 0xb4bcac, roughness: 0.38, metalness: 0.65 }))))

    const screen = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1.44, 0.90)), material(new THREE.MeshBasicMaterial({ map: project, toneMapped: false })))
    screen.position.set(0, -0.025, 0.079)
    this.group.add(screen)

    const headerTexture = drawingTexture(1024, 76, ctx => {
      ctx.fillStyle = '#dbe1d5'; ctx.fillRect(0, 0, 1024, 76)
      ctx.fillStyle = '#6e7c66'
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(25 + i * 26, 38, 7, 0, Math.PI * 2); ctx.fill() }
      ctx.fillStyle = '#283a2b'; ctx.font = '600 23px Arial, sans-serif'; ctx.fillText('ADRIEN / PROJEKT', 370, 47)
      ctx.strokeStyle = '#89967c'; ctx.lineWidth = 2; ctx.strokeRect(966, 29, 17, 17)
    })
    this.textures.push(headerTexture)
    const header = new THREE.Mesh(geometry(new THREE.PlaneGeometry(1.44, 0.079)), material(new THREE.MeshBasicMaterial({ map: headerTexture, toneMapped: false })))
    header.position.set(0, 0.466, 0.08)
    this.group.add(header)

    const badgeTexture = drawingTexture(512, 512, ctx => {
      ctx.clearRect(0, 0, 512, 512)
      ctx.strokeStyle = '#d8e5ca'; ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(57, 333); ctx.lineTo(153, 132); ctx.lineTo(249, 333)
      ctx.moveTo(99, 257); ctx.lineTo(207, 257)
      ctx.moveTo(263, 140); ctx.lineTo(297, 333); ctx.lineTo(366, 209); ctx.lineTo(404, 333); ctx.lineTo(459, 140); ctx.stroke()
      ctx.fillStyle = '#c8f400'; ctx.fillRect(229, 392, 54, 6)
    })
    this.textures.push(badgeTexture)
    const badge = new THREE.Mesh(geometry(new THREE.PlaneGeometry(0.71, 0.71)), material(new THREE.MeshBasicMaterial({ map: badgeTexture, transparent: true, toneMapped: false, depthWrite: false })))
    badge.position.z = -0.066
    badge.rotation.y = Math.PI
    this.group.add(badge)

    const detail = new THREE.Mesh(geometry(new THREE.BoxGeometry(0.014, 0.26, 0.032)), material(new THREE.MeshStandardMaterial({ color: 0xc8f400, emissive: 0x243400, roughness: 0.45, metalness: 0.2 })))
    detail.position.set(-0.793, -0.23, 0.037)
    this.group.add(detail)
  }

  setOpacity(opacity: number) {
    for (const material of this.materials) {
      const isTransparentArtwork = material instanceof THREE.MeshBasicMaterial && material.map === this.textures[1]
      material.transparent = opacity < 0.999 || isTransparentArtwork
      material.opacity = opacity
      material.depthWrite = opacity > 0.92 && !isTransparentArtwork
    }
  }

  dispose() {
    for (const geometry of this.geometries) geometry.dispose()
    for (const material of this.materials) material.dispose()
    for (const texture of this.textures) texture.dispose()
    this.group.clear()
  }
}
