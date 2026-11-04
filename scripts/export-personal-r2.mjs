import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import ffmpeg from 'ffmpeg-static'

const destination = 'public/media/personal-r2'
mkdirSync(destination, { recursive: true })
const run = args => {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr)
}

run(['-i', 'assets/raw/hero-orbit-1080p.bak.mp4', '-an', '-vf', 'scale=1280:-2', '-r', '24', '-c:v', 'libx264', '-preset', 'fast', '-crf', '22', '-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-movflags', '+faststart', `${destination}/orbit.mp4`])
console.log('orbit.mp4')
for (const [input, name, time] of [
  ['assets/raw/hero-orbit-1080p.bak.mp4', 'orbit', '3.0'],
  ['assets/raw/the-builder-1080p.bak.mp4', 'builder', '2.4'],
  ['assets/raw/the-creator-1080p.bak.mp4', 'creator', '5.8'],
  ['assets/raw/the-closer-v1-1080p.bak.mp4', 'closer', '3.0'],
]) {
  run(['-ss', time, '-i', input, '-vf', 'scale=1000:-1', '-frames:v', '1', '-c:v', 'libwebp', '-quality', '88', `${destination}/${name}.webp`])
  console.log(`${name}.webp`)
}
