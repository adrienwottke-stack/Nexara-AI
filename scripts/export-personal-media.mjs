import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ffmpeg from 'ffmpeg-static'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = path.join(root, 'public/media/personal')
mkdirSync(output, { recursive: true })

function exportImage(source, filename, filter, quality = '88') {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-vf', filter, '-frames:v', '1', '-c:v', 'libwebp', '-quality', quality, '-compression_level', '6', path.join(output, filename)], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || `Could not export ${filename}`)
  console.log(filename)
}

for (const variant of ['a', 'b']) {
  const original = path.join(root, `assets/brand-r1/hero-${variant}.png`)
  exportImage(original, `hero-${variant}.webp`, 'scale=1440:-1:flags=lanczos')
  exportImage(original, `hero-${variant}-768.webp`, 'scale=768:-1:flags=lanczos')
}
exportImage(path.join(root, 'assets/brand-r1/editorial-work.png'), 'editorial-work.webp', 'scale=840:-1:flags=lanczos')
exportImage(path.join(root, 'assets/brand-r1/editorial-work.png'), 'editorial-detail.webp', 'crop=850:1046:0:1260,scale=520:-1:flags=lanczos')
exportImage(path.join(root, 'public/adrien.jpg'), 'portrait-original.webp', 'scale=640:-1:flags=lanczos')

// Project media is copied once from the inspected original evidence; no synthetic project screenshots.
const engine = process.argv[2]
const garage = process.argv[3]
if (engine) exportImage(engine, 'engine-playground.webp', 'crop=938:640:342:126,scale=1000:-1:flags=lanczos')
if (garage) exportImage(garage, 'e39-garage.webp', 'crop=3200:2160:320:0,scale=1100:-1:flags=lanczos')
