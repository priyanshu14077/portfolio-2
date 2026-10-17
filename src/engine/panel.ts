// Content panels: turns a Panel's typed sections into HTML inside the modal sheet.
import type { Content, Panel, PanelKey, Section } from '../types.ts'
import type { Radio } from './radio.ts'

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
const ext = (href: string) => (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '')
const h3 = (t?: string) => (t ? `<h3>${esc(t)}</h3>` : '')

function section(s: Section, content: Content, radio: Radio): string {
  switch (s.type) {
    case 'text':
      return `<section>${h3(s.title)}<p>${esc(s.body)}</p></section>`
    case 'list':
      return `<section>${h3(s.title)}<ul class="list">${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></section>`
    case 'tags':
      return `<section>${h3(s.title)}<div class="tags">${s.items.map((i) => `<span>${esc(i)}</span>`).join('')}</div></section>`
    case 'links':
      return `<section>${h3(s.title)}<div class="links">${s.items
        .map((l) => `<a href="${esc(l.href)}"${ext(l.href)}><b>${esc(l.label)}</b>${l.note ? `<small>${esc(l.note)}</small>` : ''}<i>↗</i></a>`)
        .join('')}</div></section>`
    case 'stats':
      return `<section>${h3(s.title)}<div class="stats${s.items.length === 4 ? ' four' : ''}">${s.items
        .map((i) => `<div><b>${esc(i.value)}</b><small>${esc(i.label)}</small></div>`)
        .join('')}</div></section>`
    case 'timeline':
      return `<section>${h3(s.title)}<ol class="timeline">${s.items
        .map((i) => `<li><time>${esc(i.when)}</time><b>${esc(i.what)}</b>${i.note ? `<small>${esc(i.note)}</small>` : ''}</li>`)
        .join('')}</ol></section>`
    case 'image':
      return `<figure><img src="${esc(s.src)}" alt="${esc(s.alt)}" loading="lazy">${s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''}</figure>`
    case 'video':
      return `<figure><video src="${esc(s.src)}"${s.poster ? ` poster="${esc(s.poster)}"` : ''} controls playsinline preload="none"></video>${
        s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ''
      }</figure>`
    case 'gallery':
      return `<section>${h3(s.title)}<div class="gallery">${s.items
        .map((i) => `<figure><img src="${esc(i.src)}" alt="${esc(i.alt)}" loading="lazy">${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ''}</figure>`)
        .join('')}</div></section>`
    case 'steps':
      return `<section>${h3(s.title)}<ol class="steps">${s.items
        .map(
          (st, i) =>
            `<li><span class="n">0${i + 1}</span><div><b>${esc(st.name)}</b><em>${esc(st.tagline)}</em><ul class="list">${st.points
              .map((p) => `<li>${esc(p)}</li>`)
              .join('')}</ul></div></li>`,
        )
        .join('')}</ol></section>`
    case 'posts':
      return `<section>${h3(s.title)}<div class="posts">${s.items
        .map(
          (p) =>
            `<a href="${esc(p.href)}"${ext(p.href)}><time>${esc(p.date)}</time><b>${esc(p.title)}</b><span class="tags">${p.tags
              .map((t) => `<span>${esc(t)}</span>`)
              .join('')}</span></a>`,
        )
        .join('')}</div></section>`
    case 'clock':
      return `<section class="clock" data-tz="${esc(s.tz)}"><b>--:--</b><small>${esc(s.label)}</small></section>`
    case 'radio':
      return `<section><h3>Stations</h3><div class="stations">${content.stations
        .map(
          (st) =>
            `<button class="station${radio.state.station?.id === st.id ? ' on' : ''}" data-station="${esc(st.id)}"><b>${st.freq.toFixed(1)}</b><span>${esc(
              st.name,
            )}</span><small>${esc(st.genre)}</small></button>`,
        )
        .join('')}</div><p class="fine">Plays YouTube playlists in the player at the bottom left.</p></section>`
    case 'status': {
      const a = content.availability
      return `<section class="status${a.open ? ' open' : ''}"><div class="status-head"><i></i><b>${a.open ? 'Open to work' : 'Not looking right now'}</b></div>
        <div class="tags">${a.modes.map((m) => `<span>${esc(m)}</span>`).join('')}</div>
        <p>${esc(a.note)}</p>
        <ul class="list">${a.roles.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></section>`
    }
  }
}

export function createPanels(content: Content, radio: Radio, onClose: () => void) {
  const modal = document.getElementById('panel')!
  const body = document.getElementById('panel-body')!
  let clockTimer = 0
  let current: PanelKey | null = null

  const tickClocks = () =>
    body.querySelectorAll<HTMLElement>('.clock').forEach((el) => {
      const now = new Date()
      el.querySelector('b')!.textContent = now.toLocaleTimeString('en-GB', { timeZone: el.dataset.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    })

  function render(key: PanelKey) {
    const p: Panel = content.panels[key]
    body.innerHTML = `<header><span class="icon">${esc(p.icon)}</span><div><h2>${esc(p.title)}</h2>${p.subtitle ? `<small>${esc(p.subtitle)}</small>` : ''}</div></header>
      <div class="content">${p.sections.map((s) => section(s, content, radio)).join('')}</div>`
    tickClocks()
  }

  body.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-station]')
    if (!btn) return
    const st = content.stations.find((s) => s.id === btn.dataset.station)
    if (st) radio.tune(st).catch(() => toastFn?.('YouTube is blocked here, so the radio can’t play.'))
  })
  radio.onChange(() => {
    if (current === 'music') render('music')
  })

  let toastFn: ((m: string) => void) | null = null

  function open(key: PanelKey) {
    current = key
    render(key)
    modal.hidden = false
    requestAnimationFrame(() => modal.classList.add('open'))
    clearInterval(clockTimer)
    clockTimer = window.setInterval(tickClocks, 1000)
    modal.querySelector<HTMLElement>('.close')?.focus({ preventScroll: true })
  }

  function close() {
    if (!current) return
    current = null
    clearInterval(clockTimer)
    modal.classList.remove('open')
    body.querySelectorAll('video').forEach((v) => v.pause())
    setTimeout(() => {
      if (!current) modal.hidden = true
    }, 180)
    onClose()
  }

  modal.querySelector('.close')!.addEventListener('click', close)
  modal.addEventListener('pointerdown', (e) => {
    if (e.target === modal) close()
  })

  return {
    open,
    close,
    get current() {
      return current
    },
    setToast(fn: (m: string) => void) {
      toastFn = fn
    },
  }
}

export type Panels = ReturnType<typeof createPanels>
