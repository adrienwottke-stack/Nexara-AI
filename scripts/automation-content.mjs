// Inhalte der Automatisierungs-Landingpages.
// Nach jeder Änderung: `npm run pages` (erzeugt automatisierung/**/index.html neu).

export const site = {
  origin: 'https://nexara-ai.de',
  // Cal.com-Termintyp "Prozess-Erstgespräch (30 Min)", Kurz-URL prozess-erstgespraech.
  // Einstellungen: sprint/05-crm/crm-prozess.md, Abschnitt Kalender.
  cal: 'https://cal.com/adrien-wottke-hogs97/prozess-erstgespraech',
  email: 'a.wottke@nexara-ai.de',
  linkedin: 'https://www.linkedin.com/in/adrien-wottke-03a4872b5/',
  place: 'Brösa bei Bautzen',
}

// Gemeinsame Bausteine für alle Seiten ------------------------------------

export const processSteps = [
  {
    name: 'Erstgespräch',
    meta: '30 Minuten · kostenlos',
    text: 'Sie erzählen, wo es hakt. Ich sage ehrlich, ob und wo Automatisierung bei Ihnen Sinn ergibt. Danach bekommen Sie eine kurze schriftliche Einschätzung.',
  },
  {
    name: 'Prozessanalyse',
    meta: 'ein halber Tag · 690 € netto',
    text: 'Vor Ort in Dresden und Bautzen oder per Video. Wir gehen die wichtigsten Abläufe Schritt für Schritt durch: Zeiten, Programme, Engpässe. Ergebnis: Prozessübersicht, Maßnahmenliste und Wirtschaftlichkeitsrechnung.',
  },
  {
    name: 'Priorisieren',
    meta: 'Festpreisangebot',
    text: 'Jede Maßnahme bewertet nach Aufwand, Nutzen und Risiko. Sie bekommen ein Festpreisangebot für die ersten Schritte und entscheiden, was umgesetzt wird.',
  },
  {
    name: 'Umsetzen',
    meta: 'meist 2 bis 6 Wochen',
    text: 'In Etappen, im laufenden Betrieb getestet, mit Einweisung für Ihr Team. Ich binde Ihre vorhandenen Programme an, statt sie zu ersetzen.',
  },
  {
    name: 'Messen und betreuen',
    meta: 'ab 149 € netto im Monat',
    text: 'Wir vergleichen die Kennzahlen mit dem Stand vorher. Auf Wunsch übernehme ich Wartung, Anpassungen und Weiterentwicklung zum monatlichen Festpreis.',
  },
]

export const prices = [
  { name: 'Erstgespräch', value: 'kostenlos', note: '30 Minuten, Video oder Telefon, mit schriftlicher Kurzeinschätzung.' },
  { name: 'Prozessanalyse', value: '690 €', note: 'Wird voll angerechnet, wenn Sie innerhalb von 60 Tagen eine Umsetzung beauftragen.' },
  { name: 'Umsetzung', value: '1.500 bis 6.000 €', note: 'Festpreis je Etappe. 50 % bei Auftrag, 50 % nach Abnahme.' },
  { name: 'Betreuung', value: 'ab 149 € / Monat', note: 'Wartung, Anpassungen, Monatsbericht mit Kennzahlen. Nach 3 Monaten monatlich kündbar.' },
]

export const guarantee =
  'Zeigt die Analyse keine Maßnahme, die ihre Kosten innerhalb von 12 Monaten wieder einspielt, berechne ich die Analyse nicht.'

export const founding =
  'Die ersten drei Unternehmen erhalten die Prozessanalyse kostenlos, wenn sie einer Fallstudie mit echten Vorher-Nachher-Zahlen zustimmen. Auf Wunsch anonym.'

// Von Adrien am 25.11.2026 bestätigt. Neue Punkte nur, wenn sie belegbar sind.
export const experience = [
  'Vertrieb und Kundenakquise im B2B-Umfeld. Ich weiß aus eigener Arbeit, wie Anfragen, Angebote und Nachfassen in der Praxis laufen.',
  'Selbst entwickelte Software für den Vertrieb, darunter ein Vertriebs-Cockpit mit Kontakten, Terminen und Teamauswertung und ein Werkzeug, das Gesprächsvorbereitungen mit Quellenangaben erstellt.',
  'Websites und Anfragewege für Betriebe in der Region.',
  'Automatisierungen mit n8n, Schnittstellen (APIs), HubSpot, Python und Supabase.',
  'Ingenieursdenken aus dem Maschinenbaustudium: erst messen, dann ändern.',
]

export const faqCommon = [
  {
    q: 'Was kostet das?',
    a: 'Das Erstgespräch ist kostenlos. Die Prozessanalyse kostet 690 € netto und wird voll angerechnet, wenn Sie innerhalb von 60 Tagen eine Umsetzung beauftragen. Umsetzungen laufen zum Festpreis je Etappe, typischerweise 1.500 bis 6.000 € netto. Betreuung gibt es ab 149 € netto im Monat. Den genauen Preis kennen Sie vor jeder Entscheidung.',
  },
  {
    q: 'Was ist, wenn sich Automatisierung bei uns nicht lohnt?',
    a: 'Dann sage ich Ihnen das, meistens schon im Erstgespräch. Und: ' + 'Zeigt die Analyse keine Maßnahme, die ihre Kosten innerhalb von 12 Monaten wieder einspielt, berechne ich die Analyse nicht.',
  },
  {
    q: 'Brauchen wir dafür neue Software?',
    a: 'Meistens nicht. Ich verbinde zuerst die Programme, die Sie schon nutzen: E-Mail, Branchensoftware, Excel, Buchhaltung. Neue Software empfehle ich nur, wenn die Rechnung dafür spricht.',
  },
  {
    q: 'Wie viel Zeit kostet uns das selbst?',
    a: '30 Minuten für das Erstgespräch. Etwa einen halben Tag für die Analyse, mit Ihnen oder der Person, die den Ablauf kennt. In der Umsetzung kurze Abstimmungen und eine Einweisung. Den Großteil der Arbeit mache ich.',
  },
  {
    q: 'Was passiert mit unseren Daten?',
    a: 'Ich arbeite mit Auftragsverarbeitungsvertrag nach DSGVO und nur mit den Zugriffen, die für den Ablauf nötig sind. Meine Automatisierungen laufen auf Servern in der EU. Welche weiteren Dienste beteiligt sind, zum Beispiel ein KI-Dienst, steht vor dem Start schriftlich im Angebot. Auf Wunsch läuft die Lösung in Ihrem eigenen Microsoft- oder Google-Konto.',
  },
  {
    q: 'Setzen Sie KI ein?',
    a: 'Wo es hilft, ja. Zum Beispiel, um E-Mails nach Anliegen zu sortieren oder Antwortentwürfe vorzubereiten. Antworten an Ihre Kunden gibt in der Regel ein Mensch frei. Vieles lässt sich aber ganz ohne KI lösen, mit klaren Regeln und Schnittstellen.',
  },
  {
    q: 'Sie sind Student. Was, wenn Sie später nicht erreichbar sind?',
    a: 'Berechtigte Frage. Deshalb dokumentiere ich jede Lösung, lege Zugänge auf Ihre Konten und nutze verbreitete Werkzeuge, mit denen auch andere Dienstleister arbeiten können. Sie sind nicht von mir abhängig.',
  },
  {
    q: 'Ersetzt das Mitarbeiter?',
    a: 'Nein. Ziel ist, dass Ihr Team weniger abtippt und mehr Zeit für Kunden, Aufträge und Objekte hat. Gerade wenn Stellen offen bleiben, ist das oft der schnellste Hebel.',
  },
  {
    q: 'Arbeiten Sie nur in Sachsen?',
    a: 'Vor Ort bin ich in Dresden, Bautzen und Umgebung. Per Video arbeite ich im ganzen deutschsprachigen Raum.',
  },
]

// Seiten -----------------------------------------------------------------

export const pages = [
  {
    slug: '',
    branch: 'andere',
    navLabel: 'Überblick',
    title: 'Prozesse automatisieren für KMU in Sachsen · Nexara',
    description:
      'Nexara findet die Abläufe, die Ihren Betrieb Zeit kosten, rechnet den Nutzen mit Ihren Zahlen durch und setzt um, was sich lohnt. Kostenloses Erstgespräch. Dresden, Bautzen, Sachsen.',
    kicker: 'Prozessberatung mit Umsetzung · Dresden · Bautzen · Sachsen',
    h1: 'Weniger abtippen.<br />Weniger nachfassen.<br /><em>Mehr Zeit für Aufträge.</em>',
    lead:
      'Ich finde mit Ihnen die Abläufe, die Ihren Betrieb jede Woche Stunden kosten, rechne den Nutzen mit Ihren eigenen Zahlen durch und setze nur um, was sich wirtschaftlich lohnt. Für kleine und mittlere Unternehmen in Sachsen und im deutschsprachigen Raum.',
    stream: {
      title: 'Eine Kundenanfrage',
      steps: [
        { today: 'Anfrage lesen und abtippen', tool: 'E-Mail, Telefon', min: 6, after: 'Formular erfasst die Anfrage vollständig', afterMin: 0 },
        { today: 'Fehlende Angaben nachfragen', tool: 'Rückruf', min: 10, after: 'Rückfrage geht automatisch raus', afterMin: 0 },
        { today: 'In Liste oder Programm übertragen', tool: 'Excel, Branchensoftware', min: 5, after: 'Vorgang wird automatisch angelegt', afterMin: 0 },
        { today: 'Angebot aus alter Vorlage bauen', tool: 'Word, Software', min: 30, after: 'Angebotsentwurf prüfen und anpassen', afterMin: 8 },
        { today: 'Nachfassen, wenn jemand daran denkt', tool: 'Kalender, Gedächtnis', min: 4, after: 'Erinnerung nach 5 Tagen', afterMin: 0 },
      ],
      waitLabel: 'Bis der Kunde ein Angebot hat',
      waitToday: '2 bis 5 Tage',
      waitAfter: 'meist am selben Tag',
    },
    problemsTitle: 'Wo die Zeit<br /><em>wirklich hingeht.</em>',
    problems: [
      { t: 'Anfragen kommen überall an.', d: 'Telefon, E-Mail, Formular, WhatsApp. Jemand sammelt, tippt ab und sortiert.' },
      { t: 'Angebote entstehen nach Feierabend.', d: 'Weil tagsüber Kunden, Baustelle oder Termine Vorrang haben.' },
      { t: 'Dieselben Fragen, jeden Tag.', d: 'Status, Unterlagen, Termine. Beantwortet von Leuten, die eigentlich etwas anderes tun sollten.' },
      { t: 'Drei Programme, zwei Excel-Listen.', d: 'Nichts ist verbunden, also wird übertragen. Mit Tippfehlern.' },
      { t: 'Nachfassen hängt am Gedächtnis.', d: 'Wer krank ist oder geht, nimmt das Wissen mit. Offene Angebote versanden.' },
      { t: 'Papier wandert über Schreibtische.', d: 'Belege, Stundenzettel, Lieferscheine. Bis sie irgendwann in der Buchhaltung ankommen.' },
    ],
    problemsOutro:
      'Meist fehlt keine neue Software. Es fehlen die Verbindungen zwischen den Programmen, die Sie schon haben. Diese Lücken füllen heute Menschen mit Abtippen.',
    examplesTitle: 'So sieht das<br /><em>konkret aus.</em>',
    examples: [
      {
        tag: 'Handwerk',
        title: 'Von der Anfrage zum Angebotsentwurf',
        today: 'Anfragen per Telefon und Mail, Fotos und Maße fehlen, das Angebot entsteht abends aus alten Vorlagen.',
        after: 'Ein Anfrageformular fragt Gewerk, Maße und Fotos ab. Der Vorgang landet in Ihrer Software. Ein Angebotsentwurf aus Ihrem Leistungskatalog liegt zur Prüfung bereit.',
        measure: 'Zeit von Anfrage bis Angebot',
      },
      {
        tag: 'Hausverwaltung',
        title: 'Mieteranfragen vorsortieren',
        today: 'Im Sammelpostfach mischen sich Schadensmeldungen, Abrechnungsfragen und Schlüsselverluste. Jede Mail wird gelesen, zugeordnet, weitergeleitet.',
        after: 'Eingehende Mails werden nach Anliegen und Objekt sortiert. Für Standardfragen liegt ein Antwortentwurf bereit. Freigeben müssen Sie nur noch.',
        measure: 'Bearbeitungszeit pro Anliegen',
      },
      {
        tag: 'Ingenieurbüro',
        title: 'Von den Stunden zur Rechnung',
        today: 'Stunden in Excel oder Zeiterfassung, Leistungsnachweise von Hand formatiert, Rechnungen separat geschrieben.',
        after: 'Stunden werden pro Projekt und Leistungsphase zusammengeführt, Leistungsnachweis und Rechnungsentwurf entstehen automatisch. Die Projektleitung prüft.',
        measure: 'Tage bis zur Rechnungsstellung',
      },
      {
        tag: 'Alle Branchen',
        title: 'Eingangsrechnungen und Belege',
        today: 'Rechnungen kommen per Mail, werden ausgedruckt oder in Ordner gezogen und gesammelt ans Steuerbüro geschickt.',
        after: 'Belege aus dem Postfach werden erkannt, sinnvoll benannt und automatisch an Ihre Buchhaltung oder das Upload-Postfach Ihres Steuerbüros übergeben.',
        measure: 'Zeit für Belegablage pro Monat',
      },
      {
        tag: 'Service und Werkstatt',
        title: 'Termine, Erinnerungen, Bewertungen',
        today: 'Termine per Telefon, Erinnerungen fehlen, Kunden erscheinen nicht. Um Bewertungen bittet niemand.',
        after: 'Terminbestätigung und Erinnerung gehen automatisch raus. Nach dem Auftrag kommt eine kurze Bitte um eine Google-Bewertung.',
        measure: 'Ausfallquote und Anzahl Bewertungen',
      },
      {
        tag: 'Personal',
        title: 'Bewerbungen nicht mehr verlieren',
        today: 'Bewerbungen aus Portalen, Mail und WhatsApp, Eingangsbestätigung vergessen, kein Überblick über den Stand.',
        after: 'Alle Bewerbungen landen in einer Übersicht mit Status. Die Eingangsbestätigung geht sofort raus, Gesprächstermine werden direkt vorgeschlagen.',
        measure: 'Zeit bis zur ersten Antwort',
      },
    ],
    calc: { hours: 6, rate: 40, share: 50 },
    faq: [],
  },

  {
    slug: 'hausverwaltung',
    branch: 'hausverwaltung',
    navLabel: 'Hausverwaltung',
    title: 'Hausverwaltung digitalisieren und automatisieren · Nexara Sachsen',
    description:
      'Weniger Zeit im Sammelpostfach: Mieteranfragen vorsortieren, Schadensmeldungen strukturieren, Belege zuordnen. Prozessanalyse für Hausverwaltungen in Dresden und Sachsen. Kostenloses Erstgespräch.',
    kicker: 'Für Haus- und Immobilienverwaltungen · Dresden · Sachsen',
    h1: 'Weniger Postfach.<br /><em>Mehr Verwaltung.</em>',
    lead:
      'Mieteranfragen, Schadensmeldungen, Eigentümerfragen: Viel davon ist Sortieren, Zuordnen und Weiterleiten. Ich finde mit Ihnen heraus, welche dieser Schritte sich automatisieren lassen, rechne den Nutzen mit Ihren Zahlen durch und binde die Lösung an Ihre Verwaltungssoftware an, statt sie zu ersetzen.',
    proof: {
      text: '70 % der Immobilienverwaltungen berichten von Überlastung, ein Drittel davon stark.',
      source: 'VDIV Branchenbarometer 2025',
      href: 'https://vdiv.de/presse/details/vdiv-deutschland-veroeffentlicht-branchenbarometer-2025-immobilienverwaltungen-zwischen-wachstum-transformation-und-fachkraeftemangel',
    },
    stream: {
      title: 'Eine Schadensmeldung',
      steps: [
        { today: 'Mail lesen, Objekt und Einheit suchen', tool: 'Postfach, Verwaltungssoftware', min: 5, after: 'Anliegen und Objekt werden erkannt', afterMin: 0 },
        { today: 'Fotos, Ort und Erreichbarkeit nachfragen', tool: 'E-Mail, Telefon', min: 10, after: 'Meldeformular fragt alles Nötige ab', afterMin: 0 },
        { today: 'Handwerker auswählen und beauftragen', tool: 'Telefon, E-Mail', min: 10, after: 'Auftragsentwurf prüfen und freigeben', afterMin: 3 },
        { today: 'Mieter und Eigentümer informieren', tool: 'E-Mail', min: 6, after: 'Statusinfo geht automatisch raus', afterMin: 0 },
        { today: 'Status nachhalten', tool: 'Liste, Gedächtnis', min: 5, after: 'Erinnerung, wenn nichts passiert', afterMin: 0 },
      ],
      waitLabel: 'Bis der Auftrag beim Handwerker ist',
      waitToday: '1 bis 3 Tage',
      waitAfter: 'am selben Tag',
    },
    problemsTitle: 'Wo in der Verwaltung<br /><em>die Zeit verschwindet.</em>',
    problems: [
      { t: 'Das Sammelpostfach als Arbeitsplatz.', d: 'Jede Mail lesen, das Objekt heraussuchen, an die richtige Person weiterleiten.' },
      { t: 'Schadensmeldungen ohne Fotos und Telefonnummer.', d: 'Bevor der Handwerker kommen kann, wird erst einmal nachgefragt.' },
      { t: 'Immer dieselben Fragen.', d: 'Nebenkostenabrechnung, Schlüssel, Kündigung, Mülltonnen. Jeden Tag neu beantwortet.' },
      { t: 'Eigentümerversammlungen.', d: 'Einladungen, Vollmachten, Unterlagen, Protokolle. Viel Kopieren und Versenden.' },
      { t: 'Dienstleisterrechnungen zuordnen.', d: 'Welches Objekt, welche Kostenart, welche Freigabe? Von Hand, Rechnung für Rechnung.' },
      { t: 'Wissen in einzelnen Köpfen.', d: 'Wenn eine Kollegin geht, weiß niemand mehr, wie es in Objekt X läuft.' },
    ],
    problemsOutro:
      'Ihre Verwaltungssoftware ist nicht das Problem. Die Lücken liegen davor und dazwischen: im Postfach, in Formularen, zwischen Software, Handwerkern und Buchhaltung.',
    examplesTitle: 'Bausteine für<br /><em>Ihre Verwaltung.</em>',
    examples: [
      {
        tag: 'Posteingang',
        title: 'Mieteranfragen vorsortieren',
        today: 'Alle Anliegen landen ungefiltert im Sammelpostfach und werden einzeln gelesen und verteilt.',
        after: 'Mails werden nach Anliegen und Objekt sortiert und der zuständigen Person zugewiesen. Für Standardfragen liegt ein Antwortentwurf bereit.',
        measure: 'Bearbeitungszeit pro Anliegen',
      },
      {
        tag: 'Instandhaltung',
        title: 'Schadensmeldung bis Handwerkerauftrag',
        today: 'Meldungen kommen unvollständig, Rückfragen kosten Tage, der Status steht in keiner Liste.',
        after: 'Ein Meldeformular fragt Fotos, Ort und Erreichbarkeit ab. Der Vorgang wird dem Objekt zugeordnet, der Auftrag an Ihren Handwerker ist vorbereitet.',
        measure: 'Tage bis zur Beauftragung',
      },
      {
        tag: 'Buchhaltung',
        title: 'Dienstleisterrechnungen zuordnen',
        today: 'Rechnungen von Hausmeister, Reinigung und Handwerk werden von Hand Objekt und Kostenart zugeordnet.',
        after: 'Rechnungen werden erkannt, Objekt und Kostenart vorgeschlagen und zur Freigabe an die zuständige Person gegeben.',
        measure: 'Zeit pro Rechnung',
      },
      {
        tag: 'WEG',
        title: 'Eigentümerversammlung vorbereiten',
        today: 'Einladungen, Tagesordnung und Unterlagen werden für jede Gemeinschaft einzeln zusammengestellt und verschickt.',
        after: 'Einladungen entstehen aus Vorlage und Eigentümerliste, Vollmachten und Rückmeldungen werden automatisch erfasst.',
        measure: 'Vorbereitungszeit pro Versammlung',
      },
      {
        tag: 'Wissen',
        title: 'Objektunterlagen durchsuchbar',
        today: 'Teilungserklärung, Verträge und Protokolle liegen in Ordnern und Köpfen.',
        after: 'Eine interne Suche beantwortet Fragen zu einem Objekt mit Quellenangabe aus Ihren eigenen Unterlagen.',
        measure: 'Suchzeit pro Rückfrage',
      },
      {
        tag: 'Vermietung',
        title: 'Interessentenanfragen bündeln',
        today: 'Dutzende Anfragen pro Wohnung, Besichtigungstermine per Mail-Pingpong.',
        after: 'Anfragen werden gesammelt, fehlende Angaben automatisch angefragt und Besichtigungstermine zur Auswahl angeboten.',
        measure: 'Aufwand pro Neuvermietung',
      },
    ],
    softwareNote:
      'Ob Domus, PowerHaus, Immoware24, Karthago, casavi oder Excel: Ich prüfe zuerst, welche Schnittstellen, Exporte und E-Mail-Importe Ihre Software bietet. Die Lösung richtet sich danach.',
    calc: { hours: 10, rate: 38, share: 40 },
    faq: [
      {
        q: 'Funktioniert das mit unserer Verwaltungssoftware?',
        a: 'Das prüfe ich in der Analyse als Erstes. Viele Programme bieten Schnittstellen, Exporte oder E-Mail-Importe. Wo das nicht geht, setze ich davor an: im Postfach, bei Formularen und in der Ablage.',
      },
      {
        q: 'Beantwortet dann eine KI unsere Mieter?',
        a: 'Nur wenn Sie das ausdrücklich wollen. Standard ist: Die Automatisierung sortiert und bereitet Antworten vor, Ihre Mitarbeiter geben frei.',
      },
      {
        q: 'Wir haben gerade wenig Luft für ein Projekt.',
        a: 'Genau deshalb beginne ich mit einem einzigen Ablauf, der schnell entlastet, meist dem Posteingang. Ihr Aufwand: ein halber Tag Analyse und kurze Abstimmungen.',
      },
    ],
  },

  {
    slug: 'handwerk',
    branch: 'handwerk',
    navLabel: 'Handwerk',
    title: 'Handwerksbetrieb digitalisieren: Büro und Angebote automatisieren · Nexara',
    description:
      'Anfragen sauber erfassen, Angebote schneller vorbereiten, Nachfassen automatisieren. Für Handwerksbetriebe in Dresden, Bautzen und Sachsen. Kostenloses Erstgespräch.',
    kicker: 'Für Handwerksbetriebe mit 5 bis 50 Mitarbeitern · Sachsen',
    h1: 'Angebote schreiben<br />nach Feierabend?<br /><em>Muss nicht sein.</em>',
    lead:
      'Anfragen per Telefon, Mail und WhatsApp, Angebote am Abend, Stundenzettel auf Papier: Ich schaue mir mit Ihnen an, wo in Ihrem Büro die meiste Zeit verloren geht, rechne den Nutzen mit Ihren Zahlen durch und automatisiere, was sich lohnt. Passend zu Ihrer vorhandenen Handwerkersoftware.',
    proof: {
      text: 'Fehlende Zeit gehört zu den größten Hürden bei der Digitalisierung im Handwerk. Deshalb ist Ihr Aufwand klein: 30 Minuten Gespräch, ein halber Tag Analyse.',
      source: 'Bitkom, Digitalisierung des Handwerks 2025',
      href: 'https://www.bitkom.org/Bitkom/Publikationen/Digitalisierung-des-Handwerks',
    },
    stream: {
      title: 'Eine Kundenanfrage',
      steps: [
        { today: 'Anruf annehmen, Notizen machen', tool: 'Telefon, Zettel', min: 6, after: 'Formular fragt Gewerk, Maße und Fotos ab', afterMin: 0 },
        { today: 'Rückruf wegen Maßen und Fotos', tool: 'Telefon, WhatsApp', min: 10, after: 'Fehlende Fotos werden automatisch angefragt', afterMin: 0 },
        { today: 'Daten in die Software übertragen', tool: 'Handwerkersoftware', min: 5, after: 'Kunde und Vorgang automatisch angelegt', afterMin: 0 },
        { today: 'Angebot aus alter Vorlage bauen', tool: 'Software, Word', min: 40, after: 'Entwurf aus Leistungskatalog prüfen', afterMin: 10 },
        { today: 'Nachfassen', tool: 'oft vergessen', min: 4, after: 'Erinnerung nach 5 Tagen', afterMin: 0 },
      ],
      waitLabel: 'Bis der Kunde ein Angebot hat',
      waitToday: '3 bis 10 Tage',
      waitAfter: '1 bis 2 Tage',
    },
    problemsTitle: 'Wo im Betrieb<br /><em>die Zeit verloren geht.</em>',
    problems: [
      { t: 'Anfragen auf allen Kanälen.', d: 'Telefon auf der Baustelle, Mail im Büro, WhatsApp auf dem Privathandy.' },
      { t: 'Angebote am Abend.', d: 'Tagsüber ist keine Zeit. Also wird es spät, und der Kunde wartet.' },
      { t: 'Maße und Fotos fehlen.', d: 'Erst Rückruf, dann Besichtigung, dann wieder Rückruf.' },
      { t: 'Stundenzettel auf Papier.', d: 'Regieberichte und Stunden werden im Büro abgetippt, Rechnungen gehen spät raus.' },
      { t: 'Offene Angebote versanden.', d: 'Niemand fasst nach, der Auftrag geht an den, der sich zuerst meldet.' },
      { t: 'Belege im Handschuhfach.', d: 'Tankquittungen, Lieferscheine, Materialrechnungen. Monatsende wird zur Suchaktion.' },
    ],
    problemsOutro:
      'Gute Handwerksbetriebe verlieren selten Aufträge wegen der Arbeit. Sie verlieren sie wegen langsamer Angebote und fehlendem Nachfassen.',
    examplesTitle: 'Bausteine für<br /><em>Ihr Büro.</em>',
    examples: [
      {
        tag: 'Anfrage',
        title: 'Von der Anfrage zum Angebotsentwurf',
        today: 'Anfragen ohne Maße und Fotos, Angebot aus alter Vorlage am Abend.',
        after: 'Ein Formular fragt Gewerk, Maße und Fotos ab. Der Vorgang landet in Ihrer Software, ein Entwurf aus Ihrem Leistungskatalog liegt bereit.',
        measure: 'Zeit von Anfrage bis Angebot',
      },
      {
        tag: 'Verkauf',
        title: 'Automatisch nachfassen',
        today: 'Offene Angebote liegen in der Software, keiner hat den Überblick.',
        after: 'Nach 5 und nach 12 Tagen geht eine freundliche, persönliche Nachfrage raus. Sie sehen täglich, welche Angebote offen sind.',
        measure: 'Angebotsquote',
      },
      {
        tag: 'Baustelle',
        title: 'Stundenzettel bis Rechnungsentwurf',
        today: 'Papierzettel, Abtippen im Büro, Rechnung zwei Wochen später.',
        after: 'Stunden und Material werden per Handy erfasst, der Rechnungsentwurf entsteht automatisch, Sie prüfen und senden.',
        measure: 'Tage bis zur Rechnung',
      },
      {
        tag: 'Termine',
        title: 'Bestätigung und Erinnerung',
        today: 'Termine per Telefon, Kunden sind nicht da, der Monteur steht vor der Tür.',
        after: 'Terminbestätigung und Erinnerung am Vortag gehen automatisch raus, Absagen landen direkt im Kalender.',
        measure: 'Ausfallquote',
      },
      {
        tag: 'Buchhaltung',
        title: 'Belege ans Steuerbüro',
        today: 'Belege werden gesammelt, gescannt und am Monatsende gesucht.',
        after: 'Foto vom Beleg reicht. Er wird benannt, sortiert und automatisch an Ihre Buchhaltung übergeben.',
        measure: 'Zeit für Belege pro Monat',
      },
      {
        tag: 'Ruf',
        title: 'Bewertungen nach dem Auftrag',
        today: 'Zufriedene Kunden schreiben selten von sich aus eine Bewertung.',
        after: 'Nach Abschluss geht eine kurze, persönliche Bitte mit direktem Link zu Ihrem Google-Profil raus.',
        measure: 'Neue Bewertungen pro Monat',
      },
    ],
    softwareNote:
      'Ob Hero, Plancraft, Craftnote, ToolTime, Label oder Excel: Ich baue auf dem auf, was Sie haben, und prüfe zuerst, welche Schnittstellen und Exporte es gibt.',
    calc: { hours: 6, rate: 45, share: 50 },
    faq: [
      {
        q: 'Wir haben schon eine Handwerkersoftware.',
        a: 'Gut, dann baue ich darauf auf. Oft fehlt nur die Verbindung: zwischen Anfrage und Software, zwischen Software und Buchhaltung oder zwischen Baustelle und Büro.',
      },
      {
        q: 'Lohnt sich das für einen kleinen Betrieb?',
        a: 'Ab etwa 3 Stunden Büroarbeit pro Woche in einem einzigen Ablauf lohnt sich das Nachrechnen. Wenn es sich nicht rechnet, sage ich das im Erstgespräch.',
      },
      {
        q: 'Meine Leute sind nicht so digital.',
        a: 'Dann muss die Lösung einfach sein: Bedienung übers Handy, wenige Felder, klare Erinnerungen. Ich weise Ihr Team ein und passe nach den ersten Wochen nach.',
      },
    ],
  },

  {
    slug: 'ingenieurbuero',
    branch: 'ingenieurbuero',
    navLabel: 'Ingenieurbüro',
    title: 'Ingenieurbüro: Abrechnung, Angebote und Projektdoku automatisieren · Nexara',
    description:
      'Für Ingenieur- und Planungsbüros: Stunden zu Rechnung, Honorarangebote vorbereiten, Projektablage ordnen. Prozessanalyse mit Ingenieurblick. Dresden und Sachsen. Kostenloses Erstgespräch.',
    kicker: 'Für Ingenieur- und Planungsbüros · Dresden · Sachsen',
    h1: 'Ingenieurzeit ist<br />zu teuer für<br /><em>Copy and Paste.</em>',
    lead:
      'Stunden zusammentragen, Leistungsnachweise formatieren, Honorarangebote aus alten Projekten zusammenbauen, Unterlagen suchen. Ich studiere Maschinenbau an der TU Dresden und schaue mir Ihre Abläufe an wie ein Ingenieur: erst messen, dann ändern.',
    stream: {
      title: 'Eine Monatsabrechnung pro Projekt',
      steps: [
        { today: 'Stunden aus der Zeiterfassung sammeln', tool: 'Excel, Zeiterfassung', min: 25, after: 'Stunden automatisch zusammengeführt', afterMin: 0 },
        { today: 'Nach Leistungsphase sortieren', tool: 'Excel', min: 20, after: 'Zuordnung nach Projekt und Phase', afterMin: 0 },
        { today: 'Leistungsnachweis formatieren', tool: 'Word, Excel', min: 25, after: 'Leistungsnachweis als PDF erzeugt', afterMin: 0 },
        { today: 'Rechnung schreiben', tool: 'Rechnungsprogramm', min: 15, after: 'Rechnungsentwurf prüfen', afterMin: 10 },
        { today: 'Versenden und ablegen', tool: 'E-Mail, Ordner', min: 5, after: 'Versand nach Freigabe, Ablage automatisch', afterMin: 0 },
      ],
      waitLabel: 'Bis die Rechnung beim Auftraggeber ist',
      waitToday: '5 bis 15 Tage nach Monatsende',
      waitAfter: '1 bis 2 Tage nach Monatsende',
    },
    problemsTitle: 'Wo Ingenieurzeit<br /><em>ins Büro abfließt.</em>',
    problems: [
      { t: 'Abrechnung bindet Projektleiter.', d: 'Stunden sammeln, sortieren, formatieren. Jeden Monat, für jedes Projekt.' },
      { t: 'Honorarangebote aus alten Dateien.', d: 'Das letzte ähnliche Projekt suchen, kopieren, anpassen, hoffen, dass nichts fehlt.' },
      { t: 'Planstände in Mail-Anhängen.', d: 'Welche Version ist aktuell? Wer hat was wann geschickt?' },
      { t: 'Nachträge gehen unter.', d: 'Änderungswünsche kommen nebenbei, werden umgesetzt und nie abgerechnet.' },
      { t: 'Projektwissen ist verstreut.', d: 'Protokolle, Vorgaben, Entscheidungen in Ordnern, Postfächern und Köpfen.' },
      { t: 'Berichte und Protokolle.', d: 'Notizen aus der Besprechung werden abends zu einem sauberen Dokument.' },
    ],
    problemsOutro:
      'Jede Stunde, die ein Ingenieur mit Formatieren und Suchen verbringt, fehlt in der Planung. Und sie lässt sich meist nicht abrechnen.',
    examplesTitle: 'Bausteine für<br /><em>Ihr Büro.</em>',
    examples: [
      {
        tag: 'Abrechnung',
        title: 'Stunden zu Leistungsnachweis und Rechnung',
        today: 'Stunden aus Excel oder Zeiterfassung werden pro Projekt von Hand aufbereitet.',
        after: 'Stunden werden pro Projekt und Leistungsphase zusammengeführt, Leistungsnachweis und Rechnungsentwurf entstehen automatisch.',
        measure: 'Tage bis zur Rechnungsstellung',
      },
      {
        tag: 'Akquise',
        title: 'Honorarangebot vorbereiten',
        today: 'Angebote entstehen aus dem letzten ähnlichen Projekt, Kennzahlen werden gesucht.',
        after: 'Aus Projektdaten und Ihren Vorlagen entsteht ein Angebotsentwurf mit Kennzahlen vergleichbarer Projekte. Die fachliche Prüfung bleibt bei Ihnen.',
        measure: 'Zeit pro Angebot',
      },
      {
        tag: 'Ablage',
        title: 'Planstände aus E-Mails ablegen',
        today: 'Planstände und Unterlagen kommen als Anhang und werden von Hand abgelegt.',
        after: 'Anhänge werden erkannt, dem Projekt zugeordnet, sinnvoll benannt und mit Versionsübersicht abgelegt.',
        measure: 'Suchzeit pro Woche',
      },
      {
        tag: 'Nachträge',
        title: 'Änderungen erfassen, Nachtrag vorbereiten',
        today: 'Änderungswünsche per Mail oder Telefon, umgesetzt, aber nicht dokumentiert.',
        after: 'Änderungen werden aus Mails und Protokollen erfasst und als Nachtragsentwurf mit Aufwand vorbereitet.',
        measure: 'Abgerechnete Nachträge',
      },
      {
        tag: 'Wissen',
        title: 'Projektunterlagen durchsuchen',
        today: 'Vorgaben und Entscheidungen sind in vielen Dokumenten verstreut.',
        after: 'Eine interne Suche beantwortet Fragen zu einem Projekt mit Quellenangabe aus Ihren eigenen Unterlagen.',
        measure: 'Suchzeit pro Rückfrage',
      },
      {
        tag: 'Dokumentation',
        title: 'Protokolle aus Besprechungsnotizen',
        today: 'Notizen werden abends zu einem Protokoll ausformuliert.',
        after: 'Aus Stichpunkten oder einer Aufnahme entsteht ein Protokollentwurf in Ihrer Vorlage, mit Aufgaben und Fristen.',
        measure: 'Zeit pro Protokoll',
      },
    ],
    softwareNote:
      'Ob Projektsoftware, AVA-Programm, Zeiterfassung oder Excel: Ich prüfe zuerst, welche Daten und Exporte vorhanden sind. Die Lösung baut darauf auf.',
    calc: { hours: 8, rate: 65, share: 50 },
    faq: [
      {
        q: 'Unsere Projektunterlagen sind vertraulich.',
        a: 'Darum arbeite ich nur mit den nötigsten Zugriffen, auf Wunsch in Ihrem eigenen Microsoft- oder Google-Konto oder auf Ihrer Infrastruktur. Welche Dienste beteiligt sind, steht vor dem Start im Angebot.',
      },
      {
        q: 'Wir rechnen nach HOAI. Geht das trotzdem?',
        a: 'Ja. Leistungsphasen, Honorarzonen und Nebenkosten folgen Regeln, und Regeln lassen sich abbilden. Die fachliche Prüfung bleibt bei Ihnen.',
      },
    ],
  },
]
