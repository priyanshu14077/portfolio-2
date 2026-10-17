// The walkable room: game loop, movement, rendering and interactions.
import { HERO_SIZE, type HeroDir, type Sprite, type SpriteId } from '../art/contract.ts'
import type { Content, PanelKey } from '../types.ts'
import { byId, CAT_OFFSET, DEN_X, H, HOTSPOTS, LIGHTS, OBJECTS, rectOf, SPAWN, W, WALL_H, type Hotspot } from '../world.ts'
import { sfx, unlockAudio } from './audio.ts'
import { blocked, findPath, freeSpot } from './collide.ts'
import type { Panels } from './panel.ts'
import type { Radio } from './radio.ts'

const WALK_SPEED = 62
const RUN_SPEED = 108
const NEAR = 20 // how close the feet must be to a hotspot's stand point
const DYNAMIC = new Set(['window_a', 'window_b', 'sign', 'clock']) // drawn per frame, not baked

interface Particle {
  kind: 'heart' | 'note' | 'z' | 'confetti'
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  c: string
  rot: number
}

export interface GameDeps {
  canvas: HTMLCanvasElement
  sprites: Record<SpriteId, Sprite>
  content: Content
  panels: Panels
  radio: Radio
  toast: (msg: string) => void
  onProgress: (seen: number, total: number, seenKeys: Set<PanelKey>) => void
  onNight: (night: boolean) => void
}

export function createGame(d: GameDeps) {
  const { canvas, sprites, content, panels, radio } = d
  const ctx = canvas.getContext('2d')!
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = matchMedia('(pointer: coarse)').matches

  const state = {
    t: 0,
    night: false,
    nightAmt: 0,
    hover: null as Hotspot | null,
    near: null as Hotspot | null,
    catAwakeUntil: 0,
    catPets: 0,
    ballT: -1,
    marker: null as { x: number; y: number; t: number } | null,
    celebrated: false,
  }
  const player = {
    x: SPAWN[0],
    y: SPAWN[1],
    dir: 'down' as HeroDir,
    moving: false,
    running: false,
    animT: 0,
    path: [] as [number, number][],
    pending: null as Hotspot | null,
    bubble: '',
    bubbleUntil: 0,
  }
  const keys = new Set<string>()
  const particles: Particle[] = []

  // --- progress -------------------------------------------------------------
  const PANEL_KEYS = [...new Set(HOTSPOTS.flatMap((h) => (h.panel ? [h.panel] : [])))]
  const STORE = 'ops-room:seen'
  const seen = new Set<PanelKey>()
  try {
    for (const k of JSON.parse(localStorage.getItem(STORE) ?? '[]') as PanelKey[]) if (PANEL_KEYS.includes(k)) seen.add(k)
  } catch {
    /* private mode: progress just won't persist */
  }
  state.celebrated = seen.size === PANEL_KEYS.length
  const reportProgress = () => d.onProgress(seen.size, PANEL_KEYS.length, seen)

  function markSeen(k: PanelKey) {
    if (seen.has(k)) return
    seen.add(k)
    try {
      localStorage.setItem(STORE, JSON.stringify([...seen]))
    } catch {
      /* ignore */
    }
    reportProgress()
    if (seen.size === PANEL_KEYS.length && !state.celebrated) {
      state.celebrated = true
      setTimeout(() => {
        panels.close()
        say("That's the whole room. Thanks for walking through it!", 5)
        sfx.fanfare()
        if (!reduceMotion) confetti()
      }, 900)
    }
  }

  // --- view -------------------------------------------------------------------
  let dpr = 1
  let scale = 3
  let vw = 0
  let vh = 0
  let camX = 0
  let camY = 0

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1)
    vw = window.innerWidth
    vh = window.innerHeight
    canvas.width = Math.round(vw * dpr)
    canvas.height = Math.round(vh * dpr)
    canvas.style.width = vw + 'px'
    canvas.style.height = vh + 'px'
    // Round up to whole device pixels (every art pixel the same size) when that crops
    // under 8% more; otherwise use the exact cover scale, whose uneven pixels are a
    // single device pixel apart and barely visible.
    const cover = Math.max((vw * dpr) / W, (vh * dpr) / H)
    scale = (Math.ceil(cover) / cover <= 1.08 ? Math.ceil(cover) : cover) / dpr
    updateCamera(1)
  }

  function updateCamera(k: number) {
    const viewW = vw / scale
    const viewH = vh / scale
    const tx = Math.max(0, Math.min(W - viewW, player.x - viewW / 2))
    const ty = Math.max(0, Math.min(H - viewH, player.y - 40 - viewH / 2))
    camX += (tx - camX) * k
    camY += (ty - camY) * k
  }

  const toWorld = (cx: number, cy: number): [number, number] => [cx / scale + camX, cy / scale + camY]
  const toScreen = (wx: number, wy: number): [number, number] => [(wx - camX) * scale, (wy - camY) * scale]

  // --- background (static layers baked once) ----------------------------------
  const bg = document.createElement('canvas')
  bg.width = W
  bg.height = H
  {
    const b = bg.getContext('2d')!
    for (let y = WALL_H - 6; y < H; y += 16)
      for (let x = 0; x < W; x += 16) b.drawImage(sprites[x >= DEN_X ? 'floor_wood' : 'floor_tech'].img, x, y)
    for (let x = 0; x < W; x += 16) b.drawImage(sprites.wall.img, x, 0)
    for (let y = 0; y < H; y += 16) {
      b.drawImage(sprites.wall_side.img, 0, y)
      b.drawImage(sprites.wall_side.img, W - 8, y)
    }
    for (let x = 0; x < W; x += 16) b.drawImage(sprites.rail_bottom.img, x, H - 10)
    // seam between the two floors
    b.fillStyle = 'rgba(10,36,102,0.35)'
    b.fillRect(DEN_X, WALL_H, 1, H - WALL_H - 10)
    for (const ob of OBJECTS) if (ob.layer !== 'obj' && !DYNAMIC.has(ob.id)) b.drawImage(sprites[ob.s].img, ob.x, ob.y)

    // ambient occlusion where the floor meets the back wall
    b.fillStyle = 'rgba(10,36,102,0.22)'
    b.fillRect(8, WALL_H, W - 16, 2)
    b.fillStyle = 'rgba(10,36,102,0.1)'
    b.fillRect(8, WALL_H + 2, W - 16, 2)

    // contact shadows under floor objects, nudged right/down away from the top-left light.
    // Drawn opaque on their own layer first so overlapping shadows don't stack.
    const sh = document.createElement('canvas')
    sh.width = W
    sh.height = H
    const s = sh.getContext('2d')!
    s.fillStyle = '#0a2466'
    for (const ob of OBJECTS) {
      if (ob.layer !== 'obj' || ob.on) continue
      const [x, y, w, h] = rectOf(ob)
      pixelOval(s, x + w / 2 + 2, y + h - 1, w / 2 + 1, Math.max(2, Math.min(5, Math.round(h * 0.12))))
    }
    b.globalAlpha = 0.24
    b.drawImage(sh, 0, 0)
    b.globalAlpha = 1
  }

  function pixelOval(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
    for (let dy = -ry; dy <= ry; dy++) {
      const half = Math.round(rx * Math.sqrt(1 - (dy / (ry + 0.5)) ** 2))
      g.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2, 1)
    }
  }

  // daylight falling from the two den windows onto the floor, stepped like pixel art
  function drawSunlight() {
    const a = 1 - state.nightAmt
    if (a <= 0) return
    ctx.fillStyle = `rgba(255,240,190,${0.13 * a})`
    for (const id of ['window_a', 'window_b'] as const) {
      const [x, , w] = rectOf(byId[id])
      for (let y = WALL_H; y < WALL_H + 46; y += 2) {
        const k = y - WALL_H
        const skew = Math.round(k * 0.45)
        const narrow = Math.round(k * 0.12)
        ctx.fillRect(x + 4 + skew + narrow, y, w - 8 - narrow * 2, 2)
      }
    }
  }

  // --- helpers ------------------------------------------------------------
  function say(text: string, secs = 3.5) {
    player.bubble = text
    player.bubbleUntil = state.t + secs
  }

  function spawn(kind: Particle['kind'], x: number, y: number, n = 1) {
    for (let i = 0; i < n; i++)
      particles.push({
        kind,
        x: x + (Math.random() - 0.5) * 8,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: -12 - Math.random() * 8,
        age: -i * 0.12,
        life: 1.4,
        c: '#ff5d7a',
        rot: 0,
      })
  }

  function confetti() {
    const colors = ['#ffc928', '#3fbf5f', '#f4f8ff', '#2a62e8', '#ff8a3d']
    for (let i = 0; i < 90; i++)
      particles.push({
        kind: 'confetti',
        x: player.x + (Math.random() - 0.5) * 40,
        y: player.y - 30,
        vx: (Math.random() - 0.5) * 120,
        vy: -60 - Math.random() * 90,
        age: 0,
        life: 2.5,
        c: colors[i % colors.length],
        rot: Math.random() * 6,
      })
  }

  const hotspotRect = (h: Hotspot) => rectOf(byId[h.obj])
  const distTo = (h: Hotspot) => Math.hypot(player.x - h.at[0], player.y - h.at[1])

  // stand points are authored by hand; nudge any that landed inside furniture
  for (const h of HOTSPOTS) h.at = freeSpot(h.at[0], h.at[1])

  function nearestHotspot(): Hotspot | null {
    let best: Hotspot | null = null
    let bd = NEAR
    for (const h of HOTSPOTS) {
      const dd = distTo(h)
      if (dd < bd) {
        bd = dd
        best = h
      }
    }
    return best
  }

  function hotspotAt(wx: number, wy: number): Hotspot | null {
    let best: Hotspot | null = null
    let area = Infinity
    for (const h of HOTSPOTS) {
      const [x, y, w, hh] = hotspotRect(h)
      if (wx >= x && wx <= x + w && wy >= y && wy <= y + hh && w * hh < area) {
        area = w * hh
        best = h
      }
    }
    return best
  }

  // --- interactions ---------------------------------------------------------
  const quipCount = new Map<string, number>()

  function interact(h: Hotspot) {
    player.dir = h.face
    sfx.blip()
    switch (h.action) {
      case 'pet': {
        state.catPets++
        state.catAwakeUntil = state.t + 3
        sfx.meow()
        const sofa = byId.sofa
        spawn('heart', sofa.x + CAT_OFFSET[0] + 8, sofa.y + CAT_OFFSET[1], 5)
        const lines = ['Prrrt.', 'The cat approves this deployment.', 'Purring at 99.9% uptime.', 'Okay, that is enough pets. Maybe one more.']
        say(lines[Math.min(state.catPets - 1, lines.length - 1)])
        return
      }
      case 'night':
        setNight(!state.night)
        say(state.night ? 'Lights low. Monitors on.' : 'Morning, team.')
        return
      case 'ball':
        state.ballT = 0
        sfx.bounce()
        say(['Dončić step-back. Nothing but net.', 'Luka would have hit that from the logo.', 'Brick. Back to work.'][Math.floor(Math.random() * 3)])
        return
      case 'quip': {
        const lines = h.quips ?? []
        const n = (quipCount.get(h.id) ?? 0) + 1
        quipCount.set(h.id, n)
        if (lines.length) say(lines[(n - 1) % lines.length])
        return
      }
      case 'radio':
        if (!radio.state.station)
          radio.toggle()?.catch(() => d.toast('YouTube is blocked here, so the radio can’t play.'))
        break
    }
    if (h.panel) {
      markSeen(h.panel)
      panels.open(h.panel)
      keys.clear()
    }
  }

  function goTo(h: Hotspot) {
    if (distTo(h) < NEAR) return interact(h)
    const p = findPath(player.x, player.y, h.at[0], h.at[1])
    if (!p) return interact(h)
    player.path = p
    player.pending = h
  }

  function walkTo(wx: number, wy: number) {
    const p = findPath(player.x, player.y, wx, wy)
    if (!p) return
    player.path = p
    player.pending = null
    state.marker = { x: p[p.length - 1][0], y: p[p.length - 1][1], t: 0 }
  }

  function setNight(n: boolean) {
    state.night = n
    d.onNight(n)
  }

  // --- update -----------------------------------------------------------------
  function update(dt: number) {
    state.t += dt
    let ix = 0
    let iy = 0
    if (keys.has('a') || keys.has('arrowleft')) ix--
    if (keys.has('d') || keys.has('arrowright')) ix++
    if (keys.has('w') || keys.has('arrowup')) iy--
    if (keys.has('s') || keys.has('arrowdown')) iy++
    const running = keys.has('shift')

    let mx = 0
    let my = 0
    let speed = running ? RUN_SPEED : WALK_SPEED
    if (ix || iy) {
      player.path = []
      player.pending = null
      const len = Math.hypot(ix, iy)
      mx = ix / len
      my = iy / len
    } else if (player.path.length) {
      const [tx, ty] = player.path[0]
      const dx = tx - player.x
      const dy = ty - player.y
      const dist = Math.hypot(dx, dy)
      const far = player.path.length > 1 || dist > 90
      speed = far ? RUN_SPEED * 0.9 : WALK_SPEED
      if (dist <= speed * dt) {
        player.x = tx
        player.y = ty
        player.path.shift()
        if (!player.path.length && player.pending) {
          const h = player.pending
          player.pending = null
          interact(h)
        }
      } else {
        mx = dx / dist
        my = dy / dist
      }
    }

    player.moving = !!(mx || my)
    player.running = player.moving && speed > WALK_SPEED
    if (player.moving) {
      const step = speed * dt
      if (player.path.length) {
        player.x += mx * step
        player.y += my * step
      } else {
        // slide along obstacles one axis at a time
        if (!blocked(player.x + mx * step, player.y)) player.x += mx * step
        if (!blocked(player.x, player.y + my * step)) player.y += my * step
      }
      player.dir = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? 'right' : 'left') : my > 0 ? 'down' : 'up'
      const before = Math.floor(player.animT * 4)
      player.animT += dt * (player.running ? 1.6 : 1)
      if (Math.floor(player.animT * 4) !== before && Math.floor(player.animT * 4) % 2 === 0) sfx.step()
    } else player.animT = 0

    state.near = player.path.length ? null : nearestHotspot()
    if (state.ballT >= 0) {
      state.ballT += dt
      if (state.ballT > 1.2) state.ballT = -1
    }
    if (state.marker && (state.marker.t += dt) > 0.6) state.marker = null

    // ambient particles
    if (!reduceMotion) {
      const sofa = byId.sofa
      if (state.t > state.catAwakeUntil && Math.random() < dt * 0.5) spawn('z', sofa.x + CAT_OFFSET[0] + 12, sofa.y + CAT_OFFSET[1])
      if (radio.state.playing && Math.random() < dt * 1.5) spawn('note', byId.radio.x + 17, byId.radio.y + 4)
    }

    const target = state.night ? 1 : 0
    state.nightAmt += Math.sign(target - state.nightAmt) * Math.min(Math.abs(target - state.nightAmt), dt * 1.5)
    updateCamera(Math.min(1, dt * 6))
  }

  // --- render -----------------------------------------------------------------
  const nightCanvas = document.createElement('canvas')
  nightCanvas.width = W
  nightCanvas.height = H
  const nctx = nightCanvas.getContext('2d')!

  function spr(id: SpriteId, x: number, y: number) {
    ctx.drawImage(sprites[id].img, Math.round(x), Math.round(y))
  }

  function heroFrame(): SpriteId {
    const f = player.moving ? (Math.floor(player.animT * (player.running ? 12 : 8)) % 4) + 1 : 0
    return `hero_${player.dir}_${f as 0 | 1 | 2 | 3 | 4}`
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, Math.round(-camX * dpr * scale), Math.round(-camY * dpr * scale))

    ctx.drawImage(bg, 0, 0)
    drawSunlight()
    const night = state.nightAmt > 0.5
    for (const id of ['window_a', 'window_b'] as const) spr(night ? 'window_night' : 'window_day', byId[id].x, byId[id].y)
    spr(content.availability.open ? 'sign_open' : 'sign_off', byId.sign.x, byId.sign.y)
    drawClock()

    // y-sorted objects + hero + cat
    type D = { base: number; draw: () => void }
    const list: D[] = []
    for (const ob of OBJECTS) {
      if (ob.layer !== 'obj') continue
      const [, , , hgt] = rectOf(ob)
      let base = ob.y + hgt
      if (ob.on) base = byId[ob.on].y + rectOf(byId[ob.on])[3] + 0.5
      let id: SpriteId = ob.s
      if (ob.id === 'radio' && radio.state.playing) id = 'radio_1'
      if (ob.id === 'lamp') id = state.night ? 'lamp_on' : 'lamp_off'
      let y = ob.y
      if (ob.id === 'ball' && state.ballT >= 0) y -= Math.abs(Math.sin(state.ballT * Math.PI * 2.5)) * 14 * (1 - state.ballT / 1.2)
      list.push({ base, draw: () => spr(id, ob.x, y) })
      if (ob.id === 'server_rack') list.push({ base: base + 0.1, draw: () => drawLeds(ob.x, ob.y) })
    }
    const sofa = byId.sofa
    list.push({
      base: sofa.y + rectOf(sofa)[3] + 0.5,
      draw: () => {
        const awake = state.t < state.catAwakeUntil
        spr(awake ? 'cat_awake' : Math.floor(state.t * 1.2) % 2 ? 'cat_sleep_1' : 'cat_sleep_0', sofa.x + CAT_OFFSET[0], sofa.y + CAT_OFFSET[1] - (awake ? 2 : 0))
      },
    })
    list.push({
      base: player.y,
      draw: () => {
        ctx.fillStyle = 'rgba(10,36,102,0.28)'
        const px = Math.round(player.x)
        const py = Math.round(player.y)
        ctx.fillRect(px - 4, py - 2, 8, 1)
        ctx.fillRect(px - 5, py - 1, 11, 1)
        ctx.fillRect(px - 3, py, 7, 1)
        const bob = !player.moving && !reduceMotion && Math.floor(state.t * 2) % 2 ? 1 : 0
        spr(heroFrame(), player.x - HERO_SIZE[0] / 2, player.y - HERO_SIZE[1] + bob)
      },
    })
    list.sort((a, b) => a.base - b.base)
    for (const it of list) it.draw()

    if (state.nightAmt > 0) drawNight()
    drawParticles()
    drawMarker()
    const focus = state.hover ?? state.near
    if (focus && !panels.current) drawBrackets(focus)

    // screen-space UI: crisp text at device resolution
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (state.near && !panels.current) drawPrompt(state.near)
    if (player.bubble && state.t < player.bubbleUntil && !panels.current) drawBubble(player.bubble)
  }

  function drawClock() {
    const c = byId.clock
    spr('clock', c.x, c.y)
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
    const cx = c.x + 7
    const cy = c.y + 7
    ctx.fillStyle = '#0a2466'
    const hand = (ang: number, len: number) => {
      for (let i = 0; i <= len; i++) ctx.fillRect(Math.round(cx + Math.sin(ang) * i), Math.round(cy - Math.cos(ang) * i), 1, 1)
    }
    hand(((now.getHours() % 12) + now.getMinutes() / 60) * (Math.PI / 6), 3)
    hand(now.getMinutes() * (Math.PI / 30), 5)
  }

  function drawLeds(x: number, y: number) {
    const t = Math.floor(state.t * 3)
    for (let row = 0; row < 6; row++) {
      const on = (t + row * 7) % 5 !== 0
      ctx.fillStyle = on ? (row % 3 === 0 ? '#ffc928' : '#3fbf5f') : '#0a2466'
      ctx.fillRect(x + 16, y + 6 + row * 5, 2, 1)
    }
  }

  function drawNight() {
    const a = state.nightAmt
    nctx.globalCompositeOperation = 'source-over'
    nctx.clearRect(0, 0, W, H)
    nctx.fillStyle = `rgba(6,14,48,${0.62 * a})`
    nctx.fillRect(0, 0, W, H)
    nctx.globalCompositeOperation = 'destination-out'
    const lights = LIGHTS.filter((l) => l.when !== 'radio' || radio.state.playing)
    for (const l of lights) {
      const r = l.r * (1 + Math.sin(state.t * 7 + l.x) * 0.015)
      const g = nctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, r)
      g.addColorStop(0, 'rgba(0,0,0,0.95)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      nctx.fillStyle = g
      nctx.fillRect(l.x - r, l.y - r, r * 2, r * 2)
    }
    nctx.globalCompositeOperation = 'lighter'
    for (const l of lights) {
      const g = nctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 0.7)
      g.addColorStop(0, `rgba(${l.c},${0.18 * a})`)
      g.addColorStop(1, `rgba(${l.c},0)`)
      nctx.fillStyle = g
      nctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2)
    }
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(nightCanvas, 0, 0)
    ctx.imageSmoothingEnabled = false
  }

  function drawParticles() {
    const dt = 1 / 60
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.age += dt
      if (p.age < 0) continue
      if (p.age > p.life) {
        particles.splice(i, 1)
        continue
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.kind === 'confetti') {
        p.vy += 160 * dt
        p.rot += dt * 8
      }
      ctx.globalAlpha = Math.min(1, (p.life - p.age) * 2)
      const x = Math.round(p.x)
      const y = Math.round(p.y)
      if (p.kind === 'heart') {
        ctx.fillStyle = '#ff5d7a'
        ctx.fillRect(x - 2, y, 2, 2)
        ctx.fillRect(x + 1, y, 2, 2)
        ctx.fillRect(x - 2, y + 1, 5, 2)
        ctx.fillRect(x - 1, y + 3, 3, 1)
        ctx.fillRect(x, y + 4, 1, 1)
      } else if (p.kind === 'confetti') {
        ctx.fillStyle = p.c
        ctx.fillRect(x, y, Math.cos(p.rot) > 0 ? 2 : 1, 2)
      } else {
        ctx.fillStyle = p.kind === 'note' ? '#ffc928' : '#b9cdfa'
        ctx.font = '7px Silkscreen, monospace'
        ctx.fillText(p.kind === 'note' ? '♪' : 'z', x + Math.sin(p.age * 4) * 2, y)
      }
    }
    ctx.globalAlpha = 1
  }

  function drawMarker() {
    const m = state.marker
    if (!m) return
    const r = 2 + m.t * 10
    ctx.strokeStyle = `rgba(255,201,40,${1 - m.t / 0.6})`
    ctx.lineWidth = 1
    ctx.strokeRect(Math.round(m.x - r), Math.round(m.y - r / 2), Math.round(r * 2), Math.round(r))
  }

  function drawBrackets(h: Hotspot) {
    const [x, y, w, hh] = hotspotRect(h)
    const pad = 2 + (reduceMotion ? 0 : Math.round((Math.sin(state.t * 5) + 1) / 2))
    const L = 4
    ctx.fillStyle = '#ffc928'
    const x0 = x - pad
    const y0 = y - pad
    const x1 = x + w + pad - 1
    const y1 = y + hh + pad - 1
    for (const [cx, cy, sx, sy] of [
      [x0, y0, 1, 1],
      [x1, y0, -1, 1],
      [x0, y1, 1, -1],
      [x1, y1, -1, -1],
    ]) {
      ctx.fillRect(sx > 0 ? cx : cx - L + 1, cy, L, 1)
      ctx.fillRect(cx, sy > 0 ? cy : cy - L + 1, 1, L)
    }
  }

  function pill(text: string, sx: number, sy: number, key?: string) {
    ctx.font = '12px Silkscreen, monospace'
    const tw = ctx.measureText(text).width
    const kw = key ? ctx.measureText(key).width + 12 : 0
    const w = tw + kw + 16
    const x = Math.round(Math.max(8, Math.min(vw - w - 8, sx - w / 2)))
    const y = Math.round(sy - 26)
    ctx.fillStyle = '#0a2466'
    ctx.fillRect(x - 2, y - 2, w + 4, 26)
    ctx.fillStyle = '#0f3596'
    ctx.fillRect(x, y, w, 22)
    if (key) {
      ctx.fillStyle = '#ffc928'
      ctx.fillRect(x + 4, y + 4, kw - 4, 14)
      ctx.fillStyle = '#0a2466'
      ctx.fillText(key, x + 8, y + 15)
    }
    ctx.fillStyle = '#f4f8ff'
    ctx.fillText(text, x + 8 + kw, y + 15)
  }

  function drawPrompt(h: Hotspot) {
    const [x, y, w] = hotspotRect(h)
    const [sx, sy] = toScreen(x + w / 2, y)
    const bob = reduceMotion ? 0 : Math.round(Math.sin(state.t * 4) * 2)
    pill(h.label, sx, Math.max(30, sy - 4 + bob), coarse ? 'TAP' : 'E')
  }

  function drawBubble(text: string) {
    ctx.font = '16px "JetBrains Mono", monospace'
    const maxW = Math.min(280, vw - 32)
    const words = text.split(' ')
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const t = line ? line + ' ' + w : w
      if (ctx.measureText(t).width > maxW - 20 && line) {
        lines.push(line)
        line = w
      } else line = t
    }
    lines.push(line)
    const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20
    const bh = lines.length * 20 + 12
    const [sx, sy] = toScreen(player.x, player.y - HERO_SIZE[1])
    const x = Math.round(Math.max(8, Math.min(vw - bw - 8, sx - bw / 2)))
    const y = Math.round(Math.max(8, sy - bh - 14))
    ctx.fillStyle = '#0a2466'
    ctx.fillRect(x - 3, y - 3, bw + 6, bh + 6)
    ctx.fillStyle = '#f4f8ff'
    ctx.fillRect(x, y, bw, bh)
    // tail
    const tx = Math.round(Math.max(x + 8, Math.min(x + bw - 14, sx - 3)))
    ctx.fillRect(tx, y + bh, 6, 3)
    ctx.fillRect(tx + 1, y + bh + 3, 4, 2)
    ctx.fillRect(tx + 2, y + bh + 5, 2, 2)
    ctx.fillStyle = '#0a2466'
    lines.forEach((l, i) => ctx.fillText(l, x + 10, y + 21 + i * 20))
  }

  // --- input ------------------------------------------------------------------
  const MOVE_KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'])
  window.addEventListener('keydown', (e) => {
    unlockAudio()
    const k = e.key.toLowerCase()
    if (k === 'escape') return panels.close()
    if (panels.current || document.getElementById('menu')!.hidden === false) return
    if ((e.target as HTMLElement).closest('input, textarea')) return
    if (MOVE_KEYS.has(k)) {
      keys.add(k)
      e.preventDefault()
    } else if (k === 'e' || k === ' ' || k === 'enter') {
      if (state.near) interact(state.near)
      e.preventDefault()
    } else if (k === 'n') setNight(!state.night)
    else if (k === 'm') radio.toggle()?.catch(() => d.toast('YouTube is blocked here, so the radio can’t play.'))
  })
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()))
  window.addEventListener('blur', () => keys.clear())

  canvas.addEventListener('pointermove', (e) => {
    const [wx, wy] = toWorld(e.clientX, e.clientY)
    state.hover = e.pointerType === 'mouse' ? hotspotAt(wx, wy) : null
    canvas.classList.toggle('hovering', !!state.hover)
  })
  canvas.addEventListener('pointerleave', () => {
    state.hover = null
    canvas.classList.remove('hovering')
  })
  canvas.addEventListener('pointerdown', (e) => {
    unlockAudio()
    canvas.focus({ preventScroll: true })
    const [wx, wy] = toWorld(e.clientX, e.clientY)
    const h = hotspotAt(wx, wy)
    if (h) goTo(h)
    else walkTo(wx, wy)
  })

  // on-screen pad shares the keyboard's key set
  document.querySelectorAll<HTMLButtonElement>('#pad [data-key]').forEach((b) => {
    const k = b.dataset.key!
    const down = (e: PointerEvent) => {
      e.preventDefault()
      unlockAudio()
      b.setPointerCapture(e.pointerId)
      if (k === 'e') {
        if (state.near) interact(state.near)
        return
      }
      keys.add(k)
      b.classList.add('pressed')
    }
    const up = () => {
      keys.delete(k)
      b.classList.remove('pressed')
    }
    b.addEventListener('pointerdown', down)
    b.addEventListener('pointerup', up)
    b.addEventListener('pointercancel', up)
  })

  window.addEventListener('resize', resize)

  // --- loop -------------------------------------------------------------------
  let last = performance.now()
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!panels.current) update(dt)
    else state.t += dt
    render()
    requestAnimationFrame(frame)
  }

  return {
    start() {
      resize()
      updateCamera(1)
      reportProgress()
      const hr = new Date().getHours() + new Date().getMinutes() / 60
      const params = new URLSearchParams(location.search)
      setNight(params.has('night') || (!params.has('day') && (hr >= 18.5 || hr < 6)))
      state.nightAmt = state.night ? 1 : 0
      requestAnimationFrame(frame)
      setTimeout(() => say(content.profile.greeting, 5), 600)
      const p = params.get('panel') as PanelKey | null
      if (p && p in content.panels) {
        const h = HOTSPOTS.find((x) => x.panel === p)
        if (h) {
          player.x = h.at[0]
          player.y = h.at[1]
          player.dir = h.face
        }
        markSeen(p)
        panels.open(p)
      }
    },
    goTo,
    openDirect(h: Hotspot) {
      if (h.panel) {
        markSeen(h.panel)
        panels.open(h.panel)
      }
    },
    toggleNight() {
      setNight(!state.night)
    },
    get night() {
      return state.night
    },
    focus() {
      canvas.focus({ preventScroll: true })
    },
  }
}
