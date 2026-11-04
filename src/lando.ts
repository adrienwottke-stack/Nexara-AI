import '@fontsource-variable/mona-sans/standard.css'
import '@fontsource-variable/bodoni-moda'
import '@fontsource-variable/space-grotesk'
import './lando.css'
import './home-business.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!
const hero = $('#hero')
const journey = $('#mein-weg')
const header = $('#site-header')
const video = $<HTMLVideoElement>('#orbit-video')
const portrait = $<HTMLImageElement>('#hero-portrait')
const navigation = $<HTMLDetailsElement>('#navigation')
const summary = navigation.querySelector('summary')!
const switchButton = $<HTMLButtonElement>('#view-switch')
const switchLabel = $('#view-label')
$('#year').textContent = String(new Date().getFullYear())

if (import.meta.env.DEV && new URLSearchParams(location.search).get('portrait') === 'b') portrait.src = '/media/personal/hero-b.webp'
portrait.addEventListener('error', () => {
  if (portrait.dataset.fallback) return
  portrait.dataset.fallback = 'true'
  portrait.src = '/adrien.jpg'
})

let menuClosing = false
function closeMenu(focus = false) {
  if (!navigation.open || menuClosing) return
  const done = () => {
    navigation.open = false
    menuClosing = false
    lenis?.start()
    updateHeader()
    if (focus) summary.focus()
  }
  if (motionAllowed) {
    menuClosing = true
    gsap.to('#menu-panel', { yPercent: -104, opacity: 0, duration: 0.48, ease: 'power3.inOut', onComplete: done })
  } else done()
}
summary.addEventListener('click', event => {
  if (navigation.open) { event.preventDefault(); closeMenu(true) }
})
navigation.addEventListener('toggle', () => {
  summary.setAttribute('aria-expanded', String(navigation.open))
  updateHeader()
  if (!navigation.open) return
  lenis?.stop()
  if (motionAllowed) {
    gsap.killTweensOf('#menu-panel')
    gsap.fromTo('#menu-panel', { yPercent: -102, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 0.75, ease: 'power4.inOut' })
    gsap.fromTo('.menu-gallery figure', { y: 50, opacity: 0.15 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.85, ease: 'power3.out' })
    gsap.fromTo('.menu-links > a > span', { yPercent: 110, rotationX: -18 }, { yPercent: 0, rotationX: 0, stagger: 0.065, delay: 0.2, duration: 0.75, ease: 'power3.out' })
  }
  navigation.querySelector<HTMLElement>('.menu-links a')?.focus({ preventScroll: true })
})
summary.setAttribute('aria-expanded', 'false')
navigation.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()))
document.addEventListener('keydown', e => { if (e.key === 'Escape' && navigation.open) closeMenu(true) })
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || !navigation.open) return
  const links = [...header.querySelectorAll<HTMLElement>('a[href],summary,button')].filter(element => element.getClientRects().length)
  const first = links[0]
  const last = links[links.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
  if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
})
document.addEventListener('click', e => { if (navigation.open && e.target instanceof Node && !navigation.contains(e.target)) closeMenu() })

let activeSection: HTMLElement | null = hero
let heroProgress = 0
let heroIsDark = false
let lenis: Lenis | undefined
function updateHeader() {
  const dark = navigation.open || (activeSection === hero ? heroIsDark : activeSection?.dataset.header === 'dark')
  header.classList.toggle('site-header--dark', dark)
}
document.querySelectorAll<HTMLElement>('[data-header]').forEach(section => {
  ScrollTrigger.create({ trigger: section, start: 'top 88px', end: 'bottom 88px', onToggle: ({ isActive }) => {
    if (isActive) { activeSection = section; updateHeader() }
  } })
})

// Seek one short, optimized existing film. Decode only its current frame instead of caching hundreds of images.
let desiredTime = 0
let filmRequested = false
let motionAllowed = false
function seekFilm() {
  if (!motionAllowed || video.readyState < 2 || video.seeking || !Number.isFinite(video.duration)) return
  const time = Math.min(video.duration - 0.08, desiredTime)
  if (Math.abs(video.currentTime - time) > 0.04) video.currentTime = Math.max(0, time)
}
video.addEventListener('loadeddata', seekFilm)
video.addEventListener('seeked', seekFilm)
video.addEventListener('loadedmetadata', () => {
  desiredTime = Math.min(1, Math.max(0, (heroProgress - 0.15) / 0.72)) * video.duration
  seekFilm()
})
function requestFilm() {
  if (filmRequested) return
  filmRequested = true
  video.src = '/media/personal-r2/orbit.mp4'
  video.load()
}

const media = gsap.matchMedia()
media.add('(prefers-reduced-motion: no-preference)', () => {
  motionAllowed = true
  document.documentElement.classList.add('has-motion')
  journey.classList.add('journey--animated')
  const activeLenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false })
  lenis = activeLenis
  activeLenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => activeLenis.raf(time * 1000)
  gsap.ticker.add(tick)

  const state = { progress: 0 }
  const portraitScale = gsap.quickSetter('.hero__portrait-wrap', 'scale')
  const filmOpacity = gsap.quickSetter('.hero__film', 'opacity')
  const shadeOpacity = gsap.quickSetter('.hero__film-shade', 'opacity')
  const nameOpacity = gsap.quickSetter('.hero__name', 'opacity')
  const nameY = gsap.quickSetter('.hero__name', 'y', 'px')
  const cardOpacity = gsap.quickSetter('.hero__intro-card', 'opacity')
  const clamp = gsap.utils.clamp(0, 1)
  const drawHero = () => {
    heroProgress = state.progress
    const mix = clamp((heroProgress - 0.15) / 0.29)
    portraitScale(1 + heroProgress * 0.09)
    filmOpacity(mix)
    shadeOpacity(clamp((heroProgress - 0.48) / 0.3) * 0.38)
    nameOpacity(clamp((heroProgress - 0.53) / 0.2))
    nameY((1 - clamp((heroProgress - 0.53) / 0.22)) * 60)
    cardOpacity(1 - clamp(heroProgress / 0.23))
    const nextDark = mix > 0.55
    if (heroIsDark !== nextDark) {
      heroIsDark = nextDark
      hero.classList.toggle('hero--dark', nextDark)
      updateHeader()
      switchLabel.textContent = nextDark ? 'Zum Porträt' : 'Orbit ansehen'
    }
    if (heroProgress > 0.07) requestFilm()
    desiredTime = Number.isFinite(video.duration) ? clamp((heroProgress - 0.15) / 0.72) * video.duration : 0
    seekFilm()
  }
  const heroTween = gsap.to(state, { progress: 1, ease: 'none', onUpdate: drawHero, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.7, pin: '.hero__stage', pinSpacing: false, anticipatePin: 1 } })
  drawHero()

  const portraitX = gsap.quickTo('.hero__portrait-wrap', 'x', { duration: 0.9, ease: 'power3.out' })
  gsap.set('.hero__portrait-wrap', { transformPerspective: 1200 })
  const portraitY = gsap.quickTo('.hero__portrait-wrap', 'y', { duration: 0.9, ease: 'power3.out' })
  const portraitRX = gsap.quickTo('.hero__portrait-wrap', 'rotationX', { duration: 0.9, ease: 'power3.out' })
  const portraitRY = gsap.quickTo('.hero__portrait-wrap', 'rotationY', { duration: 0.9, ease: 'power3.out' })
  const pointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    const rect = hero.getBoundingClientRect()
    const x = event.clientX / innerWidth - 0.5
    const y = event.clientY / innerHeight - 0.5
    if (rect.bottom < 0 || rect.top > innerHeight) return
    portraitX(x * 20); portraitY(y * 12); portraitRX(-y * 4); portraitRY(x * 7)
    if (heroIsDark && video.readyState >= 2) {
      desiredTime = clamp((heroProgress - 0.15) / 0.72 + x * 0.24) * video.duration
      seekFilm()
    }
  }
  const pointerLeave = () => { portraitX(0); portraitY(0); portraitRX(0); portraitRY(0) }
  hero.addEventListener('pointermove', pointerMove, { passive: true })
  hero.addEventListener('pointerleave', pointerLeave)

  const wipes = gsap.timeline({ scrollTrigger: { trigger: '.manifesto__text', start: 'top 88%', toggleActions: 'play none none reset' } })
  document.querySelectorAll('.manifesto__text .wipe').forEach((cover, index) => {
    wipes.fromTo(cover, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 0.34, ease: 'power2.inOut' }, index * 0.11)
      .set(cover, { transformOrigin: 'right' }, index * 0.11 + 0.34)
      .to(cover, { scaleX: 0, duration: 0.55, ease: 'power3.out' }, index * 0.11 + 0.35)
  })

  // A single surface fades behind the continuous photo field; no full-screen blending or blur layers.
  const wash = gsap.to('.journey__wash', { opacity: 1, ease: 'none', scrollTrigger: {
    trigger: '.photo--work', start: 'top 70%', end: 'center 25%', scrub: 0.7,
    onUpdate: self => {
      const light = self.progress > 0.45
      if (journey.classList.contains('journey--light') !== light) {
        journey.classList.toggle('journey--light', light)
        journey.dataset.header = light ? 'light' : 'dark'
        updateHeader()
      }
    },
  } })
  document.querySelectorAll<HTMLElement>('[data-drift]').forEach(element => {
    const distance = Number(element.dataset.drift)
    gsap.fromTo(element, { y: -distance / 2 }, { y: distance / 2, ease: 'none', scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 0.85 } })
  })
  document.querySelectorAll<HTMLElement>('.photo__image').forEach(element => {
    gsap.fromTo(element, { scale: 0.965 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: element, start: 'top 95%', end: 'top 35%', scrub: 0.7 } })
  })
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => {
    gsap.from(element, { y: 30, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } })
  })
  return () => {
    motionAllowed = false
    activeLenis.destroy()
    gsap.ticker.remove(tick)
    heroTween.kill()
    wash.kill()
    wipes.kill()
    hero.removeEventListener('pointermove', pointerMove)
    hero.removeEventListener('pointerleave', pointerLeave)
    document.documentElement.classList.remove('has-motion')
    journey.classList.remove('journey--animated', 'journey--light')
    journey.dataset.header = 'dark'
    hero.classList.remove('hero--dark')
    heroIsDark = false
    video.pause()
    if (lenis === activeLenis) lenis = undefined
    updateHeader()
  }
})

switchButton.addEventListener('click', () => {
  const destination = hero.offsetTop + (hero.offsetHeight - innerHeight) * (heroProgress > 0.4 ? 0 : 0.58)
  if (lenis) lenis.scrollTo(destination, { duration: 1.2 })
})
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented || !lenis) return
  const hash = link.getAttribute('href')!
  const target = document.getElementById(hash.slice(1))
  if (!target) return
  event.preventDefault()
  lenis.start()
  history.pushState(null, '', hash)
  lenis.scrollTo(target, { duration: 1.1, onComplete: () => {
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1')
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
    }
    target.focus({ preventScroll: true })
  } })
}))
document.fonts.ready.then(() => ScrollTrigger.refresh())
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
