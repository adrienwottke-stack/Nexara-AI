import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import type { ExperienceController, ViewportRect } from './experience/types'
import './brand-experience.css'

export function initBrandExperience() {
  gsap.registerPlugin(ScrollTrigger)
  const html = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const hero = document.querySelector<HTMLElement>('#top')!
  const heroStage = hero.querySelector<HTMLElement>('.cinematic-stage')!
  const flight = document.querySelector<HTMLElement>('.brand-flight')!
  const flightStage = flight.querySelector<HTMLElement>('.brand-flight-stage')!
  const heroTarget = document.querySelector<HTMLElement>('#hero-focus-target')!
  const projectTarget = document.querySelector<HTMLElement>('#project-flight-target')!
  const host = document.querySelector<HTMLElement>('#spatial-experience')!
  const header = document.querySelector<HTMLElement>('#brand-header')!
  const navigation = document.querySelector<HTMLDetailsElement>('#brand-navigation')!
  const summary = navigation.querySelector('summary')!
  const menu = document.querySelector<HTMLElement>('#brand-menu')!
  const heroVideo = document.querySelector<HTMLVideoElement>('#hero-film')!
  const closer = document.querySelector<HTMLElement>('#kontakt')!
  const closerVideo = document.querySelector<HTMLVideoElement>('#closer-film')!
  const copy = hero.querySelector<HTMLElement>('.brand-hero-copy')!
  const bands = hero.querySelector<HTMLElement>('.brand-textbands')!
  const signature = hero.querySelector<SVGElement>('.brand-hero-sign')!
  const disposers: Array<() => void> = []
  const clamp = gsap.utils.clamp(0, 1)
  const freePlay = new Set<HTMLVideoElement>()
  const loaded = new Set<HTMLVideoElement>()
  const desired = new Map<HTMLVideoElement, number>()
  const revisions = new Map<HTMLVideoElement, number>()
  let scene: ExperienceController | undefined
  let sceneReady = false
  let sceneRequested = false
  let lenis: Lenis | undefined
  let lenisTick: ((time: number) => void) | undefined
  let scheduled = false
  let disposed = false
  let menuClosing = false
  let effectsPaused = false
  let rangerMode = false
  let bandTimelines: gsap.core.Tween[] = []
  heroStage.prepend(host)

  const effectsButton = document.createElement('button')
  effectsButton.type = 'button'
  effectsButton.className = 'brand-effects-toggle'
  effectsButton.textContent = 'Effekte pausieren'
  effectsButton.setAttribute('aria-pressed', 'false')
  const controls = document.createElement('div')
  controls.className = 'brand-motion-controls'
  const heroFilmButton = hero.querySelector<HTMLButtonElement>('[data-play-film]')!
  heroFilmButton.replaceWith(controls)
  const rangerButton = document.createElement('button')
  rangerButton.type = 'button'
  rangerButton.className = 'brand-ranger-toggle'
  rangerButton.textContent = 'Ranger-Modus'
  rangerButton.disabled = true
  rangerButton.setAttribute('aria-pressed', 'false')
  rangerButton.setAttribute('aria-label', 'Ranger-Verwandlung einschalten')
  controls.append(rangerButton, heroFilmButton, effectsButton)

  function scrollLock() {
    const locked = navigation.open || !!document.querySelector('dialog:modal')
    html.classList.toggle('brand-menu-open', navigation.open)
    if (locked) lenis?.stop()
    else lenis?.start()
  }
  function closeMenu(focus = false, after?: () => void) {
    if (!navigation.open) { after?.(); return }
    if (menuClosing) return
    const done = () => {
      navigation.open = false
      menuClosing = false
      scrollLock()
      if (focus) summary.focus({ preventScroll: true })
      schedule()
      after?.()
    }
    if (reduced.matches) done()
    else {
      menuClosing = true
      gsap.to(menu, { clipPath: 'ellipse(0% 0% at 100% 0%)', duration: .55, ease: 'power3.inOut', onComplete: done })
    }
  }
  summary.setAttribute('aria-expanded', String(navigation.open))
  const summaryClick = (event: MouseEvent) => { if (navigation.open) { event.preventDefault(); closeMenu(true) } }
  summary.addEventListener('click', summaryClick)
  const menuToggle = () => {
    summary.setAttribute('aria-expanded', String(navigation.open))
    scrollLock()
    schedule()
    if (!navigation.open) return
    gsap.killTweensOf(menu)
    if (!reduced.matches) {
      gsap.fromTo(menu, { clipPath: 'ellipse(0% 0% at 100% 0%)' }, { clipPath: 'ellipse(150% 180% at 100% 0%)', duration: .85, ease: 'power3.inOut' })
      gsap.fromTo('.brand-menu-gallery figure', { clipPath: 'ellipse(0% 0% at 50% 100%)', y: 35 }, { clipPath: 'ellipse(100% 100% at 50% 50%)', y: 0, duration: 1, stagger: .06, delay: .18, ease: 'power3.out' })
      gsap.fromTo('.brand-menu-links a>span', { yPercent: 110, rotateX: -15 }, { yPercent: 0, rotateX: 0, duration: .85, stagger: .055, delay: .22, ease: 'power3.out' })
    } else gsap.set(menu, { clearProps: 'clipPath' })
    menu.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true })
  }
  navigation.addEventListener('toggle', menuToggle)
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && navigation.open) closeMenu(true)
    if (event.key !== 'Tab' || !navigation.open) return
    const elements = [summary, ...menu.querySelectorAll<HTMLElement>('a[href],button')].filter(el => el.getClientRects().length)
    const first = elements[0]
    const last = elements[elements.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
  document.addEventListener('keydown', keydown)
  const dialogObserver = new MutationObserver(scrollLock)
  document.querySelectorAll('dialog').forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }))
  disposers.push(() => { summary.removeEventListener('click', summaryClick); navigation.removeEventListener('toggle', menuToggle); document.removeEventListener('keydown', keydown); dialogObserver.disconnect() })

  function loadFilm(video: HTMLVideoElement) {
    if (loaded.has(video)) return
    loaded.add(video)
    video.src = video.dataset.src!
    video.preload = 'auto'
    video.load()
  }
  function filmLabel(video: HTMLVideoElement) {
    const playing = freePlay.has(video)
    const button = document.querySelector<HTMLButtonElement>(`[data-play-film="${video.id}"]`)!
    button.textContent = video === heroVideo ? (playing ? 'Zur räumlichen Ansicht' : 'Porträtfilm ansehen') : (playing ? 'Film pausieren' : 'Film abspielen')
    button.setAttribute('aria-pressed', String(playing))
    button.setAttribute('aria-label', button.textContent)
  }
  function seek(video: HTMLVideoElement) {
    if (freePlay.has(video) || reduced.matches || video.readyState < 2 || video.seeking || !Number.isFinite(video.duration)) return
    const target = Math.min(video.duration - .08, (desired.get(video) ?? 0) * video.duration)
    if (Math.abs(video.currentTime - target) > .045) video.currentTime = Math.max(0, target)
  }
  for (const video of [heroVideo, closerVideo]) {
    desired.set(video, 0)
    filmLabel(video)
    const loadedData = () => seek(video)
    const ended = () => { revisions.set(video, (revisions.get(video) ?? 0) + 1); freePlay.delete(video); hero.classList.toggle('is-film-mode', freePlay.has(heroVideo)); filmLabel(video); schedule() }
    video.addEventListener('loadeddata', loadedData)
    video.addEventListener('seeked', loadedData)
    video.addEventListener('ended', ended)
    const button = document.querySelector<HTMLButtonElement>(`[data-play-film="${video.id}"]`)!
    const click = async () => {
      const revision = (revisions.get(video) ?? 0) + 1
      revisions.set(video, revision)
      if (freePlay.has(video)) { video.pause(); freePlay.delete(video); filmLabel(video); hero.classList.toggle('is-film-mode', freePlay.has(heroVideo)); schedule(); return }
      loadFilm(video)
      freePlay.add(video)
      hero.classList.toggle('is-film-mode', freePlay.has(heroVideo))
      filmLabel(video)
      schedule()
      try {
        if (video.ended) video.currentTime = 0
        await video.play()
        if (revisions.get(video) !== revision) return
      } catch { if (revisions.get(video) === revision) ended() }
    }
    button.addEventListener('click', click)
    disposers.push(() => { video.removeEventListener('loadeddata', loadedData); video.removeEventListener('seeked', loadedData); video.removeEventListener('ended', ended); button.removeEventListener('click', click) })
  }
  const filmObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && !reduced.matches && !effectsPaused) {
        loadFilm(closerVideo)
        closerVideo.loop = true
        freePlay.add(closerVideo)
        filmLabel(closerVideo)
        void closerVideo.play().catch(() => { freePlay.delete(closerVideo); filmLabel(closerVideo) })
      }
      if (!entry.isIntersecting && freePlay.has(closerVideo)) { closerVideo.pause(); freePlay.delete(closerVideo); filmLabel(closerVideo) }
    }
  }, { threshold: .25 })
  filmObserver.observe(closer)

  function configureMotion() {
    if (lenisTick) gsap.ticker.remove(lenisTick)
    lenis?.destroy()
    lenis = undefined
    bandTimelines.forEach(tween => tween.kill())
    bandTimelines = []
    html.classList.toggle('brand-motion', !reduced.matches)
    html.classList.toggle('spatial-ready', sceneReady && !reduced.matches)
    effectsButton.hidden = reduced.matches
    rangerButton.hidden = reduced.matches
    if (!reduced.matches) {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false, prevent: node => !!node.closest('.gallery-screen,.lightbox-content,dialog,[data-lenis-prevent]') })
      lenis.on('scroll', () => { ScrollTrigger.update(); schedule() })
      lenisTick = time => lenis?.raf(time * 1000)
      gsap.ticker.add(lenisTick)
      document.querySelectorAll<HTMLElement>('.brand-textband span').forEach((span, index) => {
        bandTimelines.push(gsap.fromTo(span, { xPercent: index ? -40 : 0 }, { xPercent: index ? 0 : -40, duration: 24 + index * 6, ease: 'none', repeat: -1 }))
      })
      void loadScene()
    }
    for (const video of freePlay) { revisions.set(video, (revisions.get(video) ?? 0) + 1); video.pause() }
    freePlay.clear()
    hero.classList.remove('is-film-mode')
    filmLabel(heroVideo); filmLabel(closerVideo)
    ScrollTrigger.refresh()
    scrollLock()
    schedule()
  }
  async function loadScene() {
    if (sceneRequested) return
    sceneRequested = true
    try {
      const { createExperience } = await import('./experience')
      if (disposed) return
      scene = await createExperience(host, {
        portraitUrl: '/media/personal/hero-a.webp', projectUrl: '/media/projects/engine-section.png', rangerEnabled: true,
        rangerPortraitUrl: import.meta.env.DEV && new URLSearchParams(location.search).get('helmet') === 'native' ? undefined : '/media/personal/ranger-helmet-v2.webp',
        onReady: () => { if (disposed) return; sceneReady = true; rangerButton.disabled = false; if (!reduced.matches) html.classList.add('spatial-ready'); schedule() },
        onError: sceneUnavailable,
      })
      if (disposed) { scene.dispose(); return }
      schedule()
    } catch { sceneUnavailable() }
  }
  function sceneUnavailable() {
    if (disposed) return
    sceneReady = false
    rangerButton.hidden = true
    html.classList.remove('spatial-ready')
    const firstFailure = !html.classList.contains('scene-unavailable')
    html.classList.add('scene-unavailable')
    if (firstFailure) ScrollTrigger.refresh()
    schedule()
  }
  const effectsClick = () => {
    effectsPaused = !effectsPaused
    html.classList.toggle('motion-paused', effectsPaused)
    effectsButton.textContent = effectsPaused ? 'Effekte fortsetzen' : 'Effekte pausieren'
    effectsButton.setAttribute('aria-pressed', String(effectsPaused))
    schedule()
  }
  effectsButton.addEventListener('click', effectsClick)
  const rangerClick = () => {
    rangerMode = !rangerMode
    rangerButton.textContent = rangerMode ? 'Zurück zu Adrien' : 'Ranger-Modus'
    rangerButton.setAttribute('aria-pressed', String(rangerMode))
    rangerButton.setAttribute('aria-label', rangerMode ? 'Ranger-Verwandlung ausschalten' : 'Ranger-Verwandlung einschalten')
    if (rangerMode) {
      if (effectsPaused) effectsClick()
      if (freePlay.has(heroVideo)) {
        revisions.set(heroVideo, (revisions.get(heroVideo) ?? 0) + 1)
        heroVideo.pause(); freePlay.delete(heroVideo); hero.classList.remove('is-film-mode'); filmLabel(heroVideo)
      }
    }
    schedule()
  }
  rangerButton.addEventListener('click', rangerClick)

  function localRect(element: HTMLElement, stage: HTMLElement): ViewportRect {
    const rect = element.getBoundingClientRect()
    const origin = stage.getBoundingClientRect()
    return { left: rect.left - origin.left, top: rect.top - origin.top, width: rect.width, height: rect.height }
  }
  function draw() {
    scheduled = false
    if (disposed) return
    const h = innerHeight
    const heroRect = hero.getBoundingClientRect()
    const flightRect = flight.getBoundingClientRect()
    const closerRect = closer.getBoundingClientRect()
    const business = document.querySelector('.service-section')!.getBoundingClientRect()
    html.classList.toggle('brand-business-visible', business.top < h)
    const hp = clamp(-heroRect.top / Math.max(1, hero.offsetHeight - h))
    const fp = clamp(-flightRect.top / Math.max(1, flight.offsetHeight - h))
    const heroVisible = heroRect.bottom > 0 && heroRect.top < h
    if (!heroVisible && freePlay.has(heroVideo)) {
      revisions.set(heroVideo, (revisions.get(heroVideo) ?? 0) + 1)
      heroVideo.pause(); freePlay.delete(heroVideo); hero.classList.remove('is-film-mode'); filmLabel(heroVideo)
    }
    const flightVisible = flightRect.bottom > 0 && flightRect.top < h
    const activeStage = flightVisible && !heroVisible ? flightStage : heroStage
    if (host.parentElement !== activeStage) activeStage.prepend(host)
    const active = !reduced.matches && !effectsPaused && !freePlay.has(heroVideo)
    host.hidden = !active || !heroVisible
    scene?.update({ heroProgress: hp, flightProgress: fp, rangerAmount: rangerMode ? 1 : 0, visible: active && heroVisible, heroTarget: heroVisible ? localRect(heroTarget, heroStage) : undefined })
    const transition = reduced.matches ? 0 : clamp((hp - .12) / .6)
    gsap.set(copy, { opacity: 1 - clamp(hp / .3), y: -hp * 35 })
    gsap.set(bands, { opacity: clamp((hp - .16) / .3) })
    gsap.set(signature, { opacity: clamp((hp - .38) / .23) })
    signature.style.setProperty('--hero-sign-scale', String(.7 + transition * .3))
    bandTimelines.forEach(tween => { if (heroVisible && !effectsPaused && !navigation.open) tween.play(); else tween.pause() })
    projectTarget.style.opacity = '1'
    let dark = flightVisible && flightRect.top <= 94
    if (closerRect.top <= 94 && closerRect.bottom > 94) dark = true
    document.querySelectorAll<HTMLElement>('[data-header]').forEach(section => {
      const rect = section.getBoundingClientRect()
      if (rect.top <= 94 && rect.bottom > 94) dark = section.dataset.header === 'dark'
    })
    if (heroVisible && heroRect.top <= 0) dark = false
    header.classList.toggle('is-dark', dark)
  }
  function schedule() { if (!scheduled && !disposed) { scheduled = true; requestAnimationFrame(draw) } }
  const resize = () => { scene?.resize(); schedule() }
  addEventListener('scroll', schedule, { passive: true })
  addEventListener('resize', resize)
  addEventListener('brand-story:theme', schedule)
  reduced.addEventListener('change', configureMotion)
  document.querySelector('.service-section')?.setAttribute('data-header', 'dark')
  closer.setAttribute('data-header', 'dark')
  document.querySelector('.brand-footer-sign')?.setAttribute('data-header', 'dark')

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const hash = link.getAttribute('href')!
      const target = document.getElementById(hash.slice(1))
      if (!target) return
      event.preventDefault()
      const go = () => {
        history.pushState(null, '', hash)
        const done = () => {
          if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1')
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
          }
          target.focus({ preventScroll: true })
        }
        // Lenis already reads the root scroll-padding and target scroll-margin.
        if (lenis) { lenis.start(); lenis.scrollTo(target, { duration: 1.05, onComplete: done }) }
        else { target.scrollIntoView({ behavior: 'instant', block: 'start' }); done() }
      }
      if (navigation.contains(link)) closeMenu(false, go)
      else go()
    }
    link.addEventListener('click', click)
    disposers.push(() => link.removeEventListener('click', click))
  })
  document.querySelectorAll('[data-project-filter]').forEach(button => button.addEventListener('click', () => requestAnimationFrame(() => { ScrollTrigger.refresh(); schedule() })))
  void document.fonts.ready.then(() => { ScrollTrigger.refresh(); schedule() })
  configureMotion()
  return {
    dispose() {
      disposed = true
      disposers.forEach(dispose => dispose())
      if (lenisTick) gsap.ticker.remove(lenisTick)
      lenis?.destroy(); scene?.dispose(); filmObserver.disconnect()
      bandTimelines.forEach(tween => tween.kill())
      removeEventListener('scroll', schedule); removeEventListener('resize', resize); removeEventListener('brand-story:theme', schedule)
      reduced.removeEventListener('change', configureMotion)
      effectsButton.removeEventListener('click', effectsClick)
      rangerButton.removeEventListener('click', rangerClick)
      controls.replaceWith(heroFilmButton)
      freePlay.forEach(video => video.pause())
      html.classList.remove('brand-motion', 'spatial-ready', 'brand-menu-open', 'motion-paused', 'brand-business-visible', 'scene-unavailable')
    },
  }
}
