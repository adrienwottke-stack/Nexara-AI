import { build } from 'esbuild'
import { readFileSync, writeFileSync } from 'node:fs'

const result = await build({
  stdin: {
    contents: `export {journeyMarkup,worldsMarkup,personalFanMarkup} from './src/brand-story.ts'; export {playgroundMarkup} from './src/playground-access.ts'; export {projectGridMarkup} from './src/studio-project-markup.ts';`,
    resolveDir: process.cwd(),
  },
  bundle: true, platform: 'node', format: 'esm', write: false,
  loader: { '.css': 'empty' }, logLevel: 'warning',
})
const modules = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
let html = readFileSync('index.html', 'utf8')
const fragments = [
  ['brand-journey-mount', modules.journeyMarkup], ['brand-worlds-mount', modules.worldsMarkup],
  ['brand-fan-mount', modules.personalFanMarkup], ['playground-mount', modules.playgroundMarkup],
  ['projects-grid', modules.projectGridMarkup],
]
for (const [id, markup] of fragments) {
  const start = html.indexOf(`<div id="${id}"`)
  if (start < 0) throw new Error(`Missing mount ${id}`)
  const openingEnd = html.indexOf('>', start)
  let depth = 1
  let end = openingEnd + 1
  const divs = /<\/?div\b[^>]*>/g
  divs.lastIndex = end
  let match
  while ((match = divs.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1
    if (depth === 0) { end = divs.lastIndex; break }
  }
  if (depth !== 0) throw new Error(`Unclosed mount ${id}`)
  const opening = html.slice(start, openingEnd).replace(/\sdata-prerendered="[^"]*"/g, '')
  html = html.slice(0, start) + `${opening} data-prerendered="true">${markup()}</div>` + html.slice(end)
}
writeFileSync('index.html', html)
console.log('Five complete content sections rendered as static HTML.')
