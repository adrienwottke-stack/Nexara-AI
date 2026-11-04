# Kleine Engine-Playground-Demo für Nexara

Die Demo verwendet die originale `EngineThree`-Browserkomponente, ihre vorhandene Kurbel-/Kolbenkinematik und die lokalen Kolben-, Block- und Beleuchtungsassets des Engine Playground. Die Parent-App, der native Motorprozess, die Bridge und Audio werden nicht eingebunden. Die Drehzahlvorgabe steuert den tatsächlichen Kurbelwinkel der 3D-Baugruppe in 30-facher Zeitlupe. Es wird keine kalibrierte M54-Motorphysik, Messung oder Originalklang behauptet.

`index.html` kann als eigenständige Seite oder gleichursprüngliches iframe geladen werden. Aufruf: `/demos/engine/index.html` (der Vite-Devserver löst Verzeichnis-URLs hier nicht automatisch auf). Vor dem Klick auf „Motor ausprobieren“ lädt nur die kleine HTML-/CSS-/Boot-Hülle. Es laufen noch keine Three.js-Initialisierung und keine Motoranimation. Start/Stop, Drehzahl, Orbit, Zoom und eine separate Kolbenansicht sind danach bedienbar. Eine versteckte Ansicht pausiert die Zeichenarbeit.

Optional kann ein Parent nach einer ausdrücklichen Play-Aktion auf das `nexara:engine:ready`-Ereignis antworten:

```js
iframe.contentWindow.postMessage({ type: 'nexara:engine:activate' }, location.origin);
```

Die Demo meldet anschließend `nexara:engine:loaded` oder bei einem Startfehler `nexara:engine:error` mit einer neutralen Meldung. `nexara:engine:pause` hält die Animation an. Nachrichten werden nur vom eigenen Parent und derselben Origin akzeptiert. Kein ungeprüfter externer Nachrichtensender kann die Demo starten.

Neu bauen, ohne Nexaras Package-Dateien oder das Engine-Repository zu ändern:

```powershell
node public/demos/engine/build.mjs 'C:/Users/adrie/Documents/ChatGPT/MotorSimulator/engine-playground'
```

Der Build verwendet das bereits im Originalprojekt vorhandene esbuild und three.js. Die Rohtext-Loader erhalten die Digestprüfung des originalen Geometriecaches. Alle Laufzeitassets werden nach `models/` kopiert; keine CDN-, API-, Account- oder Native-Verbindung wird benötigt. Lizenzen für Engine Playground und three.js liegen neben dem Bundle. Der umfangreiche originale Renderer wird einmal nach Nutzeraktion initialisiert; auf schwacher Grafik kann das länger dauern.

Einzige Anpassung innerhalb des übernommenen Rendererquelltexts: Im lokalen Bundle beträgt die Ladefrist für den großen Geometriecache zwölf statt 2,5 Sekunden. Die kurze Originalfrist schützt parallel laufendes natives Audio, das diese Demo nicht nutzt. Originaldateien bleiben unverändert; die Digestprüfung bleibt aktiv.

Der erste automatisierte Browsertest bestätigte reale Bewegung aller sechs Kolben, Stop-Freeze, Drehzahlsteuerung, Kamera-Orbit und 1280-/375px-Darstellung. Er meldete keine Konsolenfehler oder fehlenden Dateien, aber einen nach der alten 2,5-Sekunden-Frist abgebrochenen Cachetransfer mit korrekt funktionierendem Geometriefallback. Der Bericht in `qa/report.json` gehört zu diesem ersten Stand und bleibt ehrlich als fehlgeschlagener Gesamtcheck erhalten. Nach der dokumentierten Fristanpassung wird das finale Bundle durch den Root-Agenten über die tatsächliche iframe-UI geprüft; dieser automatisierte Test wurde danach nicht nochmals ausgeführt.
