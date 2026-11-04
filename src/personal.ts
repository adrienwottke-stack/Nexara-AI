import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/fraunces/wght-italic.css'
import './personal.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)
const navigation = document.querySelector<HTMLDetailsElement>('#navigation')!
const menuToggle = navigation.querySelector<HTMLElement>('summary')!
const header = document.querySelector<HTMLElement>('#site-header')!
const portrait = document.querySelector<HTMLImageElement>('#hero-portrait')!
document.querySelector<HTMLElement>('#year')!.textContent = String(new Date().getFullYear())

// The alternative remains a local review URL, without a design switch in the public site.
if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('portrait') === 'b') {
  portrait.src = '/media/personal/hero-b.webp'
  portrait.srcset = '/media/personal/hero-b-768.webp 768w, /media/personal/hero-b.webp 1440w'
  portrait.alt = 'Porträtvariante von Adrien Wottke in einem dunkelgrauen Pullover'
}
portrait.addEventListener('error', () => {
  if (portrait.dataset.fallback) return
  portrait.dataset.fallback = 'true'
  portrait.removeAttribute('srcset')
  portrait.src = '/adrien.jpg'
  portrait.alt = 'Originalporträt von Adrien Wottke'
  portrait.classList.add('hero__portrait--fallback')
})

function closeMenu(restoreFocus = false) {
  navigation.open = false
  if (restoreFocus) menuToggle.focus()
}
navigation.addEventListener('toggle', () => menuToggle.setAttribute('aria-expanded', String(navigation.open)))
menuToggle.setAttribute('aria-expanded', String(navigation.open))
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.open) closeMenu(true)
})
document.addEventListener('click', (event) => {
  if (navigation.open && event.target instanceof Node && !navigation.contains(event.target)) closeMenu()
})
navigation.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => link.addEventListener('click', () => closeMenu()))

let lenis: Lenis | undefined
const media = gsap.matchMedia()
media.add('(prefers-reduced-motion: no-preference)', () => {
  lenis = new Lenis({ duration: 0.9, smoothWheel: true, syncTouch: false })
  const activeLenis = lenis
  const tick = (time: number) => activeLenis.raf(time * 1000)
  activeLenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  const hero = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 0.6 } })
  hero.to('.hero__portrait-wrap', { yPercent: 6, scale: 1.035, duration: 1, ease: 'none' }, 0)
    .to('.hero__first', { yPercent: -13, duration: 1, ease: 'none' }, 0)
    .to('.hero__aside', { y: -38, opacity: 0, duration: 0.7, ease: 'none' }, 0.15)
    .to('.hero__contours', { y: -50, duration: 1, ease: 'none' }, 0)
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((element) => {
    const distance = Number(element.dataset.parallax || 0)
    gsap.fromTo(element, { y: -distance / 2 }, { y: distance / 2, ease: 'none', scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 0.8 } })
  })
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
    // HTML content stays visible even if animation or JavaScript fails.
    gsap.from(element, { y: 28, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } })
  })
  return () => {
    activeLenis.destroy()
    gsap.ticker.remove(tick)
    if (lenis === activeLenis) lenis = undefined
  }
})
const darkSections = new Set<Element>()
document.querySelectorAll('.story--dark, .contact, .footer').forEach((section) => {
  ScrollTrigger.create({ trigger: section, start: 'top 68px', end: 'bottom 68px', onToggle: ({ isActive }) => {
    if (isActive) darkSections.add(section)
    else darkSections.delete(section)
    header.classList.toggle('site-header--dark', darkSections.size > 0)
  } })
})

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href')!
    const target = document.getElementById(hash.slice(1))
    if (!target || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !lenis) return
    event.preventDefault()
    history.pushState(null, '', hash)
    // Lenis reads the root's scroll-padding-top; an additional offset would apply it twice.
    lenis.scrollTo(target, { duration: 1.2, onComplete: () => {
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1')
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
      }
      target.focus({ preventScroll: true })
    } })
  })
})
document.fonts.ready.then(() => ScrollTrigger.refresh())
window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
