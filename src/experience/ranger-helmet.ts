import * as THREE from 'three'

type Section = readonly [y: number, width: number, front: number, rear: number]
type UV = readonly [number, number]
const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value))
const gaussian = (value: number, center: number, width: number) => Math.exp(-(((value - center) / width) ** 2))
const sections: readonly Section[] = [
  [-1, .51, .57, .40], [-.94, .62, .69, .48], [-.80, .73, .81, .58],
  [-.60, .82, .90, .66], [-.35, .92, .94, .73], [-.08, .985, .92, .77],
  [.18, .99, .88, .78], [.40, .95, .82, .75], [.60, .865, .72, .69],
  [.78, .70, .56, .59], [.91, .46, .35, .42], [.975, .23, .16, .23], [1, .005, 0, .005],
]

/** Smooth authored cranium/temple/jaw sections, not a displaced sphere. */
function sectionAt(y: number): Section {
  const value = clamp(y, -1, 1)
  let index = 0
  while (index < sections.length - 2 && value > sections[index + 1][0]) index++
  const a = sections[index], b = sections[index + 1]
  const before = sections[Math.max(0, index - 1)], after = sections[Math.min(sections.length - 1, index + 2)]
  const distance = b[0] - a[0], t = (value - a[0]) / distance, t2 = t * t, t3 = t2 * t
  const interpolate = (component: 1 | 2 | 3) => {
    const ma = (b[component] - before[component]) / (b[0] - before[0]) * distance
    const mb = (after[component] - a[component]) / (after[0] - a[0]) * distance
    return (2 * t3 - 3 * t2 + 1) * a[component] + (t3 - 2 * t2 + t) * ma
      + (-2 * t3 + 3 * t2) * b[component] + (t3 - t2) * mb
  }
  return [value, Math.max(.002, interpolate(1)), Math.max(0, interpolate(2)), Math.max(.002, interpolate(3))]
}
function frontZ(x: number, y: number) {
  const [, width, front] = sectionAt(y)
  const rounded = Math.pow(Math.max(.0001, 1 - Math.pow(Math.abs(x) / width, 2.65)), 1 / 2.65)
  const brow = .064 * gaussian(y, .32, .20) * gaussian(x, 0, .72)
  const snout = .067 * gaussian(y, .16, .23) * gaussian(x, 0, .22)
  const cheek = .026 * gaussian(y, -.43, .21) * gaussian(Math.abs(x), .66, .18)
  return front * rounded + brow + snout + cheek
}
function frontPoint(theta: number, y: number, lift = 0) {
  const x = Math.sin(theta) * sectionAt(y)[1]
  return new THREE.Vector3(x, y, frontZ(x, y) + lift)
}
const visorTop = (theta: number) => .065 + .17 * Math.pow(Math.sin(clamp(Math.abs(theta) / 1.28) * Math.PI / 2), 1.25)
const visorBottom = (theta: number) => {
  const t = clamp(Math.abs(theta) / 1.28)
  return -.375 + .195 * Math.pow(t, 1.6) + .045 * gaussian(t, 0, .17)
}
function surface(columns: number, rows: number, point: (u: number, v: number) => THREE.Vector3,
  keepCell?: (u: number, v: number) => boolean) {
  const positions: number[] = [], indices: number[] = []
  for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
    positions.push(...point(column / columns, row / rows).toArray())
    if (row < rows && column < columns && (!keepCell || keepCell((column + .5) / columns, (row + .5) / rows))) {
      const start = row * (columns + 1) + column
      indices.push(start, start + 1, start + columns + 2, start, start + columns + 2, start + columns + 1)
    }
  }
  const result = new THREE.BufferGeometry()
  result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  result.setIndex(indices)
  result.computeVertexNormals()
  return result
}

/** Own procedural prop study, visually checked against ANIKI/Bandai reference photographs.
 * No reference image, texture or downloaded model is part of this model. */
export class RangerHelmet {
  readonly group = new THREE.Group()
  private readonly geometries: THREE.BufferGeometry[] = []
  private readonly materials: THREE.Material[] = []
  constructor() {
    const body = new THREE.Group()
    this.group.add(body)
    const geometry = <T extends THREE.BufferGeometry>(value: T): T => { this.geometries.push(value); return value }
    const material = <T extends THREE.Material>(value: T): T => { this.materials.push(value); return value }
    const add = (shape: THREE.BufferGeometry, finish: THREE.Material) => {
      const mesh = new THREE.Mesh(geometry(shape), finish); body.add(mesh); return mesh
    }
    const lacquer = material(new THREE.MeshPhysicalMaterial({ color: 0x008541, metalness: .32, roughness: .20,
      clearcoat: 1, clearcoatRoughness: .075, envMapIntensity: 1.15, side: THREE.DoubleSide }))
    const darkGreen = material(new THREE.MeshPhysicalMaterial({ color: 0x00552b, metalness: .30, roughness: .24,
      clearcoat: 1, clearcoatRoughness: .10, envMapIntensity: 1, side: THREE.DoubleSide }))
    const rubber = material(new THREE.MeshStandardMaterial({ color: 0x06100d, metalness: .04, roughness: .60, side: THREE.DoubleSide }))
    const smokedLens = material(new THREE.MeshPhysicalMaterial({ color: 0x030909, metalness: .28, roughness: .095,
      clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: .82, side: THREE.DoubleSide }))
    const ivory = material(new THREE.MeshPhysicalMaterial({ color: 0xf0f2eb, metalness: .30, roughness: .23,
      clearcoat: .9, clearcoatRoughness: .10, envMapIntensity: 1, side: THREE.DoubleSide }))
    const chrome = material(new THREE.MeshPhysicalMaterial({ color: 0xe4e9e6, metalness: .88, roughness: .20,
      clearcoat: .65, clearcoatRoughness: .12, envMapIntensity: 1.15, side: THREE.DoubleSide }))
    const mouthDark = material(new THREE.MeshStandardMaterial({ color: 0x17211e, metalness: .40, roughness: .32, side: THREE.DoubleSide }))
    const seam = (points: THREE.Vector3[], radius: number, finish: THREE.Material, closed = false) => {
      const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal')
      return add(new THREE.TubeGeometry(curve, Math.max(32, points.length * 5), radius, 6, closed), finish)
    }
    const frontLine = (coordinates: UV[], lift: number, radius: number, finish: THREE.Material = rubber, closed = false) =>
      seam(coordinates.map(([x, y]) => new THREE.Vector3(x, y, frontZ(x, y) + lift)), radius, finish, closed)

    // Fitted shell with an actual missing section at the visor opening.
    add(surface(192, 144, (u, v) => {
      const theta = (u - .5) * Math.PI * 2, y = -1 + v * 2
      const [, width, , rear] = sectionAt(y), x = Math.sin(theta) * width, cosine = Math.cos(theta)
      return new THREE.Vector3(x, y, cosine >= 0 ? frontZ(x, y) : -rear * Math.pow(-cosine, .78))
    }, (u, v) => {
      const theta = (u - .5) * Math.PI * 2, y = -1 + v * 2
      return Math.abs(theta) > 1.31 || y > visorTop(theta) + .035 || y < visorBottom(theta) - .035
    }), lacquer)
    // Recessed optical lens and a narrow compression gasket.
    add(surface(128, 48, (u, v) => {
      const theta = (u - .5) * 2.64, bottom = visorBottom(theta) - .045, top = visorTop(theta) + .045
      return frontPoint(theta, bottom + (top - bottom) * v, -.010)
    }), smokedLens)
    for (const top of [false, true]) add(surface(128, 6, (u, v) => {
      const theta = (u - .5) * 2.60, edge = top ? visorTop(theta) : visorBottom(theta)
      return frontPoint(theta, edge + (v - .5) * .045, .003 + Math.sin(v * Math.PI) * .007)
    }), rubber)
    // Continuous enamel border beneath separate sculpted teeth.
    for (const top of [false, true]) for (const direction of [-1, 1]) add(surface(64, 8, (u, v) => {
      const theta = direction * (.22 + u * 1.075), edge = top ? visorTop(theta) : visorBottom(theta)
      return frontPoint(theta, edge + (top ? 1 : -1) * (.033 - v * .061), .015 + Math.sin(v * Math.PI) * .009)
    }), ivory)
    const tooth = (corners: readonly UV[]) => {
      const divisions = 14, positions: number[] = []
      const append = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => { positions.push(...a.toArray(), ...b.toArray(), ...c.toArray()) }
      const point = (i: number, j: number) => {
        const b = i / divisions, c = j / divisions, a = 1 - b - c
        const theta = corners[0][0] * a + corners[1][0] * b + corners[2][0] * c
        const y = corners[0][1] * a + corners[1][1] * b + corners[2][1] * c
        return frontPoint(theta, y, .028 + .024 * Math.pow(Math.max(0, 27 * a * b * c), .55))
      }
      for (let i = 0; i < divisions; i++) for (let j = 0; j < divisions - i; j++) {
        append(point(i, j), point(i + 1, j), point(i, j + 1))
        if (i + j < divisions - 1) append(point(i + 1, j), point(i + 1, j + 1), point(i, j + 1))
      }
      for (let edge = 0; edge < 3; edge++) for (let i = 0; i < divisions; i++) {
        const a = corners[edge], b = corners[(edge + 1) % 3], t0 = i / divisions, t1 = (i + 1) / divisions
        const theta0 = THREE.MathUtils.lerp(a[0], b[0], t0), y0 = THREE.MathUtils.lerp(a[1], b[1], t0)
        const theta1 = THREE.MathUtils.lerp(a[0], b[0], t1), y1 = THREE.MathUtils.lerp(a[1], b[1], t1)
        const p0 = frontPoint(theta0, y0, .028), p1 = frontPoint(theta1, y1, .028)
        const q0 = frontPoint(theta0, y0, .011), q1 = frontPoint(theta1, y1, .011)
        append(p0, q0, p1); append(p1, q0, q1)
      }
      const result = new THREE.BufferGeometry(); result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      result.computeVertexNormals(); add(result, ivory)
    }
    for (const direction of [-1, 1]) for (let index = 0; index < 4; index++) {
      const theta = [.36, .61, .86, 1.105][index] * direction
      const half = [.115, .124, .132, .13][index], depth = [.11, .145, .17, .145][index]
      tooth([[theta - half, visorTop(theta - half) + .029], [theta + half, visorTop(theta + half) + .029],
        [theta + direction * .028, visorTop(theta) - depth]])
      tooth([[theta - half, visorBottom(theta - half) - .030], [theta - direction * .023, visorBottom(theta) + depth * .74],
        [theta + half, visorBottom(theta + half) - .030]])
    }
    // Projecting dragon snout/brow and central head crest.
    add(surface(112, 12, (u, v) => {
      const theta = (u - .5) * 2.65, y = visorTop(theta) + .041 + v * .092
      return frontPoint(theta, y, .025 + Math.sin(v * Math.PI) * .024)
    }), lacquer)
    add(surface(48, 30, (u, v) => {
      const y = .073 + v * .61, halfWidth = .11 + .052 * Math.sin(v * Math.PI), x = (u - .5) * halfWidth * 2
      return new THREE.Vector3(x, y, frontZ(x, y) + .020 + Math.sin(u * Math.PI) * .016)
    }), lacquer)
    // Small tinted dragon eyes are separate from the wearer's larger dark visor.
    for (const direction of [-1, 1]) {
      add(surface(48, 14, (u, v) => {
        const x = direction * (.285 + u * .50), centerY = .455 + u * .085
        const y = centerY + (v - .5) * Math.pow(Math.sin(u * Math.PI), .70) * .11
        return new THREE.Vector3(x, y, frontZ(x, y) + .021)
      }), smokedLens)
      add(surface(52, 10, (u, v) => {
        const x = direction * (.27 + u * .545), y = .475 + u * .084 + Math.sin(u * Math.PI) * .047 + v * .045
        return new THREE.Vector3(x, y, frontZ(x, y) + .022 + Math.sin(v * Math.PI) * .021)
      }), lacquer)
      frontLine([[direction * .235, .37], [direction * .34, .405], [direction * .61, .39], [direction * .79, .43]], .007, .0036)
      frontLine([[direction * .15, .34], [direction * .22, .57], [direction * .30, .77], [direction * .30, .90]], .009, .0032)
    }
    // Continuous anatomical chrome surface: nose, philtrum, lips, fold and chin.
    const maskPoint = (u: number, v: number, padding = 0) => {
      const s = (u - .5) * 2, halfWidth = .342 + .215 * Math.sin(v * Math.PI * .68) + padding, x = s * halfWidth
      const bottom = -.925 + .075 * s * s - padding, top = -.425 - .035 * s * s + padding, y = bottom + (top - bottom) * v
      const fade = Math.pow(Math.max(0, 1 - s * s), .65) * Math.pow(Math.max(0, Math.sin(v * Math.PI)), .30)
      const nose = .100 * gaussian(x, 0, .105) * gaussian(y, -.500, .095) + .060 * gaussian(x, 0, .135) * gaussian(y, -.563, .036)
        + .028 * gaussian(Math.abs(x), .113, .045) * gaussian(y, -.565, .035)
      const cupid = -.648 + .010 * gaussian(Math.abs(x), .068, .045)
      const upperLip = .037 * gaussian(x, 0, .24) * gaussian(y, cupid, .021), lowerLip = .040 * gaussian(x, 0, .23) * gaussian(y, -.703, .025)
      const lineY = -.676 + .013 * (1 - (x / .29) ** 2), mouth = -.034 * gaussian(x, 0, .27) * gaussian(y, lineY, .008)
      const chin = .057 * gaussian(x, 0, .285) * gaussian(y, -.825, .070), fold = -.016 * gaussian(x, 0, .21) * gaussian(y, -.756, .016)
      const cheeks = .036 * gaussian(Math.abs(x), .33, .12) * gaussian(y, -.603, .14), philtrum = -.013 * gaussian(x, 0, .026) * gaussian(y, -.612, .025)
      return new THREE.Vector3(x, y, frontZ(x, y) + .027 + (nose + upperLip + lowerLip + mouth + chin + fold + cheeks + philtrum) * fade)
    }
    add(surface(96, 80, (u, v) => maskPoint(u, v, .015).add(new THREE.Vector3(0, 0, -.004))), rubber)
    add(surface(128, 112, (u, v) => maskPoint(u, v)), chrome)
    const rim: THREE.Vector3[] = []
    for (let i = 0; i < 32; i++) rim.push(maskPoint(i / 32, 0).add(new THREE.Vector3(0, 0, .009)))
    for (let i = 0; i < 24; i++) rim.push(maskPoint(1, i / 24).add(new THREE.Vector3(0, 0, .009)))
    for (let i = 0; i < 32; i++) rim.push(maskPoint(1 - i / 32, 1).add(new THREE.Vector3(0, 0, .009)))
    for (let i = 0; i < 24; i++) rim.push(maskPoint(0, 1 - i / 24).add(new THREE.Vector3(0, 0, .009)))
    seam(rim, .009, chrome, true)
    const maskAtXY = (x: number, y: number) => {
      let v = clamp((y + .925) / .50), u = .5
      for (let i = 0; i < 4; i++) {
        const halfWidth = .342 + .215 * Math.sin(v * Math.PI * .68), s = x / halfWidth
        const bottom = -.925 + .075 * s * s, top = -.425 - .035 * s * s
        v = clamp((y - bottom) / (top - bottom)); u = clamp((s + 1) / 2)
      }
      return maskPoint(u, v)
    }
    // Recessed dark slit instead of added lip tubes.
    add(surface(80, 4, (u, v) => {
      const x = (u - .5) * .56, y = -.676 + .013 * (1 - (x / .29) ** 2) + (v - .5) * .006 * Math.pow(Math.sin(u * Math.PI), .5)
      return maskAtXY(x, y).add(new THREE.Vector3(0, 0, .0015))
    }), mouthDark)
    for (const direction of [-1, 1]) add(surface(24, 8, (u, v) => {
      const x = direction * (.075 + u * .065), y = -.574 + (v - .5) * .008 * Math.sin(u * Math.PI)
      return maskAtXY(x, y).add(new THREE.Vector3(0, 0, .002))
    }), mouthDark)
    const gold = material(new THREE.MeshPhysicalMaterial({ color: 0xc6b577, metalness: .82, roughness: .24, clearcoat: .55, side: THREE.DoubleSide }))
    const ruby = material(new THREE.MeshPhysicalMaterial({ color: 0x9f1021, metalness: .20, roughness: .13, clearcoat: 1, clearcoatRoughness: .06, side: THREE.DoubleSide }))
    const diamond = (width: number, height: number, lift: number, bulge: number, finish: THREE.Material) => {
      const positions: number[] = [], corners: UV[] = [[0, .69 + height], [-width, .69], [0, .69 - height], [width, .69]]
      for (let side = 0; side < 4; side++) for (let i = 0; i < 12; i++) {
        const a = corners[side], b = corners[(side + 1) % 4], t0 = i / 12, t1 = (i + 1) / 12
        const x0 = THREE.MathUtils.lerp(a[0], b[0], t0), y0 = THREE.MathUtils.lerp(a[1], b[1], t0)
        const x1 = THREE.MathUtils.lerp(a[0], b[0], t1), y1 = THREE.MathUtils.lerp(a[1], b[1], t1)
        positions.push(0, .69, frontZ(0, .69) + lift + bulge, x0, y0, frontZ(x0, y0) + lift, x1, y1, frontZ(x1, y1) + lift)
      }
      const result = new THREE.BufferGeometry(); result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); result.computeVertexNormals(); add(result, finish)
    }
    diamond(.092, .115, .019, .006, gold); diamond(.074, .094, .025, .022, ruby)
    // Rear split, temple panels, actual clips, ear hardware and rubber seat collar.
    for (const direction of [-1, 1]) {
      const panel: THREE.Vector3[] = []
      for (let i = 0; i <= 24; i++) {
        const y = -.84 + i / 24 * 1.62, theta = direction * (1.52 - .075 * Math.sin(i / 24 * Math.PI)), [, width, front] = sectionAt(y)
        panel.push(new THREE.Vector3(Math.sin(theta) * width + direction * .003, y, Math.cos(theta) * front))
      }
      seam(panel, .0035, rubber)
      const base = add(new THREE.BoxGeometry(.024, .105, .12, 1, 2, 2), rubber)
      base.position.set(direction * .774, -.755, .078)
      const clip = add(new THREE.CapsuleGeometry(.022, .050, 6, 12), darkGreen)
      clip.position.set(direction * .799, -.753, .078); clip.rotation.z = direction * -.22
      for (const z of [.045, .110]) { const pin = add(new THREE.SphereGeometry(.008, 12, 8), chrome); pin.position.set(direction * .812, -.753, z) }
      const earBase = add(new THREE.CylinderGeometry(.105, .108, .022, 48), rubber)
      earBase.rotation.z = Math.PI / 2; earBase.position.set(direction * .974, -.23, -.12)
      const earCap = add(new THREE.CylinderGeometry(.092, .099, .027, 48), lacquer)
      earCap.rotation.z = Math.PI / 2; earCap.position.set(direction * .989, -.23, -.12)
      for (let i = 0; i < 3; i++) frontLine([[direction * (.79 + i * .018), -.51 + i * .015], [direction * (.82 + i * .018), -.49 + i * .015]], .006, .0035)
    }
    const rearSplit: THREE.Vector3[] = []
    for (let i = 0; i <= 48; i++) { const y = -.94 + i / 48 * 1.91; rearSplit.push(new THREE.Vector3(0, y, -sectionAt(y)[3] - .001)) }
    seam(rearSplit, .0035, rubber)
    const collar = add(new THREE.TorusGeometry(.536, .022, 10, 96), rubber)
    collar.rotation.x = Math.PI / 2; collar.scale.set(1, .91, 1); collar.position.set(0, -.976, .026)
    // Normalize the inner model; the portrait root retains ownership of outer scale.
    body.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(body), height = bounds.max.y - bounds.min.y
    const maxX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x)), depth = bounds.max.z - bounds.min.z
    body.scale.set(1 / maxX, 2 / height, 1 / depth)
    body.position.set(0, -(bounds.max.y + bounds.min.y) / height, -bounds.min.z / depth)
    this.group.userData.formStudy = 'authored cross-section shell / recessed dragon visor / continuous anatomical chrome plate'
  }
  dispose() {
    for (const geometry of this.geometries) geometry.dispose()
    for (const material of this.materials) material.dispose()
    this.group.clear()
  }
}
