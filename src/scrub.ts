/**
 * FrameSequence - scroll-scrubbte Canvas-Frame-Sequenz.
 * Lädt WebP-Frames (manifest.json mit { count }), zeichnet cover-fit
 * und lerpt den Frame-Index für butterweiche Bewegung.
 * Ohne Frames läuft ein prozeduraler Fallback (Emerald-Orbit), damit die
 * Seite auch vor dem Asset-Export voll funktioniert.
 */
export class FrameSequence {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private frames: (HTMLImageElement | null)[] = []
  count = 0
  private target = 0
  private current = 0
  private lastDrawn = -1
  private fallback = false
  private progress = 0
  loaded = false

  onFrame?: (index: number, count: number) => void

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    this.ctx = ctx
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  /** Lädt alle Frames; onProgress bekommt 0..1. Gibt false zurück, wenn kein Manifest existiert (Fallback aktiv). */
  async load(base: string, onProgress?: (p: number) => void): Promise<boolean> {
    let count = 0
    try {
      const res = await fetch(`${base}/manifest.json`, { cache: 'no-cache' })
      if (!res.ok) throw new Error(String(res.status))
      const manifest = (await res.json()) as { count: number }
      count = manifest.count
    } catch {
      this.fallback = true
      this.loaded = true
      onProgress?.(1)
      this.drawFallback()
      return false
    }

    this.count = count
    this.frames = new Array(count).fill(null)
    let done = 0

    const loadOne = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          this.frames[i] = img
          done++
          onProgress?.(done / count)
          resolve()
        }
        img.onerror = () => {
          done++
          onProgress?.(done / count)
          resolve()
        }
        img.src = `${base}/${String(i + 1).padStart(4, '0')}.webp`
      })

    // Begrenzte Parallelität, damit der Browser nicht erstickt
    const CONCURRENCY = 10
    let next = 0
    const workers = Array.from({ length: Math.min(CONCURRENCY, count) }, async () => {
      while (next < count) {
        const i = next++
        await loadOne(i)
      }
    })
    await Promise.all(workers)

    this.loaded = true
    this.draw(0, true)
    return true
  }

  /** Scroll-Fortschritt 0..1 → Ziel-Frame */
  setProgress(p: number) {
    this.progress = Math.min(1, Math.max(0, p))
    if (this.fallback) return
    this.target = this.progress * (this.count - 1)
  }

  /** Pro Tick aufrufen (gsap.ticker) - lerpt & zeichnet nur bei Frame-Wechsel. */
  tick() {
    if (this.fallback) {
      this.drawFallback()
      return
    }
    if (!this.loaded || this.count === 0) return
    this.current += (this.target - this.current) * 0.16
    if (Math.abs(this.target - this.current) < 0.01) this.current = this.target
    const idx = Math.round(this.current)
    if (idx !== this.lastDrawn) this.draw(idx)
  }

  private draw(idx: number, force = false) {
    const img = this.frames[idx]
    if (!img) {
      if (!force) return
      // nächstes verfügbares Bild suchen
      const found = this.frames.findIndex((f) => f !== null)
      if (found === -1) return
      idx = found
    }
    const image = this.frames[idx]
    if (!image) return
    this.lastDrawn = idx
    const { width: cw, height: ch } = this.canvas
    const iw = image.naturalWidth
    const ih = image.naturalHeight
    const scale = Math.max(cw / iw, ch / ih)
    const dw = iw * scale
    const dh = ih * scale
    this.ctx.clearRect(0, 0, cw, ch)
    this.ctx.drawImage(image, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    this.onFrame?.(idx, this.count)
  }

  /** Prozeduraler Platzhalter: dunkle Bühne + rotierender Emerald-Bogen. */
  private drawFallback() {
    const { width: w, height: h } = this.canvas
    const ctx = this.ctx
    const cx = w / 2
    const cy = h / 2
    ctx.clearRect(0, 0, w, h)
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7)
    bgGrad.addColorStop(0, '#0c0f0d')
    bgGrad.addColorStop(1, '#060706')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, w, h)

    const angle = this.progress * Math.PI * 2 - Math.PI / 2
    const r = Math.min(w, h) * 0.32
    ctx.strokeStyle = 'rgba(16,185,129,0.55)'
    ctx.lineWidth = Math.max(2, w * 0.0016)
    ctx.beginPath()
    ctx.arc(cx, cy, r, angle, angle + Math.PI * 0.55)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(16,185,129,0.14)'
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = 'rgba(242,237,227,0.06)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, r * 0.42, r * 0.58, 0, 0, Math.PI * 2)
    ctx.fill()
    this.onFrame?.(Math.round(this.progress * 119), 120)
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    const { clientWidth, clientHeight } = this.canvas
    this.canvas.width = Math.round(clientWidth * dpr)
    this.canvas.height = Math.round(clientHeight * dpr)
    this.lastDrawn = -1
    if (this.fallback) this.drawFallback()
    else if (this.loaded) this.draw(Math.round(this.current), true)
  }
}
