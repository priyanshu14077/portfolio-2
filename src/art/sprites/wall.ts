// Everything hung on the back wall.

import { type Ctx, dither, inset, line, outline, oval, px, rect, rng } from '../draw'
import { pixelText, textWidth } from '../font'
import { C, type DrawFn } from './palette'

function boardMethod(g: Ctx, w: number, h: number): void {
  rect(g, 1, 1, w - 2, h - 2, C.steel)
  rect(g, 1, 1, w - 2, 1, C.steelHi)
  rect(g, 1, 1, 1, h - 2, C.steelHi)
  rect(g, w - 2, 1, 1, h - 2, C.steelLo)
  rect(g, 2, 2, w - 4, h - 4, C.ink)
  rect(g, 2, h - 2, w - 4, 1, C.steelLo)
  // glare
  line(g, w - 14, 3, w - 20, 9, '#ffffff')
  const title = textWidth('HOW I WORK') <= w - 8 ? 'HOW I WORK' : 'METHOD'
  pixelText(g, title, 2 + Math.floor((w - 4 - textWidth(title)) / 2), 3, C.cobalt)
  const steps = ['DISCOVER', 'SCOPE', 'BUILD', 'SHIP']
  steps.forEach((s, i) => {
    const y = 9 + i * 6
    pixelText(g, String(i + 1), 4, y, C.sunDeep)
    pixelText(g, s, 10, y, C.line)
  })
  // check on SHIP
  px(g, 28, 30, C.leafDeep)
  px(g, 29, 31 - 0, C.leafDeep)
  line(g, 30, 30, 32, 27, C.leafDeep)
  // sticky notes
  rect(g, 44, 10, 8, 7, C.sun)
  rect(g, 44, 16, 8, 1, C.sunDeep)
  rect(g, 45, 12, 5, 1, C.sunDeep)
  rect(g, 45, 14, 4, 1, C.sunDeep)
  rect(g, 44, 20, 8, 7, C.leafHi)
  rect(g, 44, 26, 8, 1, C.leaf)
  rect(g, 45, 22, 5, 1, C.leafDeep)
  // markers on the tray
  rect(g, 38, h - 3, 4, 1, C.cobaltRaised)
  rect(g, 43, h - 3, 3, 1, C.red)
  outline(g, C.line)
}

function boardImpact(g: Ctx, w: number, h: number): void {
  rect(g, 1, 1, w - 2, h - 2, C.woodMid)
  rect(g, 1, 1, w - 2, 1, C.woodHi)
  rect(g, 1, 1, 1, h - 2, C.woodLight)
  rect(g, w - 2, 2, 1, h - 3, C.wood)
  rect(g, 2, h - 2, w - 3, 1, C.wood)
  const face = '#14244f'
  rect(g, 2, 2, w - 4, h - 4, face)
  pixelText(g, 'IMPACT', 2 + Math.floor((w - 4 - textWidth('IMPACT')) / 2), 3, C.sun)
  const heights = [2, 4, 5, 7, 9]
  const bx = Math.floor((w - 19) / 2)
  rect(g, bx - 2, 19, 23, 1, C.muted)
  heights.forEach((bh, i) => {
    const col = i === heights.length - 1 ? C.sun : C.leaf
    rect(g, bx + i * 4, 19 - bh, 3, bh, col)
    rect(g, bx + i * 4, 19 - bh, 1, bh, i === heights.length - 1 ? C.sunHi : C.leafHi)
  })
  const t = '3D>15S'
  pixelText(g, t, 2 + Math.floor((w - 4 - textWidth(t)) / 2), 21, C.ink)
  px(g, 5, 24, '#3a4a78')
  px(g, w - 6, 9, '#3a4a78')
  outline(g, C.woodLine)
}

function githubPoster(g: Ctx, w: number, h: number): void {
  rect(g, 1, 1, w - 2, h - 2, C.ink)
  rect(g, 2, 2, w - 4, h - 4, '#101a38')
  pixelText(g, 'GITHUB', 2 + Math.floor((w - 4 - textWidth('GITHUB')) / 2), 4, C.ink)
  const levels = ['#1c2b52', C.leafDeep, C.leaf, C.leafHi]
  const r = rng(77)
  const cols = 9
  const gx = Math.floor((w - (cols * 3 - 1)) / 2)
  for (let c = 0; c < cols; c++)
    for (let row = 0; row < 4; row++) {
      const v = Math.min(3, Math.floor(r() * 2.2 + (c / cols) * 2))
      rect(g, gx + c * 3, 11 + row * 3, 2, 2, levels[v] ?? C.leaf)
    }
  rect(g, Math.floor(w / 2) - 1, 1, 2, 1, C.red)
  outline(g, C.line)
}

function clock(g: Ctx, w: number, h: number): void {
  oval(g, 1, 1, w - 2, h - 2, C.cobaltRaised)
  px(g, 3, 3, C.cobaltHi)
  px(g, 4, 2, C.cobaltHi)
  px(g, 2, 4, C.cobaltHi)
  oval(g, 2, 2, w - 4, h - 4, C.ink)
  const m = Math.floor(w / 2)
  rect(g, m - 1, 3, 2, 1, C.line)
  rect(g, m - 1, h - 4, 2, 1, C.line)
  rect(g, 3, m - 1, 1, 2, C.line)
  rect(g, w - 4, m - 1, 1, 2, C.line)
  outline(g, C.line)
}

function door(g: Ctx, w: number, h: number): void {
  rect(g, 1, 1, w - 2, h - 1, C.woodDark)
  rect(g, 1, 1, w - 2, 1, C.wood)
  rect(g, 3, 3, w - 6, h - 3, C.woodMid)
  rect(g, 3, 3, w - 6, 1, C.woodLight)
  rect(g, 3, 3, 1, h - 3, C.woodLight)
  rect(g, w - 4, 4, 1, h - 4, C.wood)
  // window pane
  rect(g, 7, 7, 16, 13, C.woodDark)
  rect(g, 8, 8, 14, 11, '#9fd3ff')
  rect(g, 8, 15, 14, 4, '#bfe4ff')
  rect(g, 14, 8, 2, 11, C.woodDark)
  px(g, 9, 9, '#ffffff')
  px(g, 10, 9, '#ffffff')
  px(g, 9, 10, '#ffffff')
  px(g, 17, 9, '#e6f4ff')
  // lower panels
  inset(g, 7, 24, 7, 21, C.woodMid, 0.25)
  inset(g, 16, 24, 7, 21, C.woodMid, 0.25)
  // handle
  rect(g, 22, 29, 2, 6, C.sunDeep)
  rect(g, 21, 31, 3, 2, C.sun)
  px(g, 21, 31, C.sunHi)
  outline(g, C.woodLine)
}

function sign(g: Ctx, w: number, h: number, lit: boolean): void {
  rect(g, 1, 1, w - 2, h - 2, lit ? C.sunDeep : '#3a4466')
  rect(g, 2, 2, w - 4, h - 4, lit ? '#1a1640' : '#0f1530')
  const full = 'OPEN TO WORK'
  const text = textWidth(full) <= w - 4 ? full : 'OPEN'
  const tw = textWidth(text)
  const tx = Math.floor((w - tw) / 2)
  const ty = Math.floor((h - 5) / 2)
  if (lit) {
    // warm glow behind the letters instead of a halo, so the text stays crisp
    rect(g, tx - 1, ty - 1, tw + 2, 7, '#4a3410')
    dither(g, tx - 1, ty - 1, tw + 2, 7, '#5c4214')
  }
  pixelText(g, text, tx, ty, lit ? C.sunHi : '#56607f')
  if (text !== full) {
    // little sunflower dots either side of the short label
    for (const sx of [5, w - 6]) {
      const c = lit ? C.sun : '#4a5272'
      px(g, sx, ty + 1, c)
      px(g, sx - 1, ty + 2, c)
      px(g, sx + 1, ty + 2, c)
      px(g, sx, ty + 3, c)
      px(g, sx, ty + 2, lit ? C.woodDark : '#2b3150')
    }
  }
  outline(g, C.line)
}

function windowView(g: Ctx, w: number, night: boolean): void {
  const frame = night ? '#c9d4ec' : C.ink
  rect(g, 2, 1, w - 4, 24, frame)
  rect(g, 2, 1, w - 4, 1, '#ffffff')
  rect(g, w - 3, 2, 1, 23, night ? C.steel : C.muted)
  const sky = night ? ['#0c1a48', '#11235a', '#183072'] : ['#79bdfd', '#9cd2ff', '#c2e5ff']
  const gx = 4
  const gy = 3
  const gw = w - 8
  rect(g, gx, gy, gw, 6, sky[0] ?? '#000')
  rect(g, gx, gy + 6, gw, 7, sky[1] ?? '#000')
  rect(g, gx, gy + 13, gw, 7, sky[2] ?? '#000')
  if (night) {
    oval(g, 7, 4, 6, 6, '#f4f8ff')
    oval(g, 9, 3, 6, 6, sky[0] ?? '#000')
    const r = rng(5)
    for (let i = 0; i < 9; i++) px(g, gx + Math.floor(r() * gw), gy + Math.floor(r() * 9), i % 3 === 0 ? C.sunHi : C.ink)
  } else {
    oval(g, 6, 5, 9, 3, '#ffffff')
    oval(g, 9, 4, 5, 2, '#ffffff')
    oval(g, 25, 8, 8, 3, '#ffffff')
    rect(g, 26, 8, 3, 1, '#ffffff')
    px(g, 33, 4, C.sunHi)
  }
  const blocks: [number, number, number][] = [
    [4, 5, 6], [9, 4, 10], [13, 6, 5], [19, 5, 8], [24, 4, 12], [28, 4, 7], [32, 4, 9],
  ]
  const r = rng(11)
  blocks.forEach(([bx, bw, bh], i) => {
    const col = night ? (i % 2 ? '#0a1430' : '#121f45') : i % 2 ? '#6d84b3' : '#8199c9'
    const by = gy + 20 - bh
    rect(g, bx, by, bw, bh, col)
    for (let yy = by + 1; yy < gy + 19; yy += 2)
      for (let xx = bx + 1; xx < bx + bw - 1; xx += 2)
        if (r() < (night ? 0.45 : 0.3)) px(g, xx, yy, night ? C.sun : '#b8c9ec')
  })
  // mullions
  rect(g, Math.floor(w / 2) - 1, gy, 2, 20, frame)
  rect(g, gx, gy + 9, gw, 1, frame)
  // sill
  rect(g, 1, 24, w - 2, 2, C.woodHi)
  rect(g, 1, 26, w - 2, 3, C.woodMid)
  rect(g, 1, 28, w - 2, 1, C.wood)
  outline(g, C.line)
}

function jerseyFrame(g: Ctx, w: number, h: number): void {
  rect(g, 1, 1, w - 2, h - 2, C.woodDark)
  rect(g, 1, 1, w - 2, 1, C.wood)
  rect(g, 2, 2, w - 4, h - 4, C.woodMid)
  rect(g, 3, 3, w - 6, h - 6, C.cream)
  const J = C.cobaltRaised
  rect(g, 6, 4, 3, 4, J) // straps
  rect(g, 13, 4, 3, 4, J)
  rect(g, 6, 8, 10, 4, J)
  rect(g, 5, 12, 12, 11, J)
  // V neck and arm-hole trim
  rect(g, 9, 8, 4, 1, C.ink)
  rect(g, 10, 9, 2, 1, C.ink)
  rect(g, 9, 4, 1, 4, C.ink)
  rect(g, 12, 4, 1, 4, C.ink)
  rect(g, 5, 11, 2, 1, C.ink)
  rect(g, 15, 11, 2, 1, C.ink)
  rect(g, 5, 21, 12, 1, C.ink)
  rect(g, 16, 12, 1, 11, C.cobalt)
  rect(g, 5, 12, 1, 9, C.cobaltHi)
  pixelText(g, '77', Math.floor((w - textWidth('77')) / 2), 13, C.ink)
  px(g, 4, 4, '#ffffff')
  px(g, 5, 4, '#ffffff')
  px(g, 4, 5, '#ffffff')
  outline(g, C.woodLine)
}

function sportsRack(g: Ctx, w: number, h: number): void {
  rect(g, 2, 2, w - 4, h - 4, C.woodMid)
  rect(g, 2, 2, w - 4, 1, C.woodHi)
  rect(g, 2, 2, 1, h - 4, C.woodLight)
  rect(g, w - 3, 3, 1, h - 5, C.wood)
  rect(g, 3, 11, w - 6, 1, C.wood)
  rect(g, 3, 20, w - 6, 1, C.wood)
  // cricket bat: handle top-right, blade bottom-left
  line(g, 21, 5, 17, 11, C.line, 4)
  line(g, 16, 12, 7, 23, C.line, 6)
  line(g, 16, 12, 7, 23, C.woodHi, 4)
  line(g, 17, 13, 8, 24, C.woodLight, 2)
  line(g, 21, 5, 17, 11, C.ink, 2)
  px(g, 20, 7, C.red)
  px(g, 19, 9, C.red)
  // badminton racket: head top-left, grip bottom-right
  oval(g, 3, 3, 11, 12, C.line)
  oval(g, 4, 4, 9, 10, C.red)
  oval(g, 5, 5, 7, 8, C.ink)
  for (let x = 6; x < 11; x += 2) rect(g, x, 5, 1, 8, C.steelHi)
  for (let y = 6; y < 13; y += 2) rect(g, 5, y, 7, 1, C.steelHi)
  line(g, 11, 14, 19, 23, C.line, 3)
  line(g, 11, 14, 19, 23, C.steel, 1)
  line(g, 19, 23, 22, 26, C.line, 4)
  line(g, 19, 23, 22, 26, C.ink, 2)
  px(g, 21, 25, C.sun)
  // pegs
  rect(g, 4, 18, 2, 2, C.woodDark)
  rect(g, 22, 4, 2, 2, C.woodDark)
  outline(g, C.woodLine)
}

export const WALL = {
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
