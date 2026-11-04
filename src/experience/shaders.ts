export const flatVertex = /* glsl */ `
varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
`

export const portraitVertex = /* glsl */ `
varying vec2 vUv;
varying float vDepth;
uniform float uDepth;
float oval(vec2 p,vec2 center,vec2 radius){vec2 q=(p-center)/radius;return exp(-dot(q,q)*1.7);}
void main(){
  vUv=uv;
  // An authored relief study for this portrait's composition, not estimated photo depth.
  float head=oval(uv,vec2(0.50,0.76),vec2(0.145,0.17));
  float hair=oval(uv,vec2(0.50,0.865),vec2(0.155,0.105));
  float nose=oval(uv,vec2(0.50,0.742),vec2(0.028,0.059));
  float cheek=oval(uv,vec2(0.443,0.765),vec2(0.044,0.056))
    +oval(uv,vec2(0.557,0.765),vec2(0.044,0.056));
  float neck=oval(uv,vec2(0.50,0.61),vec2(0.075,0.09));
  float torso=oval(uv,vec2(0.50,0.36),vec2(0.34,0.30));
  float hands=oval(uv,vec2(0.50,0.10),vec2(0.15,0.09));
  vDepth=head*0.66+hair*0.35+nose*0.24+cheek*0.10+neck*0.23+torso*0.18+hands*0.31;
  vec3 p=position;
  p.z+=vDepth*uDepth;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}
`

export const portraitFragment = /* glsl */ `
precision highp float;
uniform sampler2D uPortrait;
uniform float uPhase;
varying vec2 vUv;
varying float vDepth;
void main(){
  vec4 photo=texture2D(uPortrait,vUv);
  if(photo.a<0.025)discard;
  float luma=dot(photo.rgb,vec3(0.2126,0.7152,0.0722));
  vec3 portrait=mix(photo.rgb,vec3(luma)*vec3(0.83,0.91,0.77),uPhase*0.65);
  gl_FragColor=vec4(portrait,photo.a);
  #include <colorspace_fragment>
}
`

export const backgroundFragment = /* glsl */ `
precision highp float;
uniform vec2 uViewport;
uniform vec2 uFboSize;
uniform vec4 uRect;
uniform vec2 uPointer;
uniform float uTime;
uniform float uPhase;
uniform float uReveal;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.13,311.71)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);
}
void main(){
  vec2 screenUv=(uRect.xy+vUv*uRect.zw)/uViewport;
  vec2 p=vUv*vec2(uRect.z/uRect.w,1.0)*2.8;
  p+=(uPointer-0.5)*0.10;
  float field=noise(p+vec2(uTime*0.014,0.0))*0.65
    +noise(p*2.1-vec2(0.0,uTime*0.011))*0.24
    +noise(p*4.0)*0.11;
  float edge=abs(fract(field*10.0)-0.5);
  float line=1.0-smoothstep(0.008,0.020,edge);
  vec3 paper=vec3(0.904,0.912,0.879);
  vec3 forest=vec3(0.020,0.032,0.017);
  vec3 base=mix(paper,forest,uPhase);
  base=mix(base,mix(vec3(0.59,0.63,0.54),vec3(0.14,0.19,0.10),uPhase),line*0.21);
  gl_FragColor=vec4(base,1.0);
  #include <colorspace_fragment>
}
`

export const rangerCompositeFragment = /* glsl */ `
precision highp float;
uniform sampler2D uPortraitFrame;
uniform sampler2D uHelmetFrame;
uniform sampler2D uFluid;
uniform vec2 uViewport;
uniform vec4 uRect;
uniform float uRangerEnabled;
uniform float uHelmetToneMapping;
uniform float uRangerAmount;
uniform float uReveal;
varying vec2 vUv;
void main(){
  vec4 portrait=texture2D(uPortraitFrame,vUv);
  vec4 helmet=texture2D(uHelmetFrame,vUv);
  vec2 screenUv=(uRect.xy+vUv*uRect.zw)/uViewport;
  float density=texture2D(uFluid,screenUv).r;
  // The real helmet silhouette supplies the boundary. The head has no exclusion mask.
  float pointerMask=smoothstep(0.10,0.61,density)*uReveal;
  float reveal=mix(pointerMask,1.0,uRangerAmount)*uRangerEnabled;
  vec3 helmetColour=helmet.rgb/max(helmet.a,0.001);
  #ifdef TONE_MAPPING
    if(uHelmetToneMapping>0.5)helmetColour=toneMapping(helmetColour);
  #endif
  gl_FragColor=vec4(mix(portrait.rgb,helmetColour,clamp(helmet.a*reveal,0.0,1.0)),portrait.a);
  #include <colorspace_fragment>
}
`
