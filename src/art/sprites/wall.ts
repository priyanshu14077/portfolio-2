// Everything hung on the back wall. Light comes from the top-left; outlines use the dark of each material.

import { type Ctx, line, oval, pattern, px, rect, rng, shade } from '../draw'
import { pixelText, textWidth } from '../font'
import { C, type DrawFn } from './palette'

const STEEL_LINE = '#323d5e'
const SLATE = { line: '#0a1636', lo: '#101d45', base: '#15265a', hi: '#1d3270', dust: '#2a3f80' }
const GLASS_HI = '#ffffff'

/** Wood frame of thickness t around (x, y, w, h), lit top-left, with a coloured outline. */
function woodFrame(g: Ctx, x: number, y: number, w: number, h: number, t: number): void {
  rect(g, x, y, w, h, C.woodLine)
  rect(g, x + 1, y + 1, w - 2, h - 2, C.woodMid)
  rect(g, x + 1, y + 1, w - 2, 1, C.woodHi)
  rect(g, x + 1, y + 1, 1, h - 2, C.woodLight)
  rect(g, x + w - 2, y + 2, 1, h - 3, C.wood)
  rect(g, x + 2, y + h - 2, w - 3, 1, C.woodDark)
  // inner lip: shadow on top/left, light on bottom/right (the frame is raised)
  const ix = x + t
  const iy = y + t
  const iw = w - 2 * t
  const ih = h - 2 * t
  rect(g, ix - 1, iy - 1, iw + 2, 1, C.woodDark)
  rect(g, ix - 1, iy - 1, 1, ih + 2, C.woodDark)
  rect(g, ix - 1, iy + ih, iw + 2, 1, C.woodLight)
  rect(g, ix + iw, iy, 1, ih + 1, C.woodLight)
}

function boardMethod(g: Ctx, w: number, h: number): void {
  // aluminium frame: outline breaks to mid steel on the lit top edge
  rect(g, 0, 0, w, h, STEEL_LINE)
  rect(g, 1, 0, w - 2, 1, C.steelLo)
  rect(g, 1, 1, w - 2, h - 2, C.steel)
  rect(g, 1, 1, 1, h - 2, C.steelHi)
  rect(g, w - 2, 1, 1, h - 2, C.steelLo)
  // white surface
  const sx = 2
  const sy = 1
  const sw = w - 4
  const sh = h - 2
  rect(g, sx, sy, sw, sh, C.ink)
  rect(g, sx, sy, sw, 1, '#dfe8fb') // frame shadow on the board
  rect(g, sx, sy, 1, sh, '#e6edfc')
  // ghost of an erased diagram
  rect(g, 30, 23, 6, 1, '#e3eaf9')
  rect(g, 33, 26, 4, 1, '#e3eaf9')
  // glare streaks
  line(g, w - 12, 2, w - 18, 8, GLASS_HI)
  line(g, w - 10, 2, w - 13, 5, GLASS_HI)
  // title over a faint ruled line
  const title = 'HOW I WORK'
  const tw = textWidth(title)
  const tx = 4
  pixelText(g, title, tx, 2, C.cobalt)
  rect(g, tx, 7, tw, 1, '#dce6fa') // faint ruled line under the heading
  const steps = ['DISCOVER', 'SCOPE', 'BUILD', 'SHIP']
  steps.forEach((s, i) => {
    const y = 8 + i * 6
    pixelText(g, String(i + 1), 4, y, C.sunDeep)
    pixelText(g, s, 9, y, C.line)
  })
  // ship gets a tick
  pattern(g, 26, 27, ['....#', '...#.', '#.#..', '.#...'], { '#': C.leafDeep })
  // flow arrow down the margin
  rect(g, 2, 9, 1, 21, '#e3eaf9')
  // sticky notes, one pinned, one taped
  rect(g, 43, 10, 8, 8, C.sunDeep)
  rect(g, 43, 10, 8, 7, C.sun)
  rect(g, 43, 10, 8, 1, C.sunHi)
  rect(g, 44, 12, 5, 1, C.sunDeep)
  rect(g, 44, 14, 4, 1, C.sunDeep)
  px(g, 47, 10, C.red)
  px(g, 47, 9, shade(C.red, 0.4))
  rect(g, 42, 20, 9, 7, C.leaf)
  rect(g, 42, 20, 9, 6, C.leafHi)
  rect(g, 43, 22, 6, 1, C.leafDeep)
  rect(g, 43, 24, 3, 1, C.leafDeep)
  rect(g, 45, 19, 3, 2, 'rgba(255,255,255,0.7)')
  // marker tray with two markers
  rect(g, 36, h - 4, 15, 3, STEEL_LINE)
  rect(g, 37, h - 4, 13, 1, C.steelHi)
  rect(g, 37, h - 3, 13, 1, C.steel)
  rect(g, 38, h - 5, 5, 1, C.cobaltRaised)
  px(g, 38, h - 5, C.ink)
  rect(g, 44, h - 5, 4, 1, C.red)
  px(g, 47, h - 5, shade(C.red, -0.3))
}

function boardImpact(g: Ctx, w: number, h: number): void {
  woodFrame(g, 0, 0, w, h, 3)
  const fx = 3
  const fy = 3
  const fw = w - 6
  const fh = h - 6
  rect(g, fx, fy, fw, fh, SLATE.base)
  rect(g, fx, fy, fw, 1, SLATE.lo)
  rect(g, fx, fy, 1, fh, SLATE.lo)
  // chalk dust smudges
  rect(g, fx + 3, fy + fh - 3, 5, 1, SLATE.hi)
  rect(g, fx + fw - 9, fy + 2, 4, 1, SLATE.hi)
  pixelText(g, 'IMPACT', fx + 3, fy + 2, C.sun)
  rect(g, fx + 3, fy + 8, textWidth('IMPACT'), 1, C.sunDeep)
  // axes
  const ax = fx + 3
  const base = fy + fh - 3
  rect(g, ax, fy + 10, 1, base - fy - 10 + 1, C.muted)
  rect(g, ax, base, fw - 6, 1, C.muted)
  // rising bars
  const heights = [3, 5, 6, 8, 11]
  heights.forEach((bh, i) => {
    const bx = ax + 3 + i * 6
    const last = i === heights.length - 1
    const [lo, mid, hi] = last ? [C.sunDeep, C.sun, C.sunHi] : [C.leafDeep, C.leaf, C.leafHi]
    rect(g, bx, base - bh, 3, bh, mid)
    rect(g, bx, base - bh, 1, bh, hi)
    rect(g, bx + 2, base - bh + 1, 1, bh - 1, lo)
    rect(g, bx, base - bh, 3, 1, hi)
  })
  // trend arrow climbing over the bars
  const ox = ax + 2
  const oy = base - 6
  line(g, ox, oy, ox + 9, oy - 4, C.ink)
  line(g, ox + 9, oy - 4, ox + 15, oy - 5, C.ink)
  line(g, ox + 15, oy - 5, ox + 29, oy - 11, C.ink)
  pattern(g, ox + 27, oy - 12, ['###', '..#', '..#'], { '#': C.ink })
  // chalk ledge with a stick of chalk
  rect(g, fx + fw - 9, h - 3, 6, 1, C.ink)
  rect(g, fx + fw - 4, h - 3, 1, 1, C.muted)
}

function githubPoster(g: Ctx, w: number, h: number): void {
  // paper: light border, navy print, curled bottom-right corner
  rect(g, 1, 1, w - 2, h - 2, C.muted)
  rect(g, 1, 1, w - 2, 1, C.ink)
  rect(g, 1, 1, 1, h - 2, C.ink)
  const px0 = 3
  const py0 = 3
  const pw = w - 6
  const ph = h - 6
  rect(g, px0, py0, pw, ph, '#101a3d')
  rect(g, px0, py0, pw, 1, '#18265a')
  pixelText(g, 'GITHUB', px0 + Math.floor((pw - textWidth('GITHUB')) / 2), py0 + 2, C.ink)
  rect(g, px0 + 2, py0 + 8, pw - 4, 1, '#1c2b5c')
  const levels = ['#1a2a58', C.leafDeep, C.leaf, C.leafHi]
  const r = rng(77)
  const cols = 9
  const gx = px0 + Math.floor((pw - (cols * 3 - 1)) / 2)
  for (let c = 0; c < cols; c++)
    for (let row = 0; row < 3; row++) {
      const v = Math.min(3, Math.floor(r() * 2.1 + (c / cols) * 2.2))
      rect(g, gx + c * 3, py0 + 10 + row * 3, 2, 2, levels[v] ?? C.leaf)
    }
  // curled corner
  pattern(g, w - 5, h - 5, ['...m', '..mi', '.mii', 'mii.'], { m: C.muted, i: C.ink })
  g.clearRect(w - 2, h - 3, 2, 3)
  g.clearRect(w - 3, h - 2, 1, 2)
  // push pin
  rect(g, Math.floor(w / 2) - 1, 0, 3, 2, C.red)
  px(g, Math.floor(w / 2) - 1, 0, shade(C.red, 0.5))
  px(g, Math.floor(w / 2) + 1, 1, shade(C.red, -0.35))
  // tape on the lower-left corner
  rect(g, 0, h - 5, 4, 3, 'rgba(255,245,210,0.75)')
  outlineAround(g, C.line)
}

/** Like draw.outline, but translucent pixels (tape) do not grow an outline. */
function outlineAround(g: Ctx, col: string): void {
  const { width: w, height: h } = g.canvas
  const a = g.getImageData(0, 0, w, h).data
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && (a[(y * w + x) * 4 + 3] ?? 0) > 200
  g.fillStyle = col
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if ((a[(y * w + x) * 4 + 3] ?? 0) === 0 && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)))
        g.fillRect(x, y, 1, 1)
}

function clock(g: Ctx, w: number, h: number): void {
  oval(g, 0, 0, w, h, C.line)
  oval(g, 1, 1, w - 2, h - 2, C.cobaltDeep)
  oval(g, 1, 1, w - 3, h - 3, C.cobaltRaised)
  // rim highlight top-left
  px(g, 3, 2, C.cobaltHi)
  px(g, 2, 3, C.cobaltHi)
  px(g, 4, 1, C.cobaltHi)
  oval(g, 2, 2, w - 4, h - 4, C.muted)
  oval(g, 2, 2, w - 5, h - 5, C.ink)
  const m = Math.floor(w / 2)
  // hour marks at 12 / 3 / 6 / 9; minor dots between
  rect(g, m - 1, 3, 2, 1, C.line)
  rect(g, m - 1, h - 4, 2, 1, C.line)
  rect(g, 3, m - 1, 1, 2, C.line)
  rect(g, w - 4, m - 1, 1, 2, C.line)
  for (const [x, y] of [[4, 4], [w - 5, 4], [4, h - 5], [w - 5, h - 5]] as const) px(g, x, y, C.muted)
  // glass glint, well clear of the hands
  px(g, 4, 3, GLASS_HI)
  px(g, 3, 4, GLASS_HI)
}

function door(g: Ctx, w: number, h: number): void {
  // casing
  rect(g, 0, 0, w, h, C.woodLine)
  rect(g, 1, 1, w - 2, h - 1, C.woodLight)
  rect(g, 1, 1, w - 2, 1, C.woodHi)
  rect(g, 1, 1, 1, h - 1, C.woodHi)
  rect(g, w - 2, 2, 1, h - 2, C.woodMid)
  // slab
  const dx = 3
  const dy = 3
  const dw = w - 6
  const dh = h - 3
  rect(g, dx - 1, dy - 1, dw + 2, dh + 1, C.woodLine)
  rect(g, dx, dy, dw, dh, C.wood)
  rect(g, dx, dy, dw, 1, C.woodMid)
  rect(g, dx, dy, 1, dh, C.woodMid)
  rect(g, dx + dw - 1, dy, 1, dh, C.woodDark)
  // vertical grain on the stiles
  for (const [gx, gy, gl] of [[dx + 2, 22, 9], [dx + dw - 3, 8, 7], [dx + 12, 45, 3]] as const)
    rect(g, gx, gy, 1, gl, shade(C.wood, -0.12))
  // glazed upper: 4 lites
  const gx = dx + 4
  const gy = dy + 4
  const gw = dw - 8
  const gh = 15
  rect(g, gx - 1, gy - 1, gw + 2, gh + 2, C.woodDark)
  rect(g, gx - 1, gy + gh, gw + 2, 1, C.woodMid)
  rect(g, gx, gy, gw, gh, '#8fc6f5')
  rect(g, gx, gy + 8, gw, gh - 8, '#a9d5fa')
  rect(g, gx, gy, gw, 1, '#6aaee8')
  const mx = gx + Math.floor(gw / 2) - 1
  rect(g, mx, gy, 2, gh, C.woodDark)
  rect(g, mx, gy, 1, gh, C.wood)
  rect(g, gx, gy + 7, gw, 1, C.woodDark)
  // glint streaks
  line(g, gx + 2, gy + 4, gx + 5, gy + 1, GLASS_HI)
  px(g, gx + 2, gy + 2, GLASS_HI)
  line(g, mx + 4, gy + 13, mx + 8, gy + 9, '#d6ecff')
  // two raised lower panels
  for (const [px0, pw] of [[dx + 3, 9], [dx + dw - 12, 9]] as const) {
    const py0 = gy + gh + 4
    const ph = h - py0 - 6
    rect(g, px0, py0, pw, ph, C.woodDark)
    rect(g, px0 + 1, py0 + 1, pw - 1, ph - 1, C.woodLight)
    rect(g, px0 + 2, py0 + 2, pw - 3, ph - 3, C.woodMid)
    rect(g, px0 + 2, py0 + ph - 1, pw - 2, 1, C.wood)
  }
  // brass knob + plate
  const kx = dx + dw - 5
  const ky = 30
  rect(g, kx, ky - 3, 2, 7, C.sunDeep)
  rect(g, kx - 1, ky, 3, 2, C.woodLine)
  rect(g, kx - 1, ky - 1, 3, 2, C.sun)
  px(g, kx - 1, ky - 1, C.sunHi)
  px(g, kx + 1, ky + 1, C.sunDeep)
  // kick plate
  rect(g, dx + 1, h - 4, dw - 2, 3, C.steelLo)
  rect(g, dx + 1, h - 4, dw - 2, 1, C.steelHi)
  rect(g, dx + 1, h - 3, dw - 2, 1, C.steel)
  // sticky note left by the last visitor
  rect(g, dx + 3, 22, 5, 4, C.sun)
  rect(g, dx + 3, 22, 5, 1, C.sunHi)
  rect(g, dx + 4, 24, 3, 1, C.sunDeep)
}

function sign(g: Ctx, w: number, h: number, lit: boolean): void {
  const text = 'OPEN TO WORK'
  const tw = textWidth(text)
  const tx = Math.floor((w - tw) / 2)
  const ty = 2
  // frame
  rect(g, 0, 0, w, h, lit ? '#8a5205' : '#1c2444')
  rect(g, 1, 0, w - 2, 1, lit ? C.sunDeep : '#2c365a')
  rect(g, 1, 1, w - 2, h - 2, lit ? C.sunDeep : '#353f63')
  rect(g, 1, 1, w - 2, 1, lit ? C.sunHi : '#4a5579')
  rect(g, 1, 1, 1, h - 2, lit ? C.sun : '#424d71')
  // face
  rect(g, 2, 2, w - 4, h - 4, lit ? '#1b1640' : '#10162f')
  rect(g, 2, 2, w - 4, 1, lit ? '#120f2e' : '#0b1026')
  if (lit) {
    pixelText(g, text, tx, ty + 1, '#7a4a0c') // glow spill below each stroke
    pixelText(g, text, tx, ty, C.sunHi)
    for (const x of [tx, tx + tw - 1]) px(g, x, ty, '#ffffff')
  } else {
    pixelText(g, text, tx, ty + 1, '#0b1026')
    pixelText(g, text, tx, ty, '#56607f')
  }
  // corner screws
  for (const x of [1, w - 2]) px(g, x, h - 2, lit ? '#8a5205' : '#1c2444')
}

function windowView(g: Ctx, w: number, night: boolean): void {
  const frameLine = night ? '#4a5778' : '#6f86b8'
  const frame = night ? '#aeb9d6' : C.ink
  const frameLo = night ? '#8592b3' : C.muted
  // outer frame
  rect(g, 1, 0, w - 2, 25, C.line)
  rect(g, 2, 1, w - 4, 23, frame)
  rect(g, 2, 1, w - 4, 1, night ? '#cfd8ee' : '#ffffff')
  rect(g, w - 3, 2, 1, 22, frameLo)
  const gx = 4
  const gy = 3
  const gw = w - 8
  const gh = 20
  rect(g, gx - 1, gy - 1, gw + 2, gh + 1, frameLine)
  // sky with dithered transitions instead of hard bands
  const sky = night ? ['#0a1640', '#0f2052', '#172d6a'] : ['#6cb2f6', '#8ac6fc', '#b4dcff']
  const s0 = sky[0] ?? '#000'
  const s1 = sky[1] ?? '#000'
  const s2 = sky[2] ?? '#000'
  rect(g, gx, gy, gw, gh, s0)
  rect(g, gx, gy + 7, gw, gh - 7, s1)
  rect(g, gx, gy + 13, gw, gh - 13, s2)
  for (let x = gx; x < gx + gw; x += 2) {
    px(g, x, gy + 6, s1)
    px(g, x + 1, gy + 12, s2)
  }
  if (night) {
    // crescent moon with a faint halo
    oval(g, 6, 4, 8, 8, '#1a2c66')
    oval(g, 7, 5, 6, 6, '#f6f1d8')
    oval(g, 9, 4, 6, 6, s0)
    px(g, 7, 8, '#ffffff')
    const stars: [number, number, boolean][] = [[17, 5, true], [22, 9, false], [27, 4, false], [31, 7, true], [34, 11, false], [14, 12, false], [25, 13, false]]
    for (const [x, y, big] of stars) {
      px(g, x, y, big ? C.sunHi : C.muted)
      if (big) {
        px(g, x - 1, y, '#3a4d8a')
        px(g, x + 1, y, '#3a4d8a')
        px(g, x, y - 1, '#3a4d8a')
        px(g, x, y + 1, '#3a4d8a')
      }
    }
  } else {
    // sun glow and two shaded clouds
    oval(g, 29, 3, 5, 5, C.sunHi)
    px(g, 30, 4, '#ffffff')
    const cloud = (x: number, y: number, cw: number) => {
      oval(g, x, y + 1, cw, 3, '#d8ebff')
      oval(g, x + 2, y, cw - 4, 3, '#ffffff')
      rect(g, x + 1, y + 2, cw - 2, 1, '#ffffff')
      rect(g, x + 2, y + 3, cw - 4, 1, '#c3dcf7')
    }
    cloud(6, 4, 10)
    cloud(20, 9, 9)
  }
  // skyline: hazy far row, solid near row
  const far: [number, number, number][] = [[gx, 7, 7], [gx + 8, 5, 10], [gx + 14, 6, 6], [gx + 21, 7, 9], [gx + 29, 5, 11]]
  for (const [bx, bw, bh] of far) rect(g, bx, gy + gh - bh, Math.min(bw, gx + gw - bx), bh, night ? '#16285e' : '#9db8e3')
  const near: [number, number, number][] = [[gx, 6, 5], [gx + 7, 5, 8], [gx + 13, 6, 4], [gx + 20, 5, 7], [gx + 26, 4, 5], [gx + 30, 6, 9]]
  const r = rng(11)
  near.forEach(([bx, bw, bh]) => {
    const ww = Math.min(bw, gx + gw - bx)
    const by = gy + gh - bh
    const body = night ? '#0b1533' : '#6f87b9'
    rect(g, bx, by, ww, bh, body)
    rect(g, bx, by, ww, 1, night ? '#1a2a5c' : '#8ea6d4') // lit roof line
    rect(g, bx + ww - 1, by + 1, 1, bh - 1, night ? '#070e26' : '#5d74a4')
    for (let yy = by + 2; yy < gy + gh - 1; yy += 2)
      for (let xx = bx + 1; xx < bx + ww - 1; xx += 2)
        if (r() < (night ? 0.5 : 0.35)) px(g, xx, yy, night ? (r() < 0.3 ? '#fff1c9' : C.sun) : '#c7d6f2')
  })
  // glass glare
  if (!night) {
    line(g, gx + 2, gy + 9, gx + 9, gy + 2, 'rgba(255,255,255,0.55)')
    line(g, gx + 4, gy + 9, gx + 11, gy + 2, 'rgba(255,255,255,0.3)')
  } else {
    line(g, gx + 23, gy + 10, gx + 28, gy + 5, 'rgba(180,200,255,0.18)')
  }
  // mullions
  const mx = Math.floor(w / 2) - 1
  rect(g, mx, gy, 2, gh, frame)
  rect(g, mx + 1, gy + 1, 1, gh - 1, frameLo)
  rect(g, gx, gy + 9, gw, 1, frame)
  rect(g, gx, gy + 10, gw, 1, 'rgba(10,36,102,0.25)')
  // sill with a tiny cactus pot
  rect(g, 0, 24, w, 5, C.woodLine)
  rect(g, 1, 24, w - 2, 1, C.woodHi)
  rect(g, 1, 25, w - 2, 2, C.woodLight)
  rect(g, 1, 27, w - 2, 1, C.woodMid)
  rect(g, 2, 28, w - 4, 1, C.wood)
  rect(g, 2, 29, w - 4, 1, 'rgba(10,36,102,0.35)')
  pattern(g, w - 9, 18, ['.g.', 'ggl', 'gGl', 'gG.', 'ttt', 'TTT'], {
    g: C.leaf,
    l: C.leafHi,
    G: C.leafDeep,
    t: '#d06a3c',
    T: '#9c4524',
  })
}

function jerseyFrame(g: Ctx, w: number, h: number): void {
  woodFrame(g, 0, 0, w, h, 3)
  // mat: shadow-box depth, darker on the top-left inner edge
  rect(g, 3, 3, w - 6, h - 6, C.cream)
  rect(g, 3, 3, w - 6, 1, '#d9c9a2')
  rect(g, 3, 3, 1, h - 6, '#e4d6b2')
  // jersey hanging on two clips
  const jx = 4
  const jy = 5
  const rows = [
    '..owwo..owwo..',
    '..owBwoowBwo..',
    '.owhBBwwBBbwo.',
    'owhBBBBBBBBbwo',
    'owwhBBBBBBbwwo',
    'oshBBBBBBBBbso',
    'oshBBBBBBBBbso',
    'oshBBBBBBBBbso',
    'oshBBBBBBBBbso',
    'oshBBBBBBBBbso',
    'oshBBBBBBBBbso',
    'oshBBBBBBBBbso',
    'oshBBBBBBBkbso',
    'oshBBBBBBkBbso',
    'oshBBBBBBBBbso',
    'owwwwwwwwwwwwo',
    'oooooooooooooo',
  ]
  // soft drop shadow on the mat
  pattern(g, jx + 1, jy + 1, rows, { o: '#cdbb92', w: '#cdbb92', B: '#cdbb92', h: '#cdbb92', b: '#cdbb92', s: '#cdbb92', k: '#cdbb92' })
  pattern(g, jx, jy, rows, {
    o: C.line,
    w: C.ink,
    B: C.cobaltRaised,
    h: C.cobaltHi,
    b: C.cobalt,
    s: C.muted,
    k: C.cobalt,
  })
  const nx = jx + Math.floor((14 - textWidth('77')) / 2)
  pixelText(g, '77', nx, jy + 8, C.cobalt)
  pixelText(g, '77', nx, jy + 7, C.ink)
  // clips
  px(g, jx + 3, jy - 1, C.steelHi)
  px(g, jx + 10, jy - 1, C.steelHi)
  // glass glint across the frame
  line(g, 4, 9, 8, 5, 'rgba(255,255,255,0.45)')
  line(g, w - 7, h - 5, w - 5, h - 7, 'rgba(255,255,255,0.35)')
}

function sportsRack(g: Ctx, w: number, h: number): void {
  // backboard: two planks with a rounded top, screws in the corners
  const bx = 1
  const by = 1
  const bw = w - 2
  const bh = h - 2
  rect(g, bx, by, bw, bh, C.woodLine)
  rect(g, bx + 1, by + 1, bw - 2, bh - 2, C.woodMid)
  rect(g, bx + 1, by + 1, bw - 2, 1, C.woodHi)
  rect(g, bx + 1, by + 1, 1, bh - 2, C.woodLight)
  rect(g, bx + bw - 2, by + 2, 1, bh - 3, C.wood)
  rect(g, bx + 2, by + bh - 2, bw - 3, 1, C.wood)
  rect(g, bx + 2, 15, bw - 4, 1, C.wood) // plank seam
  rect(g, bx + 2, 16, bw - 4, 1, C.woodLight)
  for (const [gx, gy, gl] of [[5, 6, 7], [14, 10, 6], [8, 21, 8], [18, 25, 5]] as const) rect(g, gx, gy, gl, 1, shade(C.woodMid, -0.1))
  for (const [x, y] of [[3, 3], [w - 4, 3], [3, h - 4], [w - 4, h - 4]] as const) {
    px(g, x, y, C.steelLo)
    px(g, x, y - 1, C.steelHi)
  }
  // cricket bat: blade bottom-left, handle up to the right
  const bladeA: [number, number] = [6, 25]
  const bladeB: [number, number] = [15, 13]
  line(g, bladeA[0], bladeA[1], bladeB[0], bladeB[1], C.woodDark, 5)
  line(g, bladeA[0], bladeA[1], bladeB[0], bladeB[1], C.cream, 3)
  line(g, bladeA[0] - 1, bladeA[1] - 1, bladeB[0] - 1, bladeB[1] - 1, '#fff8e6', 1)
  line(g, bladeA[0] + 1, bladeA[1] + 1, bladeB[0] + 1, bladeB[1] + 1, '#d8c39a', 1)
  // splice + handle with a striped grip
  line(g, 15, 13, 17, 10, '#d8c39a', 2)
  line(g, 17, 10, 22, 4, C.line, 3)
  line(g, 17, 10, 22, 4, C.cobaltRaised, 1)
  for (const [x, y] of [[18, 9], [20, 6]] as const) px(g, x, y, C.sun)
  px(g, 23, 3, C.line)
  // sticker on the blade
  px(g, 9, 21, C.red)
  px(g, 10, 20, C.red)
  // badminton racket: head top-left, shaft down to the right
  oval(g, 3, 3, 11, 13, C.line)
  oval(g, 4, 4, 9, 11, C.sun)
  // strings over the shadowed board
  oval(g, 5, 5, 7, 9, shade(C.woodMid, -0.2))
  for (let x = 6; x < 12; x += 2) rect(g, x, 5, 1, 9, C.ink)
  for (let y = 6; y < 14; y += 2) rect(g, 5, y, 7, 1, C.ink)
  px(g, 4, 6, C.sunHi)
  px(g, 5, 4, C.sunHi)
  px(g, 11, 14, C.sunDeep)
  line(g, 11, 15, 18, 22, C.line, 3)
  line(g, 11, 15, 18, 22, C.steelHi, 1)
  line(g, 18, 22, 22, 26, C.line, 4)
  line(g, 18, 22, 22, 26, C.ink, 2)
  px(g, 19, 23, '#ffffff')
  px(g, 21, 25, C.muted)
  // shuttlecock resting on the peg
  pattern(g, 22, 18, ['.i.', 'imi', 'imi', '.r.'], { i: C.ink, m: C.muted, r: C.red })
}

/** Fairy lights: a dark wire in shallow swags, bulbs alternating sunflower / warm white. */
function stringLights(g: Ctx, w: number): void {
  const wire = '#2a1a10'
  const swag = 26
  const dip = 4
  const wireY = (x: number) => {
    const t = (x % swag) / swag
    return 1 + Math.round(dip * 4 * t * (1 - t))
  }
  for (let x = 0; x < w; x++) px(g, x, wireY(x), wire)
  // hooks at the swag ends
  for (let x = 0; x <= w; x += swag) {
    const hx = Math.min(x, w - 1)
    px(g, hx, 0, C.steelHi)
    px(g, hx, 1, C.steelLo)
  }
  const warm = { lo: '#e2b766', base: '#fff0c4', hi: '#ffffff' }
  const sun = { lo: C.sunDeep, base: C.sun, hi: C.sunHi }
  let k = 0
  for (let x = 4; x < w - 2; x += 7, k++) {
    if (x % swag < 2 || x % swag > swag - 2) continue
    const y = wireY(x)
    const b = k % 2 ? warm : sun
    pattern(g, x - 1, y + 1, ['.s.', 'hbb', 'bbl', '.l.'], { s: C.steelLo, h: b.hi, b: b.base, l: b.lo })
  }
}

export const WALL = {
  string_lights: (g, w) => stringLights(g, w),
  board_method: boardMethod,
  board_impact: boardImpact,
  github_poster: githubPoster,
  clock,
  door,
  sign_open: (g, w, h) => sign(g, w, h, true),
  sign_off: (g, w, h) => sign(g, w, h, false),
  window_day: (g, w) => windowView(g, w, false),
  window_night: (g, w) => windowView(g, w, true),
  jersey_frame: jerseyFrame,
  sports_rack: sportsRack,
} satisfies Record<string, DrawFn>
