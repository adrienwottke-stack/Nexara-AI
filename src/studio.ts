import './commerce'
import './studio.css'
import './cinematic'
import './assistant-widget'
import { studioProjects, type StudioProject } from './studio-projects'

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!))
const lightbox = document.querySelector<HTMLDialogElement>('#project-lightbox')!
const lightboxImage = document.querySelector<HTMLImageElement>('#lightbox-image')!
const lightboxTitle = document.querySelector<HTMLElement>('#lightbox-title')!
const lightboxNote = document.querySelector<HTMLElement>('#lightbox-note')!
let lightboxProject = studioProjects[0]
let lightboxIndex = 0
let lightboxTrigger: HTMLElement | null = null
function showLightboxShot() {
  const shot = lightboxProject.shots[lightboxIndex]
  lightboxImage.src = shot.src
  lightboxImage.alt = `${lightboxProject.name}: ${shot.title}`
  lightboxTitle.textContent = `${lightboxProject.name} · ${shot.title}`
  lightboxNote.textContent = `${lightboxIndex + 1} / ${lightboxProject.shots.length} · ${shot.note}`
  lightbox.querySelectorAll<HTMLButtonElement>('[data-lightbox-direction]').forEach(button => { button.disabled = lightboxProject.shots.length < 2 })
  lightbox.querySelector<HTMLElement>('.lightbox-content')!.scrollTop = 0
}
function openLightbox(project: StudioProject, index: number, trigger: HTMLElement) {
  lightboxProject = project
  lightboxIndex = index
  lightboxTrigger = trigger
  showLightboxShot()
  lightbox.showModal()
}
lightbox.querySelector('[data-close]')!.addEventListener('click', () => lightbox.close())
lightbox.addEventListener('close', () => lightboxTrigger?.focus({preventScroll:true}))
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close() })
lightbox.querySelectorAll<HTMLButtonElement>('[data-lightbox-direction]').forEach(button => button.addEventListener('click', () => {
  lightboxIndex = (lightboxIndex + Number(button.dataset.lightboxDirection) + lightboxProject.shots.length) % lightboxProject.shots.length
  showLightboxShot()
}))
lightbox.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  lightboxIndex = (lightboxIndex + (event.key === 'ArrowRight' ? 1 : -1) + lightboxProject.shots.length) % lightboxProject.shots.length
  showLightboxShot()
})

function mountGallery(host: HTMLElement, project: StudioProject, hero = false) {
  let current = 0
  host.innerHTML = `<div class="project-browser"><div class="browser-top"><span class="browser-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${escape(project.name)}</span><button type="button" class="gallery-expand" aria-label="${escape(project.name)} groß ansehen">Groß ansehen ↗</button></div><div class="gallery-screen"><img src="${project.shots[0].src}" alt="${escape(project.name + ': ' + project.shots[0].title)}" width="1280" height="800" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" /></div></div><div class="gallery-bottom"><div class="gallery-caption"><strong>${escape(project.shots[0].title)}</strong><span>${escape(project.shots[0].note)}</span></div><div class="gallery-arrows"><button type="button" data-direction="-1" aria-label="Vorherige Ansicht von ${escape(project.name)}">←</button><span class="gallery-count" aria-live="polite">1 / ${project.shots.length}</span><button type="button" data-direction="1" aria-label="Nächste Ansicht von ${escape(project.name)}">→</button></div></div><div class="gallery-thumbnails" role="group" aria-label="Ansichten von ${escape(project.name)}">${project.shots.map((shot, i) => `<button type="button" data-shot="${i}" aria-pressed="${i === 0}" aria-label="${escape(shot.title)}"><img src="${shot.src}" width="160" height="100" alt="" loading="lazy" /><span>${escape(shot.title)}</span></button>`).join('')}</div>`
  const img = host.querySelector<HTMLImageElement>('.gallery-screen img')!
  const screen = host.querySelector<HTMLElement>('.gallery-screen')!
  const redraw = () => {
    const shot = project.shots[current]
    img.src = shot.src
    img.alt = `${project.name}: ${shot.title}`
    screen.scrollTop = 0
    host.querySelector('.gallery-caption strong')!.textContent = shot.title
    host.querySelector('.gallery-caption span')!.textContent = shot.note
    host.querySelector('.gallery-count')!.textContent = `${current + 1} / ${project.shots.length}`
    host.querySelectorAll<HTMLButtonElement>('[data-shot]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.shot) === current)))
  }
  host.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => {
    button.disabled = project.shots.length < 2
    button.addEventListener('click', () => { current = (current + Number(button.dataset.direction) + project.shots.length) % project.shots.length; redraw() })
  })
  host.querySelectorAll<HTMLButtonElement>('[data-shot]').forEach(button => button.addEventListener('click', () => { current = Number(button.dataset.shot); redraw() }))
  let touchStart: {x:number;y:number;id:number} | undefined
  screen.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) { touchStart = undefined; return }
    const touch = event.touches[0]
    if (touch) touchStart = {x:touch.clientX,y:touch.clientY,id:touch.identifier}
  }, {passive:true})
  screen.addEventListener('touchmove', event => { if (event.touches.length !== 1) touchStart = undefined }, {passive:true})
  screen.addEventListener('touchcancel', () => { touchStart = undefined }, {passive:true})
  screen.addEventListener('touchend', event => {
    const start = touchStart
    touchStart = undefined
    if (event.touches.length || !start || project.shots.length < 2) return
    const touch = [...event.changedTouches].find(item => item.identifier === start.id)
    if (!touch) return
    const dx = touch.clientX-start.x
    const dy = touch.clientY-start.y
    if (Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.4) {
      current = (current+(dx<0?1:-1)+project.shots.length)%project.shots.length
      redraw()
    }
  }, {passive:true})
  host.querySelector<HTMLButtonElement>('.gallery-expand')!.addEventListener('click', event => openLightbox(project, current, event.currentTarget as HTMLElement))
}

const heroGallery = document.querySelector<HTMLElement>('#hero-project')
if(heroGallery) mountGallery(heroGallery, studioProjects[0], true)
document.querySelectorAll<HTMLButtonElement>('[data-hero-project]').forEach(button => button.addEventListener('click', () => {
  const project = studioProjects.find(item => item.id === button.dataset.heroProject)!
  document.querySelectorAll('[data-hero-project]').forEach(item => item.setAttribute('aria-pressed', String(item === button)))
  if(heroGallery) mountGallery(heroGallery, project, true)
  document.querySelector('#hero-project-type')!.textContent = project.label
}))

const grid = document.querySelector<HTMLElement>('#projects-grid')!
for (const project of studioProjects) {
  const card = document.createElement('article')
  card.className = 'project-case'
  card.id = `projekt-${project.id}`
  card.dataset.projectType = project.type
  card.innerHTML = `<div class="case-heading"><div><span>${escape(project.label)}</span><h3>${escape(project.name)}</h3></div><span class="case-number">${project.shots.length} ${project.shots.length === 1 ? 'Ansicht' : 'Ansichten'}</span></div><div class="case-gallery"></div><div class="case-copy"><p>${escape(project.description)}</p>${project.id === 'engine' ? '<a class="case-demo-link" href="#motor-demo">Direkt ausprobieren ↗</a>' : ''}<details><summary>Mehr zum Projekt</summary><p>${escape(project.detail)}</p></details></div>`
  mountGallery(card.querySelector<HTMLElement>('.case-gallery')!, project)
  grid.append(card)
}
document.querySelectorAll<HTMLButtonElement>('[data-project-filter]').forEach(button => button.addEventListener('click', () => {
  let count = 0
  document.querySelectorAll<HTMLElement>('[data-project-type]').forEach(card => {
    card.hidden = button.dataset.projectFilter !== 'all' && card.dataset.projectType !== button.dataset.projectFilter
    if (!card.hidden) count++
  })
  document.querySelectorAll('[data-project-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)))
  document.querySelector('#project-filter-status')!.textContent = `${count} ${count === 1 ? 'Projekt' : 'Projekte'} · mehrere Ansichten zum Durchblättern`
}))

// Galleries are inserted at startup. Restore deep links after their final layout
// and font metrics are known, rather than leaving the visitor above the target.
const initialHash=location.hash
let userNavigated=false
let initialAnchorRestored=false
addEventListener('wheel',()=>{userNavigated=true},{once:true,passive:true})
addEventListener('touchstart',()=>{userNavigated=true},{once:true,passive:true})
addEventListener('pointerdown',()=>{userNavigated=true},{once:true,passive:true})
addEventListener('keydown',()=>{userNavigated=true},{once:true})
function restoreInitialAnchor(){
  if(!initialHash || initialAnchorRestored || userNavigated || location.hash!==initialHash)return
  let id=''
  try{id=decodeURIComponent(initialHash.slice(1))}catch{return}
  requestAnimationFrame(()=>{
    if(!initialAnchorRestored && !userNavigated && location.hash===initialHash){
      const target=document.getElementById(id)
      if(target){target.scrollIntoView({block:'start',behavior:'instant'});initialAnchorRestored=true}
    }
  })
}
void document.fonts.ready.then(restoreInitialAnchor)
addEventListener('load',restoreInitialAnchor,{once:true})

