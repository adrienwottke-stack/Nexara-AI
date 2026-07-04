import '@fontsource/anton'
import '@fontsource-variable/space-grotesk'
import './style.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { FrameSequence } from './scrub'
import { marqueeItems } from './data'

gsap.registerPlugin(ScrollTrigger)

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T
const $$ = <T extends HTMLElement = HTMLElement>(sel: string) => Array.from(document.querySelectorAll(sel)) as T[]

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
history.scrollRestoration = 'manual'
window.scrollTo(0, 0)
document.getElementById('year')!.textContent = String(new Date().getFullYear())

/* ============================================================
   DOM-Aufbau aus Daten
   ============================================================ */

function buildHeroLetters() {
  $$('.hero__line').forEach((line) => {
    const word = line.dataset.word ?? ''
    line.innerHTML = ''
    for (const ch of word) {
      const mask = document.createElement('span')
      mask.className = 'hero__letterMask'
      const letter = document.createElement('span')
      letter.className = 'hero__letter'
      letter.textContent = ch
      mask.appendChild(letter)
      line.appendChild(mask)
    }
  })
}

function buildMarquee() {
  const track = $('#marqueeTrack')
  const makeHalf = () => {
    const frag = document.createDocumentFragment()
    for (let r = 0; r < 2; r++) {
      marqueeItems.forEach((item, i) => {
        const el = document.createElement('span')
        el.className = 'marquee__item' + ((i + r) % 3 === 0 ? ' marquee__item--filled' : '')
        el.textContent = item
        frag.appendChild(el)
        const star = document.createElement('span')
        star.className = 'marquee__star'
        star.textContent = '✦'
        frag.appendChild(star)
      })
    }
    return frag
  }
  track.appendChild(makeHalf())
  track.appendChild(makeHalf())
}

function buildFinaleWords() {
  const h = $('#finaleHeadline')
  const words = (h.textContent ?? '').trim().split(/\s+/)
  h.innerHTML = ''
  const accented = new Set(['premium', 'anfühlt?'])
  words.forEach((w) => {
    const mask = document.createElement('span')
    mask.className = 'finale__word' + (accented.has(w.toLowerCase()) ? ' finale__word--accent' : '')
    const inner = document.createElement('span')
    inner.textContent = w
    mask.appendChild(inner)
    h.appendChild(mask)
  })
}

buildHeroLetters()
buildMarquee()
buildFinaleWords()

/* ============================================================
   Frame-Sequenzen + Videos
   ============================================================ */

const heroSeq = new FrameSequence($('#heroCanvas') as HTMLCanvasElement)
const finaleSeq = new FrameSequence($('#finaleCanvas') as HTMLCanvasElement)
const hudFrame = $('#hudFrame')
heroSeq.onFrame = (i, n) => {
  hudFrame.textContent = `${String(i + 1).padStart(3, '0')} / ${String(n).padStart(3, '0')}`
}

function attachVideo(el: HTMLVideoElement, src: string) {
  el.src = src
  el.addEventListener('error', () => el.remove(), { once: true })
}

/* ============================================================
   Reduced Motion - statische, aber vollständige Experience
   ============================================================ */

if (reducedMotion) {
  document.documentElement.classList.add('rm')
  $('#loader').remove()
  gsap.set('.nav', { autoAlpha: 1, y: 0 })
  gsap.set('.hero__letter, .hero__subMask, .finale__word span', { y: 0, yPercent: 0, rotate: 0, opacity: 1 })
  gsap.set('.hero__kicker, .finale__hook, .finale__ctas, .finale__direct', { autoAlpha: 1, y: 0 })
  gsap.set('.pillar__titleInner', { yPercent: 0 })
  $$('.stat__value').forEach((v) => {
    v.textContent = `${v.dataset.prefix}${v.dataset.value}${v.dataset.suffix}`
  })
  heroSeq.load('/frames/hero').then(() => {
    heroSeq.setProgress(0.35)
    heroSeq.tick()
  })
  finaleSeq.load('/frames/closer').then(() => {
    finaleSeq.setProgress(0.85)
    finaleSeq.tick()
  })
  attachVideo($('#pillarsVideo') as HTMLVideoElement, '/media/builder.mp4')
  attachVideo($('#workVideo') as HTMLVideoElement, '/media/creator.mp4')
} else {
  init()
}

/* ============================================================
   Volle cineastische Experience
   ============================================================ */

function init() {
  /* ---------- Smooth Scroll (Lenis) ---------- */
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })
  lenis.stop()
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // Frame-Sequenzen jeden Tick lerpen/zeichnen
  gsap.ticker.add(() => {
    heroSeq.tick()
    finaleSeq.tick()
  })

  /* ---------- Anker-Scrolling ---------- */
  $$('[data-scrollto]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault()
      const sel = a.dataset.scrollto!
      if (sel === '#top') return lenis.scrollTo(0, { duration: 1.6 })
      const el = document.querySelector(sel) as HTMLElement | null
      if (!el) return
      const offset = sel === '#kontakt' ? el.offsetHeight - window.innerHeight : 0
      lenis.scrollTo(el, { offset, duration: 1.6 })
    })
  })

  /* ---------- Loader: Hero-Frames vorladen ---------- */
  const percentEl = $('#loaderPercent')
  const barEl = $('#loaderBar')
  const shown = { p: 0 }
  let realProgress = 0

  const renderLoader = gsap.to(shown, {
    p: () => realProgress,
    duration: 0.4,
    ease: 'power1.out',
    paused: true,
    onUpdate: () => {
      percentEl.textContent = String(Math.round(shown.p * 100))
      barEl.style.transform = `scaleX(${shown.p})`
    },
  })
  const setProgress = (p: number) => {
    realProgress = p
    renderLoader.invalidate().restart()
  }

  const revealSite = () => {
    // Finale-Frames + Ambient-Videos erst nach dem Reveal laden
    finaleSeq.load('/frames/closer')
    attachVideo($('#pillarsVideo') as HTMLVideoElement, '/media/builder.mp4')
    attachVideo($('#workVideo') as HTMLVideoElement, '/media/creator.mp4')

    const tl = gsap.timeline()
    tl.to(shown, {
      p: 1,
      duration: 0.35,
      ease: 'power1.inOut',
      onUpdate: () => {
        percentEl.textContent = String(Math.round(shown.p * 100))
        barEl.style.transform = `scaleX(${shown.p})`
      },
    })
      .to('#loader', { yPercent: -100, duration: 0.95, ease: 'expo.inOut' }, '+=0.15')
      .add(() => {
        $('#loader').style.display = 'none'
        lenis.start()
        ScrollTrigger.refresh()
      })
      .to('.nav', { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
  }

  // Reveal spätestens nach 3,5 s — restliche Frames laden im Hintergrund weiter
  let revealed = false
  const doReveal = () => {
    if (revealed) return
    revealed = true
    revealSite()
  }
  heroSeq.load('/frames/hero', setProgress).finally(doReveal)
  window.setTimeout(doReveal, 3500)

  /* ============================================================
     HERO-Timeline - Orbit-Scrub + Name buchstabenweise
     ============================================================ */
  const heroState = { p: 0 }
  const heroTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.55,
    },
  })

  // Kamera-Orbit: exakt an Scroll gekoppelt
  heroTl.to(heroState, { p: 1, duration: 10, onUpdate: () => heroSeq.setProgress(heroState.p) }, 0)

  const line1 = $$('.hero__line--1 .hero__letter')
  const line2 = $$('.hero__line--2 .hero__letter')
  gsap.set([...line1, ...line2], { yPercent: 115, rotation: 7 })
  gsap.set('.hero__subMask', { yPercent: 110, opacity: 0 })

  heroTl.to('.hero__kicker', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.25)
  heroTl.to(line1, { yPercent: 0, rotation: 0, duration: 1.5, stagger: 0.14, ease: 'power3.out' }, 0.55)
  heroTl.to(line2, { yPercent: 0, rotation: 0, duration: 1.5, stagger: 0.14, ease: 'power3.out' }, 1.35)
  heroTl.to('.hero__subMask', { yPercent: 0, opacity: 1, duration: 1.4, ease: 'power3.out' }, 3.6)
  heroTl.to('#scrollHint', { autoAlpha: 0, duration: 0.6 }, 0.3)
  // Abgang: Content hebt ab, Orbit läuft weiter bis zum letzten Frame
  heroTl.to('.hero__content', { yPercent: -9, autoAlpha: 0, duration: 1.6, ease: 'power2.in' }, 8.4)
  heroTl.to('.hero__hud', { autoAlpha: 0, duration: 0.8 }, 9.0)

  const debugBag = { gsap, heroTl, line1, line2, lenis } as Record<string, unknown>
  if (import.meta.env.DEV) {
    ;(window as unknown as Record<string, unknown>).__debug = debugBag
  }

  /* ============================================================
     MARQUEE - Endlos + Scroll-Velocity-Kopplung
     ============================================================ */
  const track = $('#marqueeTrack')
  let marqueeX = 0
  let halfWidth = 0
  const measure = () => {
    halfWidth = track.scrollWidth / 2
  }
  document.fonts.ready.then(measure)
  window.addEventListener('resize', measure)

  gsap.ticker.add((_t, deltaMS) => {
    if (!halfWidth) return
    const velocityBoost = Math.min(Math.abs(lenis.velocity) * 0.045, 3.4)
    marqueeX -= (0.055 + velocityBoost * 0.02) * deltaMS
    if (marqueeX <= -halfWidth) marqueeX += halfWidth
    track.style.transform = `translate3d(${marqueeX}px,0,0)`
  })

  /* ---------- Velocity-Skew auf Work-Grid ---------- */
  const skewTo = gsap.quickTo('.work__grid', 'skewY', { duration: 0.5, ease: 'power2.out' })
  gsap.ticker.add(() => {
    skewTo(gsap.utils.clamp(-1.8, 1.8, lenis.velocity * 0.028))
  })

  /* ============================================================
     STATS - Count-up beim Scroll
     ============================================================ */
  $$('.stat__value').forEach((el) => {
    const target = Number(el.dataset.value)
    const state = { v: 0 }
    ScrollTrigger.create({
      trigger: el,
      start: 'top 86%',
      once: true,
      onEnter: () =>
        gsap.to(state, {
          v: target,
          duration: 1.9,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = `${el.dataset.prefix}${Math.round(state.v)}${el.dataset.suffix}`
          },
        }),
    })
  })
  gsap.from('.stat', {
    scrollTrigger: { trigger: '.stats', start: 'top 80%', once: true },
    y: 44,
    autoAlpha: 0,
    duration: 1.1,
    stagger: 0.1,
    ease: 'power3.out',
  })

  /* ============================================================
     PILLARS - angepinnte Sequenz über „The Builder"
     ============================================================ */
  const pillarEls = $$('.pillar')
  const railSegs = $$('.pillars__railSeg span')
  const ghost = $('#pillarsGhost')
  gsap.set(pillarEls, { autoAlpha: 0 })
  $$('.pillar__titleInner').forEach((t) => gsap.set(t, { yPercent: 110 }))

  const pillarsTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.pillars',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const idx = Math.min(pillarEls.length - 1, Math.floor(self.progress * pillarEls.length))
        ghost.textContent = String(idx + 1).padStart(2, '0')
        railSegs.forEach((seg, i) => {
          const fill = gsap.utils.clamp(0, 1, self.progress * pillarEls.length - i)
          seg.style.transform = `scaleX(${fill})`
        })
      },
    },
  })

  // Anker: fixiert die Timeline-Dauer auf 10, damit die Slots exakt auf den Scroll mappen
  pillarsTl.to({}, { duration: 10 }, 0)

  const SLOT = 10 / pillarEls.length
  pillarEls.forEach((el, i) => {
    const inner = el.querySelector('.pillar__titleInner')
    const text = el.querySelector('.pillar__text')
    const num = el.querySelector('.pillar__num')
    const at = i * SLOT
    pillarsTl.to(el, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, at + 0.15)
    pillarsTl.to(inner, { yPercent: 0, duration: 0.9, ease: 'power3.out' }, at + 0.18)
    pillarsTl.from(text, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, at + 0.4)
    pillarsTl.from(num, { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' }, at + 0.16)
    if (i < pillarEls.length - 1) {
      pillarsTl.to(el, { autoAlpha: 0, y: -26, duration: 0.55, ease: 'power2.in' }, at + SLOT - 0.45)
    }
  })

  debugBag.pillarsTl = pillarsTl

  // Video-Parallax + Play/Pause nur im Viewport
  const pillarsVideo = $('#pillarsVideo') as HTMLVideoElement
  gsap.fromTo(
    pillarsVideo,
    { scale: 1.12 },
    {
      scale: 1.02,
      ease: 'none',
      scrollTrigger: { trigger: '.pillars', start: 'top bottom', end: 'bottom top', scrub: 0.8 },
    }
  )
  ScrollTrigger.create({
    trigger: '.pillars',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      if (self.isActive) pillarsVideo.play().catch(() => {})
      else pillarsVideo.pause()
    },
  })

  /* ============================================================
     WORK - Titel-Reveal + Karten + Video
     ============================================================ */
  $$('.work__titleLine').forEach((line) => {
    const inner = document.createElement('span')
    inner.innerHTML = line.innerHTML
    line.innerHTML = ''
    line.appendChild(inner)
    gsap.from(inner, {
      scrollTrigger: { trigger: line, start: 'top 88%', once: true },
      yPercent: 110,
      duration: 1.2,
      ease: 'power4.out',
    })
  })

  gsap.from('.card', {
    scrollTrigger: { trigger: '.work__grid', start: 'top 82%', once: true },
    y: 90,
    autoAlpha: 0,
    duration: 1.3,
    stagger: 0.14,
    ease: 'power3.out',
  })

  const workVideo = $('#workVideo') as HTMLVideoElement
  ScrollTrigger.create({
    trigger: '.work',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      if (self.isActive) workVideo.play().catch(() => {})
      else workVideo.pause()
    },
  })

  /* ============================================================
     FINALE - „The Closer"-Scrub + CTAs
     ============================================================ */
  const finaleState = { p: 0 }
  const finaleTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.finale',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.55,
    },
  })

  finaleTl.to(finaleState, { p: 1, duration: 10, onUpdate: () => finaleSeq.setProgress(finaleState.p) }, 0)

  const finaleWords = $$('.finale__word span')
  gsap.set(finaleWords, { yPercent: 112 })
  finaleTl.to(finaleWords, { yPercent: 0, duration: 1.1, stagger: 0.16, ease: 'power3.out' }, 1.0)
  finaleTl.to('.section-label--center', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.8)
  gsap.set('#finaleHook', { y: 22 })
  finaleTl.to('#finaleHook', { autoAlpha: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 6.4)
  finaleTl.to('.finale__ctas', { autoAlpha: 1, y: 0, duration: 1.3, ease: 'power3.out' }, 6.9)
  finaleTl.to('.finale__direct', { autoAlpha: 1, duration: 0.9, ease: 'power2.out' }, 7.8)

  gsap.set('.section-label--center', { opacity: 0 })

  /* ---------- Magnetic Buttons ---------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    $$('[data-magnetic]').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect()
        xTo((e.clientX - (r.left + r.width / 2)) * 0.32)
        yTo((e.clientY - (r.top + r.height / 2)) * 0.32)
      })
      btn.addEventListener('mouseleave', () => {
        xTo(0)
        yTo(0)
      })
    })
  }

  /* ---------- Footer-Reveal ---------- */
  gsap.from('.footer__giant', {
    scrollTrigger: { trigger: '.footer', start: 'top 92%', once: true },
    yPercent: 30,
    autoAlpha: 0,
    duration: 1.4,
    ease: 'power3.out',
  })
  gsap.from('.footer__links a', {
    scrollTrigger: { trigger: '.footer__links', start: 'top 94%', once: true },
    y: 30,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: 'power3.out',
  })
}
