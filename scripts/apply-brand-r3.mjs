import { readFileSync, writeFileSync } from 'node:fs'

const current = readFileSync('index.html', 'utf8')
const pick = (pattern, name) => {
  const match = current.match(pattern)
  if (!match) throw new Error(`Missing preserved section: ${name}`)
  return match[0]
}
const projects = pick(/<section class="projects-section shell"[\s\S]*?<\/section>/, 'projects')
  .replace('Websites. Software. Technik. Eigene Wege.', 'Eigene Ideen. Unterschiedliche Wege.')
  .replace('Websites, Systeme und eigene Experimente. Klick dich durch.', 'Vom Motor bis zur Website: Ich entwickle mit KI, probiere aus und baue weiter. Hier siehst du, was daraus entsteht.')
  .replace('8 Projekte · mehrere Ansichten zum Durchblättern', 'Arbeiten und Entwicklungsansichten zum Entdecken')
const service = pick(/<section class="service-section"[\s\S]*?<\/section>/, 'services')
const local = pick(/<section class="local-section shell"[\s\S]*?<\/section>/, 'directory teaser')
const closer = pick(/<section class="cinematic-closer"[\s\S]*?<\/section>/, 'closer')
const lightbox = pick(/<dialog class="project-lightbox"[\s\S]*?<\/dialog>/, 'lightbox')
const footer = pick(/<footer class="page-footer"[\s\S]*?<\/footer>/, 'footer')

const html = `<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Adrien Wottke — Mit KI Ideen entwickeln.</title>
  <meta name="description" content="Ich bin Adrien. Ich entwickle mit KI Websites, Software und digitale Experimente. Entdecke meine Projekte, spiele den Engine Playground und lerne den Menschen dahinter kennen." />
  <meta name="theme-color" content="#F4F3EB" /><link rel="canonical" href="https://nexara-ai.de/" /><link rel="icon" type="image/svg+xml" href="/aw.svg" />
  <link rel="preload" as="image" href="/media/personal/hero-a.webp" fetchpriority="high" />
  <meta property="og:title" content="Adrien Wottke — Mit KI Ideen entwickeln." /><meta property="og:description" content="Websites, Software und interaktive Technik. Eigene Ideen, echte Versuche und etwas zum Ausprobieren." /><meta property="og:type" content="website" /><meta property="og:url" content="https://nexara-ai.de/" /><meta property="og:image" content="https://nexara-ai.de/og-personal.jpg" /><meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Adrien Wottke","url":"https://nexara-ai.de/","image":"https://nexara-ai.de/adrien.jpg","description":"Maschinenbaustudent an der TU Dresden mit eigenen Projekten in Websites, KI und interaktiver Technik.","sameAs":["https://www.linkedin.com/in/adrien-wottke-03a4872b5/"]}</script>
</head>
<body class="home-page brand-home">
  <a class="skip-link" href="#inhalt">Zum Inhalt</a>
  <header class="site-top brand-header" id="brand-header"><div class="shell">
    <a class="home-brand" href="#top" aria-label="Adrien Wottke, zum Anfang"><span class="brand-firstname">ADRIEN</span><strong>WOTTKE<span>.</span></strong></a>
    <a class="brand-aw" href="#top" aria-label="Zum Anfang"><svg viewBox="0 0 58 42" aria-hidden="true"><path d="m5 33 12-25 9 25M11 24h12M27 9l5 24 8-16 5 16 8-25" /></svg></a>
    <div class="brand-header-actions"><a class="brand-header-cta" href="/websites.html">Deine Website <span aria-hidden="true">↗</span></a>
      <details class="brand-navigation" id="brand-navigation"><summary aria-label="Navigation öffnen oder schließen" aria-controls="brand-menu"><span></span><span></span></summary>
        <div class="brand-menu" id="brand-menu" role="dialog" aria-modal="true" aria-label="Navigation">
          <div class="brand-menu-gallery" aria-hidden="true"><figure><img src="/media/personal/portrait-original.webp" alt="" loading="lazy" /></figure><figure><img src="/media/projects/engine-section.png" alt="" loading="lazy" /></figure><figure><img src="/media/projects/garage-overview.jpg" alt="" loading="lazy" /></figure><figure><img src="/media/personal/editorial-work.webp" alt="" loading="lazy" /></figure></div>
          <nav class="brand-menu-links" aria-label="Hauptnavigation"><a href="#mein-weg"><span>Mein Weg</span></a><a href="#projekte"><span>Projekte</span></a><a href="#motor-demo"><span>Spiel den Motor</span></a><a href="#websites"><span>Websites</span></a><a href="#kontakt"><span>Kontakt</span></a><a class="brand-menu-small" href="/verzeichnis.html">Aus der Region ↗</a></nav>
          <p class="brand-menu-foot">Adrien Wottke. Neugierig auf das, was möglich wird.</p>
        </div>
      </details>
    </div>
  </div></header>
  <div id="spatial-experience" aria-hidden="true"></div>
  <main id="inhalt">
    <section class="cinematic-hero brand-hero" id="top" aria-labelledby="hero-title">
      <div class="cinematic-stage">
        <svg class="brand-contours" viewBox="0 0 1400 900" preserveAspectRatio="none" aria-hidden="true"><g fill="none"><path d="M-90 550C160 100 380 810 650 300S980-80 1490 360"/><path d="M-60 620C190 170 430 890 700 360S1030-10 1540 430"/><path d="M-130 470C100 20 320 730 590 220S920-160 1430 280"/><path d="M-120 720C290 290 500 980 890 510S1250 180 1520 660"/></g></svg>
        <div class="brand-hero-fallback"><img src="/media/personal/hero-a.webp" width="1440" height="1800" alt="Porträt von Adrien Wottke" fetchpriority="high" /></div>
        <video id="hero-film" class="brand-orbit-film" muted playsinline preload="none" poster="/media/cinematic/orbit-poster.webp" data-src="/media/cinematic/orbit.mp4" aria-label="Inszenierter Porträtfilm von Adrien"></video>
        <h1 id="hero-title" class="sr-only">Adrien Wottke. Ich entwickle mit KI Websites, Software und digitale Experimente.</h1>
        <div class="brand-hero-copy"><p>Ich entwickle mit KI.</p><p>Websites. Software.<br />Und Ideen, die ich ausprobieren will.</p></div>
        <div class="brand-hero-target" id="hero-focus-target" aria-hidden="true"></div>
        <div class="brand-textbands" aria-hidden="true"><div class="brand-textband"><span>NEUGIER WIRD ZU IDEEN. NEUGIER WIRD ZU IDEEN.</span></div><div class="brand-textband brand-textband--reverse"><span>IDEEN WERDEN ZU PROJEKTEN. IDEEN WERDEN ZU PROJEKTEN.</span></div></div>
        <svg class="brand-hero-sign" viewBox="0 0 220 120" aria-hidden="true"><path d="m16 94 58-78 7 76 43-78-5 79 28-54 14 55 44-78M39 72l127-12" /></svg>
        <div class="cinematic-utilities"><a href="#mein-weg">Ein Stück meines Weges <span aria-hidden="true">↓</span></a><span class="brand-spatial-hint">Mit Neugier. Und mit KI.</span><button class="film-play" type="button" data-play-film="hero-film" aria-label="Porträtfilm abspielen">Porträtfilm ansehen</button></div>
      </div>
    </section>
    <div id="brand-journey-mount"><section id="mein-weg" class="shell personal-section"><figure class="personal-photo"><img src="/media/personal/portrait-original.webp" alt="Adrien Wottke" width="640" height="800" /></figure><div><h2 class="section-heading">Neugier im Kopf.<br /><em>Und gerne am Bauen.</em></h2><p>Ich studiere Maschinenbau an der TU Dresden. Durch Formula Student habe ich erlebt, wie aus Theorie etwas wird, das man gemeinsam baut. Mit KI entwickle ich eigene digitale Ideen weiter.</p></div></section></div>
    <div id="brand-worlds-mount"><div class="shell brand-worlds-fallback"><a href="#projekte">Was ich entwickle ↗</a><a href="#mein-weg">Was mich antreibt ↗</a></div></div>
    <section class="brand-flight" id="projekt-einstieg" aria-labelledby="flight-title"><div class="brand-flight-stage"><div class="brand-flight-heading"><p>Eigene Ideen. Echte Versuche.</p><h2 id="flight-title">AUS EINER IDEE.<br /><em>ETWAS ZUM AUSPROBIEREN.</em></h2></div><div class="brand-project-target" id="project-flight-target"><img src="/media/projects/engine-section.png" width="1280" height="800" alt="Schnittansicht aus meinem Engine Playground" loading="lazy" /></div><div class="brand-flight-caption"><p>Engine Playground<br /><span>Ein Motor als interaktives Lernprojekt.</span></p><a href="#motor-demo" class="brand-inline-link">Jetzt selbst ausprobieren <span aria-hidden="true">↗</span></a></div></div></section>
    ${projects}
    <div id="playground-mount"><section id="motor-demo" class="shell engine-fallback"><h2 class="section-heading">Nicht nur anschauen.<br /><em>Selbst anwerfen.</em></h2><p>Starte den Motor, ändere die Drehzahl und schau ins Innere.</p><a class="button" href="https://engine.2.29.52.190.sslip.io/?workshop=automation#mechanics" target="_blank" rel="noopener noreferrer">Engine Playground spielen ↗</a></section></div>
    <div id="brand-fan-mount"></div>
    ${service}
    ${local}
    ${closer}
  </main>
  <div class="brand-footer-sign"><a href="#top" aria-label="Adrien Wottke, zurück zum Anfang">ADRIEN <em>WOTTKE.</em><span aria-hidden="true">↑</span></a><a href="https://www.linkedin.com/in/adrien-wottke-03a4872b5/" target="_blank" rel="noopener noreferrer">Mein Weg auf LinkedIn ↗</a></div>
  ${footer}
  ${lightbox}
  <script type="module" src="/src/studio.ts"></script>
</body>
</html>
`
writeFileSync('index.html', html)
console.log('Personal brand composition integrated; business pages preserved.')
