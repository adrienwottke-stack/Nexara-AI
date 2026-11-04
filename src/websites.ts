import './commerce'
import './websites.css'
import './assistant-widget'

type DemoChoice = { label: string; action: string }
const messages = document.querySelector<HTMLDivElement>('#demo-messages')!
const options = document.querySelector<HTMLDivElement>('#demo-options')!
const initial = messages.innerHTML
let selectedPackage = 'unsure'
let selectedIndustry = ''
const packageInput = document.querySelector<HTMLSelectElement>('#inquiry-package')!
const projectInput = document.querySelector<HTMLTextAreaElement>('#inquiry-project')!
function invalidatePreview() {
  document.querySelector<HTMLElement>('#inquiry-preview')!.hidden = true
  document.querySelector('#inquiry-copy-status')!.textContent = ''
}
function message(text: string, sender: 'user' | 'assistant') {
  const bubble = document.createElement('div')
  bubble.className = `demo-message demo-message--${sender}`
  const p = document.createElement('p')
  p.textContent = text
  bubble.append(p)
  messages.append(bubble)
  messages.scrollTop = messages.scrollHeight
}
function choices(items: DemoChoice[]) {
  options.replaceChildren(...items.map(item => {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.demo = item.action
    button.textContent = item.label
    return button
  }))
}
function start() {
  messages.innerHTML = initial
  selectedPackage = 'unsure'
  selectedIndustry = ''
  choices([{label:'Was ist dabei und was kostet es?',action:'prices'},{label:'Wie werde ich bei Google sichtbar?',action:'profile'},{label:'Ich suche einen Betrieb.',action:'directory'}])
}
options.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-demo]')
  if (!button) return
  const action = button.dataset.demo
  if (action === 'directory-open') { location.href = '/verzeichnis.html'; return }
  if (action === 'contact') {
    invalidatePreview()
    packageInput.value = selectedPackage
    projectInput.value = `Ich interessiere mich für ${selectedPackage === 'standard' ? 'Standard: eine Website mit Google-Profil-Grundlage und Bewertungslink/QR-Code' : 'Advanced: eine individuelle Website mit definiertem Anfrage-Assistenten und festgelegter Übergabe'}.${selectedIndustry ? `\nMein Bereich: ${selectedIndustry}.` : ''}\nIch möchte klären, welcher Umfang zu meinem Betrieb passt und wie Einrichtung, Laufzeit und laufende Nutzungskosten aussehen.`
    location.hash = 'anfrage'
    document.querySelector<HTMLInputElement>('#inquiry-name')!.focus({preventScroll:true})
    return
  }
  message(button.textContent || '', 'user')
  if (action === 'prices') {
    message('Standard mit Website, Google-Profil-Grundlage und Bewertungslink/QR-Code startet bei 79 € brutto im Monat. Advanced mit individueller Website, definiertem Anfrage-Assistenten und festgelegter Übergabe startet bei 149 € brutto im Monat. Beide Preise enthalten 19 % MwSt. Einrichtung, Laufzeit und Nutzungsumfang stehen im individuellen Angebot; Google-Ads-Budget und laufende Ads-Betreuung sind nicht enthalten.', 'assistant')
    choices([{label:'Standard: Website & Profil',action:'standard'},{label:'Advanced: Website + Assistent',action:'advanced'}])
  } else if (action === 'profile') {
    message('Wir stimmen Website und Google-Profildaten aufeinander ab und bereiten nach deiner Autorisierung einen Bewertungslink mit QR-Code vor. Das Google-Profil selbst ist kostenlos; Nexara berechnet die vereinbarte Arbeit. Du bleibst Inhaber. Bewertungen kommen von echten Kunden, ohne Vorgabe oder Gegenleistung. Eine bestimmte Position in der Suche oder auf Maps lässt sich nicht versprechen.', 'assistant')
    choices([{label:'Website & Profil besprechen',action:'standard'},{label:'Erst die Abos ansehen',action:'prices'}])
  } else if (action === 'requests' || action === 'advanced' || action === 'standard') {
    selectedPackage = action === 'standard' ? 'standard' : 'advanced'
    message('Damit die Lösung passt: In welchem Bereich bist du unterwegs?', 'assistant')
    choices([{label:'Handwerk & Service',action:'industry'},{label:'Beratung & Gesundheit',action:'industry'},{label:'Kreatives & etwas anderes',action:'industry'}])
  } else if (action === 'industry') {
    selectedIndustry = button.textContent || ''
    message(selectedPackage === 'advanced' ? 'Im echten Einsatz fragt dein Assistent die vereinbarten Details ab und bereitet die festgelegte Übergabe an deinen Betrieb vor. Du kannst deine Auswahl jetzt in eine Anfrage an Adrien übernehmen.' : 'Dann schauen wir gemeinsam auf deine Website, dein Google-Profil und den Kontaktweg für deine Kunden. Du kannst deine Auswahl jetzt in eine Anfrage an Adrien übernehmen.', 'assistant')
    choices([{label:'Auswahl in meine Anfrage übernehmen',action:'contact'},{label:'Noch mal die Preise ansehen',action:'prices'}])
  } else if (action === 'directory') {
    message('Für Brösa, Malschwitz und die Bautzen-Region entsteht gerade ein kostenloses Verzeichnis. Dort kannst du nach Leistungen suchen oder deinen eigenen Betrieb vorstellen.', 'assistant')
    choices([{label:'Zum regionalen Verzeichnis',action:'directory-open'},{label:'Zurück zu den Websites',action:'prices'}])
  }
  options.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true})
})
document.querySelector('#demo-reset')!.addEventListener('click', () => {
  start()
  options.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true})
})

document.querySelectorAll<HTMLButtonElement>('[data-work-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.workFilter
  let count = 0
  document.querySelectorAll<HTMLElement>('[data-work]').forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.work !== filter
    if (!card.hidden) count++
  })
  document.querySelectorAll('[data-work-filter]').forEach(el => el.setAttribute('aria-pressed', String(el === button)))
  document.querySelector('#work-filter-status')!.textContent = `${count} ${count === 1 ? 'Arbeit' : 'Arbeiten'} · ${filter === 'website' ? 'Websiteprojekte' : filter === 'own' ? 'eigene Entwicklungsansichten' : 'Websiteprojekte und eigene Entwicklungsansichten'}`
}))
document.querySelectorAll<HTMLAnchorElement>('[data-package]').forEach(link => link.addEventListener('click', () => {
  invalidatePreview()
  packageInput.value = link.dataset.package!
}))

const form = document.querySelector<HTMLFormElement>('#inquiry-form')!
let preparedBody = ''
form.addEventListener('submit', event => {
  event.preventDefault()
  if (!form.reportValidity()) return
  const data = new FormData(form)
  const subject = 'Website-Anfrage über Nexara'
  preparedBody = `Hallo Adrien,\n\nich möchte über meine Website sprechen.\n\nName: ${String(data.get('name')).trim()}\nBetrieb: ${String(data.get('company')).trim() || 'nicht angegeben'}\nE-Mail: ${data.get('email')}\nInteresse: ${packageInput.selectedOptions[0].textContent}\n\nMein Vorhaben:\n${String(data.get('project')).trim()}\n\nViele Grüße\n${String(data.get('name')).trim()}`
  document.querySelector('#inquiry-preview-text')!.textContent = `An: a.wottke@nexara-ai.de\nBetreff: ${subject}\n\n${preparedBody}`
  document.querySelector<HTMLAnchorElement>('#inquiry-mail-link')!.href = `mailto:a.wottke@nexara-ai.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(preparedBody)}`
  const preview = document.querySelector<HTMLElement>('#inquiry-preview')!
  preview.hidden = false
  document.querySelector('#inquiry-copy-status')!.textContent = ''
  preview.focus()
})
form.addEventListener('input', invalidatePreview)
document.querySelector('#inquiry-copy')!.addEventListener('click', async () => {
  const status = document.querySelector('#inquiry-copy-status')!
  try {
    await navigator.clipboard.writeText(document.querySelector('#inquiry-preview-text')!.textContent || preparedBody)
    status.textContent = 'Anfrage kopiert. Du kannst sie in deine E-Mail einfügen.'
  } catch {
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(document.querySelector('#inquiry-preview-text')!)
    selection?.removeAllRanges()
    selection?.addRange(range)
    status.textContent = 'Der Text ist markiert. Kopiere ihn mit Strg+C oder der Kopieren-Funktion deines Geräts.'
  }
})
document.querySelector<HTMLButtonElement>('#inquiry-prepare')!.disabled = false
