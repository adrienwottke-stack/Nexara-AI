import './playground-access.css'

const LOCAL_DEMO = '/demos/engine/index.html'
const MOTOR_WORKSHOP = 'https://engine.2.29.52.190.sslip.io/?workshop=automation#mechanics'
const UPDATE_ADDRESS = 'a.wottke@nexara-ai.de'

export function playgroundMarkup(): string {
  return `
    <section class="playground-experience" id="motor-demo" aria-labelledby="playground-title">
      <div class="playground-shell">
        <header class="playground-intro">
          <div>
            <p class="playground-project-label">Engine Playground <span>Ein eigenes Experiment</span></p>
            <h2 id="playground-title">Jetzt bist<br>du dran.</h2>
          </div>
          <div class="playground-intro__copy">
            <p>Sechs Zylinder. Bewegte Bauteile. Und die Frage, wie das alles zusammenhängt.</p>
            <p>Bring den Motor in Bewegung, verändere die Drehzahl und schau dir die Mechanik aus der Nähe an.</p>
            <a class="playground-text-link playground-text-link--light" href="${MOTOR_WORKSHOP}" target="_blank" rel="noopener noreferrer">Ganze Motorwerkstatt öffnen <span aria-hidden="true">↗</span></a>
          </div>
        </header>

        <div class="playground-stage">
          <div class="playground-preview" data-playground-preview>
            <img src="/media/projects/engine-section.png" alt="Blick in die Schnittansicht meines Engine Playground: Kolben, Pleuel und Kurbelwelle eines Reihensechszylinders" loading="lazy" decoding="async">
            <div class="playground-preview__shade" aria-hidden="true"></div>
            <div class="playground-preview__content">
              <span class="playground-preview__caption">Ein Blick ins Innere.</span>
              <button class="playground-play-button" type="button" data-playground-start disabled>
                <span class="playground-play-button__icon" aria-hidden="true">▶</span>
                <span>Motor ausprobieren<small>Direkt hier. Ohne Anmeldung.</small></span>
              </button>
              <p class="playground-preview__note">Die 3D-Ansicht lädt erst nach deinem Klick.</p>
            </div>
          </div>

          <dialog class="playground-player" data-playground-player data-lenis-prevent aria-labelledby="playground-player-title" aria-describedby="playground-player-status">
            <div class="playground-player__surface" data-playground-surface>
              <header class="playground-player__toolbar">
                <div><h3 id="playground-player-title">Engine Playground</h3><p>Interaktive Mechanikdemo</p></div>
                <div class="playground-player__actions">
                  <button class="playground-control" type="button" data-playground-expand>Größer spielen <span aria-hidden="true">↗</span></button>
                  <button class="playground-control" type="button" data-playground-fullscreen hidden>Vollbild <span aria-hidden="true">⤢</span></button>
                  <button class="playground-control playground-control--close" type="button" data-playground-close>Demo beenden <span aria-hidden="true">×</span></button>
                </div>
              </header>
              <div class="playground-player__frame" data-playground-frame></div>
              <div class="playground-player__feedback">
                <p id="playground-player-status" role="status" aria-live="polite" aria-atomic="true" data-playground-status>Die Demo startet erst mit deinem Klick.</p>
                <button class="playground-control" type="button" data-playground-retry hidden>Erneut laden <span aria-hidden="true">↻</span></button>
              </div>
            </div>
          </dialog>
        </div>

        <div class="playground-below">
          <p id="playground-demo-note">Die Mechanikdemo läuft in <strong>30-facher Zeitlupe und ohne Ton.</strong> Motorsound und Tuning findest du in der ganzen Motorwerkstatt. Dort startest du den Motor mit einem eigenen Klick.</p>
          <a class="playground-text-link playground-text-link--light" href="${LOCAL_DEMO}" target="_blank" rel="noopener noreferrer">Mechanikdemo in eigener Ansicht <span aria-hidden="true">↗</span></a>
        </div>
        <noscript><p class="playground-no-script">Du kannst die Demo über „Mechanikdemo in eigener Ansicht“ öffnen. Die ganze Motorwerkstatt ist ebenfalls über den Link oben erreichbar.</p></noscript>

        <div class="playground-updates" aria-labelledby="playground-updates-title">
          <div class="playground-updates__copy">
            <p class="playground-updates__label">Für die Neugier danach</p>
            <h3 id="playground-updates-title">Neue Experimente<br>zuerst entdecken.</h3>
            <p>Wenn du gelegentlich von neuen Experimenten hören möchtest, frag mich nach Updates. Freiwillig – du kannst die Demo direkt ohne E-Mail ausprobieren.</p>
            <a class="playground-updates__direct" href="mailto:${UPDATE_ADDRESS}?subject=Updates%20zum%20Engine%20Playground&amp;body=Hallo%20Adrien%2C%0A%0Aich%20m%C3%B6chte%20gelegentlich%20per%20E-Mail%20von%20neuen%20Engine-Playground-Experimenten%20h%C3%B6ren.%0A%0AViele%20Gr%C3%BC%C3%9Fe">Updates direkt per E-Mail anfragen <span aria-hidden="true">↗</span></a>
          </div>
          <form class="playground-updates__form" data-playground-updates hidden>
            <label for="playground-update-email">Deine E-Mail-Adresse</label>
            <input id="playground-update-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required placeholder="du@beispiel.de" aria-describedby="playground-update-note">
            <button class="playground-update-button" type="submit">Updates per E-Mail anfragen <span aria-hidden="true">↗</span></button>
            <p class="playground-form-note" id="playground-update-note">Du erhältst eine vorbereitete Anfrage, die du selbst über dein Mailprogramm absendest. Hier wird deine Adresse nicht gespeichert. <a href="/datenschutz.html">Datenschutzhinweise</a></p>
            <div class="playground-request" data-playground-request hidden>
              <h4 tabindex="-1" data-playground-request-title>Deine vorbereitete Anfrage</h4>
              <p>An: <a href="mailto:${UPDATE_ADDRESS}">${UPDATE_ADDRESS}</a></p>
              <label for="playground-update-message">Nachrichtentext</label>
              <textarea id="playground-update-message" data-playground-message readonly rows="7"></textarea>
              <div class="playground-request__actions">
                <a class="playground-update-button" data-playground-mail>Im Mailprogramm öffnen <span aria-hidden="true">↗</span></a>
                <button class="playground-copy-button" type="button" data-playground-copy>Text kopieren</button>
              </div>
            </div>
            <p class="playground-request-status" data-playground-request-status role="status" aria-live="polite" aria-atomic="true"></p>
          </form>
        </div>
      </div>
    </section>`
}

let activeDispose: (() => void) | undefined

export function initPlaygroundAccess(): { dispose(): void } {
  activeDispose?.()
  const root = document.querySelector<HTMLElement>('#motor-demo.playground-experience')
  if (!root) return { dispose() {} }

  const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!
  const start = find<HTMLButtonElement>('[data-playground-start]')
  const preview = find<HTMLElement>('[data-playground-preview]')
  const player = find<HTMLDialogElement>('[data-playground-player]')
  const surface = find<HTMLElement>('[data-playground-surface]')
  const frameHost = find<HTMLElement>('[data-playground-frame]')
  const expand = find<HTMLButtonElement>('[data-playground-expand]')
  const fullscreen = find<HTMLButtonElement>('[data-playground-fullscreen]')
  const close = find<HTMLButtonElement>('[data-playground-close]')
  const retry = find<HTMLButtonElement>('[data-playground-retry]')
  const status = find<HTMLElement>('[data-playground-status]')
  const controller = new AbortController()
  const { signal } = controller
  let frame: HTMLIFrameElement | null = null
  let phase: 'idle' | 'loading' | 'ready' | 'error' = 'idle'
  let frameKeyDocument: Document | null = null
  let expanded = false
  let disposed = false
  let sentActivation = false
  let slowTimer: ReturnType<typeof setTimeout> | undefined
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let previousBodyOverflow: string | undefined
  let previousRootOverflow: string | undefined

  const setStatus = (text: string, state = '') => {
    status.textContent = text
    status.dataset.state = state
  }
  const clearTimers = () => {
    clearTimeout(slowTimer)
    clearTimeout(retryTimer)
    slowTimer = undefined
    retryTimer = undefined
  }
  const messageDemo = (type: string) => frame?.contentWindow?.postMessage({ type }, location.origin)
  const pauseDemo = () => {
    if (frame) messageDemo('nexara:engine:pause')
  }
  const lockPage = () => {
    if (previousBodyOverflow !== undefined) return
    previousBodyOverflow = document.body.style.overflow
    previousRootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  }
  const unlockPage = () => {
    if (previousBodyOverflow === undefined) return
    document.body.style.overflow = previousBodyOverflow
    document.documentElement.style.overflow = previousRootOverflow ?? ''
    previousBodyOverflow = undefined
    previousRootOverflow = undefined
  }
  const updatePlayerControls = () => {
    expand.hidden = expanded
    fullscreen.hidden = !expanded || !document.fullscreenEnabled || typeof surface.requestFullscreen !== 'function'
    close.innerHTML = expanded ? 'Zurück zur Seite <span aria-hidden="true">×</span>' : 'Demo beenden <span aria-hidden="true">×</span>'
    fullscreen.innerHTML = document.fullscreenElement === surface ? 'Vollbild beenden <span aria-hidden="true">⤡</span>' : 'Vollbild <span aria-hidden="true">⤢</span>'
  }
  const leaveFullscreen = async () => {
    if (document.fullscreenElement === surface) {
      try { await document.exitFullscreen() } catch { /* The dialog remains usable if the browser has already left fullscreen. */ }
    }
  }
  const collapsePlayer = async () => {
    await leaveFullscreen()
    if (disposed || !expanded) return
    expanded = false
    player.classList.remove('is-expanded')
    player.removeAttribute('aria-modal')
    player.close()
    if (frame) player.show()
    unlockPage()
    updatePlayerControls()
    expand.focus({ preventScroll: true })
  }
  const expandPlayer = () => {
    if (!frame || expanded || disposed) return
    expanded = true
    player.close()
    player.classList.add('is-expanded')
    player.setAttribute('aria-modal', 'true')
    player.showModal()
    lockPage()
    updatePlayerControls()
    close.focus({ preventScroll: true })
  }
  const handleFrameEscape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.isComposing || event.defaultPrevented || !expanded || disposed) return
    // The first Escape belongs to the browser while native fullscreen is active.
    // A later Escape can then leave the large dialog without ending the demo.
    if (document.fullscreenElement || frameKeyDocument?.fullscreenElement) return
    event.preventDefault()
    event.stopPropagation()
    void collapsePlayer()
  }
  const detachFrameKeys = () => {
    frameKeyDocument?.removeEventListener('keydown', handleFrameEscape, true)
    frameKeyDocument = null
  }
  const bindFrameKeys = () => {
    detachFrameKeys()
    if (!frame || disposed) return
    try {
      frameKeyDocument = frame.contentDocument
      frameKeyDocument?.addEventListener('keydown', handleFrameEscape, true)
    } catch {
      // A navigated cross-origin document is not inspected; the visible exit remains.
      frameKeyDocument = null
    }
  }
  const handleFrameLoad = (event: Event) => {
    if (event.currentTarget === frame) bindFrameKeys()
  }
  const releaseFrame = () => {
    detachFrameKeys()
    frame?.removeEventListener('load', handleFrameLoad)
    frame?.remove()
    frame = null
  }
  const stopDemo = () => {
    pauseDemo()
    clearTimers()
    releaseFrame()
    phase = 'idle'
    sentActivation = false
    expanded = false
    player.classList.remove('is-expanded')
    player.removeAttribute('aria-modal')
    player.close()
    unlockPage()
    preview.hidden = false
    retry.hidden = true
    updatePlayerControls()
    setStatus('Die Demo startet erst mit deinem Klick.')
  }
  const beginDemo = () => {
    if (disposed || (frame && phase !== 'error')) return
    clearTimers()
    releaseFrame()
    frame = document.createElement('iframe')
    phase = 'loading'
    sentActivation = false
    retry.hidden = true
    frame.src = LOCAL_DEMO
    frame.title = 'Engine Playground: Mechanikdemo mit Start, Drehzahlregler und drehbarer 3D-Ansicht'
    frame.setAttribute('allow', 'fullscreen')
    frame.allowFullscreen = true
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin')
    frame.referrerPolicy = 'same-origin'
    frame.loading = 'eager'
    frame.addEventListener('load', handleFrameLoad)
    preview.hidden = true
    frameHost.replaceChildren(frame)
    bindFrameKeys()
    if (!player.open) player.show()
    setStatus('Die 3D-Ansicht wird geladen. Beim ersten Öffnen kann das etwas dauern.', 'loading')
    updatePlayerControls()
    frame.focus({ preventScroll: true })
    slowTimer = setTimeout(() => {
      if (phase === 'loading') setStatus('Die 3D-Daten werden noch vorbereitet. Beim ersten Öffnen kann das länger dauern. Lass die Ansicht offen oder öffne die Mechanikdemo in einer eigenen Ansicht.', 'loading')
    }, 12000)
    retryTimer = setTimeout(() => {
      if (phase === 'loading') {
        retry.hidden = false
        setStatus('Die Ansicht ist noch nicht bereit. Du kannst weiter warten, sie erneut laden oder die Mechanikdemo in einer eigenen Ansicht öffnen.', 'loading')
      }
    }, 45000)
  }

  start.disabled = false
  start.addEventListener('click', beginDemo, { signal })
  expand.addEventListener('click', expandPlayer, { signal })
  close.addEventListener('click', () => {
    if (expanded) void collapsePlayer()
    else { stopDemo(); start.focus({ preventScroll: true }) }
  }, { signal })
  retry.addEventListener('click', () => {
    phase = 'error'
    beginDemo()
  }, { signal })
  fullscreen.addEventListener('click', async () => {
    if (disposed || !expanded || !player.open) return
    if (document.fullscreenElement === surface) { await leaveFullscreen(); return }
    try {
      await surface.requestFullscreen()
      if (disposed || !expanded) await leaveFullscreen()
    } catch {
      if (!disposed && expanded) setStatus('Die große Ansicht bleibt geöffnet. Dein Browser hat den zusätzlichen Vollbildmodus nicht freigegeben.')
    }
  }, { signal })
  document.addEventListener('fullscreenchange', updatePlayerControls, { signal })
  player.addEventListener('cancel', event => {
    event.preventDefault()
    if (document.fullscreenElement) return
    if (expanded) void collapsePlayer()
    else { stopDemo(); start.focus({ preventScroll: true }) }
  }, { signal })
  player.addEventListener('click', event => {
    if (!expanded || event.target !== player) return
    const bounds = player.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) void collapsePlayer()
  }, { signal })
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || !frame || event.source !== frame.contentWindow || !event.data || typeof event.data !== 'object') return
    if (event.data.type === 'nexara:engine:ready' && !sentActivation) {
      sentActivation = true
      messageDemo('nexara:engine:activate')
      setStatus('Die Originalbauteile werden vorbereitet. Beim ersten Start kann das etwas dauern.', 'loading')
    } else if (event.data.type === 'nexara:engine:loaded') {
      clearTimers()
      phase = 'ready'
      retry.hidden = true
      setStatus('Bereit. Verändere die Drehzahl, halte die Bewegung an und zieh die Ansicht zum Drehen.', 'ready')
    } else if (event.data.type === 'nexara:engine:error') {
      clearTimers()
      phase = 'error'
      retry.hidden = false
      setStatus('Die 3D-Ansicht konnte nicht starten. Lade sie erneut oder öffne die Mechanikdemo in einer eigenen Ansicht.', 'error')
    }
  }, { signal })
  // The demo already suspends drawing with its own visibility/intersection observers
  // and resumes without changing the visitor's Start/Stop choice. Its pause message
  // means a hard Stop, so reserve that message for ending/disposal instead.

  const form = find<HTMLFormElement>('[data-playground-updates]')
  const email = find<HTMLInputElement>('#playground-update-email')
  const request = find<HTMLElement>('[data-playground-request]')
  const requestTitle = find<HTMLElement>('[data-playground-request-title]')
  const requestStatus = find<HTMLElement>('[data-playground-request-status]')
  const message = find<HTMLTextAreaElement>('[data-playground-message]')
  const mail = find<HTMLAnchorElement>('[data-playground-mail]')
  const copy = find<HTMLButtonElement>('[data-playground-copy]')
  let preparedMessage = ''
  let copyRevision = 0
  const invalidateRequest = () => {
    copyRevision++
    preparedMessage = ''
    message.value = ''
    request.hidden = true
    mail.removeAttribute('href')
    requestStatus.textContent = ''
    email.setCustomValidity('')
  }
  email.addEventListener('input', invalidateRequest, { signal })
  form.addEventListener('submit', event => {
    event.preventDefault()
    email.value = email.value.trim()
    email.setCustomValidity(email.value.length > 254 ? 'Bitte verwende eine E-Mail-Adresse mit höchstens 254 Zeichen.' : '')
    if (!form.reportValidity()) return
    const subject = 'Updates zum Engine Playground'
    const body = `Hallo Adrien,\n\nich möchte gelegentlich per E-Mail von neuen Engine-Playground-Experimenten hören.\n\nMeine E-Mail-Adresse: ${email.value}\n\nBitte melde dich bei mir, wenn es etwas Neues gibt.\n\nViele Grüße`
    preparedMessage = `An: ${UPDATE_ADDRESS}\nBetreff: ${subject}\n\n${body}`
    message.value = body
    mail.href = `mailto:${UPDATE_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    request.hidden = false
    requestStatus.textContent = 'Anfrage vorbereitet. Öffne dein Mailprogramm und sende die Nachricht selbst ab. Sie wurde hier weder verschickt noch gespeichert.'
    requestTitle.focus({ preventScroll: true })
    request.scrollIntoView({ block: 'nearest', behavior: 'auto' })
  }, { signal })
  copy.addEventListener('click', async () => {
    if (!preparedMessage) return
    const revision = ++copyRevision
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(preparedMessage)
      if (revision !== copyRevision || disposed) return
      requestStatus.textContent = 'Anfrage kopiert. Füge sie in eine E-Mail an a.wottke@nexara-ai.de ein und sende sie selbst ab.'
    } catch {
      if (revision !== copyRevision || disposed) return
      message.focus()
      message.select()
      requestStatus.textContent = 'Der Nachrichtentext ist markiert. Kopiere ihn und sende ihn selbst an a.wottke@nexara-ai.de.'
    }
  }, { signal })
  form.hidden = false

  const dispose = () => {
    if (disposed) return
    disposed = true
    controller.abort()
    form.hidden = true
    void leaveFullscreen()
    stopDemo()
    invalidateRequest()
    start.disabled = true
    if (activeDispose === dispose) activeDispose = undefined
  }
  activeDispose = dispose
  return { dispose }
}
