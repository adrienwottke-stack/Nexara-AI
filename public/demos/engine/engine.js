var r0=Object.defineProperty;var ha=(i,e,t)=>()=>{if(t)throw t[0];try{return i&&(e=i(i=0)),e}catch(n){throw t=[n],n}};var da=(i,e)=>{for(var t in e)r0(i,t,{get:e[t],enumerable:!0})};var xm={};da(xm,{default:()=>Z_});var Z_,ym=ha(()=>{Z_=`import * as T from 'three';
import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {CYLINDER_X} from './engine-3d-model';
import {createEngineMaterial} from './engine-material-profiles';
import {castingEase,castRibWithRoot,clipCastingAtZ} from './engine-casting-blends';

type BlockInputs={deck:number;boreScale:number;cutaway?:boolean;materials:{machined:T.Material;steel:T.Material;black:T.Material}};
const TAU=Math.PI*2;
function rounded(x:number,y:number,w:number,h:number,r:number){
  const s=new T.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s;
}
function hole(shape:T.Shape,x:number,y:number,r:number){const p=new T.Path();p.absarc(x,y,r,0,TAU,true);shape.holes.push(p);}
function slot(shape:T.Shape,x:number,y:number,w:number,h:number){const p=rounded(x,y,w,h,Math.min(w,h)*.42);shape.holes.push(new T.Path(p.getPoints(10).reverse()));}
function alongX(shape:T.Shape,length:number){const g=new T.ExtrudeGeometry(shape,{depth:length,steps:1,bevelEnabled:false,curveSegments:24});g.applyMatrix4(new T.Matrix4().set(0,0,1,-length/2,1,0,0,0,0,1,0,0,0,0,0,1));return g;}
function upward(shape:T.Shape,base:number,height:number,steps=1){const g=new T.ExtrudeGeometry(shape,{depth:height,steps,bevelEnabled:false,curveSegments:32});g.rotateX(Math.PI/2);g.translate(0,base+height,0);return g;}

/** Photo-informed bare M54B30 block. Fixed cylinder centres and deck datum
 * retain the existing mechanism contract; outer cast dimensions are authored. */
export function createM54Block({deck,boreScale,cutaway=false,materials:m}:BlockInputs){
  const root=new T.Group();root.name='M54B30 Block nach Fotoreferenz';
  const cast=createEngineMaterial(0xffffff,.45,.68,'cast-aluminium');cast.vertexColors=true;
  const iron=new T.MeshStandardMaterial({color:0x52595a,metalness:.48,roughness:.42});
  const featureNames:string[]=[];
  const mesh=(geometry:T.BufferGeometry,material:T.Material,x=0,y=0,z=0,name='')=>{
    if(material===cast){
      const p=geometry.getAttribute('position'),colors=new Float32Array(p.count*3),base=new T.Color(0x9b9e99),shade=new T.Color();
      for(let i=0;i<p.count;i++){const a=p.getX(i)+x,b=p.getY(i)+y,c=p.getZ(i)+z;const grain=Math.sin(a*1.71+b*2.23+c*.93)*Math.sin(a*.81-b*1.37+c*2.61);shade.copy(base).multiplyScalar(.96+grain*.045+.025*Math.sin(a*.033+b*.059));shade.toArray(colors,i*3);}
      geometry.setAttribute('color',new T.BufferAttribute(colors,3));
    }
    const part=new T.Mesh(geometry,material);part.position.set(x,y,z);part.name=name;root.add(part);if(name)featureNames.push(name);return part;
  };
  const cyl=(r:number,h:number,material:T.Material,x:number,y:number,z:number,axis:'x'|'y'|'z'='y',segments=32)=>{const p=mesh(new T.CylinderGeometry(r,r,h,segments),material,x,y,z);if(axis==='x')p.rotation.z=Math.PI/2;if(axis==='z')p.rotation.x=Math.PI/2;return p;};
  const rib=(a:number[],b:number[],width:number,depth:number)=>{
    const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
    const g=new T.ExtrudeGeometry(rounded(-width/2,-delta.length()/2,width,delta.length(),Math.min(width*.4,2.5)),{depth,bevelEnabled:true,bevelThickness:.7,bevelSize:.7,bevelSegments:2,curveSegments:6});g.translate(0,0,-depth/2);
    const p=mesh(g,cast);p.position.copy(start.add(end).multiplyScalar(.5));p.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return p;
  };
  const boss=(x:number,y:number,z:number,outer:number,inner:number,length:number)=>{
    const profile=[[outer,-length/2],[outer,length/2],[inner,length/2],[inner,-length/2],[outer,-length/2]];
    const g=new T.LatheGeometry(profile.map(([r,t])=>new T.Vector2(r,t)),28);g.rotateX(Math.PI/2);return mesh(g,cast,x,y,z);
  };
  const bore=42*boreScale,linerOuter=bore+2.5,wall=Math.max(77,linerOuter+30),jacket=Math.max(57,linerOuter+12);
  const fieldRadius=(y:number)=>wall+13-19*castingEase((y-35)/65);
  const skirtRadius=(y:number)=>{const t=T.MathUtils.clamp((-98+Math.sqrt(Math.max(0,98*98+56*(76-y))))/28,0,1);return wall-19+8*t-3*t*t;};
  const plan=(water:boolean)=>{
    const s=new T.Shape();s.moveTo(-314,-wall+7);s.quadraticCurveTo(-314,-wall,-306,-wall);
    for(let x=-300;x<=300;x+=5)s.lineTo(x,-wall-5.5*Math.cos((x+250)/100*TAU)-34*Math.exp(-Math.pow((x+270)/31,4)));
    s.quadraticCurveTo(314,-wall,314,-wall+8);s.lineTo(314,wall-8);s.quadraticCurveTo(314,wall,306,wall);
    for(let x=300;x>=-300;x-=5)s.lineTo(x,wall+3.8*Math.cos((x+250)/100*TAU));
    s.quadraticCurveTo(-314,wall,-314,wall-8);s.closePath();
    for(const x of CYLINDER_X){hole(s,x,0,linerOuter);if(water)for(const side of [-1,1]){
      // Paired oblique coolant windows leave the wider bolt lands seen in the
      // close-up deck photographs, instead of one straight slot per cylinder.
      for(const dx of [-19,19]){const p=rounded(-12,-4,24,8,3),path=new T.Path(p.getPoints(10).reverse().map(v=>v.rotateAround(new T.Vector2(),side*Math.sign(dx)*.32).add(new T.Vector2(x+dx,side*jacket))));s.holes.push(path);}
    }}
    slot(s,-287,-103,32,28);
    for(let x=-300;x<=300;x+=100)for(const side of [-1,1])hole(s,x,side*(wall-15),5.2);
    return s;
  };
  const barrel=upward(plan(true),91,deck-96,16),barrelPositions=barrel.getAttribute('position');
  for(let i=0;i<barrelPositions.count;i++){
    const x=barrelPositions.getX(i),y=barrelPositions.getY(i),z=barrelPositions.getZ(i),weight=T.MathUtils.clamp((Math.abs(z)-(wall-7))/4,0,1);
    const t=T.MathUtils.clamp((y-91)/(deck-96),0,1),bulge=Math.sin(t*Math.PI)*(3+12*Math.cos((x+250)/100*TAU));
    // The lower edge falls into the cast saddles at each barrel and rises
    // between them, exposing the recessed gallery behind the overhanging lip.
    const castY=y-(1-t)*(1-t)*(9+12*Math.cos((x+250)/100*TAU));
    const blend=(1-castingEase(t/.34))*castingEase((x+236)/16)*(1-castingEase((x-170)/15));
    const outer=z+Math.sign(z)*weight*bulge,target=Math.sign(z)*fieldRadius(castY);
    barrelPositions.setZ(i,outer+(target-outer)*blend*weight);
    barrelPositions.setY(i,castY);
  }
  barrel.deleteAttribute('normal');const roundedBarrel=mergeVertices(barrel,1e-4);roundedBarrel.computeVertexNormals();barrel.dispose();
  mesh(roundedBarrel,cast,0,0,0,'Geschwungener Aluminium Zylinderkasten');
  mesh(upward(plan(true),deck-5,5),m.machined,0,0,0,'Bearbeitete Deckfl\xE4che und K\xFChlmantel\xF6ffnungen');
  for(const x of CYLINDER_X){
    const profile=[[linerOuter,91],[linerOuter,deck-.6],[linerOuter-.5,deck],[bore,deck],[bore,91]];
    const liner=new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),56);
    mesh(liner,iron,x,0,0,'Eingegossene Grauguss Laufbuchse');
    if(cutaway)for(const side of [-1,1]){
      // Intersect the actual faceted rings, including the top chamfer. These
      // two wall strips join the existing iron batch before the common cut.
      const p=liner.getAttribute('position'),stride=profile.length,contour:T.Vector2[]=[];
      for(let row=0;row<stride;row++)for(let segment=0;segment<liner.parameters.segments;segment++){
        const a=segment*stride+row,b=a+stride,za=p.getZ(a),zb=p.getZ(b);
        if((za-16)*(zb-16)>0||Math.abs(zb-za)<1e-8)continue;
        const t=(16-za)/(zb-za),px=p.getX(a)+(p.getX(b)-p.getX(a))*t;
        if(px*side>0){contour.push(new T.Vector2(px,p.getY(a)));break;}
      }
      if(contour.length!==stride)throw new Error('Laufbuchsen-Schnittkontur ist unvollst\xE4ndig.');
      const cap=new T.ShapeGeometry(new T.Shape(contour));cap.translate(0,0,16);
      mesh(cap,iron,x,0,0,'Geschlossene Laufbuchsen-Schnittfl\xE4che');
    }
  }
  // A hollow lower skirt: its outer wall steps out below the cylinder jacket,
  // while the real recesses remain behind the cast grid instead of painted lines.
  for(const side of [-1,1]){
    const s=new T.Shape();s.moveTo(94,side*(wall-7));s.lineTo(76,side*(wall-1));s.quadraticCurveTo(27,side*(wall+3),-36,side*(wall+4));s.lineTo(-47,side*(wall+7));s.lineTo(-50,side*(wall+5));s.lineTo(-50,side*(wall-8));s.lineTo(-35,side*(wall-11));s.lineTo(43,side*(wall-12));s.lineTo(91,side*(wall-18));s.closePath();
    mesh(alongX(s,628),cast,0,0,-side*18,'Zur\xFCckliegende Kurbelgeh\xE4usewand hinter tiefen Gusstaschen');
    // A broad middle casting grows into the upper barrels. The triangular
    // negative spaces have actual depth through to the recessed skirt wall.
    const saddle=rounded(-236,25,421,83,6);
    for(const x of [-218,-118,-18,82])slot(saddle,x,75,35,18);
    for(const x of [-177,-77,23,123])slot(saddle,x,40,12,20);
    const saddleGeometry=new T.ExtrudeGeometry(saddle,{depth:16,bevelEnabled:true,bevelSize:2.5,bevelThickness:2.5,bevelSegments:3,curveSegments:10});
    const saddlePositions=saddleGeometry.getAttribute('position');
    for(let i=0;i<saddlePositions.count;i++)saddlePositions.setZ(i,saddlePositions.getZ(i)-side*19*castingEase((saddlePositions.getY(i)-35)/65));
    saddleGeometry.computeVertexNormals();
    mesh(saddleGeometry,cast,0,0,side<0?-wall-13:wall-3,'Breite Gussfelder mit tiefen Galerietaschen');
    const z=side*(wall+10);
    // The B30 photograph has stepped bays, a dense front ladder and a broad
    // triangulated rear bay, rather than a cylinder-pitch rectangular grid.
    for(const y of [-36,-7,24])rib([-301,y,z],[282,y+(y===24?8:0),z],5.5,8);
    rib([-300,25,z],[104,25,z],8,12);rib([104,25,z],[296,40,z],9,12);
    const piers=[[-296,-286,80],[-255,-249,39],[-212,-205,55],[-163,-158,88],[-112,-108,57],[-61,-58,83],[0,5,57],[55,60,89],[108,113,63],[172,180,85]];
    for(const [bottom,top,height] of piers){
      const a=[bottom,-37,z],b=[top,Math.min(height,49),z];
      if(bottom===-163||bottom===55)mesh(castRibWithRoot(a,b,9,18,(_x,y)=>skirtRadius(y),5),cast,0,0,0,'Auslaufender Hauptrippenfu\xDF');
      else rib(a,b,6,18);
    }
    for(const [x,y] of [[-286,-34],[-207,-31],[-158,50],[-108,-34],[-58,51],[5,-33],[60,52],[113,-34],[180,-30]])boss(x,y,side*(wall+15),7.1,3.1,11);
    rib([109,94,z],[298,deck-28,side*(wall+4)],12,12);
    rib([172,51,z],[299,-33,z],11,12);
    // Broad cast shoulders connect the mounting pads into the skirt.
    for(const x of [-173,156])for(const dx of [-23,23]){
      const a=[x+dx,92,side*(wall+3)],b=[x+dx*.65,35,side*(wall+15)];
      if(x===156)mesh(castRibWithRoot(a,b,14,18,(_x,y)=>fieldRadius(y),5.5),cast,0,0,0,'Weich angebundene Tr\xE4gerschulter');
      else rib(a,b,14,18);
    }
    // Machined sump ledge and mounting ears are part of the block, not a pan.
    const ledge=rounded(-315,-wall-13,630,13,3);
    for(let x=-295;x<=295;x+=59)hole(ledge,x,-wall-6,2.8);
    const rail=upward(ledge,-50,5);if(side>0)rail.rotateY(Math.PI);mesh(rail,m.machined);
    for(const x of [-173,156]){
      const mounting=rounded(x-29,41,58,30,5);for(const dx of [-18,18])hole(mounting,x+dx,56,4.2);
      const g=new T.ExtrudeGeometry(mounting,{depth:13,bevelEnabled:true,bevelSize:1,bevelThickness:1,bevelSegments:2,curveSegments:12});
      mesh(g,cast,0,0,side<0?-wall-24:wall+11,'Motortr\xE4ger Auflage');
    }
  }
  // Intake face, traced from the naked block photo: two sensor bosses and the
  // large oil-filter/auxiliary mounting pad at the front, with cored openings.
  for(const x of [-155,154])boss(x,deck-62,-wall-28,14,4.6,20);
  boss(-17,deck-80,-wall-6,8,3.1,10);
  // Photo view 1: irregular oil-filter support flange, three unequal galleries.
  const pad=new T.Shape();pad.moveTo(-307,137);pad.lineTo(-253,137);pad.quadraticCurveTo(-246,137,-246,128);pad.lineTo(-233,104);pad.lineTo(-227,70);pad.quadraticCurveTo(-227,61,-239,61);pad.lineTo(-277,61);pad.lineTo(-281,79);pad.lineTo(-295,79);pad.lineTo(-298,113);pad.lineTo(-307,117);pad.closePath();
  slot(pad,-296,117,40,11);slot(pad,-288,92,38,13);slot(pad,-271,70,33,12);
  for(const [x,y] of [[-300,129],[-253,129],[-289,84],[-236,69]])hole(pad,x,y,3.4);
  mesh(new T.ExtrudeGeometry(pad,{depth:15,bevelEnabled:true,bevelSize:1,bevelThickness:1,bevelSegments:2,curveSegments:20}),m.machined,0,0,-wall-47,'Anschlussflansch an der Ansaugseite');
  mesh(new T.PlaneGeometry(70,77),m.black,-269.5,99,-wall-8).rotation.y=Math.PI;
  // Four small crosshatched foundry pads are visible between the major ribs.
  for(const x of [-208,-72,66,156]){
    const y=49,surface=(height:number)=>-fieldRadius(height)-1;
    for(const slope of [-.65,.65])for(const offset of [-15,-7.5,0,7.5,15]){
      let a=-11,b=11;
      if(slope>0){a=Math.max(a,(-17-offset)/slope);b=Math.min(b,(17-offset)/slope);}else{a=Math.max(a,(17-offset)/slope);b=Math.min(b,(-17-offset)/slope);}
      if(b>a)rib([x+offset+slope*a,y+a,surface(y+a)],[x+offset+slope*b,y+b,surface(y+b)],1.1,1.8);
    }
  }
  // End faces and seven main-bearing webs retain a genuinely open crank axis.
  for(const x of [-310,310]){
    // Asymmetric end casting: flat deck, outboard round gallery, narrow waist
    // and separate crank opening. Not a symmetric rounded rectangle.
    const face=new T.Shape();
    if(x<0){face.moveTo(-49,-wall-7);face.lineTo(deck,-wall-7);face.lineTo(deck,wall-7);face.quadraticCurveTo(deck-10,wall+2,deck-30,wall+5);face.quadraticCurveTo(158,wall+44,120,wall+40);face.quadraticCurveTo(82,wall+40,69,wall+10);face.lineTo(49,wall+8);face.lineTo(29,wall-3);face.lineTo(-23,wall+1);face.lineTo(-49,wall+9);}
    else{face.moveTo(-49,-wall-12);face.lineTo(-18,-wall-9);face.quadraticCurveTo(17,-wall+3,46,-wall+25);face.lineTo(123,-wall+25);face.lineTo(131,-wall-5);face.lineTo(deck,-wall-5);face.lineTo(deck,wall-5);face.lineTo(131,wall-5);face.lineTo(123,wall-25);face.lineTo(46,wall-25);face.quadraticCurveTo(17,wall-3,-18,wall+9);face.lineTo(-49,wall+12);}
    face.closePath();hole(face,0,0,19);
    slot(face,43,-29,25,31);
    for(const y of [-28,48,deck-22])for(const z of [-wall+11,wall-11])hole(face,y,z,3.5);
    mesh(alongX(face,9),cast,x,0,0,'Stirnfl\xE4che mit Kurbelwellen\xF6ffnung');
    // Recessed side-gallery rim is part of the end casting, not an extra bolt.
    const gallery=new T.Shape();gallery.absellipse(124,wall+3,42,36,0,TAU,false,0);const opening=new T.Path();opening.absellipse(124,wall+3,34,28,0,TAU,true,0);gallery.holes.push(opening);
    if(x<0)mesh(alongX(gallery,13),cast,x,0,0,'Vorderer Stirnflansch mit Galerierand');
  }
  for(let i=0;i<7;i++){
    const frame=new T.Shape();frame.moveTo(-27,-65);frame.lineTo(12,-65);frame.quadraticCurveTo(55,-56,78,-47);frame.lineTo(78,47);frame.quadraticCurveTo(55,56,12,65);frame.lineTo(-27,65);frame.closePath();hole(frame,0,0,18);
    mesh(alongX(frame,10),cast,-300+i*100,0,0,'Hauptlagersteg');
  }
  root.userData={reference:'User reference ebay 178183100002, 16 inspected photos; dealer-assigned M54B30',featureNames,illustrative:true,boreMm:bore*2,cutaway,cutPlaneZ:cutaway?16:null};
  // All fixed casting detail shares four material batches.
  const batches=new Map<T.Material,T.Mesh[]>();
  for(const child of root.children)if(child instanceof T.Mesh){const material=child.material as T.Material;const parts=batches.get(material)??[];parts.push(child);batches.set(material,parts);}
  for(const [material,parts] of batches){
    if(parts.length<2)continue;
    const geometries=parts.map(part=>{part.updateMatrix();return (part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone()).applyMatrix4(part.matrix);});
    const combined=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!combined)throw new Error('Blockgeometrie konnte nicht geb\xFCndelt werden.');
    parts.forEach(part=>{part.removeFromParent();part.geometry.dispose();});const batch=new T.Mesh(combined,material);batch.name=material===cast?'Aluminium Gusskontur und Rippen':'Bearbeitete Blockfl\xE4chen';root.add(batch);
  }
  if(cutaway){
    // Trim actual triangles on the observer side. A material clipping plane
    // would depend on global renderer state and could silently close the view.
    for(const child of root.children)if(child instanceof T.Mesh){
      const original=child.geometry;child.geometry=clipCastingAtZ(original);original.dispose();
    }
    // Solid section faces between the cylinder arcs keep wall thickness legible.
    const span=Math.sqrt(linerOuter*linerOuter-16*16),intervals:number[][]=[];let start=-314;
    for(const x of CYLINDER_X){intervals.push([start,x-span]);start=x+span;}intervals.push([start,314]);
    const caps=intervals.filter(([a,b])=>b>a).map(([a,b])=>new T.BoxGeometry(b-a,deck-91,.7).toNonIndexed().translate((a+b)/2,(deck+91)/2,16));
    // Close the bearing-web section, keeping the real crank opening free.
    const bearingLip=Math.sqrt(18*18-16*16);
    for(let i=0;i<7;i++)for(const [a,b] of [[-27,-bearingLip],[bearingLip,78]])caps.push(new T.BoxGeometry(10,b-a,.7).toNonIndexed().translate(-300+i*100,(a+b)/2,16));
    const cutFaces=mergeGeometries(caps)!;caps.forEach(g=>g.dispose());mesh(cutFaces,m.machined,0,0,0,'Bearbeitete Schnittkanten');
    root.name='M54B30 gemeinsamer Gussblock im Schnitt';
  }
  return root;
}
`});var bm={};da(bm,{default:()=>j_});var j_,vm=ha(()=>{j_=`import * as T from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';

/** Bounded C1 shoulder easing, with the same end points as a linear ramp. */
export function castingEase(t:number){const u=T.MathUtils.clamp(t,0,1);return u*u*(3-2*u);}

/** Geometric section shared by block and aluminium head, independent of the
 * renderer's clipping state. All material/batching attributes survive. */
export function clipCastingAtZ(input:T.BufferGeometry,plane=16){
  input.computeBoundingBox();
  if(input.boundingBox!.max.z<=plane)return input.clone();
  if(input.boundingBox!.min.z>plane){const empty=new T.BufferGeometry();for(const [name,a] of Object.entries(input.attributes))empty.setAttribute(name,new T.Float32BufferAttribute([],a.itemSize));empty.computeBoundingSphere();return empty;}
  const source=input.index?input.toNonIndexed():input.clone();
  const attributes=Object.entries(source.attributes) as [string,T.BufferAttribute][];
  const output=new Map(attributes.map(([name])=>[name,[] as number[]]));
  const p=source.getAttribute('position');
  for(let i=0;i<p.count;i+=3){
    const polygon=[0,1,2].map(k=>Object.fromEntries(attributes.map(([name,a])=>[name,Array.from({length:a.itemSize},(_,j)=>a.array[(i+k)*a.itemSize+j])])));
    const clipped:typeof polygon=[];
    for(let k=0;k<3;k++){
      const a=polygon[k],b=polygon[(k+1)%3],insideA=a.position[2]<=plane,insideB=b.position[2]<=plane;
      if(insideA)clipped.push(a);
      if(insideA!==insideB){const t=(plane-a.position[2])/(b.position[2]-a.position[2]);clipped.push(Object.fromEntries(attributes.map(([name])=>[name,a[name].map((v,j)=>v+(b[name][j]-v)*t)])));}
    }
    for(let k=1;k+1<clipped.length;k++)for(const vertex of [clipped[0],clipped[k],clipped[k+1]])for(const [name] of attributes)output.get(name)!.push(...vertex[name]);
  }
  const result=new T.BufferGeometry();for(const [name,a] of attributes)result.setAttribute(name,new T.Float32BufferAttribute(output.get(name)!,a.itemSize));
  result.computeBoundingSphere();source.dispose();return result;
}

/** Replace an existing rib by a shallow sweep with a quarter-circle root.
 * Crest, centreline and rounded longitudinal ends retain the authored rib.
 * Only its foot grows into the backing skin; there is no new parallel rib. */
export function castRibWithRoot(a:number[],b:number[],width:number,depth:number,backing:(x:number,y:number)=>number,radius=5){
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),side=Math.sign(a[2])||1;
  if(length<1||width<=0||depth<=0||radius<=0)throw new Error('Ung\xFCltiger Gussrippenquerschnitt');
  const ux=dy/length,uy=-dx/length,alongX=dx/length,alongY=dy/length,half=width/2;
  const shape=new T.Shape(),r=Math.min(width*.4,2.5),low=-length/2,high=length/2;
  shape.moveTo(-half+r,low);shape.lineTo(half-r,low);shape.quadraticCurveTo(half,low,half,low+r);
  for(let y=low+r+6;y<high-r;y+=6)shape.lineTo(half,y);
  shape.lineTo(half,high-r);shape.quadraticCurveTo(half,high,half-r,high);shape.lineTo(-half+r,high);shape.quadraticCurveTo(-half,high,-half,high-r);
  for(let y=high-r-6;y>low+r;y-=6)shape.lineTo(-half,y);
  shape.lineTo(-half,low+r);shape.quadraticCurveTo(-half,low,-half+r,low);shape.closePath();
  const geometry=new T.ExtrudeGeometry(shape,{depth:1,steps:14,bevelEnabled:false,curveSegments:6}),p=geometry.getAttribute('position');
  for(let i=0;i<p.count;i++){
    const u=p.getX(i),v=p.getY(i)+length/2,t=T.MathUtils.clamp(v/length,0,1),x=a[0]+alongX*v,y=a[1]+alongY*v;
    const crest=side*(a[2]+(b[2]-a[2])*t)+depth/2,base=Math.min(backing(x,y)-.25,crest-1.5),height=crest-base;
    const q=Math.pow(side<0?1-p.getZ(i):p.getZ(i),2),out=q*height,fillet=Math.min(radius,height*.65);
    const flare=out<fillet?fillet-Math.sqrt(Math.max(0,fillet*fillet-(fillet-out)*(fillet-out))):0;
    // Longitudinal fade avoids growing across the existing rounded end lands.
    const endFade=castingEase(v/9)*castingEase((length-v)/9),spread=u*(1+flare/half*endFade);
    p.setXYZ(i,x+ux*spread,y+uy*spread,side*(base+out));
  }
  geometry.deleteAttribute('normal');const result=mergeVertices(geometry,1e-4);geometry.dispose();result.computeVertexNormals();result.computeBoundingSphere();return result;
}
`});var _m={};da(_m,{default:()=>J_});var J_,Mm=ha(()=>{J_=`import {shaftGeometry,cycleSample,valveSample,type ValveCurves} from './native-view';
import {mod,TAU} from './model';
import type {ViewState} from './drawing';
import type {Config} from './model';
import {PISTON_SPEC} from './piston-spec';

export const CYLINDER_X=[-250,-150,-50,50,150,250];
export type Medium='air'|'fuel'|'exhaust'|'water'|'oil';
export type PipeMode='solid'|'transparent'|'flow'|'off';
export type EnginePresentation='closed'|'cutaway'|'flow';
export function presentationVisibility(presentation:EnginePresentation){
  return {mechanical:presentation==='cutaway',extras:presentation!=='flow',housing:presentation!=='flow',closedHousing:presentation==='closed',cutHousing:presentation==='cutaway',media:presentation!=='closed',pipes:presentation!=='flow',combustion:presentation!=='closed',floor:presentation!=='flow'};
}
export const MEDIA:{id:Medium;name:string;color:number}[]=[
  {id:'air',name:'Luft',color:0x377fff},{id:'fuel',name:'Benzin',color:0xecc575},
  {id:'exhaust',name:'Abgas',color:0xeda179},{id:'water',name:'Wasser',color:0x75b8e1},{id:'oil',name:'\xD6l',color:0xc9b579}
];
export function pipeVisibility(mode:PipeMode){return {pipe:mode==='solid'||mode==='transparent',flow:mode!=='off',opacity:mode==='transparent'?.16:1};}
export function mechanismPose(angle:number,cylinder:number,cfg:Config,state:ViewState|null){
  const g=shaftGeometry(angle,cylinder,cfg,state),x=CYLINDER_X[cylinder-1];
  return {piston:[x,-g.pistonY,0] as const,pin:[x,-g.crankY,g.crankX] as const,rotation:Math.atan2(g.crankX,-g.crankY)};
}
/** Illustration dimensions share the native wrist-pin, rod and crank datum. */
export function assemblyDimensions(cfg:Config){
  const crankRadius=cfg.engine.strokeMm/2,deck=cfg.engine.rodMm+crankRadius+PISTON_SPEC.compressionHeightMm+PISTON_SPEC.illustrativeCrownClearanceMm;
  return {deck,headOffset:deck-205,boreScale:cfg.engine.boreMm/84,crankRadius};
}
/** The head seat stays fixed; the retainer moves down and compresses the spring. */
export function valveSpringPose(lift:number){
  const travel=Number.isFinite(lift)?Math.max(0,Math.min(32,lift)):0;
  const bottom=215,top=249-travel;
  return {bottom,top,center:(bottom+top)/2,length:top-bottom};
}
/** Radial lift illustration; build once per curve set, rotate by crank angle / 2. */
export function camProfileRadius(curves:ValveCurves|null|undefined,cylinder:number,type:0|1,phi:number){
  const lift=valveSample(curves?{valveCurves:curves}:null,2*(Math.PI-phi),cylinder);
  return 12+(type===0?lift?.intakeLiftMm??0:lift?.exhaustLiftMm??0);
}
/** Native gas signs / thermal branch flow. Oil is a direction illustration only. */
export function flowActivity(medium:Medium,cylinder:number|undefined,branch:string,state:ViewState|null,cfg:Config,angle:number){
  if(!state)return 0;
  if(medium==='water'){
    if(state.thermalHalted)return 0;
    // The M52 workshop shows a mechanically driven pump. Thermal-only callers
    // can omit RPM; a connected motor at rest must not show pumped circulation.
    if(state.rpm!==undefined&&state.rpm<5)return 0;
    const total=cfg.cooling.flowLMin,rad=Math.max(0,Math.min(total,state.radiatorFlowLMin??0));
    if(branch==='expansion-vent'||branch==='expansion-return')return 0;
    return branch.startsWith('radiator')?rad:branch==='bypass'?total-rad:total;
  }
  if(medium==='oil')return (state.rpm??0)>5?1:0;
  if((state.rpm??0)<5)return 0;
  const cylinders=cylinder?[cylinder]:medium==='exhaust'&&branch.endsWith('-front')?[1,2,3]:medium==='exhaust'&&branch.endsWith('-rear')?[4,5,6]:[1,2,3,4,5,6];
  const samples=cylinders.map(id=>cycleSample(state,angle,id,true));
  if(medium==='fuel')return state.ignition?samples.reduce((sum,s)=>sum+Math.max(0,s?.intakeMolS??0),0):0;
  return samples.reduce((sum,s)=>sum+(medium==='air'?(s?.intakeMolS??0):(s?.exhaustMolS??0)),0);
}

/** The flame front is indexed into the same recorded native 720\xB0 cycle as the
 * piston and valves. No independent cylinder offsets or synthetic firing order. */
export function combustionAppearance(state:ViewState|null,angle:number,cylinder:number){
  const sample=cycleSample(state,angle,cylinder,true),running=(state?.rpm??0)>5;
  const burning=running&&state?.ignition!==false&&!!sample?.burning;
  const cycle=state?.cycles?.find(item=>item.cylinder===cylinder)??(state?.cycle?.cylinder===cylinder?state.cycle:undefined);
  let progress=0;
  if(burning&&cycle?.samples.length){
    const rows=cycle.samples,count=rows.length,position=mod(angle,TAU*2)/(TAU*2)*count,index=Math.floor(position);
    let before=0,after=0;
    while(before<count-1&&rows[mod(index-before-1,count)]?.[6])before++;
    while(after<count-before-1&&rows[(index+after+1)%count]?.[6])after++;
    progress=Math.max(.02,Math.min(1,(before+(position-index))/(before+after+1)));
  }
  const heat=sample?Math.max(0,Math.min(1,(sample.gasTemperatureK-400)/1900)):0;
  const pressure=sample?Math.max(0,Math.min(1,(sample.pressureKpa-100)/4200)):0;
  const intake=running?Math.max(0,sample?.intakeMolS??0):0,exhaust=running?Math.max(0,sample?.exhaustMolS??0):0;
  let afterNativeBurn=false;
  if(!burning&&cycle?.samples.length){
    const rows=cycle.samples,count=rows.length,index=Math.floor(mod(angle,TAU*2)/(TAU*2)*count);
    // Hot compression must not be labeled combustion expansion. Look backward
    // only through the recorded native cycle until burn or an open gas valve.
    for(let step=1;step<count;step++){
      const row=rows[mod(index-step,count)];if(!row)break;
      if(row[6]){afterNativeBurn=true;break;}
      if(row[2]>.05||row[3]>.05||row[4]>1e-6||row[5]>1e-6)break;
    }
  }
  const stage: 'idle'|'intake'|'compression'|'kernel'|'front'|'expansion'|'exhaust'=burning?(progress<.16?'kernel':'front'):exhaust>1e-6?'exhaust':intake>1e-6?'intake':running&&heat>.15&&afterNativeBurn?'expansion':running&&!!sample?'compression':'idle';
  return {available:!!sample,burning,progress,heat,pressure,intake,exhaust,stage};
}
`});var Tm={};da(Tm,{default:()=>$_});var $_,Sm=ha(()=>{$_=`{\r
  "name": "engine-playground",\r
  "version": "0.4.4",\r
  "lockfileVersion": 3,\r
  "requires": true,\r
  "packages": {\r
    "": {\r
      "name": "engine-playground",\r
      "version": "0.4.4",\r
      "dependencies": {\r
        "three": "^0.186.1"\r
      },\r
      "devDependencies": {\r
        "@playwright/test": "^1.56.0",\r
        "@types/node": "^24.0.0",\r
        "@types/three": "^0.186.0",\r
        "tsx": "^4.20.0",\r
        "typescript": "^5.9.0",\r
        "vite": "^7.1.0"\r
      }\r
    },\r
    "node_modules/@dimforge/rapier3d-compat": {\r
      "version": "0.12.0",\r
      "resolved": "https://registry.npmjs.org/@dimforge/rapier3d-compat/-/rapier3d-compat-0.12.0.tgz",\r
      "integrity": "sha512-uekIGetywIgopfD97oDL5PfeezkFpNhwlzlaEYNOA0N6ghdsOvh/HYjSMek5Q2O1PYvRSDFcqFVJl4r4ZBwOow==",\r
      "dev": true,\r
      "license": "Apache-2.0"\r
    },\r
    "node_modules/@esbuild/aix-ppc64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz",\r
      "integrity": "sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==",\r
      "cpu": [\r
        "ppc64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "aix"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/android-arm": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz",\r
      "integrity": "sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==",\r
      "cpu": [\r
        "arm"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "android"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/android-arm64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz",\r
      "integrity": "sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "android"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/android-x64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz",\r
      "integrity": "sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "android"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/darwin-arm64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz",\r
      "integrity": "sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "darwin"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/darwin-x64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz",\r
      "integrity": "sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "darwin"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/freebsd-arm64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz",\r
      "integrity": "sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "freebsd"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/freebsd-x64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz",\r
      "integrity": "sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "freebsd"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/linux-arm": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz",\r
      "integrity": "sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==",\r
      "cpu": [\r
        "arm"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/linux-arm64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz",\r
      "integrity": "sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/linux-ia32": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz",\r
      "integrity": "sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==",\r
      "cpu": [\r
        "ia32"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/linux-loong64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz",\r
      "integrity": "sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==",\r
      "cpu": [\r
        "loong64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/linux-mips64el": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz",\r
      "integrity": "sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==",\r
      "cpu": [\r
        "mips64el"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/linux-ppc64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz",\r
      "integrity": "sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==",\r
      "cpu": [\r
        "ppc64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/linux-riscv64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz",\r
      "integrity": "sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==",\r
      "cpu": [\r
        "riscv64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/linux-s390x": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz",\r
      "integrity": "sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==",\r
      "cpu": [\r
        "s390x"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/linux-x64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz",\r
      "integrity": "sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/netbsd-arm64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz",\r
      "integrity": "sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "netbsd"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/netbsd-x64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz",\r
      "integrity": "sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "netbsd"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/openbsd-arm64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz",\r
      "integrity": "sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "openbsd"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/openbsd-x64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz",\r
      "integrity": "sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "openbsd"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/openharmony-arm64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz",\r
      "integrity": "sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "openharmony"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/sunos-x64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz",\r
      "integrity": "sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "sunos"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/win32-arm64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz",\r
      "integrity": "sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "win32"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/win32-ia32": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz",\r
      "integrity": "sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==",\r
      "cpu": [\r
        "ia32"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "win32"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@esbuild/win32-x64": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz",\r
      "integrity": "sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "win32"\r
      ],\r
      "engines": {\r
        "node": ">=18"\r
      }\r
    },\r
    "node_modules/@napi-rs/lzma-linux-x64-gnu": {\r
      "version": "1.5.1",\r
      "resolved": "https://registry.npmjs.org/@napi-rs/lzma-linux-x64-gnu/-/lzma-linux-x64-gnu-1.5.1.tgz",\r
      "integrity": "sha512-oTXEIha4SsuXdTA4Iyskj0kpdx2yVXdhd75c2v3xGrHFfVMsbhTPZU/nMPL4sWKo4pBHm3aucLaqGlF696dTyQ==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "glibc"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ],\r
      "engines": {\r
        "node": "^22.20 || ^24.12 || >=25"\r
      }\r
    },\r
    "node_modules/@playwright/test": {\r
      "version": "1.64.0",\r
      "resolved": "https://registry.npmjs.org/@playwright/test/-/test-1.64.0.tgz",\r
      "integrity": "sha512-oTN9FNYuN6bqQMwiho6jJKLCG2/QOYCixGXuCjRmzOq23eODeukuY2XiAVoVpAECbuezMt1MHQjAiQxK8F+Y+g==",\r
      "dev": true,\r
      "license": "Apache-2.0",\r
      "dependencies": {\r
        "playwright": "1.64.0"\r
      },\r
      "bin": {\r
        "playwright": "cli.js"\r
      },\r
      "engines": {\r
        "node": ">=20"\r
      }\r
    },\r
    "node_modules/@rollup/rollup-android-arm-eabi": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.64.6.tgz",\r
      "integrity": "sha512-FkO19Fowv/OQeJZPVfdetJaI3/VpbZmBsnmAlR/rQ+b3QwfiGQiOpVegpSRH331kelvHTVw9hXYG3DwjAaRzyQ==",\r
      "cpu": [\r
        "arm"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "android"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-android-arm64": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.64.6.tgz",\r
      "integrity": "sha512-si5/Etm6MphPc2xYHnk455Shls/hoMjTy3mhXge4OPmvCw7TwC4KP4fKokAlKLV4XaQvLvgSHfafPcblLMYYdQ==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "android"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-darwin-arm64": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.64.6.tgz",\r
      "integrity": "sha512-PQCl3q7b0BgvVt72i2xrWM6I5KliwwVe4GpWW5QDGyUQawDS9aPZss/aGyFqBmxdRxlE8wDc9CaxiQ5DHRSp/Q==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "darwin"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-darwin-x64": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.64.6.tgz",\r
      "integrity": "sha512-l9DFl1Itb1YYdSrP1K3U8ih44AOHa/p+Q4WMMDfGvH5qVWp+ajfgS1DlYo4yCRh8wJ2ZJv0Fqccf+ULAmMFjmg==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "darwin"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-freebsd-arm64": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.64.6.tgz",\r
      "integrity": "sha512-bR4GR3205N9+od0+l5Dd9/iZTDpJkIe6d6Ydp2qbcQZJLmKBdYQQRp8gbWpbMt92twKJY66o1vK4NkoKQODIrA==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "freebsd"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-freebsd-x64": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.64.6.tgz",\r
      "integrity": "sha512-XTVNaDzcFl2TeBglvxdGgsCv9JGtAGRAoJENmGBR/XvDH2mA2K0IXc2aMfP0dR8mexSXSKifJ85FixoXX1wfTw==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "freebsd"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.64.6.tgz",\r
      "integrity": "sha512-qWc6qbc+25ugG9vqPR9P422KJBbVfZ05mjcMggoq8tsfWP+eRfC+/tiDdIlRF5VL2pDVZWN9zAhWsmu7R1+7Dw==",\r
      "cpu": [\r
        "arm"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "glibc"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.64.6.tgz",\r
      "integrity": "sha512-V4Nwkp8844X/Xnww3PI1LYS0YPei8XQEVG70R+5MPZGO7AhYoun4hCN7Svs4U3wbQLZbwiz+9xRFhUZZdRl8Ww==",\r
      "cpu": [\r
        "arm"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "musl"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-arm64-gnu": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.64.6.tgz",\r
      "integrity": "sha512-xb72A1aPaaIsp+a88VtRae/ovIEXislbUMyp7b9AQQU7ZkP2m/+ik6DW9TQcJyw5R8/RIailF9zExYwkjR++UA==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "glibc"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-arm64-musl": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.64.6.tgz",\r
      "integrity": "sha512-pbcs1BVBwC43hZkjhjlF8Rx8m5G0KnhLZs9Azy/gqccP6UsNSzJr0hKGIAVPqzAH1O/NdPxxC9GVGb4msQg/aw==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "musl"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-loong64-gnu": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.64.6.tgz",\r
      "integrity": "sha512-EKOC8os6Vsg487ZLKUqzLF99Jsmnq6tu7O7mAELakNpcA+8KadktFf/JYdRuHe/DzCUXmN38pUKu4XBcKlqGbQ==",\r
      "cpu": [\r
        "loong64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "glibc"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-loong64-musl": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.64.6.tgz",\r
      "integrity": "sha512-v/SQ68GnSlr/HyjB79sNXesGDwkOPu9JjbHfmWaymCiM+nZsQ9TstG1KfA4MuEvTr2d3PoY8PhFxj9bt0e32JA==",\r
      "cpu": [\r
        "loong64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "musl"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-ppc64-gnu": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.64.6.tgz",\r
      "integrity": "sha512-G3pmliMQ7r15zFFNwBlaT/xTdSLi4lfgI7CUrQueyKYheNVhrd8JrWCE6Ll8xf4AA1RZFqq+mNJYntiElsVOyA==",\r
      "cpu": [\r
        "ppc64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "glibc"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-ppc64-musl": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.64.6.tgz",\r
      "integrity": "sha512-XQTB/IPoB/wG6x/wu9uomAt8YH61IAr5iZTubMiad/lu88sotq2ocz9hJd556+Jz2kIkF7ZQZIsUuWE3OWqtcA==",\r
      "cpu": [\r
        "ppc64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "musl"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.64.6.tgz",\r
      "integrity": "sha512-O5mpokth6+ydMuwiGtY8fIjvOBfH7u6SzmDNmZ3k6GK5C6iEAC2q2ZN/T5L9jYILx0IcCT0KnfMDihQ5yQFSBw==",\r
      "cpu": [\r
        "riscv64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "glibc"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-riscv64-musl": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.64.6.tgz",\r
      "integrity": "sha512-aIFxbAD9v3TvIaEDsKmukjcDg1JS4/tFXw8SHyQQgzOwzWCQ4cyDK7Ju1pQKqUXDFkEu/BZCFDCDATsKhQcB/Q==",\r
      "cpu": [\r
        "riscv64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "musl"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-s390x-gnu": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.64.6.tgz",\r
      "integrity": "sha512-fuNo1UwBc6BxnHDOxxguQL/InhheMN3RJcJMb0b4xP8r5Q3CNCrJbVg0eCIFuJ4e/zAfjR2gYbOfbzO/G7CIyw==",\r
      "cpu": [\r
        "s390x"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "glibc"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-x64-gnu": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.64.6.tgz",\r
      "integrity": "sha512-05v6wFKDKJPZs9xlytVrrRu6IbRuoSvlH9xNwEOafXsKyjBFZPvAcZz2VIAB/M+lblYeKa9iOYC4RDVdfcAAaw==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "glibc"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-linux-x64-musl": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.64.6.tgz",\r
      "integrity": "sha512-wJXKcdMjvkc/FaavZXNP1yW4i0pfOmhZAIWRSLG2yJ0PB0TWi7dkLErhX0u0vptDcXKKO/m1Y/YTeuyvb2MXwg==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "libc": [\r
        "musl"\r
      ],\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "linux"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-openbsd-x64": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.64.6.tgz",\r
      "integrity": "sha512-cwg7/h0ThvJwy8CBkmACdiHAxRWpbsCmIsjOt+Zzx0hTnIcSUmKYEV03bGg+hD827OnwUsbKh1ZZDW754xWyBA==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "openbsd"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-openharmony-arm64": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.64.6.tgz",\r
      "integrity": "sha512-T0RkYIJbdYXJEQFw+tMBO09KDFdgmNxkHsof3wWAABrvnx15Yh8RytmrgYy9+q9cBeBNZF66MMQZC+5nzEz6vg==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "openharmony"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-win32-arm64-msvc": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.64.6.tgz",\r
      "integrity": "sha512-KlfpmF1AAIdAWxt8QQNClbpLFlAUfYOzqIuJ7IXEStMHpFRuH78RG6FjqPb3Rqhh0K89F5npvG+/i3Fjl6IveQ==",\r
      "cpu": [\r
        "arm64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "win32"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-win32-ia32-msvc": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.64.6.tgz",\r
      "integrity": "sha512-MrTLjd7Jlt9/ZavJZYG61KQv9Iy9bzbY+yXy73Xvwoa2uP66wvDShkyBr5Chz/yrE6lbD/zHMuTmKQVNQqBApg==",\r
      "cpu": [\r
        "ia32"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "win32"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-win32-x64-gnu": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.64.6.tgz",\r
      "integrity": "sha512-8fWDH1CkPI8GdBKAxzHDza7UmgficsKo2+MVbvUgOGhB0629w5sHMg3Qu5y7TZsrYKHHWpz8fla4KvoT7WsO3Q==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "win32"\r
      ]\r
    },\r
    "node_modules/@rollup/rollup-win32-x64-msvc": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.64.6.tgz",\r
      "integrity": "sha512-9/c9PWdr5GCIHkkxiHM1HjNBQMVdftP4O8QTcoUAaRza2FSqJ4axbf8QAnBuE6BIGQDl71SaRPeDdDYid5ecTw==",\r
      "cpu": [\r
        "x64"\r
      ],\r
      "dev": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "win32"\r
      ]\r
    },\r
    "node_modules/@tweenjs/tween.js": {\r
      "version": "23.1.3",\r
      "resolved": "https://registry.npmjs.org/@tweenjs/tween.js/-/tween.js-23.1.3.tgz",\r
      "integrity": "sha512-vJmvvwFxYuGnF2axRtPYocag6Clbb5YS7kLL+SO/TeVFzHqDIWrNKYtcsPMibjDx9O+bu+psAy9NKfWklassUA==",\r
      "dev": true,\r
      "license": "MIT"\r
    },\r
    "node_modules/@types/estree": {\r
      "version": "1.0.9",\r
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",\r
      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",\r
      "dev": true,\r
      "license": "MIT"\r
    },\r
    "node_modules/@types/node": {\r
      "version": "24.19.2",\r
      "resolved": "https://registry.npmjs.org/@types/node/-/node-24.19.2.tgz",\r
      "integrity": "sha512-93d49wCWJkCyN87MxLpNN6KXPCwFw7bVUg79mGUV1OS40JGWwVCr8n61DXCSqz7CV6/VfPkb7xec7uP2M+QHWQ==",\r
      "dev": true,\r
      "license": "MIT",\r
      "dependencies": {\r
        "undici-types": ">=7.24.0 <7.24.7"\r
      }\r
    },\r
    "node_modules/@types/stats.js": {\r
      "version": "0.17.4",\r
      "resolved": "https://registry.npmjs.org/@types/stats.js/-/stats.js-0.17.4.tgz",\r
      "integrity": "sha512-jIBvWWShCvlBqBNIZt0KAshWpvSjhkwkEu4ZUcASoAvhmrgAUI2t1dXrjSL4xXVLB4FznPrIsX3nKXFl/Dt4vA==",\r
      "dev": true,\r
      "license": "MIT"\r
    },\r
    "node_modules/@types/three": {\r
      "version": "0.186.0",\r
      "resolved": "https://registry.npmjs.org/@types/three/-/three-0.186.0.tgz",\r
      "integrity": "sha512-mxYSBpDC+D0pLfSP6sW4WZTcT+nrtmZcimMqnVmy36Hte3XpeYSrvgg4TRdaM1GemGog1AWzI5qL2VoIfMXbJQ==",\r
      "dev": true,\r
      "license": "MIT",\r
      "dependencies": {\r
        "@dimforge/rapier3d-compat": "~0.12.0",\r
        "@tweenjs/tween.js": "~23.1.3",\r
        "@types/stats.js": "*",\r
        "@types/webxr": ">=0.5.17",\r
        "fflate": "~0.8.3",\r
        "meshoptimizer": "~1.1.1"\r
      }\r
    },\r
    "node_modules/@types/webxr": {\r
      "version": "0.5.24",\r
      "resolved": "https://registry.npmjs.org/@types/webxr/-/webxr-0.5.24.tgz",\r
      "integrity": "sha512-h8fgEd/DpoS9CBrjEQXR+dIDraopAEfu4wYVNY2tEPwk60stPWhvZMf4Foo5FakuQ7HFZoa8WceaWFervK2Ovg==",\r
      "dev": true,\r
      "license": "MIT"\r
    },\r
    "node_modules/esbuild": {\r
      "version": "0.28.2",\r
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz",\r
      "integrity": "sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==",\r
      "dev": true,\r
      "hasInstallScript": true,\r
      "license": "MIT",\r
      "bin": {\r
        "esbuild": "bin/esbuild"\r
      },\r
      "engines": {\r
        "node": ">=18"\r
      },\r
      "optionalDependencies": {\r
        "@esbuild/aix-ppc64": "0.28.2",\r
        "@esbuild/android-arm": "0.28.2",\r
        "@esbuild/android-arm64": "0.28.2",\r
        "@esbuild/android-x64": "0.28.2",\r
        "@esbuild/darwin-arm64": "0.28.2",\r
        "@esbuild/darwin-x64": "0.28.2",\r
        "@esbuild/freebsd-arm64": "0.28.2",\r
        "@esbuild/freebsd-x64": "0.28.2",\r
        "@esbuild/linux-arm": "0.28.2",\r
        "@esbuild/linux-arm64": "0.28.2",\r
        "@esbuild/linux-ia32": "0.28.2",\r
        "@esbuild/linux-loong64": "0.28.2",\r
        "@esbuild/linux-mips64el": "0.28.2",\r
        "@esbuild/linux-ppc64": "0.28.2",\r
        "@esbuild/linux-riscv64": "0.28.2",\r
        "@esbuild/linux-s390x": "0.28.2",\r
        "@esbuild/linux-x64": "0.28.2",\r
        "@esbuild/netbsd-arm64": "0.28.2",\r
        "@esbuild/netbsd-x64": "0.28.2",\r
        "@esbuild/openbsd-arm64": "0.28.2",\r
        "@esbuild/openbsd-x64": "0.28.2",\r
        "@esbuild/openharmony-arm64": "0.28.2",\r
        "@esbuild/sunos-x64": "0.28.2",\r
        "@esbuild/win32-arm64": "0.28.2",\r
        "@esbuild/win32-ia32": "0.28.2",\r
        "@esbuild/win32-x64": "0.28.2"\r
      }\r
    },\r
    "node_modules/fdir": {\r
      "version": "6.5.0",\r
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",\r
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",\r
      "dev": true,\r
      "license": "MIT",\r
      "engines": {\r
        "node": ">=12.0.0"\r
      },\r
      "peerDependencies": {\r
        "picomatch": "^3 || ^4"\r
      },\r
      "peerDependenciesMeta": {\r
        "picomatch": {\r
          "optional": true\r
        }\r
      }\r
    },\r
    "node_modules/fflate": {\r
      "version": "0.8.3",\r
      "resolved": "https://registry.npmjs.org/fflate/-/fflate-0.8.3.tgz",\r
      "integrity": "sha512-tbZNuJrLwGUp3zshBtdy4W+ORxZuIh8a5ilyIEQDC5rY1f3U20JMry0Ll3WBzU58EZKsEuJFXhb5gwv8CsPvgA==",\r
      "dev": true,\r
      "license": "MIT"\r
    },\r
    "node_modules/fsevents": {\r
      "version": "2.3.3",\r
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",\r
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",\r
      "dev": true,\r
      "hasInstallScript": true,\r
      "license": "MIT",\r
      "optional": true,\r
      "os": [\r
        "darwin"\r
      ],\r
      "engines": {\r
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"\r
      }\r
    },\r
    "node_modules/meshoptimizer": {\r
      "version": "1.1.1",\r
      "resolved": "https://registry.npmjs.org/meshoptimizer/-/meshoptimizer-1.1.1.tgz",\r
      "integrity": "sha512-oRFNWJRDA/WTrVj7NWvqa5HqE1t9MYDj2VaWirQCzCCrAd2GHrqR/sQezCxiWATPNlKTcRaPRHPJwIRoPBAp5g==",\r
      "dev": true,\r
      "license": "MIT"\r
    },\r
    "node_modules/nanoid": {\r
      "version": "3.3.20",\r
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz",\r
      "integrity": "sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==",\r
      "dev": true,\r
      "funding": [\r
        {\r
          "type": "github",\r
          "url": "https://github.com/sponsors/ai"\r
        }\r
      ],\r
      "license": "MIT",\r
      "bin": {\r
        "nanoid": "bin/nanoid.cjs"\r
      },\r
      "engines": {\r
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"\r
      }\r
    },\r
    "node_modules/picocolors": {\r
      "version": "1.1.1",\r
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",\r
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",\r
      "dev": true,\r
      "license": "ISC"\r
    },\r
    "node_modules/picomatch": {\r
      "version": "4.0.7",\r
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",\r
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",\r
      "dev": true,\r
      "license": "MIT",\r
      "engines": {\r
        "node": ">=12"\r
      },\r
      "funding": {\r
        "url": "https://github.com/sponsors/jonschlinkert"\r
      }\r
    },\r
    "node_modules/playwright": {\r
      "version": "1.64.0",\r
      "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.64.0.tgz",\r
      "integrity": "sha512-kVzTnYFYEyQ9RGzBjNCd2+yEqWmVbxl3AHPynv3qQ6JTjv4a+kwRcnqQwIpuP3NnrnIrE/Q6wWAIAvMfIE2/Yg==",\r
      "dev": true,\r
      "license": "Apache-2.0",\r
      "dependencies": {\r
        "playwright-core": "1.64.0"\r
      },\r
      "bin": {\r
        "playwright": "cli.js"\r
      },\r
      "engines": {\r
        "node": ">=20"\r
      }\r
    },\r
    "node_modules/playwright-core": {\r
      "version": "1.64.0",\r
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.64.0.tgz",\r
      "integrity": "sha512-T9r+MZkTECl2+oUcZ26YgZzTrYidTsIhYYkJix+6iDOymOb1FB2RLLSOxRGnZGv5DStt+aduIVbt+E8WygXYpg==",\r
      "dev": true,\r
      "license": "Apache-2.0",\r
      "bin": {\r
        "playwright-core": "cli.js"\r
      },\r
      "engines": {\r
        "node": ">=20"\r
      }\r
    },\r
    "node_modules/postcss": {\r
      "version": "8.5.30",\r
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.30.tgz",\r
      "integrity": "sha512-zkd+e9S1AQHhmaBKye9zlFHWjOwVgqXl1q3ECYy8561K7qxR2cREf/STLskulBFd78k6AOFeA+ff1TtEzk9bAA==",\r
      "dev": true,\r
      "funding": [\r
        {\r
          "type": "opencollective",\r
          "url": "https://opencollective.com/postcss/"\r
        },\r
        {\r
          "type": "tidelift",\r
          "url": "https://tidelift.com/funding/github/npm/postcss"\r
        },\r
        {\r
          "type": "github",\r
          "url": "https://github.com/sponsors/ai"\r
        }\r
      ],\r
      "license": "MIT",\r
      "dependencies": {\r
        "nanoid": "^3.3.20",\r
        "picocolors": "^1.1.1",\r
        "source-map-js": "^1.2.2"\r
      },\r
      "engines": {\r
        "node": "^10 || ^12 || >=14"\r
      }\r
    },\r
    "node_modules/rollup": {\r
      "version": "4.64.6",\r
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.64.6.tgz",\r
      "integrity": "sha512-fX1Vy+UNKdXn+xKDnu/HBXbHVr1AY8cSdQj9BU4kLv5aFCMqGpvrVbyUMmjN3DdzWhSAuTbcX8PCNEVaumthYA==",\r
      "dev": true,\r
      "license": "MIT",\r
      "dependencies": {\r
        "@types/estree": "1.0.9"\r
      },\r
      "bin": {\r
        "rollup": "dist/bin/rollup"\r
      },\r
      "engines": {\r
        "node": ">=18.0.0",\r
        "npm": ">=8.0.0"\r
      },\r
      "optionalDependencies": {\r
        "@napi-rs/lzma-linux-x64-gnu": "1.5.1",\r
        "@rollup/rollup-android-arm-eabi": "4.64.6",\r
        "@rollup/rollup-android-arm64": "4.64.6",\r
        "@rollup/rollup-darwin-arm64": "4.64.6",\r
        "@rollup/rollup-darwin-x64": "4.64.6",\r
        "@rollup/rollup-freebsd-arm64": "4.64.6",\r
        "@rollup/rollup-freebsd-x64": "4.64.6",\r
        "@rollup/rollup-linux-arm-gnueabihf": "4.64.6",\r
        "@rollup/rollup-linux-arm-musleabihf": "4.64.6",\r
        "@rollup/rollup-linux-arm64-gnu": "4.64.6",\r
        "@rollup/rollup-linux-arm64-musl": "4.64.6",\r
        "@rollup/rollup-linux-loong64-gnu": "4.64.6",\r
        "@rollup/rollup-linux-loong64-musl": "4.64.6",\r
        "@rollup/rollup-linux-ppc64-gnu": "4.64.6",\r
        "@rollup/rollup-linux-ppc64-musl": "4.64.6",\r
        "@rollup/rollup-linux-riscv64-gnu": "4.64.6",\r
        "@rollup/rollup-linux-riscv64-musl": "4.64.6",\r
        "@rollup/rollup-linux-s390x-gnu": "4.64.6",\r
        "@rollup/rollup-linux-x64-gnu": "4.64.6",\r
        "@rollup/rollup-linux-x64-musl": "4.64.6",\r
        "@rollup/rollup-openbsd-x64": "4.64.6",\r
        "@rollup/rollup-openharmony-arm64": "4.64.6",\r
        "@rollup/rollup-win32-arm64-msvc": "4.64.6",\r
        "@rollup/rollup-win32-ia32-msvc": "4.64.6",\r
        "@rollup/rollup-win32-x64-gnu": "4.64.6",\r
        "@rollup/rollup-win32-x64-msvc": "4.64.6",\r
        "fsevents": "~2.3.2"\r
      }\r
    },\r
    "node_modules/source-map-js": {\r
      "version": "1.2.2",\r
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz",\r
      "integrity": "sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==",\r
      "dev": true,\r
      "license": "BSD-3-Clause",\r
      "engines": {\r
        "node": ">=0.10.0"\r
      }\r
    },\r
    "node_modules/three": {\r
      "version": "0.186.1",\r
      "resolved": "https://registry.npmjs.org/three/-/three-0.186.1.tgz",\r
      "integrity": "sha512-blFeqb49wRCSGUGj7gtpfnSGHy2lwDk94RhUmS1c/hTby70kvChbWpkJ4Pm1390LqzzvTmzgXKHPEafJwCb8jA==",\r
      "license": "MIT"\r
    },\r
    "node_modules/tinyglobby": {\r
      "version": "0.2.17",\r
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",\r
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",\r
      "dev": true,\r
      "license": "MIT",\r
      "dependencies": {\r
        "fdir": "^6.5.0",\r
        "picomatch": "^4.0.4"\r
      },\r
      "engines": {\r
        "node": ">=12.0.0"\r
      },\r
      "funding": {\r
        "url": "https://github.com/sponsors/SuperchupuDev"\r
      }\r
    },\r
    "node_modules/tsx": {\r
      "version": "4.23.15",\r
      "resolved": "https://registry.npmjs.org/tsx/-/tsx-4.23.15.tgz",\r
      "integrity": "sha512-Yiex1Ovn8z2xPpOWckIiysV1SSyRMY9BkLF++q0yKiDxCqRhosKfMg3janKkiLBwZ5c/YryloKwGZcrEmtwxKw==",\r
      "dev": true,\r
      "license": "MIT",\r
      "dependencies": {\r
        "esbuild": "~0.28.0"\r
      },\r
      "bin": {\r
        "tsx": "dist/cli.mjs"\r
      },\r
      "engines": {\r
        "node": ">=18.0.0"\r
      },\r
      "optionalDependencies": {\r
        "fsevents": "~2.3.3"\r
      }\r
    },\r
    "node_modules/typescript": {\r
      "version": "5.9.3",\r
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",\r
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",\r
      "dev": true,\r
      "license": "Apache-2.0",\r
      "bin": {\r
        "tsc": "bin/tsc",\r
        "tsserver": "bin/tsserver"\r
      },\r
      "engines": {\r
        "node": ">=14.17"\r
      }\r
    },\r
    "node_modules/undici-types": {\r
      "version": "7.24.6",\r
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-7.24.6.tgz",\r
      "integrity": "sha512-WRNW+sJgj5OBN4/0JpHFqtqzhpbnV0GuB+OozA9gCL7a993SmU+1JBZCzLNxYsbMfIeDL+lTsphD5jN5N+n0zg==",\r
      "dev": true,\r
      "license": "MIT"\r
    },\r
    "node_modules/vite": {\r
      "version": "7.3.7",\r
      "resolved": "https://registry.npmjs.org/vite/-/vite-7.3.7.tgz",\r
      "integrity": "sha512-AHEzTORMbi7/7aXp7w7KZ5+DCUdSeLsJz0grY8xHpc9DHdYb0vQu6DqJfm2tOw3gDExNgPgnJTXxM6syYFHaCA==",\r
      "dev": true,\r
      "license": "MIT",\r
      "dependencies": {\r
        "esbuild": "^0.27.0 || ^0.28.0",\r
        "fdir": "^6.5.0",\r
        "picomatch": "^4.0.3",\r
        "postcss": "^8.5.6",\r
        "rollup": "^4.43.0",\r
        "tinyglobby": "^0.2.15"\r
      },\r
      "bin": {\r
        "vite": "bin/vite.js"\r
      },\r
      "engines": {\r
        "node": "^20.19.0 || >=22.12.0"\r
      },\r
      "funding": {\r
        "url": "https://github.com/vitejs/vite?sponsor=1"\r
      },\r
      "optionalDependencies": {\r
        "fsevents": "~2.3.3"\r
      },\r
      "peerDependencies": {\r
        "@types/node": "^20.19.0 || >=22.12.0",\r
        "jiti": ">=1.21.0",\r
        "less": "^4.0.0",\r
        "lightningcss": "^1.21.0",\r
        "sass": "^1.70.0",\r
        "sass-embedded": "^1.70.0",\r
        "stylus": ">=0.54.8",\r
        "sugarss": "^5.0.0",\r
        "terser": "^5.16.0",\r
        "tsx": "^4.8.1",\r
        "yaml": "^2.4.2"\r
      },\r
      "peerDependenciesMeta": {\r
        "@types/node": {\r
          "optional": true\r
        },\r
        "jiti": {\r
          "optional": true\r
        },\r
        "less": {\r
          "optional": true\r
        },\r
        "lightningcss": {\r
          "optional": true\r
        },\r
        "sass": {\r
          "optional": true\r
        },\r
        "sass-embedded": {\r
          "optional": true\r
        },\r
        "stylus": {\r
          "optional": true\r
        },\r
        "sugarss": {\r
          "optional": true\r
        },\r
        "terser": {\r
          "optional": true\r
        },\r
        "tsx": {\r
          "optional": true\r
        },\r
        "yaml": {\r
          "optional": true\r
        }\r
      }\r
    }\r
  }\r
}\r
`});/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var ir={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},rr={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Ff=0,zu=1,Uf=2;var Oo=1,bl=2,Cs=3,ui=0,yn=1,Mt=2,hi=0,sr=1,or=2,Vu=3,Gu=4,Of=5;var Cr=100,Bf=101,kf=102,zf=103,Vf=104,Gf=200,Hf=201,Wf=202,Xf=203,Hu=204,Wu=205,qf=206,Kf=207,Yf=208,Zf=209,jf=210,Jf=211,$f=212,Qf=213,ep=214,Ha=0,Wa=1,Xa=2,us=3,qa=4,Ka=5,Ya=6,Za=7,Xu=0,tp=1,np=2,$n=0,qu=1,Ku=2,Yu=3,Bo=4,Zu=5,ju=6,Ju=7,wu="attached",ip="detached",$u=300,ar=301,Rr=302,vl=303,_l=304,Pr=306,Ji=1e3,On=1001,hs=1002,Kt=1003,Ml=1004;var Ir=1005;var Ft=1006,Rs=1007;var Qn=1008;var An=1009,Qu=1010,eh=1011,Ps=1012,Tl=1013,ei=1014,Ln=1015,Nn=1016,Sl=1017,wl=1018,Is=1020,th=35902,nh=35899,ih=1021,rh=1022,bn=1023,oi=1026,lr=1027,Al=1028,El=1029,cr=1030,Cl=1031;var Rl=1033,ko=33776,zo=33777,Vo=33778,Go=33779,Pl=35840,Il=35841,Dl=35842,Ll=35843,Nl=36196,Fl=37492,Ul=37496,Ol=37488,Bl=37489,Ho=37490,kl=37491,zl=37808,Vl=37809,Gl=37810,Hl=37811,Wl=37812,Xl=37813,ql=37814,Kl=37815,Yl=37816,Zl=37817,jl=37818,Jl=37819,$l=37820,Ql=37821,ec=36492,tc=36494,nc=36495,ic=36283,rc=36284,Wo=36285,sc=36286;var Mr=2300,Tr=2301,za=2302,Au=2303,Eu=2400,Cu=2401,Ru=2402,rp=2500;var sh=0,Xo=1,Ds=2,sp=3200;var oc=0,op=1,Ni="",qt="srgb",un="srgb-linear",so="linear",wt="srgb";var Va=7680;var ap=519,lp=512,cp=513,up=514,ac=515,hp=516,dp=517,lc=518,fp=519,oh=35044,tn=35048;var ah="300 es",Yn=2e3,ds=2001;function s0(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function o0(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function fs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function pp(){let i=fs("canvas");return i.style.display="block",i}var Xd={},ps=null;function oo(...i){let e="THREE."+i.shift();ps?ps("log",e,...i):console.log(e,...i)}function mp(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Qe(...i){i=mp(i);let e="THREE."+i.shift();if(ps)ps("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function rt(...i){i=mp(i);let e="THREE."+i.shift();if(ps)ps("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function _r(...i){let e=i.join(" ");e in Xd||(Xd[e]=!0,Qe(...i))}function gp(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}var xp={[Ha]:Wa,[Xa]:Ya,[qa]:Za,[us]:Ka,[Wa]:Ha,[Ya]:Xa,[Za]:qa,[Ka]:us},Zn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},dn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],qd=1234567,to=Math.PI/180,Sr=180/Math.PI;function Bn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(dn[i&255]+dn[i>>8&255]+dn[i>>16&255]+dn[i>>24&255]+"-"+dn[e&255]+dn[e>>8&255]+"-"+dn[e>>16&15|64]+dn[e>>24&255]+"-"+dn[t&63|128]+dn[t>>8&255]+"-"+dn[t>>16&255]+dn[t>>24&255]+dn[n&255]+dn[n>>8&255]+dn[n>>16&255]+dn[n>>24&255]).toLowerCase()}function ut(i,e,t){return Math.max(e,Math.min(t,i))}function lh(i,e){return(i%e+e)%e}function a0(i,e,t,n,r){return n+(i-e)*(r-n)/(t-e)}function l0(i,e,t){return i!==e?(t-i)/(e-i):0}function no(i,e,t){return(1-t)*i+t*e}function c0(i,e,t,n){return no(i,e,1-Math.exp(-t*n))}function u0(i,e=1){return e-Math.abs(lh(i,e*2)-e)}function h0(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function d0(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function f0(i,e){return i+Math.floor(Math.random()*(e-i+1))}function p0(i,e){return i+Math.random()*(e-i)}function m0(i){return i*(.5-Math.random())}function g0(i){i!==void 0&&(qd=i);let e=qd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function x0(i){return i*to}function y0(i){return i*Sr}function b0(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function v0(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function _0(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function M0(i,e,t,n,r){let s=Math.cos,o=Math.sin,a=s(t/2),l=o(t/2),c=s((e+n)/2),u=o((e+n)/2),h=s((e-n)/2),d=o((e-n)/2),f=s((n-e)/2),p=o((n-e)/2);switch(r){case"XYX":i.set(a*u,l*h,l*d,a*c);break;case"YZY":i.set(l*d,a*u,l*h,a*c);break;case"ZXZ":i.set(l*h,l*d,a*u,a*c);break;case"XZX":i.set(a*u,l*p,l*f,a*c);break;case"YXY":i.set(l*f,a*u,l*p,a*c);break;case"ZYZ":i.set(l*p,l*f,a*u,a*c);break;default:Qe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Kn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Et(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var We={DEG2RAD:to,RAD2DEG:Sr,generateUUID:Bn,clamp:ut,euclideanModulo:lh,mapLinear:a0,inverseLerp:l0,lerp:no,damp:c0,pingpong:u0,smoothstep:h0,smootherstep:d0,randInt:f0,randFloat:p0,randFloatSpread:m0,seededRandom:g0,degToRad:x0,radToDeg:y0,isPowerOfTwo:b0,ceilPowerOfTwo:v0,floorPowerOfTwo:_0,setQuaternionFromProperEuler:M0,normalize:Et,denormalize:Kn},me=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},vt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],u=n[r+2],h=n[r+3],d=s[o+0],f=s[o+1],p=s[o+2],y=s[o+3];if(h!==y||l!==d||c!==f||u!==p){let m=l*d+c*f+u*p+h*y;m<0&&(d=-d,f=-f,p=-p,y=-y,m=-m);let g=1-a;if(m<.9995){let _=Math.acos(m),M=Math.sin(_);g=Math.sin(g*_)/M,a=Math.sin(a*_)/M,l=l*g+d*a,c=c*g+f*a,u=u*g+p*a,h=h*g+y*a}else{l=l*g+d*a,c=c*g+f*a,u=u*g+p*a,h=h*g+y*a;let _=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=_,c*=_,u*=_,h*=_}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,o){let a=n[r],l=n[r+1],c=n[r+2],u=n[r+3],h=s[o],d=s[o+1],f=s[o+2],p=s[o+3];return e[t]=a*p+u*h+l*f-c*d,e[t+1]=l*p+u*d+c*h-a*f,e[t+2]=c*p+u*f+a*d-l*h,e[t+3]=u*p-a*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(r/2),h=a(s/2),d=l(n/2),f=l(r/2),p=l(s/2);switch(o){case"XYZ":this._x=d*u*h+c*f*p,this._y=c*f*h-d*u*p,this._z=c*u*p+d*f*h,this._w=c*u*h-d*f*p;break;case"YXZ":this._x=d*u*h+c*f*p,this._y=c*f*h-d*u*p,this._z=c*u*p-d*f*h,this._w=c*u*h+d*f*p;break;case"ZXY":this._x=d*u*h-c*f*p,this._y=c*f*h+d*u*p,this._z=c*u*p+d*f*h,this._w=c*u*h-d*f*p;break;case"ZYX":this._x=d*u*h-c*f*p,this._y=c*f*h+d*u*p,this._z=c*u*p-d*f*h,this._w=c*u*h+d*f*p;break;case"YZX":this._x=d*u*h+c*f*p,this._y=c*f*h+d*u*p,this._z=c*u*p-d*f*h,this._w=c*u*h-d*f*p;break;case"XZY":this._x=d*u*h-c*f*p,this._y=c*f*h-d*u*p,this._z=c*u*p+d*f*h,this._w=c*u*h+d*f*p;break;default:Qe("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(n>a&&n>h){let f=2*Math.sqrt(1+n-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>h){let f=2*Math.sqrt(1+a-n-h);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-n-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ut(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-n*c,this._z=s*u+o*c+n*l-r*a,this._w=o*u-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,s=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,r=-r,s=-s,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+r*t,this._z=this._z*l+s*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},I=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Kd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Kd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),u=2*(a*t-s*r),h=2*(s*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return $c.copy(this).projectOnVector(e),this.sub($c)}reflect(e){return this.sub($c.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},$c=new I,Kd=new vt,ct=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,r,s,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],p=n[8],y=r[0],m=r[3],g=r[6],_=r[1],M=r[4],v=r[7],T=r[2],b=r[5],w=r[8];return s[0]=o*y+a*_+l*T,s[3]=o*m+a*M+l*b,s[6]=o*g+a*v+l*w,s[1]=c*y+u*_+h*T,s[4]=c*m+u*M+h*b,s[7]=c*g+u*v+h*w,s[2]=d*y+f*_+p*T,s[5]=d*m+f*M+p*b,s[8]=d*g+f*v+p*w,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*s*u+n*a*l+r*s*c-r*o*l}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*s,f=c*s-o*l,p=t*h+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/p;return e[0]=h*y,e[1]=(r*c-u*n)*y,e[2]=(a*n-r*o)*y,e[3]=d*y,e[4]=(u*t-r*l)*y,e[5]=(r*s-a*t)*y,e[6]=f*y,e[7]=(n*l-c*t)*y,e[8]=(o*t-n*s)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return _r("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Qc.makeScale(e,t)),this}rotate(e){return _r("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Qc.makeRotation(-e)),this}translate(e,t){return _r("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Qc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Qc=new ct,Yd=new ct().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Zd=new ct().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function T0(){let i={enabled:!0,workingColorSpace:un,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===wt&&(r.r=Ti(r.r),r.g=Ti(r.g),r.b=Ti(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===wt&&(r.r=cs(r.r),r.g=cs(r.g),r.b=cs(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Ni?so:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return _r("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return _r("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[un]:{primaries:e,whitePoint:n,transfer:so,toXYZ:Yd,fromXYZ:Zd,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:qt},outputColorSpaceConfig:{drawingBufferColorSpace:qt}},[qt]:{primaries:e,whitePoint:n,transfer:wt,toXYZ:Yd,fromXYZ:Zd,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:qt}}}),i}var pt=T0();function Ti(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function cs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Zr,ja=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Zr===void 0&&(Zr=fs("canvas")),Zr.width=e.width,Zr.height=e.height;let r=Zr.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=Zr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=fs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Ti(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ti(t[n]/255)*255):t[n]=Ti(t[n]);return{data:t,width:e.width,height:e.height}}else return Qe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},S0=0,ms=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:S0++}),this.uuid=Bn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(eu(r[o].image)):s.push(eu(r[o]))}else s=eu(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function eu(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ja.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Qe("Texture: Unable to serialize Texture."),{})}var w0=0,tu=new I,Gt=class i extends Zn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=On,r=On,s=Ft,o=Qn,a=bn,l=An,c=i.DEFAULT_ANISOTROPY,u=Ni){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:w0++}),this.uuid=Bn(),this.name="",this.source=new ms(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new me(0,0),this.repeat=new me(1,1),this.center=new me(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ct,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(tu).x}get height(){return this.source.getSize(tu).y}get depth(){return this.source.getSize(tu).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Qe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){Qe(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==$u)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ji:e.x=e.x-Math.floor(e.x);break;case On:e.x=e.x<0?0:1;break;case hs:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ji:e.y=e.y-Math.floor(e.y);break;case On:e.y=e.y<0?0:1;break;case hs:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Gt.DEFAULT_IMAGE=null;Gt.DEFAULT_MAPPING=$u;Gt.DEFAULT_ANISOTROPY=1;var mt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],p=l[9],y=l[2],m=l[6],g=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-y)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+y)<.1&&Math.abs(p+m)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(c+1)/2,v=(f+1)/2,T=(g+1)/2,b=(u+d)/4,w=(h+y)/4,x=(p+m)/4;return M>v&&M>T?M<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(M),r=b/n,s=w/n):v>T?v<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),n=b/r,s=x/r):T<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(T),n=w/s,r=x/s),this.set(n,r,s,t),this}let _=Math.sqrt((m-p)*(m-p)+(h-y)*(h-y)+(d-u)*(d-u));return Math.abs(_)<.001&&(_=1),this.x=(m-p)/_,this.y=(h-y)/_,this.z=(d-u)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this.w=ut(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this.w=ut(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ja=class extends Zn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ft,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new mt(0,0,e,t),this.scissorTest=!1,this.viewport=new mt(0,0,e,t),this.textures=[];let r={width:e,height:t,depth:n.depth},s=new Gt(r),o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Ft,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new ms(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Mn=class extends Ja{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},ao=class extends Gt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Kt,this.minFilter=Kt,this.wrapR=On,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var $a=class extends Gt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Kt,this.minFilter=Kt,this.wrapR=On,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Ne=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,r,s,o,a,l,c,u,h,d,f,p,y,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,u,h,d,f,p,y,m)}set(e,t,n,r,s,o,a,l,c,u,h,d,f,p,y,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=s,g[5]=o,g[9]=a,g[13]=l,g[2]=c,g[6]=u,g[10]=h,g[14]=d,g[3]=f,g[7]=p,g[11]=y,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/jr.setFromMatrixColumn(e,0).length(),s=1/jr.setFromMatrixColumn(e,1).length(),o=1/jr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){let d=o*u,f=o*h,p=a*u,y=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+p*c,t[5]=d-y*c,t[9]=-a*l,t[2]=y-d*c,t[6]=p+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*u,f=l*h,p=c*u,y=c*h;t[0]=d+y*a,t[4]=p*a-f,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-p,t[6]=y+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*u,f=l*h,p=c*u,y=c*h;t[0]=d-y*a,t[4]=-o*h,t[8]=p+f*a,t[1]=f+p*a,t[5]=o*u,t[9]=y-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*u,f=o*h,p=a*u,y=a*h;t[0]=l*u,t[4]=p*c-f,t[8]=d*c+y,t[1]=l*h,t[5]=y*c+d,t[9]=f*c-p,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,p=a*l,y=a*c;t[0]=l*u,t[4]=y-d*h,t[8]=p*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*h+p,t[10]=d-y*h}else if(e.order==="XZY"){let d=o*l,f=o*c,p=a*l,y=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+y,t[5]=o*u,t[9]=f*h-p,t[2]=p*h-f,t[6]=a*u,t[10]=y*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(A0,e,E0)}lookAt(e,t,n){let r=this.elements;return Pn.subVectors(e,t),Pn.lengthSq()===0&&(Pn.z=1),Pn.normalize(),Wi.crossVectors(n,Pn),Wi.lengthSq()===0&&(Math.abs(n.z)===1?Pn.x+=1e-4:Pn.z+=1e-4,Pn.normalize(),Wi.crossVectors(n,Pn)),Wi.normalize(),fa.crossVectors(Pn,Wi),r[0]=Wi.x,r[4]=fa.x,r[8]=Pn.x,r[1]=Wi.y,r[5]=fa.y,r[9]=Pn.y,r[2]=Wi.z,r[6]=fa.z,r[10]=Pn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],p=n[2],y=n[6],m=n[10],g=n[14],_=n[3],M=n[7],v=n[11],T=n[15],b=r[0],w=r[4],x=r[8],S=r[12],E=r[1],R=r[5],A=r[9],P=r[13],D=r[2],F=r[6],z=r[10],L=r[14],V=r[3],k=r[7],W=r[11],J=r[15];return s[0]=o*b+a*E+l*D+c*V,s[4]=o*w+a*R+l*F+c*k,s[8]=o*x+a*A+l*z+c*W,s[12]=o*S+a*P+l*L+c*J,s[1]=u*b+h*E+d*D+f*V,s[5]=u*w+h*R+d*F+f*k,s[9]=u*x+h*A+d*z+f*W,s[13]=u*S+h*P+d*L+f*J,s[2]=p*b+y*E+m*D+g*V,s[6]=p*w+y*R+m*F+g*k,s[10]=p*x+y*A+m*z+g*W,s[14]=p*S+y*P+m*L+g*J,s[3]=_*b+M*E+v*D+T*V,s[7]=_*w+M*R+v*F+T*k,s[11]=_*x+M*A+v*z+T*W,s[15]=_*S+M*P+v*L+T*J,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],p=e[3],y=e[7],m=e[11],g=e[15],_=l*f-c*d,M=a*f-c*h,v=a*d-l*h,T=o*f-c*u,b=o*d-l*u,w=o*h-a*u;return t*(y*_-m*M+g*v)-n*(p*_-m*T+g*b)+r*(p*M-y*T+g*w)-s*(p*v-y*b+m*w)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[1],o=e[5],a=e[9],l=e[2],c=e[6],u=e[10];return t*(o*u-a*c)-n*(s*u-a*l)+r*(s*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],p=e[12],y=e[13],m=e[14],g=e[15],_=t*a-n*o,M=t*l-r*o,v=t*c-s*o,T=n*l-r*a,b=n*c-s*a,w=r*c-s*l,x=u*y-h*p,S=u*m-d*p,E=u*g-f*p,R=h*m-d*y,A=h*g-f*y,P=d*g-f*m,D=_*P-M*A+v*R+T*E-b*S+w*x;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let F=1/D;return e[0]=(a*P-l*A+c*R)*F,e[1]=(r*A-n*P-s*R)*F,e[2]=(y*w-m*b+g*T)*F,e[3]=(d*b-h*w-f*T)*F,e[4]=(l*E-o*P-c*S)*F,e[5]=(t*P-r*E+s*S)*F,e[6]=(m*v-p*w-g*M)*F,e[7]=(u*w-d*v+f*M)*F,e[8]=(o*A-a*E+c*x)*F,e[9]=(n*E-t*A-s*x)*F,e[10]=(p*b-y*v+g*_)*F,e[11]=(h*v-u*b-f*_)*F,e[12]=(a*S-o*R-l*x)*F,e[13]=(t*R-n*S+r*x)*F,e[14]=(y*M-p*T-m*_)*F,e[15]=(u*T-h*M+d*_)*F,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+n,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,d=s*c,f=s*u,p=s*h,y=o*u,m=o*h,g=a*h,_=l*c,M=l*u,v=l*h,T=n.x,b=n.y,w=n.z;return r[0]=(1-(y+g))*T,r[1]=(f+v)*T,r[2]=(p-M)*T,r[3]=0,r[4]=(f-v)*b,r[5]=(1-(d+g))*b,r[6]=(m+_)*b,r[7]=0,r[8]=(p+M)*w,r[9]=(m-_)*w,r[10]=(1-(d+y))*w,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let s=this.determinantAffine();if(s===0)return n.set(1,1,1),t.identity(),this;let o=jr.set(r[0],r[1],r[2]).length(),a=jr.set(r[4],r[5],r[6]).length(),l=jr.set(r[8],r[9],r[10]).length();s<0&&(o=-o),Wn.copy(this);let c=1/o,u=1/a,h=1/l;return Wn.elements[0]*=c,Wn.elements[1]*=c,Wn.elements[2]*=c,Wn.elements[4]*=u,Wn.elements[5]*=u,Wn.elements[6]*=u,Wn.elements[8]*=h,Wn.elements[9]*=h,Wn.elements[10]*=h,t.setFromRotationMatrix(Wn),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,r,s,o,a=Yn,l=!1){let c=this.elements,u=2*s/(t-e),h=2*s/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,y;if(l)p=s/(o-s),y=o*s/(o-s);else if(a===Yn)p=-(o+s)/(o-s),y=-2*o*s/(o-s);else if(a===ds)p=-o/(o-s),y=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=Yn,l=!1){let c=this.elements,u=2/(t-e),h=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,y;if(l)p=1/(o-s),y=o/(o-s);else if(a===Yn)p=-2/(o-s),y=-(o+s)/(o-s);else if(a===ds)p=-1/(o-s),y=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=h,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},jr=new I,Wn=new Ne,A0=new I(0,0,0),E0=new I(1,1,1),Wi=new I,fa=new I,Pn=new I,jd=new Ne,Jd=new vt,Si=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],d=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ut(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(ut(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-ut(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Qe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return jd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(jd,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Jd.setFromEuler(this),this.setFromQuaternion(Jd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Si.DEFAULT_ORDER="XYZ";var lo=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},C0=0,$d=new I,Jr=new vt,xi=new Ne,pa=new I,qs=new I,R0=new I,P0=new vt,Qd=new I(1,0,0),ef=new I(0,1,0),tf=new I(0,0,1),nf={type:"added"},I0={type:"removed"},$r={type:"childadded",child:null},nu={type:"childremoved",child:null},Ut=class i extends Zn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:C0++}),this.uuid=Bn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new I,t=new Si,n=new vt,r=new I(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ne},normalMatrix:{value:new ct}}),this.matrix=new Ne,this.matrixWorld=new Ne,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new lo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Jr.setFromAxisAngle(e,t),this.quaternion.multiply(Jr),this}rotateOnWorldAxis(e,t){return Jr.setFromAxisAngle(e,t),this.quaternion.premultiply(Jr),this}rotateX(e){return this.rotateOnAxis(Qd,e)}rotateY(e){return this.rotateOnAxis(ef,e)}rotateZ(e){return this.rotateOnAxis(tf,e)}translateOnAxis(e,t){return $d.copy(e).applyQuaternion(this.quaternion),this.position.add($d.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Qd,e)}translateY(e){return this.translateOnAxis(ef,e)}translateZ(e){return this.translateOnAxis(tf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(xi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?pa.copy(e):pa.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),qs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xi.lookAt(qs,pa,this.up):xi.lookAt(pa,qs,this.up),this.quaternion.setFromRotationMatrix(xi),r&&(xi.extractRotation(r.matrixWorld),Jr.setFromRotationMatrix(xi),this.quaternion.premultiply(Jr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(rt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(nf),$r.child=e,this.dispatchEvent($r),$r.child=null):rt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(I0),nu.child=e,this.dispatchEvent(nu),nu.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),xi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),xi.multiply(e.parent.matrixWorld)),e.applyMatrix4(xi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(nf),$r.child=e,this.dispatchEvent($r),$r.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,e,R0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,P0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*n-s[8]*r,s[13]+=n-s[1]*t-s[5]*n-s[9]*r,s[14]+=r-s[2]*t-s[6]*n-s[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(a=>({...a})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),p=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),p.length>0&&(n.nodes=p)}return n.object=r,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ut.DEFAULT_UP=new I(0,1,0);Ut.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ce=class extends Ut{constructor(){super(),this.isGroup=!0,this.type="Group"}},D0={type:"move"},gs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ce,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ce,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ce,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),g=this._getHandJoint(c,y);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,p=.005;c.inputState.pinching&&d>f+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(D0)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Ce;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},yp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xi={h:0,s:0,l:0},ma={h:0,s:0,l:0};function iu(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ie=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=qt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,pt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=pt.workingColorSpace){return this.r=e,this.g=t,this.b=n,pt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=pt.workingColorSpace){if(e=lh(e,1),t=ut(t,0,1),n=ut(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=iu(o,s,e+1/3),this.g=iu(o,s,e),this.b=iu(o,s,e-1/3)}return pt.colorSpaceToWorking(this,r),this}setStyle(e,t=qt){function n(s){s!==void 0&&parseFloat(s)<1&&Qe("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:Qe("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);Qe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=qt){let n=yp[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Qe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ti(e.r),this.g=Ti(e.g),this.b=Ti(e.b),this}copyLinearToSRGB(e){return this.r=cs(e.r),this.g=cs(e.g),this.b=cs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=qt){return pt.workingToColorSpace(fn.copy(this),e),Math.round(ut(fn.r*255,0,255))*65536+Math.round(ut(fn.g*255,0,255))*256+Math.round(ut(fn.b*255,0,255))}getHexString(e=qt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=pt.workingColorSpace){pt.workingToColorSpace(fn.copy(this),t);let n=fn.r,r=fn.g,s=fn.b,o=Math.max(n,r,s),a=Math.min(n,r,s),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-n)/h+2;break;case s:l=(n-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=pt.workingColorSpace){return pt.workingToColorSpace(fn.copy(this),t),e.r=fn.r,e.g=fn.g,e.b=fn.b,e}getStyle(e=qt){pt.workingToColorSpace(fn.copy(this),e);let t=fn.r,n=fn.g,r=fn.b;return e!==qt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Xi),this.setHSL(Xi.h+e,Xi.s+t,Xi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Xi),e.getHSL(ma);let n=no(Xi.h,ma.h,t),r=no(Xi.s,ma.s,t),s=no(Xi.l,ma.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},fn=new Ie;Ie.NAMES=yp;var xs=class extends Ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Si,this.environmentIntensity=1,this.environmentRotation=new Si,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Xn=new I,yi=new I,ru=new I,bi=new I,Qr=new I,es=new I,rf=new I,su=new I,ou=new I,au=new I,lu=new mt,cu=new mt,uu=new mt,ji=class i{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Xn.subVectors(e,t),r.cross(Xn);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){Xn.subVectors(r,t),yi.subVectors(n,t),ru.subVectors(e,t);let o=Xn.dot(Xn),a=Xn.dot(yi),l=Xn.dot(ru),c=yi.dot(yi),u=yi.dot(ru),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;let d=1/h,f=(c*l-a*u)*d,p=(o*u-a*l)*d;return s.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,bi)===null?!1:bi.x>=0&&bi.y>=0&&bi.x+bi.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,bi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,bi.x),l.addScaledVector(o,bi.y),l.addScaledVector(a,bi.z),l)}static getInterpolatedAttribute(e,t,n,r,s,o){return lu.setScalar(0),cu.setScalar(0),uu.setScalar(0),lu.fromBufferAttribute(e,t),cu.fromBufferAttribute(e,n),uu.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(lu,s.x),o.addScaledVector(cu,s.y),o.addScaledVector(uu,s.z),o}static isFrontFacing(e,t,n,r){return Xn.subVectors(n,t),yi.subVectors(e,t),Xn.cross(yi).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Xn.subVectors(this.c,this.b),yi.subVectors(this.a,this.b),Xn.cross(yi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,o,a;Qr.subVectors(r,n),es.subVectors(s,n),su.subVectors(e,n);let l=Qr.dot(su),c=es.dot(su);if(l<=0&&c<=0)return t.copy(n);ou.subVectors(e,r);let u=Qr.dot(ou),h=es.dot(ou);if(u>=0&&h<=u)return t.copy(r);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(Qr,o);au.subVectors(e,s);let f=Qr.dot(au),p=es.dot(au);if(p>=0&&f<=p)return t.copy(s);let y=f*c-l*p;if(y<=0&&c>=0&&p<=0)return a=c/(c-p),t.copy(n).addScaledVector(es,a);let m=u*p-f*h;if(m<=0&&h-u>=0&&f-p>=0)return rf.subVectors(s,r),a=(h-u)/(h-u+(f-p)),t.copy(r).addScaledVector(rf,a);let g=1/(m+y+d);return o=y*g,a=d*g,t.copy(n).addScaledVector(Qr,o).addScaledVector(es,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ln=class{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(qn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(qn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=qn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,qn):qn.fromBufferAttribute(s,o),qn.applyMatrix4(e.matrixWorld),this.expandByPoint(qn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ga.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ga.copy(n.boundingBox)),ga.applyMatrix4(e.matrixWorld),this.union(ga)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,qn),qn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ks),xa.subVectors(this.max,Ks),ts.subVectors(e.a,Ks),ns.subVectors(e.b,Ks),is.subVectors(e.c,Ks),qi.subVectors(ns,ts),Ki.subVectors(is,ns),xr.subVectors(ts,is);let t=[0,-qi.z,qi.y,0,-Ki.z,Ki.y,0,-xr.z,xr.y,qi.z,0,-qi.x,Ki.z,0,-Ki.x,xr.z,0,-xr.x,-qi.y,qi.x,0,-Ki.y,Ki.x,0,-xr.y,xr.x,0];return!hu(t,ts,ns,is,xa)||(t=[1,0,0,0,1,0,0,0,1],!hu(t,ts,ns,is,xa))?!1:(ya.crossVectors(qi,Ki),t=[ya.x,ya.y,ya.z],hu(t,ts,ns,is,xa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,qn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(qn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(vi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),vi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),vi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),vi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),vi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),vi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),vi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),vi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(vi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},vi=[new I,new I,new I,new I,new I,new I,new I,new I],qn=new I,ga=new ln,ts=new I,ns=new I,is=new I,qi=new I,Ki=new I,xr=new I,Ks=new I,xa=new I,ya=new I,yr=new I;function hu(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){yr.fromArray(i,s);let a=r.x*Math.abs(yr.x)+r.y*Math.abs(yr.y)+r.z*Math.abs(yr.z),l=e.dot(yr),c=t.dot(yr),u=n.dot(yr);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var Qt=new I,ba=new me,L0=0,tt=class extends Zn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:L0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=oh,this.updateRanges=[],this.gpuType=Ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ba.fromBufferAttribute(this,t),ba.applyMatrix3(e),this.setXY(t,ba.x,ba.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Qt.fromBufferAttribute(this,t),Qt.applyMatrix3(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Qt.fromBufferAttribute(this,t),Qt.applyMatrix4(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Qt.fromBufferAttribute(this,t),Qt.applyNormalMatrix(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Qt.fromBufferAttribute(this,t),Qt.transformDirection(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Kn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Et(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Kn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Et(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Kn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Et(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Kn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Et(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Kn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Et(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array),r=Et(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array),r=Et(r,this.array),s=Et(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var co=class extends tt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var uo=class extends tt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Ke=class extends tt{constructor(e,t,n){super(new Float32Array(e),t,n)}},N0=new ln,Ys=new I,du=new I,kt=class{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):N0.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ys.subVectors(e,this.center);let t=Ys.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Ys,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(du.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ys.copy(e.center).add(du)),this.expandByPoint(Ys.copy(e.center).sub(du))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},F0=0,Un=new Ne,fu=new Ut,rs=new I,In=new ln,Zs=new ln,an=new I,it=class i extends Zn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:F0++}),this.uuid=Bn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(s0(e)?uo:co)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new ct().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Un.makeRotationFromQuaternion(e),this.applyMatrix4(Un),this}rotateX(e){return Un.makeRotationX(e),this.applyMatrix4(Un),this}rotateY(e){return Un.makeRotationY(e),this.applyMatrix4(Un),this}rotateZ(e){return Un.makeRotationZ(e),this.applyMatrix4(Un),this}translate(e,t,n){return Un.makeTranslation(e,t,n),this.applyMatrix4(Un),this}scale(e,t,n){return Un.makeScale(e,t,n),this.applyMatrix4(Un),this}lookAt(e){return fu.lookAt(e),fu.updateMatrix(),this.applyMatrix4(fu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(rs).negate(),this.translate(rs.x,rs.y,rs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let r=0,s=e.length;r<s;r++){let o=e[r];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ke(n,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&Qe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ln);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){rt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];In.setFromBufferAttribute(s),this.morphTargetsRelative?(an.addVectors(this.boundingBox.min,In.min),this.boundingBox.expandByPoint(an),an.addVectors(this.boundingBox.max,In.max),this.boundingBox.expandByPoint(an)):(this.boundingBox.expandByPoint(In.min),this.boundingBox.expandByPoint(In.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&rt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new kt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){rt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){let n=this.boundingSphere.center;if(In.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Zs.setFromBufferAttribute(a),this.morphTargetsRelative?(an.addVectors(In.min,Zs.min),In.expandByPoint(an),an.addVectors(In.max,Zs.max),In.expandByPoint(an)):(In.expandByPoint(Zs.min),In.expandByPoint(Zs.max))}In.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)an.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(an));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)an.fromBufferAttribute(a,c),l&&(rs.fromBufferAttribute(e,c),an.add(rs)),r=Math.max(r,n.distanceToSquared(an))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&rt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){rt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,r=t.normal,s=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new tt(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let x=0;x<n.count;x++)a[x]=new I,l[x]=new I;let c=new I,u=new I,h=new I,d=new me,f=new me,p=new me,y=new I,m=new I;function g(x,S,E){c.fromBufferAttribute(n,x),u.fromBufferAttribute(n,S),h.fromBufferAttribute(n,E),d.fromBufferAttribute(s,x),f.fromBufferAttribute(s,S),p.fromBufferAttribute(s,E),u.sub(c),h.sub(c),f.sub(d),p.sub(d);let R=1/(f.x*p.y-p.x*f.y);isFinite(R)&&(y.copy(u).multiplyScalar(p.y).addScaledVector(h,-f.y).multiplyScalar(R),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-p.x).multiplyScalar(R),a[x].add(y),a[S].add(y),a[E].add(y),l[x].add(m),l[S].add(m),l[E].add(m))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let x=0,S=_.length;x<S;++x){let E=_[x],R=E.start,A=E.count;for(let P=R,D=R+A;P<D;P+=3)g(e.getX(P+0),e.getX(P+1),e.getX(P+2))}let M=new I,v=new I,T=new I,b=new I;function w(x){T.fromBufferAttribute(r,x),b.copy(T);let S=a[x];M.copy(S),M.sub(T.multiplyScalar(T.dot(S))).normalize(),v.crossVectors(b,S);let R=v.dot(l[x])<0?-1:1;o.setXYZW(x,M.x,M.y,M.z,R)}for(let x=0,S=_.length;x<S;++x){let E=_[x],R=E.start,A=E.count;for(let P=R,D=R+A;P<D;P+=3)w(e.getX(P+0)),w(e.getX(P+1)),w(e.getX(P+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new tt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let r=new I,s=new I,o=new I,a=new I,l=new I,c=new I,u=new I,h=new I;if(e)for(let d=0,f=e.count;d<f;d+=3){let p=e.getX(d+0),y=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,p),s.fromBufferAttribute(t,y),o.fromBufferAttribute(t,m),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(n,p),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)an.fromBufferAttribute(e,t),an.normalize(),e.setXYZ(t,an.x,an.y,an.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u),f=0,p=0;for(let y=0,m=l.length;y<m;y++){a.isInterleavedBufferAttribute?f=l[y]*a.data.stride+a.offset:f=l[y]*u;for(let g=0;g<u;g++)d[p++]=c[f++]}return new tt(d,u,h)}if(this.index===null)return Qe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let a in r){let l=r[a],c=e(l,n);t.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let c in r){let u=r[c];this.setAttribute(c,u.clone(t))}let s=e.morphAttributes;for(let c in s){let u=[],h=s[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},ys=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=oh,this.updateRanges=[],this.version=0,this.uuid=Bn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Bn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Bn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},gn=new I,bs=class i{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.applyMatrix4(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.applyNormalMatrix(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)gn.fromBufferAttribute(this,t),gn.transformDirection(e),this.setXYZ(t,gn.x,gn.y,gn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Kn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Et(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Et(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Et(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Et(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Et(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Kn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Kn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Kn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Kn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array),r=Et(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Et(t,this.array),n=Et(n,this.array),r=Et(r,this.array),s=Et(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){oo("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new tt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){oo("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},pu=new I,U0=new I,O0=new ct,Dn=class{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=pu.subVectors(n,t).cross(U0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(pu),s=this.normal.dot(r);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/s;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(r,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||O0.getNormalMatrix(e),r=this.coplanarPoint(pu).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},B0=0,Tn=class extends Zn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:B0++}),this.uuid=Bn(),this.name="",this.type="Material",this.blending=sr,this.side=ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Hu,this.blendDst=Wu,this.blendEquation=Cr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ie(0,0,0),this.blendAlpha=0,this.depthFunc=us,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ap,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Va,this.stencilZFail=Va,this.stencilZPass=Va,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Qe(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){Qe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ie().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Dn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new me().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new me().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var _i=new I,mu=new I,va=new I,_a=new I,wi=class{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,_i)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=_i.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(_i.copy(this.origin).addScaledVector(this.direction,t),_i.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){mu.copy(e).add(t).multiplyScalar(.5),va.copy(t).sub(e).normalize(),_a.copy(this.origin).sub(mu);let s=e.distanceTo(t)*.5,o=-this.direction.dot(va),a=_a.dot(this.direction),l=-_a.dot(va),c=_a.lengthSq(),u=Math.abs(1-o*o),h,d,f,p;if(u>0)if(h=o*l-a,d=o*a-l,p=s*u,h>=0)if(d>=-p)if(d<=p){let y=1/u;h*=y,d*=y,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-p?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c):d<=p?(h=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-l),s),f=-h*h+d*(d+2*l)+c);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(mu).addScaledVector(va,d),f}intersectSphere(e,t){if(e.radius<0)return null;_i.subVectors(e.center,this.origin);let n=_i.dot(this.direction),r=_i.dot(_i)-n*n,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,_i)!==null}intersectTriangle(e,t,n,r,s){let o=this.origin,a=this.direction,l=a.x,c=a.y,u=a.z,h=e.x-o.x,d=e.y-o.y,f=e.z-o.z,p=t.x-o.x,y=t.y-o.y,m=t.z-o.z,g=n.x-o.x,_=n.y-o.y,M=n.z-o.z,v=Math.abs(l),T=Math.abs(c),b=Math.abs(u),w,x,S,E,R,A,P,D,F,z,L,V;if(v>=T&&v>=b?(S=l,A=h,F=p,V=g,l>=0?(w=c,x=u,E=d,R=f,P=y,D=m,z=_,L=M):(w=u,x=c,E=f,R=d,P=m,D=y,z=M,L=_)):T>=b?(S=c,A=d,F=y,V=_,c>=0?(w=u,x=l,E=f,R=h,P=m,D=p,z=M,L=g):(w=l,x=u,E=h,R=f,P=p,D=m,z=g,L=M)):(S=u,A=f,F=m,V=M,u>=0?(w=l,x=c,E=h,R=d,P=p,D=y,z=g,L=_):(w=c,x=l,E=d,R=h,P=y,D=p,z=_,L=g)),S===0)return null;let k=w/S,W=x/S,J=1/S,oe=E-k*A,re=R-W*A,Te=P-k*F,Ee=D-W*F,Re=z-k*V,se=L-W*V,le=Re*Ee-se*Te,X=oe*se-re*Re,q=Te*re-Ee*oe;if(r){if(le<0||X<0||q<0)return null}else if((le<0||X<0||q<0)&&(le>0||X>0||q>0))return null;let $=le+X+q;if($===0)return null;let pe=J*(le*A+X*F+q*V);return($>0?pe<0:pe>0)?null:this.at(pe/$,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Yt=class extends Tn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ie(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Si,this.combine=Xu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},sf=new Ne,br=new wi,Ma=new kt,of=new I,Ta=new I,Sa=new I,wa=new I,gu=new I,Aa=new I,af=new I,Ea=new I,Se=class extends Ut{constructor(e=new it,t=new Yt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Aa.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let u=a[l],h=s[l];u!==0&&(gu.fromBufferAttribute(h,e),o?Aa.addScaledVector(gu,u):Aa.addScaledVector(gu.sub(t),u))}t.add(Aa)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ma.copy(n.boundingSphere),Ma.applyMatrix4(s),br.copy(e.ray).recast(e.near),!(Ma.containsPoint(br.origin)===!1&&(br.intersectSphere(Ma,of)===null||br.origin.distanceToSquared(of)>(e.far-e.near)**2))&&(sf.copy(s).invert(),br.copy(e.ray).applyMatrix4(sf),!(n.boundingBox!==null&&br.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,br)))}_computeIntersections(e,t,n){let r,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,y=d.length;p<y;p++){let m=d[p],g=o[m.materialIndex],_=Math.max(m.start,f.start),M=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=_,T=M;v<T;v+=3){let b=a.getX(v),w=a.getX(v+1),x=a.getX(v+2);r=Ca(this,g,e,n,c,u,h,b,w,x),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let p=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let m=p,g=y;m<g;m+=3){let _=a.getX(m),M=a.getX(m+1),v=a.getX(m+2);r=Ca(this,o,e,n,c,u,h,_,M,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let p=0,y=d.length;p<y;p++){let m=d[p],g=o[m.materialIndex],_=Math.max(m.start,f.start),M=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=_,T=M;v<T;v+=3){let b=v,w=v+1,x=v+2;r=Ca(this,g,e,n,c,u,h,b,w,x),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let p=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let m=p,g=y;m<g;m+=3){let _=m,M=m+1,v=m+2;r=Ca(this,o,e,n,c,u,h,_,M,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};function k0(i,e,t,n,r,s,o,a){let l;if(e.side===yn?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===ui,a),l===null)return null;Ea.copy(a),Ea.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Ea);return c<t.near||c>t.far?null:{distance:c,point:Ea.clone(),object:i}}function Ca(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,Ta),i.getVertexPosition(l,Sa),i.getVertexPosition(c,wa);let u=k0(i,e,t,n,Ta,Sa,wa,af);if(u){let h=new I;ji.getBarycoord(af,Ta,Sa,wa,h),r&&(u.uv=ji.getInterpolatedAttribute(r,a,l,c,h,new me)),s&&(u.uv1=ji.getInterpolatedAttribute(s,a,l,c,h,new me)),o&&(u.normal=ji.getInterpolatedAttribute(o,a,l,c,h,new I),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new I,materialIndex:0};ji.getNormal(Ta,Sa,wa,d.normal),u.face=d,u.barycoord=h}return u}var js=new mt,lf=new mt,cf=new mt,z0=new mt,uf=new Ne,Ra=new I,xu=new kt,hf=new Ne,yu=new wi,ho=class extends Se{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=wu,this.bindMatrix=new Ne,this.bindMatrixInverse=new Ne,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new ln),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ra),this.boundingBox.expandByPoint(Ra)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new kt),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ra),this.boundingSphere.expandByPoint(Ra)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xu.copy(this.boundingSphere),xu.applyMatrix4(r),e.ray.intersectsSphere(xu)!==!1&&(hf.copy(r).invert(),yu.copy(e.ray).applyMatrix4(hf),!(this.boundingBox!==null&&yu.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,yu)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new mt,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);let s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===wu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===ip?this.bindMatrixInverse.copy(this.bindMatrix).invert():Qe("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,r=this.geometry;lf.fromBufferAttribute(r.attributes.skinIndex,e),cf.fromBufferAttribute(r.attributes.skinWeight,e),t.isVector4?(js.copy(t),t.set(0,0,0,0)):(js.set(...t,1),t.set(0,0,0)),js.applyMatrix4(this.bindMatrix);for(let s=0;s<4;s++){let o=cf.getComponent(s);if(o!==0){let a=lf.getComponent(s);uf.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(z0.copy(js).applyMatrix4(uf),o)}}return t.isVector4&&(t.w=js.w),t.applyMatrix4(this.bindMatrixInverse)}},vs=class extends Ut{constructor(){super(),this.isBone=!0,this.type="Bone"}},ai=class extends Gt{constructor(e=null,t=1,n=1,r,s,o,a,l,c=Kt,u=Kt,h,d){super(null,o,a,l,c,u,r,s,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},df=new Ne,V0=new Ne,fo=class i{constructor(e=[],t=[]){this.uuid=Bn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Qe("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,r=this.bones.length;n<r;n++)this.boneInverses.push(new Ne)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new Ne;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let s=0,o=e.length;s<o;s++){let a=e[s]?e[s].matrixWorld:V0;df.multiplyMatrices(a,t[s]),df.toArray(n,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new ai(t,e,e,bn,Ln);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let r=this.bones[t];if(r.name===e)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){let s=e.bones[n],o=t[s];o===void 0&&(Qe("Skeleton: No bone found with UUID:",s),o=new vs),this.bones.push(o),this.boneInverses.push(new Ne().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let r=0,s=t.length;r<s;r++){let o=t[r];e.bones.push(o.uuid);let a=n[r];e.boneInverses.push(a.toArray())}return e}},jn=class extends tt{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ss=new Ne,ff=new Ne,Pa=[],pf=new ln,G0=new Ne,Js=new Se,$s=new kt,Zt=class extends Se{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new jn(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,G0)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new ln),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ss),pf.copy(e.boundingBox).applyMatrix4(ss),this.boundingBox.union(pf)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new kt),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ss),$s.copy(e.boundingSphere).applyMatrix4(ss),this.boundingSphere.union($s)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=n.length+1,o=e*s+1;for(let a=0;a<n.length;a++)n[a]=r[o+a]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Js.geometry=this.geometry,Js.material=this.material,Js.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),$s.copy(this.boundingSphere),$s.applyMatrix4(n),e.ray.intersectsSphere($s)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,ss),ff.multiplyMatrices(n,ss),Js.matrixWorld=ff,Js.raycast(e,Pa);for(let o=0,a=Pa.length;o<a;o++){let l=Pa[o];l.instanceId=s,l.object=this,t.push(l)}Pa.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new jn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new ai(new Float32Array(r*this.count),r,this.count,Al,Ln));let s=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;return s[l]=a,s.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},vr=new kt,H0=new me(.5,.5),Ia=new I,_s=class{constructor(e=new Dn,t=new Dn,n=new Dn,r=new Dn,s=new Dn,o=new Dn){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Yn,n=!1){let r=this.planes,s=e.elements,o=s[0],a=s[1],l=s[2],c=s[3],u=s[4],h=s[5],d=s[6],f=s[7],p=s[8],y=s[9],m=s[10],g=s[11],_=s[12],M=s[13],v=s[14],T=s[15];if(r[0].setComponents(c-o,f-u,g-p,T-_).normalize(),r[1].setComponents(c+o,f+u,g+p,T+_).normalize(),r[2].setComponents(c+a,f+h,g+y,T+M).normalize(),r[3].setComponents(c-a,f-h,g-y,T-M).normalize(),n)r[4].setComponents(l,d,m,v).normalize(),r[5].setComponents(c-l,f-d,g-m,T-v).normalize();else if(r[4].setComponents(c-l,f-d,g-m,T-v).normalize(),t===Yn)r[5].setComponents(c+l,f+d,g+m,T+v).normalize();else if(t===ds)r[5].setComponents(l,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),vr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),vr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(vr)}intersectsSprite(e){vr.center.set(0,0,0);let t=H0.distanceTo(e.center);return vr.radius=.7071067811865476+t,vr.applyMatrix4(e.matrixWorld),this.intersectsSphere(vr)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Ia.x=r.normal.x>0?e.max.x:e.min.x,Ia.y=r.normal.y>0?e.max.y:e.min.y,Ia.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ia)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var wr=class extends Tn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ie(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Qa=new I,el=new I,mf=new Ne,Qs=new wi,Da=new kt,bu=new I,gf=new I,Ai=class extends Ut{constructor(e=new it,t=new wr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let r=1,s=t.count;r<s;r++)Qa.fromBufferAttribute(t,r-1),el.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=Qa.distanceTo(el);e.setAttribute("lineDistance",new Ke(n,1))}else Qe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Da.copy(n.boundingSphere),Da.applyMatrix4(r),Da.radius+=s,e.ray.intersectsSphere(Da)===!1)return;mf.copy(r).invert(),Qs.copy(e.ray).applyMatrix4(mf);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){let f=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let y=f,m=p-1;y<m;y+=c){let g=u.getX(y),_=u.getX(y+1),M=La(this,e,Qs,l,g,_,y);M&&t.push(M)}if(this.isLineLoop){let y=u.getX(p-1),m=u.getX(f),g=La(this,e,Qs,l,y,m,p-1);g&&t.push(g)}}else{let f=Math.max(0,o.start),p=Math.min(d.count,o.start+o.count);for(let y=f,m=p-1;y<m;y+=c){let g=La(this,e,Qs,l,y,y+1,y);g&&t.push(g)}if(this.isLineLoop){let y=La(this,e,Qs,l,p-1,f,p-1);y&&t.push(y)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function La(i,e,t,n,r,s,o){let a=i.geometry.attributes.position;if(Qa.fromBufferAttribute(a,r),el.fromBufferAttribute(a,s),t.distanceSqToSegment(Qa,el,bu,gf)>n)return;bu.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(bu);if(!(c<e.near||c>e.far))return{distance:c,point:gf.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}var xf=new I,yf=new I,Ms=class extends Ai{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let r=0,s=t.count;r<s;r+=2)xf.fromBufferAttribute(t,r),yf.fromBufferAttribute(t,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+xf.distanceTo(yf);e.setAttribute("lineDistance",new Ke(n,1))}else Qe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},po=class extends Ai{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},$i=class extends Tn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ie(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},bf=new Ne,Pu=new wi,Na=new kt,Fa=new I,Jn=class extends Ut{constructor(e=new it,t=new $i){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Na.copy(n.boundingSphere),Na.applyMatrix4(r),Na.radius+=s,e.ray.intersectsSphere(Na)===!1)return;bf.copy(r).invert(),Pu.copy(e.ray).applyMatrix4(bf);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){let d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let p=d,y=f;p<y;p++){let m=c.getX(p);Fa.fromBufferAttribute(h,m),vf(Fa,m,l,r,e,t,this)}}else{let d=Math.max(0,o.start),f=Math.min(h.count,o.start+o.count);for(let p=d,y=f;p<y;p++)Fa.fromBufferAttribute(h,p),vf(Fa,p,l,r,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function vf(i,e,t,n,r,s,o){let a=Pu.distanceSqToPoint(i);if(a<t){let l=new I;Pu.closestPointToPoint(i,l),l.applyMatrix4(n);let c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var mo=class extends Gt{constructor(e=[],t=ar,n,r,s,o,a,l,c,u){super(e,t,n,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Qi=class extends Gt{constructor(e,t,n=ei,r,s,o,a=Kt,l=Kt,c,u=oi,h=1){if(u!==oi&&u!==lr)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:h};super(d,r,s,o,a,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ms(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},tl=class extends Qi{constructor(e,t=ei,n=ar,r,s,o=Kt,a=Kt,l,c=oi){let u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,n,r,s,o,a,l,c),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},go=class extends Gt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ot=class i extends it{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,f=0;p("z","y","x",-1,-1,n,t,e,o,s,0),p("z","y","x",1,-1,n,t,-e,o,s,1),p("x","z","y",1,1,e,n,t,r,o,2),p("x","z","y",1,-1,e,n,-t,r,o,3),p("x","y","z",1,-1,e,t,n,r,s,4),p("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new Ke(c,3)),this.setAttribute("normal",new Ke(u,3)),this.setAttribute("uv",new Ke(h,2));function p(y,m,g,_,M,v,T,b,w,x,S){let E=v/w,R=T/x,A=v/2,P=T/2,D=b/2,F=w+1,z=x+1,L=0,V=0,k=new I;for(let W=0;W<z;W++){let J=W*R-P;for(let oe=0;oe<F;oe++){let re=oe*E-A;k[y]=re*_,k[m]=J*M,k[g]=D,c.push(k.x,k.y,k.z),k[y]=0,k[m]=0,k[g]=b>0?1:-1,u.push(k.x,k.y,k.z),h.push(oe/w),h.push(1-W/x),L+=1}}for(let W=0;W<x;W++)for(let J=0;J<w;J++){let oe=d+J+F*W,re=d+J+F*(W+1),Te=d+(J+1)+F*(W+1),Ee=d+(J+1)+F*W;l.push(oe,re,Ee),l.push(re,Te,Ee),V+=6}a.addGroup(f,V,S),f+=V,d+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Ei=class i extends it{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],l=[],c=new I,u=new me;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){let f=n+h/t*r;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new Ke(o,3)),this.setAttribute("normal",new Ke(a,3)),this.setAttribute("uv",new Ke(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},st=class i extends it{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;r=Math.floor(r),s=Math.floor(s);let u=[],h=[],d=[],f=[],p=0,y=[],m=n/2,g=0;_(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(u),this.setAttribute("position",new Ke(h,3)),this.setAttribute("normal",new Ke(d,3)),this.setAttribute("uv",new Ke(f,2));function _(){let v=new I,T=new I,b=0,w=(t-e)/n;for(let x=0;x<=s;x++){let S=[],E=x/s,R=E*(t-e)+e;for(let A=0;A<=r;A++){let P=A/r,D=P*l+a,F=Math.sin(D),z=Math.cos(D);T.x=R*F,T.y=-E*n+m,T.z=R*z,h.push(T.x,T.y,T.z),v.set(F,w,z).normalize(),d.push(v.x,v.y,v.z),f.push(P,1-E),S.push(p++)}y.push(S)}for(let x=0;x<r;x++)for(let S=0;S<s;S++){let E=y[S][x],R=y[S+1][x],A=y[S+1][x+1],P=y[S][x+1];(e>0||S!==0)&&(u.push(E,R,P),b+=3),(t>0||S!==s-1)&&(u.push(R,A,P),b+=3)}c.addGroup(g,b,0),g+=b}function M(v){let T=p,b=new me,w=new I,x=0,S=v===!0?e:t,E=v===!0?1:-1;for(let A=1;A<=r;A++)h.push(0,m*E,0),d.push(0,E,0),f.push(.5,.5),p++;let R=p;for(let A=0;A<=r;A++){let D=A/r*l+a,F=Math.cos(D),z=Math.sin(D);w.x=S*z,w.y=m*E,w.z=S*F,h.push(w.x,w.y,w.z),d.push(0,E,0),b.x=F*.5+.5,b.y=z*.5*E+.5,f.push(b.x,b.y),p++}for(let A=0;A<r;A++){let P=T+A,D=R+A;v===!0?u.push(D,D+1,P):u.push(D+1,D,P),x+=3}c.addGroup(g,x,v===!0?1:2),g+=x}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},xo=class i extends st{constructor(e=1,t=1,n=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,n,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var xn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Qe("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,s=n.length,o;t?o=t:o=e*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=n[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===o)return r/(s-1);let u=n[r],d=n[r+1]-u,f=(o-u)/d;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new me:new I);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new I,r=[],s=[],o=[],a=new I,l=new Ne;for(let f=0;f<=e;f++){let p=f/e;r[f]=this.getTangentAt(p,new I)}s[0]=new I,o[0]=new I;let c=Number.MAX_VALUE,u=Math.abs(r[0].x),h=Math.abs(r[0].y),d=Math.abs(r[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();let p=Math.acos(ut(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,p))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(ut(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let p=1;p<=e;p++)s[p].applyMatrix4(l.makeRotationAxis(r[p],f*p)),o[p].crossVectors(r[p],s[p])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Ts=class extends xn{constructor(e=0,t=0,n=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new me){let n=t,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},nl=class extends Ts{constructor(e,t,n,r,s,o){super(e,t,n,n,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function ch(){let i=0,e=0,t=0,n=0;function r(s,o,a,l){i=s,e=a,t=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let d=(o-s)/c-(a-s)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,f*=u,r(o,a,d,f)},calc:function(s){let o=s*s,a=o*s;return i+e*s+t*o+n*a}}}var _f=new I,Mf=new I,vu=new ch,_u=new ch,Mu=new ch,Ot=class extends xn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new I){let n=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(Mf.subVectors(r[0],r[1]).add(r[0]),c=Mf);let h=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(_f.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=_f),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,p=Math.pow(c.distanceToSquared(h),f),y=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);y<1e-4&&(y=1),p<1e-4&&(p=y),m<1e-4&&(m=y),vu.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,p,y,m),_u.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,p,y,m),Mu.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,p,y,m)}else this.curveType==="catmullrom"&&(vu.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),_u.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),Mu.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(vu.calc(l),_u.calc(l),Mu.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new I().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Tf(i,e,t,n,r){let s=(n-e)*.5,o=(r-t)*.5,a=i*i,l=i*a;return(2*t-2*n+s+o)*l+(-3*t+3*n-2*s-o)*a+s*i+t}function W0(i,e){let t=1-i;return t*t*e}function X0(i,e){return 2*(1-i)*i*e}function q0(i,e){return i*i*e}function io(i,e,t,n){return W0(i,e)+X0(i,t)+q0(i,n)}function K0(i,e){let t=1-i;return t*t*t*e}function Y0(i,e){let t=1-i;return 3*t*t*i*e}function Z0(i,e){return 3*(1-i)*i*i*e}function j0(i,e){return i*i*i*e}function ro(i,e,t,n,r){return K0(i,e)+Y0(i,t)+Z0(i,n)+j0(i,r)}var yo=class extends xn{constructor(e=new me,t=new me,n=new me,r=new me){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new me){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(ro(e,r.x,s.x,o.x,a.x),ro(e,r.y,s.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},il=class extends xn{constructor(e=new I,t=new I,n=new I,r=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new I){let n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(ro(e,r.x,s.x,o.x,a.x),ro(e,r.y,s.y,o.y,a.y),ro(e,r.z,s.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},bo=class extends xn{constructor(e=new me,t=new me){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new me){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new me){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},rl=class extends xn{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},vo=class extends xn{constructor(e=new me,t=new me,n=new me){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new me){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(io(e,r.x,s.x,o.x),io(e,r.y,s.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},_o=class extends xn{constructor(e=new I,t=new I,n=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new I){let n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(io(e,r.x,s.x,o.x),io(e,r.y,s.y,o.y),io(e,r.z,s.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Mo=class extends xn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new me){let n=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return n.set(Tf(a,l.x,c.x,u.x,h.x),Tf(a,l.y,c.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let r=e.points[t];this.points.push(new me().fromArray(r))}return this}},sl=Object.freeze({__proto__:null,ArcCurve:nl,CatmullRomCurve3:Ot,CubicBezierCurve:yo,CubicBezierCurve3:il,EllipseCurve:Ts,LineCurve:bo,LineCurve3:rl,QuadraticBezierCurve:vo,QuadraticBezierCurve3:_o,SplineCurve:Mo}),ol=class extends xn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new sl[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=n){let o=r[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let r=e.curves[t];this.curves.push(new sl[r.type]().fromJSON(r))}return this}},ht=class extends ol{constructor(e){super(),this.type="Path",this.currentPoint=new me,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new bo(this.currentPoint.clone(),new me(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let s=new vo(this.currentPoint.clone(),new me(e,t),new me(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,o){let a=new yo(this.currentPoint.clone(),new me(e,t),new me(n,r),new me(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Mo(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,r,s,o),this}absarc(e,t,n,r,s,o){return this.absellipse(e,t,n,n,r,s,o),this}ellipse(e,t,n,r,s,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,r,s,o,a,l),this}absellipse(e,t,n,r,s,o,a,l){let c=new Ts(e,t,n,r,s,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},je=class extends ht{constructor(e){super(e),this.uuid=Bn(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let r=e.holes[t];this.holes.push(new ht().fromJSON(r))}return this}};function J0(i,e,t=2){let n=e&&e.length,r=n?e[0]*t:i.length,s=bp(i,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,l,c;if(n&&(s=n1(i,e,s,t)),i.length>80*t){a=i[0],l=i[1];let u=a,h=l;for(let d=t;d<r;d+=t){let f=i[d],p=i[d+1];f<a&&(a=f),p<l&&(l=p),f>u&&(u=f),p>h&&(h=p)}c=Math.max(u-a,h-l),c=c!==0?32767/c:0}return To(s,o,t,a,l,c,0),o}function bp(i,e,t,n,r){let s;if(r===f1(i,e,t,n)>0)for(let o=e;o<t;o+=n)s=Sf(o/n|0,i[o],i[o+1],s);else for(let o=t-n;o>=e;o-=n)s=Sf(o/n|0,i[o],i[o+1],s);return s&&Ss(s,s.next)&&(wo(s),s=s.next),s}function Ar(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Ss(t,t.next)||Bt(t.prev,t,t.next)===0)){if(wo(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function To(i,e,t,n,r,s,o){if(!i)return;!o&&s&&a1(i,n,r,s);let a=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(s?Q0(i,n,r,s):$0(i)){e.push(l.i,i.i,c.i),wo(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=e1(Ar(i),e),To(i,e,t,n,r,s,2)):o===2&&t1(i,e,t,n,r,s):To(Ar(i),e,t,n,r,s,1);break}}}function $0(i){let e=i.prev,t=i,n=i.next;if(Bt(e,t,n)>=0)return!1;let r=e.x,s=t.x,o=n.x,a=e.y,l=t.y,c=n.y,u=Math.min(r,s,o),h=Math.min(a,l,c),d=Math.max(r,s,o),f=Math.max(a,l,c),p=n.next;for(;p!==e;){if(p.x>=u&&p.x<=d&&p.y>=h&&p.y<=f&&eo(r,a,s,l,o,c,p.x,p.y)&&Bt(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function Q0(i,e,t,n){let r=i.prev,s=i,o=i.next;if(Bt(r,s,o)>=0)return!1;let a=r.x,l=s.x,c=o.x,u=r.y,h=s.y,d=o.y,f=Math.min(a,l,c),p=Math.min(u,h,d),y=Math.max(a,l,c),m=Math.max(u,h,d),g=Iu(f,p,e,t,n),_=Iu(y,m,e,t,n),M=i.prevZ,v=i.nextZ;for(;M&&M.z>=g&&v&&v.z<=_;){if(M.x>=f&&M.x<=y&&M.y>=p&&M.y<=m&&M!==r&&M!==o&&eo(a,u,l,h,c,d,M.x,M.y)&&Bt(M.prev,M,M.next)>=0||(M=M.prevZ,v.x>=f&&v.x<=y&&v.y>=p&&v.y<=m&&v!==r&&v!==o&&eo(a,u,l,h,c,d,v.x,v.y)&&Bt(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;M&&M.z>=g;){if(M.x>=f&&M.x<=y&&M.y>=p&&M.y<=m&&M!==r&&M!==o&&eo(a,u,l,h,c,d,M.x,M.y)&&Bt(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;v&&v.z<=_;){if(v.x>=f&&v.x<=y&&v.y>=p&&v.y<=m&&v!==r&&v!==o&&eo(a,u,l,h,c,d,v.x,v.y)&&Bt(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function e1(i,e){let t=i;do{let n=t.prev,r=t.next.next;!Ss(n,r)&&_p(n,t,t.next,r)&&So(n,r)&&So(r,n)&&(e.push(n.i,t.i,r.i),wo(t),wo(t.next),t=i=r),t=t.next}while(t!==i);return Ar(t)}function t1(i,e,t,n,r,s){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&u1(o,a)){let l=Mp(o,a);o=Ar(o,o.next),l=Ar(l,l.next),To(o,e,t,n,r,s,0),To(l,e,t,n,r,s,0);return}a=a.next}o=o.next}while(o!==i)}function n1(i,e,t,n){let r=[];for(let s=0,o=e.length;s<o;s++){let a=e[s]*n,l=s<o-1?e[s+1]*n:i.length,c=bp(i,a,l,n,!1);c===c.next&&(c.steiner=!0),r.push(c1(c))}r.sort(i1);for(let s=0;s<r.length;s++)t=r1(r[s],t);return t}function i1(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),r=(e.next.y-e.y)/(e.next.x-e.x);t=n-r}return t}function r1(i,e){let t=s1(i,e);if(!t)return e;let n=Mp(t,i);return Ar(n,n.next),Ar(t,t.next)}function s1(i,e){let t=e,n=i.x,r=i.y,s=-1/0,o;if(Ss(i,t))return t;do{if(Ss(i,t.next))return t.next;if(r<=t.y&&r>=t.next.y&&t.next.y!==t.y){let h=t.x+(r-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=n&&h>s&&(s=h,o=t.x<t.next.x?t:t.next,h===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,u=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&vp(r<c?n:s,r,l,c,r<c?s:n,r,t.x,t.y)){let h=Math.abs(r-t.y)/(n-t.x);So(t,i)&&(h<u||h===u&&(t.x>o.x||t.x===o.x&&o1(o,t)))&&(o=t,u=h)}t=t.next}while(t!==a);return o}function o1(i,e){return Bt(i.prev,i,e.prev)<0&&Bt(e.next,i,i.next)<0}function a1(i,e,t,n){let r=i;do r.z===0&&(r.z=Iu(r.x,r.y,e,t,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,l1(r)}function l1(i){let e,t=1;do{let n=i,r;i=null;let s=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(r=n,n=n.nextZ,a--):(r=o,o=o.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;n=o}s.nextZ=null,t*=2}while(e>1);return i}function Iu(i,e,t,n,r){return i=(i-t)*r|0,e=(e-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function c1(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function vp(i,e,t,n,r,s,o,a){return(r-o)*(e-a)>=(i-o)*(s-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(n-a)}function eo(i,e,t,n,r,s,o,a){return!(i===o&&e===a)&&vp(i,e,t,n,r,s,o,a)}function u1(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!h1(i,e)&&(So(i,e)&&So(e,i)&&d1(i,e)&&(Bt(i.prev,i,e.prev)||Bt(i,e.prev,e))||Ss(i,e)&&Bt(i.prev,i,i.next)>0&&Bt(e.prev,e,e.next)>0)}function Bt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Ss(i,e){return i.x===e.x&&i.y===e.y}function _p(i,e,t,n){let r=Oa(Bt(i,e,t)),s=Oa(Bt(i,e,n)),o=Oa(Bt(t,n,i)),a=Oa(Bt(t,n,e));return!!(r!==s&&o!==a||r===0&&Ua(i,t,e)||s===0&&Ua(i,n,e)||o===0&&Ua(t,i,n)||a===0&&Ua(t,e,n))}function Ua(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Oa(i){return i>0?1:i<0?-1:0}function h1(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&_p(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function So(i,e){return Bt(i.prev,i,i.next)<0?Bt(i,e,i.next)>=0&&Bt(i,i.prev,e)>=0:Bt(i,e,i.prev)<0||Bt(i,i.next,e)<0}function d1(i,e){let t=i,n=!1,r=(i.x+e.x)/2,s=(i.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Mp(i,e){let t=Du(i.i,i.x,i.y),n=Du(e.i,e.x,e.y),r=i.next,s=e.prev;return i.next=e,e.prev=i,t.next=r,r.prev=t,n.next=t,t.prev=n,s.next=n,n.prev=s,n}function Sf(i,e,t,n){let r=Du(i,e,t);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function wo(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Du(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function f1(i,e,t,n){let r=0;for(let s=e,o=t-n;s<t;s+=n)r+=(i[o]-i[s])*(i[s+1]+i[o+1]),o=s;return r}var Lu=class{static triangulate(e,t,n=2){return J0(e,t,n)}},ri=class i{static area(e){let t=e.length,n=0;for(let r=t-1,s=0;s<t;r=s++)n+=e[r].x*e[s].y-e[s].x*e[r].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],r=[],s=[];wf(e),Af(n,e);let o=e.length;t.forEach(wf);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,Af(n,t[l]);let a=Lu.triangulate(n,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}};function wf(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Af(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var at=class i extends it{constructor(e=new je([new me(.5,.5),new me(-.5,.5),new me(-.5,-.5),new me(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new Ke(r,3)),this.setAttribute("uv",new Ke(s,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:f-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,g=t.extrudePath,_=t.UVGenerator!==void 0?t.UVGenerator:p1,M,v=!1,T,b,w,x;if(g){M=g.getSpacedPoints(u),v=!0,d=!1;let H=g.isCatmullRomCurve3?g.closed:!1;T=g.computeFrenetFrames(u,H),b=new I,w=new I,x=new I}d||(m=0,f=0,p=0,y=0);let S=a.extractPoints(c),E=S.shape,R=S.holes;if(!ri.isClockWise(E)){E=E.reverse();for(let H=0,B=R.length;H<B;H++){let Z=R[H];ri.isClockWise(Z)&&(R[H]=Z.reverse())}}function P(H){let Z=10000000000000001e-36,ne=H[0];for(let te=1;te<=H.length;te++){let ce=te%H.length,xe=H[ce],ve=xe.x-ne.x,Ae=xe.y-ne.y,G=ve*ve+Ae*Ae,nt=Math.max(Math.abs(xe.x),Math.abs(xe.y),Math.abs(ne.x),Math.abs(ne.y)),Je=Z*nt*nt;if(G<=Je){H.splice(ce,1),te--;continue}ne=xe}}P(E),R.forEach(P);let D=R.length,F=E;for(let H=0;H<D;H++){let B=R[H];E=E.concat(B)}function z(H,B,Z){return B||rt("ExtrudeGeometry: vec does not exist"),H.clone().addScaledVector(B,Z)}let L=E.length;function V(H,B,Z){let ne,te,ce,xe=H.x-B.x,ve=H.y-B.y,Ae=Z.x-H.x,G=Z.y-H.y,nt=xe*xe+ve*ve,Je=xe*G-ve*Ae;if(Math.abs(Je)>Number.EPSILON){let O=Math.sqrt(nt),C=Math.sqrt(Ae*Ae+G*G),j=B.x-ve/O,U=B.y+xe/O,Y=Z.x-G/C,ae=Z.y+Ae/C,ge=((Y-j)*G-(ae-U)*Ae)/(xe*G-ve*Ae);ne=j+xe*ge-H.x,te=U+ve*ge-H.y;let ie=ne*ne+te*te;if(ie<=2)return new me(ne,te);ce=Math.sqrt(ie/2)}else{let O=!1;xe>Number.EPSILON?Ae>Number.EPSILON&&(O=!0):xe<-Number.EPSILON?Ae<-Number.EPSILON&&(O=!0):Math.sign(ve)===Math.sign(G)&&(O=!0),O?(ne=-ve,te=xe,ce=Math.sqrt(nt)):(ne=xe,te=ve,ce=Math.sqrt(nt/2))}return new me(ne/ce,te/ce)}let k=[];for(let H=0,B=F.length,Z=B-1,ne=H+1;H<B;H++,Z++,ne++)Z===B&&(Z=0),ne===B&&(ne=0),k[H]=V(F[H],F[Z],F[ne]);let W=[],J,oe=k.concat();for(let H=0,B=D;H<B;H++){let Z=R[H];J=[];for(let ne=0,te=Z.length,ce=te-1,xe=ne+1;ne<te;ne++,ce++,xe++)ce===te&&(ce=0),xe===te&&(xe=0),J[ne]=V(Z[ne],Z[ce],Z[xe]);W.push(J),oe=oe.concat(J)}let re;if(m===0)re=ri.triangulateShape(F,R);else{let H=[],B=[];for(let Z=0;Z<m;Z++){let ne=Z/m,te=f*Math.cos(ne*Math.PI/2),ce=p*Math.sin(ne*Math.PI/2)+y;for(let xe=0,ve=F.length;xe<ve;xe++){let Ae=z(F[xe],k[xe],ce);X(Ae.x,Ae.y,-te),ne===0&&H.push(Ae)}for(let xe=0,ve=D;xe<ve;xe++){let Ae=R[xe];J=W[xe];let G=[];for(let nt=0,Je=Ae.length;nt<Je;nt++){let O=z(Ae[nt],J[nt],ce);X(O.x,O.y,-te),ne===0&&G.push(O)}ne===0&&B.push(G)}}re=ri.triangulateShape(H,B)}let Te=re.length,Ee=p+y;for(let H=0;H<L;H++){let B=d?z(E[H],oe[H],Ee):E[H];v?(w.copy(T.normals[0]).multiplyScalar(B.x),b.copy(T.binormals[0]).multiplyScalar(B.y),x.copy(M[0]).add(w).add(b),X(x.x,x.y,x.z)):X(B.x,B.y,0)}for(let H=1;H<=u;H++)for(let B=0;B<L;B++){let Z=d?z(E[B],oe[B],Ee):E[B];v?(w.copy(T.normals[H]).multiplyScalar(Z.x),b.copy(T.binormals[H]).multiplyScalar(Z.y),x.copy(M[H]).add(w).add(b),X(x.x,x.y,x.z)):X(Z.x,Z.y,h/u*H)}for(let H=m-1;H>=0;H--){let B=H/m,Z=f*Math.cos(B*Math.PI/2),ne=p*Math.sin(B*Math.PI/2)+y;for(let te=0,ce=F.length;te<ce;te++){let xe=z(F[te],k[te],ne);X(xe.x,xe.y,h+Z)}for(let te=0,ce=R.length;te<ce;te++){let xe=R[te];J=W[te];for(let ve=0,Ae=xe.length;ve<Ae;ve++){let G=z(xe[ve],J[ve],ne);v?X(G.x,G.y+M[u-1].y,M[u-1].x+Z):X(G.x,G.y,h+Z)}}}Re(),se();function Re(){let H=r.length/3;if(d){let B=0,Z=L*B;for(let ne=0;ne<Te;ne++){let te=re[ne];q(te[2]+Z,te[1]+Z,te[0]+Z)}B=u+m*2,Z=L*B;for(let ne=0;ne<Te;ne++){let te=re[ne];q(te[0]+Z,te[1]+Z,te[2]+Z)}}else{for(let B=0;B<Te;B++){let Z=re[B];q(Z[2],Z[1],Z[0])}for(let B=0;B<Te;B++){let Z=re[B];q(Z[0]+L*u,Z[1]+L*u,Z[2]+L*u)}}n.addGroup(H,r.length/3-H,0)}function se(){let H=r.length/3,B=0;le(F,B),B+=F.length;for(let Z=0,ne=R.length;Z<ne;Z++){let te=R[Z];le(te,B),B+=te.length}n.addGroup(H,r.length/3-H,1)}function le(H,B){let Z=H.length;for(;--Z>=0;){let ne=Z,te=Z-1;te<0&&(te=H.length-1);for(let ce=0,xe=u+m*2;ce<xe;ce++){let ve=L*ce,Ae=L*(ce+1),G=B+ne+ve,nt=B+te+ve,Je=B+te+Ae,O=B+ne+Ae;$(G,nt,Je,O)}}}function X(H,B,Z){l.push(H),l.push(B),l.push(Z)}function q(H,B,Z){pe(H),pe(B),pe(Z);let ne=r.length/3,te=_.generateTopUV(n,r,ne-3,ne-2,ne-1);K(te[0]),K(te[1]),K(te[2])}function $(H,B,Z,ne){pe(H),pe(B),pe(ne),pe(B),pe(Z),pe(ne);let te=r.length/3,ce=_.generateSideWallUV(n,r,te-6,te-3,te-2,te-1);K(ce[0]),K(ce[1]),K(ce[3]),K(ce[1]),K(ce[2]),K(ce[3])}function pe(H){r.push(l[H*3+0]),r.push(l[H*3+1]),r.push(l[H*3+2])}function K(H){s.push(H.x),s.push(H.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return m1(t,n,e)}static fromJSON(e,t){let n=[];for(let s=0,o=e.shapes.length;s<o;s++){let a=t[e.shapes[s]];n.push(a)}let r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new sl[r.type]().fromJSON(r)),new i(n,e.options)}},p1={generateTopUV:function(i,e,t,n,r){let s=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[r*3],u=e[r*3+1];return[new me(s,o),new me(a,l),new me(c,u)]},generateSideWallUV:function(i,e,t,n,r,s){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],h=e[n*3+2],d=e[r*3],f=e[r*3+1],p=e[r*3+2],y=e[s*3],m=e[s*3+1],g=e[s*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new me(o,1-l),new me(c,1-h),new me(d,1-p),new me(y,1-g)]:[new me(a,1-l),new me(u,1-h),new me(f,1-p),new me(m,1-g)]}};function m1(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){let s=i[n];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var jt=class i extends it{constructor(e=[new me(0,-.5),new me(.5,0),new me(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=ut(r,0,Math.PI*2);let s=[],o=[],a=[],l=[],c=[],u=1/t,h=new I,d=new me,f=new I,p=new I,y=new I,m=0,g=0;for(let _=0;_<=e.length-1;_++)switch(_){case 0:m=e[_+1].x-e[_].x,g=e[_+1].y-e[_].y,f.x=g*1,f.y=-m,f.z=g*0,y.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(y.x,y.y,y.z);break;default:m=e[_+1].x-e[_].x,g=e[_+1].y-e[_].y,f.x=g*1,f.y=-m,f.z=g*0,p.copy(f),f.x+=y.x,f.y+=y.y,f.z+=y.z,f.normalize(),l.push(f.x,f.y,f.z),y.copy(p)}for(let _=0;_<=t;_++){let M=n+_*u*r,v=Math.sin(M),T=Math.cos(M);for(let b=0;b<=e.length-1;b++){h.x=e[b].x*v,h.y=e[b].y,h.z=e[b].x*T,o.push(h.x,h.y,h.z),d.x=_/t,d.y=b/(e.length-1),a.push(d.x,d.y);let w=l[3*b+0]*v,x=l[3*b+1],S=l[3*b+0]*T;c.push(w,x,S)}}for(let _=0;_<t;_++)for(let M=0;M<e.length-1;M++){let v=M+_*e.length,T=v,b=v+e.length,w=v+e.length+1,x=v+1;s.push(T,b,x),s.push(w,x,b)}this.setIndex(s),this.setAttribute("position",new Ke(o,3)),this.setAttribute("uv",new Ke(a,2)),this.setAttribute("normal",new Ke(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.points,e.segments,e.phiStart,e.phiLength)}};var kn=class i extends it{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,u=l+1,h=e/a,d=t/l,f=[],p=[],y=[],m=[];for(let g=0;g<u;g++){let _=g*d-o;for(let M=0;M<c;M++){let v=M*h-s;p.push(v,-_,0),y.push(0,0,1),m.push(M/a),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let _=0;_<a;_++){let M=_+c*g,v=_+c*(g+1),T=_+1+c*(g+1),b=_+1+c*g;f.push(M,v,b),f.push(v,T,b)}this.setIndex(f),this.setAttribute("position",new Ke(p,3)),this.setAttribute("normal",new Ke(y,3)),this.setAttribute("uv",new Ke(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var Ao=class i extends it{constructor(e=new je([new me(0,.5),new me(-.5,-.5),new me(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],r=[],s=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new Ke(r,3)),this.setAttribute("normal",new Ke(s,3)),this.setAttribute("uv",new Ke(o,2));function c(u){let h=r.length/3,d=u.extractPoints(t),f=d.shape,p=d.holes;ri.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,g=p.length;m<g;m++){let _=p[m];ri.isClockWise(_)===!0&&(p[m]=_.reverse())}let y=ri.triangulateShape(f,p);for(let m=0,g=p.length;m<g;m++){let _=p[m];f=f.concat(_)}for(let m=0,g=f.length;m<g;m++){let _=f[m];r.push(_.x,_.y,0),s.push(0,0,1),o.push(_.x,_.y)}for(let m=0,g=y.length;m<g;m++){let _=y[m],M=_[0]+h,v=_[1]+h,T=_[2]+h;n.push(M,v,T),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return g1(t,e)}static fromJSON(e,t){let n=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];n.push(o)}return new i(n,e.curveSegments)}};function g1(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let r=i[t];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e}var Eo=class i extends it{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new I,d=new I,f=[],p=[],y=[],m=[];for(let g=0;g<=n;g++){let _=[],M=g/n,v=o+M*a,T=e*Math.cos(v),b=Math.sqrt(e*e-T*T),w=0;g===0&&o===0?w=.5/t:g===n&&l===Math.PI&&(w=-.5/t);for(let x=0;x<=t;x++){let S=x/t,E=r+S*s;h.x=-b*Math.cos(E),h.y=T,h.z=b*Math.sin(E),p.push(h.x,h.y,h.z),d.copy(h).normalize(),y.push(d.x,d.y,d.z),m.push(S+w,1-M),_.push(c++)}u.push(_)}for(let g=0;g<n;g++)for(let _=0;_<t;_++){let M=u[g][_+1],v=u[g][_],T=u[g+1][_],b=u[g+1][_+1];(g!==0||o>0)&&f.push(M,v,b),(g!==n-1||l<Math.PI)&&f.push(v,T,b)}this.setIndex(f),this.setAttribute("position",new Ke(p,3)),this.setAttribute("normal",new Ke(y,3)),this.setAttribute("uv",new Ke(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var zt=class i extends it{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s,thetaStart:o,thetaLength:a},n=Math.floor(n),r=Math.floor(r);let l=[],c=[],u=[],h=[],d=new I,f=new I,p=new I;for(let y=0;y<=n;y++){let m=o+y/n*a;for(let g=0;g<=r;g++){let _=g/r*s;f.x=(e+t*Math.cos(m))*Math.cos(_),f.y=(e+t*Math.cos(m))*Math.sin(_),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(_),d.y=e*Math.sin(_),p.subVectors(f,d).normalize(),u.push(p.x,p.y,p.z),h.push(g/r),h.push(y/n)}}for(let y=1;y<=n;y++)for(let m=1;m<=r;m++){let g=(r+1)*y+m-1,_=(r+1)*(y-1)+m-1,M=(r+1)*(y-1)+m,v=(r+1)*y+m;l.push(g,_,v),l.push(_,M,v)}this.setIndex(l),this.setAttribute("position",new Ke(c,3)),this.setAttribute("normal",new Ke(u,3)),this.setAttribute("uv",new Ke(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var nn=class i extends it{constructor(e=new _o(new I(-1,-1,0),new I(-1,1,0),new I(1,1,0)),t=64,n=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:r,closed:s};let o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new I,l=new I,c=new me,u=new I,h=[],d=[],f=[],p=[];y(),this.setIndex(p),this.setAttribute("position",new Ke(h,3)),this.setAttribute("normal",new Ke(d,3)),this.setAttribute("uv",new Ke(f,2));function y(){for(let M=0;M<t;M++)m(M);m(s===!1?t:0),_(),g()}function m(M){u=e.getPointAt(M/t,u);let v=o.normals[M],T=o.binormals[M];for(let b=0;b<=r;b++){let w=b/r*Math.PI*2,x=Math.sin(w),S=-Math.cos(w);l.x=S*v.x+x*T.x,l.y=S*v.y+x*T.y,l.z=S*v.z+x*T.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,h.push(a.x,a.y,a.z)}}function g(){for(let M=1;M<=t;M++)for(let v=1;v<=r;v++){let T=(r+1)*(M-1)+(v-1),b=(r+1)*M+(v-1),w=(r+1)*M+v,x=(r+1)*(M-1)+v;p.push(T,b,x),p.push(b,w,x)}}function _(){for(let M=0;M<=t;M++)for(let v=0;v<=r;v++)c.x=M/t,c.y=v/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new sl[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function Dr(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];if(Ef(r))r.isRenderTargetTexture?(Qe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone();else if(Array.isArray(r))if(Ef(r[0])){let s=[];for(let o=0,a=r.length;o<a;o++)s[o]=r[o].clone();e[t][n]=s}else e[t][n]=r.slice();else e[t][n]=r}}return e}function pn(i){let e={};for(let t=0;t<i.length;t++){let n=Dr(i[t]);for(let r in n)e[r]=n[r]}return e}function Ef(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function x1(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function uh(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:pt.workingColorSpace}var Tp={clone:Dr,merge:pn},y1=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,b1=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Vt=class extends Tn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=y1,this.fragmentShader=b1,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Dr(e.uniforms),this.uniformsGroups=x1(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case"t":this.uniforms[n].value=t[r.value]||null;break;case"c":this.uniforms[n].value=new Ie().setHex(r.value);break;case"v2":this.uniforms[n].value=new me().fromArray(r.value);break;case"v3":this.uniforms[n].value=new I().fromArray(r.value);break;case"v4":this.uniforms[n].value=new mt().fromArray(r.value);break;case"m3":this.uniforms[n].value=new ct().fromArray(r.value);break;case"m4":this.uniforms[n].value=new Ne().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},al=class extends Vt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},_t=class extends Tn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ie(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ie(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=oc,this.normalScale=new me(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Si,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Sn=class extends _t{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new me(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ut(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ie(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ie(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ie(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var ll=class extends Tn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=sp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},cl=class extends Tn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Zi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Ga(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function v1(i){function e(r,s){return i[r]-i[s]}let t=i.length,n=new Array(t);for(let r=0;r!==t;++r)n[r]=r;return n.sort(e),n}function Cf(i,e,t){let n=i.length,r=new i.constructor(n);for(let s=0,o=0;o!==n;++s){let a=t[s]*e;for(let l=0;l!==e;++l)r[o++]=i[a+l]}return r}function _1(i,e,t,n){let r=1,s=i[0];for(;s!==void 0&&s[n]===void 0;)s=i[r++];if(s===void 0)return;let o=s[n];if(o!==void 0)if(Array.isArray(o))do o=s[n],o!==void 0&&(e.push(s.time),t.push(...o)),s=i[r++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[n],o!==void 0&&(e.push(s.time),o.toArray(t,t.length)),s=i[r++];while(s!==void 0);else do o=s[n],o!==void 0&&(e.push(s.time),t.push(o)),s=i[r++];while(s!==void 0)}var li=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break e}o=t.length;break t}if(!(e>=s)){let a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ul=class extends li{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Eu,endingEnd:Eu}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case Cu:s=e,a=2*t-n;break;case Ru:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Cu:o=e,l=2*n-t;break;case Ru:o=1,l=n+r[1]-r[0];break;default:o=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),y=p*p,m=y*p,g=-d*m+2*d*y-d*p,_=(1+d)*m+(-1.5-2*d)*y+(-.5+d)*p+1,M=(-1-f)*m+(1.5+f)*y+.5*p,v=f*m-f*y;for(let T=0;T!==a;++T)s[T]=g*o[u+T]+_*o[c+T]+M*o[l+T]+v*o[h+T];return s}},hl=class extends li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(r-t),h=1-u;for(let d=0;d!==a;++d)s[d]=o[c+d]*h+o[l+d]*u;return s}},dl=class extends li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},fl=class extends li{interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this.inTangents,h=this.outTangents;if(!u||!h){let p=(n-t)/(r-t),y=1-p;for(let m=0;m!==a;++m)s[m]=o[c+m]*y+o[l+m]*p;return s}let d=a*2,f=e-1;for(let p=0;p!==a;++p){let y=o[c+p],m=o[l+p],g=f*d+p*2,_=h[g],M=h[g+1],v=e*d+p*2,T=u[v],b=u[v+1],w=T1(n,t,_,T,r);s[p]=Sp(w,y,M,b,m)}return s}};function Sp(i,e,t,n,r){let s=1-i;return s*s*s*e+3*s*s*i*t+3*s*i*i*n+i*i*i*r}function M1(i,e,t,n,r){let s=1-i;return 3*s*s*(t-e)+6*s*i*(n-t)+3*i*i*(r-n)}function T1(i,e,t,n,r){let s=(i-e)/(r-e);for(let o=0;o<8;o++){let a=Sp(s,e,t,n,r)-i;if(Math.abs(a)<1e-10)break;let l=M1(s,e,t,n,r);if(Math.abs(l)<1e-10)break;s=Math.max(0,Math.min(1,s-a/l))}return s}var wn=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Zi(t,this.TimeBufferType),this.values=Zi(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Zi(e.times,Array),values:Zi(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r),Ga(e.settings)&&(n.settings={inTangents:Zi(e.settings.inTangents,Array),outTangents:Zi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new dl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new hl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ul(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new fl(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Mr:t=this.InterpolantFactoryMethodDiscrete;break;case Tr:t=this.InterpolantFactoryMethodLinear;break;case za:t=this.InterpolantFactoryMethodSmooth;break;case Au:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Qe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Mr;case this.InterpolantFactoryMethodLinear:return Tr;case this.InterpolantFactoryMethodSmooth:return za;case this.InterpolantFactoryMethodBezier:return Au}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Ga(this.settings)&&(Rf(this.settings.inTangents,e),Rf(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(rt("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&(rt("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){rt("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){rt("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&o0(r))for(let a=0,l=r.length;a!==l;++a){let c=r[a];if(isNaN(c)){rt("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===za,s=e.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{let h=a*n,d=h-n,f=h+n;for(let p=0;p!==n;++p){let y=t[h+p];if(y!==t[d+p]||y!==t[f+p]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Ga(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Rf(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}wn.prototype.ValueTypeName="";wn.prototype.TimeBufferType=Float32Array;wn.prototype.ValueBufferType=Float32Array;wn.prototype.DefaultInterpolation=Tr;var Ci=class extends wn{constructor(e,t,n){super(e,t,n)}};Ci.prototype.ValueTypeName="bool";Ci.prototype.ValueBufferType=Array;Ci.prototype.DefaultInterpolation=Mr;Ci.prototype.InterpolantFactoryMethodLinear=void 0;Ci.prototype.InterpolantFactoryMethodSmooth=void 0;var Co=class extends wn{constructor(e,t,n,r){super(e,t,n,r)}};Co.prototype.ValueTypeName="color";var Ri=class extends wn{constructor(e,t,n,r){super(e,t,n,r)}};Ri.prototype.ValueTypeName="number";var pl=class extends li{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(r-t),c=e*a;for(let u=c+a;c!==u;c+=4)vt.slerpFlat(s,0,o,c-a,o,c,l);return s}},Pi=class extends wn{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new pl(this.times,this.values,this.getValueSize(),e)}};Pi.prototype.ValueTypeName="quaternion";Pi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ii=class extends wn{constructor(e,t,n){super(e,t,n)}};Ii.prototype.ValueTypeName="string";Ii.prototype.ValueBufferType=Array;Ii.prototype.DefaultInterpolation=Mr;Ii.prototype.InterpolantFactoryMethodLinear=void 0;Ii.prototype.InterpolantFactoryMethodSmooth=void 0;var er=class extends wn{constructor(e,t,n,r){super(e,t,n,r)}};er.prototype.ValueTypeName="vector";var Ro=class{constructor(e="",t=-1,n=[],r=rp){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=Bn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,r=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(w1(n[o]).scale(r));let s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){let t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,o=n.length;s!==o;++s)t.push(wn.toJSON(n[s]));return r}static CreateFromMorphTargetSequence(e,t,n,r){let s=t.length,o=[];for(let a=0;a<s;a++){let l=[],c=[];l.push((a+s-1)%s,a,(a+1)%s),c.push(0,1,0);let u=v1(l);l=Cf(l,1,u),c=Cf(c,1,u),!r&&l[0]===0&&(l.push(s),c.push(c[0])),o.push(new Ri(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let r=e;n=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<n.length;r++)if(n[r].name===t)return n[r];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let r={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){let c=e[a],u=c.name.match(s);if(u&&u.length>1){let h=u[1],d=r[h];d||(r[h]=d=[]),d.push(c)}}let o=[];for(let a in r)o.push(this.CreateFromMorphTargetSequence(a,r[a],t,n));return o}resetDuration(){let e=this.tracks,t=0;for(let n=0,r=e.length;n!==r;++n){let s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function S1(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ri;case"vector":case"vector2":case"vector3":case"vector4":return er;case"color":return Co;case"quaternion":return Pi;case"bool":case"boolean":return Ci;case"string":return Ii}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function w1(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=S1(i.type);if(i.times===void 0){let n=[],r=[];_1(i.keys,n,r,"value"),i.times=n,i.values=r}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),Ga(i.settings)&&(t.settings={inTangents:Zi(i.settings.inTangents,Float32Array),outTangents:Zi(i.settings.outTangents,Float32Array)}),t}var si={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Pf(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Pf(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Pf(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var ml=class{constructor(e,t,n){let r=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],p=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},wp=new ml,ci=class{constructor(e){this.manager=e!==void 0?e:wp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ci.DEFAULT_MATERIAL_NAME="__DEFAULT";var Mi={},Nu=class extends Error{constructor(e,t){super(e),this.response=t}},ws=class extends ci{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=si.get(`file:${e}`);if(s!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0);return}if(Mi[e]!==void 0){Mi[e].push({onLoad:t,onProgress:n,onError:r});return}Mi[e]=[],Mi[e].push({onLoad:t,onProgress:n,onError:r});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&Qe("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let u=Mi[e],h=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,p=f!==0,y=0,m=new ReadableStream({start(g){_();function _(){h.read().then(({done:M,value:v})=>{if(M)g.close();else{y+=v.byteLength;let T=new ProgressEvent("progress",{lengthComputable:p,loaded:y,total:f});for(let b=0,w=u.length;b<w;b++){let x=u[b];x.onProgress&&x.onProgress(T)}g.enqueue(v),_()}},M=>{g.error(M)})}}});return new Response(m)}else throw new Nu(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return c.json();default:if(a==="")return c.text();{let h=/charset="?([^;"\s]*)"?/i.exec(a),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(p=>f.decode(p))}}}).then(c=>{si.add(`file:${e}`,c);let u=Mi[e];delete Mi[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onLoad&&f.onLoad(c)}}).catch(c=>{let u=Mi[e];if(u===void 0)throw this.manager.itemError(e),c;delete Mi[e];for(let h=0,d=u.length;h<d;h++){let f=u[h];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var os=new WeakMap,gl=class extends ci{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,o=si.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0);else{let h=os.get(o);h===void 0&&(h=[],os.set(o,h)),h.push({onLoad:t,onError:r})}return o}let a=fs("img");function l(){u(),t&&t(this);let h=os.get(this)||[];for(let d=0;d<h.length;d++){let f=h[d];f.onLoad&&f.onLoad(this)}os.delete(this),s.manager.itemEnd(e)}function c(h){u(),r&&r(h),si.remove(`image:${e}`);let d=os.get(this)||[];for(let f=0;f<d.length;f++){let p=d[f];p.onError&&p.onError(h)}os.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),si.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}};var Po=class extends ci{constructor(e){super(e)}load(e,t,n,r){let s=new Gt,o=new gl(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},n,r),s}},Di=class extends Ut{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ie(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Io=class extends Di{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ie(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Tu=new Ne,If=new I,Df=new I,As=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new me(512,512),this.mapType=An,this.map=null,this.mapPass=null,this.matrix=new Ne,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new _s,this._frameExtents=new me(1,1),this._viewportCount=1,this._viewports=[new mt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;If.setFromMatrixPosition(e.matrixWorld),t.position.copy(If),Df.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Df),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Tu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Tu,e.coordinateSystem,e.reversedDepth);let s=this._frameExtents,o=r?r.z/s.x:1,a=r?r.w/s.y:1,l=r?r.x/s.x:0,c=r?r.y/s.y:0;e.coordinateSystem===ds||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(Tu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ba=new I,ka=new vt,ii=new I,Do=class extends Ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ne,this.projectionMatrix=new Ne,this.projectionMatrixInverse=new Ne,this.coordinateSystem=Yn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ba,ka,ii),ii.x===1&&ii.y===1&&ii.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ba,ka,ii.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ba,ka,ii),ii.x===1&&ii.y===1&&ii.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ba,ka,ii.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Yi=new I,Lf=new me,Nf=new me,en=class extends Do{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Sr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(to*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Sr*2*Math.atan(Math.tan(to*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Yi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z),Yi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z)}getViewSize(e,t){return this.getViewBounds(e,Lf,Nf),t.subVectors(Nf,Lf)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(to*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Fu=class extends As{constructor(){super(new en(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Sr*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;(n!==t.fov||r!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=r,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},Er=class extends Di{constructor(e,t,n=0,r=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.distance=n,this.angle=r,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new Fu}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},Uu=class extends As{constructor(){super(new en(90,1,.5,500)),this.isPointLightShadow=!0}},Lo=class extends Di{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new Uu}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},tr=class extends Do{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ou=class extends As{constructor(){super(new tr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},nr=class extends Di{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ut.DEFAULT_UP),this.updateMatrix(),this.target=new Ut,this.shadow=new Ou}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Li=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Su=new WeakMap,No=class extends ci{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Qe("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Qe("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,o=si.get(`image-bitmap:${e}`);if(o!==void 0){if(s.manager.itemStart(e),o.then){o.then(c=>{Su.has(o)===!0?(r&&r(Su.get(o)),s.manager.itemError(e),s.manager.itemEnd(e)):(t&&t(c),s.manager.itemEnd(e))});return}setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0);return}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},s.options,{colorSpaceConversion:"none"}))}).then(function(c){return si.add(`image-bitmap:${e}`,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){r&&r(c),Su.set(l,c),si.remove(`image-bitmap:${e}`),s.manager.itemError(e),s.manager.itemEnd(e)});si.add(`image-bitmap:${e}`,l),s.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var as=-90,ls=1,xl=class extends Ut{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new en(as,ls,e,t);r.layers=this.layers,this.add(r);let s=new en(as,ls,e,t);s.layers=this.layers,this.add(s);let o=new en(as,ls,e,t);o.layers=this.layers,this.add(o);let a=new en(as,ls,e,t);a.layers=this.layers,this.add(a);let l=new en(as,ls,e,t);l.layers=this.layers,this.add(l);let c=new en(as,ls,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(let c of t)this.remove(c);if(e===Yn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ds)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,1,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},yl=class extends en{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var hh="\\[\\]\\.:\\/",A1=new RegExp("["+hh+"]","g"),dh="[^"+hh+"]",E1="[^"+hh.replace("\\.","")+"]",C1=/((?:WC+[\/:])*)/.source.replace("WC",dh),R1=/(WCOD+)?/.source.replace("WCOD",E1),P1=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",dh),I1=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",dh),D1=new RegExp("^"+C1+R1+P1+I1+"$"),L1=["material","materials","bones","map"],Bu=class{constructor(e,t,n){let r=n||It.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},It=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(A1,"")}static parseTrackName(e){let t=D1.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);L1.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Qe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){rt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){rt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){rt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){rt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){rt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){rt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){rt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[r];if(o===void 0){let c=t.nodeName;rt("PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){rt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){rt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};It.Composite=Bu;It.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};It.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};It.prototype.GetterByBindingType=[It.prototype._getValue_direct,It.prototype._getValue_array,It.prototype._getValue_arrayElement,It.prototype._getValue_toArray];It.prototype.SetterByBindingTypeAndVersioning=[[It.prototype._setValue_direct,It.prototype._setValue_direct_setNeedsUpdate,It.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[It.prototype._setValue_array,It.prototype._setValue_array_setNeedsUpdate,It.prototype._setValue_array_setMatrixWorldNeedsUpdate],[It.prototype._setValue_arrayElement,It.prototype._setValue_arrayElement_setNeedsUpdate,It.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[It.prototype._setValue_fromArray,It.prototype._setValue_fromArray_setNeedsUpdate,It.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var HM=new Float32Array(1);var Es=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=ut(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(ut(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var ku=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let s=this.elements;return s[0]=e,s[2]=t,s[1]=n,s[3]=r,this}};var Fo=class extends Ms{constructor(e=10,t=10,n=4473924,r=8947848){n=new Ie(n),r=new Ie(r);let s=t/2,o=e/t,a=e/2,l=[],c=[];for(let d=0,f=0,p=-a;d<=t;d++,p+=o){l.push(-a,0,p,a,0,p),l.push(p,0,-a,p,0,a);let y=d===s?n:r;y.toArray(c,f),f+=3,y.toArray(c,f),f+=3,y.toArray(c,f),f+=3,y.toArray(c,f),f+=3}let u=new it;u.setAttribute("position",new Ke(l,3)),u.setAttribute("color",new Ke(c,3));let h=new wr({vertexColors:!0,toneMapped:!1});super(u,h),this.type="GridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};var Uo=class extends Zn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function fh(i,e,t,n){let r=N1(n);switch(t){case ih:return i*e;case Al:return i*e/r.components*r.byteLength;case El:return i*e/r.components*r.byteLength;case cr:return i*e*2/r.components*r.byteLength;case Cl:return i*e*2/r.components*r.byteLength;case rh:return i*e*3/r.components*r.byteLength;case bn:return i*e*4/r.components*r.byteLength;case Rl:return i*e*4/r.components*r.byteLength;case ko:case zo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Vo:case Go:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Il:case Ll:return Math.max(i,16)*Math.max(e,8)/4;case Pl:case Dl:return Math.max(i,8)*Math.max(e,8)/2;case Nl:case Fl:case Ol:case Bl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ul:case Ho:case kl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case zl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Vl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Gl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Hl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Wl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Xl:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case ql:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Kl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Yl:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Zl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case jl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Jl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case $l:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Ql:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case ec:case tc:case nc:return Math.ceil(i/4)*Math.ceil(e/4)*16;case ic:case rc:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Wo:case sc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function N1(i){switch(i){case An:case Qu:return{byteLength:1,components:1};case Ps:case eh:case Nn:return{byteLength:2,components:1};case Sl:case wl:return{byteLength:2,components:4};case ei:case Tl:case Ln:return{byteLength:4,components:1};case th:case nh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Qe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Kp(){let i=null,e=!1,t=null,n=null;function r(s,o){n=i.requestAnimationFrame(r),t(s,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function F1(i){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){let u=l.array,h=l.updateRanges;if(i.bindBuffer(c,a),h.length===0)i.bufferSubData(c,0,u);else{h.sort((f,p)=>f.start-p.start);let d=0;for(let f=1;f<h.length;f++){let p=h[d],y=h[f];y.start<=p.start+p.count+1?p.count=Math.max(p.count,y.start+y.count-p.start):(++d,h[d]=y)}h.length=d+1;for(let f=0,p=h.length;f<p;f++){let y=h[f];i.bufferSubData(c,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}var U1=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,O1=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,B1=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,k1=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,z1=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,V1=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,G1=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,H1=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,W1=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,X1=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,q1=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,K1=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Y1=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Z1=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,j1=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,J1=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,$1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Q1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ex=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,tx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,nx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,ix=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,rx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,sx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,ox=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ax=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,lx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,cx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ux=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,hx=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,dx="gl_FragColor = linearToOutputTexel( gl_FragColor );",fx=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,px=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,mx=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,gx=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,xx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,yx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,bx=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,vx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,_x=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Mx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Tx=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Sx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,wx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ax=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ex=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Cx=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Rx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Px=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ix=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Dx=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Lx=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Nx=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Fx=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ux=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ox=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Bx=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,kx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,zx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Hx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Wx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Xx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,qx=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Kx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Yx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Zx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,jx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Jx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$x=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Qx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ey=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,ty=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,ny=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,iy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ry=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,sy=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,oy=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ay=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ly=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,cy=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,uy=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,hy=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,dy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,fy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,py=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,my=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,gy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,xy=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,yy=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,by=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,vy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,_y=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,My=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ty=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Sy=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,wy=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Ay=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Ey=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Cy=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ry=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Py=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Iy=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Dy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ly=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ny=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Fy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Uy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Oy=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,By=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ky=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vy=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Gy=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Hy=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Wy=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Xy=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,qy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ky=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Yy=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Zy=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,jy=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Jy=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$y=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qy=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,eb=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,tb=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nb=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ib=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,rb=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sb=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ob=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ab=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lb=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cb=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ub=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,hb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,db=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fb=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,pb=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,mb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ft={alphahash_fragment:U1,alphahash_pars_fragment:O1,alphamap_fragment:B1,alphamap_pars_fragment:k1,alphatest_fragment:z1,alphatest_pars_fragment:V1,aomap_fragment:G1,aomap_pars_fragment:H1,batching_pars_vertex:W1,batching_vertex:X1,begin_vertex:q1,beginnormal_vertex:K1,bsdfs:Y1,iridescence_fragment:Z1,bumpmap_pars_fragment:j1,clipping_planes_fragment:J1,clipping_planes_pars_fragment:$1,clipping_planes_pars_vertex:Q1,clipping_planes_vertex:ex,color_fragment:tx,color_pars_fragment:nx,color_pars_vertex:ix,color_vertex:rx,common:sx,cube_uv_reflection_fragment:ox,defaultnormal_vertex:ax,displacementmap_pars_vertex:lx,displacementmap_vertex:cx,emissivemap_fragment:ux,emissivemap_pars_fragment:hx,colorspace_fragment:dx,colorspace_pars_fragment:fx,envmap_fragment:px,envmap_common_pars_fragment:mx,envmap_pars_fragment:gx,envmap_pars_vertex:xx,envmap_physical_pars_fragment:Cx,envmap_vertex:yx,fog_vertex:bx,fog_pars_vertex:vx,fog_fragment:_x,fog_pars_fragment:Mx,gradientmap_pars_fragment:Tx,lightmap_pars_fragment:Sx,lights_lambert_fragment:wx,lights_lambert_pars_fragment:Ax,lights_pars_begin:Ex,lights_toon_fragment:Rx,lights_toon_pars_fragment:Px,lights_phong_fragment:Ix,lights_phong_pars_fragment:Dx,lights_physical_fragment:Lx,lights_physical_pars_fragment:Nx,lights_fragment_begin:Fx,lights_fragment_maps:Ux,lights_fragment_end:Ox,lightprobes_pars_fragment:Bx,logdepthbuf_fragment:kx,logdepthbuf_pars_fragment:zx,logdepthbuf_pars_vertex:Vx,logdepthbuf_vertex:Gx,map_fragment:Hx,map_pars_fragment:Wx,map_particle_fragment:Xx,map_particle_pars_fragment:qx,metalnessmap_fragment:Kx,metalnessmap_pars_fragment:Yx,morphinstance_vertex:Zx,morphcolor_vertex:jx,morphnormal_vertex:Jx,morphtarget_pars_vertex:$x,morphtarget_vertex:Qx,normal_fragment_begin:ey,normal_fragment_maps:ty,normal_pars_fragment:ny,normal_pars_vertex:iy,normal_vertex:ry,normalmap_pars_fragment:sy,clearcoat_normal_fragment_begin:oy,clearcoat_normal_fragment_maps:ay,clearcoat_pars_fragment:ly,iridescence_pars_fragment:cy,opaque_fragment:uy,packing:hy,premultiplied_alpha_fragment:dy,project_vertex:fy,dithering_fragment:py,dithering_pars_fragment:my,roughnessmap_fragment:gy,roughnessmap_pars_fragment:xy,shadowmap_pars_fragment:yy,shadowmap_pars_vertex:by,shadowmap_vertex:vy,shadowmask_pars_fragment:_y,skinbase_vertex:My,skinning_pars_vertex:Ty,skinning_vertex:Sy,skinnormal_vertex:wy,specularmap_fragment:Ay,specularmap_pars_fragment:Ey,tonemapping_fragment:Cy,tonemapping_pars_fragment:Ry,transmission_fragment:Py,transmission_pars_fragment:Iy,uv_pars_fragment:Dy,uv_pars_vertex:Ly,uv_vertex:Ny,worldpos_vertex:Fy,background_vert:Uy,background_frag:Oy,backgroundCube_vert:By,backgroundCube_frag:ky,cube_vert:zy,cube_frag:Vy,depth_vert:Gy,depth_frag:Hy,distance_vert:Wy,distance_frag:Xy,equirect_vert:qy,equirect_frag:Ky,linedashed_vert:Yy,linedashed_frag:Zy,meshbasic_vert:jy,meshbasic_frag:Jy,meshlambert_vert:$y,meshlambert_frag:Qy,meshmatcap_vert:eb,meshmatcap_frag:tb,meshnormal_vert:nb,meshnormal_frag:ib,meshphong_vert:rb,meshphong_frag:sb,meshphysical_vert:ob,meshphysical_frag:ab,meshtoon_vert:lb,meshtoon_frag:cb,points_vert:ub,points_frag:hb,shadow_vert:db,shadow_frag:fb,sprite_vert:pb,sprite_frag:mb},Fe={common:{diffuse:{value:new Ie(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ct}},envmap:{envMap:{value:null},envMapRotation:{value:new ct},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ct}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ct}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ct},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ct},normalScale:{value:new me(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ct},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ct}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ct}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ct}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ie(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new Ie(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0},uvTransform:{value:new ct}},sprite:{diffuse:{value:new Ie(16777215)},opacity:{value:1},center:{value:new me(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}}},fi={basic:{uniforms:pn([Fe.common,Fe.specularmap,Fe.envmap,Fe.aomap,Fe.lightmap,Fe.fog]),vertexShader:ft.meshbasic_vert,fragmentShader:ft.meshbasic_frag},lambert:{uniforms:pn([Fe.common,Fe.specularmap,Fe.envmap,Fe.aomap,Fe.lightmap,Fe.emissivemap,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.fog,Fe.lights,{emissive:{value:new Ie(0)},envMapIntensity:{value:1}}]),vertexShader:ft.meshlambert_vert,fragmentShader:ft.meshlambert_frag},phong:{uniforms:pn([Fe.common,Fe.specularmap,Fe.envmap,Fe.aomap,Fe.lightmap,Fe.emissivemap,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.fog,Fe.lights,{emissive:{value:new Ie(0)},specular:{value:new Ie(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ft.meshphong_vert,fragmentShader:ft.meshphong_frag},standard:{uniforms:pn([Fe.common,Fe.envmap,Fe.aomap,Fe.lightmap,Fe.emissivemap,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.roughnessmap,Fe.metalnessmap,Fe.fog,Fe.lights,{emissive:{value:new Ie(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ft.meshphysical_vert,fragmentShader:ft.meshphysical_frag},toon:{uniforms:pn([Fe.common,Fe.aomap,Fe.lightmap,Fe.emissivemap,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.gradientmap,Fe.fog,Fe.lights,{emissive:{value:new Ie(0)}}]),vertexShader:ft.meshtoon_vert,fragmentShader:ft.meshtoon_frag},matcap:{uniforms:pn([Fe.common,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,Fe.fog,{matcap:{value:null}}]),vertexShader:ft.meshmatcap_vert,fragmentShader:ft.meshmatcap_frag},points:{uniforms:pn([Fe.points,Fe.fog]),vertexShader:ft.points_vert,fragmentShader:ft.points_frag},dashed:{uniforms:pn([Fe.common,Fe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ft.linedashed_vert,fragmentShader:ft.linedashed_frag},depth:{uniforms:pn([Fe.common,Fe.displacementmap]),vertexShader:ft.depth_vert,fragmentShader:ft.depth_frag},normal:{uniforms:pn([Fe.common,Fe.bumpmap,Fe.normalmap,Fe.displacementmap,{opacity:{value:1}}]),vertexShader:ft.meshnormal_vert,fragmentShader:ft.meshnormal_frag},sprite:{uniforms:pn([Fe.sprite,Fe.fog]),vertexShader:ft.sprite_vert,fragmentShader:ft.sprite_frag},background:{uniforms:{uvTransform:{value:new ct},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ft.background_vert,fragmentShader:ft.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ct}},vertexShader:ft.backgroundCube_vert,fragmentShader:ft.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ft.cube_vert,fragmentShader:ft.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ft.equirect_vert,fragmentShader:ft.equirect_frag},distance:{uniforms:pn([Fe.common,Fe.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ft.distance_vert,fragmentShader:ft.distance_frag},shadow:{uniforms:pn([Fe.lights,Fe.fog,{color:{value:new Ie(0)},opacity:{value:1}}]),vertexShader:ft.shadow_vert,fragmentShader:ft.shadow_frag}};fi.physical={uniforms:pn([fi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ct},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ct},clearcoatNormalScale:{value:new me(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ct},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ct},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ct},sheen:{value:0},sheenColor:{value:new Ie(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ct},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ct},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ct},transmissionSamplerSize:{value:new me},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ct},attenuationDistance:{value:0},attenuationColor:{value:new Ie(0)},specularColor:{value:new Ie(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ct},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ct},anisotropyVector:{value:new me},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ct}}]),vertexShader:ft.meshphysical_vert,fragmentShader:ft.meshphysical_frag};var cc={r:0,b:0,g:0},gb=new Ne,Yp=new ct;Yp.set(-1,0,0,0,1,0,0,0,1);function xb(i,e,t,n,r,s){let o=new Ie(0),a=r===!0?0:1,l,c,u=null,h=0,d=null;function f(_){let M=_.isScene===!0?_.background:null;if(M&&M.isTexture){let v=_.backgroundBlurriness>0;M=e.get(M,v)}return M}function p(_){let M=!1,v=f(_);v===null?m(o,a):v&&v.isColor&&(m(v,1),M=!0);let T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,s):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(i.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(_,M){let v=f(M);v&&(v.isCubeTexture||v.mapping===Pr)?(c===void 0&&(c=new Se(new ot(1,1,1),new Vt({name:"BackgroundCubeMaterial",uniforms:Dr(fi.backgroundCube.uniforms),vertexShader:fi.backgroundCube.vertexShader,fragmentShader:fi.backgroundCube.fragmentShader,side:yn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(T,b,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(gb.makeRotationFromEuler(M.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Yp),c.material.toneMapped=pt.getTransfer(v.colorSpace)!==wt,(u!==v||h!==v.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,u=v,h=v.version,d=i.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Se(new kn(2,2),new Vt({name:"BackgroundMaterial",uniforms:Dr(fi.background.uniforms),vertexShader:fi.background.vertexShader,fragmentShader:fi.background.fragmentShader,side:ui,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=pt.getTransfer(v.colorSpace)!==wt,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||h!==v.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,u=v,h=v.version,d=i.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null))}function m(_,M){_.getRGB(cc,uh(i)),t.buffers.color.setClear(cc.r,cc.g,cc.b,M,s)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(_,M=1){o.set(_),a=M,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(_){a=_,m(o,a)},render:p,addToRenderList:y,dispose:g}}function yb(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=d(null),s=r,o=!1;function a(R,A,P,D,F){let z=!1,L=h(R,D,P,A);s!==L&&(s=L,c(s.object)),z=f(R,D,P,F),z&&p(R,D,P,F),F!==null&&e.update(F,i.ELEMENT_ARRAY_BUFFER),(z||o)&&(o=!1,v(R,A,P,D),F!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function l(){return i.createVertexArray()}function c(R){return i.bindVertexArray(R)}function u(R){return i.deleteVertexArray(R)}function h(R,A,P,D){let F=D.wireframe===!0,z=n[A.id];z===void 0&&(z={},n[A.id]=z);let L=R.isInstancedMesh===!0?R.id:0,V=z[L];V===void 0&&(V={},z[L]=V);let k=V[P.id];k===void 0&&(k={},V[P.id]=k);let W=k[F];return W===void 0&&(W=d(l()),k[F]=W),W}function d(R){let A=[],P=[],D=[];for(let F=0;F<t;F++)A[F]=0,P[F]=0,D[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:A,enabledAttributes:P,attributeDivisors:D,object:R,attributes:{},index:null}}function f(R,A,P,D){let F=s.attributes,z=A.attributes,L=0,V=P.getAttributes();for(let k in V)if(V[k].location>=0){let J=F[k],oe=z[k];if(oe===void 0&&(k==="instanceMatrix"&&R.instanceMatrix&&(oe=R.instanceMatrix),k==="instanceColor"&&R.instanceColor&&(oe=R.instanceColor)),J===void 0||J.attribute!==oe||oe&&J.data!==oe.data)return!0;L++}return s.attributesNum!==L||s.index!==D}function p(R,A,P,D){let F={},z=A.attributes,L=0,V=P.getAttributes();for(let k in V)if(V[k].location>=0){let J=z[k];J===void 0&&(k==="instanceMatrix"&&R.instanceMatrix&&(J=R.instanceMatrix),k==="instanceColor"&&R.instanceColor&&(J=R.instanceColor));let oe={};oe.attribute=J,J&&J.data&&(oe.data=J.data),F[k]=oe,L++}s.attributes=F,s.attributesNum=L,s.index=D}function y(){let R=s.newAttributes;for(let A=0,P=R.length;A<P;A++)R[A]=0}function m(R){g(R,0)}function g(R,A){let P=s.newAttributes,D=s.enabledAttributes,F=s.attributeDivisors;P[R]=1,D[R]===0&&(i.enableVertexAttribArray(R),D[R]=1),F[R]!==A&&(i.vertexAttribDivisor(R,A),F[R]=A)}function _(){let R=s.newAttributes,A=s.enabledAttributes;for(let P=0,D=A.length;P<D;P++)A[P]!==R[P]&&(i.disableVertexAttribArray(P),A[P]=0)}function M(R,A,P,D,F,z,L){L===!0?i.vertexAttribIPointer(R,A,P,F,z):i.vertexAttribPointer(R,A,P,D,F,z)}function v(R,A,P,D){y();let F=D.attributes,z=P.getAttributes(),L=A.defaultAttributeValues;for(let V in z){let k=z[V];if(k.location>=0){let W=F[V];if(W===void 0&&(V==="instanceMatrix"&&R.instanceMatrix&&(W=R.instanceMatrix),V==="instanceColor"&&R.instanceColor&&(W=R.instanceColor)),W!==void 0){let J=W.normalized,oe=W.itemSize,re=e.get(W);if(re===void 0)continue;let Te=re.buffer,Ee=re.type,Re=re.bytesPerElement,se=Ee===i.INT||Ee===i.UNSIGNED_INT||W.gpuType===Tl;if(W.isInterleavedBufferAttribute){let le=W.data,X=le.stride,q=W.offset;if(le.isInstancedInterleavedBuffer){for(let $=0;$<k.locationSize;$++)g(k.location+$,le.meshPerAttribute);R.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let $=0;$<k.locationSize;$++)m(k.location+$);i.bindBuffer(i.ARRAY_BUFFER,Te);for(let $=0;$<k.locationSize;$++)M(k.location+$,oe/k.locationSize,Ee,J,X*Re,(q+oe/k.locationSize*$)*Re,se)}else{if(W.isInstancedBufferAttribute){for(let le=0;le<k.locationSize;le++)g(k.location+le,W.meshPerAttribute);R.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let le=0;le<k.locationSize;le++)m(k.location+le);i.bindBuffer(i.ARRAY_BUFFER,Te);for(let le=0;le<k.locationSize;le++)M(k.location+le,oe/k.locationSize,Ee,J,oe*Re,oe/k.locationSize*le*Re,se)}}else if(L!==void 0){let J=L[V];if(J!==void 0)switch(J.length){case 2:i.vertexAttrib2fv(k.location,J);break;case 3:i.vertexAttrib3fv(k.location,J);break;case 4:i.vertexAttrib4fv(k.location,J);break;default:i.vertexAttrib1fv(k.location,J)}}}}_()}function T(){S();for(let R in n){let A=n[R];for(let P in A){let D=A[P];for(let F in D){let z=D[F];for(let L in z)u(z[L].object),delete z[L];delete D[F]}}delete n[R]}}function b(R){if(n[R.id]===void 0)return;let A=n[R.id];for(let P in A){let D=A[P];for(let F in D){let z=D[F];for(let L in z)u(z[L].object),delete z[L];delete D[F]}}delete n[R.id]}function w(R){for(let A in n){let P=n[A];for(let D in P){let F=P[D];if(F[R.id]===void 0)continue;let z=F[R.id];for(let L in z)u(z[L].object),delete z[L];delete F[R.id]}}}function x(R){for(let A in n){let P=n[A],D=R.isInstancedMesh===!0?R.id:0,F=P[D];if(F!==void 0){for(let z in F){let L=F[z];for(let V in L)u(L[V].object),delete L[V];delete F[z]}delete P[D],Object.keys(P).length===0&&delete n[A]}}}function S(){E(),o=!0,s!==r&&(s=r,c(s.object))}function E(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:S,resetDefaultState:E,dispose:T,releaseStatesOfGeometry:b,releaseStatesOfObject:x,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:m,disableUnusedAttributes:_}}function bb(i,e,t){let n;function r(l){n=l}function s(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function a(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let d=0;for(let f=0;f<u;f++)d+=c[f];t.update(d,n,1)}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function vb(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let w=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(w){return!(w!==bn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){let x=w===Nn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==An&&w!==Ln&&!x&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(Qe("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&Qe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),_=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),b=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:p,maxTextureSize:y,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:_,maxVaryings:M,maxFragmentUniforms:v,maxSamples:T,samples:b}}function _b(i){let e=this,t=null,n=0,r=!1,s=!1,o=new Dn,a=new ct,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||n!==0||r;return r=d,n=h.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let p=h.clippingPlanes,y=h.clipIntersection,m=h.clipShadows,g=i.get(h);if(!r||p===null||p.length===0||s&&!m)s?u(null):c();else{let _=s?0:n,M=_*4,v=g.clippingState||null;l.value=v,v=u(p,d,M,f);for(let T=0;T!==M;++T)v[T]=t[T];g.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,p){let y=h!==null?h.length:0,m=null;if(y!==0){if(m=l.value,p!==!0||m===null){let g=f+y*4,_=d.matrixWorldInverse;a.getNormalMatrix(_),(m===null||m.length<g)&&(m=new Float32Array(g));for(let M=0,v=f;M!==y;++M,v+=4)o.copy(h[M]).applyMatrix4(_,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}var Ns=4,Mb=6,Tb=20,Sb=256,qo=new tr,Ap=new Ie,ph=null,mh=0,gh=0,xh=!1,wb=new I,Lr=new I,hc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,s={}){let{size:o=256,position:a=wb}=s;ph=this._renderer.getRenderTarget(),mh=this._renderer.getActiveCubeFace(),gh=this._renderer.getActiveMipmapLevel(),xh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,r,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Rp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Cp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ph,mh,gh),this._renderer.xr.enabled=xh,e.scissorTest=!1,Ls(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ar||e.mapping===Rr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ph=this._renderer.getRenderTarget(),mh=this._renderer.getActiveCubeFace(),gh=this._renderer.getActiveMipmapLevel(),xh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ft,minFilter:Ft,generateMipmaps:!1,type:Nn,format:bn,colorSpace:un,depthBuffer:!1},r=Ep(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ep(e,t,n);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Ab(s)),this._blurMaterial=Cb(s,e,t),this._ggxMaterial=Eb(s,e,t)}return r}_compileMaterial(e){let t=new Se(new it,e);this._renderer.compile(t,qo)}_sceneToCubeUV(e,t,n,r,s){let l=new en(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(Ap),h.toneMapping=$n,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(r),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Se(new ot,new Yt({name:"PMREM.Background",side:yn,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,m=y.material,g=!1,_=e.background;_?_.isColor&&(m.color.copy(_),e.background=null,g=!0):(m.color.copy(Ap),g=!0);for(let M=0;M<6;M++){let v=M%3;v===0?(l.up.set(0,c[M],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+u[M],s.y,s.z)):v===1?(l.up.set(0,0,c[M]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+u[M],s.z)):(l.up.set(0,c[M],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+u[M]));let T=this._cubeSize;Ls(r,v*T,M>2?T:0,T,T),h.setRenderTarget(r),g&&h.render(y,l),h.render(e,l)}h.toneMapping=f,h.autoClear=d,e.background=_}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===ar||e.mapping===Rr;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Rp()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Cp());let s=r?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;let a=s.uniforms;a.envMap.value=e;let l=this._cubeSize;Ls(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,qo)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let s=1;s<r;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(c*c-u*u),d=c*1.25,f=h*d,{_lodMax:p}=this,y=this._sizeLods[n],m=3*y*(n>p-Ns?n-p+Ns:0),g=4*(this._cubeSize-y);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=p-t,Ls(s,m,g,3*y,2*y),r.setRenderTarget(s),r.render(a,qo),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=p-n,Ls(e,m,g,3*y,2*y),r.setRenderTarget(e),r.render(a,qo)}_blur(e,t,n,r){let s=this._pingPongRenderTarget,o=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,s,t,n,o),this._blurPass(s,e,n,n,o)}_blurPass(e,t,n,r,s){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[r];l.material=a;let c=a.uniforms;c.envMap.value=e.texture,c.sigma.value=s,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[r],h=3*u*(r>this._lodMax-Ns?r-this._lodMax+Ns:0),d=4*(this._cubeSize-u);Ls(t,h,d,3*u,2*u),o.setRenderTarget(t),o.render(l,qo)}};function Ab(i){let e=[],t=[],n=i,r=i-Ns+1+Mb;for(let s=0;s<r;s++){let o=Math.pow(2,n);e.push(o);let a=1/(o-2),l=-a,c=1+a,u=[l,l,c,l,c,c,l,l,c,c,l,c],h=6,d=6,f=3,p=new Float32Array(f*d*h),y=new Float32Array(f*d*h);for(let g=0;g<h;g++){let _=g%3*2/3-1,M=g>2?0:-1,v=[_,M,0,_+2/3,M,0,_+2/3,M+1,0,_,M,0,_+2/3,M+1,0,_,M+1,0];p.set(v,f*d*g);for(let T=0;T<d;T++){let b=u[T*2]*2-1,w=u[T*2+1]*2-1;g===0?Lr.set(1,w,b):g===1?Lr.set(-b,1,-w):g===2?Lr.set(-b,w,1):g===3?Lr.set(-1,w,-b):g===4?Lr.set(-b,-1,w):Lr.set(b,w,-1),Lr.toArray(y,(g*d+T)*f)}}let m=new it;m.setAttribute("position",new tt(p,f)),m.setAttribute("outputDirection",new tt(y,f)),t.push(new Se(m,null)),n>Ns&&n--}return{lodMeshes:t,sizeLods:e}}function Ep(i,e,t){let n=new Mn(i,e,t);return n.texture.mapping=Pr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ls(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function Eb(i,e,t){return new Vt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Sb,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:pc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Cb(i,e,t){return new Vt({name:"SphericalGaussianBlur",defines:{SAMPLES:Tb,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:pc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Cp(){return new Vt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:pc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function Rp(){return new Vt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:pc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hi,depthTest:!1,depthWrite:!1})}function pc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var dc=class extends Mn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new mo(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ot(5,5,5),s=new Vt({name:"CubemapFromEquirect",uniforms:Dr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:yn,blending:hi});s.uniforms.tEquirect.value=t;let o=new Se(r,s),a=t.minFilter;return t.minFilter===Qn&&(t.minFilter=Ft),new xl(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}};function Rb(i){let e=new WeakMap,t=new WeakMap,n=null;function r(d,f=!1){return d==null?null:f?o(d):s(d)}function s(d){if(d&&d.isTexture){let f=d.mapping;if(f===vl||f===_l)if(e.has(d)){let p=e.get(d).texture;return a(p,d.mapping)}else{let p=d.image;if(p&&p.height>0){let y=new dc(p.height);return y.fromEquirectangularTexture(i,d),e.set(d,y),d.addEventListener("dispose",c),a(y.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,p=f===vl||f===_l,y=f===ar||f===Rr;if(p||y){let m=t.get(d),g=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return n===null&&(n=new hc(i)),m=p?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{let _=d.image;return p&&_&&_.height>0||y&&_&&l(_)?(n===null&&(n=new hc(i)),m=p?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",u),m.texture):null}}}return d}function a(d,f){return f===vl?d.mapping=ar:f===_l&&(d.mapping=Rr),d}function l(d){let f=0,p=6;for(let y=0;y<p;y++)d[y]!==void 0&&f++;return f===p}function c(d){let f=d.target;f.removeEventListener("dispose",c);let p=e.get(f);p!==void 0&&(e.delete(f),p.dispose())}function u(d){let f=d.target;f.removeEventListener("dispose",u);let p=t.get(f);p!==void 0&&(t.delete(f),p.dispose())}function h(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:h}}function Pb(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r=i.getExtension(n);return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let r=t(n);return r===null&&_r("WebGLRenderer: "+n+" extension not supported."),r}}}function Ib(i,e,t,n){let r={},s=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let p in d.attributes)e.remove(d.attributes[p]);d.removeEventListener("dispose",o),delete r[d.id];let f=s.get(d);f&&(e.remove(f),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,t.memory.geometries++),d}function l(h){let d=h.attributes;for(let f in d)e.update(d[f],i.ARRAY_BUFFER)}function c(h){let d=[],f=h.index,p=h.attributes.position,y=0;if(p===void 0)return;if(f!==null){let _=f.array;y=f.version;for(let M=0,v=_.length;M<v;M+=3){let T=_[M+0],b=_[M+1],w=_[M+2];d.push(T,b,b,w,w,T)}}else{let _=p.array;y=p.version;for(let M=0,v=_.length/3-1;M<v;M+=3){let T=M+0,b=M+1,w=M+2;d.push(T,b,b,w,w,T)}}let m=new(p.count>=65535?uo:co)(d,1);m.version=y;let g=s.get(h);g&&e.remove(g),s.set(h,m)}function u(h){let d=s.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Db(i,e,t){let n;function r(h){n=h}let s,o;function a(h){s=h.type,o=h.bytesPerElement}function l(h,d){i.drawElements(n,d,s,h*o),t.update(d,n,1)}function c(h,d,f){f!==0&&(i.drawElementsInstanced(n,d,s,h*o,f),t.update(d,n,f))}function u(h,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,s,h,0,f);let y=0;for(let m=0;m<f;m++)y+=d[m];t.update(y,n,1)}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Lb(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:rt("WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function Nb(i,e,t){let n=new WeakMap,r=new mt;function s(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,d=n.get(a);if(d===void 0||d.count!==h){let S=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",S)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],_=a.morphAttributes.color||[],M=0;f===!0&&(M=1),p===!0&&(M=2),y===!0&&(M=3);let v=a.attributes.position.count*M,T=1;v>e.maxTextureSize&&(T=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let b=new Float32Array(v*T*4*h),w=new ao(b,v,T,h);w.type=Ln,w.needsUpdate=!0;let x=M*4;for(let E=0;E<h;E++){let R=m[E],A=g[E],P=_[E],D=v*T*4*E;for(let F=0;F<R.count;F++){let z=F*x;f===!0&&(r.fromBufferAttribute(R,F),b[D+z+0]=r.x,b[D+z+1]=r.y,b[D+z+2]=r.z,b[D+z+3]=0),p===!0&&(r.fromBufferAttribute(A,F),b[D+z+4]=r.x,b[D+z+5]=r.y,b[D+z+6]=r.z,b[D+z+7]=0),y===!0&&(r.fromBufferAttribute(P,F),b[D+z+8]=r.x,b[D+z+9]=r.y,b[D+z+10]=r.z,b[D+z+11]=P.itemSize===4?r.w:1)}}d={count:h,texture:w,size:new me(v,T)},n.set(a,d),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];let p=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",p),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:s}}function Fb(i,e,t,n,r){let s=new WeakMap;function o(c){let u=r.render.frame,h=c.geometry,d=e.get(c,h);if(s.get(d)!==u&&(e.update(d),s.set(d,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,u))),c.isSkinnedMesh){let f=c.skeleton;s.get(f)!==u&&(f.update(),s.set(f,u))}return d}function a(){s=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}var Ub={[qu]:"LINEAR_TONE_MAPPING",[Ku]:"REINHARD_TONE_MAPPING",[Yu]:"CINEON_TONE_MAPPING",[Bo]:"ACES_FILMIC_TONE_MAPPING",[ju]:"AGX_TONE_MAPPING",[Ju]:"NEUTRAL_TONE_MAPPING",[Zu]:"CUSTOM_TONE_MAPPING"};function Ob(i,e,t,n,r,s){let o=new Mn(e,t,{type:i,depthBuffer:r,stencilBuffer:s,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new it;c.setAttribute("position",new Ke([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Ke([0,2,0,0,2,0],2));let u=new al({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new Se(c,u),d=new tr(-1,1,1,-1,0,1),f=null,p=null,y=!1,m,g=null,_=[],M=!1;this.setSize=function(v,T){o.setSize(v,T),a!==null&&a.setSize(v,T),l!==null&&l.setSize(v,T);for(let b=0;b<_.length;b++){let w=_[b];w.setSize&&w.setSize(v,T)}},this.setEffects=function(v){_=v,M=_.length>0&&_[0].isRenderPass===!0;let T=o.width,b=o.height;_.length>0&&a===null&&(a=new Mn(T,b,{type:Nn,depthBuffer:!1,stencilBuffer:!1}),l=new Mn(T,b,{type:Nn,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<_.length;w++){let x=_[w];x.setSize&&x.setSize(T,b)}},this.begin=function(v,T){if(y||v.toneMapping===$n&&_.length===0)return!1;if(g=T,T!==null){let b=T.width,w=T.height;(o.width!==b||o.height!==w)&&this.setSize(b,w)}return M===!1&&v.setRenderTarget(o),m=v.toneMapping,v.toneMapping=$n,!0},this.hasRenderPass=function(){return M},this.end=function(v,T){v.toneMapping=m,y=!0;let b=o,w=a;for(let x=0;x<_.length;x++){let S=_[x];S.enabled!==!1&&(S.render(v,w,b,T),S.needsSwap!==!1&&(b=w,w=w===a?l:a))}if(f!==v.outputColorSpace||p!==v.toneMapping){f=v.outputColorSpace,p=v.toneMapping,u.defines={},pt.getTransfer(f)===wt&&(u.defines.SRGB_TRANSFER="");let x=Ub[p];x&&(u.defines[x]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=b.texture,v.setRenderTarget(g),v.render(h,d),g=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}var Zp=new Gt,vh=new Qi(1,1),jp=new ao,Jp=new $a,$p=new mo,Pp=[],Ip=[],Dp=new Float32Array(16),Lp=new Float32Array(9),Np=new Float32Array(4);function Os(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=Pp[r];if(s===void 0&&(s=new Float32Array(r),Pp[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function rn(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function sn(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function mc(i,e){let t=Ip[e];t===void 0&&(t=new Int32Array(e),Ip[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Bb(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function kb(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(rn(t,e))return;i.uniform2fv(this.addr,e),sn(t,e)}}function zb(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(rn(t,e))return;i.uniform3fv(this.addr,e),sn(t,e)}}function Vb(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(rn(t,e))return;i.uniform4fv(this.addr,e),sn(t,e)}}function Gb(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(rn(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),sn(t,e)}else{if(rn(t,n))return;Np.set(n),i.uniformMatrix2fv(this.addr,!1,Np),sn(t,n)}}function Hb(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(rn(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),sn(t,e)}else{if(rn(t,n))return;Lp.set(n),i.uniformMatrix3fv(this.addr,!1,Lp),sn(t,n)}}function Wb(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(rn(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),sn(t,e)}else{if(rn(t,n))return;Dp.set(n),i.uniformMatrix4fv(this.addr,!1,Dp),sn(t,n)}}function Xb(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function qb(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(rn(t,e))return;i.uniform2iv(this.addr,e),sn(t,e)}}function Kb(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(rn(t,e))return;i.uniform3iv(this.addr,e),sn(t,e)}}function Yb(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(rn(t,e))return;i.uniform4iv(this.addr,e),sn(t,e)}}function Zb(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function jb(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(rn(t,e))return;i.uniform2uiv(this.addr,e),sn(t,e)}}function Jb(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(rn(t,e))return;i.uniform3uiv(this.addr,e),sn(t,e)}}function $b(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(rn(t,e))return;i.uniform4uiv(this.addr,e),sn(t,e)}}function Qb(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(vh.compareFunction=t.isReversedDepthBuffer()?lc:ac,s=vh):s=Zp,t.setTexture2D(e||s,r)}function ev(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Jp,r)}function tv(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||$p,r)}function nv(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||jp,r)}function iv(i){switch(i){case 5126:return Bb;case 35664:return kb;case 35665:return zb;case 35666:return Vb;case 35674:return Gb;case 35675:return Hb;case 35676:return Wb;case 5124:case 35670:return Xb;case 35667:case 35671:return qb;case 35668:case 35672:return Kb;case 35669:case 35673:return Yb;case 5125:return Zb;case 36294:return jb;case 36295:return Jb;case 36296:return $b;case 35678:case 36198:case 36298:case 36306:case 35682:return Qb;case 35679:case 36299:case 36307:return ev;case 35680:case 36300:case 36308:case 36293:return tv;case 36289:case 36303:case 36311:case 36292:return nv}}function rv(i,e){i.uniform1fv(this.addr,e)}function sv(i,e){let t=Os(e,this.size,2);i.uniform2fv(this.addr,t)}function ov(i,e){let t=Os(e,this.size,3);i.uniform3fv(this.addr,t)}function av(i,e){let t=Os(e,this.size,4);i.uniform4fv(this.addr,t)}function lv(i,e){let t=Os(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function cv(i,e){let t=Os(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function uv(i,e){let t=Os(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function hv(i,e){i.uniform1iv(this.addr,e)}function dv(i,e){i.uniform2iv(this.addr,e)}function fv(i,e){i.uniform3iv(this.addr,e)}function pv(i,e){i.uniform4iv(this.addr,e)}function mv(i,e){i.uniform1uiv(this.addr,e)}function gv(i,e){i.uniform2uiv(this.addr,e)}function xv(i,e){i.uniform3uiv(this.addr,e)}function yv(i,e){i.uniform4uiv(this.addr,e)}function bv(i,e,t){let n=this.cache,r=e.length,s=mc(t,r);rn(n,s)||(i.uniform1iv(this.addr,s),sn(n,s));let o;this.type===i.SAMPLER_2D_SHADOW?o=vh:o=Zp;for(let a=0;a!==r;++a)t.setTexture2D(e[a]||o,s[a])}function vv(i,e,t){let n=this.cache,r=e.length,s=mc(t,r);rn(n,s)||(i.uniform1iv(this.addr,s),sn(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||Jp,s[o])}function _v(i,e,t){let n=this.cache,r=e.length,s=mc(t,r);rn(n,s)||(i.uniform1iv(this.addr,s),sn(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||$p,s[o])}function Mv(i,e,t){let n=this.cache,r=e.length,s=mc(t,r);rn(n,s)||(i.uniform1iv(this.addr,s),sn(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||jp,s[o])}function Tv(i){switch(i){case 5126:return rv;case 35664:return sv;case 35665:return ov;case 35666:return av;case 35674:return lv;case 35675:return cv;case 35676:return uv;case 5124:case 35670:return hv;case 35667:case 35671:return dv;case 35668:case 35672:return fv;case 35669:case 35673:return pv;case 5125:return mv;case 36294:return gv;case 36295:return xv;case 36296:return yv;case 35678:case 36198:case 36298:case 36306:case 35682:return bv;case 35679:case 36299:case 36307:return vv;case 35680:case 36300:case 36308:case 36293:return _v;case 36289:case 36303:case 36311:case 36292:return Mv}}var _h=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=iv(t.type)}},Mh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Tv(t.type)}},Th=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],n)}}},yh=/(\w+)(\])?(\[|\.)?/g;function Fp(i,e){i.seq.push(e),i.map[e.id]=e}function Sv(i,e,t){let n=i.name,r=n.length;for(yh.lastIndex=0;;){let s=yh.exec(n),o=yh.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Fp(t,c===void 0?new _h(a,i,e):new Mh(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new Th(a),Fp(t,h)),t=h}}}var Fs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);Sv(a,l,this)}let r=[],s=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(o):s.push(o);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&n.push(o)}return n}};function Up(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var wv=37297,Av=0;function Ev(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Op=new ct;function Cv(i){pt._getMatrix(Op,pt.workingColorSpace,i);let e=`mat3( ${Op.elements.map(t=>t.toFixed(4))} )`;switch(pt.getTransfer(i)){case so:return[e,"LinearTransferOETF"];case wt:return[e,"sRGBTransferOETF"];default:return Qe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Bp(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=(i.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+Ev(i.getShaderSource(e),a)}else return s}function Rv(i,e){let t=Cv(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Pv={[qu]:"Linear",[Ku]:"Reinhard",[Yu]:"Cineon",[Bo]:"ACESFilmic",[ju]:"AgX",[Ju]:"Neutral",[Zu]:"Custom"};function Iv(i,e){let t=Pv[e];return t===void 0?(Qe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var uc=new I;function Dv(){pt.getLuminanceCoefficients(uc);let i=uc.x.toFixed(4),e=uc.y.toFixed(4),t=uc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Lv(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Yo).join(`
`)}function Nv(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Fv(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),o=s.name,a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Yo(i){return i!==""}function kp(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function zp(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Uv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Sh(i){return i.replace(Uv,Bv)}var Ov=new Map;function Bv(i,e){let t=ft[e];if(t===void 0){let n=Ov.get(e);if(n!==void 0)t=ft[n],Qe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Sh(t)}var kv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Vp(i){return i.replace(kv,zv)}function zv(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Gp(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var Vv={[Oo]:"SHADOWMAP_TYPE_PCF",[Cs]:"SHADOWMAP_TYPE_VSM"};function Gv(i){return Vv[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Hv={[ar]:"ENVMAP_TYPE_CUBE",[Rr]:"ENVMAP_TYPE_CUBE",[Pr]:"ENVMAP_TYPE_CUBE_UV"};function Wv(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Hv[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var Xv={[Rr]:"ENVMAP_MODE_REFRACTION"};function qv(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Xv[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Kv={[Xu]:"ENVMAP_BLENDING_MULTIPLY",[tp]:"ENVMAP_BLENDING_MIX",[np]:"ENVMAP_BLENDING_ADD"};function Yv(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Kv[i.combine]||"ENVMAP_BLENDING_NONE"}function Zv(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function jv(i,e,t,n){let r=i.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,l=Gv(t),c=Wv(t),u=qv(t),h=Yv(t),d=Zv(t),f=Lv(t),p=Nv(s),y=r.createProgram(),m,g,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Yo).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(Yo).join(`
`),g.length>0&&(g+=`
`)):(m=[Gp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Yo).join(`
`),g=[Gp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==$n?"#define TONE_MAPPING":"",t.toneMapping!==$n?ft.tonemapping_pars_fragment:"",t.toneMapping!==$n?Iv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ft.colorspace_pars_fragment,Rv("linearToOutputTexel",t.outputColorSpace),Dv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Yo).join(`
`)),o=Sh(o),o=kp(o,t),o=zp(o,t),a=Sh(a),a=kp(a,t),a=zp(a,t),o=Vp(o),a=Vp(a),t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",t.glslVersion===ah?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ah?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let M=_+m+o,v=_+g+a,T=Up(r,r.VERTEX_SHADER,M),b=Up(r,r.FRAGMENT_SHADER,v);r.attachShader(y,T),r.attachShader(y,b),t.index0AttributeName!==void 0?r.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(y,0,"position"),r.linkProgram(y);function w(R){if(i.debug.checkShaderErrors){let A=r.getProgramInfoLog(y)||"",P=r.getShaderInfoLog(T)||"",D=r.getShaderInfoLog(b)||"",F=A.trim(),z=P.trim(),L=D.trim(),V=!0,k=!0;if(r.getProgramParameter(y,r.LINK_STATUS)===!1)if(V=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,y,T,b);else{let W=Bp(r,T,"vertex"),J=Bp(r,b,"fragment");rt("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(y,r.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+F+`
`+W+`
`+J)}else F!==""?Qe("WebGLProgram: Program Info Log:",F):(z===""||L==="")&&(k=!1);k&&(R.diagnostics={runnable:V,programLog:F,vertexShader:{log:z,prefix:m},fragmentShader:{log:L,prefix:g}})}r.deleteShader(T),r.deleteShader(b),x=new Fs(r,y),S=Fv(r,y)}let x;this.getUniforms=function(){return x===void 0&&w(this),x};let S;this.getAttributes=function(){return S===void 0&&w(this),S};let E=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=r.getProgramParameter(y,wv)),E},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Av++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=T,this.fragmentShader=b,this}var Jv=0,wh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Ah(e),t.set(e,n)),n}},Ah=class{constructor(e){this.id=Jv++,this.code=e,this.usedTimes=0}};function $v(i){return i===cr||i===Ho||i===Wo}function Qv(i,e,t,n,r,s){let o=new lo,a=new wh,l=new Set,c=[],u=new Map,h=n.logarithmicDepthBuffer,d=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(x){return l.add(x),x===0?"uv":`uv${x}`}function y(x,S,E,R,A,P){let D=R.fog,F=A.geometry,z=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?R.environment:null,L=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,V=e.get(x.envMap||z,L),k=V&&V.mapping===Pr?V.image.height:null,W=f[x.type];x.precision!==null&&(d=n.getMaxPrecision(x.precision),d!==x.precision&&Qe("WebGLProgram.getParameters:",x.precision,"not supported, using",d,"instead."));let J=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,oe=J!==void 0?J.length:0,re=0;F.morphAttributes.position!==void 0&&(re=1),F.morphAttributes.normal!==void 0&&(re=2),F.morphAttributes.color!==void 0&&(re=3);let Te,Ee,Re,se;if(W){let Dt=fi[W];Te=Dt.vertexShader,Ee=Dt.fragmentShader}else{Te=x.vertexShader,Ee=x.fragmentShader;let Dt=a.getVertexShaderStage(x),Tt=a.getFragmentShaderStage(x);a.update(x,Dt,Tt),Re=Dt.id,se=Tt.id}let le=i.getRenderTarget(),X=i.state.buffers.depth.getReversed(),q=A.isInstancedMesh===!0,$=A.isBatchedMesh===!0,pe=!!x.map,K=!!x.matcap,H=!!V,B=!!x.aoMap,Z=!!x.lightMap,ne=!!x.bumpMap&&x.wireframe===!1,te=!!x.normalMap,ce=!!x.displacementMap,xe=!!x.emissiveMap,ve=!!x.metalnessMap,Ae=!!x.roughnessMap,G=x.anisotropy>0,nt=x.clearcoat>0,Je=x.dispersion>0,O=x.retroreflectivity>0,C=x.iridescence>0,j=x.sheen>0,U=x.transmission>0,Y=G&&!!x.anisotropyMap,ae=nt&&!!x.clearcoatMap,ge=nt&&!!x.clearcoatNormalMap,ie=nt&&!!x.clearcoatRoughnessMap,de=C&&!!x.iridescenceMap,ye=C&&!!x.iridescenceThicknessMap,Pe=j&&!!x.sheenColorMap,we=j&&!!x.sheenRoughnessMap,Me=!!x.specularMap,Be=!!x.specularColorMap,Ye=!!x.specularIntensityMap,lt=U&&!!x.transmissionMap,ee=U&&!!x.thicknessMap,De=!!x.gradientMap,be=!!x.alphaMap,Le=x.alphaTest>0,ke=!!x.alphaHash,_e=!!x.extensions,et=$n;x.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(et=i.toneMapping);let Ze={shaderID:W,shaderType:x.type,shaderName:x.name,vertexShader:Te,fragmentShader:Ee,defines:x.defines,customVertexShaderID:Re,customFragmentShaderID:se,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:d,batching:$,batchingColor:$&&A._colorsTexture!==null,instancing:q,instancingColor:q&&A.instanceColor!==null,instancingMorph:q&&A.morphTexture!==null,outputColorSpace:le===null?i.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:pt.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:pe,matcap:K,envMap:H,envMapMode:H&&V.mapping,envMapCubeUVHeight:k,aoMap:B,lightMap:Z,bumpMap:ne,normalMap:te,displacementMap:ce,emissiveMap:xe,normalMapObjectSpace:te&&x.normalMapType===op,normalMapTangentSpace:te&&x.normalMapType===oc,packedNormalMap:te&&x.normalMapType===oc&&$v(x.normalMap.format),metalnessMap:ve,roughnessMap:Ae,anisotropy:G,anisotropyMap:Y,clearcoat:nt,clearcoatMap:ae,clearcoatNormalMap:ge,clearcoatRoughnessMap:ie,dispersion:Je,retroreflection:O,iridescence:C,iridescenceMap:de,iridescenceThicknessMap:ye,sheen:j,sheenColorMap:Pe,sheenRoughnessMap:we,specularMap:Me,specularColorMap:Be,specularIntensityMap:Ye,transmission:U,transmissionMap:lt,thicknessMap:ee,gradientMap:De,opaque:x.transparent===!1&&x.blending===sr&&x.alphaToCoverage===!1,alphaMap:be,alphaTest:Le,alphaHash:ke,combine:x.combine,mapUv:pe&&p(x.map.channel),aoMapUv:B&&p(x.aoMap.channel),lightMapUv:Z&&p(x.lightMap.channel),bumpMapUv:ne&&p(x.bumpMap.channel),normalMapUv:te&&p(x.normalMap.channel),displacementMapUv:ce&&p(x.displacementMap.channel),emissiveMapUv:xe&&p(x.emissiveMap.channel),metalnessMapUv:ve&&p(x.metalnessMap.channel),roughnessMapUv:Ae&&p(x.roughnessMap.channel),anisotropyMapUv:Y&&p(x.anisotropyMap.channel),clearcoatMapUv:ae&&p(x.clearcoatMap.channel),clearcoatNormalMapUv:ge&&p(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ie&&p(x.clearcoatRoughnessMap.channel),iridescenceMapUv:de&&p(x.iridescenceMap.channel),iridescenceThicknessMapUv:ye&&p(x.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&p(x.sheenColorMap.channel),sheenRoughnessMapUv:we&&p(x.sheenRoughnessMap.channel),specularMapUv:Me&&p(x.specularMap.channel),specularColorMapUv:Be&&p(x.specularColorMap.channel),specularIntensityMapUv:Ye&&p(x.specularIntensityMap.channel),transmissionMapUv:lt&&p(x.transmissionMap.channel),thicknessMapUv:ee&&p(x.thicknessMap.channel),alphaMapUv:be&&p(x.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(te||G),vertexNormals:!!F.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:A.isPoints===!0&&!!F.attributes.uv&&(pe||be),fog:!!D,useFog:x.fog===!0,fogExp2:!!D&&D.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||F.attributes.normal===void 0&&te===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:X,skinning:A.isSkinnedMesh===!0,hasPositionAttribute:F.attributes.position!==void 0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:oe,morphTextureStride:re,numSunLights:S.sun.length,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numSunLightShadows:S.sunShadowMap.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:P.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&E.length>0,shadowMapType:i.shadowMap.type,toneMapping:et,decodeVideoTexture:pe&&x.map.isVideoTexture===!0&&pt.getTransfer(x.map.colorSpace)===wt,decodeVideoTextureEmissive:xe&&x.emissiveMap.isVideoTexture===!0&&pt.getTransfer(x.emissiveMap.colorSpace)===wt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Mt,flipSided:x.side===yn,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:_e&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_e&&x.extensions.multiDraw===!0||$)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Ze.vertexUv1s=l.has(1),Ze.vertexUv2s=l.has(2),Ze.vertexUv3s=l.has(3),l.clear(),Ze}function m(x){let S=[];if(x.shaderID?S.push(x.shaderID):(S.push(x.customVertexShaderID),S.push(x.customFragmentShaderID)),x.defines!==void 0)for(let E in x.defines)S.push(E),S.push(x.defines[E]);return x.isRawShaderMaterial===!1&&(g(S,x),_(S,x),S.push(i.outputColorSpace)),S.push(x.customProgramCacheKey),S.join()}function g(x,S){x.push(S.precision),x.push(S.outputColorSpace),x.push(S.envMapMode),x.push(S.envMapCubeUVHeight),x.push(S.mapUv),x.push(S.alphaMapUv),x.push(S.lightMapUv),x.push(S.aoMapUv),x.push(S.bumpMapUv),x.push(S.normalMapUv),x.push(S.displacementMapUv),x.push(S.emissiveMapUv),x.push(S.metalnessMapUv),x.push(S.roughnessMapUv),x.push(S.anisotropyMapUv),x.push(S.clearcoatMapUv),x.push(S.clearcoatNormalMapUv),x.push(S.clearcoatRoughnessMapUv),x.push(S.iridescenceMapUv),x.push(S.iridescenceThicknessMapUv),x.push(S.sheenColorMapUv),x.push(S.sheenRoughnessMapUv),x.push(S.specularMapUv),x.push(S.specularColorMapUv),x.push(S.specularIntensityMapUv),x.push(S.transmissionMapUv),x.push(S.thicknessMapUv),x.push(S.combine),x.push(S.fogExp2),x.push(S.sizeAttenuation),x.push(S.morphTargetsCount),x.push(S.morphAttributeCount),x.push(S.numSunLights),x.push(S.numDirLights),x.push(S.numPointLights),x.push(S.numSpotLights),x.push(S.numSpotLightMaps),x.push(S.numHemiLights),x.push(S.numRectAreaLights),x.push(S.numSunLightShadows),x.push(S.numDirLightShadows),x.push(S.numPointLightShadows),x.push(S.numSpotLightShadows),x.push(S.numSpotLightShadowsWithMaps),x.push(S.numLightProbes),x.push(S.shadowMapType),x.push(S.toneMapping),x.push(S.numClippingPlanes),x.push(S.numClipIntersection),x.push(S.depthPacking)}function _(x,S){o.disableAll(),S.instancing&&o.enable(0),S.instancingColor&&o.enable(1),S.instancingMorph&&o.enable(2),S.matcap&&o.enable(3),S.envMap&&o.enable(4),S.normalMapObjectSpace&&o.enable(5),S.normalMapTangentSpace&&o.enable(6),S.clearcoat&&o.enable(7),S.iridescence&&o.enable(8),S.alphaTest&&o.enable(9),S.vertexColors&&o.enable(10),S.vertexAlphas&&o.enable(11),S.vertexUv1s&&o.enable(12),S.vertexUv2s&&o.enable(13),S.vertexUv3s&&o.enable(14),S.vertexTangents&&o.enable(15),S.anisotropy&&o.enable(16),S.alphaHash&&o.enable(17),S.batching&&o.enable(18),S.dispersion&&o.enable(19),S.retroreflection&&o.enable(24),S.batchingColor&&o.enable(20),S.gradientMap&&o.enable(21),S.packedNormalMap&&o.enable(22),S.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reversedDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.decodeVideoTextureEmissive&&o.enable(20),S.alphaToCoverage&&o.enable(21),S.numLightProbeGrids>0&&o.enable(22),S.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function M(x){let S=f[x.type],E;if(S){let R=fi[S];E=Tp.clone(R.uniforms)}else E=x.uniforms;return E}function v(x,S){let E=u.get(S);return E!==void 0?++E.usedTimes:(E=new jv(i,S,x,r),c.push(E),u.set(S,E)),E}function T(x){if(--x.usedTimes===0){let S=c.indexOf(x);c[S]=c[c.length-1],c.pop(),u.delete(x.cacheKey),x.destroy()}}function b(x){a.remove(x)}function w(){a.dispose()}return{getParameters:y,getProgramCacheKey:m,getUniforms:M,acquireProgram:v,releaseProgram:T,releaseShaderCache:b,programs:c,dispose:w}}function e_(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function t_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Hp(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Wp(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,p,y,m,g){let _=i[e];return _===void 0?(_={id:d.id,object:d,geometry:f,material:p,materialVariant:o(d),groupOrder:y,renderOrder:d.renderOrder,z:m,group:g},i[e]=_):(_.id=d.id,_.object=d,_.geometry=f,_.material=p,_.materialVariant=o(d),_.groupOrder=y,_.renderOrder=d.renderOrder,_.z=m,_.group=g),e++,_}function l(d,f,p,y,m,g,_){_.reversedDepth===!0&&(m=-m);let M=a(d,f,p,y,m,g);p.transmission>0?n.push(M):p.transparent===!0?r.push(M):t.push(M)}function c(d,f,p,y,m,g){let _=a(d,f,p,y,m,g);p.transmission>0?n.unshift(_):p.transparent===!0?r.unshift(_):t.unshift(_)}function u(d,f){t.length>1&&t.sort(d||t_),n.length>1&&n.sort(f||Hp),r.length>1&&r.sort(f||Hp)}function h(){for(let d=e,f=i.length;d<f;d++){let p=i[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:l,unshift:c,finish:h,sort:u}}function n_(){let i=new WeakMap;function e(n,r){let s=i.get(n),o;return s===void 0?(o=new Wp,i.set(n,[o])):r>=s.length?(o=new Wp,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function i_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new I,color:new Ie};break;case"SpotLight":t={position:new I,direction:new I,color:new Ie,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Ie,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Ie,groundColor:new Ie};break;case"RectAreaLight":t={color:new Ie,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function r_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new me,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var s_=0;function o_(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function a_(i){let e=new i_,t=r_(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);let r=new I,s=new Ne,o=new Ne;function a(c){let u=0,h=0,d=0;for(let A=0;A<9;A++)n.probe[A].set(0,0,0);let f=0,p=0,y=0,m=0,g=0,_=0,M=0,v=0,T=0,b=0,w=0,x=0,S=0,E=0;c.sort(o_);for(let A=0,P=c.length;A<P;A++){let D=c[A],F=D.color,z=D.intensity,L=D.distance,V=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===cr?V=D.shadow.map.texture:V=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)u+=F.r*z,h+=F.g*z,d+=F.b*z;else if(D.isLightProbe){for(let k=0;k<9;k++)n.probe[k].addScaledVector(D.sh.coefficients[k],z);E++}else if(D.isSunLight){let k=e.get(D);if(k.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let W=D.shadow,J=t.get(D);J.shadowIntensity=W.intensity,J.shadowBias=W.bias,J.shadowNormalBias=W.normalBias,J.shadowRadius=W.radius,J.shadowMapSize.copy(W.mapSize).multiply(W.getFrameExtents()),n.sunShadow[p]=J,n.sunShadowMap[p]=V;let oe=W.getViewportCount();for(let re=0;re<oe;re++)n.sunShadowMatrix[y+re]=W.getMatrix(re),n.sunShadowCascade[y+re]=W._cascadeData[re];y+=oe,p++}n.sun[f]=k,f++}else if(D.isDirectionalLight){let k=e.get(D);if(k.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let W=D.shadow,J=t.get(D);J.shadowIntensity=W.intensity,J.shadowBias=W.bias,J.shadowNormalBias=W.normalBias,J.shadowRadius=W.radius,J.shadowMapSize=W.mapSize,n.directionalShadow[m]=J,n.directionalShadowMap[m]=V,n.directionalShadowMatrix[m]=D.shadow.matrix,T++}n.directional[m]=k,m++}else if(D.isSpotLight){let k=e.get(D);k.position.setFromMatrixPosition(D.matrixWorld),k.color.copy(F).multiplyScalar(z),k.distance=L,k.coneCos=Math.cos(D.angle),k.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),k.decay=D.decay,n.spot[_]=k;let W=D.shadow;if(D.map&&(n.spotLightMap[x]=D.map,x++,W.updateMatrices(D),D.castShadow&&S++),n.spotLightMatrix[_]=W.matrix,D.castShadow){let J=t.get(D);J.shadowIntensity=W.intensity,J.shadowBias=W.bias,J.shadowNormalBias=W.normalBias,J.shadowRadius=W.radius,J.shadowMapSize=W.mapSize,n.spotShadow[_]=J,n.spotShadowMap[_]=V,w++}_++}else if(D.isRectAreaLight){let k=e.get(D);k.color.copy(F).multiplyScalar(z),k.halfWidth.set(D.width*.5,0,0),k.halfHeight.set(0,D.height*.5,0),n.rectArea[M]=k,M++}else if(D.isPointLight){let k=e.get(D);if(k.color.copy(D.color).multiplyScalar(D.intensity),k.distance=D.distance,k.decay=D.decay,D.castShadow){let W=D.shadow,J=t.get(D);J.shadowIntensity=W.intensity,J.shadowBias=W.bias,J.shadowNormalBias=W.normalBias,J.shadowRadius=W.radius,J.shadowMapSize=W.mapSize,J.shadowCameraNear=W.camera.near,J.shadowCameraFar=W.camera.far,n.pointShadow[g]=J,n.pointShadowMap[g]=V,n.pointShadowMatrix[g]=D.shadow.matrix,b++}n.point[g]=k,g++}else if(D.isHemisphereLight){let k=e.get(D);k.skyColor.copy(D.color).multiplyScalar(z),k.groundColor.copy(D.groundColor).multiplyScalar(z),n.hemi[v]=k,v++}}M>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Fe.LTC_FLOAT_1,n.rectAreaLTC2=Fe.LTC_FLOAT_2):(n.rectAreaLTC1=Fe.LTC_HALF_1,n.rectAreaLTC2=Fe.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;let R=n.hash;(R.sunLength!==f||R.directionalLength!==m||R.pointLength!==g||R.spotLength!==_||R.rectAreaLength!==M||R.hemiLength!==v||R.numSunShadows!==p||R.numDirectionalShadows!==T||R.numPointShadows!==b||R.numSpotShadows!==w||R.numSpotMaps!==x||R.numLightProbes!==E)&&(n.sun.length=f,n.directional.length=m,n.spot.length=_,n.rectArea.length=M,n.point.length=g,n.hemi.length=v,n.sunShadow.length=p,n.sunShadowMap.length=p,n.sunShadowMatrix.length=y,n.sunShadowCascade.length=y,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.directionalShadowMatrix.length=T,n.pointShadow.length=b,n.pointShadowMap.length=b,n.pointShadowMatrix.length=b,n.spotShadow.length=w,n.spotShadowMap.length=w,n.spotLightMatrix.length=w+x-S,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=E,R.sunLength=f,R.directionalLength=m,R.pointLength=g,R.spotLength=_,R.rectAreaLength=M,R.hemiLength=v,R.numSunShadows=p,R.numDirectionalShadows=T,R.numPointShadows=b,R.numSpotShadows=w,R.numSpotMaps=x,R.numLightProbes=E,n.version=s_++)}function l(c,u){let h=0,d=0,f=0,p=0,y=0,m=0,g=u.matrixWorldInverse;for(let _=0,M=c.length;_<M;_++){let v=c[_];if(v.isSunLight){let T=n.sun[h];T.direction.setFromMatrixPosition(v.matrixWorld),T.direction.transformDirection(g),h++}else if(v.isDirectionalLight){let T=n.directional[d];T.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(g),d++}else if(v.isSpotLight){let T=n.spot[p];T.position.setFromMatrixPosition(v.matrixWorld),T.position.applyMatrix4(g),T.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),T.direction.sub(r),T.direction.transformDirection(g),p++}else if(v.isRectAreaLight){let T=n.rectArea[y];T.position.setFromMatrixPosition(v.matrixWorld),T.position.applyMatrix4(g),o.identity(),s.copy(v.matrixWorld),s.premultiply(g),o.extractRotation(s),T.halfWidth.set(v.width*.5,0,0),T.halfHeight.set(0,v.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),y++}else if(v.isPointLight){let T=n.point[f];T.position.setFromMatrixPosition(v.matrixWorld),T.position.applyMatrix4(g),f++}else if(v.isHemisphereLight){let T=n.hemi[m];T.direction.setFromMatrixPosition(v.matrixWorld),T.direction.transformDirection(g),m++}}}return{setup:a,setupView:l,state:n}}function Xp(i){let e=new a_(i),t=[],n=[],r=[];function s(d){h.camera=d,t.length=0,n.length=0,r.length=0}function o(d){t.push(d)}function a(d){n.push(d)}function l(d){r.push(d)}function c(){e.setup(t)}function u(d){e.setupView(t,d)}let h={lightsArray:t,shadowsArray:n,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:h,setupLights:c,setupLightsView:u,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function l_(i){let e=new WeakMap;function t(r,s=0){let o=e.get(r),a;return o===void 0?(a=new Xp(i),e.set(r,[a])):s>=o.length?(a=new Xp(i),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var c_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,u_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,h_=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],d_=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],qp=new Ne,Ko=new I,bh=new I;function f_(i,e,t){let n=new _s,r=new me,s=new me,o=new mt,a=new ll,l=new cl,c={},u=t.maxTextureSize,h={[ui]:yn,[yn]:ui,[Mt]:Mt},d=new Vt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new me},radius:{value:4}},vertexShader:c_,fragmentShader:u_}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let p=new it;p.setAttribute("position",new tt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Se(p,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Oo;let g=this.type;this.render=function(b,w,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;this.type===bl&&(Qe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Oo);let S=i.getRenderTarget(),E=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),A=i.state;A.setBlending(hi),A.buffers.depth.getReversed()===!0?A.buffers.color.setClear(0,0,0,0):A.buffers.color.setClear(1,1,1,1),A.buffers.depth.setTest(!0),A.setScissorTest(!1);let P=g!==this.type;P&&w.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(F=>F.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,F=b.length;D<F;D++){let z=b[D],L=z.shadow;if(L===void 0){Qe("WebGLShadowMap:",z,"has no shadow.");continue}if(L.autoUpdate===!1&&L.needsUpdate===!1)continue;r.copy(L.mapSize);let V=L.getFrameExtents();r.multiply(V),s.copy(L.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/V.x),r.x=s.x*V.x,L.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/V.y),r.y=s.y*V.y,L.mapSize.y=s.y));let k=i.state.buffers.depth.getReversed();if(L.camera._reversedDepth=k,L.map===null||P===!0){if(L.map!==null&&(L.map.depthTexture!==null&&(L.map.depthTexture.dispose(),L.map.depthTexture=null),L.map.dispose()),this.type===Cs){if(z.isPointLight){Qe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}L.map=new Mn(r.x,r.y,{format:cr,type:Nn,minFilter:Ft,magFilter:Ft,generateMipmaps:!1}),L.map.texture.name=z.name+".shadowMap",L.map.depthTexture=new Qi(r.x,r.y,Ln),L.map.depthTexture.name=z.name+".shadowMapDepth",L.map.depthTexture.format=oi,L.map.depthTexture.compareFunction=null,L.map.depthTexture.minFilter=Kt,L.map.depthTexture.magFilter=Kt}else z.isPointLight?(L.map=new dc(r.x),L.map.depthTexture=new tl(r.x,ei)):(L.map=new Mn(r.x,r.y),L.map.depthTexture=new Qi(r.x,r.y,ei)),L.map.depthTexture.name=z.name+".shadowMap",L.map.depthTexture.format=oi,this.type===Oo?(L.map.depthTexture.compareFunction=k?lc:ac,L.map.depthTexture.minFilter=Ft,L.map.depthTexture.magFilter=Ft):(L.map.depthTexture.compareFunction=null,L.map.depthTexture.minFilter=Kt,L.map.depthTexture.magFilter=Kt);L.camera.updateProjectionMatrix()}L.map.isWebGLCubeRenderTarget!==!0&&(L.map.width!==r.x||L.map.height!==r.y)&&L.map.setSize(r.x,r.y);let W=L.map.isWebGLCubeRenderTarget?6:L.getViewportCount();z.isPointLight!==!0&&L.updateMatrices(z,x);for(let J=0;J<W;J++){let oe=L.getCamera(J);if(z.isPointLight){let re=L.camera,Te=L.matrix,Ee=z.distance||re.far;Ee!==re.far&&(re.far=Ee,re.updateProjectionMatrix()),Ko.setFromMatrixPosition(z.matrixWorld),re.position.copy(Ko),bh.copy(re.position),bh.add(h_[J]),re.up.copy(d_[J]),re.lookAt(bh),re.updateMatrixWorld(),Te.makeTranslation(-Ko.x,-Ko.y,-Ko.z),qp.multiplyMatrices(re.projectionMatrix,re.matrixWorldInverse),L._frustum.setFromProjectionMatrix(qp,re.coordinateSystem,re.reversedDepth)}if(L.map.isWebGLCubeRenderTarget)i.setRenderTarget(L.map,J),i.clear();else{J===0&&(i.setRenderTarget(L.map),i.clear());let re=L.getViewport(J);o.set(s.x*re.x,s.y*re.y,s.x*re.z,s.y*re.w),A.viewport(o)}n=L.getFrustum(J),v(w,x,oe,z,this.type)}L.isPointLightShadow!==!0&&this.type===Cs&&_(L,x),L.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(S,E,R)};function _(b,w){let x=e.update(y);d.defines.VSM_SAMPLES!==b.blurSamples&&(d.defines.VSM_SAMPLES=b.blurSamples,f.defines.VSM_SAMPLES=b.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),b.mapPass===null?b.mapPass=new Mn(r.x,r.y,{format:cr,type:Nn}):(b.mapPass.width!==b.map.width||b.mapPass.height!==b.map.height)&&b.mapPass.setSize(b.map.width,b.map.height),d.uniforms.shadow_pass.value=b.map.depthTexture,d.uniforms.resolution.value.set(b.map.width,b.map.height),d.uniforms.radius.value=b.radius,i.setRenderTarget(b.mapPass),i.clear(),i.renderBufferDirect(w,null,x,d,y,null),f.uniforms.shadow_pass.value=b.mapPass.texture,f.uniforms.resolution.value.set(b.map.width,b.map.height),f.uniforms.radius.value=b.radius,i.setRenderTarget(b.map),i.clear(),i.renderBufferDirect(w,null,x,f,y,null)}function M(b,w,x,S){let E=null,R=x.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(R!==void 0)E=R;else if(E=x.isPointLight===!0?l:a,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let A=E.uuid,P=w.uuid,D=c[A];D===void 0&&(D={},c[A]=D);let F=D[P];F===void 0&&(F=E.clone(),D[P]=F,w.addEventListener("dispose",T)),E=F}if(E.visible=w.visible,E.wireframe=w.wireframe,S===Cs?E.side=w.shadowSide!==null?w.shadowSide:w.side:E.side=w.shadowSide!==null?w.shadowSide:h[w.side],E.alphaMap=w.alphaMap,E.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,E.map=w.map,E.clipShadows=w.clipShadows,E.clippingPlanes=w.clippingPlanes,E.clipIntersection=w.clipIntersection,E.displacementMap=w.displacementMap,E.displacementScale=w.displacementScale,E.displacementBias=w.displacementBias,E.wireframeLinewidth=w.wireframeLinewidth,E.linewidth=w.linewidth,x.isPointLight===!0&&E.isMeshDistanceMaterial===!0){let A=i.properties.get(E);A.light=x}return E}function v(b,w,x,S,E){if(b.visible===!1)return;if(b.layers.test(w.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&E===Cs)&&(!b.frustumCulled||b.intersectsFrustum(n))){b.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,b.matrixWorld);let P=e.update(b),D=b.material;if(Array.isArray(D)){let F=P.groups;for(let z=0,L=F.length;z<L;z++){let V=F[z],k=D[V.materialIndex];if(k&&k.visible){let W=M(b,k,S,E);b.onBeforeShadow(i,b,w,x,P,W,V),i.renderBufferDirect(x,null,P,W,b,V),b.onAfterShadow(i,b,w,x,P,W,V)}}}else if(D.visible){let F=M(b,D,S,E);b.onBeforeShadow(i,b,w,x,P,F,null),i.renderBufferDirect(x,null,P,F,b,null),b.onAfterShadow(i,b,w,x,P,F,null)}}let A=b.children;for(let P=0,D=A.length;P<D;P++)v(A[P],w,x,S,E)}function T(b){b.target.removeEventListener("dispose",T);for(let x in c){let S=c[x],E=b.target.uuid;E in S&&(S[E].dispose(),delete S[E])}}}function p_(i,e){function t(){let ee=!1,De=new mt,be=null,Le=new mt(0,0,0,0);return{setMask:function(ke){be!==ke&&!ee&&(i.colorMask(ke,ke,ke,ke),be=ke)},setLocked:function(ke){ee=ke},setClear:function(ke,_e,et,Ze,Dt){Dt===!0&&(ke*=Ze,_e*=Ze,et*=Ze),De.set(ke,_e,et,Ze),Le.equals(De)===!1&&(i.clearColor(ke,_e,et,Ze),Le.copy(De))},reset:function(){ee=!1,be=null,Le.set(-1,0,0,0)}}}function n(){let ee=!1,De=!1,be=null,Le=null,ke=null;return{setReversed:function(_e){if(De!==_e){let et=e.get("EXT_clip_control");_e?et.clipControlEXT(et.LOWER_LEFT_EXT,et.ZERO_TO_ONE_EXT):et.clipControlEXT(et.LOWER_LEFT_EXT,et.NEGATIVE_ONE_TO_ONE_EXT),De=_e;let Ze=ke;ke=null,this.setClear(Ze)}},getReversed:function(){return De},setTest:function(_e){_e?le(i.DEPTH_TEST):X(i.DEPTH_TEST)},setMask:function(_e){be!==_e&&!ee&&(i.depthMask(_e),be=_e)},setFunc:function(_e){if(De&&(_e=xp[_e]),Le!==_e){switch(_e){case Ha:i.depthFunc(i.NEVER);break;case Wa:i.depthFunc(i.ALWAYS);break;case Xa:i.depthFunc(i.LESS);break;case us:i.depthFunc(i.LEQUAL);break;case qa:i.depthFunc(i.EQUAL);break;case Ka:i.depthFunc(i.GEQUAL);break;case Ya:i.depthFunc(i.GREATER);break;case Za:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Le=_e}},setLocked:function(_e){ee=_e},setClear:function(_e){ke!==_e&&(ke=_e,De&&(_e=1-_e),i.clearDepth(_e))},reset:function(){ee=!1,be=null,Le=null,ke=null,De=!1}}}function r(){let ee=!1,De=null,be=null,Le=null,ke=null,_e=null,et=null,Ze=null,Dt=null;return{setTest:function(Tt){ee||(Tt?le(i.STENCIL_TEST):X(i.STENCIL_TEST))},setMask:function(Tt){De!==Tt&&!ee&&(i.stencilMask(Tt),De=Tt)},setFunc:function(Tt,Hn,ti){(be!==Tt||Le!==Hn||ke!==ti)&&(i.stencilFunc(Tt,Hn,ti),be=Tt,Le=Hn,ke=ti)},setOp:function(Tt,Hn,ti){(_e!==Tt||et!==Hn||Ze!==ti)&&(i.stencilOp(Tt,Hn,ti),_e=Tt,et=Hn,Ze=ti)},setLocked:function(Tt){ee=Tt},setClear:function(Tt){Dt!==Tt&&(i.clearStencil(Tt),Dt=Tt)},reset:function(){ee=!1,De=null,be=null,Le=null,ke=null,_e=null,et=null,Ze=null,Dt=null}}}let s=new t,o=new n,a=new r,l=new WeakMap,c=new WeakMap,u={},h={},d={},f=new WeakMap,p=[],y=null,m=!1,g=null,_=null,M=null,v=null,T=null,b=null,w=null,x=new Ie(0,0,0),S=0,E=!1,R=null,A=null,P=null,D=null,F=null,z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),L=!1,V=0,k=i.getParameter(i.VERSION);k.indexOf("WebGL")!==-1?(V=parseFloat(/^WebGL (\d)/.exec(k)[1]),L=V>=1):k.indexOf("OpenGL ES")!==-1&&(V=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),L=V>=2);let W=null,J={},oe=i.getParameter(i.SCISSOR_BOX),re=i.getParameter(i.VIEWPORT),Te=new mt().fromArray(oe),Ee=new mt().fromArray(re);function Re(ee,De,be,Le){let ke=new Uint8Array(4),_e=i.createTexture();i.bindTexture(ee,_e),i.texParameteri(ee,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(ee,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let et=0;et<be;et++)ee===i.TEXTURE_3D||ee===i.TEXTURE_2D_ARRAY?i.texImage3D(De,0,i.RGBA,1,1,Le,0,i.RGBA,i.UNSIGNED_BYTE,ke):i.texImage2D(De+et,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ke);return _e}let se={};se[i.TEXTURE_2D]=Re(i.TEXTURE_2D,i.TEXTURE_2D,1),se[i.TEXTURE_CUBE_MAP]=Re(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[i.TEXTURE_2D_ARRAY]=Re(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),se[i.TEXTURE_3D]=Re(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),le(i.DEPTH_TEST),o.setFunc(us),ne(!1),te(zu),le(i.CULL_FACE),B(hi);function le(ee){u[ee]!==!0&&(i.enable(ee),u[ee]=!0)}function X(ee){u[ee]!==!1&&(i.disable(ee),u[ee]=!1)}function q(ee,De){return d[ee]!==De?(i.bindFramebuffer(ee,De),d[ee]=De,ee===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=De),ee===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=De),!0):!1}function $(ee,De){let be=p,Le=!1;if(ee){be=f.get(De),be===void 0&&(be=[],f.set(De,be));let ke=ee.textures;if(be.length!==ke.length||be[0]!==i.COLOR_ATTACHMENT0){for(let _e=0,et=ke.length;_e<et;_e++)be[_e]=i.COLOR_ATTACHMENT0+_e;be.length=ke.length,Le=!0}}else be[0]!==i.BACK&&(be[0]=i.BACK,Le=!0);Le&&i.drawBuffers(be)}function pe(ee){return y!==ee?(i.useProgram(ee),y=ee,!0):!1}let K={[Cr]:i.FUNC_ADD,[Bf]:i.FUNC_SUBTRACT,[kf]:i.FUNC_REVERSE_SUBTRACT};K[zf]=i.MIN,K[Vf]=i.MAX;let H={[Gf]:i.ZERO,[Hf]:i.ONE,[Wf]:i.SRC_COLOR,[Hu]:i.SRC_ALPHA,[jf]:i.SRC_ALPHA_SATURATE,[Yf]:i.DST_COLOR,[qf]:i.DST_ALPHA,[Xf]:i.ONE_MINUS_SRC_COLOR,[Wu]:i.ONE_MINUS_SRC_ALPHA,[Zf]:i.ONE_MINUS_DST_COLOR,[Kf]:i.ONE_MINUS_DST_ALPHA,[Jf]:i.CONSTANT_COLOR,[$f]:i.ONE_MINUS_CONSTANT_COLOR,[Qf]:i.CONSTANT_ALPHA,[ep]:i.ONE_MINUS_CONSTANT_ALPHA};function B(ee,De,be,Le,ke,_e,et,Ze,Dt,Tt){if(ee===hi){m===!0&&(X(i.BLEND),m=!1);return}if(m===!1&&(le(i.BLEND),m=!0),ee!==Of){if(ee!==g||Tt!==E){if((_!==Cr||T!==Cr)&&(i.blendEquation(i.FUNC_ADD),_=Cr,T=Cr),Tt)switch(ee){case sr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case or:i.blendFunc(i.ONE,i.ONE);break;case Vu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Gu:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:rt("WebGLState: Invalid blending: ",ee);break}else switch(ee){case sr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case or:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Vu:rt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Gu:rt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:rt("WebGLState: Invalid blending: ",ee);break}M=null,v=null,b=null,w=null,x.set(0,0,0),S=0,g=ee,E=Tt}return}ke=ke||De,_e=_e||be,et=et||Le,(De!==_||ke!==T)&&(i.blendEquationSeparate(K[De],K[ke]),_=De,T=ke),(be!==M||Le!==v||_e!==b||et!==w)&&(i.blendFuncSeparate(H[be],H[Le],H[_e],H[et]),M=be,v=Le,b=_e,w=et),(Ze.equals(x)===!1||Dt!==S)&&(i.blendColor(Ze.r,Ze.g,Ze.b,Dt),x.copy(Ze),S=Dt),g=ee,E=!1}function Z(ee,De){ee.side===Mt?X(i.CULL_FACE):le(i.CULL_FACE);let be=ee.side===yn;De&&(be=!be),ne(be),ee.blending===sr&&ee.transparent===!1?B(hi):B(ee.blending,ee.blendEquation,ee.blendSrc,ee.blendDst,ee.blendEquationAlpha,ee.blendSrcAlpha,ee.blendDstAlpha,ee.blendColor,ee.blendAlpha,ee.premultipliedAlpha),o.setFunc(ee.depthFunc),o.setTest(ee.depthTest),o.setMask(ee.depthWrite),s.setMask(ee.colorWrite);let Le=ee.stencilWrite;a.setTest(Le),Le&&(a.setMask(ee.stencilWriteMask),a.setFunc(ee.stencilFunc,ee.stencilRef,ee.stencilFuncMask),a.setOp(ee.stencilFail,ee.stencilZFail,ee.stencilZPass)),xe(ee.polygonOffset,ee.polygonOffsetFactor,ee.polygonOffsetUnits),ee.alphaToCoverage===!0?le(i.SAMPLE_ALPHA_TO_COVERAGE):X(i.SAMPLE_ALPHA_TO_COVERAGE)}function ne(ee){R!==ee&&(ee?i.frontFace(i.CW):i.frontFace(i.CCW),R=ee)}function te(ee){ee!==Ff?(le(i.CULL_FACE),ee!==A&&(ee===zu?i.cullFace(i.BACK):ee===Uf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):X(i.CULL_FACE),A=ee}function ce(ee){ee!==P&&(L&&i.lineWidth(ee),P=ee)}function xe(ee,De,be){ee?(le(i.POLYGON_OFFSET_FILL),(D!==De||F!==be)&&(D=De,F=be,o.getReversed()&&(De=-De),i.polygonOffset(De,be))):X(i.POLYGON_OFFSET_FILL)}function ve(ee){ee?le(i.SCISSOR_TEST):X(i.SCISSOR_TEST)}function Ae(ee){ee===void 0&&(ee=i.TEXTURE0+z-1),W!==ee&&(i.activeTexture(ee),W=ee)}function G(ee,De,be){be===void 0&&(W===null?be=i.TEXTURE0+z-1:be=W);let Le=J[be];Le===void 0&&(Le={type:void 0,texture:void 0},J[be]=Le),(Le.type!==ee||Le.texture!==De)&&(W!==be&&(i.activeTexture(be),W=be),i.bindTexture(ee,De||se[ee]),Le.type=ee,Le.texture=De)}function nt(){let ee=J[W];ee!==void 0&&ee.type!==void 0&&(i.bindTexture(ee.type,null),ee.type=void 0,ee.texture=void 0)}function Je(){try{i.compressedTexImage2D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function O(){try{i.compressedTexImage3D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function C(){try{i.texSubImage2D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function j(){try{i.texSubImage3D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function U(){try{i.compressedTexSubImage2D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function Y(){try{i.compressedTexSubImage3D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function ae(){try{i.texStorage2D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function ge(){try{i.texStorage3D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function ie(){try{i.texImage2D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function de(){try{i.texImage3D(...arguments)}catch(ee){rt("WebGLState:",ee)}}function ye(ee){return h[ee]!==void 0?h[ee]:i.getParameter(ee)}function Pe(ee,De){h[ee]!==De&&(i.pixelStorei(ee,De),h[ee]=De)}function we(ee){Te.equals(ee)===!1&&(i.scissor(ee.x,ee.y,ee.z,ee.w),Te.copy(ee))}function Me(ee){Ee.equals(ee)===!1&&(i.viewport(ee.x,ee.y,ee.z,ee.w),Ee.copy(ee))}function Be(ee,De){let be=c.get(De);be===void 0&&(be=new WeakMap,c.set(De,be));let Le=be.get(ee);Le===void 0&&(Le=i.getUniformBlockIndex(De,ee.name),be.set(ee,Le))}function Ye(ee,De){let Le=c.get(De).get(ee);l.get(De)!==Le&&(i.uniformBlockBinding(De,Le,ee.__bindingPointIndex),l.set(De,Le))}function lt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},h={},W=null,J={},d={},f=new WeakMap,p=[],y=null,m=!1,g=null,_=null,M=null,v=null,T=null,b=null,w=null,x=new Ie(0,0,0),S=0,E=!1,R=null,A=null,P=null,D=null,F=null,Te.set(0,0,i.canvas.width,i.canvas.height),Ee.set(0,0,i.canvas.width,i.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:le,disable:X,bindFramebuffer:q,drawBuffers:$,useProgram:pe,setBlending:B,setMaterial:Z,setFlipSided:ne,setCullFace:te,setLineWidth:ce,setPolygonOffset:xe,setScissorTest:ve,activeTexture:Ae,bindTexture:G,unbindTexture:nt,compressedTexImage2D:Je,compressedTexImage3D:O,texImage2D:ie,texImage3D:de,pixelStorei:Pe,getParameter:ye,updateUBOMapping:Be,uniformBlockBinding:Ye,texStorage2D:ae,texStorage3D:ge,texSubImage2D:C,texSubImage3D:j,compressedTexSubImage2D:U,compressedTexSubImage3D:Y,scissor:we,viewport:Me,reset:lt}}function m_(i,e,t,n,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new me,u=new WeakMap,h=new Set,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(O,C){return p?new OffscreenCanvas(O,C):fs("canvas")}function m(O,C,j){let U=1,Y=Je(O);if((Y.width>j||Y.height>j)&&(U=j/Math.max(Y.width,Y.height)),U<1)if(typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&O instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&O instanceof ImageBitmap||typeof VideoFrame<"u"&&O instanceof VideoFrame){let ae=Math.floor(U*Y.width),ge=Math.floor(U*Y.height);d===void 0&&(d=y(ae,ge));let ie=C?y(ae,ge):d;return ie.width=ae,ie.height=ge,ie.getContext("2d").drawImage(O,0,0,ae,ge),Qe("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+ae+"x"+ge+")."),ie}else return"data"in O&&Qe("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),O;return O}function g(O){return O.generateMipmaps}function _(O){i.generateMipmap(O)}function M(O){return O.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:O.isWebGL3DRenderTarget?i.TEXTURE_3D:O.isWebGLArrayRenderTarget||O.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(O,C,j,U,Y,ae=!1){if(O!==null){if(i[O]!==void 0)return i[O];Qe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+O+"'")}let ge;U&&(ge=e.get("EXT_texture_norm16"),ge||Qe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ie=C;if(C===i.RED&&(j===i.FLOAT&&(ie=i.R32F),j===i.HALF_FLOAT&&(ie=i.R16F),j===i.UNSIGNED_BYTE&&(ie=i.R8),j===i.UNSIGNED_SHORT&&ge&&(ie=ge.R16_EXT),j===i.SHORT&&ge&&(ie=ge.R16_SNORM_EXT)),C===i.RED_INTEGER&&(j===i.UNSIGNED_BYTE&&(ie=i.R8UI),j===i.UNSIGNED_SHORT&&(ie=i.R16UI),j===i.UNSIGNED_INT&&(ie=i.R32UI),j===i.BYTE&&(ie=i.R8I),j===i.SHORT&&(ie=i.R16I),j===i.INT&&(ie=i.R32I)),C===i.RG&&(j===i.FLOAT&&(ie=i.RG32F),j===i.HALF_FLOAT&&(ie=i.RG16F),j===i.UNSIGNED_BYTE&&(ie=i.RG8),j===i.UNSIGNED_SHORT&&ge&&(ie=ge.RG16_EXT),j===i.SHORT&&ge&&(ie=ge.RG16_SNORM_EXT)),C===i.RG_INTEGER&&(j===i.UNSIGNED_BYTE&&(ie=i.RG8UI),j===i.UNSIGNED_SHORT&&(ie=i.RG16UI),j===i.UNSIGNED_INT&&(ie=i.RG32UI),j===i.BYTE&&(ie=i.RG8I),j===i.SHORT&&(ie=i.RG16I),j===i.INT&&(ie=i.RG32I)),C===i.RGB_INTEGER&&(j===i.UNSIGNED_BYTE&&(ie=i.RGB8UI),j===i.UNSIGNED_SHORT&&(ie=i.RGB16UI),j===i.UNSIGNED_INT&&(ie=i.RGB32UI),j===i.BYTE&&(ie=i.RGB8I),j===i.SHORT&&(ie=i.RGB16I),j===i.INT&&(ie=i.RGB32I)),C===i.RGBA_INTEGER&&(j===i.UNSIGNED_BYTE&&(ie=i.RGBA8UI),j===i.UNSIGNED_SHORT&&(ie=i.RGBA16UI),j===i.UNSIGNED_INT&&(ie=i.RGBA32UI),j===i.BYTE&&(ie=i.RGBA8I),j===i.SHORT&&(ie=i.RGBA16I),j===i.INT&&(ie=i.RGBA32I)),C===i.RGB&&(j===i.UNSIGNED_SHORT&&ge&&(ie=ge.RGB16_EXT),j===i.SHORT&&ge&&(ie=ge.RGB16_SNORM_EXT),j===i.UNSIGNED_INT_5_9_9_9_REV&&(ie=i.RGB9_E5),j===i.UNSIGNED_INT_10F_11F_11F_REV&&(ie=i.R11F_G11F_B10F)),C===i.RGBA){let de=ae?so:pt.getTransfer(Y);j===i.FLOAT&&(ie=i.RGBA32F),j===i.HALF_FLOAT&&(ie=i.RGBA16F),j===i.UNSIGNED_BYTE&&(ie=de===wt?i.SRGB8_ALPHA8:i.RGBA8),j===i.UNSIGNED_SHORT&&ge&&(ie=ge.RGBA16_EXT),j===i.SHORT&&ge&&(ie=ge.RGBA16_SNORM_EXT),j===i.UNSIGNED_SHORT_4_4_4_4&&(ie=i.RGBA4),j===i.UNSIGNED_SHORT_5_5_5_1&&(ie=i.RGB5_A1)}return(ie===i.R16F||ie===i.R32F||ie===i.RG16F||ie===i.RG32F||ie===i.RGBA16F||ie===i.RGBA32F)&&e.get("EXT_color_buffer_float"),ie}function T(O,C){let j;return O?C===null||C===ei||C===Is?j=i.DEPTH24_STENCIL8:C===Ln?j=i.DEPTH32F_STENCIL8:C===Ps&&(j=i.DEPTH24_STENCIL8,Qe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):C===null||C===ei||C===Is?j=i.DEPTH_COMPONENT24:C===Ln?j=i.DEPTH_COMPONENT32F:C===Ps&&(j=i.DEPTH_COMPONENT16),j}function b(O,C){return g(O)===!0||O.isFramebufferTexture&&O.minFilter!==Kt&&O.minFilter!==Ft?Math.log2(Math.max(C.width,C.height))+1:O.mipmaps!==void 0&&O.mipmaps.length>0?O.mipmaps.length:O.isCompressedTexture&&Array.isArray(O.image)?C.mipmaps.length:1}function w(O){let C=O.target;C.removeEventListener("dispose",w),S(C),C.isVideoTexture&&u.delete(C),C.isHTMLTexture&&h.delete(C)}function x(O){let C=O.target;C.removeEventListener("dispose",x),R(C)}function S(O){let C=n.get(O);if(C.__webglInit===void 0)return;let j=O.source,U=f.get(j);if(U){let Y=U[C.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&E(O),Object.keys(U).length===0&&f.delete(j)}n.remove(O)}function E(O){let C=n.get(O);i.deleteTexture(C.__webglTexture);let j=O.source,U=f.get(j);delete U[C.__cacheKey],o.memory.textures--}function R(O){let C=n.get(O);if(O.depthTexture&&(O.depthTexture.dispose(),n.remove(O.depthTexture)),O.isWebGLCubeRenderTarget)for(let U=0;U<6;U++){if(Array.isArray(C.__webglFramebuffer[U]))for(let Y=0;Y<C.__webglFramebuffer[U].length;Y++)i.deleteFramebuffer(C.__webglFramebuffer[U][Y]);else i.deleteFramebuffer(C.__webglFramebuffer[U]);C.__webglDepthbuffer&&i.deleteRenderbuffer(C.__webglDepthbuffer[U])}else{if(Array.isArray(C.__webglFramebuffer))for(let U=0;U<C.__webglFramebuffer.length;U++)i.deleteFramebuffer(C.__webglFramebuffer[U]);else i.deleteFramebuffer(C.__webglFramebuffer);if(C.__webglDepthbuffer&&i.deleteRenderbuffer(C.__webglDepthbuffer),C.__webglMultisampledFramebuffer&&i.deleteFramebuffer(C.__webglMultisampledFramebuffer),C.__webglColorRenderbuffer)for(let U=0;U<C.__webglColorRenderbuffer.length;U++)C.__webglColorRenderbuffer[U]&&i.deleteRenderbuffer(C.__webglColorRenderbuffer[U]);C.__webglDepthRenderbuffer&&i.deleteRenderbuffer(C.__webglDepthRenderbuffer)}let j=O.textures;for(let U=0,Y=j.length;U<Y;U++){let ae=n.get(j[U]);ae.__webglTexture&&(i.deleteTexture(ae.__webglTexture),o.memory.textures--),n.remove(j[U])}n.remove(O)}let A=0;function P(){A=0}function D(){return A}function F(O){A=O}function z(){let O=A;return O>=r.maxTextures&&Qe("WebGLTextures: Trying to use "+(O+1)+" texture units while this GPU supports only "+r.maxTextures),A+=1,O}function L(O){let C=[];return C.push(O.wrapS),C.push(O.wrapT),C.push(O.wrapR||0),C.push(O.magFilter),C.push(O.minFilter),C.push(O.anisotropy),C.push(O.internalFormat),C.push(O.format),C.push(O.type),C.push(O.generateMipmaps),C.push(O.premultiplyAlpha),C.push(O.flipY),C.push(O.unpackAlignment),C.push(O.colorSpace),C.join()}function V(O,C){let j=n.get(O);if(O.isVideoTexture&&G(O),O.isRenderTargetTexture===!1&&O.isExternalTexture!==!0&&O.version>0&&j.__version!==O.version){let U=O.image;if(U===null)Qe("WebGLRenderer: Texture marked for update but no image data found.");else if(U.complete===!1)Qe("WebGLRenderer: Texture marked for update but image is incomplete");else{X(j,O,C);return}}else O.isExternalTexture&&(j.__webglTexture=O.sourceTexture?O.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,j.__webglTexture,i.TEXTURE0+C)}function k(O,C){let j=n.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&j.__version!==O.version){X(j,O,C);return}else O.isExternalTexture&&(j.__webglTexture=O.sourceTexture?O.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,j.__webglTexture,i.TEXTURE0+C)}function W(O,C){let j=n.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&j.__version!==O.version){X(j,O,C);return}t.bindTexture(i.TEXTURE_3D,j.__webglTexture,i.TEXTURE0+C)}function J(O,C){let j=n.get(O);if(O.isCubeDepthTexture!==!0&&O.version>0&&j.__version!==O.version){q(j,O,C);return}t.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture,i.TEXTURE0+C)}let oe={[Ji]:i.REPEAT,[On]:i.CLAMP_TO_EDGE,[hs]:i.MIRRORED_REPEAT},re={[Kt]:i.NEAREST,[Ml]:i.NEAREST_MIPMAP_NEAREST,[Ir]:i.NEAREST_MIPMAP_LINEAR,[Ft]:i.LINEAR,[Rs]:i.LINEAR_MIPMAP_NEAREST,[Qn]:i.LINEAR_MIPMAP_LINEAR},Te={[lp]:i.NEVER,[fp]:i.ALWAYS,[cp]:i.LESS,[ac]:i.LEQUAL,[up]:i.EQUAL,[lc]:i.GEQUAL,[hp]:i.GREATER,[dp]:i.NOTEQUAL};function Ee(O,C){if(C.type===Ln&&e.has("OES_texture_float_linear")===!1&&(C.magFilter===Ft||C.magFilter===Rs||C.magFilter===Ir||C.magFilter===Qn||C.minFilter===Ft||C.minFilter===Rs||C.minFilter===Ir||C.minFilter===Qn)&&Qe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(O,i.TEXTURE_WRAP_S,oe[C.wrapS]),i.texParameteri(O,i.TEXTURE_WRAP_T,oe[C.wrapT]),(O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY)&&i.texParameteri(O,i.TEXTURE_WRAP_R,oe[C.wrapR]),i.texParameteri(O,i.TEXTURE_MAG_FILTER,re[C.magFilter]),i.texParameteri(O,i.TEXTURE_MIN_FILTER,re[C.minFilter]),C.compareFunction&&(i.texParameteri(O,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(O,i.TEXTURE_COMPARE_FUNC,Te[C.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(C.magFilter===Kt||C.minFilter!==Ir&&C.minFilter!==Qn||C.type===Ln&&e.has("OES_texture_float_linear")===!1)return;if(C.anisotropy>1||n.get(C).__currentAnisotropy){let j=e.get("EXT_texture_filter_anisotropic");i.texParameterf(O,j.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(C.anisotropy,r.getMaxAnisotropy())),n.get(C).__currentAnisotropy=C.anisotropy}}}function Re(O,C){let j=!1;O.__webglInit===void 0&&(O.__webglInit=!0,C.addEventListener("dispose",w));let U=C.source,Y=f.get(U);Y===void 0&&(Y={},f.set(U,Y));let ae=L(C);if(ae!==O.__cacheKey){Y[ae]===void 0&&(Y[ae]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,j=!0),Y[ae].usedTimes++;let ge=Y[O.__cacheKey];ge!==void 0&&(Y[O.__cacheKey].usedTimes--,ge.usedTimes===0&&E(C)),O.__cacheKey=ae,O.__webglTexture=Y[ae].texture}return j}function se(O,C,j){return Math.floor(Math.floor(O/j)/C)}function le(O,C,j,U){let ae=O.updateRanges;if(ae.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,C.width,C.height,j,U,C.data);else{ae.sort((Pe,we)=>Pe.start-we.start);let ge=0;for(let Pe=1;Pe<ae.length;Pe++){let we=ae[ge],Me=ae[Pe],Be=we.start+we.count,Ye=se(Me.start,C.width,4),lt=se(we.start,C.width,4);Me.start<=Be+1&&Ye===lt&&se(Me.start+Me.count-1,C.width,4)===Ye?we.count=Math.max(we.count,Me.start+Me.count-we.start):(++ge,ae[ge]=Me)}ae.length=ge+1;let ie=t.getParameter(i.UNPACK_ROW_LENGTH),de=t.getParameter(i.UNPACK_SKIP_PIXELS),ye=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,C.width);for(let Pe=0,we=ae.length;Pe<we;Pe++){let Me=ae[Pe],Be=Math.floor(Me.start/4),Ye=Math.ceil(Me.count/4),lt=Be%C.width,ee=Math.floor(Be/C.width),De=Ye,be=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,lt),t.pixelStorei(i.UNPACK_SKIP_ROWS,ee),t.texSubImage2D(i.TEXTURE_2D,0,lt,ee,De,be,j,U,C.data)}O.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,ie),t.pixelStorei(i.UNPACK_SKIP_PIXELS,de),t.pixelStorei(i.UNPACK_SKIP_ROWS,ye)}}function X(O,C,j){let U=i.TEXTURE_2D;(C.isDataArrayTexture||C.isCompressedArrayTexture)&&(U=i.TEXTURE_2D_ARRAY),C.isData3DTexture&&(U=i.TEXTURE_3D);let Y=Re(O,C),ae=C.source;t.bindTexture(U,O.__webglTexture,i.TEXTURE0+j);let ge=n.get(ae);if(ae.version!==ge.__version||Y===!0){if(t.activeTexture(i.TEXTURE0+j),(typeof ImageBitmap<"u"&&C.image instanceof ImageBitmap)===!1){let be=pt.getPrimaries(pt.workingColorSpace),Le=C.colorSpace===Ni?null:pt.getPrimaries(C.colorSpace),ke=C.colorSpace===Ni||be===Le?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,C.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ke)}t.pixelStorei(i.UNPACK_ALIGNMENT,C.unpackAlignment);let de=m(C.image,!1,r.maxTextureSize);de=nt(C,de);let ye=s.convert(C.format,C.colorSpace),Pe=s.convert(C.type),we=v(C.internalFormat,ye,Pe,C.normalized,C.colorSpace,C.isVideoTexture);Ee(U,C);let Me,Be=C.mipmaps,Ye=C.isVideoTexture!==!0,lt=ge.__version===void 0||Y===!0,ee=ae.dataReady,De=b(C,de);if(C.isDepthTexture)we=T(C.format===lr,C.type),lt&&(Ye?t.texStorage2D(i.TEXTURE_2D,1,we,de.width,de.height):t.texImage2D(i.TEXTURE_2D,0,we,de.width,de.height,0,ye,Pe,null));else if(C.isDataTexture)if(Be.length>0){Ye&&lt&&t.texStorage2D(i.TEXTURE_2D,De,we,Be[0].width,Be[0].height);for(let be=0,Le=Be.length;be<Le;be++)Me=Be[be],Ye?ee&&t.texSubImage2D(i.TEXTURE_2D,be,0,0,Me.width,Me.height,ye,Pe,Me.data):t.texImage2D(i.TEXTURE_2D,be,we,Me.width,Me.height,0,ye,Pe,Me.data);C.generateMipmaps=!1}else Ye?(lt&&t.texStorage2D(i.TEXTURE_2D,De,we,de.width,de.height),ee&&le(C,de,ye,Pe)):t.texImage2D(i.TEXTURE_2D,0,we,de.width,de.height,0,ye,Pe,de.data);else if(C.isCompressedTexture)if(C.isCompressedArrayTexture){Ye&&lt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,De,we,Be[0].width,Be[0].height,de.depth);for(let be=0,Le=Be.length;be<Le;be++)if(Me=Be[be],C.format!==bn)if(ye!==null)if(Ye){if(ee)if(C.layerUpdates.size>0){let ke=fh(Me.width,Me.height,C.format,C.type);for(let _e of C.layerUpdates){let et=Me.data.subarray(_e*ke/Me.data.BYTES_PER_ELEMENT,(_e+1)*ke/Me.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,be,0,0,_e,Me.width,Me.height,1,ye,et)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,be,0,0,0,Me.width,Me.height,de.depth,ye,Me.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,be,we,Me.width,Me.height,de.depth,0,Me.data,0,0);else Qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ye?ee&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,be,0,0,0,Me.width,Me.height,de.depth,ye,Pe,Me.data):t.texImage3D(i.TEXTURE_2D_ARRAY,be,we,Me.width,Me.height,de.depth,0,ye,Pe,Me.data);C.layerUpdates.size>0&&C.clearLayerUpdates()}else{Ye&&lt&&t.texStorage2D(i.TEXTURE_2D,De,we,Be[0].width,Be[0].height);for(let be=0,Le=Be.length;be<Le;be++)Me=Be[be],C.format!==bn?ye!==null?Ye?ee&&t.compressedTexSubImage2D(i.TEXTURE_2D,be,0,0,Me.width,Me.height,ye,Me.data):t.compressedTexImage2D(i.TEXTURE_2D,be,we,Me.width,Me.height,0,Me.data):Qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ye?ee&&t.texSubImage2D(i.TEXTURE_2D,be,0,0,Me.width,Me.height,ye,Pe,Me.data):t.texImage2D(i.TEXTURE_2D,be,we,Me.width,Me.height,0,ye,Pe,Me.data)}else if(C.isDataArrayTexture)if(Ye){if(lt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,De,we,de.width,de.height,de.depth),ee)if(C.layerUpdates.size>0){let be=fh(de.width,de.height,C.format,C.type);for(let Le of C.layerUpdates){let ke=de.data.subarray(Le*be/de.data.BYTES_PER_ELEMENT,(Le+1)*be/de.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Le,de.width,de.height,1,ye,Pe,ke)}C.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,de.width,de.height,de.depth,ye,Pe,de.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,we,de.width,de.height,de.depth,0,ye,Pe,de.data);else if(C.isData3DTexture)Ye?(lt&&t.texStorage3D(i.TEXTURE_3D,De,we,de.width,de.height,de.depth),ee&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,de.width,de.height,de.depth,ye,Pe,de.data)):t.texImage3D(i.TEXTURE_3D,0,we,de.width,de.height,de.depth,0,ye,Pe,de.data);else if(C.isFramebufferTexture){if(lt)if(Ye)t.texStorage2D(i.TEXTURE_2D,De,we,de.width,de.height);else{let be=de.width,Le=de.height;for(let ke=0;ke<De;ke++)t.texImage2D(i.TEXTURE_2D,ke,we,be,Le,0,ye,Pe,null),be>>=1,Le>>=1}}else if(C.isHTMLTexture){if("texElementImage2D"in i){let be=i.canvas;if(be.hasAttribute("layoutsubtree")||be.setAttribute("layoutsubtree","true"),de.parentNode!==be){be.appendChild(de),h.add(C),be.onpaint=Le=>{let ke=Le.changedElements;for(let _e of h)ke.includes(_e.image)&&(_e.needsUpdate=!0)},be.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,de);else{let ke=i.RGBA,_e=i.RGBA,et=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ke,_e,et,de)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Be.length>0){if(Ye&&lt){let be=Je(Be[0]);t.texStorage2D(i.TEXTURE_2D,De,we,be.width,be.height)}for(let be=0,Le=Be.length;be<Le;be++)Me=Be[be],Ye?ee&&t.texSubImage2D(i.TEXTURE_2D,be,0,0,ye,Pe,Me):t.texImage2D(i.TEXTURE_2D,be,we,ye,Pe,Me);C.generateMipmaps=!1}else if(Ye){if(lt){let be=Je(de);t.texStorage2D(i.TEXTURE_2D,De,we,be.width,be.height)}ee&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ye,Pe,de)}else t.texImage2D(i.TEXTURE_2D,0,we,ye,Pe,de);g(C)&&_(U),ge.__version=ae.version,C.onUpdate&&C.onUpdate(C)}O.__version=C.version}function q(O,C,j){if(C.image.length!==6)return;let U=Re(O,C),Y=C.source;t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+j);let ae=n.get(Y);if(Y.version!==ae.__version||U===!0){t.activeTexture(i.TEXTURE0+j);let ge=pt.getPrimaries(pt.workingColorSpace),ie=C.colorSpace===Ni?null:pt.getPrimaries(C.colorSpace),de=C.colorSpace===Ni||ge===ie?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,C.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,C.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,C.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,de);let ye=C.isCompressedTexture||C.image[0].isCompressedTexture,Pe=C.image[0]&&C.image[0].isDataTexture,we=[];for(let _e=0;_e<6;_e++)!ye&&!Pe?we[_e]=m(C.image[_e],!0,r.maxCubemapSize):we[_e]=Pe?C.image[_e].image:C.image[_e],we[_e]=nt(C,we[_e]);let Me=we[0],Be=s.convert(C.format,C.colorSpace),Ye=s.convert(C.type),lt=v(C.internalFormat,Be,Ye,C.normalized,C.colorSpace),ee=C.isVideoTexture!==!0,De=ae.__version===void 0||U===!0,be=Y.dataReady,Le=b(C,Me);Ee(i.TEXTURE_CUBE_MAP,C);let ke;if(ye){ee&&De&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Le,lt,Me.width,Me.height);for(let _e=0;_e<6;_e++){ke=we[_e].mipmaps;for(let et=0;et<ke.length;et++){let Ze=ke[et];C.format!==bn?Be!==null?ee?be&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et,0,0,Ze.width,Ze.height,Be,Ze.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et,lt,Ze.width,Ze.height,0,Ze.data):Qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ee?be&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et,0,0,Ze.width,Ze.height,Be,Ye,Ze.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et,lt,Ze.width,Ze.height,0,Be,Ye,Ze.data)}}}else{if(ke=C.mipmaps,ee&&De){ke.length>0&&Le++;let _e=Je(we[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Le,lt,_e.width,_e.height)}for(let _e=0;_e<6;_e++)if(Pe){ee?be&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,we[_e].width,we[_e].height,Be,Ye,we[_e].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,lt,we[_e].width,we[_e].height,0,Be,Ye,we[_e].data);for(let et=0;et<ke.length;et++){let Dt=ke[et].image[_e].image;ee?be&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et+1,0,0,Dt.width,Dt.height,Be,Ye,Dt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et+1,lt,Dt.width,Dt.height,0,Be,Ye,Dt.data)}}else{ee?be&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,Be,Ye,we[_e]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,lt,Be,Ye,we[_e]);for(let et=0;et<ke.length;et++){let Ze=ke[et];ee?be&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et+1,0,0,Be,Ye,Ze.image[_e]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,et+1,lt,Be,Ye,Ze.image[_e])}}}g(C)&&_(i.TEXTURE_CUBE_MAP),ae.__version=Y.version,C.onUpdate&&C.onUpdate(C)}O.__version=C.version}function $(O,C,j,U,Y,ae){let ge=s.convert(j.format,j.colorSpace),ie=s.convert(j.type),de=v(j.internalFormat,ge,ie,j.normalized,j.colorSpace),ye=n.get(C),Pe=n.get(j);if(Pe.__renderTarget=C,!ye.__hasExternalTextures){let we=Math.max(1,C.width>>ae),Me=Math.max(1,C.height>>ae);Y===i.TEXTURE_3D||Y===i.TEXTURE_2D_ARRAY?t.texImage3D(Y,ae,de,we,Me,C.depth,0,ge,ie,null):t.texImage2D(Y,ae,de,we,Me,0,ge,ie,null)}t.bindFramebuffer(i.FRAMEBUFFER,O),Ae(C)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,U,Y,Pe.__webglTexture,0,ve(C)):(Y===i.TEXTURE_2D||Y>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,U,Y,Pe.__webglTexture,ae),t.bindFramebuffer(i.FRAMEBUFFER,null)}function pe(O,C,j){if(i.bindRenderbuffer(i.RENDERBUFFER,O),C.depthBuffer){let U=C.depthTexture,Y=U&&U.isDepthTexture?U.type:null,ae=T(C.stencilBuffer,Y),ge=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Ae(C)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ve(C),ae,C.width,C.height):j?i.renderbufferStorageMultisample(i.RENDERBUFFER,ve(C),ae,C.width,C.height):i.renderbufferStorage(i.RENDERBUFFER,ae,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ge,i.RENDERBUFFER,O)}else{let U=C.textures;for(let Y=0;Y<U.length;Y++){let ae=U[Y],ge=s.convert(ae.format,ae.colorSpace),ie=s.convert(ae.type),de=v(ae.internalFormat,ge,ie,ae.normalized,ae.colorSpace);Ae(C)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ve(C),de,C.width,C.height):j?i.renderbufferStorageMultisample(i.RENDERBUFFER,ve(C),de,C.width,C.height):i.renderbufferStorage(i.RENDERBUFFER,de,C.width,C.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function K(O,C,j){let U=C.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,O),!(C.depthTexture&&C.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Y=n.get(C.depthTexture);if(Y.__renderTarget=C,(!Y.__webglTexture||C.depthTexture.image.width!==C.width||C.depthTexture.image.height!==C.height)&&(C.depthTexture.image.width=C.width,C.depthTexture.image.height=C.height,C.depthTexture.needsUpdate=!0),U){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,C.depthTexture.addEventListener("dispose",w)),Y.__webglTexture===void 0){Y.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),Ee(i.TEXTURE_CUBE_MAP,C.depthTexture);let ye=s.convert(C.depthTexture.format),Pe=s.convert(C.depthTexture.type),we;C.depthTexture.format===oi?we=i.DEPTH_COMPONENT24:C.depthTexture.format===lr&&(we=i.DEPTH24_STENCIL8);for(let Me=0;Me<6;Me++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Me,0,we,C.width,C.height,0,ye,Pe,null)}}else V(C.depthTexture,0);let ae=Y.__webglTexture,ge=ve(C),ie=U?i.TEXTURE_CUBE_MAP_POSITIVE_X+j:i.TEXTURE_2D,de=C.depthTexture.format===lr?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(C.depthTexture.format===oi)Ae(C)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,de,ie,ae,0,ge):i.framebufferTexture2D(i.FRAMEBUFFER,de,ie,ae,0);else if(C.depthTexture.format===lr)Ae(C)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,de,ie,ae,0,ge):i.framebufferTexture2D(i.FRAMEBUFFER,de,ie,ae,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function H(O){let C=n.get(O),j=O.isWebGLCubeRenderTarget===!0;if(C.__boundDepthTexture!==O.depthTexture){let U=O.depthTexture;if(C.__depthDisposeCallback&&C.__depthDisposeCallback(),U){let Y=()=>{delete C.__boundDepthTexture,delete C.__depthDisposeCallback,U.removeEventListener("dispose",Y)};U.addEventListener("dispose",Y),C.__depthDisposeCallback=Y}C.__boundDepthTexture=U}if(O.depthTexture&&!C.__autoAllocateDepthBuffer)if(j)for(let U=0;U<6;U++)K(C.__webglFramebuffer[U],O,U);else{let U=O.texture.mipmaps;U&&U.length>0?K(C.__webglFramebuffer[0],O,0):K(C.__webglFramebuffer,O,0)}else if(j){C.__webglDepthbuffer=[];for(let U=0;U<6;U++)if(t.bindFramebuffer(i.FRAMEBUFFER,C.__webglFramebuffer[U]),C.__webglDepthbuffer[U]===void 0)C.__webglDepthbuffer[U]=i.createRenderbuffer(),pe(C.__webglDepthbuffer[U],O,!1);else{let Y=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=C.__webglDepthbuffer[U];i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,ae)}}else{let U=O.texture.mipmaps;if(U&&U.length>0?t.bindFramebuffer(i.FRAMEBUFFER,C.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,C.__webglFramebuffer),C.__webglDepthbuffer===void 0)C.__webglDepthbuffer=i.createRenderbuffer(),pe(C.__webglDepthbuffer,O,!1);else{let Y=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=C.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ae),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,ae)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function B(O,C,j){let U=n.get(O);C!==void 0&&$(U.__webglFramebuffer,O,O.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),j!==void 0&&H(O)}function Z(O){let C=O.texture,j=n.get(O),U=n.get(C);O.addEventListener("dispose",x);let Y=O.textures,ae=O.isWebGLCubeRenderTarget===!0,ge=Y.length>1;if(ge||(U.__webglTexture===void 0&&(U.__webglTexture=i.createTexture()),U.__version=C.version,o.memory.textures++),ae){j.__webglFramebuffer=[];for(let ie=0;ie<6;ie++)if(C.mipmaps&&C.mipmaps.length>0){j.__webglFramebuffer[ie]=[];for(let de=0;de<C.mipmaps.length;de++)j.__webglFramebuffer[ie][de]=i.createFramebuffer()}else j.__webglFramebuffer[ie]=i.createFramebuffer()}else{if(C.mipmaps&&C.mipmaps.length>0){j.__webglFramebuffer=[];for(let ie=0;ie<C.mipmaps.length;ie++)j.__webglFramebuffer[ie]=i.createFramebuffer()}else j.__webglFramebuffer=i.createFramebuffer();if(ge)for(let ie=0,de=Y.length;ie<de;ie++){let ye=n.get(Y[ie]);ye.__webglTexture===void 0&&(ye.__webglTexture=i.createTexture(),o.memory.textures++)}if(O.samples>0&&Ae(O)===!1){j.__webglMultisampledFramebuffer=i.createFramebuffer(),j.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,j.__webglMultisampledFramebuffer);for(let ie=0;ie<Y.length;ie++){let de=Y[ie];j.__webglColorRenderbuffer[ie]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,j.__webglColorRenderbuffer[ie]);let ye=s.convert(de.format,de.colorSpace),Pe=s.convert(de.type),we=v(de.internalFormat,ye,Pe,de.normalized,de.colorSpace,O.isXRRenderTarget===!0),Me=ve(O);i.renderbufferStorageMultisample(i.RENDERBUFFER,Me,we,O.width,O.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ie,i.RENDERBUFFER,j.__webglColorRenderbuffer[ie])}i.bindRenderbuffer(i.RENDERBUFFER,null),O.depthBuffer&&(j.__webglDepthRenderbuffer=i.createRenderbuffer(),pe(j.__webglDepthRenderbuffer,O,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ae){t.bindTexture(i.TEXTURE_CUBE_MAP,U.__webglTexture),Ee(i.TEXTURE_CUBE_MAP,C);for(let ie=0;ie<6;ie++)if(C.mipmaps&&C.mipmaps.length>0)for(let de=0;de<C.mipmaps.length;de++)$(j.__webglFramebuffer[ie][de],O,C,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,de);else $(j.__webglFramebuffer[ie],O,C,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0);g(C)&&_(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ge){for(let ie=0,de=Y.length;ie<de;ie++){let ye=Y[ie],Pe=n.get(ye),we=i.TEXTURE_2D;(O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(we=O.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(we,Pe.__webglTexture),Ee(we,ye),$(j.__webglFramebuffer,O,ye,i.COLOR_ATTACHMENT0+ie,we,0),g(ye)&&_(we)}t.unbindTexture()}else{let ie=i.TEXTURE_2D;if((O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(ie=O.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ie,U.__webglTexture),Ee(ie,C),C.mipmaps&&C.mipmaps.length>0)for(let de=0;de<C.mipmaps.length;de++)$(j.__webglFramebuffer[de],O,C,i.COLOR_ATTACHMENT0,ie,de);else $(j.__webglFramebuffer,O,C,i.COLOR_ATTACHMENT0,ie,0);g(C)&&_(ie),t.unbindTexture()}O.depthBuffer&&H(O)}function ne(O){let C=O.textures;for(let j=0,U=C.length;j<U;j++){let Y=C[j];if(g(Y)){let ae=M(O),ge=n.get(Y).__webglTexture;t.bindTexture(ae,ge),_(ae),t.unbindTexture()}}}let te=[],ce=[];function xe(O){if(O.samples>0){if(Ae(O)===!1){let C=O.textures,j=O.width,U=O.height,Y=i.COLOR_BUFFER_BIT,ae=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ge=n.get(O),ie=C.length>1;if(ie)for(let ye=0;ye<C.length;ye++)t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer);let de=O.texture.mipmaps;de&&de.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let ye=0;ye<C.length;ye++){if(O.resolveDepthBuffer&&(O.depthBuffer&&(Y|=i.DEPTH_BUFFER_BIT),O.stencilBuffer&&O.resolveStencilBuffer&&(Y|=i.STENCIL_BUFFER_BIT)),ie){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ge.__webglColorRenderbuffer[ye]);let Pe=n.get(C[ye]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Pe,0)}i.blitFramebuffer(0,0,j,U,0,0,j,U,Y,i.NEAREST),l===!0&&(te.length=0,ce.length=0,te.push(i.COLOR_ATTACHMENT0+ye),O.depthBuffer&&O.storeMultisampledDepthBuffer===!1&&(te.push(ae),ce.push(ae),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ce)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,te))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ie)for(let ye=0;ye<C.length;ye++){t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,ge.__webglColorRenderbuffer[ye]);let Pe=n.get(C[ye]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ge.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,Pe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(O.depthBuffer&&O.storeMultisampledDepthBuffer===!1&&l){let C=O.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[C])}}}function ve(O){return Math.min(r.maxSamples,O.samples)}function Ae(O){let C=n.get(O);return O.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&C.__useRenderToTexture!==!1}function G(O){let C=o.render.frame;u.get(O)!==C&&(u.set(O,C),O.update())}function nt(O,C){let j=O.colorSpace,U=O.format,Y=O.type;return O.isCompressedTexture===!0||O.isVideoTexture===!0||j!==un&&j!==Ni&&(pt.getTransfer(j)===wt?(U!==bn||Y!==An)&&Qe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):rt("WebGLTextures: Unsupported texture color space:",j)),C}function Je(O){return typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement?(c.width=O.naturalWidth||O.width,c.height=O.naturalHeight||O.height):typeof VideoFrame<"u"&&O instanceof VideoFrame?(c.width=O.displayWidth,c.height=O.displayHeight):(c.width=O.width,c.height=O.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=P,this.getTextureUnits=D,this.setTextureUnits=F,this.setTexture2D=V,this.setTexture2DArray=k,this.setTexture3D=W,this.setTextureCube=J,this.rebindTextures=B,this.setupRenderTarget=Z,this.updateRenderTargetMipmap=ne,this.updateMultisampleRenderTarget=xe,this.setupDepthRenderbuffer=H,this.setupFrameBufferTexture=$,this.useMultisampledRTT=Ae,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function g_(i,e){function t(n,r=Ni){let s,o=pt.getTransfer(r);if(n===An)return i.UNSIGNED_BYTE;if(n===Sl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===wl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===th)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===nh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Qu)return i.BYTE;if(n===eh)return i.SHORT;if(n===Ps)return i.UNSIGNED_SHORT;if(n===Tl)return i.INT;if(n===ei)return i.UNSIGNED_INT;if(n===Ln)return i.FLOAT;if(n===Nn)return i.HALF_FLOAT;if(n===ih)return i.ALPHA;if(n===rh)return i.RGB;if(n===bn)return i.RGBA;if(n===oi)return i.DEPTH_COMPONENT;if(n===lr)return i.DEPTH_STENCIL;if(n===Al)return i.RED;if(n===El)return i.RED_INTEGER;if(n===cr)return i.RG;if(n===Cl)return i.RG_INTEGER;if(n===Rl)return i.RGBA_INTEGER;if(n===ko||n===zo||n===Vo||n===Go)if(o===wt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===ko)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===zo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Vo)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Go)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===ko)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===zo)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Vo)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Go)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Pl||n===Il||n===Dl||n===Ll)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Pl)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Il)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Dl)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ll)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Nl||n===Fl||n===Ul||n===Ol||n===Bl||n===Ho||n===kl)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Nl||n===Fl)return o===wt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Ul)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(n===Ol)return s.COMPRESSED_R11_EAC;if(n===Bl)return s.COMPRESSED_SIGNED_R11_EAC;if(n===Ho)return s.COMPRESSED_RG11_EAC;if(n===kl)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===zl||n===Vl||n===Gl||n===Hl||n===Wl||n===Xl||n===ql||n===Kl||n===Yl||n===Zl||n===jl||n===Jl||n===$l||n===Ql)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===zl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Vl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Gl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Hl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Wl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Xl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ql)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Kl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Yl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Zl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===jl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Jl)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===$l)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ql)return o===wt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ec||n===tc||n===nc)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===ec)return o===wt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===tc)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===nc)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ic||n===rc||n===Wo||n===sc)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===ic)return s.COMPRESSED_RED_RGTC1_EXT;if(n===rc)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Wo)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===sc)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Is?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var x_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,y_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Eh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new go(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Vt({vertexShader:x_,fragmentShader:y_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Se(new kn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ch=class extends Zn{constructor(e,t){super();let n=this,r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,p=null,y=typeof XRWebGLBinding<"u",m=new Eh,g={},_=t.getContextAttributes(),M=null,v=null,T=[],b=[],w=new me,x=null,S=null,E=new en;E.viewport=new mt;let R=new en;R.viewport=new mt;let A=[E,R],P=new yl,D=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(se){let le=T[se];return le===void 0&&(le=new gs,T[se]=le),le.getTargetRaySpace()},this.getControllerGrip=function(se){let le=T[se];return le===void 0&&(le=new gs,T[se]=le),le.getGripSpace()},this.getHand=function(se){let le=T[se];return le===void 0&&(le=new gs,T[se]=le),le.getHandSpace()};function z(se){let le=b.indexOf(se.inputSource);if(le===-1)return;let X=T[le];X!==void 0&&(X.update(se.inputSource,se.frame,c||o),X.dispatchEvent({type:se.type,data:se.inputSource}))}function L(){r.removeEventListener("select",z),r.removeEventListener("selectstart",z),r.removeEventListener("selectend",z),r.removeEventListener("squeeze",z),r.removeEventListener("squeezestart",z),r.removeEventListener("squeezeend",z),r.removeEventListener("end",L),r.removeEventListener("inputsourceschange",V);for(let se=0;se<T.length;se++){let le=b[se];le!==null&&(b[se]=null,T[se].disconnect(le))}D=null,F=null,m.reset();for(let se in g)delete g[se];if(e.setRenderTarget(M),f=null,d=null,h=null,r=null,v=null,Re.stop(),n.isPresenting=!1,e.setPixelRatio(x),e.setSize(w.width,w.height,!1),S!==null){let se=S.camera;se.fov=S.fov,se.zoom=S.zoom,se.updateProjectionMatrix(),S=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(se){s=se,n.isPresenting===!0&&Qe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(se){a=se,n.isPresenting===!0&&Qe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(se){c=se},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&y&&(h=new XRWebGLBinding(r,t)),h},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(se){if(r=se,r!==null){if(M=e.getRenderTarget(),r.addEventListener("select",z),r.addEventListener("selectstart",z),r.addEventListener("selectend",z),r.addEventListener("squeeze",z),r.addEventListener("squeezestart",z),r.addEventListener("squeezeend",z),r.addEventListener("end",L),r.addEventListener("inputsourceschange",V),_.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(w),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let X=null,q=null,$=null;_.depth&&($=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,X=_.stencil?lr:oi,q=_.stencil?Is:ei);let pe={colorFormat:t.RGBA8,depthFormat:$,scaleFactor:s};h=this.getBinding(),d=h.createProjectionLayer(pe),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),v=new Mn(d.textureWidth,d.textureHeight,{format:bn,type:An,depthTexture:new Qi(d.textureWidth,d.textureHeight,q,void 0,void 0,void 0,void 0,void 0,void 0,X),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let X={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,X),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new Mn(f.framebufferWidth,f.framebufferHeight,{format:bn,type:An,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),Re.setContext(r),Re.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function V(se){for(let le=0;le<se.removed.length;le++){let X=se.removed[le],q=b.indexOf(X);q>=0&&(b[q]=null,T[q].disconnect(X))}for(let le=0;le<se.added.length;le++){let X=se.added[le],q=b.indexOf(X);if(q===-1){for(let pe=0;pe<T.length;pe++)if(pe>=b.length){b.push(X),q=pe;break}else if(b[pe]===null){b[pe]=X,q=pe;break}if(q===-1)break}let $=T[q];$&&$.connect(X)}}let k=new I,W=new I;function J(se,le,X){k.setFromMatrixPosition(le.matrixWorld),W.setFromMatrixPosition(X.matrixWorld);let q=k.distanceTo(W),$=le.projectionMatrix.elements,pe=X.projectionMatrix.elements,K=$[14]/($[10]-1),H=$[14]/($[10]+1),B=($[9]+1)/$[5],Z=($[9]-1)/$[5],ne=($[8]-1)/$[0],te=(pe[8]+1)/pe[0],ce=K*ne,xe=K*te,ve=q/(-ne+te),Ae=ve*-ne;if(le.matrixWorld.decompose(se.position,se.quaternion,se.scale),se.translateX(Ae),se.translateZ(ve),se.matrixWorld.compose(se.position,se.quaternion,se.scale),se.matrixWorldInverse.copy(se.matrixWorld).invert(),$[10]===-1)se.projectionMatrix.copy(le.projectionMatrix),se.projectionMatrixInverse.copy(le.projectionMatrixInverse);else{let G=K+ve,nt=H+ve,Je=ce-Ae,O=xe+(q-Ae),C=B*H/nt*G,j=Z*H/nt*G;se.projectionMatrix.makePerspective(Je,O,C,j,G,nt),se.projectionMatrixInverse.copy(se.projectionMatrix).invert()}}function oe(se,le){le===null?se.matrixWorld.copy(se.matrix):se.matrixWorld.multiplyMatrices(le.matrixWorld,se.matrix),se.matrixWorldInverse.copy(se.matrixWorld).invert()}this.updateCamera=function(se){if(r===null)return;let le=se.near,X=se.far;m.texture!==null&&(m.depthNear>0&&(le=m.depthNear),m.depthFar>0&&(X=m.depthFar)),P.near=R.near=E.near=le,P.far=R.far=E.far=X,(D!==P.near||F!==P.far)&&(r.updateRenderState({depthNear:P.near,depthFar:P.far}),D=P.near,F=P.far),P.layers.mask=se.layers.mask|6,E.layers.mask=P.layers.mask&-5,R.layers.mask=P.layers.mask&-3;let q=se.parent,$=P.cameras;oe(P,q);for(let pe=0;pe<$.length;pe++)oe($[pe],q);$.length===2?J(P,E,R):P.projectionMatrix.copy(E.projectionMatrix),S===null&&se.isPerspectiveCamera&&(S={camera:se,fov:se.fov,zoom:se.zoom}),re(se,P,q)};function re(se,le,X){X===null?se.matrix.copy(le.matrixWorld):(se.matrix.copy(X.matrixWorld),se.matrix.invert(),se.matrix.multiply(le.matrixWorld)),se.matrix.decompose(se.position,se.quaternion,se.scale),se.updateMatrixWorld(!0),se.projectionMatrix.copy(le.projectionMatrix),se.projectionMatrixInverse.copy(le.projectionMatrixInverse),se.isPerspectiveCamera&&(se.fov=Sr*2*Math.atan(1/se.projectionMatrix.elements[5]),se.zoom=1)}this.getCamera=function(){return P},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(se){l=se,d!==null&&(d.fixedFoveation=se),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=se)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(P)},this.getCameraTexture=function(se){return g[se]};let Te=null;function Ee(se,le){if(u=le.getViewerPose(c||o),p=le,u!==null){let X=u.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let q=!1;X.length!==P.cameras.length&&(P.cameras.length=0,q=!0);for(let H=0;H<X.length;H++){let B=X[H],Z=null;if(f!==null)Z=f.getViewport(B);else{let te=h.getViewSubImage(d,B);Z=te.viewport,H===0&&(e.setRenderTargetTextures(v,te.colorTexture,te.depthStencilTexture),e.setRenderTarget(v))}let ne=A[H];ne===void 0&&(ne=new en,ne.layers.enable(H),ne.viewport=new mt,A[H]=ne),ne.matrix.fromArray(B.transform.matrix),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.projectionMatrix.fromArray(B.projectionMatrix),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert(),ne.viewport.set(Z.x,Z.y,Z.width,Z.height),H===0&&(P.matrix.copy(ne.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale)),q===!0&&P.cameras.push(ne)}let $=r.enabledFeatures;if($&&$.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&y){h=n.getBinding();let H=h.getDepthInformation(X[0]);H&&H.isValid&&H.texture&&m.init(H,r.renderState)}if($&&$.includes("camera-access")&&y){e.state.unbindTexture(),h=n.getBinding();for(let H=0;H<X.length;H++){let B=X[H].camera;if(B){let Z=g[B];Z||(Z=new go,g[B]=Z);let ne=h.getCameraImage(B);Z.sourceTexture=ne}}}}for(let X=0;X<T.length;X++){let q=b[X],$=T[X];q!==null&&$!==void 0&&$.update(q,le,c||o)}Te&&Te(se,le),le.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:le}),p=null}let Re=new Kp;Re.setAnimationLoop(Ee),this.setAnimationLoop=function(se){Te=se},this.dispose=function(){}}},b_=new Ne,Qp=new ct;Qp.set(-1,0,0,0,1,0,0,0,1);function v_(i,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,uh(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function r(m,g,_,M,v){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?s(m,g):g.isMeshLambertMaterial?(s(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(s(m,g),h(m,g)):g.isMeshPhongMaterial?(s(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(s(m,g),d(m,g),g.isMeshPhysicalMaterial&&f(m,g,v)):g.isMeshMatcapMaterial?(s(m,g),p(m,g)):g.isMeshDepthMaterial?s(m,g):g.isMeshDistanceMaterial?(s(m,g),y(m,g)):g.isMeshNormalMaterial?s(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?l(m,g,_,M):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function s(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===yn&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===yn&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let _=e.get(g),M=_.envMap,v=_.envMapRotation;M&&(m.envMap.value=M,m.envMapRotation.value.setFromMatrix4(b_.makeRotationFromEuler(v)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Qp),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,_,M){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*_,m.scale.value=M*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function h(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function d(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function f(m,g,_){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===yn&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=_.texture,m.transmissionSamplerSize.value.set(_.width,_.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function y(m,g){let _=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(_.matrixWorld),m.nearDistance.value=_.shadow.camera.near,m.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function __(i,e,t,n){let r={},s={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,T){let b=T.program;n.uniformBlockBinding(v,b)}function c(v,T){let b=r[v.id];b===void 0&&(m(v),b=u(v),r[v.id]=b,v.addEventListener("dispose",_));let w=T.program;n.updateUBOMapping(v,w);let x=e.render.frame;s[v.id]!==x&&(d(v),s[v.id]=x)}function u(v){let T=h();v.__bindingPointIndex=T;let b=i.createBuffer(),w=v.__size,x=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,b),i.bufferData(i.UNIFORM_BUFFER,w,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,b),b}function h(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return rt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){let T=r[v.id],b=v.uniforms,w=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let x=0,S=b.length;x<S;x++){let E=b[x];if(Array.isArray(E))for(let R=0,A=E.length;R<A;R++)f(E[R],x,R,w);else f(E,x,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(v,T,b,w){if(y(v,T,b,w)===!0){let x=v.__offset,S=v.value;if(Array.isArray(S)){let E=0;for(let R=0;R<S.length;R++){let A=S[R],P=g(A);p(A,v.__data,E),typeof A!="number"&&typeof A!="boolean"&&!A.isMatrix3&&!ArrayBuffer.isView(A)&&(E+=P.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(S,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,v.__data)}}function p(v,T,b){typeof v=="number"||typeof v=="boolean"?T[0]=v:v.isMatrix3?(T[0]=v.elements[0],T[1]=v.elements[1],T[2]=v.elements[2],T[3]=0,T[4]=v.elements[3],T[5]=v.elements[4],T[6]=v.elements[5],T[7]=0,T[8]=v.elements[6],T[9]=v.elements[7],T[10]=v.elements[8],T[11]=0):ArrayBuffer.isView(v)?T.set(new v.constructor(v.buffer,v.byteOffset,T.length)):v.toArray(T,b)}function y(v,T,b,w){let x=v.value,S=T+"_"+b;if(w[S]===void 0)return typeof x=="number"||typeof x=="boolean"?w[S]=x:ArrayBuffer.isView(x)?w[S]=x.slice():w[S]=x.clone(),!0;{let E=w[S];if(typeof x=="number"||typeof x=="boolean"){if(E!==x)return w[S]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(E.equals(x)===!1)return E.copy(x),!0}}return!1}function m(v){let T=v.uniforms,b=0,w=16;for(let S=0,E=T.length;S<E;S++){let R=Array.isArray(T[S])?T[S]:[T[S]];for(let A=0,P=R.length;A<P;A++){let D=R[A],F=Array.isArray(D.value)?D.value:[D.value];for(let z=0,L=F.length;z<L;z++){let V=F[z],k=g(V),W=b%w,J=W%k.boundary,oe=W+J;b+=J,oe!==0&&w-oe<k.storage&&(b+=w-oe),D.__data=new Float32Array(k.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=b,b+=k.storage}}}let x=b%w;return x>0&&(b+=w-x),v.__size=b,v.__cache={},this}function g(v){let T={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(T.boundary=4,T.storage=4):v.isVector2?(T.boundary=8,T.storage=8):v.isVector3||v.isColor?(T.boundary=16,T.storage=12):v.isVector4?(T.boundary=16,T.storage=16):v.isMatrix3?(T.boundary=48,T.storage=48):v.isMatrix4?(T.boundary=64,T.storage=64):v.isTexture?Qe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(T.boundary=16,T.storage=v.byteLength):Qe("WebGLRenderer: Unsupported uniform value type.",v),T}function _(v){let T=v.target;T.removeEventListener("dispose",_);let b=o.indexOf(T.__bindingPointIndex);o.splice(b,1),i.deleteBuffer(r[T.id]),delete r[T.id],delete s[T.id]}function M(){for(let v in r)i.deleteBuffer(r[v]);o=[],r={},s={}}return{bind:l,update:c,dispose:M}}var M_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),di=null;function T_(){return di===null&&(di=new ai(M_,16,16,cr,Nn),di.name="DFG_LUT",di.minFilter=Ft,di.magFilter=Ft,di.wrapS=On,di.wrapT=On,di.generateMipmaps=!1,di.needsUpdate=!0),di}var fc=class{constructor(e={}){let{canvas:t=pp(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1,outputBufferType:f=An}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let y=f,m=new Set([Rl,Cl,El]),g=new Set([An,ei,Ps,Is,Sl,wl]),_=new Uint32Array(4),M=new Int32Array(4),v=new I,T=null,b=null,w=[],x=[],S=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=$n,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let E=this,R=!1,A=null,P=null,D=null,F=null;this._outputColorSpace=qt;let z=0,L=0,V=null,k=-1,W=null,J=new mt,oe=new mt,re=null,Te=new Ie(0),Ee=0,Re=t.width,se=t.height,le=1,X=null,q=null,$=new mt(0,0,Re,se),pe=new mt(0,0,Re,se),K=!1,H=new _s,B=!1,Z=!1,ne=new Ne,te=new I,ce=new mt,xe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ve=!1;function Ae(){return V===null?le:1}let G=n;function nt(N,Q){return t.getContext(N,Q)}let Je,O,C,j,U,Y,ae,ge,ie,de,ye,Pe,we,Me,Be,Ye,lt,ee,De,be,Le,ke,_e;try{let N={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Dt,!1),t.addEventListener("webglcontextrestored",Tt,!1),t.addEventListener("webglcontextcreationerror",Hn,!1),G===null){let Q="webgl2";if(G=nt(Q,N),G===null)throw nt(Q)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}et()}catch(N){throw t.removeEventListener("webglcontextlost",Dt,!1),t.removeEventListener("webglcontextrestored",Tt,!1),t.removeEventListener("webglcontextcreationerror",Hn,!1),rt("WebGLRenderer: "+N.message),N}function et(){Je=new Pb(G),Je.init(),Le=new g_(G,Je),O=new vb(G,Je,e,Le),C=new p_(G,Je),O.reversedDepthBuffer&&d&&C.buffers.depth.setReversed(!0),P=G.createFramebuffer(),D=G.createFramebuffer(),F=G.createFramebuffer(),j=new Lb(G),U=new e_,Y=new m_(G,Je,C,U,O,Le,j),ae=new Rb(E),ge=new F1(G),ke=new yb(G,ge),ie=new Ib(G,ge,j,ke),de=new Fb(G,ie,ge,ke,j),ee=new Nb(G,O,Y),Be=new _b(U),ye=new Qv(E,ae,Je,O,ke,Be),Pe=new v_(E,U),we=new n_,Me=new l_(Je),lt=new xb(E,ae,C,de,p,l),Ye=new f_(E,de,O),_e=new __(G,j,O,C),De=new bb(G,Je,j),be=new Db(G,Je,j),j.programs=ye.programs,E.capabilities=O,E.extensions=Je,E.properties=U,E.renderLists=we,E.shadowMap=Ye,E.state=C,E.info=j}y!==An&&(S=new Ob(y,t.width,t.height,a,r,s));let Ze=new Ch(E,G);this.xr=Ze,this.getContext=function(){return G},this.getContextAttributes=function(){return G.getContextAttributes()},this.forceContextLoss=function(){let N=Je.get("WEBGL_lose_context");N&&N.loseContext()},this.forceContextRestore=function(){let N=Je.get("WEBGL_lose_context");N&&N.restoreContext()},this.getPixelRatio=function(){return le},this.setPixelRatio=function(N){N!==void 0&&(le=N,this.setSize(Re,se,!1))},this.getSize=function(N){return N.set(Re,se)},this.setSize=function(N,Q,fe=!0){if(Ze.isPresenting){Qe("WebGLRenderer: Can't change size while VR device is presenting.");return}Re=N,se=Q,t.width=Math.floor(N*le),t.height=Math.floor(Q*le),fe===!0&&(t.style.width=N+"px",t.style.height=Q+"px"),S!==null&&S.setSize(t.width,t.height),this.setViewport(0,0,N,Q)},this.getDrawingBufferSize=function(N){return N.set(Re*le,se*le).floor()},this.setDrawingBufferSize=function(N,Q,fe){Re=N,se=Q,le=fe,t.width=Math.floor(N*fe),t.height=Math.floor(Q*fe),this.setViewport(0,0,N,Q)},this.setEffects=function(N){if(y===An){rt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(N){for(let Q=0;Q<N.length;Q++)if(N[Q].isOutputPass===!0){Qe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}S.setEffects(N||[])},this.getCurrentViewport=function(N){return N.copy(J)},this.getViewport=function(N){return N.copy($)},this.setViewport=function(N,Q,fe,ue){N.isVector4?$.set(N.x,N.y,N.z,N.w):$.set(N,Q,fe,ue),C.viewport(J.copy($).multiplyScalar(le).round())},this.getScissor=function(N){return N.copy(pe)},this.setScissor=function(N,Q,fe,ue){N.isVector4?pe.set(N.x,N.y,N.z,N.w):pe.set(N,Q,fe,ue),C.scissor(oe.copy(pe).multiplyScalar(le).round())},this.getScissorTest=function(){return K},this.setScissorTest=function(N){C.setScissorTest(K=N)},this.setOpaqueSort=function(N){X=N},this.setTransparentSort=function(N){q=N},this.getClearColor=function(N){return N.copy(lt.getClearColor())},this.setClearColor=function(){lt.setClearColor(...arguments)},this.getClearAlpha=function(){return lt.getClearAlpha()},this.setClearAlpha=function(){lt.setClearAlpha(...arguments)},this.clear=function(N=!0,Q=!0,fe=!0){let ue=0;if(N){let he=!1;if(V!==null){let Oe=V.texture.format;he=m.has(Oe)}if(he){let Oe=V.texture.type,He=g.has(Oe),Ue=lt.getClearColor(),Xe=lt.getClearAlpha(),$e=Ue.r,dt=Ue.g,xt=Ue.b;He?(_[0]=$e,_[1]=dt,_[2]=xt,_[3]=Xe,G.clearBufferuiv(G.COLOR,0,_)):(M[0]=$e,M[1]=dt,M[2]=xt,M[3]=Xe,G.clearBufferiv(G.COLOR,0,M))}else ue|=G.COLOR_BUFFER_BIT}Q&&(ue|=G.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),fe&&(ue|=G.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),ue!==0&&G.clear(ue)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(N){N.setRenderer(this),A=N},this.dispose=function(){t.removeEventListener("webglcontextlost",Dt,!1),t.removeEventListener("webglcontextrestored",Tt,!1),t.removeEventListener("webglcontextcreationerror",Hn,!1),lt.dispose(),we.dispose(),Me.dispose(),U.dispose(),ae.dispose(),de.dispose(),ke.dispose(),_e.dispose(),ye.dispose(),Ze.dispose(),Ze.removeEventListener("sessionstart",Ud),Ze.removeEventListener("sessionend",Od),gr.stop()};function Dt(N){N.preventDefault(),oo("WebGLRenderer: Context Lost."),R=!0}function Tt(){oo("WebGLRenderer: Context Restored."),R=!1;let N=j.autoReset,Q=Ye.enabled,fe=Ye.autoUpdate,ue=Ye.needsUpdate,he=Ye.type;et(),j.autoReset=N,Ye.enabled=Q,Ye.autoUpdate=fe,Ye.needsUpdate=ue,Ye.type=he}function Hn(N){rt("WebGLRenderer: A WebGL context could not be created. Reason: ",N.statusMessage)}function ti(N){let Q=N.target;Q.removeEventListener("dispose",ti),Jg(Q)}function Jg(N){$g(N),U.remove(N)}function $g(N){let Q=U.get(N).programs;Q!==void 0&&(Q.forEach(function(fe){ye.releaseProgram(fe)}),N.isShaderMaterial&&ye.releaseShaderCache(N))}this.renderBufferDirect=function(N,Q,fe,ue,he,Oe){Q===null&&(Q=xe);let He=he.isMesh&&he.matrixWorld.determinantAffine()<0,Ue=t0(N,Q,fe,ue,he);C.setMaterial(ue,He);let Xe=fe.index,$e=1;if(ue.wireframe===!0){if(Xe=ie.getWireframeAttribute(fe),Xe===void 0)return;$e=2}let dt=fe.drawRange,xt=fe.attributes.position,qe=dt.start*$e,St=(dt.start+dt.count)*$e;Oe!==null&&(qe=Math.max(qe,Oe.start*$e),St=Math.min(St,(Oe.start+Oe.count)*$e)),Xe!==null?(qe=Math.max(qe,0),St=Math.min(St,Xe.count)):xt!=null&&(qe=Math.max(qe,0),St=Math.min(St,xt.count));let $t=St-qe;if($t<0||$t===1/0)return;ke.setup(he,ue,Ue,fe,Xe);let Nt,Pt=De;if(Xe!==null&&(Nt=ge.get(Xe),Pt=be,Pt.setIndex(Nt)),he.isMesh)ue.wireframe===!0?(C.setLineWidth(ue.wireframeLinewidth*Ae()),Pt.setMode(G.LINES)):Pt.setMode(G.TRIANGLES);else if(he.isLine){let hn=ue.linewidth;hn===void 0&&(hn=1),C.setLineWidth(hn*Ae()),he.isLineSegments?Pt.setMode(G.LINES):he.isLineLoop?Pt.setMode(G.LINE_LOOP):Pt.setMode(G.LINE_STRIP)}else he.isPoints?Pt.setMode(G.POINTS):he.isSprite&&Pt.setMode(G.TRIANGLES);if(he.isBatchedMesh)if(Je.get("WEBGL_multi_draw"))Pt.renderMultiDraw(he._multiDrawStarts,he._multiDrawCounts,he._multiDrawCount);else{let hn=he._multiDrawStarts,Ve=he._multiDrawCounts,mn=he._multiDrawCount,bt=Xe?ge.get(Xe).bytesPerElement:1,Fn=U.get(ue).currentProgram.getUniforms();for(let ni=0;ni<mn;ni++)Fn.setValue(G,"_gl_DrawID",ni),Pt.render(hn[ni]/bt,Ve[ni])}else if(he.isInstancedMesh)Pt.renderInstances(qe,$t,he.count);else if(fe.isInstancedBufferGeometry){let hn=fe._maxInstanceCount!==void 0?fe._maxInstanceCount:1/0,Ve=Math.min(fe.instanceCount,hn);Pt.renderInstances(qe,$t,Ve)}else Pt.render(qe,$t)};function Fd(N,Q,fe,ue){A!==null&&N.isNodeMaterial&&A.setObject(ue,N),B===!0&&Be.setState(N,fe,!1),N.transparent===!0&&N.side===Mt&&N.forceSinglePass===!1?(N.side=yn,N.needsUpdate=!0,ua(N,Q,ue),N.side=ui,N.needsUpdate=!0,ua(N,Q,ue),N.side=Mt):ua(N,Q,ue)}this.compile=function(N,Q,fe=null){fe===null&&(fe=N),A!==null&&A.renderStart(N,Q,fe),b=Me.get(fe),b.init(Q),x.push(b),fe.traverseVisible(function(he){he.isLight&&he.layers.test(Q.layers)&&(b.pushLight(he),he.castShadow&&b.pushShadow(he))}),N!==fe&&N.traverseVisible(function(he){he.isLight&&he.layers.test(Q.layers)&&(b.pushLight(he),he.castShadow&&b.pushShadow(he))}),b.setupLights(),A!==null&&A.updateLights(b.state.lightsArray),Z=this.localClippingEnabled,B=Be.init(this.clippingPlanes,Z),B===!0&&Be.setGlobalState(this.clippingPlanes,Q),A!==null&&Ye.render(b.state.shadowsArray,fe,Q);let ue=new Set;return N.traverse(function(he){if(!(he.isMesh||he.isPoints||he.isLine||he.isSprite))return;let Oe=he.material;if(Oe)if(Array.isArray(Oe))for(let He=0;He<Oe.length;He++){let Ue=Oe[He];Fd(Ue,fe,Q,he),ue.add(Ue)}else Fd(Oe,fe,Q,he),ue.add(Oe)}),b=x.pop(),A!==null&&A.renderEnd(),ue},this.compileAsync=function(N,Q,fe=null){let ue=this.compile(N,Q,fe);return new Promise(he=>{function Oe(){if(ue.forEach(function(He){let Xe=U.get(He).currentProgram;(Xe===void 0||Xe.isReady())&&ue.delete(He)}),ue.size===0){he(N);return}setTimeout(Oe,10)}Je.get("KHR_parallel_shader_compile")!==null?Oe():setTimeout(Oe,10)})};let jc=null;function Qg(N){jc&&jc(N)}function Ud(){gr.stop()}function Od(){gr.start()}let gr=new Kp;gr.setAnimationLoop(Qg),typeof self<"u"&&gr.setContext(self),this.setAnimationLoop=function(N){jc=N,Ze.setAnimationLoop(N),N===null?gr.stop():gr.start()},Ze.addEventListener("sessionstart",Ud),Ze.addEventListener("sessionend",Od),this.render=function(N,Q){if(Q!==void 0&&Q.isCamera!==!0){rt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;A!==null&&A.renderStart(N,Q);let fe=Ze.enabled===!0&&Ze.isPresenting===!0,ue=S!==null&&(V===null||fe)&&S.begin(E,V);if(N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Q.parent===null&&Q.matrixWorldAutoUpdate===!0&&Q.updateMatrixWorld(),Ze.enabled===!0&&Ze.isPresenting===!0&&(S===null||S.isCompositing()===!1)&&(Ze.cameraAutoUpdate===!0&&Ze.updateCamera(Q),Q=Ze.getCamera()),N.isScene===!0&&N.onBeforeRender(E,N,Q,V),b=Me.get(N,x.length),b.init(Q),b.state.textureUnits=Y.getTextureUnits(),x.push(b),ne.multiplyMatrices(Q.projectionMatrix,Q.matrixWorldInverse),H.setFromProjectionMatrix(ne,Yn,Q.reversedDepth),Z=this.localClippingEnabled,B=Be.init(this.clippingPlanes,Z),T=we.get(N,w.length),T.init(),w.push(T),Ze.enabled===!0&&Ze.isPresenting===!0){let He=E.xr.getDepthSensingMesh();He!==null&&Jc(He,Q,-1/0,E.sortObjects)}Jc(N,Q,0,E.sortObjects),T.finish(),A!==null&&A.updateLights(b.state.lightsArray),E.sortObjects===!0&&T.sort(X,q),ve=Ze.enabled===!1||Ze.isPresenting===!1||Ze.hasDepthSensing()===!1,ve&&lt.addToRenderList(T,N),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),B===!0&&Be.beginShadows();let he=b.state.shadowsArray;if(Ye.render(he,N,Q),B===!0&&Be.endShadows(),(ue&&S.hasRenderPass())===!1){let He=T.opaque,Ue=T.transmissive;if(b.setupLights(),Q.isArrayCamera){let Xe=Q.cameras;if(Ue.length>0)for(let $e=0,dt=Xe.length;$e<dt;$e++){let xt=Xe[$e];kd(He,Ue,N,xt)}ve&&lt.render(N);for(let $e=0,dt=Xe.length;$e<dt;$e++){let xt=Xe[$e];Bd(T,N,xt,xt.viewport)}}else Ue.length>0&&kd(He,Ue,N,Q),ve&&lt.render(N),Bd(T,N,Q)}V!==null&&L===0&&(Y.updateMultisampleRenderTarget(V),Y.updateRenderTargetMipmap(V)),ue&&S.end(E),N.isScene===!0&&N.onAfterRender(E,N,Q),ke.resetDefaultState(),k=-1,W=null,x.pop(),x.length>0?(b=x[x.length-1],Y.setTextureUnits(b.state.textureUnits),B===!0&&Be.setGlobalState(E.clippingPlanes,b.state.camera)):b=null,w.pop(),w.length>0?T=w[w.length-1]:T=null,A!==null&&A.renderEnd()};function Jc(N,Q,fe,ue){if(N.visible===!1)return;if(N.layers.test(Q.layers)){if(N.isGroup)fe=N.renderOrder;else if(N.isLOD)N.autoUpdate===!0&&N.update(Q);else if(N.isLightProbeGrid)b.pushLightProbeGrid(N);else if(N.isLight)b.pushLight(N),N.castShadow&&b.pushShadow(N);else if(N.isSprite){if(!N.frustumCulled||N.intersectsFrustum(H)){ue&&ce.setFromMatrixPosition(N.matrixWorld).applyMatrix4(ne);let He=de.update(N),Ue=N.material;Ue.visible&&T.push(N,He,Ue,fe,ce.z,null,Q)}}else if((N.isMesh||N.isLine||N.isPoints)&&(!N.frustumCulled||N.intersectsFrustum(H))){let He=de.update(N),Ue=N.material;if(ue&&(N.boundingSphere!==void 0?(N.boundingSphere===null&&N.computeBoundingSphere(),ce.copy(N.boundingSphere.center)):(He.boundingSphere===null&&He.computeBoundingSphere(),ce.copy(He.boundingSphere.center)),ce.applyMatrix4(N.matrixWorld).applyMatrix4(ne)),Array.isArray(Ue)){let Xe=He.groups;for(let $e=0,dt=Xe.length;$e<dt;$e++){let xt=Xe[$e],qe=Ue[xt.materialIndex];qe&&qe.visible&&T.push(N,He,qe,fe,ce.z,xt,Q)}}else Ue.visible&&T.push(N,He,Ue,fe,ce.z,null,Q)}}let Oe=N.children;for(let He=0,Ue=Oe.length;He<Ue;He++)Jc(Oe[He],Q,fe,ue)}function Bd(N,Q,fe,ue){let{opaque:he,transmissive:Oe,transparent:He}=N;b.setupLightsView(fe),B===!0&&Be.setGlobalState(E.clippingPlanes,fe),ue&&C.viewport(J.copy(ue)),he.length>0&&ca(he,Q,fe),Oe.length>0&&ca(Oe,Q,fe),He.length>0&&ca(He,Q,fe),C.buffers.depth.setTest(!0),C.buffers.depth.setMask(!0),C.buffers.color.setMask(!0),C.setPolygonOffset(!1)}function kd(N,Q,fe,ue){if((fe.isScene===!0?fe.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[ue.id]===void 0){let qe=Je.has("EXT_color_buffer_half_float")||Je.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[ue.id]=new Mn(1,1,{generateMipmaps:!0,type:qe?Nn:An,minFilter:Qn,samples:Math.max(4,O.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:pt.workingColorSpace})}let Oe=b.state.transmissionRenderTarget[ue.id],He=ue.viewport||J;Oe.setSize(He.z*E.transmissionResolutionScale,He.w*E.transmissionResolutionScale);let Ue=E.getRenderTarget(),Xe=E.getActiveCubeFace(),$e=E.getActiveMipmapLevel();E.setRenderTarget(Oe),E.getClearColor(Te),Ee=E.getClearAlpha(),Ee<1&&E.setClearColor(16777215,.5),E.clear(),ve&&lt.render(fe);let dt=E.toneMapping;E.toneMapping=$n;let xt=ue.viewport;if(ue.viewport!==void 0&&(ue.viewport=void 0),b.setupLightsView(ue),B===!0&&Be.setGlobalState(E.clippingPlanes,ue),ca(N,fe,ue),Y.updateMultisampleRenderTarget(Oe),Y.updateRenderTargetMipmap(Oe),Je.has("WEBGL_multisampled_render_to_texture")===!1){let qe=!1;for(let St=0,$t=Q.length;St<$t;St++){let Nt=Q[St],{object:Pt,geometry:hn,material:Ve,group:mn}=Nt;if(Ve.side===Mt&&Pt.layers.test(ue.layers)){let bt=Ve.side;Ve.side=yn,Ve.needsUpdate=!0,zd(Pt,fe,ue,hn,Ve,mn),Ve.side=bt,Ve.needsUpdate=!0,qe=!0}}qe===!0&&(Y.updateMultisampleRenderTarget(Oe),Y.updateRenderTargetMipmap(Oe))}E.setRenderTarget(Ue,Xe,$e),E.setClearColor(Te,Ee),xt!==void 0&&(ue.viewport=xt),E.toneMapping=dt}function ca(N,Q,fe){let ue=Q.isScene===!0?Q.overrideMaterial:null;for(let he=0,Oe=N.length;he<Oe;he++){let He=N[he],{object:Ue,geometry:Xe,group:$e}=He,dt=He.material;dt.allowOverride===!0&&ue!==null&&(dt=ue),Ue.layers.test(fe.layers)&&zd(Ue,Q,fe,Xe,dt,$e)}}function zd(N,Q,fe,ue,he,Oe){A!==null&&he.isNodeMaterial&&A.setObject(N,he),N.onBeforeRender(E,Q,fe,ue,he,Oe),N.modelViewMatrix.multiplyMatrices(fe.matrixWorldInverse,N.matrixWorld),N.normalMatrix.getNormalMatrix(N.modelViewMatrix),he.onBeforeRender(E,Q,fe,ue,N,Oe),he.transparent===!0&&he.side===Mt&&he.forceSinglePass===!1?(he.side=yn,he.needsUpdate=!0,E.renderBufferDirect(fe,Q,ue,he,N,Oe),he.side=ui,he.needsUpdate=!0,E.renderBufferDirect(fe,Q,ue,he,N,Oe),he.side=Mt):E.renderBufferDirect(fe,Q,ue,he,N,Oe),N.onAfterRender(E,Q,fe,ue,he,Oe)}function ua(N,Q,fe){Q.isScene!==!0&&(Q=xe);let ue=U.get(N),he=b.state.lights,Oe=b.state.shadowsArray,He=he.state.version,Ue=ye.getParameters(N,he.state,Oe,Q,fe,b.state.lightProbeGridArray),Xe=ye.getProgramCacheKey(Ue),$e=ue.programs;ue.environment=N.isMeshStandardMaterial||N.isMeshLambertMaterial||N.isMeshPhongMaterial?Q.environment:null,ue.fog=Q.fog;let dt=N.isMeshStandardMaterial||N.isMeshLambertMaterial&&!N.envMap||N.isMeshPhongMaterial&&!N.envMap;ue.envMap=ae.get(N.envMap||ue.environment,dt),ue.envMapRotation=ue.environment!==null&&N.envMap===null?Q.environmentRotation:N.envMapRotation,$e===void 0&&(N.addEventListener("dispose",ti),$e=new Map,ue.programs=$e);let xt=$e.get(Xe);if(xt!==void 0){if(ue.currentProgram===xt&&ue.lightsStateVersion===He)return Gd(N,Ue),xt}else Ue.uniforms=ye.getUniforms(N),A!==null&&N.isNodeMaterial&&A.build(N,fe,Ue),N.onBeforeCompile(Ue,E),xt=ye.acquireProgram(Ue,Xe),$e.set(Xe,xt),ue.uniforms=Ue.uniforms;let qe=ue.uniforms;return(!N.isShaderMaterial&&!N.isRawShaderMaterial||N.clipping===!0)&&(qe.clippingPlanes=Be.uniform),Gd(N,Ue),ue.needsLights=i0(N),ue.lightsStateVersion=He,ue.needsLights&&(qe.ambientLightColor.value=he.state.ambient,qe.lightProbe.value=he.state.probe,qe.sunLights.value=he.state.sun,qe.sunLightShadows.value=he.state.sunShadow,qe.directionalLights.value=he.state.directional,qe.directionalLightShadows.value=he.state.directionalShadow,qe.spotLights.value=he.state.spot,qe.spotLightShadows.value=he.state.spotShadow,qe.rectAreaLights.value=he.state.rectArea,qe.ltc_1.value=he.state.rectAreaLTC1,qe.ltc_2.value=he.state.rectAreaLTC2,qe.pointLights.value=he.state.point,qe.pointLightShadows.value=he.state.pointShadow,qe.hemisphereLights.value=he.state.hemi,qe.sunShadowMatrix.value=he.state.sunShadowMatrix,qe.sunShadowCascade.value=he.state.sunShadowCascade,qe.directionalShadowMatrix.value=he.state.directionalShadowMatrix,qe.spotLightMatrix.value=he.state.spotLightMatrix,qe.spotLightMap.value=he.state.spotLightMap,qe.pointShadowMatrix.value=he.state.pointShadowMatrix),ue.lightProbeGrid=b.state.lightProbeGridArray.length>0,ue.currentProgram=xt,ue.uniformsList=null,xt}function Vd(N){if(N.uniformsList===null){let Q=N.currentProgram.getUniforms();N.uniformsList=Fs.seqWithValue(Q.seq,N.uniforms)}return N.uniformsList}function Gd(N,Q){let fe=U.get(N);fe.outputColorSpace=Q.outputColorSpace,fe.batching=Q.batching,fe.batchingColor=Q.batchingColor,fe.instancing=Q.instancing,fe.instancingColor=Q.instancingColor,fe.instancingMorph=Q.instancingMorph,fe.skinning=Q.skinning,fe.morphTargets=Q.morphTargets,fe.morphNormals=Q.morphNormals,fe.morphColors=Q.morphColors,fe.morphTargetsCount=Q.morphTargetsCount,fe.numClippingPlanes=Q.numClippingPlanes,fe.numIntersection=Q.numClipIntersection,fe.vertexAlphas=Q.vertexAlphas,fe.vertexTangents=Q.vertexTangents,fe.toneMapping=Q.toneMapping}function e0(N,Q){if(N.length===0)return null;if(N.length===1)return N[0].texture!==null?N[0]:null;v.setFromMatrixPosition(Q.matrixWorld);for(let fe=0,ue=N.length;fe<ue;fe++){let he=N[fe];if(he.texture!==null&&he.boundingBox.containsPoint(v))return he}return null}function t0(N,Q,fe,ue,he){Q.isScene!==!0&&(Q=xe),Y.resetTextureUnits();let Oe=Q.fog,He=ue.isMeshStandardMaterial||ue.isMeshLambertMaterial||ue.isMeshPhongMaterial?Q.environment:null,Ue=V===null?E.outputColorSpace:V.isXRRenderTarget===!0?V.texture.colorSpace:pt.workingColorSpace,Xe=ue.isMeshStandardMaterial||ue.isMeshLambertMaterial&&!ue.envMap||ue.isMeshPhongMaterial&&!ue.envMap,$e=ae.get(ue.envMap||He,Xe),dt=ue.vertexColors===!0&&!!fe.attributes.color&&fe.attributes.color.itemSize===4,xt=!!fe.attributes.tangent&&(!!ue.normalMap||ue.anisotropy>0),qe=!!fe.morphAttributes.position,St=!!fe.morphAttributes.normal,$t=!!fe.morphAttributes.color,Nt=$n;ue.toneMapped&&(V===null||V.isXRRenderTarget===!0)&&(Nt=E.toneMapping);let Pt=fe.morphAttributes.position||fe.morphAttributes.normal||fe.morphAttributes.color,hn=Pt!==void 0?Pt.length:0,Ve=U.get(ue),mn=b.state.lights;if(B===!0&&(Z===!0||N!==W)){let Lt=N===W&&ue.id===k;Be.setState(ue,N,Lt)}let bt=!1;ue.version===Ve.__version?(Ve.needsLights&&Ve.lightsStateVersion!==mn.state.version||Ve.outputColorSpace!==Ue||he.isBatchedMesh&&Ve.batching===!1||!he.isBatchedMesh&&Ve.batching===!0||he.isBatchedMesh&&Ve.batchingColor===!0&&he._colorsTexture===null||he.isBatchedMesh&&Ve.batchingColor===!1&&he._colorsTexture!==null||he.isInstancedMesh&&Ve.instancing===!1||!he.isInstancedMesh&&Ve.instancing===!0||he.isSkinnedMesh&&Ve.skinning===!1||!he.isSkinnedMesh&&Ve.skinning===!0||he.isInstancedMesh&&Ve.instancingColor===!0&&he.instanceColor===null||he.isInstancedMesh&&Ve.instancingColor===!1&&he.instanceColor!==null||he.isInstancedMesh&&Ve.instancingMorph===!0&&he.morphTexture===null||he.isInstancedMesh&&Ve.instancingMorph===!1&&he.morphTexture!==null||Ve.envMap!==$e||ue.fog===!0&&Ve.fog!==Oe||Ve.numClippingPlanes!==void 0&&(Ve.numClippingPlanes!==Be.numPlanes||Ve.numIntersection!==Be.numIntersection)||Ve.vertexAlphas!==dt||Ve.vertexTangents!==xt||Ve.morphTargets!==qe||Ve.morphNormals!==St||Ve.morphColors!==$t||Ve.toneMapping!==Nt||Ve.morphTargetsCount!==hn||!!Ve.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&(bt=!0):(bt=!0,Ve.__version=ue.version);let Fn=Ve.currentProgram;bt===!0&&(Fn=ua(ue,Q,he),A&&ue.isNodeMaterial&&A.onUpdateProgram(ue,Fn,Ve));let ni=!1,Vi=!1,Kr=!1,Rt=Fn.getUniforms(),Xt=Ve.uniforms;if(C.useProgram(Fn.program)&&(ni=!0,Vi=!0,Kr=!0),ue.id!==k&&(k=ue.id,Vi=!0),Ve.needsLights){let Lt=e0(b.state.lightProbeGridArray,he);Ve.lightProbeGrid!==Lt&&(Ve.lightProbeGrid=Lt,Vi=!0)}if(ni||W!==N){C.buffers.depth.getReversed()&&N.reversedDepth!==!0&&(N._reversedDepth=!0,N.updateProjectionMatrix()),Rt.setValue(G,"projectionMatrix",N.projectionMatrix),Rt.setValue(G,"viewMatrix",N.matrixWorldInverse);let Hi=Rt.map.cameraPosition;Hi!==void 0&&Hi.setValue(G,te.setFromMatrixPosition(N.matrixWorld)),O.logarithmicDepthBuffer&&Rt.setValue(G,"logDepthBufFC",2/(Math.log(N.far+1)/Math.LN2)),(ue.isMeshPhongMaterial||ue.isMeshToonMaterial||ue.isMeshLambertMaterial||ue.isMeshBasicMaterial||ue.isMeshStandardMaterial||ue.isShaderMaterial)&&Rt.setValue(G,"isOrthographic",N.isOrthographicCamera===!0),W!==N&&(W=N,Vi=!0,Kr=!0)}if(Ve.needsLights&&(mn.state.sunShadowMap.length>0&&Rt.setValue(G,"sunShadowMap",mn.state.sunShadowMap,Y),mn.state.directionalShadowMap.length>0&&Rt.setValue(G,"directionalShadowMap",mn.state.directionalShadowMap,Y),mn.state.spotShadowMap.length>0&&Rt.setValue(G,"spotShadowMap",mn.state.spotShadowMap,Y),mn.state.pointShadowMap.length>0&&Rt.setValue(G,"pointShadowMap",mn.state.pointShadowMap,Y)),he.isSkinnedMesh){Rt.setOptional(G,he,"bindMatrix"),Rt.setOptional(G,he,"bindMatrixInverse");let Lt=he.skeleton;Lt&&(Lt.boneTexture===null&&Lt.computeBoneTexture(),Rt.setValue(G,"boneTexture",Lt.boneTexture,Y))}he.isBatchedMesh&&(Rt.setOptional(G,he,"batchingTexture"),Rt.setValue(G,"batchingTexture",he._matricesTexture,Y),Rt.setOptional(G,he,"batchingIdTexture"),Rt.setValue(G,"batchingIdTexture",he._indirectTexture,Y),Rt.setOptional(G,he,"batchingColorTexture"),he._colorsTexture!==null&&Rt.setValue(G,"batchingColorTexture",he._colorsTexture,Y));let Gi=fe.morphAttributes;if((Gi.position!==void 0||Gi.normal!==void 0||Gi.color!==void 0)&&ee.update(he,fe,Fn),(Vi||Ve.receiveShadow!==he.receiveShadow)&&(Ve.receiveShadow=he.receiveShadow,Rt.setValue(G,"receiveShadow",he.receiveShadow)),(ue.isMeshStandardMaterial||ue.isMeshLambertMaterial||ue.isMeshPhongMaterial)&&ue.envMap===null&&Q.environment!==null&&(Xt.envMapIntensity.value=Q.environmentIntensity),Xt.dfgLUT!==void 0&&(Xt.dfgLUT.value=T_()),Vi){if(Rt.setValue(G,"toneMappingExposure",E.toneMappingExposure),Ve.needsLights&&n0(Xt,Kr),Oe&&ue.fog===!0&&Pe.refreshFogUniforms(Xt,Oe),Pe.refreshMaterialUniforms(Xt,ue,le,se,b.state.transmissionRenderTarget[N.id]),Ve.needsLights&&Ve.lightProbeGrid){let Lt=Ve.lightProbeGrid;Xt.probesSH.value=Lt.texture,Xt.probesMin.value.copy(Lt.boundingBox.min),Xt.probesMax.value.copy(Lt.boundingBox.max),Xt.probesResolution.value.copy(Lt.resolution)}Fs.upload(G,Vd(Ve),Xt,Y)}if(ue.isShaderMaterial&&ue.uniformsNeedUpdate===!0&&(Fs.upload(G,Vd(Ve),Xt,Y),ue.uniformsNeedUpdate=!1),ue.isSpriteMaterial&&Rt.setValue(G,"center",he.center),Rt.setValue(G,"modelViewMatrix",he.modelViewMatrix),Rt.setValue(G,"normalMatrix",he.normalMatrix),Rt.setValue(G,"modelMatrix",he.matrixWorld),ue.uniformsGroups!==void 0){let Lt=ue.uniformsGroups;for(let Hi=0,Yr=Lt.length;Hi<Yr;Hi++){let Wd=Lt[Hi];_e.update(Wd,Fn),_e.bind(Wd,Fn)}}return Fn}function n0(N,Q){N.ambientLightColor.needsUpdate=Q,N.lightProbe.needsUpdate=Q,N.sunLights.needsUpdate=Q,N.sunLightShadows.needsUpdate=Q,N.directionalLights.needsUpdate=Q,N.directionalLightShadows.needsUpdate=Q,N.pointLights.needsUpdate=Q,N.pointLightShadows.needsUpdate=Q,N.spotLights.needsUpdate=Q,N.spotLightShadows.needsUpdate=Q,N.rectAreaLights.needsUpdate=Q,N.hemisphereLights.needsUpdate=Q}function i0(N){return N.isMeshLambertMaterial||N.isMeshToonMaterial||N.isMeshPhongMaterial||N.isMeshStandardMaterial||N.isShadowMaterial||N.isShaderMaterial&&N.lights===!0}this.getActiveCubeFace=function(){return z},this.getActiveMipmapLevel=function(){return L},this.getRenderTarget=function(){return V},this.setRenderTargetTextures=function(N,Q,fe){let ue=U.get(N);ue.__autoAllocateDepthBuffer=N.resolveDepthBuffer===!1,ue.__autoAllocateDepthBuffer===!1&&(ue.__useRenderToTexture=!1),U.get(N.texture).__webglTexture=Q,U.get(N.depthTexture).__webglTexture=ue.__autoAllocateDepthBuffer?void 0:fe,ue.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(N,Q){let fe=U.get(N);fe.__webglFramebuffer=Q,fe.__useDefaultFramebuffer=Q===void 0},this.setRenderTarget=function(N,Q=0,fe=0){V=N,z=Q,L=fe;let ue=null,he=!1,Oe=!1;if(N){let Ue=U.get(N);if(Ue.__useDefaultFramebuffer!==void 0){C.bindFramebuffer(G.FRAMEBUFFER,Ue.__webglFramebuffer),J.copy(N.viewport),oe.copy(N.scissor),re=N.scissorTest,C.viewport(J),C.scissor(oe),C.setScissorTest(re),k=-1;return}else if(Ue.__webglFramebuffer===void 0)Y.setupRenderTarget(N);else if(Ue.__hasExternalTextures)Y.rebindTextures(N,U.get(N.texture).__webglTexture,U.get(N.depthTexture).__webglTexture);else if(N.depthBuffer){let dt=N.depthTexture;if(Ue.__boundDepthTexture!==dt){if(dt!==null&&U.has(dt)&&(N.width!==dt.image.width||N.height!==dt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Y.setupDepthRenderbuffer(N)}}let Xe=N.texture;(Xe.isData3DTexture||Xe.isDataArrayTexture||Xe.isCompressedArrayTexture)&&(Oe=!0);let $e=U.get(N).__webglFramebuffer;N.isWebGLCubeRenderTarget?(Array.isArray($e[Q])?ue=$e[Q][fe]:ue=$e[Q],he=!0):N.samples>0&&Y.useMultisampledRTT(N)===!1?ue=U.get(N).__webglMultisampledFramebuffer:Array.isArray($e)?ue=$e[fe]:ue=$e,J.copy(N.viewport),oe.copy(N.scissor),re=N.scissorTest}else J.copy($).multiplyScalar(le).floor(),oe.copy(pe).multiplyScalar(le).floor(),re=K;if(fe!==0&&(ue=P),C.bindFramebuffer(G.FRAMEBUFFER,ue)&&C.drawBuffers(N,ue),C.viewport(J),C.scissor(oe),C.setScissorTest(re),he){let Ue=U.get(N.texture);G.framebufferTexture2D(G.FRAMEBUFFER,G.COLOR_ATTACHMENT0,G.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Ue.__webglTexture,fe)}else if(Oe){let Ue=Q;for(let Xe=0;Xe<N.textures.length;Xe++){let $e=U.get(N.textures[Xe]);G.framebufferTextureLayer(G.FRAMEBUFFER,G.COLOR_ATTACHMENT0+Xe,$e.__webglTexture,fe,Ue)}}else if(N!==null&&fe!==0){let Ue=U.get(N.texture);G.framebufferTexture2D(G.FRAMEBUFFER,G.COLOR_ATTACHMENT0,G.TEXTURE_2D,Ue.__webglTexture,fe)}k=-1};function Hd(N){let Q=U.get(N);return(Q.__readFormat!==N.format||Q.__readType!==N.type)&&(Q.__readFormat=N.format,Q.__readType=N.type,Q.__formatReadable=O.textureFormatReadable(N.format),Q.__typeReadable=O.textureTypeReadable(N.type)),Q}this.readRenderTargetPixels=function(N,Q,fe,ue,he,Oe,He,Ue=0){if(!(N&&N.isWebGLRenderTarget)){rt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Xe=U.get(N).__webglFramebuffer;if(N.isWebGLCubeRenderTarget&&He!==void 0&&(Xe=Xe[He]),Xe){C.bindFramebuffer(G.FRAMEBUFFER,Xe);try{let $e=N.textures[Ue],dt=$e.format,xt=$e.type;N.textures.length>1&&G.readBuffer(G.COLOR_ATTACHMENT0+Ue);let qe=Hd($e);if(qe.__formatReadable===!1){rt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(qe.__typeReadable===!1){rt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Q>=0&&Q<=N.width-ue&&fe>=0&&fe<=N.height-he&&G.readPixels(Q,fe,ue,he,Le.convert(dt),Le.convert(xt),Oe)}finally{let $e=V!==null?U.get(V).__webglFramebuffer:null;C.bindFramebuffer(G.FRAMEBUFFER,$e)}}},this.readRenderTargetPixelsAsync=async function(N,Q,fe,ue,he,Oe,He,Ue=0){if(!(N&&N.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Xe=U.get(N).__webglFramebuffer;if(N.isWebGLCubeRenderTarget&&He!==void 0&&(Xe=Xe[He]),Xe)if(Q>=0&&Q<=N.width-ue&&fe>=0&&fe<=N.height-he){C.bindFramebuffer(G.FRAMEBUFFER,Xe);let $e=N.textures[Ue],dt=$e.format,xt=$e.type;N.textures.length>1&&G.readBuffer(G.COLOR_ATTACHMENT0+Ue);let qe=Hd($e);if(qe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(qe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let St=G.createBuffer();G.bindBuffer(G.PIXEL_PACK_BUFFER,St),G.bufferData(G.PIXEL_PACK_BUFFER,Oe.byteLength,G.STREAM_READ),G.readPixels(Q,fe,ue,he,Le.convert(dt),Le.convert(xt),0),G.bindBuffer(G.PIXEL_PACK_BUFFER,null);let $t=V!==null?U.get(V).__webglFramebuffer:null;C.bindFramebuffer(G.FRAMEBUFFER,$t);let Nt=G.fenceSync(G.SYNC_GPU_COMMANDS_COMPLETE,0);return G.flush(),await gp(G,Nt,4),G.bindBuffer(G.PIXEL_PACK_BUFFER,St),G.getBufferSubData(G.PIXEL_PACK_BUFFER,0,Oe),G.bindBuffer(G.PIXEL_PACK_BUFFER,null),G.deleteBuffer(St),G.deleteSync(Nt),Oe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(N,Q=null,fe=0){let ue=Math.pow(2,-fe),he=Math.floor(N.image.width*ue),Oe=Math.floor(N.image.height*ue),He=Q!==null?Q.x:0,Ue=Q!==null?Q.y:0;Y.setTexture2D(N,0),G.copyTexSubImage2D(G.TEXTURE_2D,fe,0,0,He,Ue,he,Oe),C.unbindTexture()},this.copyTextureToTexture=function(N,Q,fe=null,ue=null,he=0,Oe=0){let He,Ue,Xe,$e,dt,xt,qe,St,$t,Nt=N.isCompressedTexture?N.mipmaps[Oe]:N.image;if(fe!==null)He=fe.max.x-fe.min.x,Ue=fe.max.y-fe.min.y,Xe=fe.isBox3?fe.max.z-fe.min.z:1,$e=fe.min.x,dt=fe.min.y,xt=fe.isBox3?fe.min.z:0;else{let Xt=Math.pow(2,-he);He=Math.floor(Nt.width*Xt),Ue=Math.floor(Nt.height*Xt),N.isDataArrayTexture?Xe=Nt.depth:N.isData3DTexture?Xe=Math.floor(Nt.depth*Xt):Xe=1,$e=0,dt=0,xt=0}ue!==null?(qe=ue.x,St=ue.y,$t=ue.z):(qe=0,St=0,$t=0);let Pt=Le.convert(Q.format),hn=Le.convert(Q.type),Ve;Q.isData3DTexture?(Y.setTexture3D(Q,0),Ve=G.TEXTURE_3D):Q.isDataArrayTexture||Q.isCompressedArrayTexture?(Y.setTexture2DArray(Q,0),Ve=G.TEXTURE_2D_ARRAY):(Y.setTexture2D(Q,0),Ve=G.TEXTURE_2D),C.activeTexture(G.TEXTURE0),C.pixelStorei(G.UNPACK_FLIP_Y_WEBGL,Q.flipY),C.pixelStorei(G.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Q.premultiplyAlpha),C.pixelStorei(G.UNPACK_ALIGNMENT,Q.unpackAlignment);let mn=C.getParameter(G.UNPACK_ROW_LENGTH),bt=C.getParameter(G.UNPACK_IMAGE_HEIGHT),Fn=C.getParameter(G.UNPACK_SKIP_PIXELS),ni=C.getParameter(G.UNPACK_SKIP_ROWS),Vi=C.getParameter(G.UNPACK_SKIP_IMAGES);C.pixelStorei(G.UNPACK_ROW_LENGTH,Nt.width),C.pixelStorei(G.UNPACK_IMAGE_HEIGHT,Nt.height),C.pixelStorei(G.UNPACK_SKIP_PIXELS,$e),C.pixelStorei(G.UNPACK_SKIP_ROWS,dt),C.pixelStorei(G.UNPACK_SKIP_IMAGES,xt);let Kr=N.isDataArrayTexture||N.isData3DTexture,Rt=Q.isDataArrayTexture||Q.isData3DTexture;if(N.isDepthTexture){let Xt=U.get(N),Gi=U.get(Q),Lt=U.get(Xt.__renderTarget),Hi=U.get(Gi.__renderTarget);C.bindFramebuffer(G.READ_FRAMEBUFFER,Lt.__webglFramebuffer),C.bindFramebuffer(G.DRAW_FRAMEBUFFER,Hi.__webglFramebuffer);for(let Yr=0;Yr<Xe;Yr++)Kr&&(G.framebufferTextureLayer(G.READ_FRAMEBUFFER,G.COLOR_ATTACHMENT0,U.get(N).__webglTexture,he,xt+Yr),G.framebufferTextureLayer(G.DRAW_FRAMEBUFFER,G.COLOR_ATTACHMENT0,U.get(Q).__webglTexture,Oe,$t+Yr)),G.blitFramebuffer($e,dt,He,Ue,qe,St,He,Ue,G.DEPTH_BUFFER_BIT,G.NEAREST);C.bindFramebuffer(G.READ_FRAMEBUFFER,null),C.bindFramebuffer(G.DRAW_FRAMEBUFFER,null)}else if(he!==0||N.isRenderTargetTexture||U.has(N)){let Xt=U.get(N),Gi=U.get(Q);C.bindFramebuffer(G.READ_FRAMEBUFFER,D),C.bindFramebuffer(G.DRAW_FRAMEBUFFER,F);for(let Lt=0;Lt<Xe;Lt++)Kr?G.framebufferTextureLayer(G.READ_FRAMEBUFFER,G.COLOR_ATTACHMENT0,Xt.__webglTexture,he,xt+Lt):G.framebufferTexture2D(G.READ_FRAMEBUFFER,G.COLOR_ATTACHMENT0,G.TEXTURE_2D,Xt.__webglTexture,he),Rt?G.framebufferTextureLayer(G.DRAW_FRAMEBUFFER,G.COLOR_ATTACHMENT0,Gi.__webglTexture,Oe,$t+Lt):G.framebufferTexture2D(G.DRAW_FRAMEBUFFER,G.COLOR_ATTACHMENT0,G.TEXTURE_2D,Gi.__webglTexture,Oe),he!==0?G.blitFramebuffer($e,dt,He,Ue,qe,St,He,Ue,G.COLOR_BUFFER_BIT,G.NEAREST):Rt?G.copyTexSubImage3D(Ve,Oe,qe,St,$t+Lt,$e,dt,He,Ue):G.copyTexSubImage2D(Ve,Oe,qe,St,$e,dt,He,Ue);C.bindFramebuffer(G.READ_FRAMEBUFFER,null),C.bindFramebuffer(G.DRAW_FRAMEBUFFER,null)}else Rt?N.isDataTexture||N.isData3DTexture?G.texSubImage3D(Ve,Oe,qe,St,$t,He,Ue,Xe,Pt,hn,Nt.data):Q.isCompressedArrayTexture?G.compressedTexSubImage3D(Ve,Oe,qe,St,$t,He,Ue,Xe,Pt,Nt.data):G.texSubImage3D(Ve,Oe,qe,St,$t,He,Ue,Xe,Pt,hn,Nt):N.isDataTexture?G.texSubImage2D(G.TEXTURE_2D,Oe,qe,St,He,Ue,Pt,hn,Nt.data):N.isCompressedTexture?G.compressedTexSubImage2D(G.TEXTURE_2D,Oe,qe,St,Nt.width,Nt.height,Pt,Nt.data):G.texSubImage2D(G.TEXTURE_2D,Oe,qe,St,He,Ue,Pt,hn,Nt);C.pixelStorei(G.UNPACK_ROW_LENGTH,mn),C.pixelStorei(G.UNPACK_IMAGE_HEIGHT,bt),C.pixelStorei(G.UNPACK_SKIP_PIXELS,Fn),C.pixelStorei(G.UNPACK_SKIP_ROWS,ni),C.pixelStorei(G.UNPACK_SKIP_IMAGES,Vi),Oe===0&&Q.generateMipmaps&&G.generateMipmap(Ve),C.unbindTexture()},this.initRenderTarget=function(N){U.get(N).__webglFramebuffer===void 0&&Y.setupRenderTarget(N)},this.initTexture=function(N){N.isCubeTexture?Y.setTextureCube(N,0):N.isData3DTexture?Y.setTexture3D(N,0):N.isDataArrayTexture||N.isCompressedArrayTexture?Y.setTexture2DArray(N,0):Y.setTexture2D(N,0),C.unbindTexture()},this.resetState=function(){z=0,L=0,V=null,C.reset(),ke.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Yn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=pt._getDrawingBufferColorSpace(e),t.unpackColorSpace=pt._getUnpackColorSpace()}};var Zo=i=>i.map(e=>e.toFixed(6)).join(":");function em(i){let e=i.filter(a=>a.medium==="air"&&!a.branch?.startsWith("idle")&&a.branch!=="disa-coupling"),t=new Map,n=new Map;for(let a of e){let l=new Ot(a.coords.map(h=>new I(...h)),!1,"centripetal"),c=l.getLengths();n.set(a,c.at(-1));let u=h=>{let d=h*(c.length-1),f=Math.min(c.length-2,Math.floor(d));return We.lerp(c[f],c[f+1],d-f)};for(let h=1;h<a.coords.length;h++){let d=Zo(a.coords[h-1]),f=Zo(a.coords[h]),p=u(h/(a.coords.length-1))-u((h-1)/(a.coords.length-1)),y=t.get(d)??[];if(y.push({to:f,distance:p}),t.set(d,y),a.bidirectional){let m=t.get(f)??[];m.push({to:d,distance:p}),t.set(f,m)}}}let r=e.find(a=>a.branch==="main"),s=new Map;if(r){s.set(Zo(r.coords[0]),0);let a=[Zo(r.coords[0])];for(;a.length;){a.sort((u,h)=>s.get(h)-s.get(u));let l=a.pop(),c=s.get(l);for(let u of t.get(l)??[]){let h=c+u.distance;h<(s.get(u.to)??1/0)&&(s.set(u.to,h),a.push(u.to))}}}return{offset:(a,l)=>{if(a.branch?.startsWith("idle")||a.branch==="disa-coupling"||a.cylinder&&a.cylinder!==l)return-1e6;let c=a.intakeGroup??(a.branch==="intake-front"?0:a.branch==="intake-rear"?1:void 0);return c!==void 0&&(l<=3?0:1)!==c?-1e6:s.get(Zo(a.coords[0]))??-1e6},length:a=>n.get(a)??0,distances:s}}function gc(i,e,t,n,r){let s=i.branch??"main";if(s.startsWith("idle")||s==="disa-coupling")return 0;let o=s==="intake-front"?[1,2,3]:s==="intake-rear"?[4,5,6]:null;return o?o.reduce((a,l)=>a+r("air",l,"runner",e,t,n),0):r("air",i.cylinder,s,e,t,n)}var jo=Object.freeze({camshaft:"standard",flywheel:"standard",intake:"standard",exhaust:"standard",response:"standard",filter:"standard",throttleBody:"standard",runners:"standard",head:"standard",seats:"standard",valves:"standard",valveSprings:"standard",retainers:"standard",lifters:"standard",pistons:"standard",rods:"standard",exhaustDiameter:"standard",catalyst:"standard",muffler:"standard",ignition:"standard",mixture:"standard",camTiming:"standard",idle:"standard",revLimit:"auto"}),Sw=Object.freeze({camshaft:["standard","sport","supersport","race"],flywheel:["standard","light","ultralight"],intake:["standard","sport","race"],exhaust:["standard","sport","race"],response:["standard","comfort","sport"],filter:["standard","sport"],throttleBody:["standard","large","itb"],runners:["standard","long","short"],head:["standard","ported","race"],seats:["standard","multiangle"],valves:["standard","large"],valveSprings:["standard","sport","race"],retainers:["standard","titanium"],lifters:["standard","solid"],pistons:["standard","high","race"],rods:["standard","light"],exhaustDiameter:["standard","large","race"],catalyst:["standard","sport","straight"],muffler:["standard","sport","race"],ignition:["standard","torque","race"],mixture:["standard","power"],camTiming:["standard","torque","topend"],idle:["standard","raised","race"],revLimit:["auto","street","race"]});var ww=Object.freeze({standard:jo,comfort:Object.freeze({...jo,response:"comfort"}),sport:Object.freeze({camshaft:"sport",flywheel:"light",intake:"sport",exhaust:"sport",response:"sport"})});var tm=Object.freeze({preset:"m54",hfGain:.01,noise:1,jitter:.5,convolution:1,impulse:"default_0",idleAssist:!1}),Iw=Object.freeze(["default_0","sharp_0","mild_exhaust_0","mild_exhaust_0_reverb","minimal_muffling_01"]);var Ht=Math.PI*2;var w_=[1,5,3,6,2,4];var Wt=(i,e)=>(i%e+e)%e;var A_={sound:{...tm},tuning:{...jo},engine:{boreMm:84,strokeMm:89.6,rodMm:135,flywheelKgM2:.18,throttleLagS:0},vehicle:{massKg:1450,finalDrive:3.15,wheelRadiusM:.31,gears:[4.2,2.5,1.65,1.2,1],dragAreaM2:.65,rollingCoefficient:.012},cooling:{ambientC:22,coolantL:9,specificHeatKjKgK:3.8,engineCapacityKjK:90,flowLMin:45,radiatorWPerK:1200,fan:1,roadAir:!0,heatMode:"estimated",manualHeatKw:25}},xc=(i=A_)=>structuredClone(i);function nm(i,e,t,n){let r=w_.indexOf(e),s=Wt(i-r*Ht/3,Ht*2),o=t/2,a=Wt(s,Ht),l=o*Math.sin(a),c=-o*Math.cos(a),u=c-Math.sqrt(n**2-l**2),h=u+n+o;return{phase:s,crankX:l,crankY:c,pistonY:u,travel:h,stroke:t,stage:Math.min(3,Math.floor(s/Math.PI))}}var Uw=Object.freeze({coolantC:120,engineC:160,thermostatStartC:88,thermostatFullC:108});function Fi(i,e,t){let n=i?.valveCurves?.samples[t-1];if(!n?.length)return null;let r=Wt(e,Ht*2)/(Ht*2)*n.length,s=Math.floor(r),o=r-s,a=n[s],l=n[(s+1)%n.length];return!a||!l||a.length<2||l.length<2?null:{intakeLiftMm:Math.max(0,a[0]+(l[0]-a[0])*o),exhaustLiftMm:Math.max(0,a[1]+(l[1]-a[1])*o)}}function im(i,e,t,n){let r=nm(i,e,t.engine.strokeMm,t.engine.rodMm);if(n?.tdcRad===void 0||!n.journalAngles)return r;let s=n.tdcRad-i+(n.journalAngles[e-1]??0),o=t.engine.strokeMm/2,a=t.engine.rodMm,l=o*Math.cos(s),c=-o*Math.sin(s),u=c-Math.sqrt(a*a-l*l);return{...r,crankX:l,crankY:c,pistonY:u,travel:u+a+o}}function Jo(i,e,t,n){let r=Fi(i,e,t);if(!n){let l=i?.cylinders?.[t-1];return l?{...l,...r}:null}let s=i?.cycles?.find(l=>l.cylinder===t)??(i?.cycle?.cylinder===t?i.cycle:void 0);if(!s?.samples.length)return null;let o=Math.floor(Wt(e,Ht*2)/(Ht*2)*s.samples.length),a=s.samples[o];return a?{pressureKpa:a[0],gasTemperatureK:a[1],intakeLiftMm:a[2],exhaustLiftMm:a[3],intakeMolS:a[4],exhaustMolS:a[5],burning:!!a[6],fuelFraction:0,...r}:null}var E_=[1,2,3,4,5,6],C_=.35,R_=.16,P_=i=>Number.isInteger(i)&&i>=1&&i<=6;function rm(i,e){if(i.idleDistribution.length!==6||i.idleHeadPaths.length!==6)throw new Error("R12 idle geometry needs exactly six ports.");let t=l=>{if(!l||l.length!==3||!l.every(Number.isFinite))throw new Error("R12 intake coordinates must be finite XYZ points.");return[...l]},n=(l,c)=>l.length===c.length&&l.every((u,h)=>u===c[h]),r=(l,c,u,h={})=>{let d=c.map(t).filter((f,p,y)=>p===0||!n(f,y[p-1]));if(d.length<2)throw new Error(`R12 intake route ${l} needs two distinct points.`);return{medium:"air",branch:l,coords:d,radius:u,internal:!0,flowFactor:1,...h}},s=i.idleDistribution.map(t),o=[r("idle-supply",[i.idleTap,i.idleInlet,i.idleValve,i.idleEntry,s[2]],7)],a=[[2,1,[1,2]],[1,0,[1]],[2,3,[4,5,6]],[3,4,[5,6]],[4,5,[6]]];for(let[l,c,u]of a)o.push(r("idle-rail",[s[l],s[c]],2.75,{contributors:u}));for(let l=0;l<6;l++){let c=i.idleHeadPaths[l];if(!c.length||!n(s[l],c[0]))throw new Error(`R12 idle port ${l+1} must start at its distributor node.`);o.push(r("idle-port",c,2.75,{cylinder:l+1}))}return o.push(r("disa-coupling",e,17,{bidirectional:!0})),o}function sm(i,e,t){return!t||!Number.isFinite(e)||e<=5?"unknown":e<3750?"closed":e>4100?"open":i==="open"||i==="closed"?i:"unknown"}function om(i,e,t){let n=t.fresh&&t.enabled&&Number.isFinite(e)&&Number.isFinite(i?.rpm)&&(i?.rpm??0)>5,r=E_.map(u=>n?Jo(i,e,u,!0)?.intakeMolS:void 0),s=r.map(u=>typeof u=="number"&&Number.isFinite(u)),o=r.map((u,h)=>s[h]?Math.min(100,Math.max(0,u))*C_:0),a=s.some(Boolean),l=a?i?.source==="ange-physical"?"native-cylinder-cycle":"other-cylinder-cycle":"unavailable",c=n&&a&&(t.disa==="open"||t.disa==="closed")?t.disa:"unknown";return{source:l,fresh:n,sampleAvailable:s,idlePorts:o,idleSupply:o.reduce((u,h)=>u+h,0),disa:c}}function yc(i,e){let t=i.branch??"";if(t==="disa-coupling")return{kind:"disa-open-indicator",stationary:!0,intensity:e.disa==="open"?R_:0};if(!t.startsWith("idle"))return{kind:"not-r12",stationary:!1,intensity:0};if(t==="idle-supply")return{kind:"idle-illustration",stationary:!1,intensity:e.idleSupply};let n;return t==="idle"||t==="idle-port"?n=i.cylinder===void 0?[]:[i.cylinder]:n=i.contributors??[],{kind:"idle-illustration",stationary:!1,intensity:[...new Set(n.filter(P_))].reduce((o,a)=>o+(e.idlePorts[a-1]??0),0)}}var am={type:"change"},Ph={type:"start"},cm={type:"end"},bc=new wi,lm=new Dn,I_=Math.cos(70*We.DEG2RAD),on=new I,En=2*Math.PI,Ct={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Rh=1e-6,vc=class extends Uo{constructor(e,t=null){super(e,t),this.state=Ct.NONE,this.target=new I,this.cursor=new I,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:ir.ROTATE,MIDDLE:ir.DOLLY,RIGHT:ir.PAN},this.touches={ONE:rr.ROTATE,TWO:rr.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new I,this._lastQuaternion=new vt,this._lastTargetPosition=new I,this._quat=new vt().setFromUnitVectors(e.up,new I(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Es,this._sphericalDelta=new Es,this._scale=1,this._panOffset=new I,this._rotateStart=new me,this._rotateEnd=new me,this._rotateDelta=new me,this._panStart=new me,this._panEnd=new me,this._panDelta=new me,this._dollyStart=new me,this._dollyEnd=new me,this._dollyDelta=new me,this._dollyDirection=new I,this._mouse=new me,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=L_.bind(this),this._onPointerDown=D_.bind(this),this._onPointerUp=N_.bind(this),this._onContextMenu=V_.bind(this),this._onMouseWheel=O_.bind(this),this._onKeyDown=B_.bind(this),this._onTouchStart=k_.bind(this),this._onTouchMove=z_.bind(this),this._onMouseDown=F_.bind(this),this._onMouseMove=U_.bind(this),this._interceptControlDown=G_.bind(this),this._interceptControlUp=H_.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=Ct.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(am),this.update(),this.state=Ct.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;on.copy(t).sub(this.target),on.applyQuaternion(this._quat),this._spherical.setFromVector3(on),this.autoRotate&&this.state===Ct.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=En:n>Math.PI&&(n-=En),r<-Math.PI?r+=En:r>Math.PI&&(r-=En),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=o!=this._spherical.radius}if(on.setFromSpherical(this._spherical),on.applyQuaternion(this._quatInverse),t.copy(this.target).add(on),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=on.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),s=!!l}else if(this.object.isOrthographicCamera){let a=new I(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=l!==this.object.zoom;let c=new I(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=on.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(bc.origin.copy(this.object.position),bc.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(bc.direction))<I_?this.object.lookAt(this.target):(lm.setFromNormalAndCoplanarPoint(this.object.up,this.target),bc.intersectPlane(lm,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>Rh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Rh||this._lastTargetPosition.distanceToSquared(this.target)>Rh?(this.dispatchEvent(am),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?En/60*this.autoRotateSpeed*e:En/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){on.setFromMatrixColumn(t,0),on.multiplyScalar(-e),this._panOffset.add(on)}_panUp(e,t){this.screenSpacePanning===!0?on.setFromMatrixColumn(t,1):(on.setFromMatrixColumn(t,0),on.crossVectors(this.object.up,on)),on.multiplyScalar(e),this._panOffset.add(on)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;on.copy(r).sub(this.target);let s=on.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*s/n.clientHeight,this.object.matrix),this._panUp(2*t*s/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),r=e-n.left,s=t-n.top,o=n.width,a=n.height;this._mouse.x=r/o*2-1,this._mouse.y=-(s/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(En*this._rotateDelta.x/t.clientHeight),this._rotateUp(En*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-En*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(n,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(n*n+r*r);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),r=.5*(e.pageX+n.x),s=.5*(e.pageY+n.y);this._rotateEnd.set(r,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(En*this._rotateDelta.x/t.clientHeight),this._rotateUp(En*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,r=e.pageY-t.y,s=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new me,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function D_(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function L_(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function N_(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(cm),this.state=Ct.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function F_(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case ir.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=Ct.DOLLY;break;case ir.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Ct.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Ct.ROTATE}break;case ir.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Ct.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Ct.PAN}break;default:this.state=Ct.NONE}this.state!==Ct.NONE&&this.dispatchEvent(Ph)}function U_(i){switch(this.state){case Ct.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case Ct.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case Ct.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function O_(i){this.enabled===!1||this.enableZoom===!1||this.state!==Ct.NONE||(i.preventDefault(),this.dispatchEvent(Ph),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(cm))}function B_(i){this.enabled!==!1&&this._handleKeyDown(i)}function k_(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case rr.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=Ct.TOUCH_ROTATE;break;case rr.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=Ct.TOUCH_PAN;break;default:this.state=Ct.NONE}break;case 2:switch(this.touches.TWO){case rr.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=Ct.TOUCH_DOLLY_PAN;break;case rr.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=Ct.TOUCH_DOLLY_ROTATE;break;default:this.state=Ct.NONE}break;default:this.state=Ct.NONE}this.state!==Ct.NONE&&this.dispatchEvent(Ph)}function z_(i){switch(this._trackPointer(i),this.state){case Ct.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case Ct.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case Ct.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case Ct.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=Ct.NONE}}function V_(i){this.enabled!==!1&&i.preventDefault()}function G_(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function H_(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function yt(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),r=new Set(Object.keys(i[0].morphAttributes)),s={},o={},a=i[0].morphTargetsRelative,l=new it,c=0;for(let u=0;u<i.length;++u){let h=i[u],d=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in h.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;s[f]===void 0&&(s[f]=[]),s[f].push(h.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in h.morphAttributes){if(!r.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(h.morphAttributes[f])}if(e){let f;if(t)f=h.index.count;else if(h.attributes.position!==void 0)f=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,u),c+=f}}if(t){let u=0,h=[];for(let d=0;d<i.length;++d){let f=i[d].index;for(let p=0;p<f.count;++p)h.push(f.getX(p)+u);u+=i[d].attributes.position.count}l.setIndex(h)}for(let u in s){let h=um(s[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let d=0;d<h;++d){let f=[];for(let y=0;y<o[u].length;++y)f.push(o[u][y][d]);let p=um(f);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(p)}}}return l}function um(i){let e,t,n,r=-1,s=0;for(let c=0;c<i.length;++c){let u=i[c];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.count*t}let o=new e(s),a=new tt(o,t,n),l=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute){let h=l/t;for(let d=0,f=u.count;d<f;d++)for(let p=0;p<t;p++){let y=u.getComponent(d,p);a.setComponent(d+h,p,y)}}else o.set(u.array,l);l+=u.count*t}return r!==void 0&&(a.gpuType=r),a}function _c(i,e=1e-4){e=Math.max(e,Number.EPSILON);let t={},n=i.getIndex(),r=i.getAttribute("position"),s=n?n.count:r.count,o=0,a=Object.keys(i.attributes),l={},c={},u=[],h=["getX","getY","getZ","getW"],d=["setX","setY","setZ","setW"];for(let _=0,M=a.length;_<M;_++){let v=a[_],T=i.attributes[v];l[v]=new T.constructor(new T.array.constructor(T.count*T.itemSize),T.itemSize,T.normalized);let b=i.morphAttributes[v];b&&(c[v]||(c[v]=[]),b.forEach((w,x)=>{let S=new w.array.constructor(w.count*w.itemSize);c[v][x]=new w.constructor(S,w.itemSize,w.normalized)}))}let f=e*.5,p=Math.log10(1/e),y=Math.pow(10,p),m=f*y;for(let _=0;_<s;_++){let M=n?n.getX(_):_,v="";for(let T=0,b=a.length;T<b;T++){let w=a[T],x=i.getAttribute(w),S=x.itemSize;for(let E=0;E<S;E++)v+=`${Math.trunc(x[h[E]](M)*y+m)},`}if(v in t)u.push(t[v]);else{for(let T=0,b=a.length;T<b;T++){let w=a[T],x=i.getAttribute(w),S=i.morphAttributes[w],E=x.itemSize,R=l[w],A=c[w];for(let P=0;P<E;P++){let D=h[P],F=d[P];if(R[F](o,x[D](M)),S)for(let z=0,L=S.length;z<L;z++)A[z][F](o,S[z][D](M))}}t[v]=o,u.push(o),o++}}let g=i.clone();for(let _ in i.attributes){let M=l[_];if(g.setAttribute(_,new M.constructor(M.array.slice(0,o*M.itemSize),M.itemSize,M.normalized)),_ in c)for(let v=0;v<c[_].length;v++){let T=c[_][v];g.morphAttributes[_][v]=new T.constructor(T.array.slice(0,o*T.itemSize),T.itemSize,T.normalized)}}return g.setIndex(u),g}function Ih(i,e){if(e===sh)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Ds||e===Xo){let t=i.getIndex();if(t===null){let s=[],o=i.getAttribute("position");if(o!==void 0){for(let a=0;a<o.count;a++)s.push(a);i.setIndex(s),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,r=[];if(e===Ds)for(let s=1;s<=n;s++)r.push(t.getX(0)),r.push(t.getX(s)),r.push(t.getX(s+1));else for(let s=0;s<n;s++)s%2===0?(r.push(t.getX(s)),r.push(t.getX(s+1)),r.push(t.getX(s+2))):(r.push(t.getX(s+2)),r.push(t.getX(s+1)),r.push(t.getX(s)));return r.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),i.setIndex(r),i.clearGroups(),i}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}var vn={assetId:"m52-piston-reference-v1",boreMm:84,referenceDiameterMm:83.97,compressionHeightMm:31.82,overallHeightMm:51.8,pinDiameterMm:22,pinLengthMm:56,illustrativeCrownClearanceMm:9};var ze=[-250,-150,-50,50,150,250];function Mc(i){return{mechanical:i==="cutaway",extras:i!=="flow",housing:i!=="flow",closedHousing:i==="closed",cutHousing:i==="cutaway",media:i!=="closed",pipes:i!=="flow",combustion:i!=="closed",floor:i!=="flow"}}var Dh=[{id:"air",name:"Luft",color:3637247},{id:"fuel",name:"Benzin",color:15517045},{id:"exhaust",name:"Abgas",color:15573369},{id:"water",name:"Wasser",color:7715041},{id:"oil",name:"\xD6l",color:13219193}];function $o(i){return{pipe:i==="solid"||i==="transparent",flow:i!=="off",opacity:i==="transparent"?.16:1}}function Tc(i,e,t,n){let r=im(i,e,t,n),s=ze[e-1];return{piston:[s,-r.pistonY,0],pin:[s,-r.crankY,r.crankX],rotation:Math.atan2(r.crankX,-r.crankY)}}function Qo(i){let e=i.engine.strokeMm/2,t=i.engine.rodMm+e+vn.compressionHeightMm+vn.illustrativeCrownClearanceMm;return{deck:t,headOffset:t-205,boreScale:i.engine.boreMm/84,crankRadius:e}}function hm(i){let e=Number.isFinite(i)?Math.max(0,Math.min(32,i)):0,t=215,n=249-e;return{bottom:t,top:n,center:(t+n)/2,length:n-t}}function dm(i,e,t,n){let r=Fi(i?{valveCurves:i}:null,2*(Math.PI-n),e);return 12+(t===0?r?.intakeLiftMm??0:r?.exhaustLiftMm??0)}function Bs(i,e,t,n,r,s){if(!n)return 0;if(i==="water"){if(n.thermalHalted||n.rpm!==void 0&&n.rpm<5)return 0;let l=r.cooling.flowLMin,c=Math.max(0,Math.min(l,n.radiatorFlowLMin??0));return t==="expansion-vent"||t==="expansion-return"?0:t.startsWith("radiator")?c:t==="bypass"?l-c:l}if(i==="oil")return(n.rpm??0)>5?1:0;if((n.rpm??0)<5)return 0;let a=(e?[e]:i==="exhaust"&&t.endsWith("-front")?[1,2,3]:i==="exhaust"&&t.endsWith("-rear")?[4,5,6]:[1,2,3,4,5,6]).map(l=>Jo(n,s,l,!0));return i==="fuel"?n.ignition?a.reduce((l,c)=>l+Math.max(0,c?.intakeMolS??0),0):0:a.reduce((l,c)=>l+(i==="air"?c?.intakeMolS??0:c?.exhaustMolS??0),0)}function Nr(i,e,t){let n=Jo(i,e,t,!0),r=(i?.rpm??0)>5,s=r&&i?.ignition!==!1&&!!n?.burning,o=i?.cycles?.find(p=>p.cylinder===t)??(i?.cycle?.cylinder===t?i.cycle:void 0),a=0;if(s&&o?.samples.length){let p=o.samples,y=p.length,m=Wt(e,Ht*2)/(Ht*2)*y,g=Math.floor(m),_=0,M=0;for(;_<y-1&&p[Wt(g-_-1,y)]?.[6];)_++;for(;M<y-_-1&&p[(g+M+1)%y]?.[6];)M++;a=Math.max(.02,Math.min(1,(_+(m-g))/(_+M+1)))}let l=n?Math.max(0,Math.min(1,(n.gasTemperatureK-400)/1900)):0,c=n?Math.max(0,Math.min(1,(n.pressureKpa-100)/4200)):0,u=r?Math.max(0,n?.intakeMolS??0):0,h=r?Math.max(0,n?.exhaustMolS??0):0,d=!1;if(!s&&o?.samples.length){let p=o.samples,y=p.length,m=Math.floor(Wt(e,Ht*2)/(Ht*2)*y);for(let g=1;g<y;g++){let _=p[Wt(m-g,y)];if(!_)break;if(_[6]){d=!0;break}if(_[2]>.05||_[3]>.05||_[4]>1e-6||_[5]>1e-6)break}}let f=s?a<.16?"kernel":"front":h>1e-6?"exhaust":u>1e-6?"intake":r&&l>.15&&d?"expansion":r&&n?"compression":"idle";return{available:!!n,burning:s,progress:a,heat:l,pressure:c,intake:u,exhaust:h,stage:f}}function Ui(i=0){let e=(v,T,b)=>[v,T+i,b],t=[0,.8,-.6],n=e(-12,91,-250),r=v=>n.map((T,b)=>T+t[b]*v),s=ze.map(v=>e(v,151,-224)),o=ze.map((v,T)=>{let b=Math.sign(v),w=v*1.055+(Math.abs(v)<100?b*22:0);return[s[T],e(w,161,-262),e(w,211,-276),e(v*1.025,246,-226),e(v,249,-154),e(v,234,-103),e(v,226,-78)]}),a=e(0,142,-296),l=r(24),c=r(-24),u=[l,r(39),e(-10,139,-289),a],h=[-1,1].map(v=>[e(v*240,142,-296),e(v*275,126,-280),e(v*279,133,-250),e(v*265,151,-224),e(v*250,151,-224)]),d=[[-286,-250,-150,-50,-18],[18,50,150,250,286]].map(v=>v.map(T=>e(T,151,-224))),f=[e(-50,151,-224),e(0,151,-224),e(50,151,-224)],p=e(-352,143,-295),y=[e(-314,143,-295),e(-234,111,-326),e(-123,64,-321),e(-46,47,-260),r(-42),c],m=y[2],g=e(-66,66,-286),_=e(-39,103,-258),M=ze.map(v=>e(v,239,-96));return{headOffset:i,throttle:n,throttleAxis:t,throttleInlet:c,throttleOutlet:l,plenumFeed:a,plenumFront:e(-280,122,-296),plenumRear:e(280,122,-296),disa:e(0,151,-329),disaPivot:e(0,151,-224),intakeMouth:e(-551,83,-295),airboxLower:e(-470,90,-295),airboxUpper:e(-450,130,-295),airboxOutlet:e(-390,143,-295),maf:p,intakeBoot:y,intakePorts:ze.map(v=>e(v,226,-78)),injection:ze.map(v=>e(v,223,-95)),intakeHeadPaths:ze.map(v=>[-17,17].map(T=>[e(v,223,-49),e(v+T*.55,218,-35),e(v+T,207,-23)])),resonance:a,runnerNodes:s,runners:o,feeds:h,galleries:d,coupling:f,feed:u,idleTap:m,idleInlet:g,idleValve:_,idleDistribution:M}}function fm(i=0,e=0){let t=Ui(i),n=(s,o,a)=>[s,o+i,a],r=[{id:"resonance",coords:[-286,-264,-144,0,144,264,286].map(s=>n(s,142,-296-e/2)),width:27,height:30+e/2,section:"moulded",axis:"x",capStart:!0,capEnd:!0},...t.galleries.map((s,o)=>({id:`gallery-${o}`,coords:s,width:30,height:31,section:"moulded",axis:"x",capStart:!0,capEnd:!0,group:o})),{id:"inlet",coords:t.feed,width:34,height:34,section:"round"},{id:"coupling",coords:t.coupling,width:23,height:25,section:"moulded",axis:"x"}];return t.feeds.forEach((s,o)=>r.push({id:`resonance-feed-${o}`,coords:s,width:26,height:27,section:"moulded",group:o})),t.runners.forEach((s,o)=>r.push({id:`runner-${o+1}`,coords:s,width:29,height:23,rootWidth:36,section:"port",cylinder:o+1,group:o<3?0:1})),r}function Sc(i=0,e=!1){let t=Ui(i),n=[],r=(o,a,l,c,u)=>n.push({medium:"air",coords:o,radius:a,branch:l,cylinder:c,intakeGroup:u,internal:!0,flowFactor:1});r([t.intakeMouth,t.airboxLower,t.airboxUpper,t.airboxOutlet,t.maf,...t.intakeBoot,t.throttle,...t.feed],24,"main");for(let o of[0,1]){let a=o===0?-1:1,l=o===0?[0,1,2]:[5,4,3];r([t.resonance,...[96,192].map(c=>[a*c,t.resonance[1],t.resonance[2]]),...t.feeds[o],...l.slice(1).map(c=>t.runnerNodes[c])],23,`intake-${o===0?"front":"rear"}`,void 0,o)}for(let o=0;o<6;o++){r([...t.runners[o].slice(0,-1),t.injection[o],t.intakePorts[o],t.intakeHeadPaths[o][0][0]],14,"runner",o+1,o<3?0:1);for(let a=0;a<2;a++)r(t.intakeHeadPaths[o][a],9,a===0?"head-intake-left":"head-intake-right",o+1,o<3?0:1),n.at(-1).flowFactor=.5}let s=t.idleDistribution;r([t.idleTap,t.idleInlet,t.idleValve,s[2]],7,"idle-supply");for(let o=0;o<6;o++)r([s[2],...s.slice(Math.min(o,2),Math.max(o,2)+1).sort((a,l)=>o<2?l[0]-a[0]:a[0]-l[0]),[ze[o],225+i,-65],t.intakeHeadPaths[o][0][0]],2.7,"idle",o+1,o<3?0:1);e&&(r(t.coupling,17,"disa-coupling"),n.at(-1).bidirectional=!0);for(let o of n)o.coords=o.coords.filter((a,l,c)=>!l||a.some((u,h)=>u!==c[l-1][h]));return n}var wc=2.75,ea={x:24,y:-20};function ks(i=0){let e=Ui(i),t=(a,l,c)=>[a,l+i,c],n=ze.map(a=>t(a+ea.x,206,-112)),r=ze.map(a=>t(a+ea.x,206,-86)),s=t(-39,122,-232),o=ze.map((a,l)=>[n[l],t(a+24,206,-102),t(a+24,206,-94),r[l],t(a+24,206,-78),t(a+20,207,-49),e.intakeHeadPaths[l][1].at(-1)]);return{idleTap:e.idleTap,idleInlet:e.idleInlet,idleValve:e.idleValve,idleEntry:s,idleDistribution:n,idlePorts:r,idleHeadPaths:o}}function pm(i,e=0){let t=ks(e),n=t.idleDistribution,r=(o,a,l)=>({medium:"air",coords:o.filter((c,u,h)=>!u||c.some((d,f)=>d!==h[u-1][f])),radius:a==="idle-supply"?7:wc,branch:a,cylinder:l,intakeGroup:l===void 0?void 0:l<=3?0:1,internal:!0,flowFactor:1}),s=i.filter(o=>o.branch!=="idle"&&o.branch!=="idle-supply");s.push(r([t.idleTap,t.idleInlet,t.idleValve,t.idleEntry,n[2]],"idle-supply"));for(let o=0;o<6;o++){let a=o<2?-1:1,l=[n[2]];for(let c=2+a;o<2?c>=o:c<=o;c+=a)l.push(n[c]);s.push(r([...l,...t.idleHeadPaths[o]],"idle",o+1))}return s}var Ge=Object.freeze({x:-580,y:63,z:-30,coreWidth:650,coreHeight:438,coreDepth:32,tankWidth:28,fanRadius:210,fanX:-552,upper:[-540,235,-369],lower:[-540,-105,309],expansionTop:[-555,218,-420],expansionBottom:[-555,139,-420]});function cn(i=0){let e=(c,u,h)=>[c,u+i,h],t=ze.map(c=>[-17,17].map(u=>[e(c+u,207,23),e(c+u*.55,218,35),e(c,223,49)])),n=[[1012,-61,190],[1012,-61,264]],r=[e(-160,166,178),e(160,166,178)],s=[e(-160,153,178),e(160,153,178)],o=[e(-160,17,178),e(160,17,178)],a=s.map((c,u)=>c.map((h,d)=>(h+o[u][d])/2)),l=[[o[0],[-160,-26,178],[-124,-61,190],[330,-61,190],[445,-61,190]],[o[1],[160,-26,204],[225,-61,264],[350,-61,264],[445,-61,264]]];return{...Ui(i),...ks(i),exhaustPorts:ze.map(c=>e(c,226,78)),exhaustHeadPaths:t,exhaustCollectors:r,catalysts:a,catalystInlets:s,catalystOutlets:o,exhaustDownpipes:l,exhaustBankNodes:[[445,-61,190],[445,-61,264]],middleSilencers:[[475,-61,190],[475,-61,264]],rearSilencers:[[878,-61,190],[878,-61,264]],tails:n,exhaustMerge:[445,-61,227],middleSilencer:[475,-61,227],rearSilencer:[878,-61,227],tail:n[0],pump:[-344,63,-30],thermostat:e(-326,194,-45),radiatorUpper:[...Ge.upper],radiatorLower:[...Ge.lower],expansionTop:[...Ge.expansionTop],expansionBottom:[...Ge.expansionBottom],sump:[0,-70,0],bounds:{min:[-640,-160,-445],max:[1039,342+i,340]}}}function zn(i=0){let e=[],t=cn(i),n=(m,g,_,M,v="main",T=!1,b=1)=>e.push({medium:m,coords:g,radius:_,cylinder:M,branch:v,internal:T,flowFactor:b}),r=(m,g,_)=>[m,g+i,_],s=Ui(i),o=ks(i);e.push(...Sc(i).filter(m=>!m.branch.startsWith("idle")&&m.branch!=="disa-coupling")),e.push(...rm(o,s.coupling));let a=ze.map(m=>r(m-7,258,-130));n("fuel",[[-365,115,-130],r(-349,258,-130),r(-280,258,-130),...a,r(285,258,-130)],4.5);for(let m=0;m<ze.length;m++){let g=ze[m];n("fuel",[a[m],r(g-7,243,-117),t.injection[m]],2,m+1,"injector",!0)}for(let m=0;m<ze.length;m++){let g=ze[m],_=t.exhaustCollectors[m<3?0:1];for(let v=0;v<2;v++)n("exhaust",t.exhaustHeadPaths[m][v],9,m+1,v===0?"head-exhaust-left":"head-exhaust-right",!0,.5);let M=m<3?-150:150;n("exhaust",[t.exhaustHeadPaths[m][0].at(-1),t.exhaustPorts[m],r(g,220,108),r(g,213,135),r(g,205,173),r(M+(g-M)*.56,201,186),r(_[0]+(g-M)*.2,192,174),_],13,m+1,"header",!0)}for(let m=0;m<2;m++){let g=t.exhaustCollectors[m],_=t.catalysts[m],M=t.exhaustBankNodes[m][2],v=m===0?"front":"rear";n("exhaust",[g,t.catalystInlets[m],_,...t.exhaustDownpipes[m]],19,void 0,`collector-${v}`);let T=[t.rearSilencers[m][0]+75,-61,M];n("exhaust",[t.exhaustBankNodes[m],t.middleSilencers[m],[629,-61,M],t.rearSilencers[m],T],20,void 0,`main-${v}`),n("exhaust",[T,t.tails[m]],20,void 0,`tail-${v}`,!0)}let l=t.pump,c=t.thermostat,u=ze.map(m=>[m,82,-52]),h=ze.map(m=>r(m,194,-52));n("water",[l,[-294,82,-52],...u],6,void 0,"main",!0);for(let m=0;m<ze.length;m++){let g=ze[m];n("water",[u[m],[g,110,-53],r(g,155,-53),h[m]],5,void 0,"jacket",!0)}n("water",[...[...h].reverse(),r(-294,194,-52),c],6,void 0,"main",!0),n("water",[c,r(-352,194,-51),r(-388,211,-95),[-414,238,-245],[-440,235,-369],t.radiatorUpper],10,void 0,"radiator",!0),n("water",[t.radiatorUpper,[-580,235,-369],[-580,235,309],[-580,-105,309],t.radiatorLower],5,void 0,"radiator-core",!0),n("water",[t.radiatorLower,[-440,-105,309],[-422,-91,245],[-398,-58,148],[-366,5,78],[-344,63,-8],l],10,void 0,"radiator-return",!0),n("water",[c,r(-350,160,-28),[-350,95,-28],l],6,void 0,"bypass",!0),n("water",[c,r(-354,219,-91),[-397,243,-230],[-436,244,-391],t.expansionTop],2,void 0,"expansion-vent",!0),n("water",[t.expansionBottom,[-475,121,-420],[-448,95,-410],[-415,82,-350],[-379,79,-240],[-350,77,-104],l],3,void 0,"expansion-return",!0);let d=t.sump,f=[-295,6,-64],p=r(-295,279,0),y=ze.map(m=>[m,6,-64]);n("oil",[d,[-265,-70,-45],[-295,-39,-64],f],3,void 0,"pickup",!0),n("oil",[f,...y],3,void 0,"gallery",!0);for(let m=0;m<ze.length;m++){let g=ze[m];n("oil",[y[m],[g,6,-36],[g,0,0]],2.2,void 0,"bearing",!0)}n("oil",[f,[-310,80,-64],r(-310,225,-64),p],3,void 0,"head-feed",!0);for(let m of[-23,23]){let g=r(-295,279,m),_=r(295,279,m);n("oil",[p,g],2.2,void 0,"head-split",!0),n("oil",[g,...ze.map(M=>r(M,279,m)),_],2.2,void 0,"cam-gallery",!0),n("oil",[_,r(310,230,m<0?-50:50),[315,40,m<0?-64:64],[280,-53,m<0?-40:40],d],2.2,void 0,"return",!0)}return e}var Lh="surface-r5-1",W_={"cast-aluminium":{frequency:1.15,relief:.022,roughness:.035,machining:0},"machined-metal":{frequency:1.8,relief:.007,roughness:.018,machining:1},"black-plastic":{frequency:2.1,relief:.008,roughness:.02,machining:0}},Nh=new WeakMap,X_=`
varying vec3 vEngineSurfacePosition;
float engineSurfaceHash(vec3 p) {
  p = fract(p * .1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float engineSurfaceNoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(engineSurfaceHash(i), engineSurfaceHash(i + vec3(1,0,0)), f.x),
                 mix(engineSurfaceHash(i + vec3(0,1,0)), engineSurfaceHash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(engineSurfaceHash(i + vec3(0,0,1)), engineSurfaceHash(i + vec3(1,0,1)), f.x),
                 mix(engineSurfaceHash(i + vec3(0,1,1)), engineSurfaceHash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
vec3 engineSurfaceNormal(vec3 viewPosition, vec3 baseNormal, float height, float faceDirection) {
  vec3 dx = dFdx(viewPosition), dy = dFdy(viewPosition);
  vec3 r1 = cross(dy, baseNormal), r2 = cross(baseNormal, dx);
  float determinant = dot(dx, r1) * faceDirection;
  vec3 gradient = sign(determinant) * (dFdx(height) * r1 + dFdy(height) * r2);
  return normalize(max(abs(determinant), 1e-12) * baseNormal - gradient);
}
`;function q_(i){let e=i.userData.engineSurface?.profile;return e==="cast-aluminium"||e==="machined-metal"||e==="black-plastic"?e:null}function Fh(i){if(!(i instanceof _t))return i;let e=q_(i);if(!e||Nh.has(i))return i;let t={compile:i.onBeforeCompile,key:i.customProgramCacheKey};return Nh.set(i,t),i.userData.engineSurfaceDetail={revision:Lh,kind:e,coordinates:"object-mm",textures:0},i.onBeforeCompile=function(n,r){if(t.compile.call(this,n,r),this.normalMap||this.bumpMap)return;let s=W_[e],o=[["vertexShader","#include <common>"],["vertexShader","#include <begin_vertex>"],["fragmentShader","#include <common>"],["fragmentShader","#include <roughnessmap_fragment>"],["fragmentShader","#include <normal_fragment_maps>"]];for(let[a,l]of o)if(!n[a].includes(l))throw new Error(`${Lh}: missing Three shader marker ${l}`);n.vertexShader=n.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vEngineSurfacePosition;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vEngineSurfacePosition = position;`),n.fragmentShader=n.fragmentShader.replace("#include <common>",`#include <common>
`+X_).replace("#include <roughnessmap_fragment>",`
        #include <roughnessmap_fragment>
        vec3 engineSurfaceP = vEngineSurfacePosition * ${s.frequency.toFixed(4)};
        float engineSurfaceFootprint = max(length(dFdx(engineSurfaceP)), length(dFdy(engineSurfaceP)));
        float engineSurfaceFilter = 1.0 - smoothstep(.28, .95, engineSurfaceFootprint);
        float engineSurfaceGrain = (engineSurfaceNoise(engineSurfaceP) - .5) * 2.0;
        float engineSurfaceLines = sin(6.2831853 * (engineSurfaceP.x + .07 * engineSurfaceP.y));
        float engineSurfaceLineFilter = 1.0 - smoothstep(.15, .48, engineSurfaceFootprint);
        float engineSurfaceDetail = mix(engineSurfaceGrain * engineSurfaceFilter,
          engineSurfaceLines * engineSurfaceLineFilter, ${s.machining.toFixed(1)});
        roughnessFactor = clamp(roughnessFactor + engineSurfaceDetail * ${s.roughness.toFixed(4)}, .08, 1.0);
        float engineSurfaceHeight = engineSurfaceDetail * ${s.relief.toFixed(4)};
      `).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
normal = engineSurfaceNormal(-vViewPosition, normal, engineSurfaceHeight, faceDirection);`)},i.customProgramCacheKey=function(){return`${t.key.call(this)}|${Lh}:${e}:maps=${!!this.normalMap||!!this.bumpMap}`},i.needsUpdate=!0,i}function Ac(i){let e=i.clone(),t=Nh.get(i);return t&&(e.onBeforeCompile=t.compile,e.customProgramCacheKey=t.key),Fh(e)}var K_={"cast-aluminium":{metalness:[.64,.72],roughness:[.6,.76],reflection:.88},"machined-metal":{metalness:[.72,.9],roughness:[.28,.44],reflection:1},"exhaust-metal":{metalness:[.48,.7],roughness:[.56,.9],reflection:.82},"black-plastic":{metalness:[0,0],roughness:[.56,.9],reflection:.48},rubber:{metalness:[0,0],roughness:[.9,.98],reflection:.3}};function Y_(i,e,t){return i===7636364?"cast-aluminium":i===1187363||i===1580577?"rubber":Math.max(i>>16&255,i>>8&255,i&255)<=64&&e<=.25?t>=.92?"rubber":"black-plastic":t>=.56&&(i===16777215&&e>=.3||i===6511957||i===6115912)?"exhaust-metal":e>=.6?"machined-metal":"authored"}function zs(i,e=.5,t=.4,n=Y_(i,e,t)){let r=n==="authored"?null:K_[n],s=We.clamp(e,0,1),o=We.clamp(t,0,1),a=new _t({color:i,metalness:r?We.clamp(s,...r.metalness):s,roughness:r?We.clamp(o,...r.roughness):o}),l=r?.reflection??.55+.5*s;return a.envMapIntensity=l,a.userData.engineSurface={profile:n,reflection:l,revision:"detail-light-r3"},Fh(a)}function ur(i){let e=We.clamp(i,0,1);return e*e*(3-2*e)}function Ec(i,e=16){if(i.computeBoundingBox(),i.boundingBox.max.z<=e)return i.clone();if(i.boundingBox.min.z>e){let a=new it;for(let[l,c]of Object.entries(i.attributes))a.setAttribute(l,new Ke([],c.itemSize));return a.computeBoundingSphere(),a}let t=i.index?i.toNonIndexed():i.clone(),n=Object.entries(t.attributes),r=new Map(n.map(([a])=>[a,[]])),s=t.getAttribute("position");for(let a=0;a<s.count;a+=3){let l=[0,1,2].map(u=>Object.fromEntries(n.map(([h,d])=>[h,Array.from({length:d.itemSize},(f,p)=>d.array[(a+u)*d.itemSize+p])]))),c=[];for(let u=0;u<3;u++){let h=l[u],d=l[(u+1)%3],f=h.position[2]<=e,p=d.position[2]<=e;if(f&&c.push(h),f!==p){let y=(e-h.position[2])/(d.position[2]-h.position[2]);c.push(Object.fromEntries(n.map(([m])=>[m,h[m].map((g,_)=>g+(d[m][_]-g)*y)])))}}for(let u=1;u+1<c.length;u++)for(let h of[c[0],c[u],c[u+1]])for(let[d]of n)r.get(d).push(...h[d])}let o=new it;for(let[a,l]of n)o.setAttribute(a,new Ke(r.get(a),l.itemSize));return o.computeBoundingSphere(),t.dispose(),o}function Uh(i,e,t,n,r,s=5){let o=e[0]-i[0],a=e[1]-i[1],l=Math.hypot(o,a),c=Math.sign(i[2])||1;if(l<1||t<=0||n<=0||s<=0)throw new Error("Ung\xFCltiger Gussrippenquerschnitt");let u=a/l,h=-o/l,d=o/l,f=a/l,p=t/2,y=new je,m=Math.min(t*.4,2.5),g=-l/2,_=l/2;y.moveTo(-p+m,g),y.lineTo(p-m,g),y.quadraticCurveTo(p,g,p,g+m);for(let b=g+m+6;b<_-m;b+=6)y.lineTo(p,b);y.lineTo(p,_-m),y.quadraticCurveTo(p,_,p-m,_),y.lineTo(-p+m,_),y.quadraticCurveTo(-p,_,-p,_-m);for(let b=_-m-6;b>g+m;b-=6)y.lineTo(-p,b);y.lineTo(-p,g+m),y.quadraticCurveTo(-p,g,-p+m,g),y.closePath();let M=new at(y,{depth:1,steps:14,bevelEnabled:!1,curveSegments:6}),v=M.getAttribute("position");for(let b=0;b<v.count;b++){let w=v.getX(b),x=v.getY(b)+l/2,S=We.clamp(x/l,0,1),E=i[0]+d*x,R=i[1]+f*x,A=c*(i[2]+(e[2]-i[2])*S)+n/2,P=Math.min(r(E,R)-.25,A-1.5),D=A-P,F=Math.pow(c<0?1-v.getZ(b):v.getZ(b),2),z=F*D,L=Math.min(s,D*.65),V=z<L?L-Math.sqrt(Math.max(0,L*L-(L-z)*(L-z))):0,k=ur(x/9)*ur((l-x)/9),W=w*(1+V/p*k);v.setXYZ(b,E+u*W,R+h*W,c*(P+z))}M.deleteAttribute("normal");let T=_c(M,1e-4);return M.dispose(),T.computeVertexNormals(),T.computeBoundingSphere(),T}var Ur=Math.PI*2;function Vs(i,e,t,n,r){let s=new je;return s.moveTo(i+r,e),s.lineTo(i+t-r,e),s.quadraticCurveTo(i+t,e,i+t,e+r),s.lineTo(i+t,e+n-r),s.quadraticCurveTo(i+t,e+n,i+t-r,e+n),s.lineTo(i+r,e+n),s.quadraticCurveTo(i,e+n,i,e+n-r),s.lineTo(i,e+r),s.quadraticCurveTo(i,e,i+r,e),s.closePath(),s}function hr(i,e,t,n){let r=new ht;r.absarc(e,t,n,0,Ur,!0),i.holes.push(r)}function Fr(i,e,t,n,r){let s=Vs(e,t,n,r,Math.min(n,r)*.42);i.holes.push(new ht(s.getPoints(10).reverse()))}function Cc(i,e){let t=new at(i,{depth:e,steps:1,bevelEnabled:!1,curveSegments:24});return t.applyMatrix4(new Ne().set(0,0,1,-e/2,1,0,0,0,0,1,0,0,0,0,0,1)),t}function Oh(i,e,t,n=1){let r=new at(i,{depth:t,steps:n,bevelEnabled:!1,curveSegments:32});return r.rotateX(Math.PI/2),r.translate(0,e+t,0),r}function mm({deck:i,boreScale:e,cutaway:t=!1,materials:n}){let r=new Ce;r.name="M54B30 Block nach Fotoreferenz";let s=zs(16777215,.45,.68,"cast-aluminium");s.vertexColors=!0;let o=new _t({color:5396826,metalness:.48,roughness:.42}),a=[],l=(x,S,E=0,R=0,A=0,P="")=>{if(S===s){let F=x.getAttribute("position"),z=new Float32Array(F.count*3),L=new Ie(10198681),V=new Ie;for(let k=0;k<F.count;k++){let W=F.getX(k)+E,J=F.getY(k)+R,oe=F.getZ(k)+A,re=Math.sin(W*1.71+J*2.23+oe*.93)*Math.sin(W*.81-J*1.37+oe*2.61);V.copy(L).multiplyScalar(.96+re*.045+.025*Math.sin(W*.033+J*.059)),V.toArray(z,k*3)}x.setAttribute("color",new tt(z,3))}let D=new Se(x,S);return D.position.set(E,R,A),D.name=P,r.add(D),P&&a.push(P),D},c=(x,S,E,R,A,P,D="y",F=32)=>{let z=l(new st(x,x,S,F),E,R,A,P);return D==="x"&&(z.rotation.z=Math.PI/2),D==="z"&&(z.rotation.x=Math.PI/2),z},u=(x,S,E,R)=>{let A=new I(...x),P=new I(...S),D=P.clone().sub(A),F=new at(Vs(-E/2,-D.length()/2,E,D.length(),Math.min(E*.4,2.5)),{depth:R,bevelEnabled:!0,bevelThickness:.7,bevelSize:.7,bevelSegments:2,curveSegments:6});F.translate(0,0,-R/2);let z=l(F,s);return z.position.copy(A.add(P).multiplyScalar(.5)),z.quaternion.setFromUnitVectors(new I(0,1,0),D.normalize()),z},h=(x,S,E,R,A,P)=>{let D=[[R,-P/2],[R,P/2],[A,P/2],[A,-P/2],[R,-P/2]],F=new jt(D.map(([z,L])=>new me(z,L)),28);return F.rotateX(Math.PI/2),l(F,s,x,S,E)},d=42*e,f=d+2.5,p=Math.max(77,f+30),y=Math.max(57,f+12),m=x=>p+13-19*ur((x-35)/65),g=x=>{let S=We.clamp((-98+Math.sqrt(Math.max(0,9604+56*(76-x))))/28,0,1);return p-19+8*S-3*S*S},_=x=>{let S=new je;S.moveTo(-314,-p+7),S.quadraticCurveTo(-314,-p,-306,-p);for(let E=-300;E<=300;E+=5)S.lineTo(E,-p-5.5*Math.cos((E+250)/100*Ur)-34*Math.exp(-Math.pow((E+270)/31,4)));S.quadraticCurveTo(314,-p,314,-p+8),S.lineTo(314,p-8),S.quadraticCurveTo(314,p,306,p);for(let E=300;E>=-300;E-=5)S.lineTo(E,p+3.8*Math.cos((E+250)/100*Ur));S.quadraticCurveTo(-314,p,-314,p-8),S.closePath();for(let E of ze)if(hr(S,E,0,f),x)for(let R of[-1,1])for(let A of[-19,19]){let P=Vs(-12,-4,24,8,3),D=new ht(P.getPoints(10).reverse().map(F=>F.rotateAround(new me,R*Math.sign(A)*.32).add(new me(E+A,R*y))));S.holes.push(D)}Fr(S,-287,-103,32,28);for(let E=-300;E<=300;E+=100)for(let R of[-1,1])hr(S,E,R*(p-15),5.2);return S},M=Oh(_(!0),91,i-96,16),v=M.getAttribute("position");for(let x=0;x<v.count;x++){let S=v.getX(x),E=v.getY(x),R=v.getZ(x),A=We.clamp((Math.abs(R)-(p-7))/4,0,1),P=We.clamp((E-91)/(i-96),0,1),D=Math.sin(P*Math.PI)*(3+12*Math.cos((S+250)/100*Ur)),F=E-(1-P)*(1-P)*(9+12*Math.cos((S+250)/100*Ur)),z=(1-ur(P/.34))*ur((S+236)/16)*(1-ur((S-170)/15)),L=R+Math.sign(R)*A*D,V=Math.sign(R)*m(F);v.setZ(x,L+(V-L)*z*A),v.setY(x,F)}M.deleteAttribute("normal");let T=_c(M,1e-4);T.computeVertexNormals(),M.dispose(),l(T,s,0,0,0,"Geschwungener Aluminium Zylinderkasten"),l(Oh(_(!0),i-5,5),n.machined,0,0,0,"Bearbeitete Deckfl\xE4che und K\xFChlmantel\xF6ffnungen");for(let x of ze){let S=[[f,91],[f,i-.6],[f-.5,i],[d,i],[d,91]],E=new jt(S.map(([R,A])=>new me(R,A)),56);if(l(E,o,x,0,0,"Eingegossene Grauguss Laufbuchse"),t)for(let R of[-1,1]){let A=E.getAttribute("position"),P=S.length,D=[];for(let z=0;z<P;z++)for(let L=0;L<E.parameters.segments;L++){let V=L*P+z,k=V+P,W=A.getZ(V),J=A.getZ(k);if((W-16)*(J-16)>0||Math.abs(J-W)<1e-8)continue;let oe=(16-W)/(J-W),re=A.getX(V)+(A.getX(k)-A.getX(V))*oe;if(re*R>0){D.push(new me(re,A.getY(V)));break}}if(D.length!==P)throw new Error("Laufbuchsen-Schnittkontur ist unvollst\xE4ndig.");let F=new Ao(new je(D));F.translate(0,0,16),l(F,o,x,0,0,"Geschlossene Laufbuchsen-Schnittfl\xE4che")}}for(let x of[-1,1]){let S=new je;S.moveTo(94,x*(p-7)),S.lineTo(76,x*(p-1)),S.quadraticCurveTo(27,x*(p+3),-36,x*(p+4)),S.lineTo(-47,x*(p+7)),S.lineTo(-50,x*(p+5)),S.lineTo(-50,x*(p-8)),S.lineTo(-35,x*(p-11)),S.lineTo(43,x*(p-12)),S.lineTo(91,x*(p-18)),S.closePath(),l(Cc(S,628),s,0,0,-x*18,"Zur\xFCckliegende Kurbelgeh\xE4usewand hinter tiefen Gusstaschen");let E=Vs(-236,25,421,83,6);for(let L of[-218,-118,-18,82])Fr(E,L,75,35,18);for(let L of[-177,-77,23,123])Fr(E,L,40,12,20);let R=new at(E,{depth:16,bevelEnabled:!0,bevelSize:2.5,bevelThickness:2.5,bevelSegments:3,curveSegments:10}),A=R.getAttribute("position");for(let L=0;L<A.count;L++)A.setZ(L,A.getZ(L)-x*19*ur((A.getY(L)-35)/65));R.computeVertexNormals(),l(R,s,0,0,x<0?-p-13:p-3,"Breite Gussfelder mit tiefen Galerietaschen");let P=x*(p+10);for(let L of[-36,-7,24])u([-301,L,P],[282,L+(L===24?8:0),P],5.5,8);u([-300,25,P],[104,25,P],8,12),u([104,25,P],[296,40,P],9,12);let D=[[-296,-286,80],[-255,-249,39],[-212,-205,55],[-163,-158,88],[-112,-108,57],[-61,-58,83],[0,5,57],[55,60,89],[108,113,63],[172,180,85]];for(let[L,V,k]of D){let W=[L,-37,P],J=[V,Math.min(k,49),P];L===-163||L===55?l(Uh(W,J,9,18,(oe,re)=>g(re),5),s,0,0,0,"Auslaufender Hauptrippenfu\xDF"):u(W,J,6,18)}for(let[L,V]of[[-286,-34],[-207,-31],[-158,50],[-108,-34],[-58,51],[5,-33],[60,52],[113,-34],[180,-30]])h(L,V,x*(p+15),7.1,3.1,11);u([109,94,P],[298,i-28,x*(p+4)],12,12),u([172,51,P],[299,-33,P],11,12);for(let L of[-173,156])for(let V of[-23,23]){let k=[L+V,92,x*(p+3)],W=[L+V*.65,35,x*(p+15)];L===156?l(Uh(k,W,14,18,(J,oe)=>m(oe),5.5),s,0,0,0,"Weich angebundene Tr\xE4gerschulter"):u(k,W,14,18)}let F=Vs(-315,-p-13,630,13,3);for(let L=-295;L<=295;L+=59)hr(F,L,-p-6,2.8);let z=Oh(F,-50,5);x>0&&z.rotateY(Math.PI),l(z,n.machined);for(let L of[-173,156]){let V=Vs(L-29,41,58,30,5);for(let W of[-18,18])hr(V,L+W,56,4.2);let k=new at(V,{depth:13,bevelEnabled:!0,bevelSize:1,bevelThickness:1,bevelSegments:2,curveSegments:12});l(k,s,0,0,x<0?-p-24:p+11,"Motortr\xE4ger Auflage")}}for(let x of[-155,154])h(x,i-62,-p-28,14,4.6,20);h(-17,i-80,-p-6,8,3.1,10);let b=new je;b.moveTo(-307,137),b.lineTo(-253,137),b.quadraticCurveTo(-246,137,-246,128),b.lineTo(-233,104),b.lineTo(-227,70),b.quadraticCurveTo(-227,61,-239,61),b.lineTo(-277,61),b.lineTo(-281,79),b.lineTo(-295,79),b.lineTo(-298,113),b.lineTo(-307,117),b.closePath(),Fr(b,-296,117,40,11),Fr(b,-288,92,38,13),Fr(b,-271,70,33,12);for(let[x,S]of[[-300,129],[-253,129],[-289,84],[-236,69]])hr(b,x,S,3.4);l(new at(b,{depth:15,bevelEnabled:!0,bevelSize:1,bevelThickness:1,bevelSegments:2,curveSegments:20}),n.machined,0,0,-p-47,"Anschlussflansch an der Ansaugseite"),l(new kn(70,77),n.black,-269.5,99,-p-8).rotation.y=Math.PI;for(let x of[-208,-72,66,156]){let E=R=>-m(R)-1;for(let R of[-.65,.65])for(let A of[-15,-7.5,0,7.5,15]){let P=-11,D=11;R>0?(P=Math.max(P,(-17-A)/R),D=Math.min(D,(17-A)/R)):(P=Math.max(P,(17-A)/R),D=Math.min(D,(-17-A)/R)),D>P&&u([x+A+R*P,49+P,E(49+P)],[x+A+R*D,49+D,E(49+D)],1.1,1.8)}}for(let x of[-310,310]){let S=new je;x<0?(S.moveTo(-49,-p-7),S.lineTo(i,-p-7),S.lineTo(i,p-7),S.quadraticCurveTo(i-10,p+2,i-30,p+5),S.quadraticCurveTo(158,p+44,120,p+40),S.quadraticCurveTo(82,p+40,69,p+10),S.lineTo(49,p+8),S.lineTo(29,p-3),S.lineTo(-23,p+1),S.lineTo(-49,p+9)):(S.moveTo(-49,-p-12),S.lineTo(-18,-p-9),S.quadraticCurveTo(17,-p+3,46,-p+25),S.lineTo(123,-p+25),S.lineTo(131,-p-5),S.lineTo(i,-p-5),S.lineTo(i,p-5),S.lineTo(131,p-5),S.lineTo(123,p-25),S.lineTo(46,p-25),S.quadraticCurveTo(17,p-3,-18,p+9),S.lineTo(-49,p+12)),S.closePath(),hr(S,0,0,19),Fr(S,43,-29,25,31);for(let A of[-28,48,i-22])for(let P of[-p+11,p-11])hr(S,A,P,3.5);l(Cc(S,9),s,x,0,0,"Stirnfl\xE4che mit Kurbelwellen\xF6ffnung");let E=new je;E.absellipse(124,p+3,42,36,0,Ur,!1,0);let R=new ht;R.absellipse(124,p+3,34,28,0,Ur,!0,0),E.holes.push(R),x<0&&l(Cc(E,13),s,x,0,0,"Vorderer Stirnflansch mit Galerierand")}for(let x=0;x<7;x++){let S=new je;S.moveTo(-27,-65),S.lineTo(12,-65),S.quadraticCurveTo(55,-56,78,-47),S.lineTo(78,47),S.quadraticCurveTo(55,56,12,65),S.lineTo(-27,65),S.closePath(),hr(S,0,0,18),l(Cc(S,10),s,-300+x*100,0,0,"Hauptlagersteg")}r.userData={reference:"User reference ebay 178183100002, 16 inspected photos; dealer-assigned M54B30",featureNames:a,illustrative:!0,boreMm:d*2,cutaway:t,cutPlaneZ:t?16:null};let w=new Map;for(let x of r.children)if(x instanceof Se){let S=x.material,E=w.get(S)??[];E.push(x),w.set(S,E)}for(let[x,S]of w){if(S.length<2)continue;let E=S.map(P=>(P.updateMatrix(),(P.geometry.index?P.geometry.toNonIndexed():P.geometry.clone()).applyMatrix4(P.matrix))),R=yt(E);if(E.forEach(P=>P.dispose()),!R)throw new Error("Blockgeometrie konnte nicht geb\xFCndelt werden.");S.forEach(P=>{P.removeFromParent(),P.geometry.dispose()});let A=new Se(R,x);A.name=x===s?"Aluminium Gusskontur und Rippen":"Bearbeitete Blockfl\xE4chen",r.add(A)}if(t){for(let D of r.children)if(D instanceof Se){let F=D.geometry;D.geometry=Ec(F),F.dispose()}let x=Math.sqrt(f*f-256),S=[],E=-314;for(let D of ze)S.push([E,D-x]),E=D+x;S.push([E,314]);let R=S.filter(([D,F])=>F>D).map(([D,F])=>new ot(F-D,i-91,.7).toNonIndexed().translate((D+F)/2,(i+91)/2,16)),A=Math.sqrt(68);for(let D=0;D<7;D++)for(let[F,z]of[[-27,-A],[A,78]])R.push(new ot(10,z-F,.7).toNonIndexed().translate(-300+D*100,(F+z)/2,16));let P=yt(R);R.forEach(D=>D.dispose()),l(P,n.machined,0,0,0,"Bearbeitete Schnittkanten"),r.name="M54B30 gemeinsamer Gussblock im Schnitt"}return r}var Bh=2*Math.PI;function Oi(i,e,t,n,r){let s=new je;return s.moveTo(i+r,e),s.lineTo(i+t-r,e),s.quadraticCurveTo(i+t,e,i+t,e+r),s.lineTo(i+t,e+n-r),s.quadraticCurveTo(i+t,e+n,i+t-r,e+n),s.lineTo(i+r,e+n),s.quadraticCurveTo(i,e+n,i,e+n-r),s.lineTo(i,e+r),s.quadraticCurveTo(i,e,i+r,e),s.closePath(),s}function ta(i,e,t,n){let r=new ht;r.absarc(e,t,n,0,Bh,!0),i.holes.push(r)}function Bi(i,e,t,n=0){let r=new at(i,{depth:t,bevelEnabled:n>0,bevelSize:n,bevelThickness:n,bevelSegments:3,curveSegments:18});return r.rotateX(Math.PI/2),r.translate(0,e+t,0),r}function gm(i,e){let t=i,n=new Ce,r=new Ce,s=new Ce;n.name="M54B30 geformte Kopfabdeckung",r.name="M54B30 hohler Ventildeckel",s.name="M54B30 obere Z\xFCndspulenabdeckung",n.add(r,s);let o=(b,w,x=r,S=0,E=0,R=0,A="")=>{let P=new Se(b,w);return P.position.set(S,E,R),P.name=A,x.add(P),P},a=(b,w,x,S,E,R,A="y",P=r)=>{let D=o(new st(b,b,w,28),x,P,S,E,R);return A==="x"&&(D.rotation.z=Math.PI/2),D},l=[[256,-80],[301,-80],[319,-63],[323,-40],[309,-17],[306,-18],[320,-40],[316,-62],[300,-76],[256,-76]],c=[[256,68],[298,68],[315,53],[316,34],[309,14],[306,15],[313,35],[312,51],[297,64],[256,64]],u=[-347,-330,-300,-275,-240,-180,-100,0,100,200,270,302,315];for(let b of[l,c]){let w=[],x=[];for(let R of u){let A=We.clamp((-R-240)/100,0,1),P=We.clamp((R-230)/85,0,1);for(let[D,F]of b)w.push(R,D+t+A*3-P*2,F*(1+A*.08-P*.035))}let S=b.length;for(let R=0;R<u.length-1;R++)for(let A=0;A<S;A++){let P=R*S+A,D=R*S+(A+1)%S,F=(R+1)*S+A,z=(R+1)*S+(A+1)%S;x.push(...b===l?[P,D,F,D,z,F]:[P,F,D,D,F,z])}let E=new it;E.setAttribute("position",new Ke(w,3)),E.setAttribute("uv",new Ke(new Float32Array(w.length/3*2),2)),E.setIndex(x),E.computeVertexNormals(),o(E,e.black)}let h=Oi(-273,-18,562,35,7);for(let b of ze)ta(h,b,0,14);o(Bi(h,305+t,3),e.black);for(let b of ze){let w=new je;w.absarc(b,0,17,0,Bh,!1),ta(w,b,0,14),o(Bi(w,308+t,3),e.black)}o(Bi(Oi(-350,-84,79,158,18),322+t,4,1.6),e.black);for(let b of[-349,314]){let w=Oi(251+t,-76,b<0?72:63,145,15),x=new at(w,{depth:4,bevelEnabled:!0,bevelSize:1,bevelThickness:1,bevelSegments:2,curveSegments:16});x.applyMatrix4(new Ne().set(0,0,1,b-2,1,0,0,0,0,1,0,0,0,0,0,1)),o(x,e.black)}let d=()=>{let b=new je;b.moveTo(-351,-66),b.quadraticCurveTo(-351,-88,-327,-88),b.lineTo(-278,-88),b.lineTo(-256,-78),b.lineTo(293,-75),b.quadraticCurveTo(320,-75,320,-48),b.lineTo(320,44),b.quadraticCurveTo(320,72,294,72),b.lineTo(-262,72),b.lineTo(-280,80),b.lineTo(-327,80),b.quadraticCurveTo(-351,80,-351,55),b.closePath();let w=Oi(-344,-71,655,134,18);return b.holes.push(new ht(w.getPoints(18).reverse())),b};o(Bi(d(),254+t,2),e.rubber),o(Bi(d(),256+t,3),e.black);for(let[b,w]of[[-323,-82],[-220,-74],[-55,-74],[115,-73],[293,-61],[-325,74],[-218,67],[-55,67],[113,67],[291,60]])a(6.5,3,e.rubber,b,260+t,w),a(3.7,4,e.steel,b,263+t,w);let f=Oi(-274,-59,580,118,15);ta(f,-165,-38,20);for(let b of[-100,208])ta(f,b,14,5);o(Bi(f,329+t,3,1),e.black,s);let p=[-259,-240,-180,-100,0,100,200,230,270,291];for(let b of[-1,1]){let w=b*58,x=b*59,S=A=>{let P=We.clamp((-A-240)/100,0,1),D=We.clamp((A-230)/85,0,1),F=x/(1+P*.08-D*.035);return(b<0?319+(F+63)*4/23:315-(F-53)*17/15)+P*3-D*2+t},E=new je;E.moveTo(p[0],330+t);for(let A of p.slice(1))E.lineTo(A,330+t);for(let A of[...p].reverse())E.lineTo(A,S(A)-1.4);E.closePath();let R=new at(E,{depth:2,bevelEnabled:!1});o(R,e.black,s,0,0,w-1,"Seitliche Abdeckungslippe")}for(let b of[25,31,37,43])o(Bi(Oi(-224,b,475,1.8,.8),333.2+t,.65),e.machined,s);let y=new je;y.moveTo(-37,-13),y.lineTo(-37,10),y.lineTo(-27,10),y.quadraticCurveTo(-16,10,-19,1),y.quadraticCurveTo(-14,-13,-27,-13),y.closePath(),y.holes.push(new ht(Oi(-33,1,8,5,1).getPoints(8).reverse()),new ht(Oi(-33,-9,9,6,1).getPoints(8).reverse()));let m=b=>{let w=new je;return b.forEach(([x,S],E)=>E?w.lineTo(x,S):w.moveTo(x,S)),w.closePath(),w},g=m([[-12,-13],[-12,10],[-7,10],[0,-4],[7,10],[12,10],[12,-13],[8,-13],[8,3],[2,-9],[-2,-9],[-8,3],[-8,-13]]),_=m([[17,10],[22,10],[26,-5],[30,8],[34,8],[38,-5],[42,10],[47,10],[40,-13],[36,-13],[32,0],[28,-13],[24,-13]]);for(let b of[y,g,_])o(Bi(b,333+t,.8),e.machined,s);let M=new je;M.absarc(-165,-38,19,0,Bh,!1),ta(M,-165,-38,15),o(Bi(M,319+t,11),e.black),a(17.5,5,e.black,-165,332+t,-38),o(new ot(25,3,6),e.black,r,-165,336+t,-38);for(let b of[-100,208])a(5.3,1.8,e.black,b,334+t,14,"y",s);let v=Oi(246+t,-62,69,124,20),T=new at(v,{depth:7,bevelEnabled:!0,bevelSize:2,bevelThickness:2,bevelSegments:3,curveSegments:16});T.applyMatrix4(new Ne().set(0,0,1,-352,1,0,0,0,0,1,0,0,0,0,0,1)),o(T,e.cast);for(let b of[-23,23])a(19,22,e.cast,-361,279+t,b,"x"),a(13,4,e.machined,-373,279+t,b,"x");for(let b of[r,s]){let w=new Map;for(let x of b.children)if(x instanceof Se){let S=w.get(x.material)??[];S.push(x),w.set(x.material,S)}for(let[x,S]of w){if(S.length<2)continue;let E=S.map(A=>(A.updateMatrix(),(A.geometry.index?A.geometry.toNonIndexed():A.geometry.clone()).applyMatrix4(A.matrix))),R=yt(E);E.forEach(A=>A.dispose());for(let A of S)A.geometry.dispose(),A.removeFromParent();o(R,x,b)}}return n.userData={illustrative:!0,reference:"BMW 11121432928 original-part photographs and 11127526445 trim",oilFiller:[-165,332+t,-38],camCentres:[[-23,279+t],[23,279+t]],chainPlanes:[-333,-320],minimumInnerRoofY:304+t},{root:n,valveCover:r,coilCover:s,groups:[n,r,s]}}var pi=null,na=null,dr={status:"idle",reason:"not-started"},Q_="models/m54-r11-geometry-cache.bin.gz",fr=class extends Error{constructor(t,n){super(n);this.reason=t}reason};function Am(){return{...dr}}async function eM(){let i;try{i=await Promise.all([Promise.resolve().then(()=>(ym(),xm)),Promise.resolve().then(()=>(vm(),bm)),Promise.resolve().then(()=>(Mm(),_m)),Promise.resolve().then(()=>(Sm(),Tm))])}catch(e){throw new fr("source-load-error",e instanceof Error?e.message:String(e))}if(i.some(e=>typeof e.default!="string"))throw new fr("source-loader-invalid","Expected the four source files as raw text.");try{let e=new TextEncoder().encode(["186",...i.map(n=>n.default)].join("\0")),t=await crypto.subtle.digest("SHA-256",e);return Array.from(new Uint8Array(t),n=>n.toString(16).padStart(2,"0")).join("")}catch(e){throw new fr("source-hash-error",e instanceof Error?e.message:String(e))}}function wm(i,e,t){let n=i.type==="u16"?2:4;if(!["f32","u16","u32"].includes(i.type)||!Number.isInteger(i.offset)||i.offset<0||!Number.isInteger(i.length)||i.length<0||!Number.isInteger(i.itemSize)||i.itemSize<1||i.itemSize>4||i.length%i.itemSize!==0)throw new Error("Invalid geometry attribute");let r=t+i.offset,s=r+i.length*n;if(r%n!==0||s>e.byteLength)throw new Error("Geometry attribute outside cache");let o=i.type==="f32"?new Float32Array(e,r,i.length):i.type==="u16"?new Uint16Array(e,r,i.length):new Uint32Array(e,r,i.length);return new tt(o,i.itemSize,i.normalized)}function tM(i,e,t){let n;if(i.type==="PlaneGeometry"&&i.parameters){let r=i.parameters;n=new kn(r.width,r.height,r.widthSegments,r.heightSegments)}else if(i.type==="BufferGeometry")n=new it;else throw new Error("Unexpected geometry type");n.name=i.name;for(let r of Object.keys(n.attributes))n.deleteAttribute(r);for(let r of i.attributes)n.setAttribute(r.name,wm(r,e,t));i.index?n.setIndex(wm(i.index,e,t)):n.setIndex(null),n.clearGroups();for(let r of i.groups)n.addGroup(r.start,r.count,r.materialIndex);return n.setDrawRange(i.drawRange.start,i.drawRange.count??1/0),i.boundingBox&&(n.boundingBox=new ln(new I(...i.boundingBox.min),new I(...i.boundingBox.max))),i.boundingSphere&&(n.boundingSphere=new kt(new I(...i.boundingSphere.center),i.boundingSphere.radius)),n}function nM(i,e){try{if(i.byteLength<8||i.byteLength>8e7)return{ok:!1,reason:"asset-size-invalid"};let t=new DataView(i).getUint32(0,!0),n=4+t+3&-4;if(t<2||t>1e5||n>i.byteLength)return{ok:!1,reason:"asset-header-invalid"};let r=JSON.parse(new TextDecoder().decode(new Uint8Array(i,4,t)));if(r.format!=="m54-block-geometry-v1")return{ok:!1,reason:"asset-format-mismatch"};if(r.sourceDigest!==e)return{ok:!1,reason:"source-hash-mismatch",expectedDigest:r.sourceDigest,actualDigest:e};if(r.threeRevision!=="186")return{ok:!1,reason:"three-revision-mismatch"};if(!Number.isFinite(r.dimensions.deck)||!Number.isFinite(r.dimensions.boreScale))return{ok:!1,reason:"asset-dimensions-invalid"};let s=a=>a.nodes.map(l=>({node:l,geometry:tM(l.geometry,i,n)})),o={manifest:r,variants:{cut:s(r.variants.cut),closed:s(r.variants.closed)}};return iM(),pi=o,{ok:!0,reason:"ready"}}catch(t){return{ok:!1,reason:"asset-parse-error",message:t instanceof Error?t.message:String(t)}}}function Em(){return pi?(dr={status:"ready",reason:"already-loaded"},Promise.resolve(!0)):na||(dr={status:"loading",reason:"source-and-download"},na=(async()=>{let i=new AbortController,e=performance.now(),t={},n,r=(async()=>{try{if(typeof DecompressionStream>"u")return{ok:!1,reason:"decompression-unavailable"};if(!globalThis.crypto?.subtle)return{ok:!1,reason:"crypto-unavailable"};let o=eM().then(d=>(t.sourceMs=performance.now()-e,d)),a=fetch(`/demos/engine/${Q_}`,{signal:i.signal}).then(d=>(t.headersMs=performance.now()-e,t.httpStatus=d.status,d)).catch(d=>{throw new fr("download-error",d instanceof Error?d.message:String(d))}),[l,c]=await Promise.all([o,a]);if(!c.ok)return{ok:!1,reason:"http-error",message:`HTTP ${c.status}`};if(!c.body)return{ok:!1,reason:"download-empty"};let u=performance.now(),h;try{h=await new Response(c.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()}catch(d){throw new fr("transfer-or-decompression-error",d instanceof Error?d.message:String(d))}return t.transferAndDecompressMs=performance.now()-u,i.signal.aborted?{ok:!1,reason:"deadline"}:nM(h,l)}catch(o){return{ok:!1,reason:o instanceof fr?o.reason:"preload-error",message:o instanceof Error?o.message:String(o)}}})(),s=new Promise(o=>{n=setTimeout(()=>{i.abort(),o({ok:!1,reason:"deadline"})},12e3)});try{let o=await Promise.race([r,s]);return o.ok||i.abort(),dr={...t,status:o.ok?"ready":"fallback",reason:o.reason,elapsedMs:performance.now()-e,...o.expectedDigest?{expectedDigest:o.expectedDigest}:{},...o.actualDigest?{actualDigest:o.actualDigest}:{},...o.message?{message:o.message}:{}},o.ok}finally{clearTimeout(n)}})().finally(()=>{na=null}),na)}function Cm({deck:i,boreScale:e,cutaway:t=!1,materials:n}){if(!pi||i!==pi.manifest.dimensions.deck||e!==pi.manifest.dimensions.boreScale)return dr.geometryMisses=(dr.geometryMisses??0)+1,null;let r=t?"cut":"closed",s=pi.manifest.variants[r],o=new Ce;o.name=s.name,o.userData=JSON.parse(JSON.stringify(s.userData));let a=zs(16777215,.45,.68,"cast-aluminium");a.vertexColors=!0;let l=new _t({color:5396826,metalness:.48,roughness:.42}),c={...n,cast:a,iron:l};for(let{node:u,geometry:h}of pi.variants[r]){let d=new Se(h.clone(),c[u.material]);d.name=u.name,d.position.fromArray(u.position),d.quaternion.fromArray(u.quaternion),d.scale.fromArray(u.scale),d.visible=u.visible,o.add(d)}return dr.geometryHits=(dr.geometryHits??0)+1,o}function iM(){if(pi)for(let i of Object.values(pi.variants))for(let{geometry:e}of i)e.dispose();pi=null}var Gs=Math.PI*2;function Or(i,e,t,n,r){let s=new je;return s.moveTo(i+r,e),s.lineTo(i+t-r,e),s.quadraticCurveTo(i+t,e,i+t,e+r),s.lineTo(i+t,e+n-r),s.quadraticCurveTo(i+t,e+n,i+t-r,e+n),s.lineTo(i+r,e+n),s.quadraticCurveTo(i,e+n,i,e+n-r),s.lineTo(i,e+r),s.quadraticCurveTo(i,e,i+r,e),s.closePath(),s}function Br(i,e){let t=new at(i,{depth:e,steps:1,bevelEnabled:!1,curveSegments:16});return t.applyMatrix4(new Ne().set(0,0,1,-e/2,1,0,0,0,0,1,0,0,0,0,0,1)),t}function Rm(i,e){let t=new at(i,{depth:e,steps:1,bevelEnabled:!1,curveSegments:32});return t.rotateX(Math.PI/2),t.translate(0,e,0),t}function Cn(i,e,t,n){let r=new ht;r.absarc(e,t,n,0,Gs,!0),i.holes.push(r)}function Pm(i,e,t,n,r=12){let s=i.index?i.toNonIndexed():i,o=s.attributes,a=Object.keys(o),l={};for(let d of a)l[d]=[];let c=o.position,u=(d,f,p)=>{let y=d.reduce((g,_,M)=>g+c.getY(_)*f[M],0),m=d.reduce((g,_,M)=>g+c.getZ(_)*f[M],0);for(let g of a){let _=o[g],M=[];for(let v=0;v<_.itemSize;v++)M.push(d.reduce((T,b,w)=>T+_.getComponent(b,v)*f[w],0));if(g==="position"&&p&&(M[0]=e+t*n(y,m)),g==="normal"&&p){let T=(n(y+.05,m)-n(y-.05,m))/.1,b=(n(y,m+.05)-n(y,m-.05))/(2*.05),w=new I(t,-T,-b).normalize();M[0]=w.x,M[1]=w.y,M[2]=w.z}l[g].push(...M)}};for(let d=0;d<c.count;d+=3){let f=[d,d+1,d+2];if(!f.every(m=>Math.abs(c.getX(m)-e)<.002)){u(f,[1,0,0],!1),u(f,[0,1,0],!1),u(f,[0,0,1],!1);continue}let y=(m,g)=>u(f,[1-(m+g)/r,m/r,g/r],!0);for(let m=0;m<r;m++)for(let g=0;g<r-m;g++)y(m,g),y(m+1,g),y(m,g+1),m+g<r-1&&(y(m+1,g),y(m+1,g+1),y(m,g+1))}let h=new it;for(let d of a)h.setAttribute(d,new Ke(l[d],o[d].itemSize));return s!==i&&s.dispose(),i.dispose(),h}function rM(i,e){let t=i.children.find(h=>h instanceof Se&&h.name==="Aluminium Gusskontur und Rippen");if(!t||t.geometry.index)return;let n=t.geometry,r=n.getAttribute("position"),s=[],o=[];for(let h=0;h<r.count;h+=3){let d=[h,h+1,h+2];(d.every(p=>Math.abs(r.getX(p)-314.5)<.002)&&d.some(p=>r.getY(p)>138)?o:s).push(...d)}if(!o.length)return;let a=new it;for(let[h,d]of Object.entries(n.attributes)){let f=[];for(let p of o)for(let y=0;y<d.itemSize;y++)f.push(d.getComponent(p,y));a.setAttribute(h,new Ke(f,d.itemSize))}n.setIndex(s);let l=We.smoothstep,c=(h,d)=>{let f=l(h,138,150)*(1-l(h,e-8,e))*(1-l(Math.abs(d),50,68)),p=l(Math.hypot(h-(e-22),d-66),3.5,9)*l(Math.hypot(h-(e-22),d+66),3.5,9),y=5*Math.exp(-Math.pow((h-(e-23))/12,2)),m=5*Math.exp(-Math.pow((h-(e-45))/17,2))*Math.exp(-Math.pow(d/44,4)),g=1.5*Math.exp(-Math.pow((h-(e-35))/5,2));return f*p*(y+m-g)},u=new Se(Pm(a,314.5,1,c,8),t.material);u.name="Geformte hintere Blockstirnflaeche",i.add(u)}function Im({deck:i,headOffset:e,boreScale:t,materials:n}){let r=[],s=(K,H)=>{let B=new Ce;return B.name=K,r.push(B),H?.add(B),B},o=s("M54B30 Gussblock im Schnitt"),a=s("M54B30 Kopfkanaele im Schnitt"),l=s("Verschraubte Ansaug und Abgasflansche"),c=s("M54B30 geschlossene Aussenhuelle"),u=s("M54B30 vollstaendiger Gussblock",c),h=s("M54B30 geschlossener Kopf Ventildeckel DoppelVANOS",c),d=(K,H,B,Z=0,ne=0,te=0)=>{let ce=new Se(K,H);return ce.position.set(Z,ne,te),B.add(ce),ce},f=(K,H,B,Z,ne,te,ce,xe)=>d(new ot(H,B,Z),ne,K,te,ce,xe),p=(K,H,B,Z,ne,te,ce,xe="y",ve=24)=>{let Ae=d(new st(H,H,B,ve),Z,K,ne,te,ce);return xe==="x"&&(Ae.rotation.z=Math.PI/2),xe==="z"&&(Ae.rotation.x=Math.PI/2),Ae},y=(K,H,B,Z,ne,te,ce,xe="z")=>{let ve=d(new zt(H,B,6,28),Z,K,ne,te,ce);return xe==="x"&&(ve.rotation.y=Math.PI/2),xe==="y"&&(ve.rotation.x=Math.PI/2),ve},m=(K,H,B,Z,ne,te)=>{let ce=new I(...H),xe=new I(...B),ve=xe.clone().sub(ce),Ae=f(K,Z,ve.length(),ne,te,0,0,0);return Ae.position.copy(ce.add(xe).multiplyScalar(.5)),Ae.quaternion.setFromUnitVectors(new I(0,1,0),ve.normalize()),Ae},g=43.5*t,_=Math.max(70,g+24),M=Math.max(54,g+10),v=K=>{let H=new je;H.moveTo(-314,-_+7),H.quadraticCurveTo(-314,-_,-304,-_);for(let B=-300;B<=300;B+=5)H.lineTo(B,-_-3*Math.cos((B+250)/100*Gs));if(H.quadraticCurveTo(314,-_,314,-_+8),K){let Z=Math.sqrt(Math.max(1,g*g-256));H.lineTo(314,16);for(let ne of[...ze].reverse()){H.lineTo(ne+Z,16);let te=Math.asin(16/g),ce=-Math.PI-te;for(let xe=1;xe<=32;xe++){let ve=te+(ce-te)*xe/32;H.lineTo(ne+g*Math.cos(ve),g*Math.sin(ve))}}H.lineTo(-314,16),H.closePath()}else{H.lineTo(314,_-8),H.quadraticCurveTo(314,_,304,_);for(let B=300;B>=-300;B-=5)H.lineTo(B,_+3*Math.cos((B+250)/100*Gs));H.quadraticCurveTo(-314,_,-314,_-8),H.closePath();for(let B of ze)Cn(H,B,0,g)}for(let B of ze)Cn(H,B,-M,6.5);if(!K)for(let B of ze)Cn(H,B,M,6.5);return H},T=K=>Cm({deck:i,boreScale:t,cutaway:K,materials:n})??mm({deck:i,boreScale:t,cutaway:K,materials:n});o.add(T(!0));let b=T(!1);rM(b,i),u.add(b);let w=cn(e),x=226+e,S=256+e,E=(K,H,B,Z=0,ne=0,te=0,ce="")=>{if(K.translate(Z,ne,te),B===a){let ve=Ec(K);K.dispose(),K=ve}if(!K.getAttribute("position").count)return K.dispose(),null;let xe=d(K,H,B);return xe.name=ce,xe},R=(K,H)=>{let B=Or(-314,i+4,628,S-i-7,5);for(let te of ze)Cn(B,te,x,14.5);let Z=new at(B,{depth:8,steps:2,bevelEnabled:!0,bevelSize:1,bevelThickness:1,bevelSegments:2,curveSegments:24}),ne=Z.getAttribute("position");for(let te=0;te<ne.count;te++){let ce=ne.getX(te),xe=ne.getZ(te),ve=H<0?1-We.clamp(xe/8,0,1):We.clamp(xe/8,0,1),Ae=2.6*(.5-.5*Math.cos((ce+250)/100*Gs));ne.setZ(te,xe-H*Ae*ve)}Z.computeVertexNormals(),E(Z,n.cast,K,0,0,H<0?-76:68,"Geformtes Aluminium-Portband");for(let te of ze){let ce=Or(te-33,x-21,66,42,7);Cn(ce,te,x,14.5),E(new at(ce,{depth:1,bevelEnabled:!1,curveSegments:20}),n.machined,K,0,0,H<0?-78:77,"Bearbeiteter Kopf-Portanschluss")}};for(let K of[a,h]){R(K,-1),R(K,1),E(Rm(v(K===a),3),n.machined,K,0,i,0,"Kopfdeck mit offenen Brennraumachsen");let H=Or(-314,-77,628,154,11),B=Or(-302,-60,604,120,8);H.holes.push(new ht(B.getPoints(20).reverse())),E(Rm(H,3),n.machined,K,0,S-3,0,"Umlaufende Ventildeckel-Dichtfl\xE4che");for(let Z of K===a?[-309,309]:[-309])E(new ot(10,S-i-4,148),n.cast,K,Z,(i+4+S)/2,0,"Kopf-Stirnwand");for(let Z=0;Z<7;Z++)for(let ne of[-1,1]){let te=Or(-7,S,14,12,2);E(new at(te,{depth:23,bevelEnabled:!0,bevelSize:1,bevelThickness:1,bevelSegments:2}),n.cast,K,-300+Z*100,0,ne<0?-69:46,"Gussfu\xDF des Nockenwellentr\xE4gers")}}for(let K of[-309,309])f(a,10,S-i-4,.7,n.machined,K,(i+4+S)/2,16);a.userData={sectionPlaneZ:16,portY:x,seatY:S,illustrative:!0};for(let K=0;K<6;K++)for(let H of[-1,1]){let B=ze[K];if(H<0){let ne=Or(-32,-20,64,40,7);Cn(ne,0,0,14.5);for(let ce of[-25,25])Cn(ne,ce,0,3.4);let te=d(new at(ne,{depth:8,bevelEnabled:!1,curveSegments:20}),n.black,l,B,x,-85);te.name="Verschraubter Ansaugflansch";for(let ce of[-25,25])p(l,2.8,18,n.steel,B+ce,x,-83,"z",6),p(l,4.4,4,n.brass,B+ce,x,-90,"z",6)}let Z=H<0?w.intakeHeadPaths[K]:w.exhaustHeadPaths[K];for(let ne of Z){let te=[[B,x,H*78],[B,224+e,H*63],...ne],ce=new Ot(te.map(G=>new I(...G)),!1,"centripetal"),xe=new nn(ce,26,12,12,!1),ve=new nn(ce,26,9.3,12,!1),Ae=(G,nt=!1)=>{let Je=G.index,O=G.getAttribute("normal"),C=[];for(let j=0;j<Je.count;j+=3){let U=Je.getX(j),Y=Je.getX(j+1),ae=Je.getX(j+2);(O.getY(U)+O.getY(Y)+O.getY(ae))/3<.12&&C.push(U,nt?ae:Y,nt?Y:ae)}if(nt)for(let j=0;j<O.count;j++)O.setXYZ(j,-O.getX(j),-O.getY(j),-O.getZ(j));return G.setIndex(C),G};E(Ae(xe),n.cast,a),E(Ae(ve,!0),n.machined,a)}}let A=gm(e,n);h.add(A.root),r.push(...A.groups);for(let K of[...A.valveCover.children])K instanceof Se&&[n.cast,n.machined,n.steel].includes(K.material)&&h.add(K);let P=()=>{let K=new je;return K.moveTo(-31,-72),K.quadraticCurveTo(-33,-92,-18,-94),K.lineTo(16,-94),K.quadraticCurveTo(39,-95,59,-90),K.quadraticCurveTo(99,-101,130,-89),K.quadraticCurveTo(153,-84,163+e*.3,-71),K.lineTo(191+e,-56),K.lineTo(230+e,-56),K.quadraticCurveTo(245+e,-56,245+e,-43),K.lineTo(245+e,44),K.quadraticCurveTo(245+e,58,231+e,58),K.lineTo(191+e,58),K.quadraticCurveTo(172+e*.3,65,156,74),K.lineTo(70,85),K.quadraticCurveTo(52,90,31,86),K.lineTo(-18,82),K.quadraticCurveTo(-31,82,-31,67),K.closePath(),K},D=P();Cn(D,0,0,18),Cn(D,63,-30,24.5);let F=We.smoothstep,z=(K,H)=>{let B=F(K,-27,-13)*(1-F(K,225+e,242+e))*(1-F(Math.abs(H),46,62)),Z=F(Math.hypot(K,H),18,26),ne=F(Math.hypot(K-63,H+30),24.5,32),te=9*Math.exp(-Math.pow((K-128-e*.25)/68,2))*Math.exp(-Math.pow((H-10)/24,2)),ce=4*Math.exp(-Math.pow((Math.hypot(K,H)-27)/11,2)),xe=5*Math.exp(-Math.pow((Math.hypot(K-63,H+30)-35)/13,2)),ve=3*Math.exp(-Math.pow((K-192-e*.45)/6,2));return B*Z*ne*(te+ce+xe-ve)},L=d(Pm(Br(D,11),-5.5,-1,z,8),n.cast,h,-347.5,0,0);L.name="Geschlossene Steuertrieb Frontwand";let V=P(),k=107+e*.5,W=P().getPoints(24).map(K=>new me(k+(K.x-k)*.95,K.y*.91)).reverse();V.holes.push(new ht(W));let J=d(Br(V,27),n.cast,h,-328.5,0,0);J.name="Hohler Steuertrieb Gehaeuserand";for(let[K,H,B,Z]of[[0,0,23,18],[63,-30,30,24.5]]){let ne=new je;ne.absarc(K,H,B,0,Gs,!1),Cn(ne,K,H,Z);let te=d(Br(ne,2.2),n.machined,h,-354.6,0,0);te.name="Offener bearbeiteter Lagersitz am Kettenkasten"}for(let[K,H]of[[-20,-65],[-18,64],[31,-69],[39,68],[101,-69],[116,67],[170+e*.3,-55],[174+e*.3,55],[222+e,-50],[222+e,50]])p(h,3.3,6,n.steel,-355,K,H,"x",6);let oe=i+4,re=S-2,Te=re-oe,Ee=()=>{let K=new je;return K.moveTo(oe,-74),K.lineTo(oe,74),K.lineTo(oe+Te*.25,74),K.quadraticCurveTo(re-5,72,re,64),K.lineTo(re,-64),K.quadraticCurveTo(re-5,-72,oe+Te*.25,-74),K.closePath(),K},Re=d(Br(Ee(),4),n.cast,h,306,0,0);Re.name="Rueckwand Zylinderkopf Tragschicht";let se=Ee(),le=Or(oe+Te*.64,-46,Math.max(4,Te*.16),92,3);se.holes.push(new ht(le.getPoints(12).reverse()));for(let K of[-48,0,48])Cn(se,oe+Te*.31,K,5.8);let X=d(Br(se,6),n.cast,h,311,0,0);X.name="Profilierte Zylinderkopf Rueckseite";for(let K of[-48,0,48])p(h,5.5,2,n.machined,310,oe+Te*.31,K,"x");let q=new je;q.moveTo(-48,-68),q.lineTo(-48,68),q.lineTo(-30,65),q.quadraticCurveTo(10,67,38,46),q.quadraticCurveTo(61,27,61,0),q.quadraticCurveTo(61,-27,38,-46),q.quadraticCurveTo(10,-67,-30,-65),q.closePath(),Cn(q,0,0,45);for(let[K,H]of[[-38,-60],[-38,60],[4,-55],[4,55],[40,-35],[40,35]])Cn(q,K,H,3.1);let $=d(Br(q,.35),n.cast,u,314.15,0,0);$.name="Hinterer offener Kurbelwellendichttraeger";let pe=new je;return pe.absarc(0,0,48,0,Gs,!1),Cn(pe,0,0,45),d(Br(pe,.1),n.rubber,u,314.3,0,0).name="Hintere Kurbelwellendichtung",c.visible=!1,{cutBlock:o,cutHead:a,portMounts:l,closed:c,groups:r}}function Dm(i,e){let t=new Ce;t.name="Hohle Edelstahl Doppelendrohre";let n=e(11779779,.84,.26),r=e(14475747,.88,.22),s=e(1909542,.08,.94),o=[[[[20.8,-62],[20.8,-55],[22.9,-44],[24.7,-8],[24.7,-1.4]],n],[[[24.7,-1.4],[24.55,-.65],[24.1,-.12],[23.45,.08],[22.8,-.17],[22.35,-.68],[22.2,-1.4]],r],[[[22.2,-1.4],[22.2,-8],[18.3,-44],[18.3,-55],[18.3,-140]],s]];for(let a of i)for(let[l,c]of o){let u=new jt(l.map(([f,p])=>new me(f,p)),64);u.rotateZ(-Math.PI/2);let h=u.getAttribute("position");for(let f=0;f<h.count;f++){let p=h.getY(f)*.94,y=h.getZ(f)*1.08;h.setXYZ(f,h.getX(f)-p*.12,p,y)}u.computeVertexNormals();let d=new Se(u,c);d.position.fromArray(a),t.add(d)}return t}var Pc=class extends Se{constructor(e,t,n=!1,r=!1,s=1e4){let o=new it;super(o,t),this.isMarchingCubes=!0;let a=this,l=new Float32Array(36),c=new Float32Array(36),u=new Float32Array(36);this.enableUvs=n,this.enableColors=r,this.init=function(_){this.resolution=_,this.isolation=80,this.size=_,this.size2=this.size*this.size,this.size3=this.size2*this.size,this.halfsize=this.size/2,this.delta=2/this.size,this.yd=this.size,this.zd=this.size2,this.field=new Float32Array(this.size3),this.normal_cache=new Float32Array(this.size3*3),this.palette=new Float32Array(this.size3*3),this.count=0;let M=s*3;this.positionArray=new Float32Array(M*3);let v=new tt(this.positionArray,3);v.setUsage(tn),o.setAttribute("position",v),this.normalArray=new Float32Array(M*3);let T=new tt(this.normalArray,3);if(T.setUsage(tn),o.setAttribute("normal",T),this.enableUvs){this.uvArray=new Float32Array(M*2);let b=new tt(this.uvArray,2);b.setUsage(tn),o.setAttribute("uv",b)}if(this.enableColors){this.colorArray=new Float32Array(M*3);let b=new tt(this.colorArray,3);b.setUsage(tn),o.setAttribute("color",b)}o.boundingSphere=new kt(new I,1)};function h(_,M,v){return _+(M-_)*v}function d(_,M,v,T,b,w,x,S,E,R){let A=(v-x)/(S-x),P=a.normal_cache;l[M+0]=T+A*a.delta,l[M+1]=b,l[M+2]=w,c[M+0]=h(P[_+0],P[_+3],A),c[M+1]=h(P[_+1],P[_+4],A),c[M+2]=h(P[_+2],P[_+5],A),u[M+0]=h(a.palette[E*3+0],a.palette[R*3+0],A),u[M+1]=h(a.palette[E*3+1],a.palette[R*3+1],A),u[M+2]=h(a.palette[E*3+2],a.palette[R*3+2],A)}function f(_,M,v,T,b,w,x,S,E,R){let A=(v-x)/(S-x),P=a.normal_cache;l[M+0]=T,l[M+1]=b+A*a.delta,l[M+2]=w;let D=_+a.yd*3;c[M+0]=h(P[_+0],P[D+0],A),c[M+1]=h(P[_+1],P[D+1],A),c[M+2]=h(P[_+2],P[D+2],A),u[M+0]=h(a.palette[E*3+0],a.palette[R*3+0],A),u[M+1]=h(a.palette[E*3+1],a.palette[R*3+1],A),u[M+2]=h(a.palette[E*3+2],a.palette[R*3+2],A)}function p(_,M,v,T,b,w,x,S,E,R){let A=(v-x)/(S-x),P=a.normal_cache;l[M+0]=T,l[M+1]=b,l[M+2]=w+A*a.delta;let D=_+a.zd*3;c[M+0]=h(P[_+0],P[D+0],A),c[M+1]=h(P[_+1],P[D+1],A),c[M+2]=h(P[_+2],P[D+2],A),u[M+0]=h(a.palette[E*3+0],a.palette[R*3+0],A),u[M+1]=h(a.palette[E*3+1],a.palette[R*3+1],A),u[M+2]=h(a.palette[E*3+2],a.palette[R*3+2],A)}function y(_){let M=_*3;a.normal_cache[M]===0&&(a.normal_cache[M+0]=a.field[_-1]-a.field[_+1],a.normal_cache[M+1]=a.field[_-a.yd]-a.field[_+a.yd],a.normal_cache[M+2]=a.field[_-a.zd]-a.field[_+a.zd])}function m(_,M,v,T,b){let w=T+1,x=T+a.yd,S=T+a.zd,E=w+a.yd,R=w+a.zd,A=T+a.yd+a.zd,P=w+a.yd+a.zd,D=0,F=a.field[T],z=a.field[w],L=a.field[x],V=a.field[E],k=a.field[S],W=a.field[R],J=a.field[A],oe=a.field[P];F<b&&(D|=1),z<b&&(D|=2),L<b&&(D|=8),V<b&&(D|=4),k<b&&(D|=16),W<b&&(D|=32),J<b&&(D|=128),oe<b&&(D|=64);let re=sM[D];if(re===0)return 0;let Te=a.delta,Ee=_+Te,Re=M+Te,se=v+Te;re&1&&(y(T),y(w),d(T*3,0,b,_,M,v,F,z,T,w)),re&2&&(y(w),y(E),f(w*3,3,b,Ee,M,v,z,V,w,E)),re&4&&(y(x),y(E),d(x*3,6,b,_,Re,v,L,V,x,E)),re&8&&(y(T),y(x),f(T*3,9,b,_,M,v,F,L,T,x)),re&16&&(y(S),y(R),d(S*3,12,b,_,M,se,k,W,S,R)),re&32&&(y(R),y(P),f(R*3,15,b,Ee,M,se,W,oe,R,P)),re&64&&(y(A),y(P),d(A*3,18,b,_,Re,se,J,oe,A,P)),re&128&&(y(S),y(A),f(S*3,21,b,_,M,se,k,J,S,A)),re&256&&(y(T),y(S),p(T*3,24,b,_,M,v,F,k,T,S)),re&512&&(y(w),y(R),p(w*3,27,b,Ee,M,v,z,W,w,R)),re&1024&&(y(E),y(P),p(E*3,30,b,Ee,Re,v,V,oe,E,P)),re&2048&&(y(x),y(A),p(x*3,33,b,_,Re,v,L,J,x,A)),D<<=4;let le,X,q,$=0,pe=0;for(;Rc[D+pe]!=-1;)le=D+pe,X=le+1,q=le+2,g(l,c,u,3*Rc[le],3*Rc[X],3*Rc[q]),pe+=3,$++;return $}function g(_,M,v,T,b,w){let x=a.count*3;if(a.positionArray[x+0]=_[T],a.positionArray[x+1]=_[T+1],a.positionArray[x+2]=_[T+2],a.positionArray[x+3]=_[b],a.positionArray[x+4]=_[b+1],a.positionArray[x+5]=_[b+2],a.positionArray[x+6]=_[w],a.positionArray[x+7]=_[w+1],a.positionArray[x+8]=_[w+2],a.material.flatShading===!0){let S=(M[T+0]+M[b+0]+M[w+0])/3,E=(M[T+1]+M[b+1]+M[w+1])/3,R=(M[T+2]+M[b+2]+M[w+2])/3;a.normalArray[x+0]=S,a.normalArray[x+1]=E,a.normalArray[x+2]=R,a.normalArray[x+3]=S,a.normalArray[x+4]=E,a.normalArray[x+5]=R,a.normalArray[x+6]=S,a.normalArray[x+7]=E,a.normalArray[x+8]=R}else a.normalArray[x+0]=M[T+0],a.normalArray[x+1]=M[T+1],a.normalArray[x+2]=M[T+2],a.normalArray[x+3]=M[b+0],a.normalArray[x+4]=M[b+1],a.normalArray[x+5]=M[b+2],a.normalArray[x+6]=M[w+0],a.normalArray[x+7]=M[w+1],a.normalArray[x+8]=M[w+2];if(a.enableUvs){let S=a.count*2;a.uvArray[S+0]=_[T+0],a.uvArray[S+1]=_[T+2],a.uvArray[S+2]=_[b+0],a.uvArray[S+3]=_[b+2],a.uvArray[S+4]=_[w+0],a.uvArray[S+5]=_[w+2]}a.enableColors&&(a.colorArray[x+0]=v[T+0],a.colorArray[x+1]=v[T+1],a.colorArray[x+2]=v[T+2],a.colorArray[x+3]=v[b+0],a.colorArray[x+4]=v[b+1],a.colorArray[x+5]=v[b+2],a.colorArray[x+6]=v[w+0],a.colorArray[x+7]=v[w+1],a.colorArray[x+8]=v[w+2]),a.count+=3}this.addBall=function(_,M,v,T,b,w){let x=Math.sign(T);T=Math.abs(T);let S=w!=null,E=new Ie(_,M,v);if(S)try{E=w instanceof Ie?w:Array.isArray(w)?new Ie(Math.min(Math.abs(w[0]),1),Math.min(Math.abs(w[1]),1),Math.min(Math.abs(w[2]),1)):new Ie(w)}catch{E=new Ie(_,M,v)}let R=this.size*Math.sqrt(T/b),A=v*this.size,P=M*this.size,D=_*this.size,F=Math.floor(A-R);F<1&&(F=1);let z=Math.floor(A+R);z>this.size-1&&(z=this.size-1);let L=Math.floor(P-R);L<1&&(L=1);let V=Math.floor(P+R);V>this.size-1&&(V=this.size-1);let k=Math.floor(D-R);k<1&&(k=1);let W=Math.floor(D+R);W>this.size-1&&(W=this.size-1);let J,oe,re,Te,Ee,Re,se,le,X,q,$;for(re=F;re<z;re++)for(Ee=this.size2*re,le=re/this.size-v,X=le*le,oe=L;oe<V;oe++)for(Te=Ee+this.size*oe,se=oe/this.size-M,q=se*se,J=k;J<W;J++)if(Re=J/this.size-_,$=T/(1e-6+Re*Re+q+X)-b,$>0){this.field[Te+J]+=$*x;let pe=Math.sqrt((J-D)*(J-D)+(oe-P)*(oe-P)+(re-A)*(re-A))/R,K=1-pe*pe*pe*(pe*(pe*6-15)+10);this.palette[(Te+J)*3+0]+=E.r*K,this.palette[(Te+J)*3+1]+=E.g*K,this.palette[(Te+J)*3+2]+=E.b*K}},this.addPlaneX=function(_,M){let v=this.size,T=this.yd,b=this.zd,w=this.field,x,S,E,R,A,P,D,F=v*Math.sqrt(_/M);for(F>v&&(F=v),x=0;x<F;x++)if(P=x/v,R=P*P,A=_/(1e-4+R)-M,A>0)for(S=0;S<v;S++)for(D=x+S*T,E=0;E<v;E++)w[b*E+D]+=A},this.addPlaneY=function(_,M){let v=this.size,T=this.yd,b=this.zd,w=this.field,x,S,E,R,A,P,D,F,z=v*Math.sqrt(_/M);for(z>v&&(z=v),S=0;S<z;S++)if(P=S/v,R=P*P,A=_/(1e-4+R)-M,A>0)for(D=S*T,x=0;x<v;x++)for(F=D+x,E=0;E<v;E++)w[b*E+F]+=A},this.addPlaneZ=function(_,M){let v=this.size,T=this.yd,b=this.zd,w=this.field,x,S,E,R,A,P,D,F,z=v*Math.sqrt(_/M);for(z>v&&(z=v),E=0;E<z;E++)if(P=E/v,R=P*P,A=_/(1e-4+R)-M,A>0)for(D=b*E,S=0;S<v;S++)for(F=D+S*T,x=0;x<v;x++)w[F+x]+=A},this.setCell=function(_,M,v,T){let b=this.size2*v+this.size*M+_;this.field[b]=T},this.getCell=function(_,M,v){let T=this.size2*v+this.size*M+_;return this.field[T]},this.blur=function(_=1){let M=this.field,v=M.slice(),T=this.size,b=this.size2;for(let w=0;w<T;w++)for(let x=0;x<T;x++)for(let S=0;S<T;S++){let E=b*S+T*x+w,R=v[E],A=1;for(let P=-1;P<=1;P+=2){let D=P+w;if(!(D<0||D>=T))for(let F=-1;F<=1;F+=2){let z=F+x;if(!(z<0||z>=T))for(let L=-1;L<=1;L+=2){let V=L+S;if(V<0||V>=T)continue;let k=b*V+T*z+D,W=v[k];A++,R+=_*(W-R)/A}}}M[E]=R}},this.reset=function(){for(let _=0;_<this.size3;_++)this.normal_cache[_*3]=0,this.field[_]=0,this.palette[_*3]=this.palette[_*3+1]=this.palette[_*3+2]=0},this.update=function(){this.count=0;let _=this.size-2;for(let M=1;M<_;M++){let v=this.size2*M,T=(M-this.halfsize)/this.halfsize;for(let b=1;b<_;b++){let w=v+this.size*b,x=(b-this.halfsize)/this.halfsize;for(let S=1;S<_;S++){let E=(S-this.halfsize)/this.halfsize,R=w+S;m(E,x,T,R,this.isolation)}}}this.geometry.setDrawRange(0,this.count),o.getAttribute("position").needsUpdate=!0,o.getAttribute("normal").needsUpdate=!0,this.enableUvs&&(o.getAttribute("uv").needsUpdate=!0),this.enableColors&&(o.getAttribute("color").needsUpdate=!0),this.count/3>s&&console.warn("THREE.MarchingCubes: Geometry buffers too small for rendering. Please create an instance with a higher poly count.")},this.init(e)}},sM=new Int32Array([0,265,515,778,1030,1295,1541,1804,2060,2309,2575,2822,3082,3331,3593,3840,400,153,915,666,1430,1183,1941,1692,2460,2197,2975,2710,3482,3219,3993,3728,560,825,51,314,1590,1855,1077,1340,2620,2869,2111,2358,3642,3891,3129,3376,928,681,419,170,1958,1711,1445,1196,2988,2725,2479,2214,4010,3747,3497,3232,1120,1385,1635,1898,102,367,613,876,3180,3429,3695,3942,2154,2403,2665,2912,1520,1273,2035,1786,502,255,1013,764,3580,3317,4095,3830,2554,2291,3065,2800,1616,1881,1107,1370,598,863,85,348,3676,3925,3167,3414,2650,2899,2137,2384,1984,1737,1475,1226,966,719,453,204,4044,3781,3535,3270,3018,2755,2505,2240,2240,2505,2755,3018,3270,3535,3781,4044,204,453,719,966,1226,1475,1737,1984,2384,2137,2899,2650,3414,3167,3925,3676,348,85,863,598,1370,1107,1881,1616,2800,3065,2291,2554,3830,4095,3317,3580,764,1013,255,502,1786,2035,1273,1520,2912,2665,2403,2154,3942,3695,3429,3180,876,613,367,102,1898,1635,1385,1120,3232,3497,3747,4010,2214,2479,2725,2988,1196,1445,1711,1958,170,419,681,928,3376,3129,3891,3642,2358,2111,2869,2620,1340,1077,1855,1590,314,51,825,560,3728,3993,3219,3482,2710,2975,2197,2460,1692,1941,1183,1430,666,915,153,400,3840,3593,3331,3082,2822,2575,2309,2060,1804,1541,1295,1030,778,515,265,0]),Rc=new Int32Array([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,8,3,9,8,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,2,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,3,1,2,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,2,10,0,2,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,8,3,2,10,8,10,9,8,-1,-1,-1,-1,-1,-1,-1,3,11,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,11,2,8,11,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,9,0,2,3,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,11,2,1,9,11,9,8,11,-1,-1,-1,-1,-1,-1,-1,3,10,1,11,10,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,10,1,0,8,10,8,11,10,-1,-1,-1,-1,-1,-1,-1,3,9,0,3,11,9,11,10,9,-1,-1,-1,-1,-1,-1,-1,9,8,10,10,8,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,7,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,3,0,7,3,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,9,8,4,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,1,9,4,7,1,7,3,1,-1,-1,-1,-1,-1,-1,-1,1,2,10,8,4,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,4,7,3,0,4,1,2,10,-1,-1,-1,-1,-1,-1,-1,9,2,10,9,0,2,8,4,7,-1,-1,-1,-1,-1,-1,-1,2,10,9,2,9,7,2,7,3,7,9,4,-1,-1,-1,-1,8,4,7,3,11,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,4,7,11,2,4,2,0,4,-1,-1,-1,-1,-1,-1,-1,9,0,1,8,4,7,2,3,11,-1,-1,-1,-1,-1,-1,-1,4,7,11,9,4,11,9,11,2,9,2,1,-1,-1,-1,-1,3,10,1,3,11,10,7,8,4,-1,-1,-1,-1,-1,-1,-1,1,11,10,1,4,11,1,0,4,7,11,4,-1,-1,-1,-1,4,7,8,9,0,11,9,11,10,11,0,3,-1,-1,-1,-1,4,7,11,4,11,9,9,11,10,-1,-1,-1,-1,-1,-1,-1,9,5,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,5,4,0,8,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,5,4,1,5,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,5,4,8,3,5,3,1,5,-1,-1,-1,-1,-1,-1,-1,1,2,10,9,5,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,8,1,2,10,4,9,5,-1,-1,-1,-1,-1,-1,-1,5,2,10,5,4,2,4,0,2,-1,-1,-1,-1,-1,-1,-1,2,10,5,3,2,5,3,5,4,3,4,8,-1,-1,-1,-1,9,5,4,2,3,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,11,2,0,8,11,4,9,5,-1,-1,-1,-1,-1,-1,-1,0,5,4,0,1,5,2,3,11,-1,-1,-1,-1,-1,-1,-1,2,1,5,2,5,8,2,8,11,4,8,5,-1,-1,-1,-1,10,3,11,10,1,3,9,5,4,-1,-1,-1,-1,-1,-1,-1,4,9,5,0,8,1,8,10,1,8,11,10,-1,-1,-1,-1,5,4,0,5,0,11,5,11,10,11,0,3,-1,-1,-1,-1,5,4,8,5,8,10,10,8,11,-1,-1,-1,-1,-1,-1,-1,9,7,8,5,7,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,3,0,9,5,3,5,7,3,-1,-1,-1,-1,-1,-1,-1,0,7,8,0,1,7,1,5,7,-1,-1,-1,-1,-1,-1,-1,1,5,3,3,5,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,7,8,9,5,7,10,1,2,-1,-1,-1,-1,-1,-1,-1,10,1,2,9,5,0,5,3,0,5,7,3,-1,-1,-1,-1,8,0,2,8,2,5,8,5,7,10,5,2,-1,-1,-1,-1,2,10,5,2,5,3,3,5,7,-1,-1,-1,-1,-1,-1,-1,7,9,5,7,8,9,3,11,2,-1,-1,-1,-1,-1,-1,-1,9,5,7,9,7,2,9,2,0,2,7,11,-1,-1,-1,-1,2,3,11,0,1,8,1,7,8,1,5,7,-1,-1,-1,-1,11,2,1,11,1,7,7,1,5,-1,-1,-1,-1,-1,-1,-1,9,5,8,8,5,7,10,1,3,10,3,11,-1,-1,-1,-1,5,7,0,5,0,9,7,11,0,1,0,10,11,10,0,-1,11,10,0,11,0,3,10,5,0,8,0,7,5,7,0,-1,11,10,5,7,11,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,10,6,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,3,5,10,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,0,1,5,10,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,8,3,1,9,8,5,10,6,-1,-1,-1,-1,-1,-1,-1,1,6,5,2,6,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,6,5,1,2,6,3,0,8,-1,-1,-1,-1,-1,-1,-1,9,6,5,9,0,6,0,2,6,-1,-1,-1,-1,-1,-1,-1,5,9,8,5,8,2,5,2,6,3,2,8,-1,-1,-1,-1,2,3,11,10,6,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,0,8,11,2,0,10,6,5,-1,-1,-1,-1,-1,-1,-1,0,1,9,2,3,11,5,10,6,-1,-1,-1,-1,-1,-1,-1,5,10,6,1,9,2,9,11,2,9,8,11,-1,-1,-1,-1,6,3,11,6,5,3,5,1,3,-1,-1,-1,-1,-1,-1,-1,0,8,11,0,11,5,0,5,1,5,11,6,-1,-1,-1,-1,3,11,6,0,3,6,0,6,5,0,5,9,-1,-1,-1,-1,6,5,9,6,9,11,11,9,8,-1,-1,-1,-1,-1,-1,-1,5,10,6,4,7,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,3,0,4,7,3,6,5,10,-1,-1,-1,-1,-1,-1,-1,1,9,0,5,10,6,8,4,7,-1,-1,-1,-1,-1,-1,-1,10,6,5,1,9,7,1,7,3,7,9,4,-1,-1,-1,-1,6,1,2,6,5,1,4,7,8,-1,-1,-1,-1,-1,-1,-1,1,2,5,5,2,6,3,0,4,3,4,7,-1,-1,-1,-1,8,4,7,9,0,5,0,6,5,0,2,6,-1,-1,-1,-1,7,3,9,7,9,4,3,2,9,5,9,6,2,6,9,-1,3,11,2,7,8,4,10,6,5,-1,-1,-1,-1,-1,-1,-1,5,10,6,4,7,2,4,2,0,2,7,11,-1,-1,-1,-1,0,1,9,4,7,8,2,3,11,5,10,6,-1,-1,-1,-1,9,2,1,9,11,2,9,4,11,7,11,4,5,10,6,-1,8,4,7,3,11,5,3,5,1,5,11,6,-1,-1,-1,-1,5,1,11,5,11,6,1,0,11,7,11,4,0,4,11,-1,0,5,9,0,6,5,0,3,6,11,6,3,8,4,7,-1,6,5,9,6,9,11,4,7,9,7,11,9,-1,-1,-1,-1,10,4,9,6,4,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,10,6,4,9,10,0,8,3,-1,-1,-1,-1,-1,-1,-1,10,0,1,10,6,0,6,4,0,-1,-1,-1,-1,-1,-1,-1,8,3,1,8,1,6,8,6,4,6,1,10,-1,-1,-1,-1,1,4,9,1,2,4,2,6,4,-1,-1,-1,-1,-1,-1,-1,3,0,8,1,2,9,2,4,9,2,6,4,-1,-1,-1,-1,0,2,4,4,2,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,3,2,8,2,4,4,2,6,-1,-1,-1,-1,-1,-1,-1,10,4,9,10,6,4,11,2,3,-1,-1,-1,-1,-1,-1,-1,0,8,2,2,8,11,4,9,10,4,10,6,-1,-1,-1,-1,3,11,2,0,1,6,0,6,4,6,1,10,-1,-1,-1,-1,6,4,1,6,1,10,4,8,1,2,1,11,8,11,1,-1,9,6,4,9,3,6,9,1,3,11,6,3,-1,-1,-1,-1,8,11,1,8,1,0,11,6,1,9,1,4,6,4,1,-1,3,11,6,3,6,0,0,6,4,-1,-1,-1,-1,-1,-1,-1,6,4,8,11,6,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,10,6,7,8,10,8,9,10,-1,-1,-1,-1,-1,-1,-1,0,7,3,0,10,7,0,9,10,6,7,10,-1,-1,-1,-1,10,6,7,1,10,7,1,7,8,1,8,0,-1,-1,-1,-1,10,6,7,10,7,1,1,7,3,-1,-1,-1,-1,-1,-1,-1,1,2,6,1,6,8,1,8,9,8,6,7,-1,-1,-1,-1,2,6,9,2,9,1,6,7,9,0,9,3,7,3,9,-1,7,8,0,7,0,6,6,0,2,-1,-1,-1,-1,-1,-1,-1,7,3,2,6,7,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,11,10,6,8,10,8,9,8,6,7,-1,-1,-1,-1,2,0,7,2,7,11,0,9,7,6,7,10,9,10,7,-1,1,8,0,1,7,8,1,10,7,6,7,10,2,3,11,-1,11,2,1,11,1,7,10,6,1,6,7,1,-1,-1,-1,-1,8,9,6,8,6,7,9,1,6,11,6,3,1,3,6,-1,0,9,1,11,6,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,8,0,7,0,6,3,11,0,11,6,0,-1,-1,-1,-1,7,11,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,6,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,8,11,7,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,1,9,11,7,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,1,9,8,3,1,11,7,6,-1,-1,-1,-1,-1,-1,-1,10,1,2,6,11,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,2,10,3,0,8,6,11,7,-1,-1,-1,-1,-1,-1,-1,2,9,0,2,10,9,6,11,7,-1,-1,-1,-1,-1,-1,-1,6,11,7,2,10,3,10,8,3,10,9,8,-1,-1,-1,-1,7,2,3,6,2,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,0,8,7,6,0,6,2,0,-1,-1,-1,-1,-1,-1,-1,2,7,6,2,3,7,0,1,9,-1,-1,-1,-1,-1,-1,-1,1,6,2,1,8,6,1,9,8,8,7,6,-1,-1,-1,-1,10,7,6,10,1,7,1,3,7,-1,-1,-1,-1,-1,-1,-1,10,7,6,1,7,10,1,8,7,1,0,8,-1,-1,-1,-1,0,3,7,0,7,10,0,10,9,6,10,7,-1,-1,-1,-1,7,6,10,7,10,8,8,10,9,-1,-1,-1,-1,-1,-1,-1,6,8,4,11,8,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,6,11,3,0,6,0,4,6,-1,-1,-1,-1,-1,-1,-1,8,6,11,8,4,6,9,0,1,-1,-1,-1,-1,-1,-1,-1,9,4,6,9,6,3,9,3,1,11,3,6,-1,-1,-1,-1,6,8,4,6,11,8,2,10,1,-1,-1,-1,-1,-1,-1,-1,1,2,10,3,0,11,0,6,11,0,4,6,-1,-1,-1,-1,4,11,8,4,6,11,0,2,9,2,10,9,-1,-1,-1,-1,10,9,3,10,3,2,9,4,3,11,3,6,4,6,3,-1,8,2,3,8,4,2,4,6,2,-1,-1,-1,-1,-1,-1,-1,0,4,2,4,6,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,9,0,2,3,4,2,4,6,4,3,8,-1,-1,-1,-1,1,9,4,1,4,2,2,4,6,-1,-1,-1,-1,-1,-1,-1,8,1,3,8,6,1,8,4,6,6,10,1,-1,-1,-1,-1,10,1,0,10,0,6,6,0,4,-1,-1,-1,-1,-1,-1,-1,4,6,3,4,3,8,6,10,3,0,3,9,10,9,3,-1,10,9,4,6,10,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,9,5,7,6,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,3,4,9,5,11,7,6,-1,-1,-1,-1,-1,-1,-1,5,0,1,5,4,0,7,6,11,-1,-1,-1,-1,-1,-1,-1,11,7,6,8,3,4,3,5,4,3,1,5,-1,-1,-1,-1,9,5,4,10,1,2,7,6,11,-1,-1,-1,-1,-1,-1,-1,6,11,7,1,2,10,0,8,3,4,9,5,-1,-1,-1,-1,7,6,11,5,4,10,4,2,10,4,0,2,-1,-1,-1,-1,3,4,8,3,5,4,3,2,5,10,5,2,11,7,6,-1,7,2,3,7,6,2,5,4,9,-1,-1,-1,-1,-1,-1,-1,9,5,4,0,8,6,0,6,2,6,8,7,-1,-1,-1,-1,3,6,2,3,7,6,1,5,0,5,4,0,-1,-1,-1,-1,6,2,8,6,8,7,2,1,8,4,8,5,1,5,8,-1,9,5,4,10,1,6,1,7,6,1,3,7,-1,-1,-1,-1,1,6,10,1,7,6,1,0,7,8,7,0,9,5,4,-1,4,0,10,4,10,5,0,3,10,6,10,7,3,7,10,-1,7,6,10,7,10,8,5,4,10,4,8,10,-1,-1,-1,-1,6,9,5,6,11,9,11,8,9,-1,-1,-1,-1,-1,-1,-1,3,6,11,0,6,3,0,5,6,0,9,5,-1,-1,-1,-1,0,11,8,0,5,11,0,1,5,5,6,11,-1,-1,-1,-1,6,11,3,6,3,5,5,3,1,-1,-1,-1,-1,-1,-1,-1,1,2,10,9,5,11,9,11,8,11,5,6,-1,-1,-1,-1,0,11,3,0,6,11,0,9,6,5,6,9,1,2,10,-1,11,8,5,11,5,6,8,0,5,10,5,2,0,2,5,-1,6,11,3,6,3,5,2,10,3,10,5,3,-1,-1,-1,-1,5,8,9,5,2,8,5,6,2,3,8,2,-1,-1,-1,-1,9,5,6,9,6,0,0,6,2,-1,-1,-1,-1,-1,-1,-1,1,5,8,1,8,0,5,6,8,3,8,2,6,2,8,-1,1,5,6,2,1,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,3,6,1,6,10,3,8,6,5,6,9,8,9,6,-1,10,1,0,10,0,6,9,5,0,5,6,0,-1,-1,-1,-1,0,3,8,5,6,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,10,5,6,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,5,10,7,5,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,11,5,10,11,7,5,8,3,0,-1,-1,-1,-1,-1,-1,-1,5,11,7,5,10,11,1,9,0,-1,-1,-1,-1,-1,-1,-1,10,7,5,10,11,7,9,8,1,8,3,1,-1,-1,-1,-1,11,1,2,11,7,1,7,5,1,-1,-1,-1,-1,-1,-1,-1,0,8,3,1,2,7,1,7,5,7,2,11,-1,-1,-1,-1,9,7,5,9,2,7,9,0,2,2,11,7,-1,-1,-1,-1,7,5,2,7,2,11,5,9,2,3,2,8,9,8,2,-1,2,5,10,2,3,5,3,7,5,-1,-1,-1,-1,-1,-1,-1,8,2,0,8,5,2,8,7,5,10,2,5,-1,-1,-1,-1,9,0,1,5,10,3,5,3,7,3,10,2,-1,-1,-1,-1,9,8,2,9,2,1,8,7,2,10,2,5,7,5,2,-1,1,3,5,3,7,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,8,7,0,7,1,1,7,5,-1,-1,-1,-1,-1,-1,-1,9,0,3,9,3,5,5,3,7,-1,-1,-1,-1,-1,-1,-1,9,8,7,5,9,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,5,8,4,5,10,8,10,11,8,-1,-1,-1,-1,-1,-1,-1,5,0,4,5,11,0,5,10,11,11,3,0,-1,-1,-1,-1,0,1,9,8,4,10,8,10,11,10,4,5,-1,-1,-1,-1,10,11,4,10,4,5,11,3,4,9,4,1,3,1,4,-1,2,5,1,2,8,5,2,11,8,4,5,8,-1,-1,-1,-1,0,4,11,0,11,3,4,5,11,2,11,1,5,1,11,-1,0,2,5,0,5,9,2,11,5,4,5,8,11,8,5,-1,9,4,5,2,11,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,5,10,3,5,2,3,4,5,3,8,4,-1,-1,-1,-1,5,10,2,5,2,4,4,2,0,-1,-1,-1,-1,-1,-1,-1,3,10,2,3,5,10,3,8,5,4,5,8,0,1,9,-1,5,10,2,5,2,4,1,9,2,9,4,2,-1,-1,-1,-1,8,4,5,8,5,3,3,5,1,-1,-1,-1,-1,-1,-1,-1,0,4,5,1,0,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8,4,5,8,5,3,9,0,5,0,3,5,-1,-1,-1,-1,9,4,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,11,7,4,9,11,9,10,11,-1,-1,-1,-1,-1,-1,-1,0,8,3,4,9,7,9,11,7,9,10,11,-1,-1,-1,-1,1,10,11,1,11,4,1,4,0,7,4,11,-1,-1,-1,-1,3,1,4,3,4,8,1,10,4,7,4,11,10,11,4,-1,4,11,7,9,11,4,9,2,11,9,1,2,-1,-1,-1,-1,9,7,4,9,11,7,9,1,11,2,11,1,0,8,3,-1,11,7,4,11,4,2,2,4,0,-1,-1,-1,-1,-1,-1,-1,11,7,4,11,4,2,8,3,4,3,2,4,-1,-1,-1,-1,2,9,10,2,7,9,2,3,7,7,4,9,-1,-1,-1,-1,9,10,7,9,7,4,10,2,7,8,7,0,2,0,7,-1,3,7,10,3,10,2,7,4,10,1,10,0,4,0,10,-1,1,10,2,8,7,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,9,1,4,1,7,7,1,3,-1,-1,-1,-1,-1,-1,-1,4,9,1,4,1,7,0,8,1,8,7,1,-1,-1,-1,-1,4,0,3,7,4,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,4,8,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,9,10,8,10,11,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,0,9,3,9,11,11,9,10,-1,-1,-1,-1,-1,-1,-1,0,1,10,0,10,8,8,10,11,-1,-1,-1,-1,-1,-1,-1,3,1,10,11,3,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,2,11,1,11,9,9,11,8,-1,-1,-1,-1,-1,-1,-1,3,0,9,3,9,11,1,2,9,2,11,9,-1,-1,-1,-1,0,2,11,8,0,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,3,2,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,8,2,8,10,10,8,9,-1,-1,-1,-1,-1,-1,-1,9,10,2,0,9,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3,8,2,8,10,0,1,8,1,10,8,-1,-1,-1,-1,1,10,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,1,3,8,9,1,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,9,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,3,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]);var Lm=new I(0,1,0),Nm=Math.PI*2,Fm=(i,e,t)=>{let n=Math.max(0,t-Math.abs(i-e))/t;return Math.min(i,e)-n*n*t*.25};function Ic(i,e,t,n,r,s){let o=r[0]-n[0],a=r[1]-n[1],l=r[2]-n[2],c=We.clamp(((i-n[0])*o+(e-n[1])*a+(t-n[2])*l)/(o*o+a*a+l*l),0,1);return Math.hypot(i-n[0]-c*o,e-n[1]-c*a,t-n[2]-c*l)-s}function kh(i,e,t,n){let r=1/0,s=!1,o=0,a=0;for(let c=0,u=t.length-1;c<t.length;u=c++){let h=t[u],d=t[c],f=d.x-h.x,p=d.y-h.y,y=f*f+p*p;if(y>1e-10){let m=We.clamp(((i-h.x)*f+(e-h.y)*p)/y,0,1),g=i-h.x-m*f,_=e-h.y-m*p,M=Math.hypot(g,_);M<r&&(r=M,o=g,a=_)}h.y>e!=d.y>e&&i<(d.x-h.x)*(e-h.y)/(d.y-h.y)+h.x&&(s=!s)}let l=s?-1:1;return n&&n.set(o,a).multiplyScalar(l/Math.max(r,1e-6)),l*r}function oM(i,e,t){let n=cn(e),r=i===0?-150:150,s=56,o=[150,90,100].map(b=>b*s/52),a=[r,210+e,140],l=new Pc(s,t,!1,!1,5e4);l.isolation=0;let c=ze.slice(i*3,i*3+3),u=new je;u.moveTo(-124,0),u.bezierCurveTo(-139,25,-145,65,-126,96),u.bezierCurveTo(-106,125,-45,132,7,128),u.bezierCurveTo(77,130,127,114,136,82),u.bezierCurveTo(146,49,137,18,122,0),u.lineTo(80,0),u.lineTo(71,55),u.bezierCurveTo(69,70,63,82,51,82),u.bezierCurveTo(36,82,31,70,29,55),u.lineTo(22,0),u.lineTo(-22,0),u.lineTo(-30,53),u.bezierCurveTo(-32,70,-38,80,-51,80),u.bezierCurveTo(-65,80,-72,68,-73,53),u.lineTo(-82,0),u.closePath();let h=u.getPoints(12),d=new Float32Array(s*s);for(let b=0;b<s;b++)for(let w=0;w<s;w++)d[b*s+w]=kh((w/s*2-1)*o[0],(b/s*2-1)*o[2]+a[2]-84,h);let f=(b,w,x,S=kh(b-r,x-84,h))=>{let E=225+e-(x-84)*.23,R=6,A=12.5,P=S+R,D=Math.abs(w-E)-A+R,F=Math.min(Math.max(P,D),0)+Math.hypot(Math.max(P,0),Math.max(D,0))-R;for(let L of c)F=Fm(F,Ic(b,w,x,[L,226+e,86],[L,215.5+e,119],18.6),8);let z=n.exhaustCollectors[i];if(F=Fm(F,Ic(b,w,x,[z[0],199+e,z[2]],z,22.5),13),x<117){let L=18.6+18*We.smoothstep(x,88,117),V=226+e-(x-86)*10.5/33,k=Math.min(...c.map(W=>Math.hypot(b-W,w-V)-L));F=Math.max(F,k)}if(F<5){let L=1/0;for(let V of c)L=Math.min(L,Ic(b,w,x,[V,226+e,58],[V,222+e,98],13.5));L=Math.min(L,Ic(b,w,x,z,n.catalystInlets[i],19)),F=Math.max(F,-L)}return Math.max(F,176+e-w,85.5-x)};for(let b=0;b<s;b++)for(let w=0;w<s;w++)for(let x=0;x<s;x++){let S=(x/s*2-1)*o[0]+a[0],E=(w/s*2-1)*o[1]+a[1],R=(b/s*2-1)*o[2]+a[2];l.field[b*s*s+w*s+x]=-f(S,E,R,d[b*s+x])}l.update();let p=new it,y=l.geometry.drawRange.count;if(y>=l.geometry.getAttribute("position").count)throw new Error("Kr\xFCmmeroberfl\xE4che \xFCberschreitet den Geometriepuffer.");for(let b of["position","normal"]){let w=l.geometry.getAttribute(b);p.setAttribute(b,new tt(new Float32Array(w.array.slice(0,y*3)),3))}p.scale(...o),p.translate(...a);let m=p.getAttribute("position"),g=p.getAttribute("normal"),_=.3,M=new Map,v=new me,T=n.exhaustCollectors[i];for(let b=0;b<m.count;b++){let w=m.getX(b),x=m.getY(b),S=m.getZ(b),E=We.smoothstep(S,105,113)*(1-We.smoothstep(S,132,151)),R=(1-We.smoothstep(Math.hypot(w-T[0],S-T[2]),36,52))*(1-We.smoothstep(x,201+e,211+e)),A=We.smoothstep(x,184+e,192+e)*Math.max(E,R);if(A===0)continue;let P=`${w},${x},${S}`,D=M.get(P);if(D){m.setXYZ(b,...D.position.toArray()),g.setXYZ(b,...D.normal.toArray());continue}let F=w,z=S,L=kh(w-r,S-84,h,v),V=v.x,k=v.y,W=(Re,se,le)=>f(Re,se,le,L+(Re-F)*V+(le-z)*k),oe=((Re,se,le)=>new I(W(Re+_,se,le)-W(Re-_,se,le),W(Re,se+_,le)-W(Re,se-_,le),W(Re,se,le+_)-W(Re,se,le-_)).multiplyScalar(1/(2*_)))(w,x,S),re=oe.lengthSq();if(re<.05)continue;let Te=We.clamp(W(w,x,S)/re,-1,1)*A;w-=oe.x*Te,x-=oe.y*Te,S-=oe.z*Te,m.setXYZ(b,w,x,S);let Ee=new I().fromBufferAttribute(g,b).normalize();g.setXYZ(b,Ee.x,Ee.y,Ee.z),M.set(P,{position:new I(w,x,S),normal:Ee})}return l.geometry.dispose(),zh(p)}function zh(i){let e=i.getAttribute("position"),t=e.count,n=new Float32Array(t*3),r=new Ie(4143928),s=new Ie(5850940),o=new Ie;for(let a=0;a<t;a++){let l=e.getX(a),c=e.getY(a),u=e.getZ(a),h=Math.sin(l*1.27+c*.93+u*2.31)*Math.sin(l*2.17-c*1.39+u*.87),d=.22+.17*Math.sin(l*.025+u*.033);o.copy(r).lerp(s,d).multiplyScalar(1+h*.07),o.toArray(n,a*3)}return i.setAttribute("color",new tt(n,3)),i}function aM(i,e,t){let n=cn(e).catalystInlets[i],r=n[1],s=[[20.5,0],[21.2,2],[23,6],[24.4,11],[24.7,20],[25,26],[26,31],[28,37],[30.5,42],[32,46],[30,46],[28.5,42],[26,37],[24,31],[23,26],[22.7,20],[22.4,11],[21,6],[19.2,2],[18.5,0],[20.5,0]],o=new jt(s.map(([u,h])=>new me(u,r+h)),64);o.deleteAttribute("uv"),o.translate(n[0],0,n[2]),zh(o);let a=o.toNonIndexed(),l=oM(i,e,t),c=yt([l,a]);if(l.dispose(),o.dispose(),a.dispose(),!c)throw new Error("Kr\xFCmmer und Katstutzen konnten nicht verbunden werden.");return c}function Um(i){return[i[0]-27,(i[0]+i[1])/2,(i[1]+i[2])/2,i[2]+27]}var Om=[-14,22];function lM(i,e,t){let n=new je,r=i[0]-38,s=i[2]+38,o=Um(i);n.moveTo(r,e-13),n.quadraticCurveTo(r,e-22,o[0],e-22);for(let a=0;a<3;a++)n.bezierCurveTo(o[a]+14,e-22,i[a]-16,e-20,i[a],e-20),n.bezierCurveTo(i[a]+16,e-20,o[a+1]-14,e-22,o[a+1],e-22);n.quadraticCurveTo(s,e-22,s,e-13),n.lineTo(s,e+19),n.quadraticCurveTo(s,e+32,o[3],e+32);for(let a=2;a>=0;a--)n.bezierCurveTo(o[a+1]-14,e+32,i[a]+16,e+24,i[a],e+24),n.bezierCurveTo(i[a]-16,e+24,o[a]+14,e+32,o[a],e+32);n.quadraticCurveTo(r,e+32,r,e+19),n.closePath();for(let a of i){let l=new ht;l.absellipse(a,e,14.8,16,0,Nm,!0),n.holes.push(l)}for(let a of o)for(let l of Om){let c=new ht;c.absarc(a,e+l,3.4,0,Nm,!0),n.holes.push(c)}return new at(n,{depth:9,bevelEnabled:!0,bevelThickness:.8,bevelSize:.8,bevelSegments:3,curveSegments:24}).translate(0,0,t)}function cM(i,e){let t=i[0]-34,n=i[2]+34,r=(i[0]+i[2])/2,s=new je;s.moveTo(t,0),s.lineTo(n,0),s.lineTo(n-5,25),s.lineTo(r+25,25),s.quadraticCurveTo(r+20,25,r+16,19),s.quadraticCurveTo(r,12,r-16,19),s.quadraticCurveTo(r-20,25,r-25,25),s.lineTo(t+5,25),s.closePath();let o=new at(s,{depth:1.4,bevelEnabled:!1,curveSegments:8});return o.rotateX(Math.PI-Math.atan2(18,24)),o.translate(0,205+e,85),o}function uM(i,e){let t=[[18.4,85.5],[18.4,87],[18.2,89.5],[15.1,89.5],[14.7,87],[14.7,85.5],[18.4,85.5]],n=new jt(t.map(([s,o])=>new me(s,o)),48);n.rotateX(Math.PI/2);let r=n.getAttribute("position");for(let s=0;s<r.count;s++){let o=r.getZ(s);r.setXYZ(s,r.getX(s)+i,r.getY(s)+e-(o-85.5)*10.5/33,o)}return n.computeVertexNormals(),zh(n)}function Bm(i,e){let t=cn(i),n=new Ce,r=new Ce,s=new Ce;n.name="M54 Kr\xFCmmer und Kat Au\xDFenh\xFCllen nach Fotoreferenz",r.name="M54 Abgasflansche und Fallrohre",s.name="M54 Katalysatoren im Schnitt";let o=e(16777215,.33,.9);o.vertexColors=!0;let a=e(16777215,.62,.57);a.vertexColors=!0;let l=e(6511957,.58,.67),c=e(6115912,.52,.66),u=e(10195326,.12,.86),h=(p,y,m,g)=>{let _=new Se(p,y);return _.name=g,m.add(_),_},d=(p,y,m,g,_,M,v,T=24)=>{let b=h(new st(p,p,y,T),m,g,v);return b.position.copy(_),b.quaternion.setFromUnitVectors(Lm,M),b},f=(p,y,m,g)=>h(new nn(new Ot(p.map(_=>new I(..._)),!1,"centripetal"),100,y,24,!1),m,r,g);for(let p=0;p<2;p++){let y=p===0?"1\u20133":"4\u20136",m=ze.slice(p*3,p*3+3);h(aM(p,i,o),o,n,`Zusammenh\xE4ngender Dreierkr\xFCmmer ${y}`),h(lM(m,226+i,77),l,r,`Dreifachflansch ${y}`),h(cM(m,i),l,r,`Abgewinkelter Hitzeschutz am Dreifachflansch ${y}`);for(let k of m)h(uM(k,226+i),o,n,`Integrierter Anschlusskragen ${k}`);for(let k of Um(m))for(let W of Om){let J=226+i+W,oe=h(new jt([[3.3,86],[6.9,86],[7.5,87.3],[7.1,89],[3.3,89],[3.3,86]].map(([re,Te])=>new me(re,Te)),24),l,r,`Aufliegender Schraubensitz ${y}`);oe.rotation.x=Math.PI/2,oe.position.set(k,J,0),d(5.4,5,l,r,new I(k,J,91),new I(0,0,1),`Sechskantmutter ${y}`,6),d(2.8,10,l,r,new I(k,J,91),new I(0,0,1),`Stehbolzen ${y}`,12)}let g=new I(...t.catalystInlets[p]),_=new I(...t.catalystOutlets[p]),M=_.clone().sub(g).normalize(),v=g.distanceTo(_),T=[[20.5,0],[21,9],[28,20],[36,34],[38,47],[38,v-40],[34,v-25],[23,v-10],[19,v]],b=new jt(T.map(([k,W])=>new me(k,W)),64),w=b.getAttribute("position"),x=new Float32Array(w.count*3),S=new Ie,E=new Ie(8485226),R=new Ie(10920858),A=new Ie(9400923);for(let k=0;k<w.count;k++){let W=w.getY(k)/v,J=.5+.5*Math.sin(w.getX(k)*.055+w.getZ(k)*.07+W*8);S.copy(E).lerp(R,Math.sin(Math.PI*W)*.65).lerp(A,J*.15),S.toArray(x,k*3)}b.setAttribute("color",new tt(x,3));let P=h(b,a,n,`L\xE4nglicher Katalysator ${y}`);P.position.copy(g),P.quaternion.setFromUnitVectors(Lm,M);let D=new jt([[36.5,34],[39,47],[39,v-40],[35.5,v-25]].map(([k,W])=>new me(k,W)),48,.1,Math.PI*1.4),F=h(D,l,n,`Gepr\xE4gtes Kat Abdeckblech ${y}`);F.position.copy(g),F.quaternion.copy(P.quaternion);for(let k of[35,v-26]){let W=k===35?36.5:34.5,J=h(new zt(W,.95,6,48),c,n,`Kat Schwei\xDFnaht ${y}`);J.position.copy(g).addScaledVector(M,k),J.quaternion.setFromUnitVectors(new I(0,0,1),M)}for(let k of[.1,Math.PI*1.4+.1]){let W=new I(Math.sin(k)*39,(v+9)/2,Math.cos(k)*39).applyQuaternion(P.quaternion).add(g);d(1.25,v-65,c,n,W,M,`Gefalzte Blechkante ${y}`,8)}let z=zn(i).find(k=>k.medium==="exhaust"&&k.branch===`collector-${p?"rear":"front"}`);f(z.coords,20.5,l,`Versetztes Fallrohr ${y}`);let L=h(new jt(T.map(([k,W])=>new me(k,W)),40,Math.PI*.45,Math.PI*1.25),l,s,`Offene Katwand ${y}`);L.position.copy(g),L.quaternion.copy(P.quaternion),L.material.side=Mt;let V=d(30,v-72,u,s,g.clone().addScaledVector(M,v*.52),M,`Kat Monolith ${y}`);V.geometry.dispose(),V.geometry=new st(30,30,v-72,32,1,!0,Math.PI*.45,Math.PI*1.25)}return{closed:n,details:r,cut:s,groups:[n,r,s]}}var ia=new I;function Vn(i,e,t,n,r,s){let o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;ia.copy(e),ia[n]=0,ia.normalize();let c=.5*o/(o+a),u=1-ia.angleTo(i)/l;return Math.sign(ia[t])===1?u*c:a/(o+a)+c+c*(1-u)}var Dc=class i extends ot{constructor(e=1,t=1,n=1,r=2,s=.1){let o=r*2+1;if(s=Math.min(e/2,t/2,n/2,s),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:r,radius:s},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let l=new I,c=new I,u=new I(e,t,n).divideScalar(2).subScalar(s),h=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=h.length/6,y=new I,m=.5/o;for(let g=0,_=0;g<h.length;g+=3,_+=2)switch(l.fromArray(h,g),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),h[g+0]=u.x*Math.sign(l.x)+c.x*s,h[g+1]=u.y*Math.sign(l.y)+c.y*s,h[g+2]=u.z*Math.sign(l.z)+c.z*s,d[g+0]=c.x,d[g+1]=c.y,d[g+2]=c.z,Math.floor(g/p)){case 0:y.set(1,0,0),f[_+0]=Vn(y,c,"z","y",s,n),f[_+1]=1-Vn(y,c,"y","z",s,t);break;case 1:y.set(-1,0,0),f[_+0]=1-Vn(y,c,"z","y",s,n),f[_+1]=1-Vn(y,c,"y","z",s,t);break;case 2:y.set(0,1,0),f[_+0]=1-Vn(y,c,"x","z",s,e),f[_+1]=Vn(y,c,"z","x",s,n);break;case 3:y.set(0,-1,0),f[_+0]=1-Vn(y,c,"x","z",s,e),f[_+1]=1-Vn(y,c,"z","x",s,n);break;case 4:y.set(0,0,1),f[_+0]=1-Vn(y,c,"x","y",s,e),f[_+1]=1-Vn(y,c,"y","x",s,t);break;case 5:y.set(0,0,-1),f[_+0]=Vn(y,c,"x","y",s,e),f[_+1]=1-Vn(y,c,"y","x",s,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}};var km=Math.PI*2,zm=(i,e)=>Math.abs(i)<1e-10?0:Math.sign(i)*Math.pow(Math.abs(i),e);function Lc(i){let e=i.section==="round"?1:i.section==="port"?.8:.55,t=new Ot(i.coords.map(g=>new I(...g)),!1,"centripetal"),n=48,r=32,s=r+1,o=Array.from({length:n+1},(g,_)=>t.getPointAt(_/n)),a=[],l=[],c=[],u=[],h=[];for(let g=0;g<=n;g++){let _=g/n,M=t.getTangentAt(_),v=i.axis==="x"?new I(0,1,0):g?a[g-1].clone():Math.abs(M.x)<.9?new I(1,0,0):new I(0,1,0);v.addScaledVector(M,-v.dot(M)).normalize(),a.push(v),l.push(new I().crossVectors(M,v).normalize()),c.push(M);let T=(i.capStart?.4+.6*We.smoothstep(_,0,.12):1)*(i.capEnd?.4+.6*We.smoothstep(1-_,0,.12):1),b=i.rootWidth?We.lerp(i.rootWidth,i.width,We.smoothstep(_,0,.45)):i.width;u.push((i.section==="port"?We.lerp(b,33,We.smoothstep(_,.78,1)):b)*T),h.push((i.section==="port"?We.lerp(i.height,20,We.smoothstep(_,.76,1)):i.height)*T)}let d=g=>{let _=[],M=[],v=[],T=(n+1)*s,b=g?i.axis==="x"?Math.PI:km-2.1:km;for(let S of[0,1])for(let E=0;E<=n;E++)for(let R=0;R<=r;R++){let A=Math.atan2(l[E].y+.65*l[E].x,a[E].y+.65*a[E].x),P=g?i.axis==="x"?Math.PI/2:A+1.05:0,D=P+R/r*b,F=E/n,z=S*(i.section==="port"?We.lerp(3,2,We.smoothstep(F,.8,1)):3),L=u[E]-z,V=h[E]-z,k=e,W=zm(Math.cos(D),k),J=zm(Math.sin(D),k),oe=i.section==="port"?We.lerp(J,Math.max(-.74,J),We.smoothstep(F,.78,1)):J,re=o[E].clone();S&&E===0&&i.capStart&&re.addScaledVector(c[E],3),S&&E===n&&i.capEnd&&re.addScaledVector(c[E],-3),_.push(...re.addScaledVector(a[E],W*L).addScaledVector(l[E],oe*V).toArray()),M.push(F,R/r)}let w=(S,E,R,A,P=!1)=>v.push(...P?[S,R,E,E,R,A]:[S,E,R,E,A,R]);for(let S=0;S<n;S++)for(let E=0;E<r;E++){let R=S*s+E,A=R+s;w(R,A,R+1,A+1,!0),w(R+T,A+T,R+1+T,A+1+T)}for(let S of[0,n])if(S===0?i.capStart:i.capEnd)for(let R of[0,1]){let A=_.length/3,P=o[S].clone();R&&P.addScaledVector(c[S],S===0?3:-3),_.push(...P.toArray()),M.push(S/n,.5);for(let D=0;D<r;D++){let F=R*T+S*s+D;v.push(...S===0!=!!R?[A,F+1,F]:[A,F,F+1])}}else for(let R=0;R<r;R++){let A=S*s+R;w(A,A+1,A+T,A+1+T,S===n)}if(g)for(let S of[0,r])for(let E=0;E<n;E++){let R=E*s+S,A=R+s;w(R,A,R+T,A+T,S===r)}let x=new it;return x.setAttribute("position",new Ke(_,3)),x.setAttribute("uv",new Ke(M,2)),x.setIndex(v),x.computeVertexNormals(),x.userData.innerStart=T,x.userData.sourceSamples=T*2,x},f=d(!1),p=d(!0);f.computeBoundingBox();let y=f.boundingBox.clone().expandByScalar(.1);return{spec:i,curve:t,closed:f,cut:p,field:(g,_)=>{if(!y.containsPoint(g))return 2;let M=1/0,v=2;for(let T=0;T<n;T++){let b=o[T],w=o[T+1],x=w.x-b.x,S=w.y-b.y,E=w.z-b.z,R=x*x+S*S+E*E,A=We.clamp(((g.x-b.x)*x+(g.y-b.y)*S+(g.z-b.z)*E)/R,0,1),P=g.x-b.x-x*A,D=g.y-b.y-S*A,F=g.z-b.z-E*A,z=P*P+D*D+F*F;if(z>=M)continue;M=z;let L=a[T],V=l[T],k=c[T],W=_?3:0,J=We.lerp(u[T],u[T+1],A)-W,oe=We.lerp(h[T],h[T+1],A)-W,re=P*L.x+D*L.y+F*L.z,Te=P*V.x+D*V.y+F*V.z,Ee=P*k.x+D*k.y+F*k.z,Re=2/e;v=Math.pow(Math.abs(re/J),Re)+Math.pow(Math.abs(Te/oe),Re)+Math.pow(Math.abs(Ee/Math.min(J,oe)),Re)-1}return v},bounds:y}}function Vh(i,e){for(let t of i){if(e&&!e.has(t.spec.id))continue;let n=i.filter(r=>r!==t&&r.bounds.intersectsBox(t.bounds));for(let r of[t.closed,t.cut]){let s=r.getAttribute("position"),o=r.getAttribute("normal"),a=r.getAttribute("uv"),l=Array.from(s.array),c=Array.from(o.array),u=Array.from(a.array),h=[],d=r.getIndex(),f=r.userData.innerStart,p=[new Map,new Map],y=g=>new I(s.getX(g),s.getY(g),s.getZ(g)),m=(g,_)=>n.length?Math.min(...n.map(M=>M.field(g,_))):2;for(let g=0;g<d.count;g+=3){let _=[d.getX(g),d.getX(g+1),d.getX(g+2)],M=_.filter(w=>w>=f).length>=2,v=p[M?1:0],T=_.map(w=>{let x=v.get(w);return x===void 0&&(x=m(y(w),M),v.set(w,x)),x});if(T.every(w=>w>=0)){h.push(..._);continue}if(T.every(w=>w<0))continue;let b=[];for(let w=0;w<3;w++){let x=(w+1)%3,S=_[w],E=_[x];if(T[w]>=0&&b.push(S),T[w]>=0==T[x]>=0)continue;let R=y(S),A=y(E),P=0,D=1;for(let V=0;V<10;V++){let k=(P+D)/2;m(R.clone().lerp(A,k),M)>=0==T[w]>=0?P=k:D=k}let F=(P+D)/2,z=R.lerp(A,F),L=new I(o.getX(S),o.getY(S),o.getZ(S)).lerp(new I(o.getX(E),o.getY(E),o.getZ(E)),F).normalize();b.push(l.length/3),l.push(...z.toArray()),c.push(...L.toArray()),u.push(We.lerp(a.getX(S),a.getX(E),F),We.lerp(a.getY(S),a.getY(E),F))}for(let w=1;w<b.length-1;w++)h.push(b[0],b[w],b[w+1])}r.setAttribute("position",new Ke(l,3)),r.setAttribute("normal",new Ke(c,3)),r.setAttribute("uv",new Ke(u,2)),r.setIndex(h),r.computeBoundingBox(),r.computeBoundingSphere()}}}function kr(i={}){let e=i.intake==="sport"||i.intake==="race"?i.intake:"standard";return{intake:e,extraDepth:e==="sport"?16:e==="race"?30:0,unsupportedKeys:["throttleBody","runners","filter"].filter(t=>i[t]&&i[t]!=="standard")}}var Nc=Math.PI*2,Vm=new I(0,0,1);function Gm(i,e,t={}){let n=kr(t),r=Ui(i),s=ks(i),o=new Ce,a=new Ce,l=new Ce,c=new Ce,u=new Ce,h=new Ce;o.name="M54B30 geformte Ansaugbruecke R7",a.name="M54B30 innere Dreiergruppen R7",l.name="M54B30 Filter LMM Drossel und Portleiste",u.name="M54B30 DISA Stellglied",c.name="Animierte Drosselklappe",h.name="DISA Kopplung zwischen Dreiergruppen",h.userData.illustrative=!0;let d=e(1843750,.06,.88),f=e(2896952,.07,.83),p=e(1580577,.02,.95),y=e(9674660,.66,.4),m=e(7950651,.05,.85),g=e(11708296,.02,.97),_=e(11115376,.55,.48);for(let X of[d,f])X.side=Mt;let M=(X,q,$)=>[X,q+i,$],v=(X,q,$,pe=[],K="")=>{let H=new Se(q,$);return pe.length&&H.position.fromArray(pe),H.name=K,X.add(H),H},T=(X,q,$,pe,K,H=d,B=3,Z="")=>v(X,new Dc(q,$,pe,3,B),H,K,Z),b=(X,q,$,pe,K,H="y",B=!1,Z="")=>{let ne=v(X,new st(q,q,$,32,1,B),K,pe,Z);return H==="x"&&(ne.rotation.z=Math.PI/2),H==="z"&&(ne.rotation.x=Math.PI/2),ne},w=(X,q,$,pe,K,H="z",B="")=>{let Z=v(X,new zt(q,$,8,40),K,pe,B);return H==="x"&&(Z.rotation.y=Math.PI/2),H==="y"&&(Z.rotation.x=Math.PI/2),Z},x=(X,q,$,pe,K)=>v(X,new nn(new Ot(q.map(H=>new I(...H)),!1,"centripetal"),64,$,24,!1),pe,[],K),S=(X,q,$,pe,K,H,B,Z,ne=[])=>{let te=new je;return te.moveTo(-q/2+5,-$/2),te.lineTo(q/2-5,-$/2),te.quadraticCurveTo(q/2,-$/2,q/2,-$/2+5),te.lineTo(q/2,$/2-5),te.quadraticCurveTo(q/2,$/2,q/2-5,$/2),te.lineTo(-q/2+5,$/2),te.quadraticCurveTo(-q/2,$/2,-q/2,$/2-5),te.lineTo(-q/2,-$/2+5),te.quadraticCurveTo(-q/2,-$/2,-q/2+5,-$/2),te.holes.push(K,...ne),v(X,new at(te,{depth:pe,bevelEnabled:!1,curveSegments:24}),B,H,Z)},E=fm(i,n.extraDepth).map(Lc);Vh(E);let R=Lc({id:"housing",coords:[-296,-276,-240,-144,0,144,240,276,296].map(X=>M(X,160,-260-n.extraDepth/2)),width:40,height:72+n.extraDepth/2,section:"moulded",axis:"x",capStart:!0,capEnd:!0}),A=Lc({id:"disa-service-cut",coords:[M(0,151,-340-n.extraDepth),M(0,151,-315-n.extraDepth)],width:29,height:25,section:"round"});Vh([R,...E,A],new Set(["housing"])),A.closed.dispose(),A.cut.dispose(),v(o,R.closed,d,[],"Zusammenhaengende geformte Aussenschale"),v(a,R.cut,d,[],"Aussenschale im Schnitt");let P={resonance:"Aeussere Resonanzverteilung",inlet:"Geformter Drosseleintritt",coupling:"DISA Verbindungskanal","gallery-0":"Hauptsammler Zylinder 1\u20133","gallery-1":"Hauptsammler Zylinder 4\u20136","resonance-feed-0":"Resonanzzufuehrung 1\u20133","resonance-feed-1":"Resonanzzufuehrung 4\u20136"};for(let X of E){let q=X.spec.cylinder?`Geformtes Saugrohr Zylinder ${X.spec.cylinder}`:P[X.spec.id];v(o,X.closed,d,[],q),v(a,X.cut,d,[],q+" im Schnitt")}o.userData.intakeVariant=n.intake;for(let X of[-1,1])T(o,236,3,16,M(X*147,171,-261),d,1,"Geformte Gehaeuseschulter");for(let X of[o,a])for(let q of[-1,1])T(X,240,3,12,M(q*147,112,-261),d,1,"Untere Formtrennkante");let D=[M(-282,128,-307-n.extraDepth),M(-264,125,-325-n.extraDepth),M(-144,122,-327-n.extraDepth),M(0,122,-327-n.extraDepth),M(144,122,-327-n.extraDepth),M(264,125,-325-n.extraDepth),M(283,133,-304-n.extraDepth/2)];x(l,D,1.2,f,"Schalenteilung entlang Resonanzgehaeuse");for(let X of ze){let q=new ht;q.moveTo(-31,-15),q.lineTo(31,-15),q.lineTo(31,5),q.quadraticCurveTo(31,18,18,18),q.lineTo(-18,18),q.quadraticCurveTo(-31,18,-31,5),q.closePath();let $=new ht;$.absarc(ea.x,ea.y,wc,0,Nc,!0),S(l,86,48,7,q,M(X,226,-86),d,"Offener Saugrohrflansch",[$]),S(l,78,48,8,q.clone(),M(X,226,-94),d,"Abgeflachter Kopfanschlusskragen",[$.clone()]);for(let pe of[-43,43])b(l,5,7,M(X+pe,227,-86),y,"z")}T(l,596,8,9,M(0,253,-83),d,2,"Gemeinsame Befestigungsleiste");let F=r.throttle,z=-Math.atan2(r.throttleAxis[1],r.throttleAxis[2]),L=new Ce;L.position.fromArray(F),L.rotation.x=z,L.name="EDK im mittigen Unterseitenflansch",l.add(L),b(L,34,48,[0,0,0],y,"z",!0,"Elektronisches Drosselgehaeuse"),w(L,34,1.6,[0,0,-24],y),w(L,34,1.6,[0,0,24],y);let V=new ht;V.absarc(0,0,31,0,Nc,!0),S(L,80,77,7,V,[0,0,22],d,"Offener Drossel-Montageflansch");for(let X of[-30,30])for(let q of[-28,28])b(L,3.4,8,[X,q,20],y,"z");T(L,37,43,43,[-47,0,0],p,6,"EDK Stellmotor"),c.position.fromArray(F),c.rotation.x=z,v(c,new Ei(30,48),_,[],"Drosselklappenblatt").material.side=Mt,b(c,1.8,64,[0,0,0],y,"y"),o.add(u);let k=r.disa.map((X,q)=>q===2?X-n.extraDepth:X),W=new ht;W.absellipse(0,0,29,25,0,Nc,!0),S(u,82,65,8,W,k,d,"DISA Flanschplatte"),b(u,23,23,[k[0]-45,k[1],k[2]-14],p,"z",!1,"DISA Unterdruckdose"),b(u,20,3,[k[0]-45,k[1],k[2]-27],f,"z"),T(u,39,34,22,[k[0]+28,k[1],k[2]-10],d,5,"DISA Anschlussgehaeuse");for(let[X,q]of[[-32,-20],[32,20]])b(u,3,9,[k[0]+X,k[1]+q,k[2]-2],y,"z");h.position.fromArray(r.disaPivot),a.add(h),T(h,2.5,46,50,[0,0,0],d,.8,"DISA Klappenblatt"),b(h,2,104,[0,0,-45],y,"z");let J=h.clone(!0);J.name="DISA Kopplung im geschlossenen Gehaeuse",o.add(J);for(let X of[-29,29])T(a,3,50,52,M(X,151,-224),f,1,"DISA Einsteckrahmen");let oe=!1,re=X=>{oe=!!X,h.rotation.z=J.rotation.z=oe?Math.PI/2:0,h.userData.open=oe,J.userData.open=oe};re(!1),x(l,[s.idleInlet,s.idleValve,s.idleEntry],8,p,"Leerlaufsteller-Zufuehrung zum unteren Brueckeneintritt");let Te=b(l,13,43,s.idleValve,y,"y",!1,"Leerlaufsteller");Te.rotation.z=.3;let Ee=x(a,s.idleDistribution,5.5,f,"Illustrativer innerer Leerlaufverteiler");Ee.userData.illustrative=!0;let Re=x(a,[s.idleEntry,s.idleDistribution[2]],5.5,f,"Illustrativer innerer Leerlaufverteiler-Eintritt");Re.userData.illustrative=!0;for(let X=0;X<6;X++){let q=x(a,s.idleHeadPaths[X],wc,f,"Innerer Turbulenzkanal "+(X+1));q.userData.illustrative=!0}for(let X of[o,a])T(X,144,5,134,M(-462,53,-295),d,2,"Luftfilterkasten Boden"),T(X,144,124,5,M(-462,115,-230),d,2,"Luftfilterkasten Rueckwand");T(o,145,8,136,M(-462,176,-295),d,3,"Luftfilterdeckel"),T(o,144,124,5,M(-462,115,-360),d,2,"Luftfilterkasten Aussenwand");for(let[X,q]of[[-534,83],[-390,143]]){let $=new je;$.moveTo(-63,-67),$.lineTo(63,-67),$.lineTo(63,67),$.lineTo(-63,67),$.closePath();let pe=new ht;pe.absarc(q-115,0,29,0,Nc,!0),$.holes.push(pe);let K=new at($,{depth:4,bevelEnabled:!1,curveSegments:24});K.applyMatrix4(new Ne().set(0,0,1,X,1,0,0,115+i,0,1,0,-295,0,0,0,1)),v(l,K,d,[],"Luftfilterkasten Anschluss")}b(l,29,19,M(-544,83,-295),d,"x",!0),w(l,29,1.2,r.intakeMouth,f,"x");for(let X of[-505,-419])T(l,10,19,5,M(X,161,-365),y,1,"Filterkasten Halteklammer");for(let X=-524;X<=-400;X+=7)T(a,3,15,116,M(X,116,-295),g,.6,"Papierfilter-Lamelle");b(l,29,40,r.maf,f,"x",!0,"Heissfilm-Luftmassenmesser"),T(l,25,19,21,[r.maf[0],r.maf[1]+33,r.maf[2]],p,3,"LMM Elektronik"),b(l,29,20,M(-381,143,-295),d,"x",!0);let se=[M(-332,143,-295),...r.intakeBoot],le=new Ot(se.map(X=>new I(...X)),!1,"centripetal");x(l,se,29,p,"Gebogener Ansaugfaltenbalg");for(let X=0;X<17;X++){let q=.07+X/16*.8,$=le.getPointAt(q);w(l,30,1.5,$.toArray(),p).quaternion.setFromUnitVectors(Vm,le.getTangentAt(q))}for(let X of[0,.995]){let q=le.getPointAt(X);w(l,30,1.2,q.toArray(),y).quaternion.setFromUnitVectors(Vm,le.getTangentAt(X))}return x(l,[r.idleTap,r.idleInlet],8,p,"Abzweig Leerlaufluft vor EDK"),{closed:o,cut:a,details:l,throttle:c,disaFlap:h,disa:u,variant:n,groups:[o,a,l,u],nodes:{...r,...s},passages:E,setDisaOpen:re,get disaOpen(){return oe},flowRoutes:(X=oe)=>pm(Sc(i,X),i)}}function Hm(i,e,t={}){let n=Gm(i,e,t),r=n.cut.children.filter(o=>o instanceof Se&&o.name==="DISA Einsteckrahmen"),s=r[0]?.material;for(let o of r)n.cut.remove(o),o.geometry.dispose();if(s&&!Array.isArray(s))for(let o of[-29,29]){for(let a of[-26,26]){let l=new Se(new ot(3,2.5,52),s);l.position.set(o,151+i+a,-224),l.name="DISA Rahmen am Rand",n.cut.add(l)}for(let a of[-26,26]){let l=new Se(new ot(3,48,2.5),s);l.position.set(o,151+i,-224+a),l.name="DISA Rahmen am Rand",n.cut.add(l)}}return n}var Fc=Math.PI*2,Gh=(i,e)=>(i%e+e)%e;function hM(i,e){if(!Number.isFinite(i)||e.length<2)throw new Error("Ein Riemen braucht eine Ebene und mindestens zwei Scheiben.");for(let o of e)if(!o.id||!o.center.every(Number.isFinite)||!(o.radius>0)||!Number.isFinite(o.radius)||Math.abs(o.side)!==1)throw new Error("Ungueltige Riemenscheibe.");let t=e.map((o,a)=>{let l=e[(a+1)%e.length],c=l.center[0]-o.center[0],u=l.center[1]-o.center[1],h=Math.hypot(c,u);if(h<=o.radius+l.radius)throw new Error("Ueberlappende Riemenscheiben.");let d=(o.side*o.radius-l.side*l.radius)/h,f=Math.sqrt(1-d*d),p=d*c/h+f*u/h,y=d*u/h-f*c/h;return{start:[o.center[0]+o.side*o.radius*p,o.center[1]+o.side*o.radius*y],end:[l.center[0]+l.side*l.radius*p,l.center[1]+l.side*l.radius*y]}}),n=[];for(let o=0;o<e.length;o++){let a=e[o],l=t[Gh(o-1,e.length)].end,c=t[o].start,u=Math.atan2(l[1]-a.center[1],l[0]-a.center[0]),h=Math.atan2(c[1]-a.center[1],c[0]-a.center[0]),d=a.side*Gh(a.side*(h-u),Fc);n.push({kind:"arc",pulley:a.id,center:a.center,radius:a.radius,startAngle:u,sweep:d,length:Math.abs(d)*a.radius,start:l,end:c});let f=t[o].end;n.push({kind:"line",start:c,end:f,length:Math.hypot(f[0]-c[0],f[1]-c[1])})}let r=n.reduce((o,a)=>o+a.length,0);return{x:i,pulleys:e,segments:n,length:r,sample:o=>{let a=Gh(o,r),l=n[n.length-1];for(let p of n){if(l=p,a<=p.length)break;a-=p.length}let c=Math.max(0,Math.min(1,a/l.length)),u,h,d,f;if(l.kind==="line"){let p=l.end[0]-l.start[0],y=l.end[1]-l.start[1];u=l.start[0]+p*c,h=l.start[1]+y*c,d=p/l.length,f=y/l.length}else{let p=l.startAngle+l.sweep*c,y=Math.sign(l.sweep);u=l.center[0]+l.radius*Math.cos(p),h=l.center[1]+l.radius*Math.sin(p),d=-Math.sin(p)*y,f=Math.cos(p)*y}return{point:new I(i,u,h),tangent:new I(0,d,f),normal:new I(0,f,-d)}}}}function dM(i,e,t,n){let r=e/2,s=[[-r,t/2],[r,t/2],[r,-t/2+.28]];for(let u=n-1;u>=0;u--)s.push([-r+e*(u+.5)/n,-t/2-.28],[-r+e*u/n,-t/2+.28]);let o=Math.ceil(i.length/2.4),a=[],l=[];for(let u=0;u<=o;u++){let{point:h,normal:d}=i.sample(u/o*i.length);for(let[f,p]of s)a.push(h.x+f,h.y+d.y*p,h.z+d.z*p)}for(let u=0;u<o;u++)for(let h=0;h<s.length;h++){let d=u*s.length+h,f=u*s.length+(h+1)%s.length,p=d+s.length,y=f+s.length;l.push(d,p,f,f,p,y)}let c=new it;return c.setAttribute("position",new Ke(a,3)),c.setIndex(l),c.computeVertexNormals(),c.userData={section:"flat-longitudinal-v-ribs",width:e,thickness:t,ribs:n,pitchLength:i.length},c}function Wm(i){let e=new Map;for(let t of i.children)if(t instanceof Se&&!Array.isArray(t.material)){let n=e.get(t.material)??[];n.push(t),e.set(t.material,n)}for(let[t,n]of e){if(n.length<2)continue;let r=n.map(a=>(a.updateMatrix(),(a.geometry.index?a.geometry.toNonIndexed():a.geometry.clone()).applyMatrix4(a.matrix))),s=yt(r);if(r.forEach(a=>a.dispose()),!s)throw new Error("Nebenaggregat-Geometrie konnte nicht gebuendelt werden.");for(let a of n)a.removeFromParent(),a.geometry.dispose();let o=new Se(s,t);o.name=i.name+" \xB7 gebuendelte Oberflaeche",i.add(o)}}function Xm(i,e){if(i.length!==3||!i.every(Number.isFinite))throw new Error("Die Wasserpumpe braucht einen gueltigen Anschluss.");let[t,n,r]=i,s=t-54,o=s-22,a=new Ce;a.name="M54 Nebenaggregatetrieb mit getrenntem Klimariemen";let l=new Ce;l.name="Verschraubte Aggregate und Riemenhalter",a.add(l);let c=new Ce;c.name="Haupt und Klimariemen mit flachem Rippenquerschnitt",a.add(c);let u=[a.name,l.name,c.name],h=e(7636364,.45,.67),d=e(12108226,.76,.36),f=e(6648950,.7,.42),p=e(2108464,.18,.68),y=e(1187363,.02,.94),m=e(10203042,.05,.77),g=(L,V,k,W=0,J=0,oe=0)=>{let re=new Se(L,V);return re.position.set(W,J,oe),k.add(re),re},_=(L,V,k,W,J,oe,re,Te=32)=>{let Ee=new st(V,V,k,Te);return Ee.rotateZ(Math.PI/2),g(Ee,W,L,J,oe,re)},M=(L,V,k,W,J,oe=0,re=0)=>{let Te=new zt(V,k,6,40);return Te.rotateY(Math.PI/2),g(Te,W,L,J,oe,re)},v=[],T=(L,V,k,W=10)=>{let J=new I(...V),oe=new I(...k),re=oe.clone().sub(J),Te=g(new ot(W,8,re.length()),h,l);Te.position.copy(J.add(oe).multiplyScalar(.5)),Te.quaternion.setFromUnitVectors(new I(0,0,1),re.normalize()),Te.name=L,v.push({name:L,from:[...V],to:[...k]}),u.push(L);for(let Ee of[V,k])_(l,3.3,5,f,Ee[0]-3,Ee[1],Ee[2],6)},b=(L,V,k,W,J,oe=6)=>{let re=_(l,oe,Math.abs(k-V),f,(V+k)/2,W,J);return re.name=L,u.push(L),{name:L,from:[V,W,J],to:[k,W,J],radius:oe}},w=b("Wasserpumpenwelle zum festen Pumpenkoerper",t,s,n,r,7);b("Kurbelwellenstumpf in der Motorfront",t+12,o,0,0,10);let x=[{id:"crank",center:[0,0],radius:35,side:1},{id:"power-steering",center:[-50,-126],radius:29,side:1},{id:"alternator",center:[56,-139],radius:25,side:1},{id:"idler",center:[84,-94],radius:11,side:-1},{id:"water-pump",center:[n,r],radius:24,side:1},{id:"main-tensioner",center:[22,-69],radius:13,side:-1}],S=[{id:"crank-ac",center:[0,0],radius:32,side:1},{id:"compressor",center:[-24,115],radius:25,side:1},{id:"ac-tensioner",center:[-36,56],radius:11,side:-1}],E=[],R={crank:"Kurbelriemenscheibe und Schwingungsdaempfer","crank-ac":"Zweite Kurbelriemenspur fuer Klima","water-pump":"Riemenrad der Wasserpumpe",alternator:"Lichtmaschinenriemenrad","power-steering":"Servopumpenriemenrad",idler:"Umlenkrolle am Lichtmaschinenhalter","main-tensioner":"Hauptspannerrolle",compressor:"Klimakompressor Magnetkupplung","ac-tensioner":"Klimaspannerrolle"},A=(L,V,k,W,J,oe)=>{let re=new Ce;re.name=R[L.id]??L.id,re.position.set(V,...L.center),a.add(re),u.push(re.name);let Te=k/W,Ee=[new me(0,-k/2-1),new me(L.radius+.65,-k/2-1),new me(L.radius-.8,-k/2)];if(L.side===1)for(let le=0;le<W;le++)Ee.push(new me(L.radius-1.35,-k/2+Te*(le+.5)),new me(L.radius-.8,-k/2+Te*(le+1)));else Ee.push(new me(L.radius-.8,k/2));Ee.push(new me(L.radius+.65,k/2+1),new me(0,k/2+1));let Re=new jt(Ee,40);Re.rotateZ(Math.PI/2),g(Re,L.side===1?p:f,re);let se=L.id==="water-pump"||L.id==="power-steering"?p:L.id==="crank"?f:d;if(_(re,L.radius*.68,2,se,-k/2-1.2,0,0),_(re,Math.max(4,L.radius*.22),k+4,f,0,0,0,6),L.side===1){let le=L.id.startsWith("crank")?6:L.id==="water-pump"?4:3;for(let X=0;X<le;X++){let q=X/le*Fc;_(re,2,3,f,-k/2-2,Math.cos(q)*L.radius*.47,Math.sin(q)*L.radius*.47,6)}M(re,L.radius*.78,.6,f,-k/2-1.6)}else _(re,4,3,p,-k/2-2,0,0);if(L.id==="crank"&&(_(re,35.5,14,p,k/2+8,0,0),M(re,32,2,y,k/2+16),M(re,29,1,f,k/2+18)),L.id==="alternator")for(let le=0;le<8;le++){let X=le/8*Fc,q=g(new ot(3,2,12),f,re,k/2+3,Math.cos(X)*15,Math.sin(X)*15);q.rotation.x=X+.35}return Wm(re),re.userData.accessoryPulley={id:L.id,pitchRadius:L.radius,belt:J,side:L.side},E.push({id:L.id,part:re,radius:L.radius,ratio:L.side*oe/L.radius,belt:J,side:L.side}),re};for(let L of x)A(L,s,15.6,6,"main",35);for(let L of S)A(L,o,10.4,4,"ac",32);let P=s+34;_(l,29,48,h,P,56,-139),_(l,24,53,p,P,56,-139);for(let L of[-20,20])M(l,29,2,d,P+L,56,-139);for(let L=0;L<12;L++){let V=L/12*Fc,k=g(new ot(37,3,5),h,l,P,56+Math.cos(V)*28,-139+Math.sin(V)*28);k.rotation.x=V}b("Kurze Lichtmaschinenwelle",P-24,s,56,-139,5),T("Oberer Lichtmaschinenhalter",[t+8,76,-66],[P+17,76,-120],12),T("Unterer Lichtmaschinenhalter",[t+8,26,-63],[P+17,36,-120],12),_(l,21,40,h,s+33,-50,-126),b("Servopumpenwelle",s+15,s,-50,-126,6),T("Servopumpentraeger oben",[t+8,-24,-67],[s+42,-34,-111],12),T("Servopumpentraeger unten",[t+8,-72,-67],[s+42,-65,-111],12),_(l,29,62,h,o+46,-24,115),M(l,28,2,d,o+18,-24,115),M(l,28,2,d,o+73,-24,115);for(let L of[-45,-3])T("Klimakompressor Halteohr "+L,[t+8,L,64],[o+66,L,99],12);b("Klimakompressorwelle",o+15,o,-24,115,7);let D=[{name:"Umlenkrolle",y:84,z:-94,x:s,anchor:[t+8,84,-57]},{name:"Hauptspanner",y:22,z:-69,x:s,anchor:[t+8,48,-57]},{name:"Klimaspanner",y:-36,z:56,x:o,anchor:[t+8,-10,45]}];for(let L of D){let V=L.x+24;_(l,11,13,h,V,L.y,L.z),b(L.name+" Lagerachse",V,L.x,L.y,L.z,5),T(L.name+" festes Gusshalteglied",L.anchor,[V,L.y,L.z],11),L.name!=="Umlenkrolle"&&_(l,9,10,p,V+8,L.anchor[1],L.anchor[2])}let F=[];for(let L of[{id:"main",x:s,width:15.6,ribs:6,pulleys:x,driverRadius:35},{id:"ac",x:o,width:10.4,ribs:4,pulleys:S,driverRadius:32}]){let V=hM(L.x,L.pulleys),k=1.5,W=g(dM(V,L.width,k,L.ribs),y,c);W.name=L.id==="main"?"Sechsrippiger Hauptantriebsriemen":"Separater vierrippiger Klimariemen",u.push(W.name);let J=[0,4.5,9].map(oe=>{let re=g(new ot(L.width*.6,.14,2),m,a);return re.name=L.id+" dezente wandernde Riemenmarke",{part:re,offset:oe}});F.push({id:L.id,path:V,mesh:W,width:L.width,thickness:k,ribs:L.ribs,driverRadius:L.driverRadius,marks:J})}Wm(l);let z={root:a,staticGroups:[l,c],pulley:E.find(L=>L.id==="water-pump").part,partNames:u,wheels:E,belts:F,pumpShaft:w,mounts:v,planes:{main:s,ac:o},reference:"M52/M54 topology; authored compact dimensions, not OEM pulley ratios"};return Hh(z,0),z}function Hh(i,e){if(!Number.isFinite(e))throw new Error("Ungueltiger Kurbelwinkel fuer den Nebenaggregatetrieb.");for(let t of i.wheels)t.part.rotation.x=e*t.ratio;for(let t of i.belts)for(let n of t.marks){let{point:r,normal:s}=t.path.sample(e*t.driverRadius+n.offset);n.part.position.copy(r).addScaledVector(s,t.thickness/2+.09),n.part.rotation.x=Math.atan2(s.z,s.y)}}var _n=Math.PI*2,Wh=class extends xn{constructor(t){super();this.segments=t;this.total=t.reduce((n,r)=>n+r.length,0)}segments;total;at(t){let n=Math.max(0,Math.min(1,t))*this.total;for(let r of this.segments){if(n<=r.length)return{s:r,u:n/r.length};n-=r.length}return{s:this.segments[this.segments.length-1],u:1}}getPoint(t,n=new I){let{s:r,u:s}=this.at(t);return r.point(s,n)}getPointAt(t,n=new I){return this.getPoint(t,n)}getTangent(t,n=new I){let{s:r,u:s}=this.at(t);return r.tangent(s,n)}getTangentAt(t,n=new I){return this.getTangent(t,n)}getLength(){return this.total}};function Xh(i,e,t,n,r){let s=n[0]-e[0],o=n[1]-e[1],a=Math.hypot(s,o);if(![i,...e,t,...n,r].every(Number.isFinite)||t<=0||r<=0||a<=t+r)throw new RangeError("Timing sprockets need finite, separate pitch circles.");let l=s/a,c=o/a,u=(t-r)/a,h=Math.sqrt(1-u*u),d=[l*u-c*h,c*u+l*h],f=[l*u+c*h,c*u-l*h],p=(b,w,x)=>new I(i,b[0]+w*x[0],b[1]+w*x[1]),y=p(e,t,d),m=p(n,r,d),g=p(e,t,f),_=p(n,r,f),M=(b,w)=>({length:b.distanceTo(w),point:(x,S)=>S.copy(b).lerp(w,x),tangent:(x,S)=>S.copy(w).sub(b).normalize()}),v=(b,w,x,S)=>{let E=Math.atan2(x[1],x[0]),R=((Math.atan2(S[1],S[0])-E)%_n+_n)%_n;return R>0&&(R-=_n),{length:-R*w,point:(A,P)=>{let D=E+R*A;return P.set(i,b[0]+w*Math.cos(D),b[1]+w*Math.sin(D))},tangent:(A,P)=>{let D=E+R*A;return P.set(0,Math.sin(D),-Math.cos(D))}}};return{curve:new Wh([M(y,m),v(n,r,d,f),M(_,g),v(e,t,f,d)]),plus:d,minus:f,ap:y,bp:m,am:g,bm:_,lineLength:y.distanceTo(m)}}function ra(i,e,t=10){return new at(i,{depth:e,steps:1,bevelEnabled:!1,curveSegments:t}).applyMatrix4(new Ne().set(0,0,1,-e/2,1,0,0,0,0,1,0,0,0,0,0,1))}function Uc(i,e,t,n){let r=new ht;r.absarc(e,t,n,0,_n,!0),i.holes.push(r)}function qh(i){let e=i.map(n=>n.index?n.toNonIndexed():n.clone()),t=yt(e);return e.forEach(n=>n.dispose()),i.forEach(n=>n.dispose()),t}function fM(i,e,t,n,r){let s=new je,o=i*_n/e*.21,a=[[-.5,.65],[-.32,.65],[-.19,-.05],[0,-o-.08],[.19,-.05],[.32,.65]];for(let l=0;l<e;l++)for(let c=0;c<a.length;c++){let[u,h]=a[c],d=t+(l+u)*_n/e,f=i+h,p=Math.cos(d)*f,y=Math.sin(d)*f;l===0&&c===0?s.moveTo(p,y):s.lineTo(p,y)}if(s.closePath(),Uc(s,0,0,r==="crank"?4:i*.23),r==="primary")for(let l=0;l<6;l++){let c=l/6*_n;Uc(s,Math.cos(c)*i*.65,Math.sin(c)*i*.65,i*.09)}if(r==="secondary")for(let l=0;l<3;l++){let c=l/3*_n,u=new ht,h=i*.42,d=i*.73,f=.53;u.absarc(0,0,d,c-f,c+f,!1),u.absarc(0,0,h,c+f,c-f,!0),u.closePath(),s.holes.push(u)}return ra(s,n)}function pM(i){let e=i/2,t=i*.29,n=new je;n.moveTo(-e,-t),n.quadraticCurveTo(0,-t*.56,e,-t),n.absarc(e,0,t,-Math.PI/2,Math.PI/2,!1),n.quadraticCurveTo(0,t*.56,-e,t),n.absarc(-e,0,t,Math.PI/2,Math.PI*1.5,!1),n.closePath(),Uc(n,-e,0,i*.105),Uc(n,e,0,i*.105);let r=ra(n,.65,3),s=[r.clone().translate(-2.1,0,0),r.clone().translate(2.1,0,0)];r.dispose();let o=new st(i*.21,i*.21,3.55,6);o.rotateZ(Math.PI/2),o.translate(0,e,0),s.push(o);for(let a of[-2.62,2.62]){let l=new st(i*.125,i*.125,.5,6);l.rotateZ(Math.PI/2),l.translate(a,e,0),s.push(l)}return qh(s)}function mM(i){let e=i*.01,t=i*.1;for(let n=0;n<60;n++){let r=(e+t)/2,s=Xh(0,[0,0],r,[i,0],2*r),o=_n*r/16;s.curve.getLength()/o>140?e=r:t=r}return(e+t)/2}function qm(i,e){if(!Number.isFinite(i))throw new RangeError("A finite head offset is required.");let t=new Ce;t.name="M54B30 Steuertrieb";let n=[],r=[],s=[],o=[],a=e(9345437,.82,.3),l=e(4279120,.73,.43),c=e(12765384,.8,.29),u=e(9147283,.45,.62),h=e(5257515,.05,.72),d=e(2238250,.08,.7),f=X=>{let q=new Ce;return q.name=X,t.add(q),s.push(q),o.push(X),q},p=(X,q,$,pe=0,K=0,H=0,B="")=>{let Z=new Se(X,q);return Z.position.set(pe,K,H),Z.name=B,$.add(Z),Z},y=(X,q,$,pe,K,H,B,Z=20)=>{let ne=new st(q,q,$,Z);return ne.rotateZ(Math.PI/2),p(ne,pe,X,K,H,B)},m=(X,q,$,pe,K,H,B)=>{let Z=new zt(q,$,5,32);return Z.rotateY(Math.PI/2),p(Z,pe,X,K,H,B)},g=(X,q,$,pe,K,H)=>{let B=q.distanceTo($),Z=p(new ot(pe,B,K),H,X);return Z.position.copy(q).lerp($,.5),Z.quaternion.setFromUnitVectors(new I(0,1,0),$.clone().sub(q).normalize()),Z},_=279+i,M=mM(Math.hypot(_,23)),v=46/Math.PI,T=Xh(-333,[0,0],M,[_,23],M*2),b=Xh(-320,[_,-23],v,[_,23],v),w=[{path:T,radius:M,ratio:1,teeth:16,count:140,name:"Primaere Steuerkette"},{path:b,radius:v,ratio:.5,teeth:20,count:40,name:"Sekundaere Steuerkette"}];for(let X of w){let q=X.path.curve.getLength(),$=_n*X.radius/X.teeth,pe=new Zt(pM($),a,X.count);pe.name=X.name,pe.instanceMatrix.setUsage(tn),pe.frustumCulled=!1,pe.userData={pitch:$,teeth:X.teeth,pitchRadius:X.radius},t.add(pe),o.push(X.name),n.push({links:pe,curve:X.path.curve,length:q,pitchRadius:-X.radius*X.ratio})}let x=(X,q,$,pe,K,H,B,Z,ne)=>{let te=new Ce;if(te.name=X,te.position.set(q,$,pe),t.add(te),o.push(X),te.userData={pitchRadius:K,teeth:H,phase:Z},p(fM(K,H,Z+Math.PI/H,3.1,ne),l,te,0,0,0,"Zahnkranz mit Rollentaschen"),m(te,K*.83,.5,a,-1.6,0,0),y(te,ne==="crank"?4.7:K*.3,6,c,0,0,0),ne==="primary")for(let ce=0;ce<3;ce++){let xe=ce/3*_n+.22,ve=Math.cos(xe)*K*.47,Ae=Math.sin(xe)*K*.47,G=new je;G.absarc(0,0,2.2,0,_n),p(ra(G,1.1),c,te,-2,ve,Ae),y(te,1.6,4,a,-3.6,ve,Ae,6)}if(ne==="secondary"){let ce=new Ce;ce.name="VANOS Keilwellenkupplung",te.add(ce),y(ce,5.3,14,l,-11,0,0);let xe=[];for(let ve=0;ve<10;ve++){let Ae=ve/10*_n,G=new ot(13,.9,1);G.rotateX(Ae+.2),G.translate(-10,Math.cos(Ae)*5.4,Math.sin(Ae)*5.4),xe.push(G)}p(qh(xe),c,ce)}return r.push({part:te,ratio:B}),te},S=Math.atan2(T.plus[1],T.plus[0]),E=Math.atan2(b.plus[1],b.plus[0]);x("Kurbelwellenkettenrad",-333,0,0,M,16,1,S,"crank"),x("Primaeres Nockenwellenrad",-333,_,23,M*2,32,.5,S+T.lineLength/(M*2),"primary"),x("Sekundaeres Einlass Nockenwellenrad",-320,_,-23,v,20,.5,E,"secondary"),x("Sekundaeres Auslass Nockenwellenrad",-320,_,23,v,20,.5,E+b.lineLength/v,"secondary");let R=f("M54B30 Steuerketten Gleitschienen"),A=[],P=(X,q,$,pe,K)=>{let H=X.clone().addScaledVector($,pe*.21+.1),B=q.clone().addScaledVector($,pe*.21+.1),Z=new je,ne=q.clone().sub(X).normalize(),te=X.distanceTo(q),ce=2;Z.moveTo(0,.05),Z.lineTo(te,.05),Z.quadraticCurveTo(te+ce,2,te,4.2),Z.lineTo(0,4.2),Z.quadraticCurveTo(-ce,2,0,.05),Z.closePath();let xe=ra(Z,7.2),ve=new Ne().set(1,0,0,H.x,0,ne.y,$.y,H.y,0,ne.z,$.z,H.z,0,0,0,1);p(xe.applyMatrix4(ve),h,R,0,0,0,K),g(R,H.clone().addScaledVector($,5.2),B.clone().addScaledVector($,5.2),8.6,2.6,d);for(let Ae of[.04,.49,.96]){let G=H.clone().lerp(B,Ae).addScaledVector($,6.2);y(R,4.5,Math.abs(-310-G.x),u,(G.x-310)/2,G.y,G.z),y(R,2.2,11,c,G.x-1,G.y,G.z,6),m(R,3.8,.65,l,G.x-5,G.y,G.z)}A.push({from:H,to:B,normal:$,name:K})};P(T.ap.clone().lerp(T.bp,.085),T.ap.clone().lerp(T.bp,.84),new I(0,...T.plus),n[0].links.userData.pitch,"Primaere Spannschiene"),P(T.am.clone().lerp(T.bm,.09),T.am.clone().lerp(T.bm,.81),new I(0,...T.minus),n[0].links.userData.pitch,"Primaere feste Gleitschiene");let D=f("M54B30 angebundener hydraulischer Kettenspanner"),F=A[0],z=F.from.clone().lerp(F.to,.87).addScaledVector(F.normal,4.2),L=F.normal.clone(),V=(X,q,$,pe,K=20)=>{let H=new st(X,X,q,K),B=p(H,pe,D);return B.quaternion.setFromUnitVectors(new I(0,1,0),L),B.position.copy($),B};V(2.7,9,z.clone().addScaledVector(L,4.5),c),V(5.6,13,z.clone().addScaledVector(L,14.5),u),V(7,5,z.clone().addScaledVector(L,23.5),c,6);let k=z.clone().addScaledVector(L,13);y(D,8,20,u,-320,k.y,k.z);for(let X of[8.7,11,13.3,15.6,17.9])V(5.85,.7,z.clone().addScaledVector(L,X),l);let W=f("M54B30 mittlerer Kettenfuehrer und Sekundaerspanner"),J=n[1].links.userData.pitch*.21,oe=_-v+J+1.58,re=_+v-J-1.58;p(new ot(8,3,22),h,W,-320,oe,0,"Unterer Kettengleitbelag"),p(new ot(8,3,22),h,W,-320,re,0,"Oberer Kettenspannbelag"),p(new ot(11,7,16),d,W,-315,oe+4,0),p(new ot(12,4,18),u,W,-315,re-4.3,0);for(let X of[-6,6]){p(new ot(8,12,5),u,W,-311,re-10,X),y(W,2,14,c,-316,re-11,X,6);let q=new st(2.6,2.6,7,12);p(q,c,W,-316,re-4,X)}for(let X of[-6,0,6])y(W,2,12,a,-314,re-12,X,6);for(let X of[-6,6])y(W,2.2,14,c,-315,oe+5,X,6);W.userData.mountingBolts=4,W.userData.guideBolts=2;let Te=f("M54B30 Doppel VANOS Stellkolben im Schnitt");Te.userData.cutawayOnly=!0;for(let X of[-23,23]){let q=new je,$=Math.PI*.36,pe=_n-$;for(let K=0;K<=40;K++){let H=$+(pe-$)*K/40,B=17*Math.cos(H),Z=17*Math.sin(H);K===0?q.moveTo(B,Z):q.lineTo(B,Z)}for(let K=40;K>=0;K--){let H=$+(pe-$)*K/40;q.lineTo(13.7*Math.cos(H),13.7*Math.sin(H))}q.closePath(),p(ra(q,25),u,Te,-358,_,X),y(Te,7.2,10,c,-357,_,X),y(Te,4.6,24,c,-344,_,X),m(Te,7.2,.65,l,-363,_,X);for(let K of[Math.PI*.64,Math.PI,Math.PI*1.36]){let H=_+Math.cos(K)*18,B=X+Math.sin(K)*18;y(Te,3.6,9,u,-364,H,B),y(Te,2,10,a,-369,H,B,6)}y(Te,5.4,13,d,-359,_-30,X),m(Te,6.2,.8,c,-365,_-30,X)}p(new ot(17,11,69),u,Te,-354,_-23,0,"VANOS Gehaeusebruecke");for(let X of[-42,42])y(Te,4.5,37,u,-339,_-22,X),y(Te,2.5,10,c,-361,_-22,X,6);for(let{part:X}of r){X.updateMatrixWorld(!0);let q=X.matrixWorld.clone().invert(),$=new Map;X.traverse(pe=>{if(pe instanceof Se&&!Array.isArray(pe.material)){let K=$.get(pe.material)??[];K.push(pe),$.set(pe.material,K)}});for(let[pe,K]of $){if(K.length<2)continue;let H=qh(K.map(B=>B.geometry.clone().applyMatrix4(new Ne().multiplyMatrices(q,B.matrixWorld))));for(let B of K)B.removeFromParent(),B.geometry.dispose();p(H,pe,X)}}let Ee=new Ne,Re=new vt,se=new I(1,0,0),le=new I(1,1,1);for(let X of n){for(let q=0;q<X.links.count;q++){let $=q/X.links.count,pe=X.curve.getTangentAt($);Re.setFromAxisAngle(se,Math.atan2(pe.z,pe.y)),Ee.compose(X.curve.getPointAt($),Re,le),X.links.setMatrixAt(q,Ee)}X.links.instanceMatrix.needsUpdate=!0}return t.userData={illustrative:!0,primaryPitch:n[0].links.userData.pitch,secondaryPitch:n[1].links.userData.pitch},{chain:n,sprockets:r,root:t,staticGroups:s,partNames:o}}var zr=Math.PI*2;function Km(i){let e=new Ce;e.name="Schwungrad mit Starterzahnkranz";let t=i(6648950,.72,.48),n=i(12437963,.8,.34),r=i(7831940,.76,.42),s=i(3424840,.64,.48),o=(M,v,T)=>{let b=new Se(M,v);return b.name=T,e.add(b),b},a=(M,v,T=0,b=0)=>{let w=new ht;w.absarc(T,b,v,0,zr,!0),M.holes.push(w)},l=(M,v,T,b=!1)=>{let w=new je;w.absarc(0,0,M,0,zr,!1),a(w,17);for(let S=0;S<8;S++){let E=S/8*zr;a(w,5,Math.sin(E)*33,Math.cos(E)*33)}if(b)for(let S=0;S<6;S++){let E=S/6*zr,R=new ht,A=E-.23,P=E+.23;R.absarc(0,0,58,A,P,!1),R.lineTo(Math.cos(P)*48,Math.sin(P)*48),R.absarc(0,0,48,P,A,!0),R.closePath(),w.holes.push(R),a(w,2.5,Math.sin(E)*125,Math.cos(E)*125)}let x=new at(w,{depth:v,bevelEnabled:!0,bevelThickness:.6,bevelSize:.6,bevelSegments:2,curveSegments:64});return x.applyMatrix4(new Ne().set(0,0,1,T,1,0,0,0,0,1,0,0,0,0,0,1)),x},c=o(l(136,15,-10),t,"Schwungmasse");c.userData.role="primary-housing";let u=o(l(133,11,8,!0),n,"Schwungmasse");u.userData.role="secondary-friction-plate";let h=o(l(44,6,3),r,"Schwungmasse");h.userData.role="crank-mounting-hub";let d=[[129,3.5],[133,3.5],[133,8.5],[129,8.5],[129,3.5]].map(([M,v])=>new me(M,v)),f=new jt(d,96);f.rotateZ(-Math.PI/2),o(f,t,"Absatz zwischen Primaer und Sekundaermasse");let p=new je,y=120;for(let M=0;M<y;M++)for(let[v,T]of[[0,138.5],[.22,138.5],[.36,143.5],[.65,143.5],[.79,138.5]]){let b=(M+v)/y*zr,w=Math.sin(b)*T,x=Math.cos(b)*T;M===0&&v===0?p.moveTo(w,x):p.lineTo(w,x)}p.closePath(),a(p,131.5);let m=new at(p,{depth:9,bevelEnabled:!0,bevelThickness:.22,bevelSize:.22,bevelSegments:1,curveSegments:64});m.applyMatrix4(new Ne().set(0,0,1,-9,1,0,0,0,0,1,0,0,0,0,0,1)),o(m,r,"Durchgehender trapezverzahnter Starterkranz");let g=[];for(let M=0;M<8;M++){let v=M/8*zr,T=new st(3.65,3.65,3.4,6);T.rotateZ(Math.PI/2),T.translate(10.5,Math.sin(v)*33,Math.cos(v)*33),g.push(T)}for(let M=0;M<3;M++){let v=(M/3+.055)*zr,T=new st(2.3,2.3,5,16);T.rotateZ(Math.PI/2),T.translate(22,Math.sin(v)*125,Math.cos(v)*125),g.push(T)}let _=yt(g);return g.forEach(M=>M.dispose()),o(_,s,"Acht versenkte Kurbelwellenschrauben und Kupplungspassstifte"),e.userData={reference:"LuK 415 0122 10 / BMW 21217512474",dimensions:"photo-informed authored approximation",frictionDiameter:240,outerRadius:143.72,teeth:y},e}var gM=new Set(["radiator","radiator-return","expansion-vent","expansion-return"]);function Ym(i){let e=new Ce;e.name="Kuehler und Luefter zur Antriebseinsicht";let t=i(8885141,.65,.55),n=i(3621960,.46,.63),r=i(2239792,.12,.68),s=i(8885654,.7,.4),o=(T,b,w,x=0,S=0,E=0)=>{let R=new Se(T,b);return R.position.set(x,S,E),w.add(R),R},a=(T,b,w,x,S,E,R)=>o(new ot(T,b,w),x,e,S,E,R),l=(T,b,w,x,S,E,R)=>{let A=new st(b,b,w,32);return A.rotateZ(Math.PI/2),o(A,x,T,S,E,R)},c=a(Ge.coreDepth,Ge.coreHeight,Ge.coreWidth,t,Ge.x,Ge.y,Ge.z);c.name="Kuehlernetz 650 x 438 x 32";let u=[];for(let T=-Ge.coreHeight/2+5;T<Ge.coreHeight/2;T+=6){let b=new ot(Ge.coreDepth+1.2,.7,Ge.coreWidth);b.translate(Ge.x,Ge.y+T,Ge.z),u.push(b)}let h=yt(u);u.forEach(T=>T.dispose()),o(h,n,e).name="Geb\xFCndelte K\xFChlernetz-Lamellen";for(let T of[-1,1]){let b=Ge.z+T*(Ge.coreWidth/2+Ge.tankWidth/2);a(Ge.coreDepth+7,Ge.coreHeight+6,Ge.tankWidth,r,Ge.x,Ge.y,b).name="Seitlicher Wasserkasten"}for(let T of[Ge.y-Ge.coreHeight/2,Ge.y+Ge.coreHeight/2])a(7,6,Ge.coreWidth,s,Ge.x,T,Ge.z);for(let T of[-1,1]){let b=Ge.z+T*(Ge.coreWidth/2-30);a(12,84,12,s,Ge.x,-198,b).name="Kuehlerstaender",a(46,8,34,s,Ge.x,-243,b).name="Kuehlerstaender Fuss"}for(let[T,b,w]of[Ge.upper,Ge.lower])l(e,13,24,r,T-12,b,w).name="Kuehler Schlauchstutzen";let d=new je;d.moveTo(-Ge.coreHeight/2,-Ge.coreWidth/2),d.lineTo(Ge.coreHeight/2,-Ge.coreWidth/2),d.lineTo(Ge.coreHeight/2,Ge.coreWidth/2),d.lineTo(-Ge.coreHeight/2,Ge.coreWidth/2),d.closePath();let f=new ht;f.absarc(0,0,Ge.fanRadius+4,0,Math.PI*2,!0),d.holes.push(f);let p=new at(d,{depth:8,bevelEnabled:!1,curveSegments:64});p.applyMatrix4(new Ne().set(0,0,1,Ge.x+Ge.coreDepth/2+.2,1,0,0,Ge.y,0,1,0,Ge.z,0,0,0,1)),o(p,r,e).name="Luefterzarge mit offener Rundung";let y=new zt(Ge.fanRadius+4,2.2,6,72);y.rotateY(Math.PI/2),o(y,r,e,Ge.x+Ge.coreDepth/2+8.4,Ge.y,Ge.z);let m=new Ce;m.name="Kuehlerluefter",m.position.set(Ge.fanX,Ge.y,Ge.z),e.add(m),l(m,23,19,s,7,0,0),l(m,8,144,s,72,0,0);let g=new je;g.moveTo(22,-9),g.quadraticCurveTo(92,-40,170,-31),g.quadraticCurveTo(204,-25,207,-6),g.quadraticCurveTo(207,3,195,8),g.quadraticCurveTo(105,19,24,13),g.closePath();let _=new at(g,{depth:3,bevelEnabled:!1,curveSegments:16});_.applyMatrix4(new Ne().set(0,0,1,-1.5,1,0,0,0,0,1,0,0,0,0,0,1));let M=[];for(let T=0;T<11;T++)M.push(_.clone().applyMatrix4(new Ne().makeRotationX(T*Math.PI*2/11)));let v=yt(M);return M.forEach(T=>T.dispose()),_.dispose(),o(v,r,m).name="Elf geformte Luefterschaufeln",e.userData={illustrative:!0,core:[Ge.coreWidth,Ge.coreHeight,Ge.coreDepth],fanDiameter:2*Ge.fanRadius,blades:11,pumpAxis:[Ge.y,Ge.z]},{root:e,fan:m}}function Zm(i,e){let t=new Ce;t.name="Geformte Kuehlerschlaeuche an gemeinsamen Anschluessen";let n=e(1187363,.02,.87),r=e(2372667,.12,.71),s=[],o=[],a=[];for(let d of zn(i).filter(f=>f.medium==="water"&&gM.has(f.branch??""))){let f=new Ot(d.coords.map(y=>new I().fromArray(y)),!1,"centripetal"),p=d.radius+.8;o.push(new nn(f,64,p,14,!1)),s.push({branch:d.branch,curve:f,radius:p,endpoints:[d.coords[0],d.coords.at(-1)].map(y=>[...y])});for(let y of[0,1]){let m=y===0?Math.min(.1,7/f.getLength()):1-Math.min(.1,7/f.getLength()),g=f.getPointAt(m),_=f.getTangentAt(m),M=new st(p+1.6,p+1.6,13,24,1,!0);M.applyQuaternion(new vt().setFromUnitVectors(new I(0,1,0),_)),M.translate(g.x,g.y,g.z),a.push(M)}}let l=yt(o);o.forEach(d=>d.dispose());let c=new Se(l,n);c.name="Zusammengefasste geformte Kuehlerschlaeuche",t.add(c);let u=yt(a);a.forEach(d=>d.dispose());let h=new Se(u,r);return h.name="An den vorhandenen Stutzen sitzende Schlauchenden",t.add(h),t.userData={layout:"shared-coolant-routes",branches:s.map(d=>d.branch),revision:"formed-hoses-r6"},{root:t,hoses:s,materials:[n,r]}}function jm(i,e,t){i.root.visible=e!=="flow"&&t!=="off";let n=e==="cutaway";for(let r of i.materials)r.transparent!==n&&(r.transparent=n,r.needsUpdate=!0),r.opacity=n?.22:1,r.depthWrite=!n}var Kh=new I(0,1,0),Jm=new I(0,0,1);function $m(i,e){let t=new Ce;t.name="Kraftstoffleiste Injektoren";let n=(l,c,u)=>{let h=new Se(l,c);return h.name=u,t.add(h),h},r=(l,c,u,h)=>{let d=n(new ot(l[0],l[1],l[2]),u,h);return d.position.copy(c),d},s=(l,c,u,h,d,f,p,y=16)=>{let m=n(new st(l,c,u,y),f,p);return m.position.copy(h),m.quaternion.setFromUnitVectors(Kh,d),m},o=new I(-7,261+i,-130);r([548,11,12],o,e.steel,"Durchgehende Metall-Kraftstoffleiste");let a=cn(i);for(let l=0;l<ze.length;l++){let c=ze[l],u=new I(c-7,258+i,-130),d=new I(...a.injection[l]).clone().sub(u),f=d.length();d.normalize();let p=_=>u.clone().addScaledVector(d,f*_);s(5.2,5.2,f*.17,p(.085),d,e.steel,`Einlasssitz D\xFCse ${l+1}`),s(6.8,6.8,f*.12,p(.16),d,e.steel,`Haltekragen D\xFCse ${l+1}`),s(7.2,6.3,f*.4,p(.42),d,e.black,`D\xFCsenk\xF6rper ${l+1}`),s(5.8,3.5,f*.15,p(.69),d,e.black,`D\xFCsenschulter ${l+1}`),s(3.4,3.4,f*.23,p(.885),d,e.brass,`D\xFCsenspitze ${l+1}`);let y=s(3.9,3.9,2.4,p(.91),d,e.rubber,`Dichtung D\xFCse ${l+1}`);y.userData.decorativeSeal=!0,r([11,12,10],p(.37).add(new I(-9,0,0)),e.rubber,`Steckergeh\xE4use D\xFCse ${l+1}`).quaternion.setFromUnitVectors(Kh,d);let g=n(new zt(7.4,.8,5,20,Math.PI*1.65),e.steel,`Halteklammer D\xFCse ${l+1}`);g.position.copy(p(.22)),g.quaternion.setFromUnitVectors(Jm,d)}for(let l of[-190,190]){let c=new I(l,260+i,-130),u=new I(l,253+i,-87),h=u.clone().sub(c);r([12,2.2,h.length()],c.clone().add(u).multiplyScalar(.5),e.steel,"Halter der Kraftstoffleiste").quaternion.setFromUnitVectors(Jm,h.normalize()),s(3.3,3.3,3.5,u,Kh,e.steel,"Befestigung der Kraftstoffleiste",6)}return t}var Bc=Object.freeze({ambientK:293.15,massKgPerBank:2.5,metalCpJPerKgK:500,exposedAreaM2PerBank:.12,ambientConvectionWPerM2K:10,emissivity:.75,gasToWallConductanceWPerK:100,exhaustCpJPerMolK:33,maxFlowMolS:50}),Qm=.25,Oc=.2,xM=.05,yM=5670374419e-17,Zh=1e-8,Rn=i=>typeof i=="number"&&Number.isFinite(i),ng=(i,e,t)=>Math.min(t,Math.max(e,i));function ig(i,e){return Rn(i)&&i>=150&&i<=400?i:e}function jh(i){return!i||!Rn(i.temperatureK)||i.temperatureK<150||i.temperatureK>3e3||!Rn(i.flowMolS)||i.flowMolS<=0?null:{temperatureK:i.temperatureK,flowMolS:Math.min(i.flowMolS,Bc.maxFlowMolS)}}function kc(i=Bc.ambientK){let e=ig(i,Bc.ambientK),t=()=>({temperatureK:e,gasPowerW:0,ambientPowerW:0});return{banks:[t(),t()],ambientK:e,lastSampleTimeS:null,sampleAgeS:1/0,heldBanks:[null,null]}}function Yh(i){i.heldBanks=[null,null],i.sampleAgeS=1/0}function eg(i,e,t,n){let r=Bc,s=n;for(;s>1e-12;){let o=Math.min(s,xM),a=i.temperatureK,l=e?e.flowMolS*r.exhaustCpJPerMolK:0,c=l>0?l*-Math.expm1(-r.gasToWallConductanceWPerK/l):0,u=e?c*(e.temperatureK-a):0,h=r.ambientConvectionWPerM2K*r.exposedAreaM2PerBank*(t-a),d=r.emissivity*yM*r.exposedAreaM2PerBank*(t**4-a**4);i.gasPowerW=u,i.ambientPowerW=h+d,i.temperatureK=ng(a+o*(u+i.ambientPowerW)/(r.massKgPerBank*r.metalCpJPerKgK),150,3e3),s-=o}}function rg(i,e,t){if(i.ambientK=ig(e?.ambientK,i.ambientK),!Rn(t)||t<0)return Yh(i),i;let n=e?.sampleTimeS,r=e?.running===!0&&Rn(n)&&n>=0&&Rn(e.sampleAgeS)&&e.sampleAgeS>=0&&e.sampleAgeS<Oc&&Array.isArray(e.banks)&&e.banks.length===2,s=r?[jh(e.banks[0]),jh(e.banks[1])]:[null,null],o=r&&i.lastSampleTimeS!==null&&n<i.lastSampleTimeS-Zh,a=r&&!o&&(i.lastSampleTimeS===null||n>i.lastSampleTimeS+Zh),l=t>Qm;if((!r||o||l)&&Yh(i),r)for(let h=0;h<2;h++)s[h]||(i.heldBanks[h]=null);r&&Number.isFinite(i.sampleAgeS)&&(i.sampleAgeS=Math.max(i.sampleAgeS,Math.max(0,e.sampleAgeS-t)));let c=Math.min(t,Qm),u=r&&!o&&!l?Math.min(c,Math.max(0,Oc-i.sampleAgeS)):0;for(let h=0;h<2;h++)u>0&&eg(i.banks[h],i.heldBanks[h],i.ambientK,u),c>u&&eg(i.banks[h],null,i.ambientK,c-u),c===0&&(i.banks[h].gasPowerW=0,i.banks[h].ambientPowerW=0);return Number.isFinite(i.sampleAgeS)&&(i.sampleAgeS+=t),i.sampleAgeS>=Oc&&Yh(i),o?i.lastSampleTimeS=n:a&&(i.lastSampleTimeS=n,i.heldBanks=s,i.sampleAgeS=e.sampleAgeS),i}function sg(i,e,t,n,r){let s=()=>({banks:[null,null],running:!1,ambientK:r,sampleTimeS:null,sampleAgeS:t});if(!n||!Rn(e)||e<0||!Rn(t)||t<0||t>=Oc||!i||typeof i!="object")return s();let o=i;if(o.origin!=="native-exhaust-system"||!Array.isArray(o.banks)||o.banks.length!==2||!Array.isArray(o.wave)||o.wave.length<2)return s();let a=o.wave.slice(-64),l=a[a.length-1];if(!Array.isArray(l)||l.length!==6||!Rn(l[0])||l[0]<0||l[0]>e+.01||e-l[0]>.2)return s();let c=l[0],u=c,h=c,d=0,f=0,p=0;for(let _=a.length-1;_>=0;_--){let M=a[_];if(!Array.isArray(M)||M.length!==6||!Rn(M[0])||!Rn(M[2])||!Rn(M[4])||M[0]>u+Zh)return s();if(u-M[0]>.05||c-M[0]>.08)break;u=h=M[0],d+=M[2],f+=M[4],p++}if(p<2||c-h<.004)return s();let y=[d,f],m=o.banks;return{banks:[0,1].map(_=>{let M=m[_];return M&&Rn(M.temperatureK)?jh({temperatureK:M.temperatureK,flowMolS:y[_]/p}):null}),running:!0,ambientK:r,sampleTimeS:c,sampleAgeS:t}}function tg(i,e,t){let n=ng((t-i)/(e-i),0,1);return n*n*(3-2*n)}function og(i){if(!Rn(i)||i<=775)return{r:1,g:.003,b:0,intensity:0};let e=Math.sqrt(tg(775,1200,i)),t=tg(975,1325,i);return{r:1,g:.003+.1*t,b:.003*t,intensity:.42*e}}var bM=[["Zusammenh\xE4ngender Dreierkr\xFCmmer 1\u20133","Integrierter Anschlusskragen -250","Integrierter Anschlusskragen -150","Integrierter Anschlusskragen -50"],["Zusammenh\xE4ngender Dreierkr\xFCmmer 4\u20136","Integrierter Anschlusskragen 50","Integrierter Anschlusskragen 150","Integrierter Anschlusskragen 250"]];function ag(i){let e=[[],[]];for(let a of[0,1])for(let l of bM[a]){let c=i.children.filter(h=>h.name===l),u=c[0];if(c.length!==1||!(u instanceof Se)||Array.isArray(u.material)||!(u.material instanceof _t))return null;e[a].push(u)}let t=[[],[]],n=[],r=new Set;try{for(let a of[0,1]){let l=new Map;for(let c of e[a]){let u=c.material;r.add(u);let h=l.get(u);h||(h=Ac(u),h.userData.exhaustHeatBank=a,l.set(u,h),t[a].push({material:h,base:u.emissive.clone().multiplyScalar(u.emissiveIntensity)})),n.push({mesh:c,material:h})}}}catch(a){for(let l of t)for(let c of l)c.material.dispose();throw a}for(let a of n)a.mesh.material=a.material;let s=!1,o=[t[0].length,t[1].length];return{apply(a){if(s)return!1;let l=!1;for(let c of[0,1]){let u=og(a[c]);for(let{material:h,base:d}of t[c]){let f=d.r+u.r*u.intensity,p=d.g+u.g*u.intensity,y=d.b+u.b*u.intensity;(Math.abs(h.emissive.r-f)>5e-5||Math.abs(h.emissive.g-p)>5e-5||Math.abs(h.emissive.b-y)>5e-5||h.emissiveIntensity!==1)&&(h.emissive.setRGB(f,p,y),h.emissiveIntensity=1,l=!0)}}return l},release(){s=!0,t[0].length=0,t[1].length=0,r.clear()},replacedSourceMaterials(){return[...r]},diagnostics(){return{boundMeshes:8,bankMaterials:[...o],released:s}}}}var sa=Math.PI*2;function vM(i,e,t,n=Math.PI*.58){let r=new je,s=n/2,o=sa-n/2,a=44;for(let c=0;c<=a;c++){let u=s+(o-s)*c/a,h=i*Math.sin(u),d=i*Math.cos(u);c===0?r.moveTo(h,d):r.lineTo(h,d)}for(let c=a;c>=0;c--){let u=s+(o-s)*c/a;r.lineTo((i-e)*Math.sin(u),(i-e)*Math.cos(u))}r.closePath();let l=new at(r,{depth:t,steps:1,bevelEnabled:!1,curveSegments:24});return l.applyMatrix4(new Ne().set(0,0,1,-t/2,1,0,0,0,0,1,0,0,0,0,0,1)),l}function hg(i){let{extras:e,housing:t,head:n,deck:r,headOffset:s,boreScale:o,mat:a}=i,l=cn(s),c=[],u=[],h=a(7636364,.45,.65),d=a(12437963,.72,.34),f=a(10201514,.75,.38),p=a(2372667,.24,.58),y=a(1187363,.03,.83),m=a(10717784,.55,.45),g=a(12891283,.1,.75),_=a(12423539,.28,.55),M=new _t({color:11060424,roughness:.4,metalness:.1,opacity:.13,transparent:!0,depthWrite:!1,side:Mt,forceSinglePass:!0}),v=new Yt({color:8500682,transparent:!0,opacity:.18,depthWrite:!1}),T=(U,Y)=>{let ae=new Ce;return ae.name=U,Y.add(ae),c.push(U),u.push(ae),ae},b=(U,Y,ae,ge=0,ie=0,de=0)=>{let ye=new Se(U,Y);return ye.position.set(ge,ie,de),ae.add(ye),ye},w=(U,Y,ae,ge,ie,de=0,ye=0,Pe=0)=>b(new ot(Y,ae,ge),ie,U,de,ye,Pe),x=(U,Y,ae,ge,ie=0,de=0,ye=0,Pe="y",we=24)=>{let Me=b(new st(Y,Y,ae,we),ge,U,ie,de,ye);return Pe==="x"&&(Me.rotation.z=Math.PI/2),Pe==="z"&&(Me.rotation.x=Math.PI/2),Me},S=(U,Y,ae,ge,ie,de,ye,Pe="x")=>{let we=b(new zt(Y,ae,6,32),ge,U,ie,de,ye);return Pe==="x"?we.rotation.y=Math.PI/2:Pe==="y"&&(we.rotation.x=Math.PI/2),we},E=(U,Y,ae,ge,ie)=>{let de=new I(...Y),ye=new I(...ae),Pe=ye.clone().sub(de),we=x(U,ge,Pe.length(),ie);return we.position.copy(de.add(ye).multiplyScalar(.5)),we.quaternion.setFromUnitVectors(new I(0,1,0),Pe.normalize()),we},R=(U,Y,ae,ge,ie,de,ye,Pe,we)=>b(vM(Y,ae,ge,we),ie,U,de,ye,Pe),A=Im({deck:r,headOffset:s,boreScale:o,materials:{cast:h,machined:d,steel:f,black:p,rubber:y,brass:m,cut:_}}),P=A.closed;t.add(A.cutBlock,A.cutHead,P),e.add(A.portMounts),u.push(...A.groups),c.push(...A.groups.map(U=>U.name));let D=T("Nockenwellenlager und Zuendkerzen",n);for(let U of ze)x(D,4,15,g,U,229,0),x(D,5.2,5,f,U,220,0,"y",6),x(D,1.3,9,f,U,210,0);let F=d;for(let U of[-23,23])x(D,7,610,F,0,279,U,"x");for(let U=0;U<7;U++)for(let Y of[-23,23])w(D,12,11,19,h,-300+U*100,279,Y),x(D,2.2,16,f,-300+U*100,289,Y,"y",6);let z=T("Gegossene Oelwanne",e),L=new je;L.moveTo(-308,-53),L.lineTo(308,-53),L.lineTo(300,-93),L.quadraticCurveTo(297,-103,285,-103),L.lineTo(83,-103),L.quadraticCurveTo(64,-103,58,-88),L.lineTo(40,-78),L.lineTo(-286,-78),L.quadraticCurveTo(-306,-78,-308,-63),L.closePath();for(let U of[-69,65])b(new at(L,{depth:4,bevelEnabled:!0,bevelThickness:.8,bevelSize:.8,bevelSegments:1,curveSegments:16}),h,z,0,0,U);let V=[[-308,-63],[-286,-78],[40,-78],[58,-88],[83,-103],[285,-103],[300,-93],[308,-53]];for(let U=1;U<V.length;U++){let Y=V[U-1],ae=V[U],ge=Math.hypot(ae[0]-Y[0],ae[1]-Y[1]),ie=w(z,ge,4,134,h,(Y[0]+ae[0])/2,(Y[1]+ae[1])/2,0);ie.rotation.z=Math.atan2(ae[1]-Y[1],ae[0]-Y[0])}w(z,5,13,134,h,-306,-59,0);for(let U of[-70,70])w(z,623,5,8,d,0,-51,U);for(let U=-278;U<300;U+=38){w(z,4,Math.max(5,U>65?34:13),3,h,U,U>65?-77:-66,70);for(let Y of[-70,70])x(z,2.7,4,f,U,-46,Y,"y",6)}x(z,5,5,m,282,-105,-33,"y",6);let k=Hm(s,a,i.confirmedSelection),W=k.throttle;e.add(k.details,W),P.add(k.closed),t.add(k.cut),u.push(...k.groups),c.push(...k.groups.map(U=>U.name));let J=$m(s,{steel:f,black:p,rubber:y,brass:m});e.add(J),u.push(J),c.push(J.name);let oe=T("Abgasnachbehandlung",e),re=Bm(s,a),Te=ag(re.closed);P.add(re.closed),e.add(re.details),t.add(re.cut),u.push(...re.groups),c.push(...re.groups.map(U=>U.name));let Ee=(U,Y)=>{let ae=new je;ae.absellipse(0,0,U,Y,0,sa,!1);for(let ie of[-37,37]){let de=new ht;de.absarc(0,ie,20.7,0,sa,!0),ae.holes.push(de)}let ge=new at(ae,{depth:2.5,bevelEnabled:!1,curveSegments:24});return ge.applyMatrix4(new Ne().set(0,0,1,-1.25,1,0,0,0,0,1,0,0,0,0,0,1)),ge};for(let[U,Y,ae,ge]of[[l.middleSilencer,110,36,67],[l.rearSilencer,150,47,79]]){let[ie,de,ye]=U,Pe=R(oe,ae,2.5,Y,f,ie,de,ye,Math.PI*.7);Pe.scale.z=ge/ae;let we=R(P,ae,2.5,Y,f,ie,de,ye,0);we.scale.z=ge/ae;for(let Me of[-1,1]){let Be=S(oe,ae,1.5,d,ie+Me*Y/2,de,ye);Be.scale.x=ge/ae;let Ye=b(Ee(ae,ge),f,oe,ie+Me*Y/2,de,ye);Ye.name="Zweiflutiger Schalldaempfer mit echten Anschlussbohrungen"}for(let Me of[-Y*.23,Y*.23])b(Ee(ae-3,ge-3),p,oe,ie+Me,de,ye);for(let Me of[-37,37])for(let Be=-Y*.38;Be<Y*.4;Be+=9)for(let Ye=0;Ye<4;Ye++){let lt=Math.PI*.4+Ye/4*Math.PI*1.2;x(oe,.9,3,p,ie+Be,de+Math.sin(lt)*21,ye+Me+Math.cos(lt)*21,"y",5)}for(let Me of[-Y*.31,Y*.31]){let Be=R(oe,ae+1.4,2,5,p,ie+Me,de,ye,Math.PI*.7);Be.scale.z=ge/ae}}let Re=Dm(l.tails,a);e.add(Re),u.push(Re),c.push(Re.name);let se=T("Kuehler Pumpe Thermostat Ausgleich",e),le=Ym(a),X=le.root,q=le.fan;e.add(X),u.push(X),c.push(X.name);let[$,pe,K]=l.pump;x(se,24,22,h,$,pe,K,"x"),x(se,15,25,d,$,pe,K,"x");for(let U of[0,Math.PI*2/3,Math.PI*4/3])x(se,3,25,f,$,pe+Math.sin(U)*25,K+Math.cos(U)*25,"x",6);let H=Xm(l.pump,a),B=H.pulley;e.add(H.root),u.push(...H.staticGroups),c.push(...H.partNames),x(se,17,28,h,l.thermostat[0],l.thermostat[1],l.thermostat[2],"x"),S(se,17,2,d,l.thermostat[0]-14,l.thermostat[1],l.thermostat[2]);for(let U of[0,sa/3,sa*2/3])x(se,2.6,31,f,l.thermostat[0],l.thermostat[1]+Math.sin(U)*19,l.thermostat[2]+Math.cos(U)*19,"x",6);let Z=T("Ausgleichsbehaelter",e),[ne,te,ce]=l.expansionTop;x(Z,20,74,M,ne,te-40,ce),x(Z,17,30,v,ne,te-63,ce),x(Z,15,10,p,ne,te,ce),x(Z,17,6,p,ne,te+7,ce,"y",10),S(Z,20,2,p,ne,te-77,ce,"y"),S(Z,20,2,p,ne,te-3,ce,"y"),w(Z,8,44,8,p,ne,te-41,ce-18);let xe=Zm(s,a);e.add(xe.root),c.push(xe.root.name);let ve=qm(s,a),Ae=ve.chain,G=ve.sprockets;e.add(ve.root),u.push(...ve.staticGroups),c.push(...ve.partNames);let nt=T("M54B30 Oelfiltergehaeuse Motortraeger",e);x(nt,21,56,h,-248,154,-107),x(nt,23,9,p,-248,186,-107,"y",12),x(nt,12,5,p,-248,193,-107,"y",6),w(nt,43,27,31,h,-248,115,-91),E(nt,[-248,122,-90],[-281,88,-70],9,h);let Je=new Set;for(let U of[...u,q,B])U.traverse(Y=>{Y instanceof Ce&&Je.add(Y)});for(let U of Je){let Y=new Map;for(let ae of U.children)if(ae instanceof Se&&!(ae instanceof Zt)&&!Array.isArray(ae.material)){let ge=Y.get(ae.material)??[];ge.push(ae),Y.set(ae.material,ge)}for(let[ae,ge]of Y){if(ge.length<2)continue;let ie=ge.map(ye=>(ye.updateMatrix(),(ye.geometry.index?ye.geometry.toNonIndexed():ye.geometry.clone()).applyMatrix4(ye.matrix)));if(ie.some(ye=>ye.hasAttribute("uv")))for(let ye of ie)ye.hasAttribute("uv")||ye.setAttribute("uv",new tt(new Float32Array(ye.getAttribute("position").count*2),2));let de=yt(ie);if(ie.forEach(ye=>ye.dispose()),!!de){for(let ye of ge)ye.removeFromParent(),ye.geometry.dispose();b(de,ae,U)}}}let O=new Map;X.traverse(U=>{if(U instanceof Se){let Y=ae=>{let ge=O.get(ae);return ge||(ge=Ac(ae),O.set(ae,ge)),ge};U.material=Array.isArray(U.material)?U.material.map(Y):Y(U.material)}});let C=k.closed.getObjectByName("DISA Kopplung im geschlossenen Gehaeuse"),j=U=>{k.disaFlap.visible=!0,C&&(C.visible=!0),k.setDisaOpen(U!=="closed")};return{chain:Ae,sprockets:G,timingDrive:ve,accessoryDrive:H,coolingPlumbing:xe,radiator:X,fan:q,pulley:B,throttle:W,partNames:c,closedHousing:P,intakeVariant:k.variant,setDisaIllustration:j,manifoldHeat:Te}}var lg=new I,Jh=new I,cg=new vt,ug=new Ne,_M=new I(1,1,1),MM=new I(1,0,0);function $h(i,e,t,n){for(let r of i.sprockets)r.part.rotation.x=e*r.ratio;for(let r of i.chain){let s=e*r.pitchRadius/r.length;for(let o=0;o<r.links.count;o++){let a=((o/r.links.count+s)%1+1)%1;r.curve.getPointAt(a,lg),r.curve.getTangentAt(a,Jh),cg.setFromAxisAngle(MM,Math.atan2(Jh.z,Jh.y)),ug.compose(lg,cg,_M),r.links.setMatrixAt(o,ug)}r.links.instanceMatrix.needsUpdate=!0}Hh(i.accessoryDrive,e),i.fan.rotation.x=e*.72,i.throttle.rotation.y=.08+Math.max(0,Math.min(1,t))*1.43,i.fan.userData.rpm=n*.72}function dg(i){return Km(i)}function Vr(i,e=new Set,t=new Set){let n=new Set,r=new Set,s=new Set;i.traverse(l=>{l instanceof Zt&&s.add(l);let c=l;c.geometry&&n.add(c.geometry);for(let u of Array.isArray(c.material)?c.material:c.material?[c.material]:[])e.has(u)||r.add(u)});let o=new Set;for(let l of r)for(let c of Object.values(l))c instanceof Gt&&!t.has(c)&&o.add(c);let a=new Set;for(let l of o)typeof ImageBitmap<"u"&&l.source.data instanceof ImageBitmap&&a.add(l.source.data),l.dispose();return a.forEach(l=>l.close()),s.forEach(l=>l.dispose()),n.forEach(l=>l.dispose()),r.forEach(l=>l.dispose()),{geometries:n.size,materials:r.size,textures:o.size,instances:s.size}}var oa=128;function Qh(i){return new Vt({transparent:!0,depthWrite:!1,side:Mt,forceSinglePass:!0,uniforms:{uData:{value:Array.from({length:oa},()=>new mt)},uPulses:{value:Array.from({length:6},()=>new mt(0,1,0,0))},uPulseHeat:{value:Array(6).fill(0)},uRpmLevel:{value:0},uChamber:{value:i==="chamber"?1:0},uCool:{value:new Ie(i==="air"?1194897:i==="exhaust"?1520252:2387332)},uBright:{value:new Ie(i==="air"?3525307:i==="exhaust"?2935478:7658961)},uHot:{value:new Ie(15246447)}},vertexShader:`
      attribute float routeIndex;attribute float pathLength;attribute float volumeFade;
      attribute vec3 pulseDistanceA;attribute vec3 pulseDistanceB;
      uniform vec4 uData[${oa}];
      varying vec2 vUv;varying vec4 vData;varying float vLength;
      varying vec3 vNormal;varying vec3 vEye;varying float vFade;
      varying vec3 vDistanceA;varying vec3 vDistanceB;
      void main(){
        vec4 eye=modelViewMatrix*vec4(position,1.0);
        vUv=uv;vData=uData[int(routeIndex)];vLength=pathLength;vFade=volumeFade;
        vDistanceA=pulseDistanceA;vDistanceB=pulseDistanceB;
        vNormal=normalize(normalMatrix*normal);vEye=normalize(-eye.xyz);
        gl_Position=projectionMatrix*eye;
      }`,fragmentShader:`
      uniform vec3 uCool;uniform vec3 uBright;uniform vec3 uHot;
      uniform vec4 uPulses[6];uniform float uPulseHeat[6];uniform float uChamber;uniform float uRpmLevel;
      varying vec2 vUv;varying vec4 vData;varying float vLength;
      varying vec3 vNormal;varying vec3 vEye;varying float vFade;
      varying vec3 vDistanceA;varying vec3 vDistanceB;
      float packet(float distance,vec4 event){
        if(distance< -10000.0||event.z<0.00001)return 0.0;
        float q=(distance-event.x)/event.y;
        float body=exp(-q*q*1.8),front=exp(-pow(q-0.45,2.0)*17.0);
        return (body*0.68+front*0.38)*event.z;
      }
      void main(){
        if(vData.w<0.0)discard;
        vec3 pa=vec3(packet(vDistanceA.x,uPulses[0]),packet(vDistanceA.y,uPulses[1]),packet(vDistanceA.z,uPulses[2]));
        vec3 pb=vec3(packet(vDistanceB.x,uPulses[3]),packet(vDistanceB.y,uPulses[4]),packet(vDistanceB.z,uPulses[5]));
        float pulse=pa.x+pa.y+pa.z+pb.x+pb.y+pb.z;
        float heat=(dot(pa,vec3(uPulseHeat[0],uPulseHeat[1],uPulseHeat[2]))+dot(pb,vec3(uPulseHeat[3],uPulseHeat[4],uPulseHeat[5])))/max(pulse,0.00001);
        // Recorded backflow keeps a local signed band; its remote source is
        // unknown, so no positive transport event is fabricated for it.
        if(vData.x< -0.000001)pulse+=exp(-pow((vUv.x-vData.y)*vLength/42.0,2.0))*0.55;
        // Recorded packets stay angle-indexed. At high RPM reduce their visual
        // strobe and add a smooth transported density cue only where an actual
        // positive rate exists. This is display motion, not another native pulse.
        float activity=sqrt(max(vData.x,0.0)/(max(vData.x,0.0)+0.15));
        float transport=0.5+0.5*cos(6.2831853*(vUv.x-vData.y));
        float rpm=clamp(uRpmLevel,0.0,1.0);
        float carry=activity*(0.10+0.35*rpm)*smoothstep(0.15,0.9,transport);
        pulse=clamp(pulse*(1.0-0.40*smoothstep(0.35,0.72,rpm))+carry,0.0,1.0)*vData.w;
        float facing=abs(dot(normalize(vNormal),normalize(vEye))),chord=sqrt(facing);
        float wisps=0.86+0.14*sin(vUv.y*37.7+sin(6.2831853*(vUv.x-vData.y))*2.0);
        vec3 color=mix(uCool,uBright,clamp(pulse*0.85,0.0,1.0));
        color=mix(color,vec3(0.27,0.78,0.18),clamp(heat*pulse*1.1,0.0,0.7));
        color=mix(color,uHot,max(0.0,heat-0.55)*pulse*0.7);
        float alpha=(0.045+chord*0.12+pulse*(0.3+chord*0.24)*wisps+uChamber*0.03)*mix(0.22,1.0,vData.w);
        gl_FragColor=vec4(color,alpha*vFade);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function fg(){return new Vt({transparent:!0,depthWrite:!1,side:Mt,forceSinglePass:!0,uniforms:{uActivity:{value:Array.from({length:6},()=>new me)}},vertexShader:`attribute float routeIndex;uniform vec2 uActivity[6];varying vec2 vActivity;varying vec2 vUv;
      void main(){vActivity=uActivity[int(routeIndex)];vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec2 vActivity;varying vec2 vUv;
      void main(){if(vActivity.x<0.000001)discard;
        float fine=0.6+0.4*sin(vUv.x*94.25+sin(vUv.y*42.0)*2.0);
        float body=sin(vUv.y*3.14159);float alpha=body*mix(0.42,0.68,clamp(vActivity.x,0.0,1.0))*fine;
        gl_FragColor=vec4(0.88,0.73,0.43,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function pg(i,e){let t=new Ie(i==="air"?1336831:e),n=new Ie(i==="air"?9231871:i==="exhaust"?16766097:e).lerp(new Ie(16777215),.18);return new Vt({transparent:!0,depthWrite:!1,side:Mt,forceSinglePass:!0,uniforms:{uFlow:{value:Array.from({length:oa},()=>new me)},uColor:{value:t},uBright:{value:n}},vertexShader:`
      attribute float routeIndex;
      attribute float pathLength;
      uniform vec2 uFlow[${oa}];
      varying vec2 vUv;
      varying vec2 vFlow;
      varying float vLength;
      void main(){
        vUv=uv;vFlow=uFlow[int(routeIndex)];vLength=pathLength;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }`,fragmentShader:`
      uniform vec3 uColor;
      uniform vec3 uBright;
      varying vec2 vUv;
      varying vec2 vFlow;
      varying float vLength;
      void main(){
        if(abs(vFlow.x)<0.000001)discard;
        float distance=(vUv.x-vFlow.y)*vLength;
        float band=smoothstep(0.12,0.85,sin(distance*0.12));
        float lane=smoothstep(-0.5,0.7,sin(vUv.y*31.4159+sin(distance*0.022)*0.55));
        float strength=clamp(sqrt(abs(vFlow.x))*0.65,0.3,1.0);
        float light=band*(0.4+lane*0.6);
        float alpha=(0.2+light*0.62)*(0.7+strength*0.3);
        gl_FragColor=vec4(mix(uColor,uBright,light*0.82),alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function aa(i,e,t){if(!Number.isInteger(e)||e<0||e>=oa)throw new Error("Zu viele Str\xF6mungswege f\xFCr den geb\xFCndelten Renderer.");let n=i.getAttribute("position").count;return i.setAttribute("routeIndex",new tt(new Float32Array(n).fill(e),1)),i.setAttribute("pathLength",new tt(new Float32Array(n).fill(t),1)),i}function mg(i,e,t,n,r){let s=Math.max(0,Math.min(1,t)),o=Math.min(n-1,1.5+Math.pow(s,.72)*(n+8)),a=i*2.399963229728653,l=(i+.5)/e,c=Math.sqrt(1-l*l),u=1+s*(.12*Math.sin(a*3+l*19+s*8)+.07*Math.sin(a*7-l*13)),h=i%5===0?.72:1,d=Math.cos(a)*c*o*u*h,f=Math.sin(a)*c*o*u*h*1.08,p=Math.hypot(d,f),y=Math.max(1,n-1);p>y&&(d*=y/p,f*=y/p);let m=-Math.min(Math.max(1,r-2),1.2+l*o*u*1.25);return{x:d,y:m,z:f,radius:o,wrinkling:s,energy:i%5===0?.6:1}}function gg(){return new Vt({transparent:!0,depthWrite:!1,blending:or,uniforms:{uProgress:{value:0},uHeat:{value:0},uPressure:{value:0},uPointScale:{value:500}},vertexShader:`
      attribute float seed;
      uniform float uProgress;
      uniform float uPointScale;
      varying float vSeed;
      void main(){
        vSeed=seed;
        vec4 eye=modelViewMatrix*vec4(position,1.0);
        float size=mix(5.0,8.0,uProgress)*(0.7+fract(seed*13.17)*0.6);
        gl_PointSize=clamp(size*uPointScale/max(1.0,-eye.z),1.5,42.0);
        gl_Position=projectionMatrix*eye;
      }`,fragmentShader:`
      uniform float uProgress;
      uniform float uHeat;
      uniform float uPressure;
      varying float vSeed;
      void main(){
        vec2 p=gl_PointCoord*2.0-1.0;
        float radius=length(p);if(radius>1.0)discard;
        float core=exp(-radius*radius*4.5);
        vec3 yellow=vec3(1.0,0.72,0.19),white=vec3(1.0,0.95,0.76),red=vec3(1.0,0.18,0.035);
        vec3 color=mix(yellow,red,smoothstep(0.3,1.0,uProgress)*(0.3+fract(vSeed*17.0)*0.7));
        color=mix(color,white,core*(1.0-uProgress)*0.82);
        float alpha=pow(1.0-radius,1.1)*(0.10+uPressure*0.045)*(1.0-smoothstep(0.8,1.0,uProgress)*0.5);
        gl_FragColor=vec4(color*(0.7+uHeat*0.5),alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function xg(i,e,t){let n=new Ce;n.name="Freigestellter Kurbeltrieb \xB7 Ringpakete und Hubzapfen";let r=i.engine.boreMm/2-1,s=i.engine.rodMm,o=i.engine.strokeMm/2,a=vn.compressionHeightMm,l=q=>{let $=q.map(K=>K.index?K.toNonIndexed():K),pe=t(yt($));return $.forEach((K,H)=>{K!==q[H]&&K.dispose()}),q.forEach(K=>K.dispose()),pe},c=(q,$,pe,K)=>{let H=new Zt(q,$,pe);return H.name=K,H.frustumCulled=!1,H.instanceMatrix.setUsage(tn),n.add(H),H},u=(q,$,pe)=>{let K=new zt(q,$,6,48);return K.rotateX(Math.PI/2),K.translate(0,pe,0),K},h=(q,$)=>{let pe=new st(q,q,$,32);return pe.rotateZ(Math.PI/2),pe},d=(q,$,pe)=>{let K=new je;K.absarc(0,0,q,0,Math.PI*2,!1);let H=new ht;H.absarc(0,0,$,0,Math.PI*2,!0),K.holes.push(H);let B=new at(K,{depth:pe,bevelEnabled:!0,bevelSegments:1,steps:1,bevelSize:.6,bevelThickness:.5,curveSegments:24});return B.translate(0,0,-pe/2),B.rotateY(Math.PI/2),B},f=[[0,a-.8],[r*.62,a-.8],[r*.92,a],[r,a-.6],[r,28.5],[r-1,28.5],[r-1,26.5],[r,26.5],[r,24.5],[r-1.1,24.5],[r-1.1,22.5],[r,22.5],[r,19.5],[r-1.2,19.5],[r-1.2,15.5],[r,15.5],[r,12],[r-4,12],[r-4,a-6],[0,a-6]].map(([q,$])=>new me(q,$)),p=new jt(f,48),y=[0,Math.PI].map(q=>{let $=new st(r*.98,r*.95,30,24,1,!0,q-.72,1.44);return $.translate(0,-3,0),$}),m=c(l([p,...y]),e.metal,6,"Sechs Kolben \xB7 Kronen, Ringnuten und offene Sch\xFCrzen"),g=c(l([u(r-.5,.7,27.5),u(r-.5,.7,23.5),u(r-.6,.55,18.7),u(r-.6,.55,16.3)]),e.dark,6,"Kompressionsringe und zweiteiliger \xD6labstreifring"),_=c(t(d(11,7.5,60)),e.metal,6,"Sechs hohle Kolbenbolzen"),M=s-36,v=new ot(5,M,9),T=[-5.5,5.5].map(q=>{let $=new ot(13,M,2.4);return $.translate(0,0,q),$}),b=d(15.5,11,13);b.translate(0,s/2,0);let w=d(24,18,20);w.translate(0,-s/2,0);let x=[-1,1].map(q=>{let $=h(3.2,22);return $.translate(0,-s/2-17,q*15.5),$}),S=c(l([v,...T,b,w,...x]),e.metal,6,"Sechs I-Pleuel \xB7 beide Lageraugen und Deckelschrauben"),E=c(t(h(17.5,34)),e.metal,6,"Sechs native Hubzapfen"),R=new je;R.moveTo(-25,-46),R.bezierCurveTo(-45,-44,-49,-24,-27,-5),R.lineTo(-20,o-5),R.bezierCurveTo(-20,o+24,20,o+24,20,o-5),R.lineTo(27,-5),R.bezierCurveTo(49,-24,45,-44,25,-46),R.lineTo(-25,-46);let A=new at(R,{depth:9,bevelEnabled:!0,bevelSegments:2,steps:1,bevelSize:1.5,bevelThickness:1,curveSegments:16});A.translate(0,0,-4.5),A.rotateY(Math.PI/2);let P=[-21,21].map(q=>A.clone().translate(q,0,0));A.dispose();let D=c(l(P),e.dark,6,"Zw\xF6lf Kurbelwangen und Gegengewichte"),F=[h(11,650)];for(let q=0;q<7;q++){let $=h(17,24);$.translate(-300+q*100,0,0),F.push($)}let z=d(37,15,12);z.translate(327,0,0),F.push(z);for(let q=0;q<6;q++){let $=h(3.5,15),pe=q*Math.PI/3;$.translate(328,27*Math.cos(pe),27*Math.sin(pe)),F.push($)}let L=new Se(l(F),e.metal);L.name="Kurbelwelle \xB7 sieben Hauptlager und Abtriebsflansch",n.add(L);let V=u(i.engine.boreMm/2+1,1.1,0),k=u(i.engine.boreMm/2+1,.7,-105),W=c(l([V,k]),e.dark,6,"Sechs Laufbahnkonturen \xB7 oben und unten"),J=[m,g,_,S,E,D,W],oe=new Ne,re=new vt,Te=new I,Ee=new I,Re=new I(1,1,1),se=new I(0,1,0),le=new I(1,0,0);function X(q,$,pe,K,H){oe.compose($,re.identity(),Re.set(1,1,1)),m.setMatrixAt(q,oe),g.setMatrixAt(q,oe),_.setMatrixAt(q,oe),Te.copy($).add(pe).multiplyScalar(.5),Ee.copy($).sub(pe).normalize(),re.setFromUnitVectors(se,Ee),oe.compose(Te,re,Re),S.setMatrixAt(q,oe),oe.compose(pe,re.identity(),Re),E.setMatrixAt(q,oe),Te.set(ze[q],0,0),re.setFromAxisAngle(le,K),oe.compose(Te,re,Re),D.setMatrixAt(q,oe),Te.set(ze[q],H,0),oe.compose(Te,re.identity(),Re),W.setMatrixAt(q,oe)}return{root:n,cylinder:X,finish(q){L.rotation.x=q;for(let $ of J)$.instanceMatrix.needsUpdate=!0},disposeInstances(){J.forEach(q=>q.dispose())},diagnostics:{pistons:6,compressionRings:12,oilRingRails:12,rodEyes:12,crankPins:6,crankCheeks:12,mainJournals:7,draws:8}}}var yg=2600;function ed(i,e,t,n,r){let s=e?.rpm??0,o=Wt(t,Ht*2)/(Ht*2),a=Number.isFinite(s)&&s>5&&Number.isFinite(t);for(let l=0;l<6;l++){let c=i[l];if(c.set(0,1,0,0),r&&(r[l]=0),!a)continue;let u=e?.cycles?.find(y=>y.cylinder===l+1)??(e?.cycle?.cylinder===l+1?e.cycle:void 0);if(!u)continue;let h=u.samples,d=h.length,f=n==="air"?4:5;if(d<2)continue;let p=Math.floor(o*d);for(let y=0;y<d;y++){let m=Wt(p-y,d),g=h[m]?.[f]??0,_=h[Wt(m-1,d)]?.[f]??0;if(!(g>1e-6)||_>1e-6)continue;let M=1,v=g;for(;M<d&&(h[(m+M)%d]?.[f]??0)>1e-6;)v=Math.max(v,h[(m+M)%d][f]),M++;let T=m/d,b=Wt(o-T,1);r&&(r[l]=Math.max(0,Math.min(1,((h[m]?.[1]??400)-400)/1900))),c.set(b*yg,Math.max(44,Math.min(155,M/d*yg*.28)),Math.min(1,Math.sqrt(v)*1.4),T);break}}}function zc(i){if(!Number.isFinite(i)||i<=5)return 0;let e=Math.min(i,12e3);return e/(e+2500)}var Hs=class{frames=[];seconds=0;travel=0;reset(){this.frames.length=0,this.seconds=0,this.travel=0}sample(e,t,n){if(zc(e)===0||!Number.isFinite(t)||!Number.isFinite(n))return this.reset(),0;if(t<=0)return 0;if(t>.1)return this.reset(),0;let r=Math.min(e,12e3)*Math.PI*2/60;if(Math.abs(n)>r*(t+.12)*1.75+.5)return this.reset(),0;for(this.frames.push({elapsed:t,delta:n}),this.seconds+=t,this.travel+=n;this.frames.length>1&&this.seconds-.12>1e-9;){let o=this.frames.shift();this.seconds-=o.elapsed,this.travel-=o.delta}let s=Math.abs(this.travel)*60/(Math.PI*2*this.seconds);return Math.min(e,s<1e-9?0:s)}};function td(i,e,t){if(!Number.isFinite(e)||Math.abs(e)<=1e-6||!Number.isFinite(t)||t<=0)return 0;let n=zc(i);if(n===0)return 0;let r=Math.min(i,12e3),s=Math.abs(e),o=Math.sqrt(s/(s+.15)),a=1.8*(45*(1-Math.exp(-r/300))+280*n)*o;return Math.sign(e)*Math.min(3.8,a/Math.max(20,t))}function Vc(i,e,t,n,r,s=!0){let o=Number.isFinite(i)?i>=0&&i<1?i:(i%1+1)%1:0;if(!s||!Number.isFinite(e)||e<=0)return o;let a=td(t,n,r);if(a===0)return o;let l=((o+Math.min(.1,e)*a)%1+1)%1;return l<1e-12||l>1-1e-12?0:l}var TM={idle:0,intake:1,compression:2,kernel:3,front:3,expansion:4,exhaust:5};function bg(i,e,t){let n=Nr(i,e,t),r=Fi(i,e,t),s=(i?.rpm??0)>5,o=n.available,a=s&&o,l=a?TM[n.stage]:0;return{available:o,active:a,stage:l,stageName:a?n.stage:"idle",heat:a?n.heat:0,pressure:a?n.pressure:0,burning:a&&n.burning,progress:a&&n.burning?n.progress:0,intakeLift:r?.intakeLiftMm??0,exhaustLift:r?.exhaustLiftMm??0,intakeGate:a&&n.intake>1e-6&&(r?.intakeLiftMm??0)>.05?Math.min(1,Math.sqrt(n.intake)*1.5):0,exhaustGate:a&&n.exhaust>1e-6&&(r?.exhaustLiftMm??0)>.05?Math.min(1,Math.sqrt(n.exhaust)*1.5):0}}function vg(i){let e=[],t=(s,o)=>{s.setAttribute("densityWeight",new tt(new Float32Array(s.getAttribute("position").count).fill(o),1)),e.push(s)};t(new st(1,1,1,48),.18);for(let s of[-.8,-.4,0,.4,.8]){let o=2*Math.sqrt(1-s*s),a=new kn(o,1,1,8);a.translate(0,0,s),t(a,.38);let l=new kn(o,1,1,8);l.rotateY(Math.PI/2),l.translate(s,0,0),t(l,.38);let c=new Ei(1,48);c.rotateX(Math.PI/2),c.translate(0,s/2,0),t(c,.38)}let n=yt(e);e.forEach(s=>s.dispose());let r=n.getAttribute("position").count;return n.setAttribute("routeIndex",new tt(new Float32Array(r).fill(i),1)),n.setAttribute("color",new tt(new Float32Array(r*4),4).setUsage(tn)),n}function _g(){return new Yt({color:16777215,vertexColors:!0,transparent:!0,depthWrite:!1,side:Mt,forceSinglePass:!0})}function Mg(i,e){let t=i.getAttribute("position"),n=i.getAttribute("densityWeight"),r=i.getAttribute("color"),s=.025,o=.09,a=.58;if(e.stage===2){let l=Math.min(.8,e.pressure*1.6+e.heat*.35);o+=(.62-o)*l,a+=(.72-a)*l}if(e.stage===4||e.stage===5){let l=Math.min(1,e.heat*1.6);s=.025+(.16-.025)*l,o=.62+(.67-.62)*l,a=.72+(.25-.72)*l}e.burning&&(s=.072,o=.638,a=.555),e.active||(s=.16,o=.24,a=.32);for(let l=0;l<t.count;l++){let c=t.getX(l),u=t.getY(l)+.5,h=t.getZ(l),d=.92+.08*Math.sin(c*7+h*9+u*6+e.progress*3),f=s*(.84+u*.22),p=o*(.84+u*.22),y=a*(.84+u*.22),m=0;if(e.burning){let _=1.06-e.progress*1.28+.035*Math.sin(c*8+h*5),M=Math.max(0,Math.min(1,(u-_+.1)/.18)),v=M*M*(3-2*M)*.9;m=Math.exp(-Math.pow((u-_)/.075,2))*.85,f+=(.82-f)*v,p+=(.19-p)*v,y+=(.045-y)*v,f+=(1-f)*m,p+=(.79-p)*m,y+=(.36-y)*m}let g=(.34+e.pressure*.22+m*.12)*n.getX(l)*d*(e.active?1:.14);r.setXYZW(l,f,p,y,Math.min(.3,g))}r.needsUpdate=!0}function Tg(){return new Vt({transparent:!0,depthWrite:!1,side:Mt,forceSinglePass:!0,uniforms:{uValves:{value:Array.from({length:12},()=>new mt)}},vertexShader:`attribute float valveIndex;uniform vec4 uValves[12];varying vec4 vState;varying vec2 vUv;varying vec3 vNormal;varying vec3 vEye;
      void main(){vec4 p=instanceMatrix*vec4(position,1.0);vec4 eye=modelViewMatrix*p;
        vUv=uv;vState=uValves[int(valveIndex)];vNormal=normalize(normalMatrix*mat3(instanceMatrix)*normal);vEye=normalize(-eye.xyz);gl_Position=projectionMatrix*eye;}`,fragmentShader:`varying vec4 vState;varying vec2 vUv;varying vec3 vNormal;varying vec3 vEye;
      void main(){if(vState.x<0.00001)discard;
        float through=vState.z>0.5?vUv.y:1.0-vUv.y;
        vec3 color=mix(vec3(0.03,0.25,0.86),vec3(0.08,0.85,0.69),vState.x);
        color=mix(color,vec3(0.48,0.81,0.22),vState.y*0.8);
        float core=sqrt(abs(dot(normalize(vNormal),normalize(vEye))));
        float alpha=(0.14+vState.x*0.48)*(0.6+core*0.4)*sin(vUv.y*3.14159);
        color*=0.8+through*0.35;gl_FragColor=vec4(color,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}var Sg=527893;function wg(i){let e=new Ce;e.name="M54 \xB7 freigestellter Gaswechsel R6",e.visible=!1;let t=Qo(i),n=cn(t.headOffset),r={air:Qh("air"),exhaust:Qh("exhaust"),curtain:Tg(),spray:fg(),metal:new _t({color:8753815,metalness:.58,roughness:.43}),dark:new _t({color:3884877,metalness:.45,roughness:.5}),direction:new Yt({color:16777215,transparent:!0,opacity:.72,depthWrite:!1})},s=new Set,o=B=>(s.add(B),B),a=(B,Z,ne,te=!1)=>{aa(B,Z,ne);let ce=B.getAttribute("uv"),xe=new Float32Array(ce.count);for(let ve=0;ve<xe.length;ve++)xe[ve]=te?Math.pow(1-ce.getX(ve),1.5):1;return B.setAttribute("volumeFade",new tt(xe,1)),B},l=[],c=new Map,u=zn(t.headOffset).filter(B=>B.medium==="air"||B.medium==="exhaust"),h=new Map(u.map(B=>[B,new Ot(B.coords.map(Z=>new I(...Z)),!1,"centripetal")])),d=B=>B?h.get(B).getLength():0,f=em(u),p=ze.map((B,Z)=>{let ne=Z+1,te=Z<3?"front":"rear";return{runner:d(u.find(ce=>ce.medium==="air"&&ce.cylinder===ne&&ce.branch==="runner")),head:d(u.find(ce=>ce.medium==="exhaust"&&ce.cylinder===ne&&ce.branch==="head-exhaust-left")),header:d(u.find(ce=>ce.medium==="exhaust"&&ce.cylinder===ne&&ce.branch==="header")),collector:d(u.find(ce=>ce.medium==="exhaust"&&ce.branch==="collector-"+te)),main:d(u.find(ce=>ce.medium==="exhaust"&&ce.branch==="main-"+te)),tail:d(u.find(ce=>ce.medium==="exhaust"&&ce.branch==="tail-"+te))}});function y(B){return ze.map((Z,ne)=>{let te=p[ne],ce=ne<3?"front":"rear",xe=B.branch;return B.medium==="air"?f.offset(B,ne+1):B.cylinder?B.cylinder===ne+1?xe.startsWith("head-")?0:te.head:-1e6:xe.includes(ce)?te.head+te.header+(xe.startsWith("collector-")?0:te.collector)+(xe.startsWith("main-")||xe.startsWith("collector-")?0:te.main)+(xe.endsWith("-outlet")?te.tail:0):-1e6})}function m(B,Z,ne){let te=B.getAttribute("uv"),ce=new Float32Array(te.count*3),xe=new Float32Array(te.count*3);for(let ve=0;ve<te.count;ve++)for(let Ae=0;Ae<6;Ae++){let G=Z[Ae]<-1e4?-1e6:Z[Ae]+te.getX(ve)*ne;(Ae<3?ce:xe)[ve*3+Ae%3]=G}return B.setAttribute("pulseDistanceA",new tt(ce,3)),B.setAttribute("pulseDistanceB",new tt(xe,3)),B}for(let B of["air","exhaust"]){let Z=[];for(let ce of u.filter(xe=>xe.medium===B)){let xe=h.get(ce),ve=l.length,Ae=xe.getLength(),G=new nn(xe,Math.max(18,Math.min(100,Math.ceil(Ae/9))),ce.radius,12,!1);if(B==="air"&&ce.branch==="main"){let Je=G.getAttribute("position"),O=G.getAttribute("uv"),C=new I,j=new I,U=new I;for(let Y=0;Y<Je.count;Y++){C.fromBufferAttribute(Je,Y),j.copy(xe.getPointAt(O.getX(Y))),U.copy(C).sub(j);let ae=j.z<-180&&j.x>-295&&j.y>163+t.headOffset,ge=j.x>-500&&j.x<-395;(ae||ge)&&C.copy(j).add(U.multiplyScalar(ae?1.58:1.7)),Je.setXYZ(Y,C.x,C.y,C.z)}G.computeVertexNormals()}if(B==="exhaust"&&ce.branch==="header"){let Je=G.getAttribute("position"),O=G.getAttribute("uv"),C=new I,j=new I;for(let U=0;U<Je.count;U++){let Y=O.getX(U);C.fromBufferAttribute(Je,U),j.copy(xe.getPointAt(Y)),C.sub(j).multiplyScalar(1+Math.pow(Math.sin(Y*Math.PI),2)*.35).add(j),Je.setXYZ(U,C.x,C.y,C.z)}G.computeVertexNormals()}let nt=y(ce);Z.push(m(a(G,ve,Ae),nt,Ae)),l.push({spec:ce,index:ve,length:Ae,phase:0,rate:0,motionHz:0,data:r[B].uniforms.uData.value[ve],offsets:nt})}let ne=o(yt(Z));Z.forEach(ce=>ce.dispose());let te=new Se(ne,r[B]);te.name=B==="air"?"Zusammenh\xE4ngende Ansaugluft":"Zwei zusammenh\xE4ngende Abgasb\xE4nke",te.renderOrder=B==="air"?1:3,e.add(te),c.set(B,te)}let g=[],_=ze.map((B,Z)=>{let ne=o(vg(Z)),te=_g();g.push(te);let ce=new Se(ne,te);return ce.position.x=B,ce.scale.set(i.engine.boreMm/2-1,1,i.engine.boreMm/2-1),ce.name=`Integriertes Gasvolumen ${Z+1}`,ce.renderOrder=2,e.add(ce),ce}),M=n.tails.map((B,Z)=>{let ne=u.find(ge=>ge.medium==="exhaust"&&ge.branch===(Z===0?"tail-front":"tail-rear")),te=new I(...ne.coords.at(-2)),ce=new I(...B),xe=ce.clone().sub(te).normalize(),ve=new Ot([ce,ce.clone().addScaledVector(xe,90),ce.clone().addScaledVector(xe,220).add(new I(0,28,0))]),Ae=l.length,G=ve.getLength(),nt=new nn(ve,28,20,12,!1),Je=nt.getAttribute("position"),O=nt.getAttribute("uv"),C=new I,j=new I;for(let ge=0;ge<Je.count;ge++){let ie=O.getX(ge);C.fromBufferAttribute(Je,ge),j.copy(ve.getPointAt(ie)),C.sub(j).multiplyScalar(1+ie*1.2).add(j),Je.setXYZ(ge,C.x,C.y,C.z)}let U={...ne,branch:ne.branch+"-outlet"},Y=y(U);nt.computeVertexNormals(),o(m(a(nt,Ae,G,!0),Y,G));let ae=new Se(nt,r.exhaust);return ae.name=`Abgasvolumen Austritt ${Z+1}`,ae.visible=!1,e.add(ae),l.push({spec:U,index:Ae,length:G,phase:0,rate:0,motionHz:0,data:r.exhaust.uniforms.uData.value[Ae],offsets:Y}),ae}),v=xg(i,r,o);e.add(v.root);let T=new st(2.1,2.1,33,8);T.translate(0,16,0);let b=new st(11,13,3,12),w=o(yt([T,b]));T.dispose(),b.dispose();let x=new Zt(w,r.metal,24);x.name="24 native Ventile",e.add(x);let S=o(new st(1,.86,1,24,1,!0));S.setAttribute("valveIndex",new jn(Float32Array.from({length:24},(B,Z)=>Math.floor(Z/4)*2+Math.floor(Z%4/2)),1));let E=new Zt(S,r.curtain,24);E.name="24 Ventilvorh\xE4nge \xB7 native \xD6ffnung und Flussrichtung",E.frustumCulled=!1,E.instanceMatrix.setUsage(tn),E.renderOrder=4,e.add(E);let R=new I;_[0].onBeforeRender=(B,Z,ne)=>{ne.getWorldPosition(R),e.worldToLocal(R);let te=R.z<0;c.get("air").renderOrder=te?3:1,c.get("exhaust").renderOrder=te?1:3};let A=[],P=l.filter(B=>B.spec.branch==="runner"||B.spec.branch==="main-front"||B.spec.branch==="main-rear").map(B=>{let Z=new Ot(B.spec.coords.map(ne=>new I(...ne)),!1,"centripetal");return{route:B,center:Z.getPointAt(.56),tangent:Z.getTangentAt(.56)}}),D=new Zt(o(new xo(5,14,8)),r.direction,P.length);D.name="Native Flussrichtung",D.frustumCulled=!1,D.instanceMatrix.setUsage(tn),P.forEach(({route:B},Z)=>D.setColorAt(Z,new Ie(B.spec.medium==="air"?7462864:10333922))),e.add(D);let F=n.injection.map((B,Z)=>{let ne=[ze[Z],219+t.headOffset,-55];return{nozzle:[...B],end:ne}}),z=F.map(({nozzle:B,end:Z},ne)=>{let te=new I(...B),ce=new I(...Z),xe=ce.clone().sub(te),ve=new st(8,.3,xe.length(),12,1,!0);return ve.applyQuaternion(new vt().setFromUnitVectors(new I(0,1,0),xe.normalize())),ve.translate(...te.add(ce).multiplyScalar(.5).toArray()),aa(ve,ne,xe.length())}),L=new Se(o(yt(z)),r.spray);L.name="Saugrohrspray \xB7 zeitlich illustrativ",L.renderOrder=5,z.forEach(B=>B.dispose()),e.add(L),x.frustumCulled=!1,x.instanceMatrix.setUsage(tn);let V=new Ne,k=new vt,W=new I,J=new I,oe=new I,re=new I(1,1,1),Te=new I,Ee=new I(0,1,0),Re=new Hs,se=!1,le=null,X=0,q=0,$=!1,pe=!0,K=!1;function H(B,Z,ne,te,ce=ne,xe={},ve=null){if(se)return;let Ae=Number.isFinite(te)?te:le??0,G=le===null?0:Math.max(0,Ae-le),nt=Math.min(.1,G),Je=ce-X;le=Ae,X=ce,$=!!B?.cycles?.some(U=>U.samples.some(Boolean))||!!B?.cycle?.samples.some(Boolean);let O=B?.rpm??0,C=zc(O),j=C>0;q=Re.sample(O,G,Je),r.air.uniforms.uRpmLevel.value=C,r.exhaust.uniforms.uRpmLevel.value=C,K=!1,ed(r.air.uniforms.uPulses.value,B,ne,"air",r.air.uniforms.uPulseHeat.value),ed(r.exhaust.uniforms.uPulses.value,B,ne,"exhaust",r.exhaust.uniforms.uPulseHeat.value);for(let U of["air","exhaust"])if(!j||!$||xe[U]==="off")for(let Y of r[U].uniforms.uPulses.value)Y.z=0;for(let U of l){let Y=U.spec.branch.replace("-outlet",""),ae=U.spec.medium==="air"&&ve?yc(U.spec,ve):null;U.rate=(ae&&ae.kind!=="not-r12"?ae.intensity:U.spec.medium==="air"?gc({...U.spec,branch:Y},B,Z,ne,Bs):Bs(U.spec.medium,U.spec.cylinder,Y,B,Z,ne))*(U.spec.flowFactor??1),Number.isFinite(U.rate)||(U.rate=0);let ie=xe[U.spec.medium]!=="off"&&j&&$;U.motionHz=ie&&!ae?.stationary?td(q,U.rate,U.length):0,U.phase=ae?.stationary?0:Vc(U.phase,nt,q,U.rate,U.length,ie),U.motionHz!==0&&(K=!0);let de=U.spec.medium==="exhaust"&&U.spec.cylinder?Nr(B,ne,U.spec.cylinder).heat*.65:0,Pe=(Y.startsWith("idle")||Y==="disa-coupling")&&(!ie||!ae||ae.intensity<=0);U.data.set(ie?U.rate:0,U.phase,ie?de:0,Pe?-1:ie?1:0)}for(let U of["air","exhaust"])c.get(U).visible=xe[U]!=="off";P.forEach(({route:U,center:Y,tangent:ae},ge)=>{Te.copy(ae).multiplyScalar(Math.sign(U.rate)||1),k.setFromUnitVectors(Ee,Te);let ie=j&&$&&xe[U.spec.medium]!=="off"&&Math.abs(U.rate)>1e-6;V.compose(Y,k,re.setScalar(ie?1:0)),D.setMatrixAt(ge,V)}),D.instanceMatrix.needsUpdate=!0;for(let U=0;U<6;U++){let Y=Tc(ne,U+1,Z,B);W.fromArray(Y.piston),J.fromArray(Y.pin),v.cylinder(U,W,J,Y.rotation,t.deck);let ae=Fi(B,ne,U+1),ge=Nr(B,ne,U+1),ie=bg(B,ne,U+1);A[U]=ie,Mg(_[U].geometry,ie);for(let Me=0;Me<2;Me++)r.curtain.uniforms.uValves.value[U*2+Me].set(xe[Me===0?"air":"exhaust"]==="off"?0:Me===0?ie.intakeGate:ie.exhaustGate,ie.heat,Me,ie.stage);let de=j&&B?.ignition===!0&&ge.available&&xe.fuel!=="off"&&(ae?.intakeLiftMm??0)>.1?Math.min(1,ge.intake*2):0;r.spray.uniforms.uActivity.value[U].set(de,0);for(let Me=0;Me<2;Me++)for(let Be=0;Be<2;Be++){let Ye=Me===0?ae?.intakeLiftMm??0:ae?.exhaustLiftMm??0;oe.set(ze[U]+(Be===0?-17:17),207+t.headOffset-Ye,Me===0?-23:23),V.compose(oe,k.identity(),re.set(1,1,1)),x.setMatrixAt(U*4+Me*2+Be,V),oe.y=207+t.headOffset+1.5-Ye/2,V.compose(oe,k,re.set(15,Math.max(.001,Ye),15)),E.setMatrixAt(U*4+Me*2+Be,V)}let ye=W.y+vn.compressionHeightMm,Pe=Math.max(1,t.deck-ye);_[U].position.y=ye+Pe/2,_[U].scale.y=Pe;let we=xe.air!=="off"||xe.exhaust!=="off";_[U].visible=we}v.finish(ce),x.instanceMatrix.needsUpdate=!0,E.instanceMatrix.needsUpdate=!0;for(let U=0;U<2;U++){let Y=l[l.length-2+U],ge=r.exhaust.uniforms.uPulses.value.some((ie,de)=>ie.z>0&&Y.offsets[de]>-1e4&&ie.x+3*ie.y>Y.offsets[de]&&ie.x-3*ie.y<Y.offsets[de]+Y.length);M[U].visible=pe&&xe.exhaust!=="off"&&j&&$&&(ge||Y.rate>1e-6)}}return H(null,i,0,0),{root:e,update:H,spray:L,setVisible(B){e.visible=B&&!se},needsAnimation(){return!se&&e.visible&&(K||["air","exhaust"].some(B=>r[B].uniforms.uPulses.value.some(Z=>Z.z>0)))},setSchematicOutletsVisible(B){pe=B,B||M.forEach(Z=>{Z.visible=!1})},diagnostics(){return{cylinders:6,valves:24,available:$,disposed:se,driveAngle:X,visualMotionRpm:q,mechanics:v.diagnostics,chambers:A.map((B,Z)=>({...B,cylinder:Z+1,bottom:_[Z].position.y-_[Z].scale.y/2,top:_[Z].position.y+_[Z].scale.y/2})),chamberRepresentation:"orthogonal-interior-density-slices",pulses:{air:r.air.uniforms.uPulses.value.map(B=>B.toArray()),exhaust:r.exhaust.uniforms.uPulses.value.map(B=>B.toArray()),exhaustHeat:[...r.exhaust.uniforms.uPulseHeat.value],transport:"native-positive-flow-lobes; illustrative-angle-indexed-travel"},routes:l.map(B=>({medium:B.spec.medium,cylinder:B.spec.cylinder,branch:B.spec.branch,rate:B.rate,phase:B.phase,motionHz:B.motionHz,offsets:B.offsets,length:B.length})),sprayTargets:F,sprayActivity:r.spray.uniforms.uActivity.value.map(B=>B.x),injectionTiming:"illustrative-intake-lift-and-positive-airflow; no-native-injector-timestamps",geometries:s.size,materials:Object.keys(r).length+g.length,maximumDraws:22,representation:"continuous-native-gas-volumes",dimensions:t}},dispose(){if(!se){se=!0,e.removeFromParent(),v.disposeInstances();for(let B of[x,D,E])B.dispose();s.forEach(B=>B.dispose()),Object.values(r).forEach(B=>B.dispose()),g.forEach(B=>B.dispose()),e.clear()}}}}function Ag(i){let e=new Map,t=new Map,n=i.clone();return Eg(i,n,function(r,s){e.set(s,r),t.set(r,s)}),n.traverse(function(r){if(!r.isSkinnedMesh)return;let s=r,o=e.get(r),a=o.skeleton.bones;s.skeleton=o.skeleton.clone(),s.bindMatrix.copy(o.bindMatrix),s.skeleton.bones=a.map(function(l){return t.get(l)}),s.bind(s.skeleton,s.bindMatrix)}),n}function Eg(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)Eg(i.children[n],e.children[n],t)}var Gc=class extends ci{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new ld(t)}),this.register(function(t){return new cd(t)}),this.register(function(t){return new yd(t)}),this.register(function(t){return new bd(t)}),this.register(function(t){return new vd(t)}),this.register(function(t){return new hd(t)}),this.register(function(t){return new dd(t)}),this.register(function(t){return new fd(t)}),this.register(function(t){return new pd(t)}),this.register(function(t){return new ad(t)}),this.register(function(t){return new md(t)}),this.register(function(t){return new ud(t)}),this.register(function(t){return new xd(t)}),this.register(function(t){return new gd(t)}),this.register(function(t){return new sd(t)}),this.register(function(t){return new Hc(t,gt.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new Hc(t,gt.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new _d(t)})}load(e,t,n,r){let s=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let c=Li.extractUrlBase(e);o=Li.resolveURL(c,this.path)}else o=Li.extractUrlBase(e);this.manager.itemStart(e);let a=function(c){r?r(c):console.error(c),s.manager.itemError(e),s.manager.itemEnd(e)},l=new ws(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{s.parse(c,o,function(u){t(u),s.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let s,o={},a={},l=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Dg){try{o[gt.KHR_BINARY_GLTF]=new Md(e)}catch(h){r&&r(h);return}s=JSON.parse(o[gt.KHR_BINARY_GLTF].content)}else s=JSON.parse(l.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){r&&r(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new Rd(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let h=this.pluginCallbacks[u](c);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[h.name]=h,o[h.name]=!0}if(s.extensionsUsed)for(let u=0;u<s.extensionsUsed.length;++u){let h=s.extensionsUsed[u],d=s.extensionsRequired||[];switch(h){case gt.KHR_MATERIALS_UNLIT:o[h]=new od;break;case gt.KHR_DRACO_MESH_COMPRESSION:o[h]=new Td(s,this.dracoLoader);break;case gt.KHR_TEXTURE_TRANSFORM:o[h]=new Sd;break;case gt.KHR_MESH_QUANTIZATION:o[h]=new wd;break;default:d.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,r)}parseAsync(e,t){let n=this;return new Promise(function(r,s){n.parse(e,t,r,s)})}};function SM(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function Jt(i,e,t){let n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var gt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},sd=class{constructor(e){this.parser=e,this.name=gt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){let s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,r=t.cache.get(n);if(r)return r;let s=t.json,l=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e],c,u=new Ie(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],un);let h=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new nr(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Lo(u),c.distance=h;break;case"spot":c=new Er(u),c.distance=h,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),mi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),r=Promise.resolve(c),t.cache.add(n,r),r}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,s=n.json.nodes[e],a=(s.extensions&&s.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}},od=class{constructor(){this.name=gt.KHR_MATERIALS_UNLIT}getMaterialType(){return Yt}extendParams(e,t,n){let r=[];e.color=new Ie(1,1,1),e.opacity=1;let s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){let o=s.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],un),e.opacity=o[3]}s.baseColorTexture!==void 0&&r.push(n.assignTexture(e,"map",s.baseColorTexture,qt))}return Promise.all(r)}},ad=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},ld=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&r.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&r.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(r.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let s=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new me(s,s)}return Promise.all(r)}},cd=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_DISPERSION}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},ud=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&r.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&r.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(r)}},hd=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_SHEEN}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];if(t.sheenColor=new Ie(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let s=n.sheenColorFactor;t.sheenColor.setRGB(s[0],s[1],s[2],un)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&r.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,qt)),n.sheenRoughnessTexture!==void 0&&r.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(r)}},dd=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&r.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(r)}},fd=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_VOLUME}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&r.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let s=n.attenuationColor||[1,1,1];return t.attenuationColor=new Ie().setRGB(s[0],s[1],s[2],un),Promise.all(r)}},pd=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_IOR}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},md=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_SPECULAR}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&r.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let s=n.specularColorFactor||[1,1,1];return t.specularColor=new Ie().setRGB(s[0],s[1],s[2],un),n.specularColorTexture!==void 0&&r.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,qt)),Promise.all(r)}},gd=class{constructor(e){this.parser=e,this.name=gt.EXT_MATERIALS_BUMP}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&r.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(r)}},xd=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return Jt(this.parser,e,this.name)!==null?Sn:null}extendMaterialParams(e,t){let n=Jt(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&r.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(r)}},yd=class{constructor(e){this.parser=e,this.name=gt.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let s=r.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,o)}},bd=class{constructor(e){this.parser=e,this.name=gt.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,r=n.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;let o=s.extensions[t],a=r.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},vd=class{constructor(e){this.parser=e,this.name=gt.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,r=n.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;let o=s.extensions[t],a=r.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},Hc=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let r=n.extensions[this.name],s=this.parser.getDependency("buffer",r.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(a){let l=r.byteOffset||0,c=r.byteLength||0,u=r.count,h=r.byteStride,d=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,h,d,r.mode,r.filter).then(function(f){return f.buffer}):o.ready.then(function(){let f=new ArrayBuffer(u*h);return o.decodeGltfBuffer(new Uint8Array(f),u,h,d,r.mode,r.filter),f})})}else return null}},_d=class{constructor(e){this.name=gt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let r=t.meshes[n.mesh];for(let c of r.primitives)if(c.mode!==Gn.TRIANGLES&&c.mode!==Gn.TRIANGLE_STRIP&&c.mode!==Gn.TRIANGLE_FAN&&c.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],l={};for(let c in o)a.push(this.parser.getDependency("accessor",o[c]).then(u=>(l[c]=u,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{let u=c.pop(),h=u.isGroup?u.children:[u],d=c[0].count,f=[];for(let p of h){let y=new Ne,m=new I,g=new vt,_=new I(1,1,1),M=new Zt(p.geometry,p.material,d);for(let T=0;T<d;T++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,T),l.ROTATION&&g.fromBufferAttribute(l.ROTATION,T),l.SCALE&&_.fromBufferAttribute(l.SCALE,T),M.setMatrixAt(T,y.compose(m,g,_));let v=null;for(let T in l)if(T==="_COLOR_0"){let b=l[T];M.instanceColor=new jn(b.array,b.itemSize,b.normalized)}else if(T!=="TRANSLATION"&&T!=="ROTATION"&&T!=="SCALE"){if(v===null){let w=M.geometry;v=new it,v.name=w.name;for(let x in w.attributes)v.setAttribute(x,w.attributes[x]);for(let x in w.morphAttributes)v.morphAttributes[x]=w.morphAttributes[x];w.index!==null&&v.setIndex(w.index),v.morphTargetsRelative=w.morphTargetsRelative;for(let x of w.groups)v.addGroup(x.start,x.count,x.materialIndex);w.boundingBox!==null&&(v.boundingBox=w.boundingBox.clone()),w.boundingSphere!==null&&(v.boundingSphere=w.boundingSphere.clone()),v.drawRange.start=w.drawRange.start,v.drawRange.count=w.drawRange.count,v.userData=Object.assign({},w.userData),M.geometry=v}let b=l[T];v.setAttribute(T,new jn(b.array,b.itemSize,b.normalized))}Ut.prototype.copy.call(M,p),this.parser.assignFinalMaterial(M),f.push(M)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}},Dg="glTF",la=12,Cg={JSON:1313821514,BIN:5130562},Md=class{constructor(e){this.name=gt.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,la),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Dg)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let r=this.header.length-la,s=new DataView(e,la),o=0;for(;o<r;){let a=s.getUint32(o,!0);o+=4;let l=s.getUint32(o,!0);if(o+=4,l===Cg.JSON){let c=new Uint8Array(e,la+o,a);this.content=n.decode(c)}else if(l===Cg.BIN){let c=la+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Td=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=gt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,r=this.dracoLoader,s=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(let u in o){let h=Ed[u]||u.toLowerCase();a[h]=o[u]}for(let u in e.attributes){let h=Ed[u]||u.toLowerCase();if(o[u]!==void 0){let d=n.accessors[e.attributes[u]],f=Ws[d.componentType];c[h]=f.name,l[h]=d.normalized===!0}}return t.getDependency("bufferView",s).then(function(u){return new Promise(function(h,d){r.decodeDracoFile(u,function(f){for(let p in f.attributes){let y=f.attributes[p],m=l[p];m!==void 0&&(y.normalized=m)}h(f)},a,c,un,d)})})}},Sd=class{constructor(){this.name=gt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),r=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*r,e.offset.x,-e.repeat.x*r,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},wd=class{constructor(){this.name=gt.KHR_MESH_QUANTIZATION}},Wc=class extends li{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r*3+r;for(let o=0;o!==r;o++)t[o]=n[s+o];return t}interpolate_(e,t,n,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,u=r-t,h=(n-t)/u,d=h*h,f=d*h,p=e*c,y=p-c,m=-2*f+3*d,g=f-d,_=1-m,M=g-d+h;for(let v=0;v!==a;v++){let T=o[y+v+a],b=o[y+v+l]*u,w=o[p+v+a],x=o[p+v]*u;s[v]=_*T+M*b+m*w+g*x}return s}},wM=new vt,Ad=class extends Wc{interpolate_(e,t,n,r){let s=super.interpolate_(e,t,n,r);return wM.fromArray(s).normalize().toArray(s),s}},Gn={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Ws={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Rg={9728:Kt,9729:Ft,9984:Ml,9985:Rs,9986:Ir,9987:Qn},Pg={33071:On,33648:hs,10497:Ji},nd={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Ed={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},pr={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},AM={CUBICSPLINE:void 0,LINEAR:Tr,STEP:Mr},id={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function EM(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new _t({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ui})),i.DefaultMaterial}function Gr(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function mi(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function CM(i,e,t){let n=!1,r=!1,s=!1;for(let c=0,u=e.length;c<u;c++){let h=e[c];if(h.POSITION!==void 0&&(n=!0),h.NORMAL!==void 0&&(r=!0),h.COLOR_0!==void 0&&(s=!0),n&&r&&s)break}if(!n&&!r&&!s)return Promise.resolve(i);let o=[],a=[],l=[];for(let c=0,u=e.length;c<u;c++){let h=e[c];if(n){let d=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):i.attributes.position;o.push(d)}if(r){let d=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):i.attributes.normal;a.push(d)}if(s){let d=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):i.attributes.color;l.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){let u=c[0],h=c[1],d=c[2];return n&&(i.morphAttributes.position=u),r&&(i.morphAttributes.normal=h),s&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function RM(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,r=t.length;n<r;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function PM(i){let e,t=i.extensions&&i.extensions[gt.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+rd(t.attributes):e=i.indices+":"+rd(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,r=i.targets.length;n<r;n++)e+=":"+rd(i.targets[n]);return e}function rd(i){let e="",t=Object.keys(i).sort();for(let n=0,r=t.length;n<r;n++)e+=t[n]+":"+i[t[n]]+";";return e}function Cd(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function IM(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var DM=new Ne,Rd=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new SM,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,s=!1,o=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let l=a.match(/Version\/(\d+)/);r=n&&l?parseInt(l[1],10):-1,s=a.indexOf("Firefox")>-1,o=s?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&r<17||s&&o<98?this.textureLoader=new Po(this.options.manager):this.textureLoader=new No(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new ws(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,r=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][r.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:r.asset,parser:n,userData:{}};return Gr(s,a,r),mi(a,r),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(let l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let r=0,s=t.length;r<s;r++){let o=t[r].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let r=0,s=e.length;r<s;r++){let o=e[r];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let r=n.clone(),s=(o,a)=>{let l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(let[c,u]of o.children.entries())s(u,a.children[c])};return s(n,r),r.name+="_instance_"+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let r=e(t[n]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let r=0;r<t.length;r++){let s=e(t[r]);s&&n.push(s)}return n}getDependency(e,t){let n=e+":"+t,r=this.cache.get(n);if(!r){switch(e){case"scene":r=this.loadScene(t);break;case"node":r=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":r=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":r=this.loadAccessor(t);break;case"bufferView":r=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":r=this.loadBuffer(t);break;case"material":r=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":r=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":r=this.loadSkin(t);break;case"animation":r=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!r)throw new Error("Unknown type: "+e);break}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,r=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(r.map(function(s,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[gt.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(s,o){n.load(Li.resolveURL(t.uri,r.path),s,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let r=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+r)})}loadAccessor(e){let t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let o=nd[r.type],a=Ws[r.componentType],l=r.normalized===!0,c=new a(r.count*o);return Promise.resolve(new tt(c,o,l))}let s=[];return r.bufferView!==void 0?s.push(this.getDependency("bufferView",r.bufferView)):s.push(null),r.sparse!==void 0&&(s.push(this.getDependency("bufferView",r.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",r.sparse.values.bufferView))),Promise.all(s).then(function(o){let a=o[0],l=nd[r.type],c=Ws[r.componentType],u=c.BYTES_PER_ELEMENT,h=u*l,d=r.byteOffset||0,f=r.bufferView!==void 0?n.bufferViews[r.bufferView].byteStride:void 0,p=r.normalized===!0,y,m;if(f&&f!==h){let g=Math.floor(d/f),_="InterleavedBuffer:"+r.bufferView+":"+r.componentType+":"+g+":"+r.count,M=t.cache.get(_);M||(y=new c(a,g*f,r.count*f/u),M=new ys(y,f/u),t.cache.add(_,M)),m=new bs(M,l,d%f/u,p)}else a===null?y=new c(r.count*l):y=new c(a,d,r.count*l),m=new tt(y,l,p);if(r.sparse!==void 0){let g=nd.SCALAR,_=Ws[r.sparse.indices.componentType],M=r.sparse.indices.byteOffset||0,v=r.sparse.values.byteOffset||0,T=new _(o[1],M,r.sparse.count*g),b=new c(o[2],v,r.sparse.count*l);a!==null&&(m=new tt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let w=0,x=T.length;w<x;w++){let S=T[w];if(m.setX(S,b[w*l]),l>=2&&m.setY(S,b[w*l+1]),l>=3&&m.setZ(S,b[w*l+2]),l>=4&&m.setW(S,b[w*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=p}return m})}loadTexture(e){let t=this.json,n=this.options,s=t.textures[e].source,o=t.images[s],a=this.textureLoader;if(o.uri){let l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,s,a)}loadTextureImage(e,t,n){let r=this,s=this.json,o=s.textures[e],a=s.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);let d=(s.samplers||{})[o.sampler]||{};return u.magFilter=Rg[d.magFilter]||Ft,u.minFilter=Rg[d.minFilter]||Qn,u.wrapS=Pg[d.wrapS]||Ji,u.wrapT=Pg[d.wrapT]||Ji,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Kt&&u.minFilter!==Ft,r.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,r=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=r.images[e],a=self.URL||self.webkitURL,l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(h){c=!0;let d=new Blob([h],{type:o.mimeType});return l=a.createObjectURL(d),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let u=Promise.resolve(l).then(function(h){return new Promise(function(d,f){let p=d;t.isImageBitmapLoader===!0&&(p=function(y){let m=new Gt(y);m.needsUpdate=!0,d(m)}),t.load(Li.resolveURL(h,s.path),p,void 0,f)})}).then(function(h){return c===!0&&a.revokeObjectURL(l),mi(h,o),h.userData.mimeType=o.mimeType||IM(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=u,u}assignTexture(e,t,n,r){let s=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),s.extensions[gt.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[gt.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let l=s.associations.get(o);o=s.extensions[gt.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),s.associations.set(o,l)}}return r!==void 0&&(o.colorSpace=r),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,r=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new $i,Tn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new wr,Tn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(r||s||o){let a="ClonedMaterial:"+n.uuid+":";r&&(a+="derivative-tangents:"),s&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),s&&(l.vertexColors=!0),o&&(l.flatShading=!0),r&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return _t}loadMaterial(e){let t=this,n=this.json,r=this.extensions,s=n.materials[e],o,a={},l=s.extensions||{},c=[];if(l[gt.KHR_MATERIALS_UNLIT]){let h=r[gt.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),c.push(h.extendParams(a,s,t))}else{let h=s.pbrMetallicRoughness||{};if(a.color=new Ie(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){let d=h.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],un),a.opacity=d[3]}h.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",h.baseColorTexture,qt)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}s.doubleSided===!0&&(a.side=Mt);let u=s.alphaMode||id.OPAQUE;if(u===id.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===id.MASK&&(a.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&o!==Yt&&(c.push(t.assignTexture(a,"normalMap",s.normalTexture)),a.normalScale=new me(1,1),s.normalTexture.scale!==void 0)){let h=s.normalTexture.scale;a.normalScale.set(h,h)}if(s.occlusionTexture!==void 0&&o!==Yt&&(c.push(t.assignTexture(a,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&o!==Yt){let h=s.emissiveFactor;a.emissive=new Ie().setRGB(h[0],h[1],h[2],un)}return s.emissiveTexture!==void 0&&o!==Yt&&c.push(t.assignTexture(a,"emissiveMap",s.emissiveTexture,qt)),Promise.all(c).then(function(){let h=new o(a);return s.name&&(h.name=s.name),mi(h,s),t.associations.set(h,{materials:e}),s.extensions&&Gr(r,h,s),h})}createUniqueName(e){let t=It.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,r=this.primitiveCache;function s(a){return n[gt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return Ig(l,a,t)})}let o=[];for(let a=0,l=e.length;a<l;a++){let c=e[a],u=PM(c),h=r[u];if(h)o.push(h.promise);else{let d;c.extensions&&c.extensions[gt.KHR_DRACO_MESH_COMPRESSION]?d=s(c):d=Ig(new it,c,t),c.mode===Gn.TRIANGLE_STRIP?d=d.then(f=>Ih(f,Xo)):c.mode===Gn.TRIANGLE_FAN&&(d=d.then(f=>Ih(f,Ds))),r[u]={primitive:c,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,r=this.extensions,s=n.meshes[e],o=s.primitives,a=[];for(let l=0,c=o.length;l<c;l++){let u=o[l].material===void 0?EM(this.cache):this.getDependency("material",o[l].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(async function(l){let c=l.slice(0,l.length-1),u=l[l.length-1],h=[];for(let f=0,p=u.length;f<p;f++){let y=u[f],m=o[f],g,_=c[f];if(m.mode===Gn.TRIANGLES||m.mode===Gn.TRIANGLE_STRIP||m.mode===Gn.TRIANGLE_FAN||m.mode===void 0){let M=s.isSkinnedMesh===!0,v=y.hasAttribute("skinIndex")&&y.hasAttribute("skinWeight");M&&v===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),g=M&&v?new ho(y,_):new Se(y,_),g.isSkinnedMesh===!0&&g.normalizeSkinWeights()}else if(m.mode===Gn.LINES)g=new Ms(y,_);else if(m.mode===Gn.LINE_STRIP)g=new Ai(y,_);else if(m.mode===Gn.LINE_LOOP)g=new po(y,_);else if(m.mode===Gn.POINTS)g=new Jn(y,_);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(g.geometry.morphAttributes).length>0&&RM(g,s),g.name=t.createUniqueName(s.name||"mesh_"+e),mi(g,s),m.extensions&&Gr(r,g,m),t.assignFinalMaterial(g),h.push(g)}for(let f=0,p=h.length;f<p;f++)t.associations.set(h[f],{meshes:e,primitives:f});if(h.length===1)return s.extensions&&Gr(r,h[0],s),h[0];let d=new Ce;s.extensions&&Gr(r,d,s),t.associations.set(d,{meshes:e});for(let f=0,p=h.length;f<p;f++)d.add(h[f]);return d})}loadCamera(e){let t,n=this.json.cameras[e],r=n[n.type];if(!r){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new en(We.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type==="orthographic"&&(t=new tr(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),mi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let r=0,s=t.joints.length;r<s;r++)n.push(this._loadNodeShallow(t.joints[r]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(r){let s=r.pop(),o=r,a=[],l=[];for(let c=0,u=o.length;c<u;c++){let h=o[c];if(h){a.push(h);let d=new Ne;s!==null&&d.fromArray(s.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new fo(a,l)})}loadAnimation(e){let t=this.json,n=this,r=t.animations[e],s=r.name?r.name:"animation_"+e,o=[],a=[],l=[],c=[],u=[];for(let h=0,d=r.channels.length;h<d;h++){let f=r.channels[h],p=r.samplers[f.sampler],y=f.target,m=y.node,g=r.parameters!==void 0?r.parameters[p.input]:p.input,_=r.parameters!==void 0?r.parameters[p.output]:p.output;y.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",g)),l.push(this.getDependency("accessor",_)),c.push(p),u.push(y))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(h){let d=h[0],f=h[1],p=h[2],y=h[3],m=h[4],g=[];for(let M=0,v=d.length;M<v;M++){let T=d[M],b=f[M],w=p[M],x=y[M],S=m[M];if(T===void 0)continue;T.updateMatrix&&T.updateMatrix();let E=n._createAnimationTracks(T,b,w,x,S);if(E)for(let R=0;R<E.length;R++)g.push(E[R])}let _=new Ro(s,void 0,g);return mi(_,r),_})}createNodeMesh(e){let t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency("mesh",r.mesh).then(function(s){let o=n._getNodeRef(n.meshCache,r.mesh,s);return r.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=r.weights.length;l<c;l++)a.morphTargetInfluences[l]=r.weights[l]}),o})}loadNode(e){let t=this.json,n=this,r=t.nodes[e],s=n._loadNodeShallow(e),o=[],a=r.children||[];for(let c=0,u=a.length;c<u;c++)o.push(n.getDependency("node",a[c]));let l=r.skin===void 0?Promise.resolve(null):n.getDependency("skin",r.skin);return Promise.all([s,Promise.all(o),l]).then(function(c){let u=c[0],h=c[1],d=c[2];d!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(d,DM)});for(let f=0,p=h.length;f<p;f++)u.add(h[f]);if(u.userData.pivot!==void 0&&h.length>0){let f=u.userData.pivot,p=h[0];u.pivot=new I().fromArray(f),u.position.x-=f[0],u.position.y-=f[1],u.position.z-=f[2],p.position.set(0,0,0),delete u.userData.pivot}return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let s=t.nodes[e],o=s.name?r.createUniqueName(s.name):"",a=[],l=r._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),s.camera!==void 0&&a.push(r.getDependency("camera",s.camera).then(function(c){return r._getNodeRef(r.cameraCache,s.camera,c)})),r._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let u;if(s.isBone===!0?u=new vs:c.length>1?u=new Ce:c.length===1?u=c[0]:u=new Ut,u!==c[0])for(let h=0,d=c.length;h<d;h++)u.add(c[h]);if(s.name&&(u.userData.name=s.name,u.name=o),mi(u,s),s.extensions&&Gr(n,u,s),s.matrix!==void 0){let h=new Ne;h.fromArray(s.matrix),u.applyMatrix4(h)}else s.translation!==void 0&&u.position.fromArray(s.translation),s.rotation!==void 0&&u.quaternion.fromArray(s.rotation),s.scale!==void 0&&u.scale.fromArray(s.scale);if(!r.associations.has(u))r.associations.set(u,{});else if(s.mesh!==void 0&&r.meshCache.refs[s.mesh]>1){let h=r.associations.get(u);r.associations.set(u,{...h})}return r.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],r=this,s=new Ce;n.name&&(s.name=r.createUniqueName(n.name)),mi(s,n),n.extensions&&Gr(t,s,n);let o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(r.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let u=0,h=l.length;u<h;u++){let d=l[u];d.parent!==null?s.add(Ag(d)):s.add(d)}let c=u=>{let h=new Map;for(let[d,f]of r.associations)(d instanceof Tn||d instanceof Gt)&&h.set(d,f);return u.traverse(d=>{let f=r.associations.get(d);f!=null&&h.set(d,f)}),h};return r.associations=c(s),s})}_createAnimationTracks(e,t,n,r,s){let o=[],a=e.name?e.name:e.uuid,l=[];function c(f){f.morphTargetInfluences&&l.push(f.name?f.name:f.uuid)}pr[s.path]===pr.weights?(c(e),e.isGroup&&e.children.forEach(c)):l.push(a);let u;switch(pr[s.path]){case pr.weights:u=Ri;break;case pr.rotation:u=Pi;break;case pr.translation:case pr.scale:u=er;break;default:n.itemSize===1?u=Ri:u=er;break}let h=r.interpolation!==void 0?AM[r.interpolation]:Tr,d=this._getArrayFromAccessor(n);for(let f=0,p=l.length;f<p;f++){let y=new u(l[f]+"."+pr[s.path],t.array,d,h);r.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(y),o.push(y)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=Cd(t.constructor),r=new Float32Array(t.length);for(let s=0,o=t.length;s<o;s++)r[s]=t[s]*n;t=r}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let r=this instanceof Pi?Ad:Wc;return new r(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function LM(i,e,t){let n=e.attributes,r=new ln;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(r.set(new I(l[0],l[1],l[2]),new I(c[0],c[1],c[2])),a.normalized){let u=Cd(Ws[a.componentType]);r.min.multiplyScalar(u),r.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let s=e.targets;if(s!==void 0){let a=new I,l=new I;for(let c=0,u=s.length;c<u;c++){let h=s[c];if(h.POSITION!==void 0){let d=t.json.accessors[h.POSITION],f=d.min,p=d.max;if(f!==void 0&&p!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(p[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(p[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(p[2]))),d.normalized){let y=Cd(Ws[d.componentType]);l.multiplyScalar(y)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}r.expandByVector(a)}i.boundingBox=r;let o=new kt;r.getCenter(o.center),o.radius=r.min.distanceTo(r.max)/2,i.boundingSphere=o}function Ig(i,e,t){let n=e.attributes,r=[];function s(o,a){return t.getDependency("accessor",o).then(function(l){i.setAttribute(a,l)})}for(let o in n){let a=Ed[o]||o.toLowerCase();a in i.attributes||r.push(s(n[o],a))}if(e.indices!==void 0&&!i.index){let o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});r.push(o)}return pt.workingColorSpace!==un&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${pt.workingColorSpace}" not supported.`),mi(i,e),LM(i,e,t),Promise.all(r).then(function(){return e.targets!==void 0?CM(i,e.targets,t):i})}function Pd(i){let e=new Ce;e.name="piston-instance",e.scale.setScalar(1e3);let t=i.clone(!0);e.add(t);let n=[],r,s;if(t.traverse(o=>{let a=o.userData.part_name;a&&n.push({name:a,object:o,base:o.position.clone()}),a==="wrist_pin"&&(r=o),o.userData.datum_name==="anchor_crown"&&(s=o),o instanceof Se&&(o.castShadow=!0,o.receiveShadow=!0)}),!r||!s||n.length!==9)throw new Error("Die Kolbenbaugruppe hat unvollstaendige Bauteile oder Anschlusspunkte.");return e.userData.assetId=vn.assetId,{root:e,wristPin:r,crown:s,pieces:n}}function Lg(i,e){let t=Number.isFinite(e)?We.clamp(e,0,1):0,n={compression_ring_top:[0,.065,0],compression_ring_second:[0,.048,0],oil_rail_upper:[0,.033,0],oil_expander:[0,.025,0],oil_rail_lower:[0,.017,0],wrist_pin:[.075,0,0],retaining_clip_left:[-.065,0,0],retaining_clip_right:[.095,0,0]};for(let r of i.pieces){r.object.position.copy(r.base);let s=n[r.name];s&&r.object.position.addScaledVector(new I(...s),t)}i.root.updateMatrixWorld(!0)}async function Ng(){let i=new Gc,e="/demos/engine/models/",t=await Promise.allSettled([i.loadAsync(e+"m52-piston-reference.glb"),i.loadAsync(e+"m52-piston-engine.glb"),fetch(e+"m52-piston-reference.json").then(async o=>{if(!o.ok)throw new Error("Kolben-Metadaten fehlen.");return o.json()})]);if(t.some(o=>o.status==="rejected")){for(let o of t.slice(0,2))o.status==="fulfilled"&&o.value?.scene&&Vr(o.value.scene);throw new Error("Die lokalen Kolbenmodelle konnten nicht geladen werden. Der 2D-Schnitt bleibt verfuegbar.")}let n=t[0].value.scene,r=t[1].value.scene,s=t[2].value;if(s.assetId!==vn.assetId||s.units!=="metres"||s.dimensions.compressionHeightMm!==vn.compressionHeightMm)throw Vr(n),Vr(r),new Error("Das Kolbenmodell passt nicht zum Montagebezug.");return{hero:n,engine:r,assetId:s.assetId,triangles:s.triangles,engineTriangles:s.engineLod.triangles}}async function Fg(){let i="/demos/engine/models/studio-env",[e,t]=await Promise.all([fetch(i+".json"),fetch(i+".bin")]);if(!e.ok||!t.ok)throw new Error("Die vorberechnete Studioumgebung konnte nicht geladen werden.");let[n,r]=await Promise.all([e.json(),t.arrayBuffer()]),{width:s,height:o}=n;if(n.format!=="RGBA16F-CubeUV"||n.channels!==4||n.byteOrder!=="little-endian"||!Number.isInteger(s)||!Number.isInteger(o)||s<16||o<16||s>2048||o>2048||n.byteLength!==s*o*8||r.byteLength!==n.byteLength)throw new Error("Die vorberechnete Studioumgebung hat ein ungueltiges Datenformat.");if(n.threeRevision!=="186")throw new Error("Die Studioumgebung muss fuer diese Three.js-Version neu vorbereitet werden.");let a=new DataView(r),l=new Uint16Array(r.byteLength/2),c=0;for(let h=0;h<l.length;h++){let d=a.getUint16(h*2,!0);if((d&31744)===31744||(d&32768)!==0)throw new Error("Die Studioumgebung enthaelt ungueltige Strahlungswerte.");d>0&&h%4!==3&&c++,l[h]=d}if(c===0)throw new Error("Die vorberechnete Studioumgebung ist leer.");let u=new ai(l,s,o,bn,Nn);return u.name="studio-env-offline-cubeuv",u.mapping=Pr,u.colorSpace=un,u.minFilter=Ft,u.magFilter=Ft,u.generateMipmaps=!1,u.flipY=!1,u.unpackAlignment=1,u.needsUpdate=!0,u}function Ug(i){let e=[],t=[],n=[],r=[],s=[];for(let a=0;a<2;a++)for(let l=0;l<i;l++){let c=e.length/3;for(let[u,h]of[[-1,-1],[1,-1],[1,1],[-1,1]])e.push(u,h,0),t.push((u+1)/2,(h+1)/2),n.push(a),r.push(l+.37*a);s.push(c,c+1,c+2,c,c+2,c+3)}let o=new it;return o.setAttribute("position",new Ke(e,3)),o.setAttribute("uv",new Ke(t,2)),o.setAttribute("bank",new Ke(n,1)),o.setAttribute("seed",new Ke(r,1)),o.setIndex(s),o}function Og(i,e,t){let n={value:0},r={value:0},s={value:0},o=e.map(y=>{let m=Math.abs(y.y)>.95?new I(0,0,1):new I(0,1,0),g=new I().crossVectors(y,m).normalize();return{right:g,up:new I().crossVectors(g,y).normalize()}}),a={uTime:n,uOrigins:{value:i},uAxes:{value:e},uRights:{value:o.map(y=>y.right)},uUps:{value:o.map(y=>y.up)}},l="float rand(float x){return fract(sin(x*127.13+1.7)*43758.5453);}",c=`float hash2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(hash2(i),hash2(i+vec2(1.,0.)),f.x),mix(hash2(i+vec2(0.,1.)),hash2(i+vec2(1.,1.)),f.x),f.y);}`,u={transparent:!0,depthTest:!0,depthWrite:!1,toneMapped:!0,blending:sr,side:Mt,forceSinglePass:!0},h=new Vt({...u,uniforms:{...a,uFlow:{value:t.flow},uPressure:{value:t.pressureMotion},uTravel:{value:t.visualTravel},uCondensation:r,uGasVisibility:s,uPuffs:{value:t.puffs}},vertexShader:`attribute float bank;attribute float seed;
      uniform float uTime;uniform vec2 uFlow;uniform vec2 uPressure;uniform vec2 uTravel;uniform vec4 uPuffs[${Hr*2}];
      uniform vec3 uOrigins[2];uniform vec3 uAxes[2];uniform vec3 uRights[2];uniform vec3 uUps[2];
      varying vec2 vUv;varying float vAlpha;varying float vSeed;varying float vDistance;
      ${l}
      void main(){int b=int(bank);float flow=b==0?uFlow.x:uFlow.y;float pulse=b==0?uPressure.x:uPressure.y;
        float travel=b==0?uTravel.x:uTravel.y;float anchor=1.0-step(4.0,floor(seed));
        float phase=mix(fract(rand(seed*3.1)+travel/${Wr}.0),.025+.06*rand(seed*7.3),anchor);
        float side=(rand(seed*9.7)-.5),lift=(rand(seed*11.3)-.35);
        float wiggle=sin(uTime*1.8+seed*2.4)*phase*3.0;
        vec3 center=uOrigins[b]+uAxes[b]*(1.5+phase*${Wr}.0)
          +uRights[b]*(side*(20.0+phase*37.0)+wiggle)+uUps[b]*(lift*(16.0+phase*29.0)+phase*phase*32.0);
        float size=(16.0+phase*31.0)*mix(.76,1.38,rand(seed*19.1));
        vec4 view=modelViewMatrix*vec4(center,1.0);view.xy+=position.xy*size;
        vUv=uv;vDistance=phase;vSeed=seed;
        float wave=0.0;
        for(int i=0;i<${Hr};i++){
          vec4 event=uPuffs[b*${Hr}+i];float age=uTime-event.x;
          if(event.y>0.0&&age>=0.0&&age<event.w){float center=age*event.z/${Wr}.0;
            float q=(phase-center)/(.06+age*.11);wave+=exp(-q*q*2.0)*event.y*(1.0-age/event.w);}
        }
        vAlpha=flow*(0.10+0.045*pulse+min(.08,wave*.09))*(.55+.45*smoothstep(0.0,.07,phase))*(1.0-smoothstep(.57,1.0,phase));
        gl_Position=projectionMatrix*view;
      }`,fragmentShader:`uniform float uTime;uniform float uCondensation;uniform float uGasVisibility;varying vec2 vUv;varying float vAlpha;varying float vSeed;varying float vDistance;
      ${c}
      void main(){vec2 p=vUv*2.0-1.0;float r=length(p);
        float detail=noise2(p*3.3+vec2(vSeed*3.7,uTime*.45));
        float fine=noise2(p*7.1+vec2(vSeed*1.9,-uTime*.7));
        float edge=1.0-smoothstep(.55,1.02,r+(detail-.5)*.22);
        float alpha=vAlpha*exp(-2.1*r*r)*edge*(.72+.28*fine)*uGasVisibility;
        if(alpha<.001)discard;
        vec3 base=mix(vec3(.36,.40,.41),vec3(.76,.79,.79),uCondensation);
        base=mix(base,vec3(.46,.36,.29),.15*(1.0-vDistance)*(1.0-uCondensation));
        gl_FragColor=vec4(base,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});h.uniforms.uPuffs.value=t.puffs;let d=new Vt({...u,uniforms:{...a,uFlames:{value:t.flames}},vertexShader:`attribute float bank;attribute float seed;uniform float uTime;uniform vec4 uFlames[2];
      uniform vec3 uOrigins[2];uniform vec3 uAxes[2];uniform vec3 uRights[2];uniform vec3 uUps[2];
      varying vec2 vUv;varying float vAlpha;varying float vSeed;varying float vDistance;
      ${l}
      void main(){int b=int(bank);vec4 event=uFlames[b];float age=(uTime-event.x)/max(.001,event.y);
        float energy=event.z*step(0.0,age)*(1.0-step(1.0,age))*smoothstep(0.0,.08,age)*pow(max(0.0,1.0-age),.6);
        float id=floor(seed),anchor=1.0-step(4.0,id);
        float phase=mix(fract(rand(seed*2.7)+uTime*2.3),.025+id*.027,anchor);float flare=.40+.60*energy;
        float side=(rand(seed*4.3)-.5)*(1.0-anchor*.5),lift=(rand(seed*7.1)-.5)*(1.0-anchor*.5);
        vec3 center=uOrigins[b]+uAxes[b]*(2.0+phase*${Bg}.0*flare)
          +uRights[b]*side*(8.0+phase*15.0)+uUps[b]*(lift*(8.0+phase*15.0)+phase*phase*10.0);
        // Elongated, independently moving flame tongues in the projected pipe
        // direction, with a short rooted core; no pointed shell geometry.
        float length=(25.0+phase*17.0)*mix(.78,1.22,rand(seed*11.3))*flare;
        float width=(8.0+phase*8.0)*mix(.80,1.20,rand(seed*13.7))*flare;
        vec4 view=modelViewMatrix*vec4(center,1.0);
        vec2 along=normalize((modelViewMatrix*vec4(uAxes[b],0.0)).xy+vec2(.00001));vec2 across=vec2(-along.y,along.x);
        view.xy+=along*position.x*length+across*position.y*width;
        vUv=uv;vDistance=phase;vSeed=seed;vAlpha=energy*(.37+.12*anchor)*(1.0-smoothstep(.72,1.0,phase));
        gl_Position=projectionMatrix*view;
      }`,fragmentShader:`uniform float uTime;varying vec2 vUv;varying float vAlpha;varying float vSeed;varying float vDistance;
      ${c}
      void main(){vec2 p=vUv*2.0-1.0;
        float n=noise2(p*vec2(4.7,3.4)+vec2(vSeed*2.7,-uTime*2.7));
        float w=p.y+(n-.5)*.24;float r=length(vec2(p.x*.92,w*1.08));
        float edge=1.0-smoothstep(.62,1.0,r+(n-.5)*.16);
        float core=1.0-smoothstep(.18,.82,abs(w));
        float alpha=vAlpha*edge*(.28+.72*core)*(.73+.27*n);if(alpha<.001)discard;
        vec3 color=mix(vec3(.13,.18,1.35),vec3(2.6,1.0,.055),smoothstep(.015,.16,vDistance));
        color=mix(color,vec3(1.75,.19,.008),smoothstep(.22,.86,vDistance));
        gl_FragColor=vec4(color,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`}),f=new Se(Ug(36),h),p=new Se(Ug(18),d);return f.frustumCulled=!1,p.frustumCulled=!1,f.name="R\xE4umliche Abgasfahne \xB7 native Fluss-/Druckdaten",p.name="Flamme \xB7 optionale Illustration",f.renderOrder=6,p.renderOrder=7,f.visible=!1,p.visible=!1,{gas:f,flame:p,gasMaterial:h,flameMaterial:d,clock:n,condensation:r,gasVisibility:s,dispose(){f.geometry.dispose(),p.geometry.dispose(),h.dispose(),d.dispose()}}}var ki=144,zi=298.15,zg=101325,Xc=8.314462618,Vg=Math.PI*.0222*.0222*.94*1.08,NM=.35,Xr=i=>typeof i=="number"&&Number.isFinite(i),qr=(i,e,t)=>Math.max(e,Math.min(t,i)),kg=(i,e)=>(i%e+e)%e;function Id(i){let e=0;for(let t=1;t<i.length;t++)e+=Math.hypot(...i[t].map((n,r)=>n-i[t-1][r]));return e}function FM(){let i=zn();return[0,1].map(e=>{let t=e===0?"front":"rear",n=i.filter(o=>o.medium==="exhaust"&&o.branch==="header"&&o.cylinder!==void 0&&(e===0?o.cylinder<=3:o.cylinder>3)),r=n.reduce((o,a)=>o+Id(a.coords),0)/Math.max(n.length,1),s=["collector","main","tail"].reduce((o,a)=>{let l=i.find(c=>c.medium==="exhaust"&&c.branch===`${a}-${t}`);return o+(l?Id(l.coords):0)},0);return(r+s)/1e3})}var UM=FM(),OM=[0,1].map(i=>{let e=i===0?"front":"rear",t=zn();return["collector","main","tail"].reduce((n,r)=>{let s=t.find(o=>o.medium==="exhaust"&&o.branch===`${r}-${e}`);return n+(s?Id(s.coords):0)},0)/1e3});function Gg(i){return[0,1].map(e=>{let t=new Float32Array(ki),n=new Float32Array(ki),r=[1,2,3].map(u=>i?.find(h=>h.cylinder===u+e*3)),s=r.every(u=>u?.samples.length===ki),o=0,a=0,l=0,c=0;if(s)for(let u=0;u<ki;u++){let h=0,d=0,f=0,p=0;for(let y of r){let m=y.samples[u];if(!m||!Xr(m[0])||!Xr(m[1])||!Xr(m[5])||m[0]<=0||m[1]<=0){s=!1;break}let g=m[5];h+=g,g>0&&(p+=g,d+=g*m[1],f+=g*m[0])}if(!s)break;t[u]=h,n[u]=p?f/p:0,o+=h,a+=p,l+=d,c+=f}return s?{available:!0,signedMeanMolS:o/ki,positiveMeanMolS:a/ki,chamberTemperatureK:a?l/a:0,chamberPressureKpa:a?c/a:0,phaseRate:t,phasePressure:n}:{available:!1,signedMeanMolS:0,positiveMeanMolS:0,chamberTemperatureK:0,chamberPressureKpa:0,phaseRate:t,phasePressure:n}})}function Hg(i,e){let t=Math.max(0,i.signedMeanMolS),n=qr(i.chamberTemperatureK||zi,zi,3e3),r=zi+(n-zi)*NM,s=t*Xc*r/(zg*Vg),o=UM[e],a=s>1e-6?Math.min(2,o/s):0,l=Math.sqrt(1.33*Xc*r/.029);return{sourceMolS:t,estimatedOutletTemperatureK:r,estimatedVelocityMps:s,estimatedTravelS:a,visualVelocityMmS:t?qr(s*60,140,950):0,pressureWaveTravelS:o/l}}function BM(i,e,t){let n=Number.isFinite(i)?Math.max(0,i):0,r=Number.isFinite(e)?qr(e,zi,3e3):zi,s=zi+.65*(r-zi),o=n*Xc*s/(zg*Vg),a=OM[t],l=o>1e-6?Math.min(2,a/o):0,c=Math.sqrt(1.33*Xc*s/.029);return{sourceMolS:n,estimatedOutletTemperatureK:s,estimatedVelocityMps:o,estimatedTravelS:l,visualVelocityMmS:n?qr(o*60,140,950):0,pressureWaveTravelS:a/c}}var qc=class{rows=[];lastTime=-1;limiter=null;limiterEdges=[];consumedLimiter=[-1,-1];consumedPeak=[-1,-1];latestNativeTime=-1;lastFreshClock=-1;reset(){this.rows.length=0,this.lastTime=-1,this.limiter=null,this.limiterEdges.length=0,this.consumedLimiter=[-1,-1],this.consumedPeak=[-1,-1],this.latestNativeTime=-1,this.lastFreshClock=-1}update(e,t,n){if(!e||e.origin!=="native-exhaust-system"||!Array.isArray(e.wave)||!Array.isArray(e.banks)||e.banks.length!==2||e.banks.some(s=>!s||typeof s!="object")||!Xr(t)||t<0)return null;this.latestNativeTime>=0&&(t<this.latestNativeTime-1e-5||t-this.latestNativeTime>.3)&&this.reset(),this.latestNativeTime=t;let r=!1;for(let s=Math.max(0,e.wave.length-64);s<e.wave.length;s++){let o=e.wave[s];if(!Array.isArray(o)||o.length!==6||!o.every(Number.isFinite)||o[0]>t+.01||o[0]<=this.lastTime+1e-8)continue;this.lastTime>=0&&o[0]-this.lastTime>.05&&(this.rows.length=0,this.limiter=null,this.limiterEdges.length=0),this.rows.push([o[0],o[1],o[2],o[3],o[4],o[5]]),this.lastTime=o[0],r=!0;let a=o[5]>.5;a&&this.limiter===!1&&this.limiterEdges.push(o[0]),this.limiter=a}for(r&&(this.lastFreshClock=n);this.rows.length&&this.rows[0][0]<this.lastTime-2.15;)this.rows.shift();for(;this.limiterEdges.length&&this.limiterEdges[0]<this.lastTime-2.15;)this.limiterEdges.shift();return this.lastTime<0||t-this.lastTime>.2||!this.rows.length||n-this.lastFreshClock>.2?null:[0,1].map(s=>{let o=1+s*2,a=2+s*2,l=0,c=0;for(let E of this.rows)E[0]>this.lastTime-.08&&(l+=E[a],c++);let u=c?l/c:0,h=e.banks[s],d=Xr(h.temperatureK)?h.temperatureK:zi,f=BM(u,d,s),p=t-f.estimatedTravelS,y=t-f.pressureWaveTravelS,m=0,g=0,_=0,M=0;for(let E of this.rows)E[0]<=p&&E[0]>p-.08&&(m+=E[a],g++),E[0]<=y&&E[0]>y-.08&&(_+=E[o],M++);let v=g&&u>0?m/g:0,T=M?_/M:0,b=0;for(let E of this.rows)E[0]<=y&&E[0]>y-.08&&(b+=(E[o]-T)**2);let w=M?Math.sqrt(b/M):0,x=!1;for(let E=1;E<this.rows.length-1;E++){let R=this.rows[E-1],A=this.rows[E],P=this.rows[E+1];A[0]<=this.consumedPeak[s]||A[0]>y||A[0]<=y-.08||A[o]>R[o]&&A[o]>=P[o]&&A[o]-T>Math.max(1e-6,w*.25)&&(x=!0,this.consumedPeak[s]=A[0])}let S=!1;for(let E of this.limiterEdges)E>this.consumedLimiter[s]&&E<=p&&(this.consumedLimiter[s]=E,S=!0);return{rateMolS:v,sourceRateMolS:u,pressureKpa:T,pressureVariationKpa:w,pressurePeak:x,temperatureK:d,fuelFraction:Xr(h.fuelFraction)?qr(h.fuelFraction,0,1):0,oxygenFraction:Xr(h.oxygenFraction)?qr(h.oxygenFraction,0,1):0,limiterRising:S,fresh:r,transport:f}})}};function Wg(i,e,t,n,r){if(!i.available||!Number.isFinite(e)||!Number.isFinite(t)||t<=5)return{flow:0,pressureKpa:0};let s=kg(e/(4*Math.PI)-t/120*Math.max(0,r),1),o=qr(Math.max(0,n)*t/120,0,1),a=o>0?Math.min(32,Math.max(4,Math.ceil(o*ki))):1,l=0,c=0,u=0;for(let h=0;h<a;h++){let d=kg(s-o*(h+.5)/a,1)*ki,f=Math.floor(d),p=d-f,y=(f+1)%ki,m=i.phaseRate[f]*(1-p)+i.phaseRate[y]*p,g=i.phasePressure[f]*(1-p)+i.phasePressure[y]*p,_=Math.max(0,m);l+=_,c+=_*g,u+=_}return{flow:l/a,pressureKpa:u?c/u:0}}var Hr=6,Wr=230,Bg=210,Xg=.24,qg=.33,mr=i=>Number.isFinite(i)?Math.max(0,Math.min(1,i)):0,Dd=i=>Number.isFinite(i)?Math.max(0,i):0,Ld=class{flow=new me;puffs=Array.from({length:Hr*2},()=>new mt(-10,0,0,0));flames=[new mt(-10,0,0,0),new mt(-10,0,0,0)];temperatures=new me;pressureMotion=new me;visualTravel=new me;visualVelocity=new me;condensation=0;clock=0;running=!1;illustrativeLiftOff=!1;illustrativeLimiter=!1;ignition=!1;previousClock=null;previousThrottle=null;previousRates=[0,0];pulseArmed=[!0,!0];lastPuff=[-10,-10];lastFlame=[-10,-10];cursor=[0,0];cycles;bankCurves;nativeWave=new qc;nativeBanks=null;usedSource="instantaneous-valve";setIllustrativeLiftOff(e){this.illustrativeLiftOff=e,this.previousThrottle=null}setIllustrativeLimiter(e){this.illustrativeLimiter=e}clear(){this.flow.set(0,0),this.temperatures.set(0,0),this.pressureMotion.set(0,0),this.visualVelocity.set(0,0),this.visualTravel.set(0,0),this.condensation=0;for(let e of this.puffs)e.y=0;for(let e of this.flames)e.z=0;for(let e=0;e<2;e++)this.previousRates[e]=0,this.pulseArmed[e]=!0,this.lastPuff[e]=-10;this.previousThrottle=null,this.nativeWave.reset(),this.nativeBanks=null}update(e){let t=Number.isFinite(e.clock)?Math.max(0,e.clock):this.clock,n=this.previousClock!==null&&t<this.previousClock,r=this.previousClock===null?0:Math.max(0,Math.min(.15,t-this.previousClock));if(n&&(this.clear(),this.lastFlame[0]=this.lastFlame[1]=-10),this.clock=t,this.previousClock=t,this.running=e.enabled!==!1&&Number.isFinite(e.rpm)&&e.rpm>5,this.ignition=e.ignition===!0,!this.running){this.clear();return}if(!this.ignition)for(let a of this.flames)a.z=0;e.cycles!==this.cycles&&(this.cycles=e.cycles,this.bankCurves=Gg(e.cycles)),this.nativeBanks=this.nativeWave.update(e.nativeExhaust,e.nativeSimTime,t),this.usedSource=this.nativeBanks?"collector-wave":e.nativeExhaust?"collector-stale":this.bankCurves?.some(a=>a.available)?"cylinder-cycle":"instantaneous-valve";let s=e.coldCondensation;this.condensation=s?.illustrative===!0&&Number.isFinite(s.ambientC)&&Number.isFinite(s.engineC)&&s.ambientC<10&&s.engineC<65?mr((10-s.ambientC)/18)*mr((65-s.engineC)/50)*Math.min(.65,mr(s.strength??.5)):0;for(let a=0;a<2;a++){let l=this.bankCurves?.[a],c=this.nativeBanks?.[a],u=c?Dd(c.rateMolS):e.nativeExhaust?0:l?.available?Dd(l.signedMeanMolS):Dd(e.bankRates[a]),h=1-Math.exp(-1.3*Math.sqrt(u)),d=this.flow.getComponent(a),f=r>0?1-Math.exp(-r/.07):1;this.flow.setComponent(a,u>0?d+(h-d)*f:0);let p=c?.transport??(l?.available?Hg(l,a):void 0);this.temperatures.setComponent(a,p?.estimatedOutletTemperatureK??0),this.visualVelocity.setComponent(a,u>0?p?.visualVelocityMmS??260:0),r>0&&this.visualTravel.setComponent(a,(this.visualTravel.getComponent(a)+this.visualVelocity.getComponent(a)*r)%Wr);let y=c?mr(1-Math.exp(-c.pressureVariationKpa/.08)):0;this.pressureMotion.setComponent(a,c?y:!e.nativeExhaust&&l?.available?mr(Wg(l,e.angle??NaN,e.rpm,r,p.estimatedTravelS).flow/(l.positiveMeanMolS*3+.001)):0);let m=mr(e.pulseStrength?.[a]??(c?y:l?.available?this.pressureMotion.getComponent(a):h));m<.14&&(this.pulseArmed[a]=!0);let g=u>1e-6&&this.previousRates[a]<=1e-6,_=c?c.pressurePeak:m>.24&&this.pulseArmed[a];if(u>1e-6&&(g||_)&&t-this.lastPuff[a]>.035){let v=a*Hr+this.cursor[a];this.puffs[v].set(t,Math.max(.12,m,h),210+h*95,.75),this.cursor[a]=(this.cursor[a]+1)%Hr,this.lastPuff[a]=t,_&&(this.pulseArmed[a]=!1)}this.previousRates[a]=u;let M=this.flames[a];M.z>0&&t-M.x>M.y&&(M.z=0)}if(this.illustrativeLimiter&&this.ignition&&this.nativeBanks?.some(a=>a.fresh&&a.limiterRising&&a.fuelFraction>0&&a.oxygenFraction>0))for(let a=0;a<2;a++){let l=this.nativeBanks[a];l.fresh&&l.limiterRising&&l.fuelFraction>0&&l.oxygenFraction>0&&this.triggerIllustrativeFlame(a,.8,"limiter")}let o=e.actualThrottle;this.illustrativeLiftOff&&typeof o=="number"&&Number.isFinite(o)&&this.previousThrottle!==null&&r>0&&e.rpm>=2200&&this.ignition&&this.previousThrottle>.5&&this.previousThrottle-o>.3&&this.triggerIllustrativeFlame("both",.85,"lift-off"),this.previousThrottle=typeof o=="number"&&Number.isFinite(o)?mr(o):null}triggerIllustrativeFlame(e="both",t=.9,n="manual"){if(!this.running||!this.ignition)return!1;let r=!1,s=mr(t);if(s<=0)return!1;for(let o=0;o<2;o++)(e==="both"||e===o)&&this.previousRates[o]>1e-6&&this.flow.getComponent(o)>.025&&this.clock-this.lastFlame[o]>.8&&(this.flames[o].set(this.clock+(o===1?.018:0),Xg+s*(qg-Xg),s,n==="manual"?1:n==="limiter"?3:2),this.lastFlame[o]=this.clock,r=!0);return r}diagnostics(){return{running:this.running,clock:this.clock,flow:this.flow.toArray(),condensation:this.condensation,flames:this.flames.map(e=>({active:e.z>0&&this.clock>=e.x&&this.clock<=e.x+e.y,age:this.clock-e.x,duration:e.y,strength:e.z,origin:e.w===3?"illustrative-limiter":e.w===2?"illustrative-lift-off":"illustrative-manual"})),source:this.usedSource,collector:this.nativeBanks?.map(e=>({rateMolS:e.rateMolS,sourceRateMolS:e.sourceRateMolS,pressureKpa:e.pressureKpa,pressureVariationKpa:e.pressureVariationKpa,temperatureK:e.temperatureK,transport:e.transport}))??null,nativeAfterfireSignal:!1,automaticFlames:this.illustrativeLimiter?"opt-in-limiter-sport":this.illustrativeLiftOff?"opt-in-illustration":"off",maximumFlameSeconds:qg}}};function Kg(i,e){if(i.length!==2||e.length!==2)throw new Error("Genau zwei gemeinsame Endrohraustritte erforderlich.");if(i.some(f=>![f.x,f.y,f.z].every(Number.isFinite)))throw new Error("Ung\xFCltiger gemeinsamer Endrohraustritt.");let t=i.map(f=>f.clone()),n=e.map(f=>{if(!Number.isFinite(f.lengthSq())||f.lengthSq()<1e-8)throw new Error("Ung\xFCltige Endrohrrichtung.");return f.clone().normalize()}),r=new Ce;r.name="R\xE4umliche Abgasfahne und illustrative Flammen";let s=new Ld,o=Og(t,n,s),{gas:a,flame:l,clock:c,condensation:u,gasVisibility:h}=o;r.add(a,l);let d=!1;return{root:r,controller:s,outlets:t,directions:n,update(f){d||(s.update(f),c.value=s.clock,u.value=s.condensation,h.value=f.schematicGas===!0?1:s.condensation,a.visible=s.running&&h.value>1e-5&&(s.flow.x>1e-5||s.flow.y>1e-5),l.visible=s.flames.some(p=>p.z>0&&s.clock>=p.x&&s.clock<=p.x+p.y))},triggerIllustrativeFlame(f="both",p=.9){return!d&&s.triggerIllustrativeFlame(f,p)},setIllustrativeLiftOff(f){s.setIllustrativeLiftOff(f)},setIllustrativeLimiter(f){s.setIllustrativeLimiter(f)},setVisible(f){r.visible=f&&!d},needsAnimation(){return!d&&r.visible&&(a.visible||l.visible)},diagnostics(){return{...s.diagnostics(),disposed:d,draws:2,gasVisible:a.visible,gasVisibility:h.value,outlets:t.map(f=>f.toArray()),directions:n.map(f=>f.toArray()),textures:0,billboards:{gas:72,flame:36},resources:"owned geometry/material; no shared maps, renderer, lights or audio"}},dispose(){d||(d=!0,r.removeFromParent(),o.dispose(),r.clear())}}}var kM=new Set(["M54 Abgasflansche und Fallrohre","Abgasnachbehandlung","Hohle Edelstahl Doppelendrohre"]);function Nd(i,e,t,n,r,s,o){let a=i==="cutaway";for(let l of s.children)kM.has(l.name)&&(l.visible=!a);if(a)for(let l of o.children)l.name==="M54 Katalysatoren im Schnitt"&&(l.visible=!1);if(i==="cutaway"){for(let[l,c]of t)c.volume.visible=!1,c.points.visible=!1,l==="exhaust"&&c.pipe&&(c.pipe.visible=!1);for(let{gas:l}of n){let c=l.material;Array.isArray(c)||(c.opacity=Math.min(c.opacity,.055))}}}async function zM(){let i=globalThis.scheduler;if(typeof i?.yield=="function")try{return await i.yield(),"scheduler"}catch(e){if(typeof MessageChannel>"u")throw e}return typeof MessageChannel<"u"?(await new Promise((e,t)=>{let n=new MessageChannel,r=()=>{n.port1.close(),n.port2.close()};n.port1.onmessage=()=>{r(),e()},n.port1.onmessageerror=()=>{r(),t(new Error("Startup task message failed"))};try{n.port2.postMessage(0)}catch(s){r(),t(s)}}),"messageChannel"):(await new Promise(e=>setTimeout(e,0)),"timer")}function Yg(){let i=()=>typeof document>"u"?"unavailable":document.visibilityState,e=i(),t=e,n=0,r=0,s=0,o=0,a=0,l=0,c=0;return{wait:async()=>{let u=performance.now(),h=i()==="hidden",d=await zM(),f=performance.now()-u;n++,r+=f,s=Math.max(s,f),h&&o++,d==="scheduler"?a++:d==="messageChannel"?l++:c++,t=i()},snapshot:()=>({count:n,totalMs:Math.round(r*10)/10,maxMs:Math.round(s*10)/10,initialVisibility:e,finalVisibility:t,hiddenYields:o,schedulerYields:a,messageYields:l,timerYields:c})}}function Zg(){let i=new Ce;i.name="R13 Motorhalter auf bestehendem Pruefstand";let e=new _t({color:3823973,metalness:.48,roughness:.52}),t=new _t({color:6912893,metalness:.62,roughness:.4}),n=new _t({color:11187635,metalness:.72,roughness:.32}),r=new Map,s=(l,c,u,h=new vt)=>{let d=l.index?l.toNonIndexed():l;d!==l&&l.dispose(),d.applyMatrix4(new Ne().compose(u,h,new I(1,1,1)));let f=r.get(c)??[];f.push(d),r.set(c,f)},o=(l,c,u,h,d,f,p,y)=>s(new ot(l,c,u),p,new I(h,d,f),y),a=(l,c,u,h)=>s(new st(4.2,4.2,5,6),n,new I(l,c,u),h==="z"?new vt().setFromAxisAngle(new I(1,0,0),Math.PI/2):void 0);for(let l of[-245,245])for(let c of[-1,1]){let u=c*135;o(57,8,47,l,-69,u,t);let h=new I(l,-65,u),d=new I(l,18,c*78),f=d.clone().sub(h),p=f.length(),y=new vt().setFromUnitVectors(new I(0,1,0),f.normalize()),m=h.add(d).multiplyScalar(.5);o(23,p,23,m.x,m.y,m.z,e,y),o(62,44,8,l,17,c*75,t);for(let g of[-19,19])a(l+g,-62,u,"y"),a(l+g,19,c*81.5,"z")}for(let[l,c]of r){let u=yt(c);if(c.forEach(h=>h.dispose()),!u)throw new Error("Motorhalter konnten nicht zusammengefuegt werden.");i.add(new Se(u,l))}return i.userData={mounts:4,placement:"existing-test-cell-pads",kind:"illustrative"},i}var VM={block:["M54B30 Gussblock im Schnitt","M54B30 vollstaendiger Gussblock","Gegossene Oelwanne"],head:["M54B30 Kopfkanaele im Schnitt","M54B30 geschlossener Kopf Ventildeckel DoppelVANOS"],intake:["M54B30 innere Dreiergruppen R7","M54B30 geformte Ansaugbruecke R7","M54B30 Filter LMM Drossel und Portleiste"],exhaust:["M54 Katalysatoren im Schnitt","M54 Kr\xFCmmer und Kat Au\xDFenh\xFCllen nach Fotoreferenz","M54 Abgasflansche und Fallrohre","Abgasnachbehandlung"]},Kc=new I(0,1,0),gi=new I,Xs=new I,Yc=new I,Zc=class i{constructor(e){this.host=e;this.renderer=new fc({antialias:!0,alpha:!1,powerPreference:"high-performance"});let t=this.renderer.getContext(),n=t.getExtension("WEBGL_debug_renderer_info");this.softwareGraphics=!!n&&/swiftshader|llvmpipe|software|warp/i.test(String(t.getParameter(n.UNMASKED_RENDERER_WEBGL))),this.softwareGraphics&&(this.pixelRatio=Math.min(devicePixelRatio||1,.4)),e.dataset.graphics=this.softwareGraphics?"software":"hardware",this.renderer.setPixelRatio(this.pixelRatio),this.renderer.setClearColor(1516847),this.renderer.outputColorSpace=qt,this.renderer.toneMapping=Bo,this.renderer.toneMappingExposure=1.1,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=bl,this.renderer.shadowMap.autoUpdate=!1;let r=this.renderer.domElement;r.id="engine-3d-canvas",r.tabIndex=0,r.setAttribute("role","img"),r.setAttribute("aria-label","Drehbarer 3D-Reihensechser im Schnitt mit Ansaugung, Abgasanlage, Kuehlung und bewegtem Steuertrieb"),r.addEventListener("webglcontextlost",o=>{o.preventDefault(),this.contextLost=!0,this.host.dataset.webgl="lost"}),r.addEventListener("webglcontextrestored",()=>{this.contextLost=!1,this.studioDirty=!0,this.renderer.shadowMap.needsUpdate=!0,this.host.dataset.webgl="ready"}),e.append(r),e.dataset.webgl="loading",this.controls=new vc(this.camera,r),this.controls.target.set(0,105,0),this.controls.enableDamping=!0,this.controls.dampingFactor=.12,this.controls.minDistance=400,this.controls.maxDistance=2e3,this.controls.addEventListener("change",()=>{this.studioDirty=!0,e.dataset.camera=this.camera.position.toArray().map(o=>o.toFixed(1)).join(",")}),this.resetCamera();let s=new Io(14017005,2502970,1.1);this.scene.add(s),this.keyLight=new nr(16773599,2.2),this.keyLight.position.set(-300,600,450),Object.assign(this.keyLight.shadow.camera,{left:-130,right:130,top:130,bottom:-130,near:1,far:1500}),this.keyLight.shadow.mapSize.set(this.softwareGraphics?512:1024,this.softwareGraphics?512:1024),this.keyLight.shadow.normalBias=.08,this.keyLight.shadow.bias=-2e-4,this.scene.add(this.keyLight);for(let[o,a,l,c,u]of[[350,300,-400,10734063,1.3],[150,120,-300,15003647,2]]){let h=new nr(c,u);h.position.set(o,a,l),this.scene.add(h)}this.inspectionLight.name="DISA Inspektionslicht",this.scene.add(this.inspectionLight,this.inspectionLight.target),this.metal=this.mat(10399672,.62,.36),this.rodMetal=this.mat(8294811,.65,.38),this.dark=this.mat(2504768,.5,.5),this.staticMaterial=this.mat(4610919,.5,.45),this.scene.add(this.extras,this.housing,this.mechanical,this.combustion,this.stand),this.extras.add(this.head),this.engineFloor=new Fo(1700,34,4481132,2703436),this.engineFloor.position.set(130,-158,0),this.engineFloor.material.transparent=!0,this.engineFloor.material.opacity=.28,this.scene.add(this.engineFloor),this.studio.visible=!1,this.scene.add(this.studio),this.assetSources.visible=!1,this.scene.add(this.assetSources),this.observer=new ResizeObserver(o=>{let a=o[0].contentRect;if(a.width<1||a.height<1)return;this.width=a.width,this.height=a.height,this.renderer.setSize(this.width,this.height,!1),this.studioDirty=!0,this.camera.aspect=this.width/this.height,this.camera.updateProjectionMatrix();let l=this.width<600?"narrow":"wide";this.cameraLayout!==l&&(this.cameraLayout=l,this.view(this.cameraPreset))}),this.observer.observe(e),r.addEventListener("keydown",this.keydown),this.updateVisibility(),e.dataset.mechanism="always-visible",e.dataset.occlusion="shared-depth",e.dataset.cylinders="6"}host;scene=new xs;camera=new en(38,1,2,4e3);renderer;controls;parts=[];routes=[];disaIllustration="unknown";exhaustHeat=kc();exhaustHeatInitialized=!1;lastExhaustHeatAt=null;extras=new Ce;head=new Ce;housing=new Ce;mechanical=new Ce;combustion=new Ce;studio=new Ce;stand=Zg();assemblyFocus="complete";focusOverlays=[];focusMaterial=new Yt({color:6669539,transparent:!0,opacity:.25,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-1});assetSources=new Ce;studioPiston=null;pistonLibrary=null;environment=null;component="engine";presentation="cutaway";exploded=0;extrasEnabled=!0;housingEnabled=!0;engineFloor;keyLight;inspectionLight=new Er(14542827,0,750,.72,.85,2);flowGroups=new Map;flowBatches=new Map;routeMaterials=new Map;workshop=null;exhaustPlumes=null;limiterFlames=!1;limiterFlameEvents=0;lastLimiterBirth=[-10,-10];flowView=null;flowMotion=new Hs;portSpray=null;glowTexture=null;clock=0;width=1;height=1;disposed=!1;ready=!1;contextLost=!1;observer;materials=[];mode={air:"transparent",fuel:"transparent",exhaust:"transparent",water:"transparent",oil:"transparent"};deck=177+vn.compressionHeightMm+vn.illustrativeCrownClearanceMm;headOffset=this.deck-205;boreScale=1;nativeGeometry="84:84:135";intakeSelection={};intakeGeometry="standard";assemblyRevision=0;camCurves=null;cameraPreset="overview";frameSerial=0;lastAngle=0;lastDriveAngle=0;frameCount=0;cameraLayout="";cameraPoints=[];lastRender=0;lastDrawSignature="";renderSamples=0;renderCost=0;pixelRatio=Math.min(devicePixelRatio||1,1);softwareGraphics=!1;studioDirty=!0;flywheel;staticMaterial;metal;rodMetal;dark;static async create(e,t,n={}){let r=performance.now(),s=new i(e),o=Em(),a=Yg();try{let l=await Ng();s.pistonLibrary=l,s.assetSources.add(l.hero,l.engine),s.studioPiston=Pd(l.hero),s.studio.add(s.studioPiston.root);let c=await Fg();s.environment=c,s.scene.environmentIntensity=.85,l.engine.traverse(d=>{if(d instanceof Se)for(let f of Array.isArray(d.material)?d.material:[d.material])f instanceof _t&&(s.softwareGraphics?(f.normalMap=null,f.envMap=null,f.metalness=Math.min(.28,f.metalness),f.roughness=Math.max(.4,f.roughness)):(f.envMap=c,f.envMapIntensity=.85),f.needsUpdate=!0)});let u=s.mesh(new Ei(72,80),new _t({color:1582126,roughness:.8,metalness:.08}),s.studio,0,-20.23,0);u.rotation.x=-Math.PI/2,u.receiveShadow=!0;let h=t?.();if(h){let d=Qo(h.cfg);s.deck=d.deck,s.headOffset=d.headOffset,s.boreScale=d.boreScale,s.nativeGeometry=[h.cfg.engine.boreMm,h.cfg.engine.strokeMm,h.cfg.engine.rodMm].join(":")}if(s.intakeSelection={...h?.cfg.tuning},s.intakeGeometry=kr(s.intakeSelection).intake,e.dataset.geometryCache=await o?"ready":"fallback",await s.buildAssembly(h?.state?.valveCurves,a.wait),s.disposed)throw new Error("Engine initialization disposed");if(e.dataset.geometryCacheDetail=JSON.stringify(Am()),s.buildFlowView(h?.cfg??xc()),s.applyComponentVisibility(),await a.wait(),s.disposed)throw new Error("Engine initialization disposed");return e.dataset.startupYield=JSON.stringify(a.snapshot()),n.deferCompilation||(s.component="piston",s.applyComponentVisibility(),await s.renderer.compileAsync(s.scene,s.camera),s.component="engine",s.applyComponentVisibility(),await s.renderer.compileAsync(s.scene,s.camera),s.presentation="flow",s.applyComponentVisibility(),await s.renderer.compileAsync(s.scene,s.camera)),s.component="engine",s.presentation="cutaway",s.applyComponentVisibility(),s.softwareGraphics&&await s.primeEngineBuffers(),s.ready=!0,e.dataset.assemblyRevision=String(++s.assemblyRevision),e.dataset.initializationMs=(performance.now()-r).toFixed(1),e.dataset.webgl="ready",s}catch(l){throw s.dispose(),l}}async primeEngineBuffers(e=[this.mechanical,this.extras,this.housing,this.combustion,this.stand,this.engineFloor,...this.flowGroups.values()]){let t=new xs,n=[];this.scene.updateMatrixWorld(!0);for(let l of this.scene.children)l instanceof Di&&t.add(l.clone());for(let l of e)l.traverse(c=>{if(!(c instanceof Se||c instanceof Ai||c instanceof Jn))return;let u=c.clone(!1);u.visible=!0,u.frustumCulled=!1,u.matrixAutoUpdate=!1,u.matrix.copy(c.matrixWorld),n.push(u)});let r=this.renderer.domElement,s=r.style.visibility;r.style.visibility="hidden";let o=0,a=0;try{this.renderer.setSize(8,8,!1),t.add(...n),await this.renderer.compileAsync(t,this.camera),t.remove(...n);for(let l=0;l<n.length;l+=8){if(this.disposed)return;let c=n.slice(l,l+8);t.add(...c),this.renderer.setSize(8,8,!1);let u=performance.now();this.renderer.render(t,this.camera),o=Math.max(o,performance.now()-u),a++,t.remove(...c),await new Promise(h=>setTimeout(h,0))}}finally{t.clear(),this.renderer.setSize(this.width,this.height,!1),r.style.visibility=s,this.studioDirty=!0,this.host.dataset.warmupBatches=String(a),this.host.dataset.warmupMaxBatchMs=o.toFixed(1)}}async buildAssembly(e,t){let n=t??(()=>new Promise(s=>setTimeout(s,0)));if(this.buildMechanism(),await n(),this.disposed)return;this.buildExternal();let r=0;for(let s of zn(this.headOffset))if(this.disposed||(this.route(s),++r%4===0&&(await n(),this.disposed)))return;this.batchFlowGeometry(),this.buildPlumes(),this.mergeStaticExtras(),this.updateCamProfiles(e),this.applyComponentVisibility(),this.cacheCameraEnvelope()}mat(e,t=.5,n=.4){let r=zs(e,t,n);return this.materials.push(r),r}mesh(e,t,n,r=0,s=0,o=0){let a=new Se(e,t);return a.position.set(r,s,o),n.add(a),a}cylinder(e,t,n,r,s=0,o=0,a=0,l="y",c=24){let u=this.mesh(new st(t,t,n,c),r,e,s,o,a);return l==="x"&&(u.rotation.z=Math.PI/2),l==="z"&&(u.rotation.x=Math.PI/2),u}torus(e,t,n,r,s=0,o=0,a=0,l="y"){let c=this.mesh(new zt(t,n,6,32),r,e,s,o,a);return l==="y"&&(c.rotation.x=Math.PI/2),l==="x"&&(c.rotation.y=Math.PI/2),c}box(e,t,n,r,s,o=0,a=0,l=0){return this.mesh(new ot(t,n,r),s,e,o,a,l)}mergeStaticExtras(){let e=new Set([...this.parts.flatMap(t=>[t.gas,t.spark,t.throw.children[0]]),...this.parts.flatMap(t=>t.springs.flat())]);for(let t of[this.extras,this.head,...this.parts.flatMap(n=>[...n.valves,...n.cams,n.throw])]){let n=new Map;for(let r of t.children){if(!(r instanceof Se)||r instanceof Zt||e.has(r)||Array.isArray(r.material))continue;let s=n.get(r.material)??[];s.push(r),n.set(r.material,s)}for(let[r,s]of n){if(s.length<2)continue;let o=s.map(l=>(l.updateMatrix(),(l.geometry.index?l.geometry.toNonIndexed():l.geometry.clone()).applyMatrix4(l.matrix))),a=yt(o,!1);if(o.forEach(l=>l.dispose()),!!a){for(let l of s)l.removeFromParent(),l.geometry.dispose();this.mesh(a,r,t)}}}}glowMap(){if(this.glowTexture)return this.glowTexture;let e=32,t=new Uint8Array(e*e*4);for(let n=0;n<e;n++)for(let r=0;r<e;r++){let s=Math.hypot((r+.5-e/2)/(e/2),(n+.5-e/2)/(e/2)),o=Math.pow(Math.max(0,1-s),2.2),a=(n*e+r)*4;t[a]=t[a+1]=t[a+2]=255,t[a+3]=Math.round(o*255)}return this.glowTexture=new ai(t,e,e),this.glowTexture.needsUpdate=!0,this.glowTexture}buildMechanism(){let e=this.mat(3885908,.9,.3);for(let t of ze){let n=Pd(this.pistonLibrary.engine),r=new Ce;r.add(n.root),r.position.x=t,this.mechanical.add(r);let s=this.mesh(new ot(1,1,1),this.rodMetal,this.mechanical);s.scale.set(13,135,8);let o=this.cylinder(this.mechanical,10,17,this.metal,0,0,0,"x"),a=this.cylinder(this.mechanical,17,24,this.metal,0,0,0,"x");this.cylinder(a,8,27,e);let l=new Ce;l.position.x=t,this.mechanical.add(l),this.cylinder(l,14,43,this.metal,0,42,0,"x");for(let _ of[-1,1]){this.box(l,10,51,24,this.metal,_*24,19,0);let M=new Se(new st(47,47,11,28,1,!1,Math.PI*.65,Math.PI*1.25),this.rodMetal);M.rotation.z=Math.PI/2,M.position.set(_*24,-7,0),l.add(M),this.cylinder(l,20,10,this.metal,_*24,42,0,"x")}let c=this.cylinder(this.combustion,37.5*this.boreScale,1,new Yt({color:5611263,transparent:!0,opacity:.08,depthWrite:!1,side:Mt,forceSinglePass:!0}),t,180,0),u=512,h=new tt(new Float32Array(u*3),3);h.setUsage(tn);let d=new it;d.setAttribute("position",h),d.boundingSphere=new kt(new I(t,160,0),160),d.setAttribute("seed",new tt(Float32Array.from({length:u},(_,M)=>(M+.5)/u),1));let f=new Jn(d,gg());f.visible=!1,this.combustion.add(f);let p=this.mesh(new Eo(2,10,6),new Yt({color:16772546,transparent:!0,opacity:.95,depthWrite:!1,blending:or}),this.combustion,t,this.deck-1,0);p.visible=!1;let y=[],m=[],g=[];for(let _ of[-23,23]){let M=new Ce;M.position.set(t,0,_),this.head.add(M),y.push(M);let v=[];for(let b of[-17,17]){this.cylinder(M,2.5,61,this.metal,b,234,0),this.cylinder(M,12,3,this.metal,b,205,0),this.cylinder(M,8,6,e,b,252,0),this.cylinder(M,7,6,this.metal,b,264,0);let w=Array.from({length:65},(S,E)=>new I(Math.sin(E/64*Ht*5)*6,(E/64-.5)*34,Math.cos(E/64*Ht*5)*6)),x=this.mesh(new nn(new Ot(w),64,.65,4,!1),this.rodMetal,this.head,t+b,232,_);v.push(x),this.cylinder(this.head,8,2,e,t+b,214,_)}g.push(v);let T=new Ce;T.position.set(t,279,_),this.head.add(T),m.push(T);for(let b of[-17,17])this.cylinder(T,10,14,this.metal,b,0,0,"x")}this.parts.push({piston:r,wristPin:n.wristPin,crown:n.crown,rod:s,smallEnd:o,bigEnd:a,throw:l,valves:y,springs:g,cams:m,gas:c,flame:f,flameBuffer:h,spark:p})}for(let t=0;t<7;t++){let n=-300+t*100;this.cylinder(this.mechanical,14,45,this.metal,n,0,0,"x");let r=this.mesh(new st(23,23,12,20,1,!0,Math.PI*.5,Math.PI),this.staticMaterial,this.extras,n,0,0);r.rotation.z=Math.PI/2;for(let s of[-24,24])this.box(this.extras,14,9,10,this.dark,n,-20,s),this.cylinder(this.extras,2.5,12,this.metal,n,-22,s,"y",6)}this.flywheel=dg(this.mat.bind(this)),this.flywheel.position.x=325,this.extras.add(this.flywheel)}buildExternal(){this.head.position.y=this.headOffset,this.workshop=hg({extras:this.extras,housing:this.housing,head:this.head,deck:this.deck,headOffset:this.headOffset,boreScale:this.boreScale,mat:this.mat.bind(this),confirmedSelection:this.intakeSelection});for(let e of this.workshop.manifoldHeat?.replacedSourceMaterials()??[]){let t=!1;this.scene.traverse(n=>{n instanceof Se&&(Array.isArray(n.material)?n.material:[n.material]).includes(e)&&(t=!0)}),t||(e.dispose(),this.materials=this.materials.filter(n=>n!==e))}$h(this.workshop,0,0,0);for(let e of Dh){let t=new Ce;t.name=e.id,this.flowGroups.set(e.id,t),this.scene.add(t)}this.host.dataset.assembly="m54-workshop-cutaway",this.host.dataset.assemblyParts=String(this.workshop.partNames.length),this.host.dataset.timingDrive="linked-primary-and-secondary",this.host.dataset.accessoryDrive="m54-dual-belt-r4"}async rebuildAssembly(e,t){this.ready=!1,this.clearFocusOverlays(),this.workshop?.manifoldHeat?.release(),this.disposeFlowView();let n=new Map(this.routes.map((a,l)=>[`${l}:${a.medium}:${a.cylinder??0}:${a.branch}`,a.phase]));for(let a of this.parts)a.piston.removeFromParent();let r=new Set([this.metal,this.rodMetal,this.dark,this.staticMaterial]),s=new Set;for(let a of r)for(let l of Object.values(a))l instanceof Gt&&s.add(l);this.environment&&s.add(this.environment);for(let a of[this.extras,this.housing,this.mechanical,this.combustion,...this.flowGroups.values()])Vr(a,r,s),a.clear();for(let a of this.flowGroups.values())a.removeFromParent();this.materials=[...r],this.routes=[],this.parts=[],this.flowGroups.clear(),this.flowBatches.clear(),this.routeMaterials.clear(),this.workshop=null,this.exhaustPlumes=null,this.glowTexture=null;let o=Qo(e);this.deck=o.deck,this.headOffset=o.headOffset,this.boreScale=o.boreScale,this.intakeSelection={...e.tuning},this.head.clear(),this.extras.add(this.head),this.camCurves=null,await this.buildAssembly(t),this.buildFlowView(e),this.applyComponentVisibility(),this.setAssemblyFocus(this.assemblyFocus);for(let[a,l]of this.routes.entries())l.phase=n.get(`${a}:${l.medium}:${l.cylinder??0}:${l.branch}`)??l.phase;await this.renderer.compileAsync(this.scene,this.camera),this.softwareGraphics&&await this.primeEngineBuffers(),this.ready=!this.disposed,this.ready&&(this.nativeGeometry=[e.engine.boreMm,e.engine.strokeMm,e.engine.rodMm].join(":"),this.intakeGeometry=kr(this.intakeSelection).intake,this.host.dataset.assemblyRevision=String(++this.assemblyRevision))}updateCamProfiles(e){if(this.camCurves!==e){this.camCurves=e;for(let t=0;t<this.parts.length;t++)for(let n=0;n<2;n++){let r=this.parts[t].cams[n],s=r.children.filter(h=>h.name==="lift-profile");new Set(s.map(h=>h.geometry)).forEach(h=>h.dispose()),s.forEach(h=>h.removeFromParent());let o=new je;for(let h=0;h<=144;h++){let d=h/144*Ht,f=dm(e,t+1,n,d),p=f*Math.cos(d),y=f*Math.sin(d);h===0?o.moveTo(p,y):o.lineTo(p,y)}let a=new at(o,{depth:12,bevelEnabled:!1,steps:1});a.applyMatrix4(new Ne().set(0,0,1,-6,1,0,0,0,0,1,0,0,0,0,0,1));let l=[-17,17].map(h=>a.clone().translate(h,0,0)),c=yt(l);l.forEach(h=>h.dispose()),a.dispose();let u=this.mesh(c,this.rodMetal,r);u.name="lift-profile"}}}buildFlowView(e){this.flowView=wg(e),this.scene.add(this.flowView.root),this.flowView.setSchematicOutletsVisible(!1),this.portSpray=new Se(this.flowView.spray.geometry,this.flowView.spray.material),this.portSpray.name="Saugrohreinspritzung im Motorschnitt",this.portSpray.renderOrder=4,this.scene.add(this.portSpray)}disposeFlowView(){this.portSpray?.removeFromParent(),this.portSpray=null,this.flowView?.dispose(),this.flowView=null,this.exhaustPlumes?.dispose(),this.exhaustPlumes=null}async refreshCamProfiles(e){this.ready=!1,await new Promise(t=>setTimeout(t,0)),!this.disposed&&(this.updateCamProfiles(e),this.studioDirty=!0,this.ready=!this.disposed)}route(e){let{medium:t,coords:n,radius:r,cylinder:s,branch:o="main",internal:a=!1}=e,l=this.routes.length,c=e.flowFactor??1,u=Dh.find(x=>x.id===t).color,h=this.flowGroups.get(t),d=new Ot(n.map(x=>new I(...x)),!1,"centripetal"),f=this.routeMaterials.get(`${t}-pipe`);if(!f){let x={air:4282464,fuel:11179111,exhaust:10923953,water:2506053,oil:10718804};f=new _t({color:x[t],metalness:t==="exhaust"?.42:.18,roughness:t==="air"||t==="water"?.65:.4,transparent:!0,opacity:t==="air"?.64:t==="exhaust"?.52:.78,depthWrite:!1,side:Mt,forceSinglePass:!0}),this.routeMaterials.set(`${t}-pipe`,f),this.materials.push(f)}let p=new nn(d,64,r,12,!1),y=this.mesh(p,f,h);y.visible=!a;let m=this.routeMaterials.get(`${t}-volume`);m||(m=pg(t,u),this.routeMaterials.set(`${t}-volume`,m),this.materials.push(m));let g=d.getLength(),_=this.mesh(aa(new nn(d,64,Math.max(1,r*.82),10,!1),l,g),m,h),M=Math.max(6,Math.min(35,Math.round(d.getLength()/24))),v=new tt(new Float32Array(M*3),3);v.setUsage(tn);let T=new it;T.setAttribute("position",v),T.boundingSphere=new kt(new I,1500);let b=this.routeMaterials.get(`${t}-points`);b||(b=new $i({color:u,map:this.glowMap(),size:t==="air"?12:t==="exhaust"?11:t==="fuel"?6:8,transparent:!0,opacity:.8,depthWrite:!1,sizeAttenuation:!0,blending:or}),this.routeMaterials.set(`${t}-points`,b),this.materials.push(b));let w=new Jn(T,b);h.add(w),this.routes.push({medium:t,cylinder:s,contributors:e.contributors,branch:o,internal:a,flowFactor:c,flowIndex:l,length:g,pipe:y,volume:_,points:w,buffer:v,table:d.getSpacedPoints(200),phase:0,rate:0})}batchFlowGeometry(){for(let[e,t]of this.flowGroups){let n=this.routes.filter(y=>y.medium===e),r=n.filter(y=>!y.internal).map(y=>y.pipe.geometry),s=n.map(y=>y.volume.geometry),o=r.length?yt(r):null,a=o?this.mesh(o,n.find(y=>!y.internal).pipe.material,t):null,l=this.mesh(yt(s),n[0].volume.material,t),c=n.reduce((y,m)=>y+m.buffer.count,0),u=new Float32Array(c*3);u.fill(1e6);let h=new tt(u,3);h.setUsage(tn);let d=new it;d.setAttribute("position",h),d.boundingSphere=new kt(new I(120,100,0),1600);let f=new Jn(d,n[0].points.material);t.add(f);let p=0;for(let y of n){let m=y.buffer.count*3;y.buffer=new tt(u.subarray(p,p+m),3),p+=m,y.pipe.removeFromParent(),y.volume.removeFromParent(),y.points.removeFromParent(),y.pipe.geometry.dispose(),y.volume.geometry.dispose(),y.points.geometry.dispose()}this.flowBatches.set(e,{pipe:a,volume:l,points:f,buffer:h})}}buildPlumes(){let e=this.routes.filter(r=>r.medium==="exhaust"&&r.branch.startsWith("tail-"));if(e.length!==2)return;let t=e.map(r=>r.table[200].clone()),n=e.map(r=>r.table[200].clone().sub(r.table[198]).normalize());this.exhaustPlumes=Kg(t,n),this.scene.add(this.exhaustPlumes.root),this.exhaustPlumes.setIllustrativeLimiter(this.limiterFlames),this.lastLimiterBirth=[-10,-10]}triggerExhaustFlame(){let e=this.exhaustPlumes?.triggerIllustrativeFlame("both")??!1;return e&&(this.studioDirty=!0),e}setPresentation(e){if(!["closed","cutaway","flow"].includes(e))throw new Error("Unbekannte Motoransicht.");this.presentation=e,this.applyComponentVisibility(),this.renderer.domElement.setAttribute("aria-label",e==="closed"?"Drehbare geschlossene 3D-Motorbaugruppe":e==="flow"?"Freigestellter Gaswechsel mit Ansaugluft, illustrativem Leerlaufzweig und DISA, schematischer Benzineinspritzung, Verbrennung und Abgas":"Drehbarer 3D-Motorschnitt mit Mechanik und nativen Str\xF6mungen"),this.host.dataset.presentation=e}setLimiterFlames(e){this.limiterFlames=e,this.exhaustPlumes?.setIllustrativeLimiter(e)}setAssemblyFocus(e){if(!["block","head","intake","exhaust","complete"].includes(e))throw new Error("Unbekannte Baugruppe.");if(this.clearFocusOverlays(),this.assemblyFocus=e,e!=="complete"){let t=new Set;for(let n of VM[e])this.scene.getObjectByName(n)?.traverse(r=>{r instanceof Se&&!(r instanceof Zt)&&t.add(r)});for(let n of t){let r=new Se(n.geometry,this.focusMaterial);r.name="R13 Baugruppenmarkierung",r.renderOrder=n.renderOrder+1,n.add(r),this.focusOverlays.push(r)}}this.host.dataset.assemblyFocus=e,this.host.dataset.assemblyFocusMeshes=String(this.focusOverlays.length),this.studioDirty=!0}clearFocusOverlays(){for(let e of this.focusOverlays)e.removeFromParent();this.focusOverlays=[]}setMode(e,t){this.mode[e]=t,this.updateVisibility()}setExtras(e){this.extrasEnabled=e,this.applyComponentVisibility()}setHousing(e){this.housingEnabled=e,this.applyComponentVisibility()}applyComponentVisibility(){let e=this.component==="engine",t=Mc(this.presentation);if(this.softwareGraphics){let o=Math.min(devicePixelRatio||1,e?.4:.55);o!==this.pixelRatio&&(this.pixelRatio=o,this.renderer.setPixelRatio(o),this.renderer.setSize(this.width,this.height,!1))}this.mechanical.visible=e&&t.mechanical,this.extras.visible=e&&this.extrasEnabled&&t.extras,this.housing.visible=e&&this.housingEnabled&&t.housing,this.engineFloor.visible=e&&t.floor,this.combustion.visible=e&&t.combustion,this.head.visible=t.mechanical;let n=this.workshop?.closedHousing;for(let o of this.housing.children)o.visible=o===n?t.closedHousing:t.cutHousing;this.workshop?.timingDrive.root.traverse(o=>{o.userData.cutawayOnly&&(o.visible=e&&t.cutHousing)}),this.updateDriveInspection();for(let o of this.flowGroups.values())o.visible=e;let r=e&&this.presentation==="flow";this.stand.visible=e&&!r,this.flowView?.setVisible(r);let s=this.scene.getObjectByName("workshop-test-cell");if(s&&(s.visible=!r),this.portSpray&&(this.portSpray.visible=e&&this.presentation==="cutaway"&&this.mode.fuel!=="off"),r){this.mechanical.visible=!1,this.extras.visible=!1,this.housing.visible=!1,this.combustion.visible=!1,this.engineFloor.visible=!1;for(let o of this.flowGroups.values())o.visible=!1}this.renderer.setClearColor(r?Sg:1516847),this.studio.visible=!e,this.keyLight.castShadow=!e,this.scene.environment=e?null:this.environment,this.studioDirty=!0,e||(this.renderer.shadowMap.needsUpdate=!0),this.controls.minDistance=e?400:70,this.camera.near=e?2:.5,this.camera.updateProjectionMatrix(),this.host.dataset.component=this.component,this.host.dataset.presentation=this.presentation,this.updateVisibility()}setComponent(e){if(this.component===e){this.applyComponentVisibility();return}this.component=e,this.applyComponentVisibility(),this.view("overview"),this.renderer.domElement.setAttribute("aria-label",e==="piston"?"Drehbare Kolbenbaugruppe mit Ringpaket und Bolzen":"Drehbarer 3D-Reihensechser mit Kolben, Pleueln und Kurbelwelle")}setExploded(e){this.exploded=Number.isFinite(e)?We.clamp(e,0,1):0,this.studioDirty=!0,this.studioPiston&&Lg(this.studioPiston,this.exploded),this.component==="piston"&&(this.renderer.shadowMap.needsUpdate=!0),this.host.dataset.exploded=String(this.exploded),this.component==="piston"&&this.view(this.cameraPreset)}updateVisibility(){let e=Mc(this.presentation);this.exhaustPlumes?.setVisible(this.component==="engine"&&this.presentation!=="cutaway"&&this.mode.exhaust!=="off"),this.workshop&&jm(this.workshop.coolingPlumbing,this.presentation,this.mode.water),this.portSpray&&(this.portSpray.visible=this.component==="engine"&&this.presentation==="cutaway"&&this.mode.fuel!=="off");for(let t of this.routes){let n=$o(this.mode[t.medium]);t.pipe.visible=n.pipe&&!t.internal&&e.pipes,t.volume.visible=n.flow&&e.media&&Math.abs(t.rate)>1e-6,t.points.visible=t.volume.visible}for(let[t,n]of this.flowBatches){let r=$o(this.mode[t]);if(n.pipe&&(n.pipe.visible=r.pipe&&e.pipes),n.volume.visible=r.flow&&e.media&&t!=="fuel"&&this.routes.some(s=>s.medium===t&&Math.abs(s.rate)>1e-6),n.points.visible=n.volume.visible,n.pipe){let s=n.pipe.material,o=this.presentation==="closed";s.transparent=!o,s.opacity=o?1:t==="air"?.44:t==="exhaust"?.4:.5,s.depthWrite=o,s.needsUpdate=!0}}Nd(this.presentation,this.cameraPreset,this.flowBatches,this.parts,this.mode.exhaust,this.extras,this.housing),this.host.dataset.pipeModes=JSON.stringify(this.mode)}cacheCameraEnvelope(){this.scene.updateMatrixWorld(!0),this.cameraPoints=[];for(let e of[this.extras,this.housing,this.mechanical,this.stand,...this.flowGroups.values()])e.traverse(t=>{if(!(t instanceof Se)||t instanceof Zt||!t.visible)return;let n=t.geometry.getAttribute("position"),r=Math.max(1,Math.floor(n.count/300));for(let s=0;s<n.count;s+=r)this.cameraPoints.push(new I(n.getX(s),n.getY(s),n.getZ(s)).applyMatrix4(t.matrixWorld))});if(this.exhaustPlumes)for(let e=0;e<this.exhaustPlumes.outlets.length;e++)this.cameraPoints.push(this.exhaustPlumes.outlets[e].clone().addScaledVector(this.exhaustPlumes.directions[e],Wr).add(new I(0,60,0)))}updateDriveInspection(){let e=this.component==="engine"&&this.cameraPreset==="front";this.inspectionLight.intensity=this.component==="engine"&&this.cameraPreset==="disa-inner"?42e3:0,this.host.dataset.disaInspection=this.inspectionLight.intensity?"illuminated":"off";let t=this.scene.getObjectByName("M54B30 DISA Stellglied");t&&(t.visible=!(this.component==="engine"&&this.cameraPreset==="disa-inner")),this.workshop&&(this.workshop.radiator.visible=!e),this.workshop?.radiator.traverse(r=>{if(r instanceof Se)for(let s of Array.isArray(r.material)?r.material:[r.material])s.transparent!==e&&(s.transparent=e,s.needsUpdate=!0),s.opacity=e?.1:1,s.depthWrite=!e}),this.host.dataset.radiatorInspection=e?"transparent":"solid";let n=this.host.parentElement?.querySelector(".three-stage-caption");n&&(n.textContent=(e?"K\xFChler zur Einsicht ausgeblendet \xB7 ":"")+(this.presentation==="cutaway"?"Kolben und Kurbeltrieb \xB7 ":this.presentation==="flow"?"Flussdarstellung schematisch \xB7 ":"")+"Ziehen: drehen \xB7 Rad / Pinch: zoomen"),this.renderer.shadowMap.needsUpdate=!0}resetCamera(){this.view(this.presentation==="cutaway"?"section":"overview")}view(e){if(this.component==="piston"&&this.studioPiston){let p={overview:[1,.65,1.15],crown:[.001,1,.001],underside:[.5,-1,.65],pin:[1,.05,.001],side:[.001,.08,1]};this.cameraPreset=p[e]?e:"overview",this.studioPiston.root.updateWorldMatrix(!0,!0);let y=new ln().setFromObject(this.studioPiston.root);y.getCenter(this.controls.target);let m=new I(...p[this.cameraPreset]).normalize(),g=new I().crossVectors(Kc,m).normalize(),_=new I().crossVectors(m,g).normalize(),M=Math.tan(We.degToRad(this.camera.fov/2)),v=0;for(let T of[y.min.x,y.max.x])for(let b of[y.min.y,y.max.y])for(let w of[y.min.z,y.max.z]){let x=new I(T,b,w).sub(this.controls.target),S=x.dot(m);v=Math.max(v,S+Math.abs(x.dot(g))/(M*this.camera.aspect),S+Math.abs(x.dot(_))/M)}this.camera.position.copy(this.controls.target).addScaledVector(m,v*1.18),this.controls.maxDistance=1e3,this.camera.far=2500,this.camera.updateProjectionMatrix(),this.controls.update(),this.host.dataset.cameraPreset=this.cameraPreset;return}let t=this.width<600;if(this.controls.minDistance=e==="outlet"?180:["liners","disa","disa-inner"].includes(e)?70:400,this.camera.near=2,["liners","disa","disa-inner"].includes(e)){this.cameraPreset=e,this.updateDriveInspection();let p=this.headOffset,y=e==="liners"?{position:[ze[2],175,235],target:[ze[2],155,16]}:e==="disa"?{position:[115,210+p,-495],target:[0,151+p,-320]}:{position:[0,235+p,-385],target:[0,151+p,-224]};this.controls.target.fromArray(y.target),this.camera.position.fromArray(y.position),this.camera.near=.5,this.camera.far=5500,this.controls.maxDistance=2500,this.camera.updateProjectionMatrix(),this.controls.update(),this.host.dataset.cameraPreset=e,this.studioDirty=!0;return}if(e==="outlet"){this.cameraPreset="outlet",this.updateDriveInspection();let p=cn(this.headOffset).tails;this.controls.target.set(p[0][0]+138,p[0][1]+36,(p[0][2]+p[1][2])/2),this.camera.position.copy(this.controls.target).addScaledVector(new I(1.05,.65,-1).normalize(),t?740:620),this.controls.maxDistance=2600,this.camera.far=5500,this.camera.updateProjectionMatrix(),this.controls.update(),this.host.dataset.cameraPreset="outlet",this.studioDirty=!0;return}if(e==="manifolds"){this.cameraPreset=e,this.updateDriveInspection(),this.controls.target.set(-110,208+this.headOffset,145),this.camera.position.set(130,300+this.headOffset,600),this.controls.minDistance=120,this.controls.maxDistance=1800,this.camera.far=5500,this.camera.updateProjectionMatrix(),this.controls.update(),this.host.dataset.cameraPreset=e,this.studioDirty=!0;return}let n={overview:t?[-1,.58,.27]:[.72,.48,1],section:[0,0,1],intake:[.28,.37,-1],exhaust:t?[-.75,.7,1]:[.18,.48,1],front:[-1,.3,.68],top:[.001,1,.001]};this.cameraPreset=n[e]?e:"overview",this.updateDriveInspection();let r=this.cameraPreset==="intake"||this.cameraPreset==="front";this.controls.target.set(this.cameraPreset==="front"?-355:r?-65:90,this.cameraPreset==="front"?115:105+this.headOffset/2,this.cameraPreset==="front"?-15:22),this.cameraPreset==="section"&&this.controls.target.set(0,113+this.headOffset/2,0);let s=new I(...n[this.cameraPreset]).normalize(),o=new I().crossVectors(Kc,s).normalize(),a=new I().crossVectors(s,o).normalize(),l=Math.tan(We.degToRad(this.camera.fov/2)),c=0,u=this.cameraPreset==="section",h=u?{min:[-355,-116,-85],max:[355,342+this.headOffset,85]}:cn(this.headOffset).bounds,d=[];if(u||!this.cameraPoints.length)for(let p of[h.min[0],h.max[0]])for(let y of[h.min[1],h.max[1]])for(let m of[h.min[2],h.max[2]])d.push(new I(p,y,m));let f=u?d:this.cameraPoints.length?[...this.cameraPoints]:d;for(let p of f){if(this.cameraPreset==="section"&&(p.x<-355||p.x>355||Math.abs(p.z)>90)||this.cameraPreset==="front"&&(p.x<-445||p.x>-275)||r&&p.x>365)continue;let y=p.clone().sub(this.controls.target),m=y.dot(s);c=Math.max(c,m+Math.abs(y.dot(o))/(l*this.camera.aspect),m+Math.abs(y.dot(a))/l)}c*=1.075,this.controls.maxDistance=Math.max(2600,c*1.6),this.camera.far=Math.max(4e3,c*3),this.camera.updateProjectionMatrix(),this.camera.position.copy(this.controls.target).addScaledVector(s,c),this.controls.update(),this.host.dataset.cameraPreset=this.cameraPreset}keydown=e=>{if(["ArrowLeft","ArrowRight","+","-","=","Home"].includes(e.key)){if(this.host.dataset.cameraKey=e.key,this.host.dataset.cameraKeyCount=String(Number(this.host.dataset.cameraKeyCount||0)+1),e.preventDefault(),e.stopPropagation(),e.key==="Home"){this.resetCamera();return}gi.copy(this.camera.position).sub(this.controls.target),e.key==="+"||e.key==="="?gi.multiplyScalar(.9):e.key==="-"?gi.multiplyScalar(1.1):gi.applyAxisAngle(Kc,(e.key==="ArrowLeft"?1:-1)*.1),gi.setLength(Math.max(this.controls.minDistance,Math.min(this.controls.maxDistance,gi.length()))),this.camera.position.copy(this.controls.target).add(gi),this.controls.update()}};resetExhaustHeat(e){this.exhaustHeat=kc(e),this.exhaustHeatInitialized=!0,this.lastExhaustHeatAt=null,this.studioDirty=!0}render(e,t,n,r,s=n,o=!1,a=1/0){if(this.disposed||this.contextLost||!this.ready)return;let l=performance.now(),c=this.softwareGraphics&&this.component==="engine"?66:32;if(l-this.lastRender<c)return;this.lastRender=l;let u=Number.isFinite(r)&&Number.isFinite(this.clock)?Math.max(0,r-this.clock):0,h=this.flowMotion.sample(e?.rpm??0,u,s-this.lastDriveAngle),d=Math.max(0,Math.min(this.softwareGraphics?.1:.05,r-this.clock));this.clock=r,this.lastAngle=n,this.lastDriveAngle=s;let f=[t.engine.boreMm,t.engine.strokeMm,t.engine.rodMm].join(":"),p=kr(t.tuning).intake;if(this.nativeGeometry!==f||this.intakeGeometry!==p){this.rebuildAssembly(t,e?.valveCurves).catch(()=>{this.contextLost=!0,this.host.dataset.webgl="lost"});return}if(this.intakeSelection={...t.tuning},this.workshop&&(this.workshop.intakeVariant=kr(this.intakeSelection)),this.host.dataset.geometry=f,this.softwareGraphics&&this.component==="engine"){let A=(e?.rpm??0)>5?.4:.85;this.pixelRatio!==A&&(this.pixelRatio=A,this.renderer.setPixelRatio(A),this.renderer.setSize(this.width,this.height,!1),this.studioDirty=!0)}if(e?.valveCurves&&this.camCurves!==e.valveCurves){this.refreshCamProfiles(e.valveCurves).catch(()=>{this.contextLost=!0,this.host.dataset.webgl="lost"});return}let y=this.height*this.pixelRatio/(2*Math.tan(We.degToRad(this.camera.fov/2)));for(let A=0;A<6;A++){let P=this.parts[A],D=Tc(n,A+1,t,e);Xs.fromArray(D.piston),Yc.fromArray(D.pin),P.piston.position.copy(Xs),P.piston.scale.x=P.piston.scale.z=t.engine.boreMm/84,P.rod.position.copy(Xs).add(Yc).multiplyScalar(.5),gi.copy(Xs).sub(Yc),P.rod.scale.y=gi.length(),P.rod.quaternion.setFromUnitVectors(Kc,gi.normalize()),P.smallEnd.position.copy(Xs),P.bigEnd.position.copy(Yc),P.throw.rotation.x=D.rotation,P.throw.scale.y=P.throw.scale.z=t.engine.strokeMm/84;let F=Fi(e,n,A+1),z=Nr(e,n,A+1);P.flame.userData.nativeCombustion=z;for(let W=0;W<2;W++){let J=W===0?F?.intakeLiftMm??0:F?.exhaustLiftMm??0;P.valves[W].position.y=-J;let oe=hm(J);for(let re of P.springs[W])re.position.y=oe.center,re.scale.y=oe.length/34;P.cams[W].rotation.x=n/2}let L=Xs.y+vn.compressionHeightMm,V=Math.max(1,this.deck-L);P.gas.position.set(ze[A],L+V/2,0),P.gas.scale.y=V;let k=P.gas.material;if(k.color.setHex(z.burning?16752945:z.exhaust>0?13729620:z.heat>.15?15764280:z.intake>0?2391039:10602989),P.gas.visible=this.combustion.visible&&this.extrasEnabled&&(this.mode.air!=="off"||this.mode.exhaust!=="off")&&z.available,k.opacity=z.burning?.17+z.pressure*.24:z.exhaust>0?.12+z.heat*.12:z.heat>.15?.1+z.heat*.13:z.intake>0?.12:.035,P.flame.visible=this.combustion.visible&&this.extrasEnabled&&z.burning,P.spark.visible=P.flame.visible&&z.progress<.16,P.spark.scale.setScalar(1+Math.max(0,.16-z.progress)*12),P.spark.position.y=this.deck-1,P.flame.visible){for(let J=0;J<P.flameBuffer.count;J++){let oe=mg(J,P.flameBuffer.count,z.progress,37.5*this.boreScale,V);P.flameBuffer.setXYZ(J,ze[A]+oe.x,Math.max(L+1,this.deck+oe.y),oe.z)}P.flameBuffer.needsUpdate=!0;let W=P.flame.material.uniforms;W.uProgress.value=z.progress,W.uHeat.value=z.heat,W.uPressure.value=z.pressure,W.uPointScale.value=y}}this.flywheel.rotation.x=n;let m=t.tuning?.flywheel==="light";for(let A of this.flywheel.children)A.name==="Schwungmasse"&&(A.scale.x=m?.66:1);this.host.dataset.flywheel=m?"light":"standard";let g=performance.now(),_=this.lastExhaustHeatAt===null?0:(g-this.lastExhaustHeatAt)/1e3;this.lastExhaustHeatAt=g;let M=t.cooling.ambientC+273.15;this.exhaustHeatInitialized||(this.exhaustHeat=kc(M),this.exhaustHeatInitialized=!0),rg(this.exhaustHeat,sg(e?.exhaustDiagnostics,e?.t,a,e?.ignition===!0,M),_);let v=[this.exhaustHeat.banks[0].temperatureK,this.exhaustHeat.banks[1].temperatureK];this.workshop?.manifoldHeat?.apply(v)&&(this.studioDirty=!0),this.frameSerial%15===0&&(this.host.dataset.exhaustHeat=JSON.stringify({temperatureC:v.map(A=>A-273.15),source:"native-collector-lumped-wall",progressAgeS:Number.isFinite(a)?a:null,bound:this.workshop?.manifoldHeat?.diagnostics()??null})),this.disaIllustration=sm(this.disaIllustration,e?.rpm,o),this.workshop?.setDisaIllustration(this.disaIllustration);let T=om(e,n,{fresh:o,enabled:this.mode.air!=="off",disa:this.disaIllustration});this.host.dataset.r12Disa=this.disaIllustration,this.host.dataset.r12IdleSource=T.source,this.workshop&&$h(this.workshop,s,e?.actualThrottle??e?.pedal??0,e?.rpm??0);let b=Mc(this.presentation);for(let A of this.routes){let P=A.medium==="air"?yc(A,T):null;A.rate=(P&&P.kind!=="not-r12"?P.intensity:A.medium==="air"?gc(A,e,t,n,Bs):Bs(A.medium,A.cylinder,A.branch,e,t,n))*A.flowFactor;let D=Math.abs(A.rate)>1e-6,F=$o(this.mode[A.medium]);A.points.visible=F.flow&&D&&b.media,A.volume.visible=F.flow&&D&&b.media;let z=this.flowBatches.get(A.medium).volume.material.uniforms,L=F.flow&&D&&b.media;if(z.uFlow.value[A.flowIndex].set(L?A.rate:0,A.phase),!L){for(let V=0;V<A.buffer.count;V++)A.buffer.setXYZ(V,1e6,1e6,1e6);continue}if(P?.stationary){A.phase=0,z.uFlow.value[A.flowIndex].y=0;for(let V=0;V<A.buffer.count;V++)A.buffer.setXYZ(V,1e6,1e6,1e6);A.buffer.needsUpdate=!0;continue}if(A.medium==="air"||A.medium==="exhaust")A.phase=Vc(A.phase,d,h,A.rate,A.length,L);else{let V=(A.medium==="water"?Math.min(150,Math.abs(A.rate)*3):A.medium==="oil"?45:150)/Math.max(20,A.length);A.phase=Wt(A.phase+d*V*Math.sign(A.rate),1)}z.uFlow.value[A.flowIndex].y=A.phase;for(let V=0;V<A.buffer.count;V++){let k=Wt(V/A.buffer.count+A.phase,1)*200,W=Math.floor(k),J=k-W,oe=A.table[W],re=A.table[Math.min(200,W+1)];A.buffer.setXYZ(V,oe.x+(re.x-oe.x)*J,oe.y+(re.y-oe.y)*J,oe.z+(re.z-oe.z)*J)}A.buffer.needsUpdate=!0}for(let[A,P]of this.flowBatches){let D=b.media&&$o(this.mode[A]).flow&&this.routes.some(F=>F.medium===A&&Math.abs(F.rate)>1e-6);P.points.visible=D&&A!=="fuel",P.volume.visible=D&&A!=="fuel",P.buffer.needsUpdate=!0}if(this.exhaustPlumes){let A=this.routes.filter(P=>P.medium==="exhaust"&&P.branch.startsWith("tail-"));if(this.exhaustPlumes.update({clock:r,rpm:e?.rpm??0,ignition:e?.ignition===!0,bankRates:[A[0]?.rate??0,A[1]?.rate??0],actualThrottle:e?.actualThrottle,cycles:e?.cycles,angle:n,nativeSimTime:e?.t,nativeExhaust:e?.exhaustDiagnostics,enabled:this.component==="engine"&&this.presentation!=="cutaway"&&this.mode.exhaust!=="off",schematicGas:this.presentation==="flow"}),this.exhaustPlumes.controller.flames.forEach((P,D)=>{P.w===3&&P.x>this.lastLimiterBirth[D]&&(this.lastLimiterBirth[D]=P.x,this.limiterFlameEvents++)}),this.frameSerial%15===0){let P=this.exhaustPlumes.diagnostics();this.host.dataset.exhaustSource=P.source,this.host.dataset.exhaustCollector=JSON.stringify(P.collector),this.host.dataset.limiterFlameEvents=String(this.limiterFlameEvents)}}this.component==="engine"&&this.presentation!=="closed"&&this.flowView?.update(e,t,n,r,s,this.mode,T),Nd(this.presentation,this.cameraPreset,this.flowBatches,this.parts,this.mode.exhaust,this.extras,this.housing),this.controls.update(),this.inspectionLight.position.copy(this.camera.position),this.inspectionLight.target.position.copy(this.controls.target);let w=this.component==="engine"&&b.media&&this.routes.some(A=>(A.medium==="air"||A.medium==="exhaust")&&this.mode[A.medium]!=="off"&&Math.abs(A.rate)>1e-6),x=this.presentation==="flow"&&!!this.flowView?.needsAnimation(),S=w||x||!!this.exhaustPlumes?.needsAnimation(),E=`${n}|${e?.ignition}|${e?.actualThrottle}|${m}|${S?r:0}`,R=this.studioDirty||this.component==="engine"&&E!==this.lastDrawSignature;if(R&&(this.studioDirty=!1,this.lastDrawSignature=E,this.renderer.render(this.scene,this.camera)),this.frameSerial++,R&&(this.renderCost+=performance.now()-l,this.renderSamples++),this.renderSamples>=8){let A=this.renderCost/this.renderSamples;this.host.dataset.renderMeanMs=A.toFixed(2),this.host.dataset.pixelRatio=String(this.pixelRatio),this.host.dataset.frameLimit=String(Math.round(1e3/c));let P=this.softwareGraphics?.4:.7,D=this.softwareGraphics?this.pixelRatio:A>45?Math.max(P,this.pixelRatio*.8):A<15?Math.min(devicePixelRatio||1,1.25,this.pixelRatio*1.1):this.pixelRatio;D!==this.pixelRatio&&(this.pixelRatio=D,this.renderer.setPixelRatio(D),this.renderer.setSize(this.width,this.height,!1),this.studioDirty=!0),this.renderSamples=0,this.renderCost=0}++this.frameCount%15===0&&(this.host.dataset.crankAngle=String(Wt(n,Ht*2)),this.host.dataset.camAngle=String(Wt(n/2,Ht)),this.host.dataset.drawCalls=String(this.renderer.info.render.calls),this.host.dataset.flowingRoutes=String(this.routes.filter(A=>A.points.visible).length),this.host.dataset.frameSerial=String(this.frameSerial),this.host.dataset.visiblePipes=String(this.routes.filter(A=>A.pipe.visible).length),this.host.dataset.visibleStreams=String(this.routes.filter(A=>A.volume.visible).length),this.host.dataset.visiblePistons=String(this.mechanical.visible?this.parts.filter(A=>A.piston.visible).length:0),this.host.dataset.visibleRods=String(this.mechanical.visible?this.parts.filter(A=>A.rod.visible).length:0),this.host.dataset.visibleCrankThrows=String(this.mechanical.visible?this.parts.filter(A=>A.throw.visible).length:0),this.host.dataset.valveCount="24")}diagnostics(){this.scene.updateMatrixWorld(!0);let e=(t,n=new I)=>t.localToWorld(n).toArray();return{frame:this.frameSerial,angle:this.lastAngle,occlusion:this.host.dataset.occlusion,component:this.component,presentation:this.presentation,asset:{id:this.pistonLibrary?.assetId,heroTriangles:this.pistonLibrary?.triangles,engineTriangles:this.pistonLibrary?.engineTriangles},inspection:this.studioPiston?{exploded:this.exploded,pieces:this.studioPiston.pieces.map(t=>({name:t.name,position:e(t.object)}))}:null,visibility:{mechanical:this.mechanical.visible,extras:this.extras.visible,housing:this.housing.visible,combustion:this.combustion.visible,closedHousing:this.workshop?.closedHousing.visible??!1,engineFloor:this.engineFloor.visible,studio:this.studio.visible,flowGroups:[...this.flowGroups.values()].map(t=>t.visible),dedicatedFlow:this.flowView?.root.visible??!1,portSpray:this.portSpray?.visible??!1},gasFlow:this.flowView?.diagnostics()??null,camera:{position:this.camera.position.toArray(),target:this.controls.target.toArray(),preset:this.cameraPreset},resources:{...this.renderer.info.memory},drawCalls:this.renderer.info.render.calls,assembly:{id:this.host.dataset.assembly,revision:this.assemblyRevision,intakeVariant:this.workshop?.intakeVariant??null,parts:this.workshop?.partNames??[],connectors:cn(this.headOffset),timing:this.workshop?{angle:this.lastDriveAngle,chains:this.workshop.chain.map(t=>{let n=new Ne;return t.links.getMatrixAt(0,n),{links:t.links.count,length:t.length,phase:Wt(this.lastDriveAngle*t.pitchRadius/t.length,1),firstMatrix:n.toArray()}}),sprockets:this.workshop.sprockets.map(t=>({name:t.part.name,position:e(t.part),rotation:t.part.rotation.x,ratio:t.ratio}))}:null,accessoryDrive:this.workshop?{planes:this.workshop.accessoryDrive.planes,wheels:this.workshop.accessoryDrive.wheels.map(t=>({id:t.id,position:e(t.part),radius:t.radius,ratio:t.ratio,rotation:t.part.rotation.x})),belts:this.workshop.accessoryDrive.belts.map(t=>({id:t.id,ribs:t.ribs,length:t.path.length,phase:Wt(this.lastDriveAngle*t.driverRadius/t.path.length,1)}))}:null,throttle:this.workshop?.throttle.rotation.y,fan:this.workshop?.fan.rotation.x,pump:this.workshop?.pulley.rotation.x,flywheel:this.host.dataset.flywheel,flywheelGeometry:this.flywheel.children.filter(t=>t.name==="Schwungmasse").map(t=>({scale:t.scale.x,axialMm:(t.geometry.boundingBox??(t.geometry.computeBoundingBox(),t.geometry.boundingBox)).getSize(new I).x*t.scale.x})),flowDraws:this.flowView?.root.visible?this.flowView.root.children.filter(t=>t.visible).length:[...this.flowBatches.values()].reduce((t,n)=>t+Number(!!n.pipe&&n.pipe.visible)+Number(n.volume.visible)+Number(n.points.visible),0),flowRepresentation:this.presentation==="flow"?"continuous-native-gas-volumes":"dense-native-stream-bands",exhaustPlumes:this.exhaustPlumes?{...this.exhaustPlumes.diagnostics(),visible:this.exhaustPlumes.root.visible&&this.exhaustPlumes.needsAnimation(),rates:this.exhaustPlumes.controller.flow.toArray()}:null},parts:this.parts.map(t=>({piston:e(t.piston),wristPin:e(t.wristPin),crown:e(t.crown),rodEnds:[e(t.rod,new I(0,.5,0)),e(t.rod,new I(0,-.5,0))],crankPin:e(t.throw.children[0]),combustion:{flame:t.flame.visible,spark:t.spark.visible,gas:t.gas.visible,opacity:t.gas.material.opacity,top:t.gas.position.y+t.gas.scale.y/2,native:t.flame.userData.nativeCombustion??null,firstFlamePoint:[t.flameBuffer.getX(0),t.flameBuffer.getY(0),t.flameBuffer.getZ(0)]},opaque:(()=>{let n=!0;return t.piston.traverse(r=>{if(r instanceof Se)for(let s of Array.isArray(r.material)?r.material:[r.material])s.transparent&&(n=!1)}),n})(),valves:t.valves.map(n=>({position:e(n),follower:e(n,new I(0,267,0))})),springs:t.springs.map(n=>n.map(r=>({bottom:e(r,new I(0,-17,0)),top:e(r,new I(0,17,0))})))})),routes:this.routes.map(t=>({medium:t.medium,branch:t.branch,flowFactor:t.flowFactor,phase:t.phase,rate:t.rate,pipe:t.pipe.visible,stream:t.volume.visible,particles:t.points.visible}))}}dispose(){if(this.disposed)return;this.disposed=!0,this.observer.disconnect(),this.controls.dispose(),this.renderer.domElement.removeEventListener("keydown",this.keydown),this.clearFocusOverlays(),this.focusMaterial.dispose(),this.workshop?.manifoldHeat?.release(),this.disposeFlowView(),this.scene.traverse(t=>{if(t instanceof Se)for(let n of Array.isArray(t.material)?t.material:[t.material])n instanceof _t&&n.envMap===this.environment&&(n.envMap=null)});let e=Vr(this.scene);this.environment?.dispose(),this.keyLight.shadow.map?.dispose(),this.inspectionLight.dispose(),this.renderer.dispose(),this.renderer.domElement.remove(),this.pistonLibrary=null,this.studioPiston=null,this.host.dataset.disposed=JSON.stringify(e),this.parts=[],this.routes=[],this.materials=[],this.flowGroups.clear(),this.flowBatches.clear(),this.routeMaterials.clear(),this.workshop=null,this.exhaustPlumes=null,this.glowTexture=null,this.cameraPoints=[],this.scene.clear()}};function jg(i,e){let t=document.querySelector("#gas-pedal"),n=document.querySelector("#demo-sound"),r=document.querySelector("#engine-load"),s=!1,o=850,a=0,l,c,u,h,d=!1,f=y=>{s=y,t.setAttribute("aria-pressed",String(y)),t.textContent=y?"Gas loslassen \u2193":"Gas geben \u2191"};t.addEventListener("pointerdown",y=>{y.button!==0||t.disabled||(t.setPointerCapture(y.pointerId),f(!0))});for(let y of["pointerup","pointercancel","lostpointercapture"])t.addEventListener(y,()=>f(!1));t.addEventListener("click",y=>{y.detail===0&&f(!s)});let p=()=>{f(!1),i.value="0"};return window.addEventListener("blur",p),document.addEventListener("visibilitychange",()=>{document.hidden&&(p(),l?.suspend())}),n.addEventListener("click",async()=>{try{if(!l){l=new AudioContext,c=l.createGain(),c.gain.value=0;let y=l.createBiquadFilter();y.type="lowpass",y.frequency.value=650,u=l.createOscillator(),u.type="sawtooth",h=l.createOscillator(),h.type="triangle",u.connect(y),h.connect(y),y.connect(c),c.connect(l.destination),u.start(),h.start()}await l.resume(),d=!d,n.textContent=d?"Demo-Sound aus":"Demo-Sound an",n.setAttribute("aria-pressed",String(d))}catch{n.textContent="Sound nicht verf\xFCgbar",n.disabled=!0}}),{reset:p,tick(y,m){m||f(!1);let g=m?s?1:Number(i.value)/100:0;a+=(g-a)*(1-Math.exp(-y*9));let _=m?850+a*5150:0;return o+=(_-o)*(1-Math.exp(-y*(_>o?2.6:1.7))),t.disabled=!m,e.value=`${Math.round(o).toLocaleString("de-DE")} / min`,r.style.setProperty("--load",String(a)),r.textContent=`${Math.round(a*100)} % Gas`,l&&c&&u&&h&&(c.gain.setTargetAtTime(d&&m&&!document.hidden?.018+a*.025:0,l.currentTime,.06),u.frequency.setTargetAtTime(Math.max(20,o/20),l.currentTime,.05),h.frequency.setTargetAtTime(Math.max(30,o/10),l.currentTime,.05)),{rpm:o,throttle:a}},dispose(){window.removeEventListener("blur",p),l?.close()}}}async function iE(){let i=document.querySelector("#engine-host"),e=document.querySelector(".demo"),t=document.querySelector("#engine-status"),n=document.querySelector("#run-engine"),r=document.querySelector("#run-label"),s=document.querySelector(".run-symbol"),o=document.querySelector("#engine-rpm"),a=document.querySelector("#rpm-value"),l=document.querySelector("#view-section"),c=document.querySelector("#view-piston"),u=document.querySelector("#reset-camera"),h=xc(),d={rpm:0,ignition:!1,pedal:0,actualThrottle:0,source:"nexara-qualitative-browser-demo"},f=await Zc.create(i,()=>({state:d,cfg:h}),{deferCompilation:!0});try{for(let V of["air","fuel","exhaust","water","oil"])f.setMode(V,"off");f.setPresentation("cutaway"),f.setLimiterFlames(!1),f.view("section"),f.renderer.domElement.setAttribute("aria-label","Interaktive Original-Motorbaugruppe mit sechs bewegten Kolben, Pleueln und Kurbelwelle. Pfeiltasten drehen, Plus und Minus zoomen, Pos1 setzt die Kamera zur\xFCck."),f.renderer.domElement.setAttribute("aria-describedby","speed-note"),await f.renderer.compileAsync(f.scene,f.camera)}catch(V){throw f.dispose(),V}let p=!0,y=1.1,m=performance.now(),g=0,_=0,M=!0,v=!1,T="engine",b=30,w=jg(o,a);function x(){e.dataset.running=String(p),n.setAttribute("aria-pressed",String(p)),r.textContent=p?"Motor anhalten":"Motor starten",s.textContent=p?"\u2161":"\u25B6",t.textContent=T==="piston"?"Kolben im Detail":p?"Mechanik in Bewegung":"Mechanik angehalten",l.setAttribute("aria-pressed",String(T==="engine")),c.setAttribute("aria-pressed",String(T==="piston")),o.disabled=T==="piston",n.disabled=T==="piston"}function S(){return!v&&M&&!document.hidden}function E(){!g&&S()&&(g=requestAnimationFrame(R))}function R(V){if(g=0,!S())return;let k=Math.min(.05,Math.max(0,(V-m)/1e3));m=V;let W=w.tick(k,p&&T==="engine");d.rpm=W.rpm,d.pedal=d.actualThrottle=W.throttle,d.ignition=p&&T==="engine",e.dataset.actualRpm=String(Math.round(d.rpm)),e.dataset.throttle=String(W.throttle),d.rpm&&(y+=k*d.rpm*Math.PI*2/60/b),f.render(d,h,y,V/1e3,y),e.dataset.angle=String(y),e.dataset.requestedRpm=o.value,(p&&T==="engine"||d.rpm>5||V<_)&&E()}function A(){_=performance.now()+200,E()}f.controls.addEventListener("change",A),n.addEventListener("click",()=>{p=!p,p||w.reset(),m=performance.now(),x(),A()}),o.addEventListener("input",A);function P(V){T=V,w.reset(),f.setComponent(V),V==="engine"?(f.setPresentation("cutaway"),f.view("section")):f.resetCamera(),f.renderer.domElement.setAttribute("aria-label",V==="engine"?"Interaktive Motorbaugruppe mit sechs bewegten Kolben, Pleueln und Kurbelwelle. Pfeiltasten drehen und Plus oder Minus zoomen.":"Drehbare Original-Kolbenbaugruppe mit Ringpaket und Bolzen. Pfeiltasten drehen und Plus oder Minus zoomen."),m=performance.now(),x(),A()}l.addEventListener("click",()=>P("engine")),c.addEventListener("click",()=>P("piston")),u.addEventListener("click",()=>{f.resetCamera(),A()}),i.addEventListener("pointerdown",A),i.addEventListener("wheel",A,{passive:!0}),i.addEventListener("keydown",A);let D=()=>{m=performance.now(),document.hidden?(cancelAnimationFrame(g),g=0):A()};document.addEventListener("visibilitychange",D);let F=new IntersectionObserver(V=>{M=V[0].isIntersecting,m=performance.now(),M?A():(cancelAnimationFrame(g),g=0)});F.observe(i);let z=new ResizeObserver(A);z.observe(i);function L(){v=!0,cancelAnimationFrame(g),F.disconnect(),z.disconnect(),document.removeEventListener("visibilitychange",D),f.dispose(),w.dispose()}window.addEventListener("pagehide",V=>{V.persisted||L()}),window.addEventListener("message",V=>{V.source!==window.parent||V.origin!==location.origin||V.data?.type==="nexara:engine:pause"&&(p=!1,x(),A())});for(let V of[n,o,l,c,u])V.disabled=!1;document.querySelector("#stage-hint").hidden=!1,window.engineDemo={snapshot:()=>({running:p,requestedRpm:Number(o.value),angle:y,slowdown:b,component:T,diagnostics:f.diagnostics()})},x(),A(),window.parent!==window&&window.parent.postMessage({type:"nexara:engine:loaded"},location.origin)}export{iE as startEngineDemo};
