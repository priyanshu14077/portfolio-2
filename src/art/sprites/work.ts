// Work half: desks, arcade cabinets, server rack, kiosk, plants, ops props.
// Light comes from the top-left. Outlines are tinted from the material they wrap (selout).

import { type Ctx, line, oval, px, rect, rrect, shade } from '../draw'
import { pixelText, textWidth } from '../font'
import { C, type DrawFn } from './palette'

// ---------- shared helpers ----------

/** Blend two #rrggbb colours; t = 0 gives a, t = 1 gives b. */
function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = [16, 8, 0].map((s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t))
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('')
}

/**
 * Coloured outline: every transparent pixel touching the sprite takes a dark
 * tint of the material next to it. Lit edges (top, left) get a lighter tint,
 * shadow edges (right, bottom) a deeper one.
 */
function selout(g: Ctx, ink: string = C.line): void {
  const { width: w, height: h } = g.canvas
  const img = g.getImageData(0, 0, w, h)
  const src = new Uint8ClampedArray(img.data)
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && (src[(y * w + x) * 4 + 3] ?? 0) === 255
  // [dx, dy, darkness]: neighbour below => we sit on its top (lit) edge
  const probes: [number, number, number][] = [
    [0, 1, 0.55],
    [1, 0, 0.62],
    [-1, 0, 0.8],
    [0, -1, 0.8],
  ]
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if ((src[(y * w + x) * 4 + 3] ?? 0) !== 0) continue
      for (const [dx, dy, t] of probes) {
        if (!solid(x + dx, y + dy)) continue
        const i = ((y + dy) * w + x + dx) * 4
        const hex = '#' + [src[i], src[i + 1], src[i + 2]].map((v) => (v ?? 0).toString(16).padStart(2, '0')).join('')
        const o = parseInt(mix(hex, ink, t).slice(1), 16)
        const j = (y * w + x) * 4
        img.data[j] = (o >> 16) & 255
        img.data[j + 1] = (o >> 8) & 255
        img.data[j + 2] = o & 255
        img.data[j + 3] = 255
        break
      }
    }
  g.putImageData(img, 0, 0)
}

/** Paint behind what is already drawn (floor shadows, under-desk dark). */
function behind(g: Ctx, draw: () => void): void {
  g.save()
  g.globalCompositeOperation = 'destination-over'
  draw()
  g.restore()
}

const SHADOW = 'rgba(8,22,70,0.32)'

// dark plastics (monitors, keyboards, bezels)
const P = { hi: '#4f5f98', lt: '#3a4778', mid: '#2a3358', lo: '#1b2240', deep: '#11162c' }
const CABLE = '#1d2444'

function mug(g: Ctx, x: number, y: number, col: string): void {
  rect(g, x, y + 1, 4, 4, col)
  rect(g, x, y + 1, 1, 4, shade(col, 0.3))
  rect(g, x + 3, y + 1, 1, 4, shade(col, -0.22))
  rect(g, x, y + 4, 4, 1, shade(col, -0.3))
  rect(g, x, y, 4, 1, shade(col, 0.45))
  rect(g, x + 1, y, 2, 1, '#4a2a16')
  px(g, x + 4, y + 2, shade(col, -0.22))
  px(g, x + 4, y + 3, shade(col, -0.32))
}


// ---------- workstations ----------

type Deco = (g: Ctx) => void

function workstation(label: string, textCol: string, screenUi: Deco, side: Deco, mugCol: string, extra: Deco): DrawFn {
  return (g) => {
    // desk top surface (deep 3/4 face), lip, front apron
    rect(g, 1, 18, 50, 6, C.woodLight)
    rect(g, 1, 18, 50, 1, shade(C.woodLight, -0.1))
    rect(g, 4, 20, 12, 1, shade(C.woodLight, -0.06))
    rect(g, 33, 22, 10, 1, shade(C.woodLight, -0.06))
    rect(g, 1, 24, 50, 1, C.woodHi)
    rect(g, 1, 25, 50, 2, C.woodMid)
    rect(g, 1, 27, 50, 1, C.wood)
    rect(g, 48, 25, 3, 3, shade(C.woodMid, -0.18))
    // left leg panel
    rect(g, 2, 28, 4, 10, C.woodMid)
    rect(g, 2, 28, 1, 10, C.woodLight)
    rect(g, 5, 28, 1, 10, C.wood)
    rect(g, 2, 28, 4, 1, C.woodDark)
    // right drawer pedestal, shadow side on the right
    rect(g, 36, 28, 14, 10, C.woodMid)
    rect(g, 36, 28, 14, 1, C.woodDark)
    rect(g, 47, 28, 3, 10, C.wood)
    rect(g, 49, 28, 1, 10, C.woodDark)
    for (const dy of [29, 33]) {
      rect(g, 37, dy, 10, 3, C.woodLight)
      rect(g, 37, dy, 10, 1, C.woodHi)
      rect(g, 37, dy + 2, 10, 1, C.woodMid)
      rect(g, 40, dy + 1, 4, 1, C.steelHi)
      px(g, 43, dy + 1, C.steel)
    }
    rect(g, 36, 37, 14, 1, C.wood)

    // monitor stand + housing + screen
    rect(g, 24, 15, 4, 4, P.mid)
    rect(g, 24, 15, 1, 4, P.lt)
    rect(g, 27, 15, 1, 4, P.lo)
    rect(g, 21, 19, 10, 1, P.lt)
    rect(g, 20, 20, 12, 1, P.lo)
    side(g)
    rect(g, 9, 1, 34, 15, P.mid)
    rect(g, 9, 1, 34, 1, P.hi)
    rect(g, 9, 1, 1, 14, P.lt)
    rect(g, 42, 2, 1, 14, P.lo)
    rect(g, 9, 15, 34, 1, P.lo)
    rect(g, 10, 2, 32, 1, P.deep)
    rect(g, 11, 3, 30, 10, C.screen)
    rect(g, 11, 3, 30, 1, C.screenHi)
    rect(g, 11, 12, 30, 1, '#08122f')
    for (const [cx, cy] of [[11, 3], [40, 3], [11, 12], [40, 12]] as const) px(g, cx, cy, '#08122f')
    pixelText(g, label, 11 + Math.floor((30 - textWidth(label)) / 2), 4, textCol)
    screenUi(g)
    px(g, 25, 14, P.hi)
    px(g, 26, 14, P.hi)
    px(g, 40, 14, C.leaf)

    // cable from the monitor, over the desk, off the right end
    rect(g, 49, 25, 1, 3, CABLE)
    rect(g, 48, 28, 1, 4, CABLE)
    rect(g, 49, 32, 1, 2, CABLE)

    // keyboard
    rect(g, 15, 20, 18, 4, P.mid)
    rect(g, 15, 20, 18, 1, P.hi)
    rect(g, 15, 23, 18, 1, P.deep)
    for (let x = 16; x < 31; x += 3) rect(g, x, 21, 2, 1, '#6a7bb0')
    rect(g, 16, 22, 3, 1, '#6a7bb0')
    rect(g, 20, 22, 8, 1, '#7d8ec2')
    rect(g, 29, 22, 3, 1, '#6a7bb0')
    // mouse pad + mouse
    rect(g, 34, 20, 6, 4, C.cobaltDeep)
    rect(g, 34, 20, 6, 1, C.cobalt)
    rect(g, 36, 21, 2, 2, C.steelHi)
    px(g, 37, 22, C.steel)
    px(g, 36, 21, C.ink)
    // mug
    mug(g, 44, 18, mugCol)
    line(g, 37, 20, 39, 18, CABLE)
    rect(g, 40, 17, 2, 1, CABLE)
    extra(g)

    // chair seen from behind
    rect(g, 17, 29, 2, 5, P.mid)
    rect(g, 17, 29, 2, 1, P.hi)
    rect(g, 33, 29, 2, 5, P.lo)
    rect(g, 33, 29, 2, 1, P.lt)
    rrect(g, 19, 24, 14, 10, 3, C.cobaltDeep)
    rrect(g, 20, 25, 12, 8, 2, C.cobalt)
    rect(g, 22, 25, 6, 1, C.cobaltRaised)
    rect(g, 21, 26, 2, 1, C.cobaltRaised)
    rect(g, 20, 27, 1, 3, C.cobaltRaised)
    rect(g, 31, 27, 1, 4, shade(C.cobalt, -0.2))
    rect(g, 22, 30, 8, 1, C.cobaltDeep)
    rect(g, 17, 34, 18, 2, '#14306f')
    rect(g, 18, 34, 16, 1, C.cobalt)
    rect(g, 25, 36, 2, 1, C.steel)
    px(g, 25, 36, C.steelHi)
    rect(g, 19, 37, 14, 1, P.mid)
    rect(g, 24, 37, 4, 1, P.lt)
    for (const wx of [19, 25, 26, 32]) px(g, wx, 38, P.deep)

    selout(g)
    px(g, 13, 4, 'rgba(255,255,255,0.18)')
    behind(g, () => {
      rect(g, 6, 28, 30, 11, 'rgba(8,22,70,0.4)')
      rect(g, 3, 38, 49, 2, SHADOW)
      rect(g, 50, 28, 2, 11, SHADOW)
    })
  }
}

// --- screen UIs (main monitor, rows 9..12 below the label) ---
const uiCards: Deco = (g) => {
  const cols = [C.cobaltHi, C.sun, C.leaf]
  cols.forEach((c, i) => {
    const x = 13 + i * 9
    rect(g, x, 10, 7, 2, '#c9d8ff')
    rect(g, x, 10, 7, 1, c)
    rect(g, x + 1, 11, 3, 1, C.steel)
  })
}
const uiRing: Deco = (g) => {
  rect(g, 13, 11, 7, 1, '#5a4a1e')
  rect(g, 32, 11, 7, 1, '#5a4a1e')
  px(g, 13, 11, C.sunDeep)
  px(g, 38, 11, C.sunDeep)
  const S = C.sun
  const D = C.sunDeep
  const H = C.sunHi
  const I = C.ink
  const rows: [number, string][][] = [
    [[24, H], [25, I], [26, S]],
    [[23, H], [27, D]],
    [[24, S], [25, D], [26, D]],
  ]
  rows.forEach((r, i) => r.forEach(([x, c]) => px(g, x, 10 + i, c)))
}
const uiChart: Deco = (g) => {
  const ys = [12, 11, 12, 11, 11, 10, 11, 10, 10, 10]
  ys.forEach((y, i) => {
    const x = 12 + i * 3
    const ny = ys[i + 1] ?? y
    rect(g, x, y + 1, 3, 12 - y, '#145a3a')
    if (i < ys.length - 1) line(g, x, y, x + 3, ny, C.leaf)
  })
  px(g, 39, 10, C.sun)
}

// --- left-side props ---
const sidePortrait: Deco = (g) => {
  rect(g, 3, 15, 2, 4, P.lo)
  rect(g, 2, 19, 5, 1, P.lt)
  rect(g, 1, 4, 7, 12, P.mid)
  rect(g, 1, 4, 7, 1, P.hi)
  rect(g, 1, 4, 1, 12, P.lt)
  rect(g, 2, 5, 5, 9, C.screen)
  rect(g, 2, 5, 5, 1, C.screenHi)
  for (const [y, c] of [[7, C.sun], [10, C.cobaltHi]] as const) {
    rect(g, 3, y, 3, 2, '#c9d8ff')
    px(g, 3, y, c)
  }
  rect(g, 3, 13, 2, 1, C.leaf)
}
const sideLampRingbox: Deco = (g) => {
  // brass desk lamp
  rect(g, 1, 18, 5, 2, C.sunDeep)
  rect(g, 1, 18, 5, 1, C.sun)
  line(g, 2, 17, 2, 10, '#b07a12')
  line(g, 2, 10, 4, 8, '#b07a12')
  px(g, 2, 13, C.sun)
  rect(g, 3, 5, 4, 3, C.sun)
  rect(g, 3, 5, 4, 1, C.sunHi)
  rect(g, 2, 7, 6, 1, C.sunDeep)
  rect(g, 3, 8, 4, 1, '#fff2b8')
}
const extraRingbox: Deco = (g) => {
  // open velvet ring box with a gold ring, front-left of the keyboard
  rect(g, 7, 18, 6, 2, '#3a1c4a')
  rect(g, 7, 18, 6, 1, '#5a2e6e')
  rect(g, 7, 20, 6, 3, '#5a2e6e')
  rect(g, 7, 20, 6, 1, '#7a4590')
  rect(g, 7, 22, 6, 1, '#3a1c4a')
  px(g, 9, 19, C.sun)
  px(g, 10, 19, C.sunDeep)
  px(g, 9, 18, C.sunHi)
  px(g, 10, 18, C.ink)
}
const sideLaptop: Deco = (g) => {
  rect(g, 2, 11, 8, 7, P.mid)
  rect(g, 2, 11, 8, 1, P.hi)
  rect(g, 3, 12, 6, 5, C.screen)
  const bars: [number, number, string][] = [[3, 3, C.leaf], [5, 2, C.leafDeep], [7, 4, C.sun]]
  for (const [x, hgt, c] of bars) rect(g, x, 17 - hgt, 1, hgt, c)
  px(g, 4, 16, C.leafHi)
  rect(g, 1, 18, 10, 2, C.steelHi)
  rect(g, 1, 19, 10, 1, C.steel)
  rect(g, 4, 19, 4, 1, C.steelHi)
}
const extraSticky: Deco = (g) => {
  rect(g, 40, 1, 3, 3, C.sun)
  rect(g, 40, 3, 3, 1, C.sunDeep)
  px(g, 42, 1, C.sunHi)
}
const extraNotebook: Deco = (g) => {
  rect(g, 7, 20, 6, 4, C.cream)
  rect(g, 7, 20, 6, 1, '#fffaf0')
  rect(g, 7, 20, 1, 4, C.red)
  rect(g, 9, 21, 3, 1, C.steel)
  rect(g, 9, 22, 2, 1, C.leaf)
}

// ---------- arcade cabinets ----------

type ScreenFn = (g: Ctx, x: number, y: number, w: number, h: number) => void

function arcade(label: string, body: string, accent: string, buttons: [string, string, string], screen: ScreenFn): DrawFn {
  return (g, w) => {
    const B = { hi: shade(body, 0.4), lt: shade(body, 0.2), mid: body, dk: shade(body, -0.3), deep: shade(body, -0.55) }
    const half = Math.ceil(label.length / 2)
    const lines = textWidth(label) <= w - 4 ? [label] : [label.slice(0, half), label.slice(half)]
    const mh = lines.length * 6 + 3
    const R = w - 2 // rightmost body column
    // body: lit side panel (x1..3), T-molding (x4), front (x5..R)
    rect(g, 1, 1, R, 36, B.mid)
    rect(g, 1, 1, 3, 36, B.lt)
    rect(g, 1, 1, 1, 36, B.hi)
    rect(g, 4, mh + 1, 1, 35 - mh, accent)
    rect(g, R, 1, 1, 36, B.dk)
    // side art: accent stripe running down the side panel, broken by the control panel
    rect(g, 2, mh + 3, 1, 9, shade(accent, -0.1))
    rect(g, 2, 29, 1, 5, shade(accent, -0.1))
    // marquee: backlit panel with dark lettering
    rect(g, 1, 1, R, mh, B.deep)
    rect(g, 1, 1, R, 1, B.dk)
    rect(g, 2, 2, R - 2, mh - 2, shade(accent, 0.35))
    rect(g, 2, 2, R - 2, 1, shade(accent, 0.65))
    rect(g, 2, mh - 1, R - 2, 1, accent)
    rect(g, 2, 2, 1, mh - 2, shade(accent, 0.55))
    const ink = mix(body, '#060c24', 0.55)
    lines.forEach((t, i) => pixelText(g, t, Math.floor((w - textWidth(t)) / 2), 3 + i * 6, ink))
    // overhang shadow under the marquee
    rect(g, 1, mh + 1, R, 1, B.deep)
    // screen bezel and CRT
    const sy = mh + 2
    rect(g, 5, sy, R - 5, 23 - sy, '#161c36')
    rect(g, 5, sy, R - 5, 1, '#232b4d')
    rect(g, 6, sy + 1, R - 7, 21 - sy, '#0a0f24')
    const sx = 7
    const sw = R - 9
    const sh = 21 - sy - 2
    rect(g, sx, sy + 2, sw, sh, C.screen)
    rect(g, sx, sy + 2, sw, 1, C.screenHi)
    screen(g, sx, sy + 2, sw, sh)
    for (const [cx, cy] of [[sx, sy + 2], [sx + sw - 1, sy + 2], [sx, sy + 1 + sh], [sx + sw - 1, sy + 1 + sh]] as const)
      px(g, cx, cy, '#0a0f24')
    // control panel: lit top face and trimmed front lip
    rect(g, 1, 23, R, 3, B.hi)
    rect(g, 1, 23, R, 1, shade(B.hi, 0.25))
    rect(g, R, 23, 1, 3, B.lt)
    rect(g, 1, 26, R, 1, accent)
    rect(g, 1, 27, R, 1, B.deep)
    // joystick
    rect(g, 7, 25, 3, 1, P.deep)
    px(g, 8, 24, C.steelHi)
    rect(g, 7, 22, 2, 2, C.red)
    px(g, 7, 22, '#ff9aa0')
    px(g, 8, 23, shade(C.red, -0.3))
    // buttons
    buttons.forEach((c, i) => {
      const bx = 13 + i * 3
      rect(g, bx, 24, 2, 1, shade(c, 0.35))
      rect(g, bx, 25, 2, 1, shade(c, -0.25))
    })
    // lower cabinet: shadow under the panel, coin door, kick plate
    rect(g, 5, 28, R - 5, 1, B.dk)
    rect(g, R - 4, 29, 3, 6, shade(body, -0.12))
    rect(g, 5, 29, 1, 6, shade(body, 0.08))
    const dx = Math.floor((5 + R) / 2) - 3
    rect(g, dx, 29, 7, 6, C.steelLo)
    rect(g, dx, 29, 7, 1, C.steelHi)
    rect(g, dx, 29, 1, 6, C.steel)
    rect(g, dx + 1, 30, 5, 4, C.steel)
    rect(g, dx + 2, 31, 1, 2, C.sun)
    rect(g, dx + 4, 31, 1, 2, C.sun)
    rect(g, dx + 2, 30, 1, 1, C.sunHi)
    rect(g, dx + 4, 30, 1, 1, C.sunHi)
    rect(g, dx + 2, 33, 3, 1, C.steelLo)
    rect(g, 1, 35, R, 2, B.deep)
    rect(g, 1, 35, 3, 2, B.dk)
    g.clearRect(R, 28, 1, 9)
    rect(g, R - 1, 28, 1, 9, B.dk)
    selout(g)
    // glass glint on the CRT
    px(g, sx + 1, sy + 3, 'rgba(255,255,255,0.45)')
    px(g, sx + 2, sy + 3, 'rgba(255,255,255,0.2)')
    px(g, sx + 1, sy + 4, 'rgba(255,255,255,0.2)')
  }
}

const screenTether: ScreenFn = (g, x, y, w, h) => {
  const mid = Math.floor(w / 2) - 1
  const lo = y + h - 3
  const a: [number, number] = [x + 1, lo]
  const b: [number, number] = [x + mid, y + 2]
  const c: [number, number] = [x + w - 3, lo]
  line(g, a[0] + 1, a[1], b[0], b[1] + 1, C.cobaltHi)
  line(g, b[0] + 1, b[1] + 1, c[0], c[1], C.cobaltHi)
  for (let i = a[0] + 3; i < c[0]; i += 2) px(g, i, lo + 1, '#2a4aa0')
  const node = (n: [number, number], col: string) => {
    rect(g, n[0], n[1], 2, 2, shade(col, -0.25))
    px(g, n[0], n[1], col)
  }
  node(a, C.leaf)
  node(b, C.sun)
  node(c, C.leaf)
  px(g, x + Math.floor(mid / 2) + 1, y + Math.floor(h / 2), C.ink)
}
const screenVoice: ScreenFn = (g, x, y, w, h) => {
  const amp = [1, 2, 3, 2, 4, 3, 2, 3, 1]
  const mid = y + Math.floor(h / 2)
  rect(g, x, mid, w, 1, '#2a3d80')
  for (let i = 0; i * 2 < w; i++) {
    const a = Math.min(Math.floor(h / 2) - 1, amp[i % amp.length] ?? 1)
    const bx = x + i * 2
    rect(g, bx, mid - a, 1, a * 2 + 1, C.sunDeep)
    rect(g, bx, mid - a + 1, 1, Math.max(1, a * 2 - 1), C.sun)
    if (a >= 3) rect(g, bx, mid - 1, 1, 3, C.sunHi)
  }
}
const screenBid: ScreenFn = (g, x, y, w, h) => {
  const pw = 7
  const ph = Math.min(h - 1, 8)
  const px0 = x + Math.floor((w - pw) / 2) - 2
  const py0 = y + Math.floor((h - ph) / 2)
  rect(g, px0 + 1, py0 + 1, pw, ph, '#06102e')
  rect(g, px0, py0, pw, ph, C.ink)
  rect(g, px0, py0 + ph - 1, pw, 1, C.muted)
  rect(g, px0 + pw - 2, py0, 2, 2, C.muted)
  px(g, px0 + pw - 1, py0, C.screen)
  rect(g, px0 + 1, py0 + 2, 3, 1, C.cobalt)
  rect(g, px0 + 1, py0 + 4, 5, 1, C.steel)
  rect(g, px0 + 1, py0 + 5, 4, 1, C.steel)
  // sun seal: the winning bid
  const sx = px0 + pw - 1
  const sy = py0 + ph - 4
  rect(g, sx, sy, 3, 3, C.sun)
  px(g, sx, sy, C.sunHi)
  px(g, sx + 2, sy + 2, C.sunDeep)
  px(g, sx + 1, sy + 1, C.sunDeep)
}

// ---------- server rack ----------
// The engine overlays 2x1 LEDs at (16, 6 + row*5) for rows 0..5; each unit
// carries a dark recessed socket around that spot.

function serverRack(g: Ctx, w: number, h: number): void {
  const F = { hi: '#4a5ca0', lt: '#34447e', mid: '#232d58', lo: '#161d3c', deep: '#0c1230' }
  rect(g, 1, 1, w - 2, h - 2, F.mid)
  // top face
  rect(g, 1, 1, w - 2, 3, F.lt)
  rect(g, 1, 1, w - 2, 1, F.hi)
  for (let x = 5; x < 17; x += 3) rect(g, x, 2, 2, 1, F.mid)
  // posts: lit left, shadowed right
  rect(g, 1, 4, 2, h - 6, F.lt)
  rect(g, 1, 4, 1, h - 6, F.hi)
  rect(g, w - 3, 4, 2, h - 6, F.lo)
  rect(g, w - 2, 4, 1, h - 6, F.deep)
  const kinds = ['srv', 'switch', 'srv', 'disk', 'srv', 'disk'] as const
  kinds.forEach((k, i) => {
    const y = 4 + i * 5
    rect(g, 3, y, 16, 5, '#2b3666')
    rect(g, 3, y, 16, 1, '#3d4a86')
    rect(g, 3, y + 4, 16, 1, F.deep)
    px(g, 3, y + 1, '#3d4a86')
    // LED socket for the engine's blink
    rect(g, 15, y + 1, 4, 3, F.deep)
    px(g, 16, y + 2, C.leafDeep)
    px(g, 17, y + 2, C.leafDeep)
    if (k === 'srv') {
      px(g, 4, y + 2, C.leaf)
      for (let vx = 7; vx < 14; vx += 2) rect(g, vx, y + 1, 1, 3, F.lo)
    } else if (k === 'switch') {
      for (let pxx = 4; pxx < 14; pxx += 2) {
        px(g, pxx, y + 2, F.deep)
        px(g, pxx, y + 1, pxx % 4 === 0 ? C.sun : C.leaf)
      }
    } else {
      for (let d = 0; d < 4; d++) {
        const dx = 4 + d * 3
        rect(g, dx, y + 1, 2, 3, '#45548f')
        px(g, dx, y + 1, '#5d6eb0')
        px(g, dx + 1, y + 3, F.lo)
      }
    }
  })
  // blank panel + PDU with vents
  rect(g, 3, 34, 16, 5, '#202a52')
  rect(g, 3, 34, 16, 1, '#2f3b70')
  for (const vy of [35, 37]) rect(g, 5, vy, 9, 1, F.deep)
  rect(g, 15, 35, 3, 2, C.sun)
  px(g, 15, 35, C.sunHi)
  // plinth + casters
  rect(g, 1, 39, w - 2, 3, F.lo)
  rect(g, 1, 39, w - 2, 1, F.lt)
  rect(g, 2, 42, 2, 1, F.deep)
  rect(g, w - 4, 42, 2, 1, F.deep)
  // patch cables from the switch, looping out of the rack
  const loop = (x0: number, x1: number, drop: number, c: string) => {
    rect(g, x0, 11, 1, drop, c)
    rect(g, x1, 11, 1, drop, c)
    rect(g, x0 + 1, 11 + drop, x1 - x0 - 1, 1, shade(c, -0.2))
  }
  loop(4, 8, 4, C.sun)
  loop(10, 12, 3, C.cobaltHi)
  selout(g)
  // faint glass sheen on the front door
  line(g, 5, 8, 11, 2, 'rgba(255,255,255,0.06)')
  behind(g, () => rect(g, w - 2, 6, 2, h - 6, SHADOW))
}

// ---------- kiosk ----------

function kiosk(g: Ctx, w: number): void {
  // base, post
  oval(g, 2, 25, w - 4, 4, C.steelLo)
  oval(g, 2, 25, w - 4, 3, C.steel)
  rect(g, 4, 25, w - 8, 1, C.steelHi)
  rect(g, 7, 14, 2, 12, C.steel)
  rect(g, 7, 14, 1, 12, C.steelHi)
  rect(g, 8, 14, 1, 12, C.steelLo)
  rect(g, 7, 19, 2, 2, C.sun)
  px(g, 7, 19, C.sunHi)
  // head: 3/4 top face + housing
  rect(g, 1, 1, w - 2, 13, P.mid)
  rect(g, 1, 1, w - 2, 2, P.lt)
  rect(g, 2, 1, w - 4, 1, P.hi)
  rect(g, 1, 3, 1, 10, P.lt)
  rect(g, w - 2, 3, 1, 10, P.lo)
  rect(g, 1, 13, w - 2, 1, P.lo)
  rect(g, 2, 3, w - 4, 1, P.deep)
  // screen
  rect(g, 3, 4, w - 6, 8, C.screen)
  rect(g, 3, 4, w - 6, 1, C.screenHi)
  rect(g, 4, 5, 6, 1, '#3d5bb0')
  pixelText(g, '>', 4, 6, C.leafHi)
  rect(g, 8, 10, 2, 1, C.sun)
  px(g, 12, 13, C.leaf)
  // keypad ledge
  rect(g, 2, 14, w - 4, 2, C.steel)
  rect(g, 2, 14, w - 4, 1, C.steelHi)
  for (let x = 4; x < w - 4; x += 2) px(g, x, 15, C.steelLo)
  selout(g)
  px(g, 11, 5, 'rgba(255,255,255,0.35)')
  behind(g, () => rect(g, 4, 28, w - 6, 1, SHADOW))
}

// ---------- tall plant (variegated snake plant in a glazed pot) ----------

function plantTall(g: Ctx): void {
  const blade = (cx: number, top: number, lean: number, back: boolean) => {
    const base = 20
    for (let y = top; y < base; y++) {
      const t = (y - top) / (base - top)
      const wd = t < 0.1 ? 1 : t < 0.3 ? 2 : 3
      const x = Math.round(cx + lean * (1 - t) ** 1.6) - Math.floor(wd / 2)
      rect(g, x, y, wd, 1, back ? C.leafDeep : C.leaf)
      if (wd > 1) {
        px(g, x, y, back ? C.leaf : '#c9d65a')
        px(g, x + wd - 1, y, back ? '#1a6a30' : C.leafDeep)
      } else px(g, x, y, back ? C.leaf : C.leafHi)
    }
  }
  blade(5, 5, -4, true)
  blade(9, 4, 4, true)
  blade(7, 1, -1, false)
  blade(9, 10, 3, false)
  // pot: cream glaze with a cobalt band
  const pot = { hi: '#fffaf0', mid: C.cream, sh: '#d9c9a3', dk: '#a8956c' }
  rect(g, 2, 20, 10, 2, pot.mid)
  rect(g, 2, 20, 10, 1, pot.hi)
  rect(g, 3, 20, 8, 1, C.soil)
  for (let r = 0; r < 6; r++) {
    const ins = r >= 4 ? 1 : 0
    rect(g, 3 + ins, 22 + r, 8 - ins * 2, 1, pot.mid)
    px(g, 3 + ins, 22 + r, pot.hi)
    rect(g, 9 - ins, 22 + r, 2, 1, pot.sh)
  }
  rect(g, 3, 22, 8, 1, pot.sh)
  rect(g, 3, 24, 8, 2, C.cobalt)
  rect(g, 3, 24, 8, 1, C.cobaltRaised)
  rect(g, 9, 24, 2, 2, C.cobaltDeep)
  rect(g, 4, 28, 6, 1, pot.dk)
  selout(g)
  behind(g, () => rect(g, 4, 29, 8, 1, SHADOW))
}

// ---------- ops table ----------

function opsTable(g: Ctx, w: number): void {
  // legs + crossbeam (graphite standing-desk frame)
  for (const lx of [6, 50]) {
    rect(g, lx, 17, 3, 6, P.mid)
    rect(g, lx, 17, 1, 6, P.hi)
    rect(g, lx + 2, 17, 1, 6, P.lo)
    rect(g, lx - 2, 23, 7, 1, P.lt)
    rect(g, lx - 2, 24, 7, 1, P.lo)
  }
  rect(g, 9, 18, 41, 2, P.lo)
  rect(g, 9, 18, 41, 1, P.mid)
  // top
  rect(g, 1, 6, w - 2, 9, C.woodLight)
  rect(g, 1, 6, w - 2, 1, shade(C.woodLight, -0.1))
  rect(g, 40, 13, 12, 1, shade(C.woodLight, -0.06))
  rect(g, 1, 15, w - 2, 1, C.woodHi)
  rect(g, 1, 16, w - 2, 1, C.woodMid)
  rect(g, 1, 17, w - 2, 1, C.wood)
  rect(g, w - 4, 16, 3, 2, shade(C.wood, -0.15))
  // laptop (screen toward the viewer)
  rect(g, 4, 1, 10, 7, P.mid)
  rect(g, 4, 1, 10, 1, P.hi)
  rect(g, 5, 2, 8, 5, C.screen)
  rect(g, 5, 2, 8, 1, C.screenHi)
  rect(g, 6, 3, 3, 1, C.sun)
  rect(g, 7, 4, 4, 1, C.cobaltHi)
  rect(g, 7, 5, 2, 1, C.leaf)
  rect(g, 3, 8, 12, 3, C.steelHi)
  rect(g, 3, 10, 12, 1, C.steel)
  for (let x = 4; x < 14; x += 2) px(g, x, 8, C.steel)
  rect(g, 7, 9, 4, 1, C.steel)
  // architecture printout: boxes and arrows
  const paper = '#eef3ff'
  rect(g, 18, 7, 22, 7, '#c3cde4')
  rect(g, 17, 6, 22, 7, paper)
  rect(g, 17, 6, 22, 1, '#ffffff')
  const boxAt = (x: number, y: number, fill: string) => {
    rect(g, x, y, 5, 3, C.cobalt)
    rect(g, x + 1, y + 1, 3, 1, fill)
  }
  boxAt(19, 7, C.ink)
  boxAt(26, 7, C.sun)
  boxAt(33, 7, C.ink)
  boxAt(26, 10, C.leafHi)
  rect(g, 24, 8, 2, 1, C.cobaltDeep)
  rect(g, 31, 8, 2, 1, C.cobaltDeep)
  px(g, 28, 10, C.cobaltDeep)
  px(g, 21, 11, C.red)
  px(g, 22, 11, C.red)
  rect(g, 34, 11, 3, 1, C.steel)
  // sticky notes
  const note = (x: number, y: number, c: string) => {
    rect(g, x, y, 3, 3, c)
    rect(g, x, y + 2, 3, 1, shade(c, -0.18))
    px(g, x + 2, y, shade(c, 0.4))
  }
  note(41, 7, C.sun)
  note(45, 8, C.leafHi)
  note(42, 11, '#ff8fa3')
  // mugs
  mug(g, 49, 6, C.cobaltRaised)
  mug(g, 53, 9, C.sun)
  selout(g)
  px(g, 6, 2, 'rgba(255,255,255,0.3)')
  behind(g, () => {
    rect(g, 3, 18, w - 4, 7, 'rgba(8,22,70,0.28)')
  })
}

// ---------- water cooler ----------

function waterCooler(g: Ctx): void {
  const W = { hi: '#e0ecff', air: '#c6dcff', lt: '#9cc4ff', mid: C.cobaltHi, dk: C.cobaltRaised }
  const Wh = { hi: '#ffffff', base: C.ink, mid: '#d8e2f5', sh: '#aab8d6', dk: '#7d8db3' }
  // cabinet
  rect(g, 1, 11, 8, 15, Wh.base)
  rect(g, 1, 11, 8, 2, Wh.mid)
  rect(g, 1, 11, 8, 1, Wh.hi)
  rect(g, 1, 13, 1, 13, Wh.hi)
  rect(g, 8, 13, 1, 13, Wh.sh)
  // tap recess, taps, drip tray
  rect(g, 2, 14, 6, 6, Wh.sh)
  rect(g, 2, 14, 6, 1, Wh.dk)
  rect(g, 3, 15, 1, 2, C.red)
  px(g, 3, 15, '#ff9aa0')
  rect(g, 6, 15, 1, 2, C.cobaltRaised)
  px(g, 6, 15, C.cobaltHi)
  rect(g, 2, 19, 6, 1, C.steelLo)
  rect(g, 3, 19, 4, 1, C.steel)
  // lower door
  rect(g, 2, 21, 6, 4, Wh.mid)
  rect(g, 2, 21, 6, 1, Wh.sh)
  px(g, 7, 23, Wh.dk)
  rect(g, 2, 26, 2, 1, Wh.dk)
  rect(g, 6, 26, 2, 1, Wh.dk)
  // cup dispenser on the side
  rect(g, 9, 13, 2, 7, Wh.mid)
  rect(g, 9, 13, 1, 7, Wh.hi)
  for (let y = 14; y < 20; y += 2) px(g, 10, y, Wh.sh)
  rect(g, 9, 20, 2, 1, Wh.dk)
  // bottle
  rect(g, 3, 10, 4, 1, W.dk)
  rect(g, 2, 4, 6, 6, W.mid)
  rect(g, 3, 3, 4, 1, W.lt)
  rect(g, 2, 4, 6, 1, W.air)
  rect(g, 2, 5, 6, 1, W.lt)
  rect(g, 7, 5, 1, 5, W.dk)
  rect(g, 2, 9, 6, 1, W.dk)
  rect(g, 3, 5, 1, 4, W.hi)
  rect(g, 4, 1, 2, 2, C.cobaltDeep)
  px(g, 4, 1, C.cobaltRaised)
  selout(g)
  behind(g, () => rect(g, 2, 27, 10, 1, SHADOW))
}

// ---------- shipping boxes + cable coil ----------

function boxes(g: Ctx): void {
  const K = { hi: '#efcd98', lt: '#ddae74', mid: '#c48d55', sh: '#a7703f', dk: '#7d5029' }
  const tape = '#f6e2b8'
  // bottom box
  rect(g, 1, 7, 14, 4, K.lt)
  rect(g, 1, 7, 14, 1, K.hi)
  rect(g, 7, 7, 2, 4, tape)
  rect(g, 1, 11, 14, 6, K.mid)
  rect(g, 1, 11, 14, 1, K.hi)
  rect(g, 11, 12, 4, 5, K.sh)
  rect(g, 1, 16, 14, 1, K.sh)
  // shipping label
  rect(g, 3, 12, 5, 3, C.ink)
  rect(g, 4, 13, 3, 1, C.steel)
  px(g, 7, 12, C.red)
  // top box, taped
  rect(g, 3, 2, 10, 3, K.lt)
  rect(g, 3, 2, 10, 1, K.hi)
  rect(g, 3, 5, 10, 5, K.mid)
  rect(g, 3, 5, 10, 1, K.hi)
  rect(g, 10, 6, 3, 4, K.sh)
  rect(g, 7, 2, 2, 5, tape)
  px(g, 7, 2, '#fff6e0')
  rect(g, 7, 6, 2, 1, shade(tape, -0.12))
  rect(g, 3, 9, 10, 1, K.sh)
  // cable coil leaning on the right
  oval(g, 11, 10, 6, 7, '#3d4a86')
  oval(g, 12, 11, 4, 5, K.sh)
  oval(g, 13, 12, 2, 3, K.dk)
  px(g, 12, 10, '#7086d0')
  px(g, 13, 10, '#7086d0')
  px(g, 11, 12, '#5d6eb0')
  px(g, 16, 13, '#28325e')
  px(g, 16, 14, '#28325e')
  px(g, 15, 16, '#28325e')
  rect(g, 16, 16, 1, 1, C.sun)
  selout(g, '#2a1a10')
  behind(g, () => rect(g, 2, 17, 15, 1, SHADOW))
}

// ---------- mesh trash bin ----------

function trashBin(g: Ctx): void {
  // body: mesh over a dark interior
  for (let y = 4; y < 9; y++) {
    const ins = y === 8 ? 1 : 0
    for (let x = 1 + ins; x < 7 - ins; x++) px(g, x, y, (x + y) % 2 ? C.steel : P.lo)
  }
  rect(g, 1, 4, 1, 4, C.steelHi)
  rect(g, 6, 4, 1, 4, C.steelLo)
  // rim
  rect(g, 1, 3, 6, 1, C.steelHi)
  rect(g, 2, 2, 4, 1, P.mid)
  // crumpled paper
  rect(g, 2, 1, 2, 2, C.ink)
  px(g, 3, 2, C.muted)
  px(g, 4, 2, C.cream)
  px(g, 5, 2, C.muted)
  selout(g)
}

export const WORK = {
  ops_table: (g, w) => opsTable(g, w),
  water_cooler: waterCooler,
  boxes,
  trash_bin: trashBin,
  ws_proploy: workstation('PROPLOY', C.ink, uiCards, sidePortrait, C.sun, extraSticky),
  ws_dunne: workstation('DUNNE', C.sun, uiRing, sideLampRingbox, C.ink, extraRingbox),
  ws_emtech: workstation('EMTECH', C.leafHi, uiChart, sideLaptop, C.red, extraNotebook),
  arcade_tether: arcade('TETHER', C.leafDeep, C.leaf, [C.sun, C.leafHi, C.ink], screenTether),
  arcade_riverline: arcade('VOICE', '#7a4fd0', C.sun, [C.sun, C.cobaltHi, C.red], screenVoice),
  arcade_bidwright: arcade('BID', C.cobaltDeep, C.cobaltHi, [C.sun, C.leaf, C.red], screenBid),
  server_rack: serverRack,
  kiosk: (g, w) => kiosk(g, w),
  plant_tall: plantTall,
} satisfies Record<string, DrawFn>
