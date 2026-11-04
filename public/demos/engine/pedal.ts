/** Qualitative browser throttle and optional synthesized feedback, no native telemetry. */
export function createPedalDrive(rpm: HTMLInputElement, output: HTMLOutputElement) {
  const pedal = document.querySelector<HTMLButtonElement>('#gas-pedal')!;
  const sound = document.querySelector<HTMLButtonElement>('#demo-sound')!;
  const load = document.querySelector<HTMLElement>('#engine-load')!;
  let held = false, actual = 850, throttle = 0;
  let audio: AudioContext | undefined, gain: GainNode | undefined;
  let oscillator: OscillatorNode | undefined, harmonic: OscillatorNode | undefined;
  let audible = false;
  const setHeld = (value: boolean) => {
    held = value;
    pedal.setAttribute('aria-pressed', String(value));
    pedal.textContent = value ? 'Gas loslassen ↓' : 'Gas geben ↑';
  };
  pedal.addEventListener('pointerdown', event => {
    if (event.button !== 0 || pedal.disabled) return;
    pedal.setPointerCapture(event.pointerId); setHeld(true);
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) pedal.addEventListener(name, () => setHeld(false));
  // Keyboard / assistive activation toggles; pointer users hold the pedal.
  pedal.addEventListener('click', event => { if (event.detail === 0) setHeld(!held); });
  const release = () => { setHeld(false); rpm.value = '0'; };
  window.addEventListener('blur', release);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { release(); void audio?.suspend(); } });
  sound.addEventListener('click', async () => {
    try {
      if (!audio) {
        audio = new AudioContext();
        gain = audio.createGain(); gain.gain.value = 0;
        const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 650;
        oscillator = audio.createOscillator(); oscillator.type = 'sawtooth';
        harmonic = audio.createOscillator(); harmonic.type = 'triangle';
        oscillator.connect(filter); harmonic.connect(filter); filter.connect(gain); gain.connect(audio.destination);
        oscillator.start(); harmonic.start();
      }
      await audio.resume(); audible = !audible;
      sound.textContent = audible ? 'Demo-Sound aus' : 'Demo-Sound an';
      sound.setAttribute('aria-pressed', String(audible));
    } catch { sound.textContent = 'Sound nicht verfügbar'; sound.disabled = true; }
  });
  return {
    reset: release,
    tick(dt: number, running: boolean) {
      if (!running) setHeld(false);
      const targetThrottle = running ? (held ? 1 : Number(rpm.value) / 100) : 0;
      throttle += (targetThrottle - throttle) * (1 - Math.exp(-dt * 9));
      const targetRpm = running ? 850 + throttle * 5150 : 0;
      actual += (targetRpm - actual) * (1 - Math.exp(-dt * (targetRpm > actual ? 2.6 : 1.7)));
      pedal.disabled = !running;
      output.value = `${Math.round(actual).toLocaleString('de-DE')} / min`;
      load.style.setProperty('--load', String(throttle));
      load.textContent = `${Math.round(throttle * 100)} % Gas`;
      if (audio && gain && oscillator && harmonic) {
        gain.gain.setTargetAtTime(audible && running && !document.hidden ? .018 + throttle * .025 : 0, audio.currentTime, .06);
        oscillator.frequency.setTargetAtTime(Math.max(20, actual / 20), audio.currentTime, .05);
        harmonic.frequency.setTargetAtTime(Math.max(30, actual / 10), audio.currentTime, .05);
      }
      return { rpm: actual, throttle };
    },
    dispose() { window.removeEventListener('blur', release); void audio?.close(); },
  };
}
