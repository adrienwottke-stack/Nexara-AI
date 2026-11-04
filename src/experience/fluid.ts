import * as THREE from 'three'

const vertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }
`

const common = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
uniform vec2 uPointer;
uniform vec2 uForce;
uniform float uDelta;
uniform float uTime;
uniform float uSplat;
uniform float uAspect;
uniform float uPacked;
vec2 velocityAt(vec2 uv){
  vec2 v=texture2D(uVelocity,clamp(uv,vec2(0.0),vec2(1.0))).xy;
  return mix(v,(v-0.5)*2.0,uPacked);
}
float pressureAt(sampler2D source,vec2 uv){
  float p=texture2D(source,clamp(uv,vec2(0.0),vec2(1.0))).r;
  return mix(p,(p-0.5)*2.0,uPacked);
}
vec4 writeVelocity(vec2 velocity){
  return vec4(mix(velocity,velocity*0.5+0.5,uPacked),0.0,1.0);
}
vec4 writePressure(float pressure){
  return vec4(mix(pressure,pressure*0.5+0.5,uPacked),0.0,0.0,1.0);
}
float splat(){
  vec2 d=vUv-uPointer;
  d.x*=uAspect;
  return exp(-dot(d,d)/0.0065)*uSplat;
}
`

const fragments = {
  velocity: common + /* glsl */ `
void main(){
  vec2 v=velocityAt(vUv);
  vec2 previous=vUv-v*uDelta;
  v=velocityAt(previous)*pow(0.989,uDelta*60.0);
  vec2 swirl=vec2(sin(vUv.y*11.0+uTime*0.33),cos(vUv.x*10.0-uTime*0.27));
  v+=swirl*uDelta*0.014;
  v+=uForce*splat()*uDelta*13.0;
  if(vUv.x<uTexel.x || vUv.x>1.0-uTexel.x) v.x=0.0;
  if(vUv.y<uTexel.y || vUv.y>1.0-uTexel.y) v.y=0.0;
  gl_FragColor=writeVelocity(clamp(v,vec2(-0.95),vec2(0.95)));
}`,
  divergence: common + /* glsl */ `
void main(){
  float l=velocityAt(vUv-vec2(uTexel.x,0.0)).x;
  float r=velocityAt(vUv+vec2(uTexel.x,0.0)).x;
  float b=velocityAt(vUv-vec2(0.0,uTexel.y)).y;
  float t=velocityAt(vUv+vec2(0.0,uTexel.y)).y;
  gl_FragColor=writePressure(0.5*(r-l+t-b));
}`,
  pressure: common + /* glsl */ `
void main(){
  float l=pressureAt(uPressure,vUv-vec2(uTexel.x,0.0));
  float r=pressureAt(uPressure,vUv+vec2(uTexel.x,0.0));
  float b=pressureAt(uPressure,vUv-vec2(0.0,uTexel.y));
  float t=pressureAt(uPressure,vUv+vec2(0.0,uTexel.y));
  float d=pressureAt(uDivergence,vUv);
  gl_FragColor=writePressure((l+r+b+t-d)*0.25);
}`,
  project: common + /* glsl */ `
void main(){
  float l=pressureAt(uPressure,vUv-vec2(uTexel.x,0.0));
  float r=pressureAt(uPressure,vUv+vec2(uTexel.x,0.0));
  float b=pressureAt(uPressure,vUv-vec2(0.0,uTexel.y));
  float t=pressureAt(uPressure,vUv+vec2(0.0,uTexel.y));
  gl_FragColor=writeVelocity(velocityAt(vUv)-0.5*vec2(r-l,t-b));
}`,
  density: common + /* glsl */ `
void main(){
  vec2 previous=clamp(vUv-velocityAt(vUv)*uDelta,vec2(0.0),vec2(1.0));
  float center=texture2D(uSource,previous).r;
  float neighbours=texture2D(uSource,previous+vec2(uTexel.x,0.0)).r
    +texture2D(uSource,previous-vec2(uTexel.x,0.0)).r
    +texture2D(uSource,previous+vec2(0.0,uTexel.y)).r
    +texture2D(uSource,previous-vec2(0.0,uTexel.y)).r;
  float d=mix(center,neighbours*0.25,0.035)*pow(0.985,uDelta*60.0);
  d=clamp(d+splat()*uDelta*5.2,0.0,1.0);
  gl_FragColor=vec4(d,d,d,1.0);
}`,
}

export interface FluidInput {
  pointer: THREE.Vector2
  force: THREE.Vector2
  strength: number
}

/** Small GPU velocity/pressure/density solver used only as an artistic reveal mask. */
export class FluidField {
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private readonly geometry = new THREE.PlaneGeometry(2, 2)
  private readonly quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
  private readonly materials: Record<keyof typeof fragments, THREE.ShaderMaterial>
  private readonly velocity: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget]
  private readonly density: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget]
  private readonly pressure: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget]
  private readonly divergence: THREE.WebGLRenderTarget
  private velocityIndex = 0
  private densityIndex = 0
  private pressureIndex = 0
  private readonly packed: number
  readonly size: number

  constructor(private readonly renderer: THREE.WebGLRenderer, width: number, height: number) {
    this.size = width < 650 ? 128 : 192
    const floatSupported = renderer.extensions.has('EXT_color_buffer_float')
    this.packed = floatSupported ? 0 : 1
    const type = floatSupported ? THREE.HalfFloatType : THREE.UnsignedByteType
    const target = (density = false) => new THREE.WebGLRenderTarget(this.size, this.size, {
      type: density ? THREE.UnsignedByteType : type,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    })
    this.velocity = [target(), target()]
    this.density = [target(true), target(true)]
    this.pressure = [target(), target()]
    this.divergence = target()
    const make = (fragmentShader: string) => new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uVelocity: { value: this.velocity[0].texture },
        uSource: { value: this.density[0].texture },
        uPressure: { value: this.pressure[0].texture },
        uDivergence: { value: this.divergence.texture },
        uTexel: { value: new THREE.Vector2(1 / this.size, 1 / this.size) },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uForce: { value: new THREE.Vector2() },
        uDelta: { value: 1 / 60 },
        uTime: { value: 0 },
        uSplat: { value: 0 },
        uAspect: { value: width / height },
        uPacked: { value: this.packed },
      },
    })
    this.materials = {
      velocity: make(fragments.velocity), divergence: make(fragments.divergence),
      pressure: make(fragments.pressure), project: make(fragments.project), density: make(fragments.density),
    }
    this.quad = new THREE.Mesh(this.geometry, this.materials.velocity)
    this.scene.add(this.quad)
    this.clear()
  }

  get texture() { return this.density[this.densityIndex].texture }

  resize(width: number, height: number) {
    for (const material of Object.values(this.materials)) material.uniforms.uAspect.value = width / height
  }

  private pass(material: THREE.ShaderMaterial, destination: THREE.WebGLRenderTarget) {
    this.quad.material = material
    this.renderer.setRenderTarget(destination)
    this.renderer.render(this.scene, this.camera)
  }

  private clear() {
    const previous = this.renderer.getRenderTarget()
    const colour = this.renderer.getClearColor(new THREE.Color())
    const alpha = this.renderer.getClearAlpha()
    for (const target of [...this.velocity, ...this.pressure, this.divergence]) {
      this.renderer.setRenderTarget(target)
      this.renderer.setClearColor(this.packed ? 0x808080 : 0x000000, 1)
      this.renderer.clear()
    }
    for (const target of this.density) {
      this.renderer.setRenderTarget(target)
      this.renderer.setClearColor(0x000000, 1)
      this.renderer.clear()
    }
    this.renderer.setRenderTarget(previous)
    this.renderer.setClearColor(colour, alpha)
  }

  step(delta: number, time: number, input: FluidInput) {
    const previous = this.renderer.getRenderTarget()
    for (const material of Object.values(this.materials)) {
      material.uniforms.uVelocity.value = this.velocity[this.velocityIndex].texture
      material.uniforms.uSource.value = this.density[this.densityIndex].texture
      material.uniforms.uPressure.value = this.pressure[this.pressureIndex].texture
      material.uniforms.uDelta.value = Math.min(delta, 1 / 30)
      material.uniforms.uTime.value = time
      material.uniforms.uPointer.value.copy(input.pointer)
      material.uniforms.uForce.value.copy(input.force)
      material.uniforms.uSplat.value = input.strength
    }
    this.pass(this.materials.velocity, this.velocity[1 - this.velocityIndex])
    this.velocityIndex = 1 - this.velocityIndex
    this.materials.divergence.uniforms.uVelocity.value = this.velocity[this.velocityIndex].texture
    this.pass(this.materials.divergence, this.divergence)
    for (let index = 0; index < 7; index++) {
      this.materials.pressure.uniforms.uPressure.value = this.pressure[this.pressureIndex].texture
      this.pass(this.materials.pressure, this.pressure[1 - this.pressureIndex])
      this.pressureIndex = 1 - this.pressureIndex
    }
    this.materials.project.uniforms.uVelocity.value = this.velocity[this.velocityIndex].texture
    this.materials.project.uniforms.uPressure.value = this.pressure[this.pressureIndex].texture
    this.pass(this.materials.project, this.velocity[1 - this.velocityIndex])
    this.velocityIndex = 1 - this.velocityIndex
    this.materials.density.uniforms.uVelocity.value = this.velocity[this.velocityIndex].texture
    this.pass(this.materials.density, this.density[1 - this.densityIndex])
    this.densityIndex = 1 - this.densityIndex
    this.renderer.setRenderTarget(previous)
  }

  dispose() {
    for (const target of [...this.velocity, ...this.density, ...this.pressure, this.divergence]) target.dispose()
    for (const material of Object.values(this.materials)) material.dispose()
    this.geometry.dispose()
    this.scene.clear()
  }
}
