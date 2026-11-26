import '@fontsource-variable/mona-sans/standard.css'
import '@fontsource-variable/bodoni-moda'
import '@fontsource-variable/space-grotesk'
import './commerce.css'

document.querySelectorAll<HTMLElement>('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()) })
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]')
const nav = document.querySelector<HTMLElement>('[data-nav]')
function closeNavigation(returnFocus = false) {
  toggle?.setAttribute('aria-expanded', 'false')
  nav?.classList.remove('is-open')
  if (returnFocus) toggle?.focus()
}
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true'
  toggle.setAttribute('aria-expanded', String(open))
  nav?.classList.toggle('is-open', open)
})
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeNavigation()))
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') closeNavigation(true)
})
document.addEventListener('click', event => {
  if (event.target instanceof Node && !nav?.contains(event.target) && !toggle?.contains(event.target)) closeNavigation()
})
matchMedia('(min-width: 901px)').addEventListener('change', () => closeNavigation())
