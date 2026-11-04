import './cinematic.css'

const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const header = document.querySelector<HTMLElement>('.home-page .site-top')!
const hero = document.querySelector<HTMLElement>('#top')!
const closer = document.querySelector<HTMLElement>('#kontakt')!
const heroVideo = document.querySelector<HTMLVideoElement>('#hero-film')!
const closerVideo = document.querySelector<HTMLVideoElement>('#closer-film')!
const clamp = (value:number) => Math.min(1,Math.max(0,value))
let scheduled = false
let heroProgress = 0
let closerProgress = 0
const desired = new Map<HTMLVideoElement, number>()
const freePlay = new Set<HTMLVideoElement>()
const loaded = new Set<HTMLVideoElement>()
const playRevision = new Map<HTMLVideoElement,number>()
function invalidatePlay(video:HTMLVideoElement) {
  const revision=(playRevision.get(video)??0)+1
  playRevision.set(video,revision)
  return revision
}
function updateFilmButton(video:HTMLVideoElement,playing:boolean) {
  const button=document.querySelector<HTMLButtonElement>(`[data-play-film="${video.id}"]`)!
  button.textContent=playing?'Film pausieren':'Film abspielen'
  button.setAttribute('aria-pressed',String(playing))
  button.setAttribute('aria-label',`${video===heroVideo?'Porträtfilm':'Abschlussfilm'} ${playing?'pausieren':'abspielen'}`)
}

function loadVideo(video: HTMLVideoElement) {
  if (loaded.has(video)) return
  loaded.add(video)
  video.src = video.dataset.src!
  video.preload = 'auto'
  video.load()
}
function seek(video:HTMLVideoElement) {
  if (freePlay.has(video) || reduced.matches || video.readyState < 2 || video.seeking || !Number.isFinite(video.duration)) return
  const time = Math.min(video.duration-.08, (desired.get(video) ?? 0)*video.duration)
  if (Math.abs(video.currentTime-time) > .045) video.currentTime = Math.max(0,time)
}
for (const video of [heroVideo,closerVideo]) {
  updateFilmButton(video,false)
  desired.set(video,0)
  video.addEventListener('loadeddata',()=>seek(video))
  video.addEventListener('seeked',()=>seek(video))
  video.addEventListener('error',()=>{
    const status = document.querySelector<HTMLElement>(`[data-film-status="${video.id}"]`)
    if (status) status.textContent = 'Die Filmvorschau ist gerade nicht verfügbar.'
  })
  video.addEventListener('ended',()=>{
    invalidatePlay(video)
    freePlay.delete(video)
    updateFilmButton(video,false)
  })
}

function draw() {
  scheduled=false
  const height=innerHeight
  const heroRect=hero.getBoundingClientRect()
  const closerRect=closer.getBoundingClientRect()
  heroProgress=clamp(-heroRect.top/Math.max(1,hero.offsetHeight-height))
  closerProgress=clamp(-closerRect.top/Math.max(1,closer.offsetHeight-height))
  const transition=reduced.matches?0:clamp((heroProgress-.2)/.68)
  hero.style.setProperty('--film-scale',String(1-transition*.4))
  hero.style.setProperty('--film-radius',`${transition*26}px`)
  hero.style.setProperty('--identity-opacity',String(1-clamp(transition*1.8)))
  hero.style.setProperty('--back-name-opacity',String(clamp(transition*1.7)))
  hero.style.setProperty('--name-shift',`${transition*60}px`)
  hero.classList.toggle('is-reframed',transition>.48)
  const overCloser=closerRect.top<=0 && closerRect.bottom>100
  const frameTop=height*transition*.4*.48
  header.classList.toggle('home-header--light', !overCloser && (frameTop>12 || heroRect.bottom < height*.7))
  desired.set(heroVideo,clamp(heroProgress/.9))
  desired.set(closerVideo,clamp(closerProgress/.92))
  seek(heroVideo)
  seek(closerVideo)
}
function schedule() { if(!scheduled){scheduled=true;requestAnimationFrame(draw)} }
addEventListener('scroll',schedule,{passive:true})
addEventListener('resize',schedule)
reduced.addEventListener('change',()=>{
  for(const video of freePlay){invalidatePlay(video);video.pause()}
  freePlay.clear()
  for(const video of [heroVideo,closerVideo])updateFilmButton(video,false)
  if(!reduced.matches)for(const section of [hero,closer]){
    const rect=section.getBoundingClientRect()
    if(rect.bottom>0 && rect.top<innerHeight)loadVideo(section.querySelector<HTMLVideoElement>('video')!)
  }
  schedule()
})
const filmObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
    const video=entry.target.querySelector<HTMLVideoElement>('video')!
    if(entry.isIntersecting && !reduced.matches) loadVideo(video)
    if(!entry.isIntersecting && freePlay.has(video)) {
      invalidatePlay(video)
      video.pause()
      freePlay.delete(video)
      updateFilmButton(video,false)
    }
  }
},{rootMargin:'100px 0px',threshold:0})
filmObserver.observe(hero)
filmObserver.observe(closer)
document.querySelectorAll<HTMLButtonElement>('[data-play-film]').forEach(button=>button.addEventListener('click',async()=>{
  const video=document.getElementById(button.dataset.playFilm!) as HTMLVideoElement
  const revision=invalidatePlay(video)
  if(freePlay.has(video)){
    video.pause()
    freePlay.delete(video)
    updateFilmButton(video,false)
    return
  }
  loadVideo(video)
  freePlay.add(video)
  updateFilmButton(video,true)
  try{
    if(video.ended || video.currentTime>video.duration-.12) video.currentTime=0
    await video.play()
    if(playRevision.get(video)!==revision)return
    updateFilmButton(video,true)
  }catch{
    if(playRevision.get(video)!==revision)return
    freePlay.delete(video)
    updateFilmButton(video,false)
  }
}))
draw()

const demoSlot=document.querySelector<HTMLElement>('#engine-demo-slot')!
const demoPreview=document.querySelector<HTMLElement>('#engine-demo-preview')!
const demoStart=document.querySelector<HTMLButtonElement>('#start-engine-demo')!
const demoClose=document.querySelector<HTMLButtonElement>('#close-engine-demo')!
const demoStatus=document.querySelector<HTMLElement>('#engine-demo-status')!
demoStart.addEventListener('click',()=>{
  if(demoSlot.querySelector('iframe'))return
  const frame=document.createElement('iframe')
  frame.src='/demos/engine/index.html'
  frame.title='Engine Playground: interaktive Mechanikdemo mit Drehzahlregler und Kamerasteuerung'
  frame.setAttribute('allow','fullscreen')
  frame.setAttribute('sandbox','allow-scripts allow-same-origin')
  demoPreview.hidden=true
  demoSlot.append(frame)
  demoClose.hidden=false
  demoStatus.textContent='Demo lädt …'
  frame.focus({preventScroll:true})
})
addEventListener('message',event=>{
  const frame=demoSlot.querySelector('iframe')
  if(event.origin!==location.origin || !frame || event.source!==frame.contentWindow || !event.data || typeof event.data!=='object')return
  if(event.data.type==='nexara:engine:ready') {
    frame.contentWindow?.postMessage({type:'nexara:engine:activate'},location.origin)
    demoStatus.textContent='Originalmodell wird geladen …'
  }else if(event.data.type==='nexara:engine:loaded'){
    demoStatus.textContent='Bereit. Probiere Drehzahl, Start/Stop und Kamera aus.'
  }else if(event.data.type==='nexara:engine:error'){
    demoStatus.textContent='Die 3D-Ansicht konnte nicht starten. Du kannst die Demo schließen und erneut öffnen.'
  }
})
new IntersectionObserver(entries=>{
  if(!entries[0].isIntersecting)demoSlot.querySelector('iframe')?.contentWindow?.postMessage({type:'nexara:engine:pause'},location.origin)
}).observe(demoSlot)
demoClose.addEventListener('click',()=>{
  demoSlot.querySelector('iframe')?.remove()
  demoPreview.hidden=false
  demoClose.hidden=true
  demoStatus.textContent='Die Demo startet erst auf deinen Klick.'
  demoStart.focus({preventScroll:true})
})
