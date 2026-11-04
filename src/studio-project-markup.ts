import { studioProjects, type StudioProject } from './studio-projects'

const projectOrder = ['engine', 'garage', 'crm', 'sandro', 'emil', 'burg', 'booking'] as const
const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!))

export function selectedStudioProjects(): StudioProject[] {
  return projectOrder.flatMap(id => {
    const project = studioProjects.find(item => item.id === id)
    return project ? [project] : []
  })
}

function galleryMarkup(project: StudioProject): string {
  const first = project.shots[0]
  if (!first) return ''
  const thumbnails = project.shots.map((shot, index) => `<a href="${escape(shot.src)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(project.name + ': ' + shot.title + ' – Ansicht öffnen')}" style="flex:0 0 108px;border:2px solid ${index === 0 ? '#61752a' : 'transparent'};background:#e6ebdc;border-radius:5px;overflow:hidden;text-align:left"><img src="${escape(shot.src)}" width="160" height="100" alt="" loading="lazy" /><span style="display:block;padding:6px 7px;min-height:35px;font-size:9px;line-height:1.4">${escape(shot.title)}</span></a>`).join('')
  return `<div class="project-browser"><div class="browser-top"><span class="browser-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${escape(project.name)}</span><a class="gallery-expand" href="${escape(first.src)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(project.name + ': erste Ansicht öffnen')}">Ansicht öffnen ↗</a></div><div class="gallery-screen"><img src="${escape(first.src)}" alt="${escape(project.name + ': ' + first.title)}" width="1280" height="800" loading="lazy" decoding="async" /></div></div><div class="gallery-bottom"><div class="gallery-caption"><strong>${escape(first.title)}</strong><span>${escape(first.note)}</span></div></div><div class="gallery-thumbnails" role="group" aria-label="${escape('Ansichten von ' + project.name)}">${thumbnails}</div>`
}

/** Static first views remain useful without JavaScript; mountGallery may enhance each host. */
export function projectGridMarkup(): string {
  return selectedStudioProjects().map(project => `<article class="project-case" id="projekt-${escape(project.id)}" data-project-type="${escape(project.type)}"><div class="case-heading"><div><span>${escape(project.label)}</span><h3>${escape(project.name)}</h3></div><span class="case-number">${project.shots.length} ${project.shots.length === 1 ? 'Ansicht' : 'Ansichten'}</span></div><div class="case-gallery">${galleryMarkup(project)}</div><div class="case-copy"><p>${escape(project.description)}</p>${project.id === 'engine' ? '<a class="case-demo-link" href="#motor-demo">Direkt ausprobieren ↗</a>' : ''}<details><summary>Mehr zum Projekt</summary><p>${escape(project.detail)}</p></details></div></article>`).join('')
}
