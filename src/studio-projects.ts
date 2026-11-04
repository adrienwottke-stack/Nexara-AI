export type ProjectShot = { src: string; title: string; note: string }
export type StudioProject = { id: string; name: string; type: 'website' | 'system' | 'engineering'; label: string; description: string; detail: string; shots: ProjectShot[] }
export const studioProjects: StudioProject[] = [
  { id:'sandro', name:'Sandro Mondini', type:'website', label:'Website · Foto & Film', description:'Bilder brauchen eine Bühne, die ihnen Platz lässt.', detail:'Projektgalerien, Leistungen und ein persönlicher Auftritt für Foto und Film.', shots:[
    {src:'/media/references/sandro-website.png',title:'Der Einstieg',note:'Websiteprojekt · QA-Aufnahme vom November 2026'},
    {src:'/media/projects/sandro-project.png',title:'In ein Projekt eintauchen',note:'Projektansicht · lokale QA-Aufnahme'},
    {src:'/media/projects/sandro-services.png',title:'Leistungen verständlich zeigen',note:'Leistungsseite · lokale QA-Aufnahme'}
  ]},
  { id:'emil', name:'Emil Claus', type:'website', label:'Website · Personal Brand', description:'Ein persönlicher Auftritt mit einem direkten Weg ins Gespräch.', detail:'Große Typografie, eine persönliche Geschichte und interaktive Wege zum Kontakt.', shots:[
    {src:'/media/references/emil-website.jpg',title:'Der erste Eindruck',note:'Lokale Websiteansicht · November 2026'},
    {src:'/media/projects/emil-about.jpg',title:'Der Mensch dahinter',note:'Lokale Websiteansicht · November 2026'},
    {src:'/media/projects/emil-calculator.jpg',title:'Selbst ausprobieren',note:'Interaktiver Zinsrechner · lokale Projektansicht'}
  ]},
  { id:'burg', name:'Jakubzburg Mortka', type:'website', label:'Website · Tourismus & Erlebnisse', description:'Eine Burg, viele Angebote. Ein verständlicher Weg hindurch.', detail:'Veranstaltungen, Übernachtungen und die Burg als zusammenhängender digitaler Auftritt.', shots:[
    {src:'/media/projects/burg-home.jpg',title:'Die Burg entdecken',note:'Lokaler Websiteentwurf · November 2026'},
    {src:'/media/projects/burg-stay.jpg',title:'Eine Übernachtung finden',note:'Lokale Übernachtungsseite · November 2026'}
  ]},
  { id:'crm', name:'CRM & Jarvis', type:'system', label:'Eigenprojekt · Arbeitsabläufe & KI', description:'Kontakte, nächste Schritte und ein Assistent an einem Ort.', detail:'Teamcockpit, Kontaktverwaltung und Jarvis. Die gezeigten Oberflächen verwenden ausschließlich synthetische Demodaten.', shots:[
    {src:'/media/projects/crm-cockpit.png',title:'Das Teamcockpit',note:'Lokale Projektansicht · ausschließlich Demodaten'},
    {src:'/media/projects/crm-contacts.png',title:'Kontakte im Blick',note:'Lokale Projektansicht · ausschließlich Demodaten'},
    {src:'/media/projects/crm-jarvis.png',title:'Mit Jarvis arbeiten',note:'Assistentenansicht · ausschließlich Demodaten'}
  ]},
  { id:'engine', name:'Engine Playground', type:'engineering', label:'Eigenprojekt · Technik zum Erkunden', description:'Ein Motor ist mehr als ein schönes 3D-Modell.', detail:'Bedienung, Tuning, Drehmomentkurve, Konfigurator und Schnittansicht. Hier siehst du mehrere Entwicklungsansichten des Lernprojekts.', shots:[
    {src:'/media/projects/engine-workshop.png',title:'Bedienung & Werkstatt',note:'Gesamte Projektoberfläche · Oktober 2026 · im Bild nach unten scrollen'},
    {src:'/media/projects/engine-configurator.png',title:'Den Motor konfigurieren',note:'Konfigurator · isolierter UI-Testaufbau ohne nativen Motorlauf'},
    {src:'/media/projects/engine-section.png',title:'Ins Innere schauen',note:'3D-Schnittansicht · lokaler Testaufbau'}
  ]},
  { id:'garage', name:'Meine E39-Garage', type:'engineering', label:'Eigenprojekt · 3D & Konfiguration', description:'Mein Auto als Ausgangspunkt für eine digitale Werkstatt.', detail:'Kameraperspektiven, Anbauteile, Räder und Innenraum: Die Oberfläche gehört genauso zum Projekt wie das Fahrzeugmodell.', shots:[
    {src:'/media/projects/garage-overview.jpg',title:'Die ganze Werkstatt',note:'Lokale UI-Ansicht mit Teileauswahl · Oktober 2026'},
    {src:'/media/projects/garage-wheels.png',title:'Räder & Perspektiven',note:'Separate lokale UI-Arbeitsrunde · Oktober 2026'},
    {src:'/media/projects/garage-interior.png',title:'Innenraum & Materialien',note:'Separate lokale UI-Arbeitsrunde · Oktober 2026'}
  ]},
  { id:'booking', name:'Von der Anfrage zum Ablauf', type:'system', label:'Automatisierung · Buchungsablauf', description:'Die Arbeit hinter dem Kontaktformular mitdenken.', detail:'Dokumentierter Ablauf für Anfrageeingang, Verfügbarkeitsprüfung, Datenablage und Bestätigung.', shots:[
    {src:'/media/projects/booking-workflow.png',title:'Der Ablauf im Überblick',note:'Bereinigte Arbeitsprobe · dokumentierter Workflow, kein aktueller Produktivlauf'}
  ]}
]
