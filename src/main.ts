import './style.css'
import { buildSprites } from './art/sprites.ts'
import { CONTENT } from './content.ts'
import { setMuted, sfx, unlockAudio } from './engine/audio.ts'
import { createGame } from './engine/game.ts'
import { createPanels } from './engine/panel.ts'
import { createRadio } from './engine/radio.ts'
import { HOTSPOTS } from './world.ts'

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!

function toast(msg: string) {
  const el = document.createElement('div')
  el.className = 'toast'
  el.textContent = msg
  $('#toasts').append(el)
  setTimeout(() => el.classList.add('out'), 2600)
  setTimeout(() => el.remove(), 3000)
}

async function boot() {
  // canvas text uses the pixel font; don't wait forever if Google Fonts is blocked
  await Promise.race([
    Promise.all([document.fonts.load('12px Silkscreen'), document.fonts.load('16px "JetBrains Mono"')]),
    new Promise((r) => setTimeout(r, 1500)),
  ])

  const sprites = buildSprites()
  const radio = createRadio(CONTENT.stations, $('#radio-dock'))
  const panels = createPanels(CONTENT, radio, () => {
    sfx.close()
    game.focus()
  })
  panels.setToast(toast)

  const menuItems = new Map<string, HTMLButtonElement>()
  const game = createGame({
    canvas: $<HTMLCanvasElement>('#game'),
    sprites,
    content: CONTENT,
    panels,
    radio,
    toast,
    onProgress(seen, total, keys) {
      $('#progress-bar').style.width = `${(seen / total) * 100}%`
      $('#progress-text').textContent = `${seen}/${total} explored`
      for (const [key, btn] of menuItems) btn.classList.toggle('done', keys.has(key as never))
    },
    onNight(night) {
      $('#btn-night').classList.toggle('on', night)
      $('#btn-night').textContent = night ? '☀' : '☾'
      document.documentElement.dataset.night = String(night)
    },
  })

  // HUD
  const p = CONTENT.profile
  $('#profile-name').textContent = p.name
  $('#profile-role').textContent = p.role
  $<HTMLAnchorElement>('#btn-classic').href = p.classicUrl
  const avatar = $<HTMLCanvasElement>('.avatar canvas').getContext('2d')!
  avatar.drawImage(sprites.hero_down_0.img, 0, 0, 16, 16, 0, 0, 16, 16)
  const status = $('#btn-status')
  status.classList.toggle('open', CONTENT.availability.open)
  status.querySelector('span')!.textContent = CONTENT.availability.open ? 'Open to work' : 'Availability'
  status.addEventListener('click', () => {
    unlockAudio()
    sfx.blip()
    const door = HOTSPOTS.find((h) => h.panel === 'contact')!
    game.openDirect(door)
  })
  $('#hint').textContent = matchMedia('(pointer: coarse)').matches
    ? 'Tap the floor to walk · tap anything to use it'
    : 'WASD / arrows to walk · Shift to run · E to use · or click anything'
  setTimeout(() => $('#hint').classList.add('fade'), 9000)

  // quick menu
  const menu = $('#menu')
  const list = $('.menu-list')
  for (const zone of ['work', 'den'] as const) {
    const head = document.createElement('h3')
    head.textContent = zone === 'work' ? 'Ops room' : 'Den'
    list.append(head)
    const seenPanels = new Set<string>()
    for (const h of HOTSPOTS.filter((x) => x.zone === zone && x.panel)) {
      if (seenPanels.has(h.panel!)) continue
      seenPanels.add(h.panel!)
      const panel = CONTENT.panels[h.panel!]
      const b = document.createElement('button')
      b.className = 'menu-item'
      b.innerHTML = `<span class="icon"></span><span><b></b><small></small></span><i>✓</i>`
      b.querySelector('.icon')!.textContent = panel.icon
      b.querySelector('b')!.textContent = panel.title
      b.querySelector('small')!.textContent = panel.subtitle ?? h.label
      b.addEventListener('click', (e) => {
        closeMenu()
        if (e.shiftKey || e.altKey) game.openDirect(h)
        else game.goTo(h)
      })
      menuItems.set(h.panel!, b)
      list.append(b)
    }
  }
  const openMenu = () => {
    unlockAudio()
    sfx.blip()
    menu.hidden = false
    requestAnimationFrame(() => menu.classList.add('open'))
    list.querySelector<HTMLElement>('button')?.focus()
  }
  const closeMenu = () => {
    menu.classList.remove('open')
    setTimeout(() => (menu.hidden = true), 180)
    game.focus()
  }
  $('#btn-menu').addEventListener('click', openMenu)
  menu.querySelector('.close')!.addEventListener('click', closeMenu)
  menu.addEventListener('pointerdown', (e) => e.target === menu && closeMenu())
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) closeMenu()
  })

  // buttons
  $('#btn-night').addEventListener('click', () => {
    unlockAudio()
    game.toggleNight()
  })
  $('#btn-music').addEventListener('click', () => {
    unlockAudio()
    radio.toggle()?.catch(() => toast('YouTube is blocked here, so the radio can’t play.'))
  })
  radio.onChange((s) => $('#btn-music').classList.toggle('on', !!s.station))
  let muted = false
  $('#btn-sound').addEventListener('click', () => {
    unlockAudio()
    muted = !muted
    setMuted(muted)
    $('#btn-sound').classList.toggle('on', !muted)
    $('#btn-sound').textContent = muted ? '🔈' : '🔊'
  })

  $('#hud').hidden = false
  game.start()
  game.focus()
}

boot()
