import './assistant-widget.css'

type AssistantTopic = {
  label: string
  question: string
  answer: string
  link: { label: string; href: string }
}

const assistantTopics: AssistantTopic[] = [
  {
    label: 'Google & Maps',
    question: 'Wie kann mein Betrieb bei Google und Maps sichtbar werden?',
    answer: 'Ein Google-Unternehmensprofil ist bei Google kostenlos. Vollständige, korrekte Angaben, passende Leistungen, eigene Bilder und aktuelle Informationen helfen Menschen, deinen Betrieb zu verstehen und zu kontaktieren. Nexara kann dich bei der Einrichtung und Pflege unterstützen; diese Arbeit ist eine eigene Leistung. Eine bestimmte Platzierung oder mehr Anfragen kann ich dir nicht garantieren.',
    link: { label: 'Über meinen Betrieb sprechen', href: '/websites#anfrage' },
  },
  {
    label: 'Website & Anfragen',
    question: 'Wie hilft mir eine Website dabei, Anfragen zu bekommen?',
    answer: 'Eine gute Website erklärt dein Angebot, zeigt passende Arbeiten und macht den nächsten Schritt einfach. Ein definierter Anfrage-Assistent kann häufige Fragen sofort beantworten und Angaben zum Vorhaben sammeln, auch wenn du gerade nicht erreichbar bist. Was der Assistent beantworten darf und wie die Anfrage zu dir gelangt, legen wir vorher fest. Hier kannst du beispielhafte Antworten ausprobieren; diese Demo nimmt keine echten Anfragen entgegen.',
    link: { label: 'Meine Website besprechen', href: '/websites#anfrage' },
  },
  {
    label: 'Bewertungen',
    question: 'Wie kann ich ehrliche Google-Bewertungen bekommen?',
    answer: 'Bitte Kunden nach einer echten Erfahrung freundlich und neutral um ihre ehrliche Bewertung. Ein direkter Bewertungslink oder QR-Code macht es ihnen einfacher. Keine Gutscheine oder anderen Anreize, keine gekauften Bewertungen und keine Vorauswahl nur zufriedener Kunden. Ich kann dir helfen, den passenden Link und einen verständlichen Ablauf dafür einzurichten.',
    link: { label: 'Bewertungsablauf besprechen', href: '/websites#anfrage' },
  },
  {
    label: 'Abos 79 / 149 €',
    question: 'Was ist in den beiden Website-Abos vorgesehen?',
    answer: 'Im aktuellen Angebotsentwurf steht Basis für eine Standardwebsite und die Grundlage deines Google-Unternehmensprofils ab 79 € pro Monat. Individuell startet ab 149 € pro Monat mit einer individuellen Website, einem definierten Anfrage-Assistenten und passenden Automatisierungen. Beide Monatspreise sind brutto inklusive 19 % Umsatzsteuer. Einrichtung nach Umfang, genaue Leistungen und Nutzungsgrenzen werden im persönlichen Angebot festgelegt. Die Konditionen sind noch ein Entwurf.',
    link: { label: 'Passendes Angebot anfragen', href: '/websites#anfrage' },
  },
  {
    label: 'Betrieb eintragen',
    question: 'Wie kommt mein Betrieb ins regionale Verzeichnis?',
    answer: 'Der Basiseintrag im Nexara-Verzeichnis ist kostenlos und unabhängig von einem Website-Abo. Trage deinen Betrieb, den Ort und eine kurze Beschreibung des Angebots ein. Das Formular bereitet eine E-Mail vor, die du selbst prüfst und sendest. Vor einer Veröffentlichung melde ich mich bei dir. Eine eigene Website ist keine Voraussetzung; bestimmte Google-Platzierungen oder zusätzliche Aufträge werden nicht zugesagt.',
    link: { label: 'Kostenlosen Eintrag vorbereiten', href: '/verzeichnis/eintragen/' },
  },
]

function createAssistantElement<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const node = document.createElement(tag)
  node.className = className
  if (text) node.textContent = text
  return node
}

function mountAssistant() {
  if (document.querySelector('[data-no-assistant]') || document.querySelector('#nexara-assistant')) return
  const widget = createAssistantElement('aside', 'nexara-assistant')
  widget.id = 'nexara-assistant'
  widget.setAttribute('aria-label', 'Nexara-Fragen als interaktive Demo')
  const launcher = createAssistantElement('button', 'na-launcher')
  launcher.type = 'button'
  launcher.setAttribute('aria-controls', 'nexara-assistant-panel')
  launcher.setAttribute('aria-expanded', 'false')
  launcher.setAttribute('aria-haspopup', 'dialog')
  launcher.setAttribute('aria-label', 'Frag Nexara - Demo öffnen')
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('aria-hidden', 'true')
  const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  outline.setAttribute('d', 'M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0Z M7 10h8 M7 14h5')
  icon.append(outline)
  const launcherText = createAssistantElement('span', 'na-launcher__text', 'Frag Nexara')
  const demoLabel = createAssistantElement('span', 'na-launcher__demo', 'Demo')
  launcher.append(icon, launcherText, demoLabel)

  const panel = createAssistantElement('section', 'na-panel')
  panel.id = 'nexara-assistant-panel'
  panel.hidden = true
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-modal', 'false')
  panel.setAttribute('aria-labelledby', 'nexara-assistant-title')
  panel.setAttribute('aria-describedby', 'nexara-assistant-description')
  const header = createAssistantElement('header', 'na-header')
  const headingGroup = createAssistantElement('div', 'na-header__copy')
  const title = createAssistantElement('h2', '', 'Frag Nexara')
  title.id = 'nexara-assistant-title'
  const description = createAssistantElement('p', '', 'Demo · beispielhafte Antworten')
  description.id = 'nexara-assistant-description'
  headingGroup.append(title, description)
  const close = createAssistantElement('button', 'na-close', '×')
  close.type = 'button'
  close.setAttribute('aria-label', 'Nexara-Demo schließen')
  header.append(headingGroup, close)

  const log = createAssistantElement('ol', 'na-log')
  log.setAttribute('aria-label', 'Beispielgespräch mit Nexara')
  log.setAttribute('role', 'log')
  log.setAttribute('aria-live', 'polite')
  log.setAttribute('aria-relevant', 'additions')
  const introText = 'Hallo! Ich bin eine interaktive Demo. Wähle ein Thema und probiere aus, wie ein Assistent Fragen zu deinem Betrieb beantworten könnte.'
  function greeting() {
    const item = createAssistantElement('li', 'na-message na-message--answer')
    item.append(createAssistantElement('span', 'na-message__speaker', 'Nexara-Demo'), createAssistantElement('p', '', introText))
    log.append(item)
  }
  greeting()

  const topicArea = createAssistantElement('div', 'na-topics')
  topicArea.setAttribute('role', 'group')
  topicArea.setAttribute('aria-label', 'Eine Beispielfrage auswählen')
  assistantTopics.forEach(topic => {
    const topicButton = createAssistantElement('button', 'na-topic', topic.label)
    topicButton.type = 'button'
    topicButton.addEventListener('click', () => {
      const question = createAssistantElement('li', 'na-message na-message--question')
      question.append(createAssistantElement('span', 'na-message__speaker', 'Deine Beispielfrage'), createAssistantElement('p', '', topic.question))
      const answer = createAssistantElement('li', 'na-message na-message--answer')
      const link = createAssistantElement('a', 'na-message__link', topic.link.label)
      link.href = topic.link.href
      answer.append(createAssistantElement('span', 'na-message__speaker', 'Nexara-Demo'), createAssistantElement('p', '', topic.answer), link)
      log.append(question, answer)
      // Keep the demo small even after many repeated clicks.
      while (log.children.length > 13) log.firstElementChild?.remove()
      log.scrollTo({ top: log.scrollHeight, behavior: 'auto' })
    })
    topicArea.append(topicButton)
  })
  const footer = createAssistantElement('footer', 'na-footer')
  const privacy = createAssistantElement('p', '', 'Vordefinierte Beispiele. Kein Live-Chat. Es wird nichts versendet oder gespeichert.')
  const reset = createAssistantElement('button', 'na-reset', 'Neu starten')
  reset.type = 'button'
  reset.addEventListener('click', () => {
    log.replaceChildren()
    greeting()
    log.scrollTop = 0
    topicArea.querySelector('button')?.focus()
  })
  footer.append(privacy, reset)
  panel.append(header, log, topicArea, footer)
  widget.append(panel, launcher)
  document.body.append(widget)

  function setOpen(open: boolean) {
    panel.hidden = !open
    launcher.setAttribute('aria-expanded', String(open))
    launcher.setAttribute('aria-label', open ? 'Nexara-Demo schließen' : 'Frag Nexara - Demo öffnen')
    launcherText.textContent = open ? 'Demo schließen' : 'Frag Nexara'
    if (open) close.focus({ preventScroll: true })
    else launcher.focus({ preventScroll: true })
  }
  launcher.addEventListener('click', () => setOpen(panel.hidden))
  close.addEventListener('click', () => setOpen(false))
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden && !document.querySelector('dialog[open]')) {
      event.preventDefault()
      setOpen(false)
    }
  })
}

mountAssistant()
