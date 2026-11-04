const button = document.querySelector('#load-engine');
const note = document.querySelector('#load-note');
const status = document.querySelector('#engine-status');
let loading = false;
let loaded = false;

async function activate() {
  if (loading || loaded) return;
  loading = true;
  button.disabled = true;
  button.textContent = '3D-Motor wird geladen …';
  status.textContent = '3D-Daten werden geladen';
  note.textContent = 'Die Originalbauteile werden vorbereitet. Beim ersten Start kann das kurz dauern.';
  try {
    const { startEngineDemo } = await import('./engine.js');
    await startEngineDemo();
    loaded = true;
    document.querySelector('#load-cover').hidden = true;
  } catch (error) {
    console.error('Engine Playground demo:', error);
    status.textContent = '3D-Ansicht nicht verfügbar';
    button.disabled = false;
    button.textContent = 'Noch einmal versuchen';
    note.textContent = 'Die 3D-Ansicht konnte nicht starten. Prüfe, ob dein Browser WebGL 2 unterstützt und Hardwarebeschleunigung aktiviert ist.';
    document.querySelector('#engine-host').replaceChildren();
    if (window.parent !== window) window.parent.postMessage({ type: 'nexara:engine:error', message: 'Die 3D-Ansicht konnte nicht gestartet werden.' }, location.origin);
  } finally {
    loading = false;
  }
}
button.addEventListener('click', activate);

// A parent may activate the demo only after the visitor's explicit play action.
// The parent and iframe must share an origin. No automatic loading on arrival.
window.addEventListener('message', event => {
  if (event.source === window.parent && event.origin === location.origin && event.data?.type === 'nexara:engine:activate') void activate();
});
if (window.parent !== window) window.parent.postMessage({ type: 'nexara:engine:ready' }, location.origin);
