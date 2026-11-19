// Runs against the built package in dist (npm test builds first), in jsdom, on whichever React is installed.
const path = require('path')
const fs = require('fs')
const { execFileSync } = require('child_process')
const { JSDOM } = require('jsdom')

const dom = new JSDOM('<!doctype html><div id=root></div>', { pretendToBeVisual: true })
Object.assign(global, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })

const React = require('react')
const ReactDOM = require('react-dom')
const act = React.act || require('react-dom/test-utils').act
const pkg = path.join(__dirname, '..', 'dist', 'cjs', 'index.js')
const lib = require(pkg)
const FancyCarousel = lib.default
const h = React.createElement
const major = Number(React.version.split('.')[0])

const errors = []
const origError = console.error
console.error = (...a) => { errors.push(String(a[0]).slice(0, 160)) }
const results = []
const check = (name, ok, detail) => results.push({ name, ok: !!ok, detail })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const wait = ms => act(async () => { await sleep(ms) })
// timers that chain through re-renders (auto-rotate) need React's normal scheduler, which act() holds back
const realWait = async ms => { global.IS_REACT_ACT_ENVIRONMENT = false; await sleep(ms); global.IS_REACT_ACT_ENVIRONMENT = true }

const mount = (el, { strict = false } = {}) => {
  const c = document.createElement('div'); document.body.appendChild(c)
  const wrap = e => strict ? h(React.StrictMode, null, e) : e
  let root
  if (major >= 18) { root = require('react-dom/client').createRoot(c); act(() => root.render(wrap(el))) }
  else act(() => { ReactDOM.render(wrap(el), c) })
  return {
    c,
    rerender: e => act(() => { major >= 18 ? root.render(wrap(e)) : ReactDOM.render(wrap(e), c) }),
    unmount: () => act(() => { major >= 18 ? root.unmount() : ReactDOM.unmountComponentAtNode(c) }),
  }
}
const q = (c, s) => c.querySelector(s)
const qa = (c, s) => [...c.querySelectorAll(s)]
const fire = (el, type, Ctor = window.MouseEvent, init = {}) => act(() => { el.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, ...init })) })
const click = el => fire(el, 'click')
const key = (el, k) => { let ev; act(() => { ev = new window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }); el.dispatchEvent(ev) }); return ev }
const ring = c => q(c, '.fancy-carousel').style.transform
const steps = c => parseFloat(ring(c).match(/-?[\d.]+/)[0]) / 72
const wrapper = c => q(c, '.fancy-carousel-wrapper-element')
const peripherals = c => qa(c, '.fancy-carousel-element:not(.central-img)')
const centralSrc = c => q(c, '.fancy-carousel-central-image')?.getAttribute('src')
const next = c => click(q(c, 'button[aria-label="Next image"]'))
const prev = c => click(q(c, 'button[aria-label="Previous image"]'))
const images = ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg']

;(async () => {
// exports
check('default and named export are the same component', typeof FancyCarousel === 'function' && lib.FancyCarousel === FancyCarousel)

// images, alt text, buttons
{
  const calls = []
  const m = mount(h(FancyCarousel, { images, imageAlts: ['A', 'B', 'C', 'D', 'E'], setFocusElement: f => calls.push(f) }))
  check('renders 5 ring images and 1 central image', qa(m.c, 'img.fancy-carousel-image').length === 5 && qa(m.c, 'img.fancy-carousel-central-image').length === 1)
  check('alt text on ring and central images', q(m.c, 'img.fancy-carousel-image').alt === 'A' && q(m.c, '.fancy-carousel-central-image').alt === 'A')
  check('buttons are type=button with labels and ‹ › arrows', qa(m.c, 'button').every(b => b.type === 'button') && qa(m.c, 'button').map(b => b.getAttribute('aria-label') + b.textContent.trim()).join() === 'Previous image‹,Next image›')
  check('wrapper is a focusable carousel region', wrapper(m.c).getAttribute('role') === 'region' && wrapper(m.c).getAttribute('aria-roledescription') === 'carousel' && wrapper(m.c).tabIndex === 0)
  next(m.c)
  check('Next -> focus 1, ring turns 72deg, items counter-rotate', centralSrc(m.c) === 'b.jpg' && ring(m.c) === 'rotate(72deg)' && peripherals(m.c)[0].style.transform === 'rotate(-72deg)', [centralSrc(m.c), ring(m.c)])
  prev(m.c); prev(m.c)
  check('Prev wraps to the last image', centralSrc(m.c) === 'e.jpg' && ring(m.c) === 'rotate(-72deg)', [centralSrc(m.c), ring(m.c)])
  check('setFocusElement reports 0,1,0,4', JSON.stringify(calls) === JSON.stringify([0, 1, 0, 4]), calls)
  m.unmount()
}

// keyboard
{
  const input = h('input', { key: 'i', id: 'field' })
  const m = mount(h(FancyCarousel, null, h('span', { key: 1 }, 'one'), h('span', { key: 2 }, input), h('span', { key: 3 }, 'three')))
  const ev = key(wrapper(m.c), 'ArrowRight')
  check('ArrowRight turns to the next item and is handled', ring(m.c) === 'rotate(120deg)' && ev.defaultPrevented)
  key(wrapper(m.c), 'ArrowLeft'); key(wrapper(m.c), 'ArrowLeft')
  check('ArrowLeft turns back', ring(m.c) === 'rotate(-120deg)', ring(m.c))
  key(q(m.c, 'button[aria-label="Next image"]'), 'ArrowRight')
  check('arrow keys work while a button has focus', ring(m.c) === 'rotate(0deg)', ring(m.c))
  const other = key(wrapper(m.c), 'Enter')
  check('other keys are left alone', ring(m.c) === 'rotate(0deg)' && !other.defaultPrevented)
  key(q(m.c, '#field'), 'ArrowRight')
  check('arrow keys inside an input in a child are ignored', ring(m.c) === 'rotate(0deg)', ring(m.c))
  m.unmount()
}

// focus styling, transition time, colours
{
  const m = mount(h(FancyCarousel, { images, focusElementStyling: { outline: '3px solid red' }, transitionTime: 2, navigationButtonBgColor: '#1c364f', navigationButtonColor: 'fff' }))
  const outlined = () => peripherals(m.c).map(e => e.style.outline !== '')
  check('focusElementStyling only on the focused element', JSON.stringify(outlined()) === JSON.stringify([true, false, false, false, false]), outlined())
  next(m.c)
  check('focus styling follows to element 1', JSON.stringify(outlined()) === JSON.stringify([false, true, false, false, false]), outlined())
  check('transitionTime=2 -> 2s', q(m.c, '.fancy-carousel').style.transition === '2s', q(m.c, '.fancy-carousel').style.transition)
  const b = q(m.c, 'button').style
  check('colours accept a leading # and 3-digit hex', b.backgroundColor === 'rgb(28, 54, 79)' && b.color === 'rgb(255, 255, 255)', [b.backgroundColor, b.color])
  m.unmount()
}

// click to rotate
{
  const calls = []
  const m = mount(h(FancyCarousel, { images, setFocusElement: f => calls.push(f) }))
  check('other elements show a pointer, the focused one does not', peripherals(m.c)[0].style.cursor === '' && peripherals(m.c)[3].style.cursor === 'pointer')
  click(peripherals(m.c)[3])
  check('click element 3 of 5 -> turns back 2 steps (shorter way)', centralSrc(m.c) === 'd.jpg' && ring(m.c) === 'rotate(-144deg)', [centralSrc(m.c), ring(m.c)])
  click(peripherals(m.c)[1])
  check('click element 1 from 3 -> turns back 2 more', centralSrc(m.c) === 'b.jpg' && ring(m.c) === 'rotate(-288deg)', [centralSrc(m.c), ring(m.c)])
  click(peripherals(m.c)[2])
  check('click element 2 from 1 -> one step forward', centralSrc(m.c) === 'c.jpg' && ring(m.c) === 'rotate(-216deg)', [centralSrc(m.c), ring(m.c)])
  click(peripherals(m.c)[2])
  check('clicking the focused element does nothing', ring(m.c) === 'rotate(-216deg)')
  check('callback follows clicks', JSON.stringify(calls) === JSON.stringify([0, 3, 1, 2]), calls)
  m.rerender(h(FancyCarousel, { images, rotateOnClick: false }))
  click(peripherals(m.c)[0])
  check('rotateOnClick=false -> clicks ignored, no pointer', centralSrc(m.c) === 'c.jpg' && peripherals(m.c).every(e => e.style.cursor === ''))
  m.unmount()
}

// custom children
{
  const calls = []
  const cities = ['Delhi', 'Mumbai', 'Bengaluru']
  const kids = cities.map(c => h('div', { key: c, className: 'city' }, c))
  const m = mount(h(FancyCarousel, { setFocusElement: f => calls.push(f) }, kids))
  const centre = () => q(m.c, '.central-img .fancy-carousel-item')?.textContent
  check('children: no images, 3 ring items and a central item', qa(m.c, 'img').length === 0 && qa(m.c, '.fancy-carousel-element:not(.central-img) .fancy-carousel-item .city').length === 3)
  check('children: centre shows the focused child', centre() === 'Delhi', centre())
  check('children: ring items keep their order', peripherals(m.c).map(e => e.textContent).join() === cities.join())
  check('children: item sized to the peripheral radius', q(m.c, '.fancy-carousel-element:not(.central-img) .fancy-carousel-item').style.width === '150px')
  next(m.c)
  check('children: Next moves the centre to Mumbai, 120deg', centre() === 'Mumbai' && ring(m.c) === 'rotate(120deg)', [centre(), ring(m.c)])
  click(peripherals(m.c)[2])
  check('children: click works too', centre() === 'Bengaluru', centre())
  check('children: callback', JSON.stringify(calls) === JSON.stringify([0, 1, 2]), calls)
  m.rerender(h(FancyCarousel, { images: ['x.jpg', 'y.jpg'] }, kids))
  check('images take priority over children', qa(m.c, 'img.fancy-carousel-image').length === 2 && !q(m.c, '.fancy-carousel-item'))
  m.unmount()
  const one = mount(h(FancyCarousel, null, h('span', null, 'only')))
  check('a single child works', q(one.c, '.central-img').textContent === 'only' && peripherals(one.c).length === 1)
  one.unmount()
}

// number of items changes / empty
{
  const calls = []
  const m = mount(h(FancyCarousel, { images, setFocusElement: f => calls.push(f) }))
  prev(m.c)
  m.rerender(h(FancyCarousel, { images: images.slice(0, 3), setFocusElement: f => calls.push(f) }))
  check('shrinking from 5 to 3 while on item 4 keeps focus in range', centralSrc(m.c) === 'c.jpg' && peripherals(m.c).length === 3, centralSrc(m.c))
  check('ring angle matches the new count', ring(m.c) === 'rotate(-120deg)', ring(m.c))
  check('parent told about the new focus', calls.at(-1) === 2, calls)
  m.rerender(h(FancyCarousel, { images: [] }))
  check('empty images -> no images, no broken central img', qa(m.c, 'img').length === 0 && qa(m.c, '.fancy-carousel-element').length === 0)
  m.rerender(h(FancyCarousel, { images: images.slice(0, 2) }))
  check('growing back from empty renders again', qa(m.c, 'img.fancy-carousel-image').length === 2 && centralSrc(m.c))
  m.unmount()
  const none = mount(h(FancyCarousel, {}))
  check('no images and no children renders an empty wrapper', none.c.innerHTML === '<div class="fancy-carousel-wrapper-element"></div>', none.c.innerHTML)
  none.unmount()
}

// auto-rotate
{
  const m = mount(h(FancyCarousel, { images, autoRotateTime: 0.05 }), { strict: true })
  await realWait(280)
  check('auto-rotate: 4-5 steps in 280ms at 50ms, not doubled by StrictMode', steps(m.c) >= 4 && steps(m.c) <= 5, steps(m.c))
  check('auto-rotate hides the arrows by default', q(m.c, '.fancy-carousel-navigators').classList.contains('fancy-carousel-hidden'))
  fire(wrapper(m.c), 'mouseover', window.MouseEvent, { relatedTarget: document.body })
  const atHover = steps(m.c)
  await realWait(200)
  check('pauses while hovered', steps(m.c) === atHover, [atHover, steps(m.c)])
  fire(wrapper(m.c), 'mouseout', window.MouseEvent, { relatedTarget: document.body })
  await realWait(200)
  check('resumes when the mouse leaves', steps(m.c) >= atHover + 2, [atHover, steps(m.c)])
  m.rerender(h(FancyCarousel, { images, autoRotateTime: 0.05, pauseOnHover: false, showNavigation: true }))
  check('showNavigation=true keeps the arrows', !q(m.c, '.fancy-carousel-navigators').classList.contains('fancy-carousel-hidden'))
  fire(wrapper(m.c), 'mouseover', window.MouseEvent, { relatedTarget: document.body })
  const noPause = steps(m.c)
  await realWait(200)
  check('pauseOnHover=false keeps turning under the mouse', steps(m.c) >= noPause + 2, [noPause, steps(m.c)])
  m.unmount()
  await realWait(100)

  const t = mount(h(FancyCarousel, { images, autoRotateTime: 0.2, showNavigation: true }))
  await realWait(150)
  next(t.c)
  await realWait(120)
  check('a manual turn restarts the wait (no extra step 50ms later)', steps(t.c) === 1, steps(t.c))
  await realWait(150)
  check('the next automatic step comes a full interval after the click', steps(t.c) === 2, steps(t.c))
  t.unmount()
  await realWait(250)
}

// responsive
{
  const observers = new Set()
  global.ResizeObserver = window.ResizeObserver = class { constructor(cb) { this.cb = cb } observe() { observers.add(this) } disconnect() { observers.delete(this) } }
  const desc = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'clientWidth')
  Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return this.classList?.contains('fancy-carousel-wrapper-element') ? 479 : 0 } })
  const m = mount(h(FancyCarousel, { images, responsive: true }))
  check('responsive: 479px container -> 400px ring', q(m.c, '.fancy-carousel-border').style.width === '400px', q(m.c, '.fancy-carousel-border').style.width)
  m.rerender(h(FancyCarousel, { responsive: true }, ['a', 'b', 'c'].map(t => h('b', { key: t }, t))))
  check('responsive children are scaled too', q(m.c, '.fancy-carousel-element:not(.central-img) .fancy-carousel-item').style.width === '75px')
  m.unmount()
  check('unmount disconnects the observer', observers.size === 0, observers.size)
  if (desc) Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', desc)
}

// server rendering, in a separate process with no window, like a real server
{
  const out = execFileSync(process.execPath, ['-e', `
    const errs = []; console.error = (...a) => errs.push(String(a[0]).slice(0, 120))
    const React = require('react'), { renderToString } = require('react-dom/server')
    const C = require(${JSON.stringify(pkg)}).default, h = React.createElement
    const imgs = renderToString(h(C, { images: ['a.jpg','b.jpg','c.jpg','d.jpg','e.jpg'], imageAlts: ['A'], borderHexColor: '#f00' }))
    const kids = renderToString(h(C, null, h('i', { key: 1 }, 'one'), h('i', { key: 2 }, 'two')))
    console.log(JSON.stringify({ imgs, kids, errs }))`], { cwd: __dirname }).toString()
  const { imgs, kids, errs } = JSON.parse(out)
  check('SSR with images', (imgs.match(/<img/g) || []).length === 6 && imgs.includes('alt="A"'))
  check('SSR with children', (kids.match(/<i>one<\/i>/g) || []).length === 2 && !kids.includes('<img'))
  check('border colour with # and 3 digits makes a valid stroke', /stroke=(&#x27;|')%23f00(&#x27;|')/.test(imgs) && !imgs.includes('%23%23'), imgs.match(/stroke=[^ ]*/)?.[0])
  check('SSR without warnings', errs.length === 0, errs)
}

// stylesheet
{
  const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'FancyCarousel.css'), 'utf8')
  check('no global .invisible class that clashes with Tailwind/Bootstrap', !/\.invisible\b/.test(css))
  check('focus ring is only hidden for mouse focus', !/\.fancy-carousel-navigation-button\s*\{[^}]*outline:\s*none/.test(css) && css.includes(':focus:not(:focus-visible)'))
  check('transitions are turned off for reduced motion', /prefers-reduced-motion:\s*reduce/.test(css))
}

console.error = origError
check('no React errors or warnings', errors.length === 0, errors)
const failed = results.filter(r => !r.ok)
console.log(`React ${React.version}: ${results.length - failed.length}/${results.length} passed`)
for (const f of failed) console.log('  FAIL', f.name, JSON.stringify(f.detail))
process.exit(failed.length ? 1 : 0)
})()
