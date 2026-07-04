/**
 * Asset-Pipeline: MP4-Clips → scrubbare WebP-Frame-Sequenzen + Ambient-Loops.
 *
 *   assets/raw/hero-orbit.mp4  → public/frames/hero/0001.webp …  (Scroll-Scrub Hero)
 *   assets/raw/the-closer.mp4  → public/frames/closer/0001.webp … (Scroll-Scrub Finale)
 *   assets/raw/the-builder.mp4 → public/media/builder.mp4  (Palindrom-Loop, Pillars-BG)
 *   assets/raw/the-creator.mp4 → public/media/creator.mp4  (Palindrom-Loop, Work-BG)
 *
 * Aufruf: npm run frames
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpeg from 'ffmpeg-static'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const raw = (f) => path.join(root, 'assets', 'raw', f)

const sequences = [
  { src: raw('hero-orbit.mp4'), out: path.join(root, 'public', 'frames', 'hero'), fps: 16, width: 1920, quality: 74 },
  { src: raw('the-closer.mp4'), out: path.join(root, 'public', 'frames', 'closer'), fps: 15, width: 1600, quality: 72 },
]

const loops = [
  { src: raw('the-builder.mp4'), out: path.join(root, 'public', 'media', 'builder.mp4') },
  { src: raw('the-creator.mp4'), out: path.join(root, 'public', 'media', 'creator.mp4') },
]

const run = (args) => execFileSync(ffmpeg, args, { stdio: ['ignore', 'inherit', 'inherit'] })

for (const seq of sequences) {
  if (!existsSync(seq.src)) {
    console.log(`⏭  ${path.basename(seq.src)} fehlt — übersprungen`)
    continue
  }
  rmSync(seq.out, { recursive: true, force: true })
  mkdirSync(seq.out, { recursive: true })
  console.log(`🎞  ${path.basename(seq.src)} → ${seq.out}`)
  run([
    '-i', seq.src,
    '-vf', `fps=${seq.fps},scale=${seq.width}:-2:flags=lanczos`,
    '-c:v', 'libwebp',
    '-quality', String(seq.quality),
    '-compression_level', '5',
    '-y',
    path.join(seq.out, '%04d.webp'),
  ])
  const count = readdirSync(seq.out).filter((f) => f.endsWith('.webp')).length
  writeFileSync(path.join(seq.out, 'manifest.json'), JSON.stringify({ count, fps: seq.fps }))
  console.log(`   ✓ ${count} Frames + manifest.json`)
}

for (const loop of loops) {
  if (!existsSync(loop.src)) {
    console.log(`⏭  ${path.basename(loop.src)} fehlt — übersprungen`)
    continue
  }
  mkdirSync(path.dirname(loop.out), { recursive: true })
  console.log(`🔁  ${path.basename(loop.src)} → Palindrom-Loop`)
  try {
    run([
      '-i', loop.src,
      '-filter_complex', '[0:v]scale=1600:-2:flags=lanczos,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]',
      '-map', '[v]',
      '-an',
      '-c:v', 'libx264',
      '-crf', '24',
      '-preset', 'medium',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-y',
      loop.out,
    ])
  } catch {
    console.log('   ⚠ Palindrom fehlgeschlagen — normaler Loop als Fallback')
    run([
      '-i', loop.src,
      '-vf', 'scale=1600:-2:flags=lanczos',
      '-an',
      '-c:v', 'libx264',
      '-crf', '24',
      '-preset', 'medium',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-y',
      loop.out,
    ])
  }
  console.log('   ✓ fertig')
}

console.log('\nAsset-Pipeline abgeschlossen.')
