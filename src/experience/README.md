# Räumliche Personal-Brand-Szene · 03.11.2026

Dieses Modul ist eine eigene Implementierung im isolierten Worktree. Es übernimmt keine Modelle, Texturen, Shaderquellen oder Vektoranimationsdateien von Lando Norris.

## Schnittstelle

`createExperience(host, { portraitUrl, projectUrl, rangerEnabled?, onReady, onError })` lädt die beiden eigenen Bildressourcen und erstellt einen Controller mit `update`, `resize` und `dispose`. `update` erhält `heroProgress`, `flightProgress`, `visible` und optional `heroTarget`/`projectTarget` als Rechtecke relativ zur Bühne. Die Bühne ist eine Bildschirmhöhe groß. Es werden keine Scrollereignisse und kein weiterer Scroller eingerichtet.

`rangerEnabled: true` ergänzt einen vollständig aus Code gebauten grünen Helm. Es wird kein drittes Bild geladen. `update({ ..., rangerAmount: 0 })` zeigt das Originalporträt mit lokaler, fließender Helmenthüllung durch Mausbewegung beziehungsweise eine zurückhaltende Eingabe nach einer Ruhezeit. `rangerAmount: 1` enthüllt den ganzen Helm; Zwischenwerte und die Rückkehr werden zeitlich geglättet. Eine frei gerenderte Kopfansicht oder ein Anzugwechsel gehören nicht zu diesem Modul.

`projectTarget` wird erst übergeben, wenn die Flugsektion tatsächlich relevant ist. Fehlt es, bleibt das Flugobjekt verborgen. Der Controller stellt seinen eigenen Renderloop bei unsichtbarer Szene, verborgenem Dokument oder reduzierter Bewegung ab. `onReady` kommt erst nach Ressourcen und einem tatsächlich gezeichneten Frame. Ressourcen- oder Kontextfehler entfernen die räumliche Ebene über `onError`; die Integration erhält den vorhandenen HTML-/Posterzustand.

## Tatsächliche Technik

- Eigenes, prozedural modelliertes Browser-/Projektfenster mit extrudierter, abgeschrägter Geometrie, matter Rückseite, Materialkanten, kleiner Lime-Kante und eigener gezeichneter AW-Markierung.
- Eigene PerspectiveCamera und zwei verbundene kubische Bézier-Segmente. Rotation und Maßstab folgen demselben Fortschritt; Rückwärtslauf setzt dieselben Zustände zurück. Das Objekt endet vor der großen HTML-Projektansicht und blendet dort aus.
- Separate Porträt-Renderfläche und optionale transparente Helm-Renderfläche; anschließende Komposition in das vom Layout gelieferte Zielrechteck.
- Eigenes prozedurales Helmmodell mit verjüngter grüner Schale, gekrümmtem schwarzem Visier, unterschiedlich großen weißen Zähnen, heller facettierter Mund-/Kinnplatte, Nase, Lippen und rotem Stirndetail. Die Materialien werden von eigenen Szenenlichtern beleuchtet. Es gibt keine heruntergeladenen Modelle, Markenlogos, HDRIs oder Bildtexturen am Helm.
- GPU-Maske mit Geschwindigkeitsadvektion, Divergenz, sieben Druckiterationsschritten, Gradientenprojektion und advektierter/diffundierter Dichte. Sie dient einem visuellen Reveal, keiner validierten physikalischen Strömungssimulation.
- Mausimpulse und eine automatische langsame Eingabe nach einer Ruhezeit. Die Maske darf auch den Kopf vollständig erreichen; der Helm wird über seine eigene Alpha-Silhouette gegen das Originalporträt geblendet.
- Eigenes zeitabhängiges Noise-Konturenfeld und abgestimmter Farbwechsel.

Das Projektbild wird ausschließlich im fliegenden Projektfenster verwendet. Im Hero gibt es keine Motor- oder Projektbildmischung im Gesicht oder Hintergrund. Die Verwandlung ist eine lokale Überblendung zwischen Foto und beleuchteter Helmgeometrie, keine physikalische Umformung des Gesichts. Die Registrierung ist auf `hero-a.webp` abgestimmt und übernimmt dessen kleine Pointer-Drehung; bei einem anders zugeschnittenen Porträt müssen Mittelpunkt und Maßstab neu geprüft werden.

## Porträt-Tiefe: ausdrücklich eine handgeführte Studie

Die Vertices der Porträtfläche werden durch selbst gesetzte Funktionen für Kopf, Haare, Nase, Wangen, Hals, Oberkörper und Hände räumlich verschoben. Die Parameter orientieren sich am vorhandenen Bildaufbau. **Das ist keine aus dem Foto errechnete Tiefenkarte, kein Scan und kein trainiertes Tiefenmodell.** Die Fläche erhält echte unterschiedliche Z-Werte; sie ist daher auch nicht bloß eine gedrehte flache Ebene. Eine spätere, sauber ausgerichtete und geprüfte Depthmap kann diese Materialstudie ersetzen.

## Leistung und Abbau

Die Maske läuft intern mit 128 beziehungsweise 192 Pixeln pro Seite. Wo verfügbar werden Half-Float-Ziele verwendet; ansonsten gibt es einen gepackten 8-Bit-Pfad. Die Pixeldichte wird begrenzt und bei anhaltend langsamen gemessenen Frameabständen weiter reduziert. Das ist eine automatische Qualitätsanpassung, keine Aussage über gesicherte FPS auf physischen Geräten.

`dispose` entfernt Listener, beendet den Renderloop und gibt Geometrien, Materialien, Texturen, RenderTargets und den Renderer einschließlich des optionalen Helmmodells frei. Fehlerpfade lösen denselben idempotenten Abbau aus. Medienabfrage und Tab-Sichtbarkeit werden zur Laufzeit berücksichtigt.

## Prüfung

Die TypeScript-Prüfung des Worktrees war nach der ursprünglichen Implementierung sowie nach Ergänzung und Modellpolitur des Helms erfolgreich (`npx tsc --noEmit`). Die Integration hat für die erste Helmversion eine tatsächlich laufende Desktopdarstellung ohne GPU-Fehler und mit vollständig enthülltem, registriertem Helm gemeldet. Die anschließende Modellpolitur und die mobile Darstellung werden von der Integration separat visuell geprüft. Dieser technische Stand ist keine visuelle Nutzerabnahme.

Beim abschließenden Eigenreview wurden die RAF-Planung nach adaptiver Größenänderung, einmaliges Leeren beim Verlassen des Viewports und ein Kontextverlust während ausstehender Bildladungen korrigiert. Größe und Pixeldichte werden nach der asynchronen Ladung erneut abgeglichen. Die beiden Flugbahnsegmente besitzen am Übergang die gleiche Ableitung im gemeinsamen Fortschrittsraum; damit entsteht dort kein abrupter Richtungswechsel. Die Integration hat bereits einen tatsächlich laufenden Hero ohne GPU-Fehler gemeldet; die Flugsequenz wird separat visuell geprüft.
