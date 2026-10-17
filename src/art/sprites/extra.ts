// Extra props that fill out the room: cable tray, whiteboard easel, coffee, fish tank,
// sneakers, monstera and a speaker shelf. Light comes from the top-left; outlines use the
// dark hue of each material with a lighter hue on lit (top/left) edges.

import { type Ctx, line, makeCanvas, oval, pattern, px, rect, shade } from '../draw'
import { C, type DrawFn } from './palette'

// ---------------------------------------------------------------- helpers

/** Coloured outline: `lit` where the shape is below/right of the pixel... i.e. on the
 *  shape's top/left edges, `dark` on its bottom/right edges. Optional region limit. */
function rim(g: Ctx, dark: string, lit: string, rx = 0, ry = 0, rw = 9999, rh = 9999): void {
  const { width: w, height: h } = g.canvas
  const a = g.getImageData(0, 0, w, h).data
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && (a[(y * w + x) * 4 + 3] ?? 0) > 0
  for (let y = Math.max(0, ry); y < Math.min(h, ry + rh); y++)
    for (let x = Math.max(0, rx); x < Math.min(w, rx + rw); x++) {
      if (solid(x, y)) continue
      const l = solid(x - 1, y)
      const t = solid(x, y - 1)
      if (!(l || t || solid(x + 1, y) || solid(x, y + 1))) continue
      g.fillStyle = l || t ? dark : lit
      g.fillRect(x, y, 1, 1)
    }
}

const W = {
  line: C.woodLine,
  lineLit: '#6b4426',
  dark: C.woodDark,
  base: C.wood,
  mid: C.woodMid,
  light: C.woodLight,
  hi: C.woodHi,
  back: '#4a2c16',
}

const ST = { line: '#2c3656', lo: C.steelLo, base: C.steel, hi: C.steelHi, spec: '#eef2fb' }

// ---------------------------------------------------------------- cable tray (wall)

function cableTray(g: Ctx, w: number): void {
  const hangers: number[] = []
  for (let x = 4; x < w - 8; x += 31) hangers.push(x)
  hangers.push(w - 6)

  // cables drooping under the tray between hangers: two per span, rotating which one stays tucked away
  const cables = [
    { col: C.cobaltRaised },
    { col: C.sun },
    { col: C.leaf },
  ]
  for (let s = 0; s < hangers.length - 1; s++) {
    const x0 = (hangers[s] ?? 0) + 2
    const x1 = hangers[s + 1] ?? w
    const deep = cables[s % 3]
    const shallow = cables[(s + 1) % 3]
    for (const [cb, d] of [[shallow, 1.3], [deep, 2.4]] as const) {
      if (!cb) continue
      for (let x = x0; x < x1; x++) {
        const t = (x - x0 + 0.5) / (x1 - x0)
        const y = 3 + Math.round(d * Math.sin(Math.PI * t))
        if (y < 3) continue
        px(g, x, y, cb.col)
      }
    }
  }

  // tray front rail: lit lip, perforated face, dark return
  rect(g, 0, 0, w, 1, ST.hi)
  rect(g, 0, 1, w, 1, ST.base)
  rect(g, 0, 2, w, 1, ST.lo)
  for (let x = 2; x < w - 2; x += 4) rect(g, x, 1, 2, 1, ST.line)
  // bundled cables showing over the lip
  const peek: [number, number, string][] = [[12, 9, C.cobaltRaised], [44, 14, C.sun], [70, 8, C.leaf], [100, 12, C.cobaltRaised], [130, 10, C.leaf]]
  for (const [x, len, col] of peek) {
    rect(g, x, 0, len, 1, col)
    px(g, x, 0, shade(col, 0.35))
  }
  px(g, 0, 0, ST.spec)
  rect(g, 0, 1, 1, 2, ST.hi)
  rect(g, w - 1, 0, 1, 3, ST.lo)

  // hangers: dark clamp straps wrapping the tray and the cable bundle
  for (const x of hangers) {
    rect(g, x, 0, 2, 4, ST.line)
    px(g, x, 0, ST.base)
    px(g, x + 1, 3, ST.lo)
  }
}

// ---------------------------------------------------------------- whiteboard easel

function whiteboardEasel(g: Ctx, w: number, h: number): void {
  // A-frame legs behind the board
  line(g, 6, 16, 3, h - 4, ST.lo)
  line(g, 17, 16, 20, h - 4, ST.lo)
  line(g, 7, 16, 4, h - 4, ST.base)
  line(g, 16, 16, 19, h - 4, ST.base)
  rect(g, 5, 23, 14, 1, ST.base)
  rect(g, 5, 24, 14, 1, ST.lo)
  // base bar with castors
  rect(g, 1, h - 4, w - 2, 1, ST.hi)
  rect(g, 1, h - 3, w - 2, 1, ST.lo)
  for (const cx of [2, w - 4]) {
    rect(g, cx, h - 2, 2, 2, '#1a2340')
    px(g, cx, h - 2, ST.base)
  }

  // board frame
  rect(g, 1, 1, w - 2, 16, ST.base)
  rect(g, 1, 1, w - 2, 1, ST.spec)
  rect(g, 1, 1, 1, 16, ST.hi)
  rect(g, w - 2, 2, 1, 15, ST.lo)
  rect(g, 1, 16, w - 2, 1, ST.lo)
  // writing surface: cool white, faint lower-right falloff, a glare band
  rect(g, 2, 2, w - 4, 14, C.ink)
  rect(g, 2, 13, w - 4, 3, '#e4ecfb')
  rect(g, w - 4, 2, 1, 14, '#e4ecfb')
  line(g, 15, 2, 19, 6, '#ffffff')
  line(g, 16, 2, 20, 6, '#ffffff')

  // system diagram: three boxes and arrows
  const box = (x: number, y: number, bw: number, bh: number, col: string) => {
    rect(g, x, y, bw, 1, col)
    rect(g, x, y + bh - 1, bw, 1, col)
    rect(g, x, y, 1, bh, col)
    rect(g, x + bw - 1, y, 1, bh, col)
  }
  box(3, 3, 6, 4, C.cobalt)
  rect(g, 4, 4, 3, 1, C.muted)
  box(14, 3, 6, 4, C.cobalt)
  rect(g, 15, 5, 3, 1, C.muted)
  box(8, 10, 8, 4, C.cobalt)
  rect(g, 9, 11, 4, 1, C.muted)
  rect(g, 9, 12, 2, 1, C.muted)
  // arrows in red
  rect(g, 9, 4, 4, 1, C.red)
  px(g, 12, 3, C.red)
  px(g, 12, 5, C.red)
  line(g, 6, 7, 9, 9, C.red)
  px(g, 8, 9, C.red)
  px(g, 17, 7, C.red)
  px(g, 16, 8, C.red)
  rect(g, 15, 9, 2, 1, C.red)
  px(g, 15, 8, C.red)
  // star note in the corner
  px(g, 18, 12, C.sunDeep)
  rect(g, 17, 13, 3, 1, C.sunDeep)
  px(g, 18, 14, C.sunDeep)

  // marker tray with two markers
  rect(g, 1, 17, w - 2, 1, ST.hi)
  rect(g, 1, 18, w - 2, 1, ST.lo)
  rect(g, 4, 17, 4, 1, C.cobaltRaised)
  px(g, 4, 17, C.cobaltHi)
  px(g, 7, 17, C.line)
  rect(g, 12, 17, 4, 1, C.red)
  px(g, 12, 17, '#ff8a8e')
  px(g, 15, 17, '#8e1f24')

  rim(g, ST.line, ST.lo)
}

// ---------------------------------------------------------------- coffee station

function coffeeStation(g: Ctx, w: number, h: number): void {
  // cabinet body: wood with a steel kick plate
  const top = 12
  rect(g, 1, top, w - 2, 1, W.hi)
  rect(g, 1, top + 1, w - 2, 1, W.light)
  rect(g, 1, top + 2, w - 2, h - top - 4, W.base)
  rect(g, 1, top + 2, w - 2, 1, W.dark)
  rect(g, 1, top + 3, 1, h - top - 6, W.mid)
  rect(g, w - 2, top + 3, 1, h - top - 6, W.dark)
  // two doors split by a seam, knobs
  rect(g, 9, top + 3, 1, h - top - 6, W.dark)
  rect(g, 10, top + 3, 1, h - top - 6, W.mid)
  px(g, 8, top + 6, ST.hi)
  px(g, 11, top + 6, ST.hi)
  // sunflower sticker on the left door
  pattern(g, 3, top + 4, [
    '.y.y.',
    'yyYyy',
    '.YbY.',
    'yyYyy',
    '.y.y.',
  ], { y: C.sun, Y: C.sunDeep, b: W.line })
  px(g, 4, top + 4, C.sunHi)
  // kick plate and feet
  rect(g, 1, h - 3, w - 2, 1, ST.base)
  rect(g, 1, h - 2, w - 2, 1, ST.lo)
  rect(g, 2, h - 1, 2, 1, ST.line)
  rect(g, w - 4, h - 1, 2, 1, ST.line)

  // espresso machine: chrome box, cobalt front panel, group head, cup on the drip tray
  const m = 3
  rect(g, 2, m, 10, 9, ST.base)
  rect(g, 2, m, 10, 1, ST.spec)
  rect(g, 2, m + 1, 1, 8, ST.hi)
  rect(g, 3, m + 1, 1, 7, ST.spec)
  rect(g, 11, m + 1, 1, 8, ST.lo)
  rect(g, 4, m + 1, 7, 3, C.cobalt)
  rect(g, 4, m + 1, 7, 1, C.cobaltRaised)
  px(g, 5, m + 2, C.ink)
  px(g, 6, m + 2, C.muted)
  px(g, 9, m + 2, C.sun)
  // group head and portafilter handle sticking out front-right
  rect(g, 5, m + 4, 4, 1, ST.hi)
  rect(g, 5, m + 5, 4, 1, ST.line)
  rect(g, 9, m + 5, 4, 1, '#1a2340')
  // cup under the spout
  rect(g, 6, m + 6, 2, 2, C.ink)
  px(g, 7, m + 7, C.muted)
  px(g, 8, m + 7, C.muted)
  // drip tray
  rect(g, 4, m + 8, 7, 1, ST.hi)
  rect(g, 4, m + 8, 1, 1, ST.spec)
  // cup warmer rail and steam wisp
  rect(g, 3, m - 1, 8, 1, ST.lo)
  px(g, 4, m - 1, ST.hi)
  px(g, 7, 1, C.muted)
  px(g, 8, 0, C.ink)

  // two mugs on the counter
  pattern(g, 13, 8, [
    'ccc.',
    'hBBb',
    'hBB.b',
    'BBBb',
  ], { c: '#4a2c16', h: C.cobaltHi, B: C.cobaltRaised, b: C.cobaltDeep })
  pattern(g, 16, 9, [
    'cc.',
    'hyY',
    'yyY',
  ], { c: '#4a2c16', h: C.sunHi, y: C.sun, Y: C.sunDeep })

  rim(g, W.line, W.lineLit, 0, top, w, h)
  rim(g, ST.line, ST.lo, 0, 0, w, top)
}

// ---------------------------------------------------------------- fish tank

function fishTank(g: Ctx, w: number, h: number): void {
  const t0 = 3
  const t1 = 16
  // water gradient, top bright to deep
  const water = ['#9dbcff', '#6f9cf5', '#5084ee', '#3a6fe0', '#2a5cd0', '#204cba']
  for (let y = t0 + 1; y <= t1; y++) {
    const i = Math.min(water.length - 1, Math.floor(((y - t0 - 1) / (t1 - t0)) * water.length))
    rect(g, 2, y, w - 4, 1, water[i] ?? C.cobalt)
  }
  rect(g, 2, t0 + 1, w - 4, 1, '#c8dbff')
  // gravel in warm clusters
  rect(g, 2, t1 - 1, w - 4, 2, W.mid)
  rect(g, 2, t1, w - 4, 1, W.base)
  for (let x = 3; x < w - 3; x += 5) {
    rect(g, x, t1 - 1, 2, 1, W.light)
    px(g, x + 3, t1, C.sunDeep)
  }
  rect(g, 5, t1 - 2, 3, 1, W.mid)
  px(g, 5, t1 - 2, W.light)
  // plants
  const kelp = (x: number, top: number, sway: number[]) => {
    for (let y = top; y < t1 - 1; y++) {
      const o = sway[(y - top) % sway.length] ?? 0
      px(g, x + o, y, C.leaf)
      px(g, x + o + 1, y, C.leafDeep)
    }
    px(g, x + (sway[0] ?? 0), top, C.leafHi)
  }
  kelp(4, 7, [0, 1, 1, 0])
  kelp(7, 10, [0, 0, 1, 1])
  // broad-leaf plant on the right
  pattern(g, 19, 7, [
    '..Lh..',
    '.LLl.h',
    'hLLlLL',
    'LLlLLl',
    '.LlLl.',
    '..Ll..',
    '..d...',
  ], { L: C.leaf, l: C.leafDeep, h: C.leafHi, d: C.leafDeep })
  // fish
  const fish = (x: number, y: number, flip: boolean) => {
    const rows = ['.oO.', 'oOOOt', '.Oo.']
    const rr = flip ? rows.map((r) => r.split('').reverse().join('')) : rows
    pattern(g, x, y, rr, { o: '#ffb35c', O: '#ff8a2a', t: '#d0601a' })
    px(g, flip ? x + 3 : x + 1, y + 1, C.line)
  }
  fish(9, 6, false)
  fish(14, 10, true)
  // tail fins
  px(g, 13, 6, '#d0601a')
  px(g, 13, 8, '#d0601a')
  px(g, 14, 10, '#d0601a')
  px(g, 14, 12, '#d0601a')
  // bubbles rising
  px(g, 17, 9, C.ink)
  px(g, 16, 7, C.muted)
  px(g, 17, 5, C.ink)
  // glass glare and edges
  line(g, 3, 6, 6, 3, '#e6efff')
  px(g, 3, 8, '#e6efff')
  rect(g, 2, t0 + 1, 1, t1 - t0, '#c8dbff')
  rect(g, w - 3, t0 + 1, 1, t1 - t0, '#204cba')
  // frame posts
  rect(g, 1, t0, 1, t1 - t0 + 1, ST.lo)
  rect(g, w - 2, t0, 1, t1 - t0 + 1, '#1a2340')
  // lid with light strip
  rect(g, 1, 1, w - 2, 2, '#1a2340')
  rect(g, 1, 1, w - 2, 1, ST.lo)
  rect(g, 2, 1, 6, 1, ST.base)
  rect(g, 2, t0, w - 4, 1, C.sunHi)

  // wooden stand with two doors
  const s0 = t1 + 1
  rect(g, 1, s0, w - 2, 2, W.hi)
  rect(g, 1, s0 + 1, w - 2, 1, W.light)
  rect(g, 1, s0 + 2, w - 2, h - s0 - 3, W.base)
  rect(g, 1, s0 + 2, w - 2, 1, W.dark)
  rect(g, 2, s0 + 3, 1, h - s0 - 5, W.mid)
  rect(g, 13, s0 + 3, 1, h - s0 - 5, W.dark)
  rect(g, 14, s0 + 3, 1, h - s0 - 5, W.mid)
  rect(g, w - 2, s0 + 2, 1, h - s0 - 3, W.dark)
  px(g, 11, s0 + 5, W.hi)
  px(g, 16, s0 + 5, W.hi)
  rect(g, 1, h - 2, w - 2, 1, W.dark)
  rect(g, 2, h - 1, 2, 1, W.line)
  rect(g, w - 4, h - 1, 2, 1, W.line)

  rim(g, W.line, W.lineLit, 0, s0, w, h)
  rim(g, '#121a33', ST.base, 0, 0, w, s0)
}

// ---------------------------------------------------------------- shoe rack

/** Draw on a scratch canvas, outline it, and stamp it onto `g` so each object keeps its own rim. */
function layer(g: Ctx, x: number, y: number, lw: number, lh: number, dark: string, lit: string, fn: (l: Ctx) => void): void {
  const { c, g: l } = makeCanvas(lw, lh)
  fn(l)
  rim(l, dark, lit)
  g.drawImage(c, x, y)
}

function hiTop(g: Ctx, x: number, y: number, dim: boolean): void {
  const k = dim ? -0.22 : 0
  pattern(g, x, y, [
    '.wWW....',
    '.WsW....',
    '.WsWlWw.',
    'WWWWWWWW',
    'ySSSSSSy',
  ], { w: shade('#ffffff', k), W: shade('#dfe7f8', k), s: shade(C.sun, k), l: shade(ST.lo, k), S: shade(C.sun, k), y: shade(C.sunDeep, k) })
}

function runner(g: Ctx, x: number, y: number, dim: boolean): void {
  const k = dim ? -0.25 : 0
  pattern(g, x, y, [
    '.hBB....',
    'BBBwBBb.',
    'BwwBBBBb',
    'iiiiiiii',
  ], { h: shade(C.cobaltHi, k), B: shade(C.cobaltRaised, k), b: shade(C.cobalt, k), w: shade(C.ink, k), i: shade(C.ink, k - 0.06) })
}

function shoeRack(g: Ctx, w: number): void {
  // rack: top board, open lower shelf, legs
  rect(g, 1, 7, w - 2, 1, W.hi)
  rect(g, 1, 8, w - 2, 1, W.mid)
  rect(g, 1, 9, w - 2, 2, W.back)
  rect(g, 1, 11, w - 2, 1, W.light)
  rect(g, 1, 12, w - 2, 1, W.dark)
  rect(g, 1, 9, 2, 4, W.mid)
  rect(g, 1, 9, 1, 4, W.light)
  rect(g, w - 3, 9, 2, 4, W.dark)
  rect(g, 2, 13, 1, 1, W.line)
  rect(g, w - 3, 13, 1, 1, W.line)
  // slippers on the lower shelf
  rect(g, 5, 10, 4, 1, C.muted)
  rect(g, 14, 10, 4, 1, '#d9483f')
  rim(g, W.line, W.lineLit)

  // sneakers on top: back shoe of each pair first, each with its own outline
  layer(g, 3, 0, 10, 7, '#3c4766', '#56658a', (l) => hiTop(l, 1, 1, true))
  layer(g, 0, 1, 10, 7, '#56658a', '#8796b8', (l) => hiTop(l, 1, 1, false))
  layer(g, 14, 1, 10, 6, C.line, '#2a4aa8', (l) => runner(l, 1, 1, true))
  layer(g, 11, 2, 10, 6, C.line, '#2a4aa8', (l) => runner(l, 1, 1, false))
}

// ---------------------------------------------------------------- monstera

/** Split-leaf on its own canvas: lit left half, shaded right half, midrib, then the
 *  characteristic edge slits and holes are cut AFTER the outline so they read as gaps. */
function monsteraLeaf(lw: number, lh: number, cuts: number, holes: [number, number][], flip: boolean): HTMLCanvasElement {
  const { c, g } = makeCanvas(lw + 2, lh + 2)
  oval(g, 1, 1, lw, lh, '#2fa04c')
  const mx = 1 + Math.floor(lw / 2)
  // lit half
  g.save()
  g.beginPath()
  g.rect(0, 0, mx, lh + 2)
  g.clip()
  oval(g, 1, 1, lw, lh, C.leaf)
  oval(g, 2, 2, lw - 3, Math.max(2, lh - 4), C.leaf)
  g.restore()
  rect(g, 2, 2 + Math.floor(lh / 4), 2, 2, C.leafHi)
  rect(g, 3, 2 + Math.floor(lh / 4) - 1, 2, 1, C.leafHi)
  line(g, mx, lh, mx, 2, C.leafDeep)
  rim(g, '#145a28', '#23843d')
  // slits from both edges toward the midrib, angled up-and-out
  g.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < cuts; i++) {
    const yy = 2 + Math.round(((i + 0.7) / (cuts + 0.5)) * (lh - 2))
    line(g, 0, yy - 1, mx - 2, yy, '#000')
    line(g, lw + 1, yy - 1, mx + 2, yy, '#000')
  }
  for (const [hx, hy] of holes) rect(g, hx, hy, 1, 1, '#000')
  g.globalCompositeOperation = 'source-over'
  if (flip) {
    const { c: f, g: fg } = makeCanvas(c.width, c.height)
    fg.translate(c.width, 0)
    fg.scale(-1, 1)
    fg.drawImage(c, 0, 0)
    return f
  }
  return c
}

function monstera(g: Ctx, w: number, h: number): void {
  const base = { x: 9, y: 17 }
  // stems
  const tips: [number, number][] = [[9, 8], [4, 10], [14, 9], [3, 14], [15, 14]]
  for (const [tx, ty] of tips) line(g, base.x, base.y, tx, ty, '#23843d')

  // leaves back to front
  const L = [
    { x: 7, y: 3, c: monsteraLeaf(9, 7, 2, [[3, 4]], true) },
    { x: -1, y: 4, c: monsteraLeaf(9, 7, 2, [[7, 4]], false) },
    { x: 3, y: -1, c: monsteraLeaf(10, 8, 3, [[3, 5]], false) },
    { x: -1, y: 10, c: monsteraLeaf(8, 6, 2, [], false) },
    { x: 9, y: 10, c: monsteraLeaf(8, 6, 2, [], true) },
  ]
  for (const l of L) g.drawImage(l.c, l.x, l.y)

  // cobalt ceramic pot
  const p0 = 17
  rect(g, 4, p0, 10, 2, C.cobaltRaised)
  rect(g, 4, p0, 10, 1, C.cobaltHi)
  rect(g, 5, p0 + 1, 8, 1, '#0a1f5c')
  px(g, 5, p0, '#9dbcff')
  for (let y = p0 + 2; y < h - 1; y++) {
    const ins = y > h - 4 ? 1 : 0
    rect(g, 5 + ins, y, 8 - ins * 2, 1, C.cobalt)
    px(g, 5 + ins, y, C.cobaltRaised)
    px(g, 6 + ins, y, C.cobaltHi)
    rect(g, 11 - ins, y, 2, 1, C.cobaltDeep)
  }
  // sunflower glaze band
  rect(g, 5, p0 + 4, 8, 1, C.sun)
  px(g, 6, p0 + 4, C.sunHi)
  rect(g, 11, p0 + 4, 2, 1, C.sunDeep)
  rect(g, 6, h - 1, 6, 1, C.cobaltDeep)
  rim(g, C.line, '#2a4aa8', 0, p0, w, h)
}

// ---------------------------------------------------------------- speaker shelf

function speakerShelf(g: Ctx, w: number, h: number): void {
  // shelf cabinet with an open cubby of records
  const s0 = 12
  rect(g, 1, s0, w - 2, 1, W.hi)
  rect(g, 1, s0 + 1, w - 2, 1, W.light)
  rect(g, 1, s0 + 2, w - 2, h - s0 - 3, W.base)
  rect(g, 1, s0 + 2, 1, h - s0 - 3, W.mid)
  rect(g, w - 2, s0 + 2, 1, h - s0 - 3, W.dark)
  rect(g, 3, s0 + 3, w - 6, 5, W.back)
  rect(g, 3, s0 + 3, w - 6, 1, '#2e1a0c')
  const sleeves = [C.cobaltRaised, C.cream, C.sun, C.red, C.teal, C.cobaltDeep, C.violet]
  sleeves.forEach((col, i) => {
    rect(g, 4 + i, s0 + 4 + (i % 2), 1, 4 - (i % 2), col)
  })
  rect(g, 3, s0 + 8, w - 6, 1, W.mid)
  rect(g, 1, h - 2, w - 2, 1, W.dark)
  rect(g, 2, h - 1, 2, 1, W.line)
  rect(g, w - 4, h - 1, 2, 1, W.line)

  // vinyl sleeve leaning against the speaker, the record peeking out of its top
  oval(g, 10, 3, 5, 5, '#14182a')
  px(g, 11, 4, '#4b5478')
  px(g, 12, 3, '#33344a')
  rect(g, 12, 5, 1, 1, C.red)
  for (let i = 0; i < 7; i++) {
    const y = s0 - 1 - i
    const x = 9 + (i > 3 ? 0 : 1)
    rect(g, x, y, 6, 1, C.sun)
    px(g, x, y, C.sunHi)
    px(g, x + 5, y, C.sunDeep)
  }
  // sleeve art: a cobalt sun-disc
  rect(g, 11, 7, 2, 2, C.cobalt)
  px(g, 11, 7, C.cobaltHi)
  rect(g, 10, 10, 5, 1, C.red)
  rect(g, 10, s0 - 1, 5, 1, C.sunDeep)

  // bookshelf speaker
  rect(g, 2, 1, 7, s0 - 1, '#2a2f4a')
  rect(g, 2, 1, 7, 1, '#4b5478')
  rect(g, 2, 1, 1, s0 - 1, '#3b4262')
  rect(g, 8, 2, 1, s0 - 2, '#1a1e33')
  // tweeter
  rect(g, 4, 3, 2, 2, '#14182a')
  px(g, 4, 3, ST.hi)
  // woofer cone
  oval(g, 3, 6, 5, 5, '#14182a')
  oval(g, 4, 7, 3, 3, '#3b4262')
  px(g, 5, 8, '#14182a')
  px(g, 4, 7, ST.base)

  rim(g, W.line, W.lineLit, 0, s0, w, h)
  rim(g, '#0e1122', '#3b4262', 0, 0, w, s0)
}

export const EXTRA = {
  cable_tray: (g, w) => cableTray(g, w),
  whiteboard_easel: whiteboardEasel,
  coffee_station: coffeeStation,
  fish_tank: fishTank,
  shoe_rack: (g, w) => shoeRack(g, w),
  monstera,
  speaker_shelf: speakerShelf,
} satisfies Record<string, DrawFn>
