import { EngineThree } from 'engine-playground-original';
import { copyConfig } from 'engine-playground-model';
import { createPedalDrive } from './pedal';

// Only the geometry and existing crank-slider rendering are reused here.
// The native simulator, bridge, audio and thermodynamic models are not started.
export async function startEngineDemo() {
  const host = document.querySelector<HTMLElement>('#engine-host')!;
  const demo = document.querySelector<HTMLElement>('.demo')!;
  const status = document.querySelector<HTMLElement>('#engine-status')!;
  const run = document.querySelector<HTMLButtonElement>('#run-engine')!;
  const runLabel = document.querySelector<HTMLElement>('#run-label')!;
  const symbol = document.querySelector<HTMLElement>('.run-symbol')!;
  const rpm = document.querySelector<HTMLInputElement>('#engine-rpm')!;
  const output = document.querySelector<HTMLOutputElement>('#rpm-value')!;
  const section = document.querySelector<HTMLButtonElement>('#view-section')!;
  const piston = document.querySelector<HTMLButtonElement>('#view-piston')!;
  const reset = document.querySelector<HTMLButtonElement>('#reset-camera')!;
  const cfg = copyConfig();
  const state = { rpm: 0, ignition: false, pedal: 0, actualThrottle: 0, source: 'nexara-qualitative-browser-demo' };
  const engine = await EngineThree.create(host, () => ({ state, cfg }), { deferCompilation: true });
  try {
    for (const medium of ['air', 'fuel', 'exhaust', 'water', 'oil'] as const) engine.setMode(medium, 'off');
    engine.setPresentation('cutaway');
    engine.setLimiterFlames(false);
    engine.view('section');
    engine.renderer.domElement.setAttribute('aria-label', 'Interaktive Original-Motorbaugruppe mit sechs bewegten Kolben, Pleueln und Kurbelwelle. Pfeiltasten drehen, Plus und Minus zoomen, Pos1 setzt die Kamera zurück.');
    engine.renderer.domElement.setAttribute('aria-describedby', 'speed-note');
    await engine.renderer.compileAsync(engine.scene, engine.camera);
  } catch (error) {
    engine.dispose();
    throw error;
  }

  let running = true;
  let angle = 1.1;
  let lastAt = performance.now();
  let raf = 0;
  let activityUntil = 0;
  let visible = true;
  let disposed = false;
  let component: 'engine' | 'piston' = 'engine';
  const slowdown = 30;
  const drive = createPedalDrive(rpm, output);

  function updateControls() {
    demo.dataset.running = String(running);
    run.setAttribute('aria-pressed', String(running));
    runLabel.textContent = running ? 'Motor anhalten' : 'Motor starten';
    symbol.textContent = running ? 'Ⅱ' : '▶';
    status.textContent = component === 'piston' ? 'Kolben im Detail' : running ? 'Mechanik in Bewegung' : 'Mechanik angehalten';
    section.setAttribute('aria-pressed', String(component === 'engine'));
    piston.setAttribute('aria-pressed', String(component === 'piston'));
    rpm.disabled = component === 'piston';
    run.disabled = component === 'piston';
  }
  function canRender() { return !disposed && visible && !document.hidden; }
  function requestFrame() {
    if (!raf && canRender()) raf = requestAnimationFrame(frame);
  }
  function frame(now: number) {
    raf = 0;
    if (!canRender()) return;
    const dt = Math.min(.05, Math.max(0, (now - lastAt) / 1000));
    lastAt = now;
    const feedback = drive.tick(dt, running && component === 'engine');
    state.rpm = feedback.rpm;
    state.pedal = state.actualThrottle = feedback.throttle;
    state.ignition = running && component === 'engine';
    demo.dataset.actualRpm = String(Math.round(state.rpm));
    demo.dataset.throttle = String(feedback.throttle);
    // A selected rpm controls the real crank/piston geometry. Thirty-fold slow
    // motion keeps that mechanism legible; it is not measured engine telemetry.
    if (state.rpm) angle += dt * state.rpm * Math.PI * 2 / 60 / slowdown;
    engine.render(state, cfg, angle, now / 1000, angle);
    demo.dataset.angle = String(angle);
    demo.dataset.requestedRpm = rpm.value;
    if (running && component === 'engine' || state.rpm > 5 || now < activityUntil) requestFrame();
  }
  function poke() { activityUntil = performance.now() + 200; requestFrame(); }
  engine.controls.addEventListener('change', poke);
  run.addEventListener('click', () => { running = !running; if (!running) drive.reset(); lastAt = performance.now(); updateControls(); poke(); });
  rpm.addEventListener('input', poke);
  function show(next: 'engine' | 'piston') {
    component = next;
    drive.reset();
    engine.setComponent(next);
    if (next === 'engine') { engine.setPresentation('cutaway'); engine.view('section'); }
    else engine.resetCamera();
    engine.renderer.domElement.setAttribute('aria-label', next === 'engine' ? 'Interaktive Motorbaugruppe mit sechs bewegten Kolben, Pleueln und Kurbelwelle. Pfeiltasten drehen und Plus oder Minus zoomen.' : 'Drehbare Original-Kolbenbaugruppe mit Ringpaket und Bolzen. Pfeiltasten drehen und Plus oder Minus zoomen.');
    lastAt = performance.now();
    updateControls();
    poke();
  }
  section.addEventListener('click', () => show('engine'));
  piston.addEventListener('click', () => show('piston'));
  reset.addEventListener('click', () => { engine.resetCamera(); poke(); });
  host.addEventListener('pointerdown', poke);
  host.addEventListener('wheel', poke, { passive: true });
  host.addEventListener('keydown', poke);
  const visibilityChanged = () => { lastAt = performance.now(); if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else poke(); };
  document.addEventListener('visibilitychange', visibilityChanged);
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; lastAt = performance.now(); if (visible) poke(); else { cancelAnimationFrame(raf); raf = 0; } });
  observer.observe(host);
  const resize = new ResizeObserver(poke);
  resize.observe(host);
  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    observer.disconnect();
    resize.disconnect();
    document.removeEventListener('visibilitychange', visibilityChanged);
    engine.dispose();
    drive.dispose();
  }
  window.addEventListener('pagehide', event => { if (!event.persisted) dispose(); });
  window.addEventListener('message', event => {
    if (event.source !== window.parent || event.origin !== location.origin) return;
    if (event.data?.type === 'nexara:engine:pause') { running = false; updateControls(); poke(); }
  });
  for (const control of [run, rpm, section, piston, reset]) control.disabled = false;
  document.querySelector<HTMLElement>('#stage-hint')!.hidden = false;
  (window as any).engineDemo = { snapshot: () => ({ running, requestedRpm: Number(rpm.value), angle, slowdown, component, diagnostics: engine.diagnostics() }) };
  updateControls();
  poke();
  if (window.parent !== window) window.parent.postMessage({ type: 'nexara:engine:loaded' }, location.origin);
}
