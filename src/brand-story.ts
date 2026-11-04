import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './brand-story.css'

type FanEntry = { image: string; width: number; height: number; alt: string; title: string; description: string }

const fanEntries: FanEntry[] = [
  { image: '/media/personal/editorial-work.webp', width: 840, height: 1120, alt: 'Inszeniertes KI-Editorialmotiv: Adrien arbeitet mit einem Laptop am Fenster.', title: 'Der nächste Versuch', description: 'Eine inszenierte Arbeitsstudie aus meiner Bildwelt. KI-Editorial.' },
  { image: '/media/projects/engine-section.png', width: 1280, height: 800, alt: 'Eigene Schnittansicht des Engine Playground mit sechs Kolben.', title: 'Technik zum Erkunden', description: 'Engine Playground: mein interaktives Lern- und Demonstrationsprojekt.' },
  { image: '/media/personal/portrait-original.webp', width: 640, height: 800, alt: 'Originalporträt von Adrien Wottke im weißen Hemd.', title: 'Hi, ich bin Adrien.', description: 'Maschinenbau, KI und die Lust, eigene Ideen auszuprobieren.' },
  { image: '/media/projects/crm-jarvis.png', width: 1440, height: 900, alt: 'Jarvis-Seitenleiste in der eigenen CRM-Testoberfläche mit synthetischen Demodaten.', title: 'Ideen für den Alltag', description: 'CRM und Jarvis: eine eigene Oberfläche für Arbeitsabläufe. Ansicht mit Demodaten.' },
  { image: '/media/projects/garage-overview.jpg', width: 1265, height: 791, alt: 'Eigene lokale Entwicklungsansicht der digitalen E39-Garage.', title: 'Mein E39. Digital.', description: 'Ein persönliches Interesse wird zu einer eigenen digitalen Garage.' },
]

export function journeyMarkup(): string {
  return `<section class="brand-story" id="mein-weg" data-header="dark" aria-labelledby="brand-story-title">
    <div class="brand-story__wash" aria-hidden="true"></div>
    <header class="brand-story__intro">
      <p class="brand-story__intro-note">Adrien Wottke</p>
      <h2 id="brand-story-title"><span class="brand-story__line">Ich verstehe Dinge,<span class="brand-story__wipe" aria-hidden="true"></span></span><span class="brand-story__line"><em>indem ich sie baue.</em><span class="brand-story__wipe" aria-hidden="true"></span></span></h2>
      <p class="brand-story__lead">Mit KI entwickle ich Websites, Software und interaktive Technik. Jedes Projekt ist eine neue Frage, die ich ausprobieren möchte.</p>
    </header>
    <div class="brand-story__viewport">
      <div class="brand-story__track">
        <figure class="brand-story__item brand-story__item--portrait" data-story-drift="-46">
          <div class="brand-story__photo"><img src="/media/personal/portrait-original.webp" width="640" height="800" alt="Originalporträt von Adrien Wottke im weißen Hemd" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Der Mensch hinter den Ideen.</strong><span>Adrien Wottke · Originalporträt</span></figcaption>
        </figure>
        <article class="brand-story__item brand-story__item--study brand-story__note" data-story-drift="36">
          <h3>Verstehen.<br /><em>Und ausprobieren.</em></h3>
          <p>Ich studiere Maschinenbau an der TU Dresden. Durch Formula Student habe ich erlebt, wie Theorie, Konstruktion und gemeinsames Bauen zusammenkommen.</p>
        </article>
        <figure class="brand-story__item brand-story__item--engine" data-story-drift="-65">
          <div class="brand-story__photo"><img src="/media/projects/engine-section.png" width="1280" height="800" alt="Schnittansicht des eigenen Engine Playground mit sechs Kolben und Kurbelwelle" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Eine Idee bekommt Bewegung.</strong><span>Engine Playground · eigene Projektansicht</span><a href="#motor-demo">Den Motor selbst ausprobieren <span aria-hidden="true">↗</span></a></figcaption>
        </figure>
        <article class="brand-story__item brand-story__item--ideas brand-story__note" data-story-drift="52">
          <h3>Ein Gedanke.<br /><em>Ein neuer Tab.</em></h3>
          <p>KI ist dabei mein Werkzeug: zum Entwerfen, Entwickeln und Weiterdenken. Was daraus wird, zeigen meine Projekte.</p>
          <a class="brand-story__text-link" href="#projekte">Meine Projekte entdecken <span aria-hidden="true">↗</span></a>
        </article>
        <figure class="brand-story__item brand-story__item--work" data-story-drift="-32">
          <div class="brand-story__photo"><img src="/media/personal/editorial-work.webp" width="840" height="1120" alt="Inszeniertes KI-Editorialmotiv: Adrien sitzt mit einem Laptop am Fenster" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Raum für den nächsten Versuch.</strong><span>KI-Editorial · inszenierte Arbeitsstudie</span></figcaption>
        </figure>
        <figure class="brand-story__item brand-story__item--garage" data-story-drift="58">
          <div class="brand-story__photo"><img src="/media/projects/garage-overview.jpg" width="1265" height="791" alt="Lokale Entwicklungsansicht der eigenen digitalen E39-Garage mit Fahrzeug und Teileauswahl" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Mein Auto als Ausgangspunkt.</strong><span>Digitale E39-Garage · eigene 3D-Projektansicht</span></figcaption>
        </figure>
        <figure class="brand-story__item brand-story__item--jarvis" data-story-drift="-40">
          <div class="brand-story__photo"><img src="/media/projects/crm-jarvis.png" width="1440" height="900" alt="Jarvis in der eigenen CRM-Testoberfläche, dargestellt mit synthetischen Demodaten" loading="lazy" decoding="async" /></div>
          <figcaption><strong>Und manchmal wird daraus ein Werkzeug.</strong><span>CRM &amp; Jarvis · Projektansicht mit Demodaten</span><a href="#projekte">Was ich noch entwickle <span aria-hidden="true">↗</span></a></figcaption>
        </figure>
      </div>
      <div class="brand-story__progress" aria-hidden="true"><span>Ein Stück meines Weges</span><span class="brand-story__progress-line"></span></div>
    </div>
  </section>`
}

export function worldsMarkup(): string {
  return `<section class="brand-worlds" data-header="dark" aria-labelledby="brand-worlds-title">
    <h2 class="brand-worlds__sr-only" id="brand-worlds-title">Zwei Seiten meiner Welt</h2>
    <a class="brand-worlds__world brand-worlds__world--build" href="#projekte">
      <div class="brand-worlds__visual"><img src="/media/projects/engine-section.png" width="1280" height="800" alt="Eigene technische Projektansicht des Engine Playground" loading="lazy" decoding="async" /></div>
      <div class="brand-worlds__shade" aria-hidden="true"></div>
      <div class="brand-worlds__copy"><h3><span>Was ich</span><em>entwickle.</em></h3><p>Websites, Software und interaktive Ideen.</p><span class="brand-worlds__action">Projekte entdecken <span aria-hidden="true">↗</span></span></div>
    </a>
    <a class="brand-worlds__world brand-worlds__world--life" href="#mein-weg">
      <div class="brand-worlds__visual"><img src="/media/personal/portrait-original.webp" width="640" height="800" alt="Originalporträt von Adrien Wottke" loading="lazy" decoding="async" /></div>
      <div class="brand-worlds__shade" aria-hidden="true"></div>
      <div class="brand-worlds__copy"><h3><span>Was mich</span><em>antreibt.</em></h3><p>Technik, Lernen und meine E39-Garage.</p><span class="brand-worlds__action">Mehr über mich <span aria-hidden="true">↗</span></span></div>
    </a>
  </section>`
}

export function personalFanMarkup(): string {
  return `<section class="brand-fan" id="einblicke" data-header="light" aria-labelledby="brand-fan-title">
    <header class="brand-fan__intro"><h2 id="brand-fan-title">Immer etwas<br /><em>zum Ausprobieren.</em></h2><p>Ein paar Einblicke in meine Projekte und die Welt dahinter. Wähle eine Karte aus.</p></header>
    <div class="brand-fan__stage" role="group" aria-label="Persönliche Einblicke auswählen">
      ${fanEntries.map((entry, index) => `<button class="brand-fan__card" type="button" data-fan-index="${index}" aria-pressed="${index === 2}" aria-label="${entry.title} Einblick auswählen"><img src="${entry.image}" alt="${entry.alt}" loading="lazy" decoding="async" width="${entry.width}" height="${entry.height}" /><span class="brand-fan__card-shade" aria-hidden="true"></span><span class="brand-fan__card-title">${entry.title}</span></button>`).join('')}
    </div>
    <div class="brand-fan__detail" aria-live="polite" aria-atomic="true"><h3>${fanEntries[2].title}</h3><p>${fanEntries[2].description}</p></div>
  </section>`
}

let activeDispose: (() => void) | undefined

export function initBrandStory(): { dispose(): void } {
  activeDispose?.()
  gsap.registerPlugin(ScrollTrigger)
  const story = document.querySelector<HTMLElement>('.brand-story')
  const worlds = document.querySelector<HTMLElement>('.brand-worlds')
  const fan = document.querySelector<HTMLElement>('.brand-fan')
  const cleanups: Array<() => void> = []
  let disposed = false
  let selectedFan = 2
  let previewFan = selectedFan
  let animateFan: ((index: number) => void) | undefined
  const cards = fan ? [...fan.querySelectorAll<HTMLButtonElement>('.brand-fan__card')] : []
  const pointerPreview = matchMedia('(min-width: 992px) and (hover: hover)')
  const canPreviewPointer = (event: Event) => pointerPreview.matches && (event as PointerEvent).pointerType === 'mouse'

  const listen = (target: EventTarget, event: string, handler: EventListener) => {
    target.addEventListener(event, handler)
    cleanups.push(() => target.removeEventListener(event, handler))
  }
  const showFan = (index: number) => {
    if (!fan || !fanEntries[index] || disposed) return
    if (previewFan !== index) {
      previewFan = index
      fan.querySelector<HTMLElement>('.brand-fan__detail h3')!.textContent = fanEntries[index].title
      fan.querySelector<HTMLElement>('.brand-fan__detail p')!.textContent = fanEntries[index].description
    }
    animateFan?.(index)
  }
  cards.forEach((card, index) => {
    listen(card, 'pointerenter', event => { if (canPreviewPointer(event)) showFan(index) })
    listen(card, 'pointerdown', event => {
      const pointer = event as PointerEvent
      if (pointer.button !== 0) return
      // Focusing a card can change its fan position. Keep the eventual click
      // with the card that was pressed, even if a neighbour moves underneath.
      try { card.setPointerCapture(pointer.pointerId) } catch { /* A cancelled pointer no longer needs capture. */ }
    })
    listen(card, 'focus', () => showFan(index))
    listen(card, 'click', () => {
      selectedFan = index
      cards.forEach((item, position) => item.setAttribute('aria-pressed', String(position === index)))
      showFan(index)
    })
    listen(card, 'keydown', event => {
      const key = (event as KeyboardEvent).key
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return
      event.preventDefault()
      const target = key === 'Home' ? 0 : key === 'End' ? cards.length - 1 : (index + (key === 'ArrowRight' ? 1 : -1) + cards.length) % cards.length
      cards[target].focus({ preventScroll: true })
    })
  })
  if (fan) {
    const restoreSelection = () => {
      const focused = cards.indexOf(document.activeElement as HTMLButtonElement)
      showFan(focused < 0 ? selectedFan : focused)
    }
    listen(fan, 'pointerleave', event => { if (canPreviewPointer(event)) restoreSelection() })
    listen(fan, 'focusout', () => queueMicrotask(() => { if (!disposed) restoreSelection() }))
  }

  const media = gsap.matchMedia()
  media.add({ desktop: '(min-width: 992px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (!context.conditions?.motion) return
    const localCleanups: Array<() => void> = []
    const onLocal = (target: EventTarget, event: string, handler: EventListener) => {
      target.addEventListener(event, handler)
      localCleanups.push(() => target.removeEventListener(event, handler))
    }
    const desktop = !!context.conditions.desktop

    if (story) {
      story.classList.add('brand-story--motion')
      const viewport = story.querySelector<HTMLElement>('.brand-story__viewport')!
      const track = story.querySelector<HTMLElement>('.brand-story__track')!
      const wash = story.querySelector<HTMLElement>('.brand-story__wash')!
      const theme = (progress: number) => {
        const next = progress > .55 ? 'light' : 'dark'
        if (story.dataset.header === next) return
        story.dataset.header = next
        story.dispatchEvent(new CustomEvent('brand-story:theme', { bubbles: true, detail: { theme: next } }))
      }
      // The desktop quickSetter is outside a tween's captured start values.
      // Reset it explicitly before a new responsive context creates its wash.
      gsap.set(wash, { opacity: 0 })
      theme(0)
      const distance = () => Math.max(1, track.scrollWidth - viewport.clientWidth)
      if (desktop) {
        story.classList.add('brand-story--horizontal')
        const setWash = gsap.quickSetter(wash, 'opacity')
        const updateStory = (progress: number) => {
          story.style.setProperty('--story-progress', String(progress))
          const colorProgress = gsap.utils.clamp(0, 1, (progress - .08) / .78)
          setWash(colorProgress)
          theme(colorProgress)
        }
        const travel = gsap.to(track, {
          x: () => -distance(), ease: 'none', scrollTrigger: {
            trigger: viewport, start: 'top top', end: () => `+=${distance() * .6}`, pin: viewport,
            pinSpacing: true, scrub: .85, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: self => updateStory(self.progress), onRefresh: self => updateStory(self.progress),
          },
        })
        track.querySelectorAll<HTMLElement>('[data-story-drift]').forEach(item => {
          const drift = Number(item.dataset.storyDrift) || 0
          gsap.fromTo(item, { y: -drift / 2 }, { y: drift / 2, ease: 'none', scrollTrigger: { trigger: item, containerAnimation: travel, start: 'left right', end: 'right left', scrub: .8 } })
        })
        track.querySelectorAll<HTMLElement>('.brand-story__photo').forEach(photo => {
          gsap.fromTo(photo, { clipPath: 'ellipse(90% 90% at 50% 50%)', scale: .98 }, { clipPath: 'ellipse(90% 90% at 50% 50%)', scale: 1, duration: 1.15, ease: 'power3.out', scrollTrigger: { trigger: photo, containerAnimation: travel, start: 'left 96%', toggleActions: 'play none none reverse' } })
        })
        onLocal(viewport, 'focusin', event => {
          const target = event.target as HTMLElement
          const item = target.closest<HTMLElement>('.brand-story__item')
          if (!item || !travel.scrollTrigger) return
          const bounds = target.getBoundingClientRect()
          if (bounds.left >= 20 && bounds.right <= viewport.clientWidth - 20) return
          const offset = Math.min(distance(), Math.max(0, item.offsetLeft - viewport.clientWidth * .12))
          travel.scrollTrigger.scroll(travel.scrollTrigger.start + offset * .6)
          ScrollTrigger.update()
          travel.scrollTrigger.getTween()?.progress(1)
        })
      } else {
        gsap.fromTo(wash, { opacity: 0 }, { opacity: 1, ease: 'none', immediateRender: true, scrollTrigger: { trigger: track, start: 'top 65%', end: 'bottom 75%', scrub: .7, onUpdate: self => theme(self.progress), onRefresh: self => theme(self.progress) } })
        track.querySelectorAll<HTMLElement>('[data-story-drift]').forEach(item => {
          const drift = (Number(item.dataset.storyDrift) || 0) * .45
          gsap.fromTo(item, { y: -drift / 2 }, { y: drift / 2, ease: 'none', scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: .7 } })
        })
        track.querySelectorAll<HTMLElement>('.brand-story__photo').forEach(photo => {
          gsap.fromTo(photo, { clipPath: 'ellipse(0% 0% at 50% 50%)', scale: .97 }, { clipPath: 'ellipse(90% 90% at 50% 50%)', scale: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: photo, start: 'top 93%', once: true } })
        })
      }
      const reveal = gsap.timeline({ scrollTrigger: { trigger: '.brand-story__intro', start: 'top 84%', once: true } })
      story.querySelectorAll<HTMLElement>('.brand-story__line').forEach((line, index) => {
        const cover = line.querySelector('.brand-story__wipe')!
        reveal.fromTo(line, { y: 32, clipPath: 'inset(0 0 100% 0)' }, { y: 0, clipPath: 'inset(0 0 0% 0)', duration: .95, ease: 'power3.out' }, index * .18)
          .fromTo(cover, { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: .32, ease: 'power2.inOut' }, index * .18)
          .set(cover, { transformOrigin: 'right' }, index * .18 + .33)
          .to(cover, { scaleX: 0, duration: .6, ease: 'power3.out' }, index * .18 + .34)
      })
      localCleanups.push(() => {
        story.classList.remove('brand-story--motion', 'brand-story--horizontal')
        story.style.removeProperty('--story-progress')
        gsap.set(wash, { clearProps: 'opacity' })
        story.dataset.header = 'dark'
      })
    }

    if (worlds) {
      const worldItems = [...worlds.querySelectorAll<HTMLElement>('.brand-worlds__world')]
      const entrance = gsap.timeline({ scrollTrigger: { trigger: worlds, start: 'top 90%', once: true } })
      worldItems.forEach((world, index) => {
        const direction = index === 0 ? -1 : 1
        entrance.fromTo(world.querySelector('.brand-worlds__visual'), { xPercent: direction * (desktop ? 38 : 20), scale: 1.08, clipPath: 'ellipse(48% 78% at 50% 50%)' }, { xPercent: 0, scale: 1, clipPath: 'ellipse(90% 90% at 50% 50%)', ease: 'power2.out', duration: 1 }, 0)
          .fromTo(world.querySelector('.brand-worlds__copy'), { x: direction * (desktop ? 65 : 24), y: 28 }, { x: 0, y: 0, duration: 1, ease: 'power2.out' }, .05)
      })
    }

    if (fan && cards.length) {
      const stage = fan.querySelector<HTMLElement>('.brand-fan__stage')!
      fan.classList.add('brand-fan--enhanced')
      const center = (cards.length - 1) / 2
      let entered = false
      let completed = false
      const poses = (index: number, active: number) => {
        const relative = (index - center) / center
        const narrow = stage.clientWidth < 650
        const selected = index === active
        return {
          x: relative * stage.clientWidth * .28 + (active < 0 || selected ? 0 : Math.sign(index - active) * (narrow ? 10 : 25)),
          y: Math.pow(Math.abs(relative), 1.5) * (narrow ? 32 : 58) - (selected ? narrow ? 24 : 43 : 0),
          rotation: selected ? 0 : relative * (narrow ? 13 : 18),
          scale: selected ? 1.035 : 1 - Math.abs(relative) * .17,
          zIndex: selected ? 15 : Math.round(6 - Math.abs(index - center)),
        }
      }
      gsap.set(cards, { xPercent: -50, yPercent: -50 })
      const entrance = gsap.fromTo(cards, { x: 0, y: 85, rotation: 0, scale: .88 }, {
        x: index => poses(index, selectedFan).x, y: index => poses(index, selectedFan).y,
        rotation: index => poses(index, selectedFan).rotation, scale: index => poses(index, selectedFan).scale,
        zIndex: index => poses(index, selectedFan).zIndex,
        stagger: .045, duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: fan, start: 'top 78%', once: true, onEnter: () => { entered = true } },
        onComplete: () => { completed = true },
      })
      animateFan = index => {
        if (!entered) return
        if (!completed) { entrance.progress(1).kill(); completed = true }
        cards.forEach((card, position) => gsap.to(card, { ...poses(position, index), duration: .65, ease: 'elastic.out(1, .75)', overwrite: true }))
      }
      const resize = new ResizeObserver(() => { if (completed) cards.forEach((card, index) => gsap.set(card, poses(index, previewFan))) })
      resize.observe(stage)
      localCleanups.push(() => {
        resize.disconnect()
        animateFan = undefined
        gsap.killTweensOf(cards)
        gsap.set(cards, { clearProps: 'transform,zIndex' })
        fan.classList.remove('brand-fan--enhanced')
      })
    }

    return () => { localCleanups.forEach(dispose => dispose()) }
  })

  const refresh = () => { if (!disposed) ScrollTrigger.refresh() }
  const pendingImages = [story, worlds, fan].flatMap(root => root ? [...root.querySelectorAll<HTMLImageElement>('img')] : []).filter(image => !image.complete)
  pendingImages.forEach(image => listen(image, 'load', refresh))
  void document.fonts.ready.then(refresh)
  const dispose = () => {
    if (disposed) return
    disposed = true
    media.revert()
    cleanups.forEach(cleanup => cleanup())
    if (activeDispose === dispose) activeDispose = undefined
  }
  activeDispose = dispose
  return { dispose }
}
