// Zentrale Inhalte - hier Zahlen, Projekte und Links anpassen.

// Belegbare Standards statt Kundenergebnisse - jede Zahl ist überprüfbar.
export const stats = [
  { value: 100, suffix: '%', label: 'Custom Code - keine Baukästen' },
  { value: 95, suffix: '+', label: 'Lighthouse-Score bei Launch' },
  { value: 1, prefix: '<', suffix: 's', label: 'Ladezeit als Standard' },
  { value: 10, suffix: '+', label: 'Websites gebaut & gelauncht' },
] as const

export const pillars = [
  {
    num: '01',
    title: 'STRATEGIE',
    text: 'Positionierung, Story und Struktur, damit KMU wie Premium-Marken wirken - bevor die erste Zeile Code entsteht.',
  },
  {
    num: '02',
    title: 'DESIGN',
    text: 'Cineastische, hoch konvertierende Layouts mit modernen Animationen und Micro-Interactions, die Besucher zu Kunden machen.',
  },
  {
    num: '03',
    title: 'BUILD',
    text: 'Schnelle, wartbare Builds mit modernen Stacks - Next.js, Tailwind und ein Automations-First-Ansatz mit KI im Workflow.',
  },
] as const

// Fiktive Use-Case-Studies: „Das könnten wir mit deiner Website machen."
// Ehrlich als fiktiv deklariert - Szenario, Maßnahme und Ziel statt erfundener Kundenergebnisse.
export type UseCase = {
  sector: string
  statement: string
  situation: string
  move: string
  goal: string
  archetype: string
  variant: 'restaurant' | 'service' | 'consulting' | 'shop'
}

export const useCases: UseCase[] = [
  {
    sector: 'Lokaler Dienstleister',
    statement: 'Vom Anruf-Chaos zur Online-Buchung',
    situation: 'Anfragen kommen per Telefon, Zettel und WhatsApp - und gehen genau dort verloren.',
    move: 'Klare Angebotsseiten, lokales SEO und eine Terminstrecke, die auch nachts verkauft.',
    goal: 'Planbare Anfragen ohne Telefonstress.',
    archetype: 'Der lokale Dienstleister',
    variant: 'service',
  },
  {
    sector: 'Restaurant & Bar',
    statement: 'Vom Portal-Diktat zur eigenen Bühne',
    situation: 'Gäste kommen über Portale - die kassieren Provision und besitzen deine Gästedaten.',
    move: 'Cineastische Menü-Bühne, Storytelling und Reservierung direkt auf deiner Website.',
    goal: 'Direktreservierungen statt Provisionen.',
    archetype: 'Das Restaurant',
    variant: 'restaurant',
  },
  {
    sector: 'Beratung',
    statement: 'Von austauschbar zu unverwechselbar',
    situation: 'Die Expertise ist da - aber der Auftritt sieht aus wie jede zweite Kanzlei.',
    move: 'Premium-Positionierung, Case-Struktur und ein Erstgespräch-Funnel mit Kalender.',
    goal: 'Qualifizierte Anfragen statt Kaltakquise.',
    archetype: 'Die Beratung',
    variant: 'consulting',
  },
  {
    sector: 'Online-Shop',
    statement: 'Produktbühne statt Katalog',
    situation: 'Gute Produkte - aber der Shop fühlt sich an wie ein Lagerregal.',
    move: 'Editorial Commerce: Marken-Story, Produktinszenierung, Micro-Interactions bis in den Checkout.',
    goal: 'Warenkörbe, die sich nach Marke anfühlen.',
    archetype: 'Der Online-Shop',
    variant: 'shop',
  },
]

export const marqueeItems = [
  'Restaurants',
  'Handwerk',
  'Kanzleien',
  'E-Commerce',
  'Coaches',
  'Lokale Services',
  'Immobilien',
  'SaaS',
]
