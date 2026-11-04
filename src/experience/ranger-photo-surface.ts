import * as THREE from 'three'

/** Photo-based front relief for the small viewing angles of the portrait hero. */
export class RangerPhotoSurface {
  static readonly fitScale = .154
  static readonly fitOffsetX = -.0062
  static readonly fitOffsetY = .03389
  // Measured opaque width/height of the versioned 1220 × 1289 cutout.
  static readonly alphaWidthPerPortraitHeight = 2 * RangerPhotoSurface.fitScale * 1069 / 1289
  readonly group = new THREE.Group()
  readonly geometry: THREE.PlaneGeometry
  readonly material: THREE.ShaderMaterial

  constructor(texture: THREE.Texture) {
    const image = texture.image as { width: number; height: number }
    const aspect = image.width / image.height
    const geometry = new THREE.PlaneGeometry(2 * aspect, 2, 144, 160)
    const vertices = geometry.getAttribute('position')
    const depth = new Float32Array(vertices.count)
    const oval = (u: number, v: number, x: number, y: number, rx: number, ry: number) => Math.exp(-(((u - x) / rx) ** 2 + ((v - y) / ry) ** 2) * 1.7)
    for (let index = 0; index < vertices.count; index++) {
      // Map every helmet vertex back to the same point in the original portrait.
      // Matching its depth removes relative parallax when both pivots rotate.
      const u = .5 + RangerPhotoSurface.fitOffsetX + vertices.getX(index) * RangerPhotoSurface.fitScale / .8
      const v = .755 + RangerPhotoSurface.fitOffsetY + vertices.getY(index) * RangerPhotoSurface.fitScale
      depth[index] = oval(u, v, .5, .76, .145, .17) * .66
        + oval(u, v, .5, .865, .155, .105) * .35
        + oval(u, v, .5, .742, .028, .059) * .24
        + (oval(u, v, .443, .765, .044, .056) + oval(u, v, .557, .765, .044, .056)) * .10
        + oval(u, v, .5, .61, .075, .09) * .23
        + oval(u, v, .5, .36, .34, .30) * .18
        + oval(u, v, .5, .10, .15, .09) * .31
    }
    geometry.setAttribute('aPortraitDepth', new THREE.BufferAttribute(depth, 1))
    geometry.computeVertexNormals()
    this.geometry = geometry
    this.material = new THREE.ShaderMaterial({
      uniforms: { uImage: { value: texture }, uPortraitDepth: { value: 50 } },
      vertexShader: `
        varying vec2 vUv;
        attribute float aPortraitDepth;
        uniform float uPortraitDepth;
        void main(){
          vUv=uv;
          vec3 p=position;
          p.z=aPortraitDepth*uPortraitDepth+4.0;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uImage;
        varying vec2 vUv;
        void main(){
          vec4 sampleColour=texture2D(uImage,vUv);
          if(sampleColour.a<0.008)discard;
          gl_FragColor=sampleColour;
          #include <colorspace_fragment>
        }
      `,
      transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
    })
    const mesh = new THREE.Mesh(this.geometry, this.material)
    this.group.add(mesh)
  }

  setPortraitDepth(value: number) { this.material.uniforms.uPortraitDepth.value = value }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
    this.group.clear()
  }
}
