// Placeholder pixel art for every id in contract.ts. Light comes from the top-left.

import {
  HERO_SIZE,
  PAL,
  SPRITE_SIZES,
  type HeroDir,
  type HeroSpriteId,
  type Sprite,
  type SpriteId,
  type StaticSpriteId,
} from './contract'
import {
  type Ctx,
  bevel,
  box,
  diamond,
  dither,
  inset,
  line,
  makeCanvas,
  outline,
  oval,
  pattern,
  px,
  rect,
  rng,
  rrect,
  shade,
} from './draw'
import { pixelText, textWidth } from './font'

export { pixelText } from './font'

const C = {
  line: PAL.line,
  ink: PAL.ink,
  muted: PAL.muted,
  cobalt: PAL.cobalt,
  cobaltDeep: PAL.cobaltDeep,
  cobaltRaised: PAL.cobaltRaised,
  cobaltHi: '#5c8dff',
  sun: PAL.sun,
  sunDeep: PAL.sunDeep,
  sunHi: '#ffe78f',
  leaf: PAL.leaf,
  leafDeep: PAL.leafDeep,
  leafHi: '#8ae39d',
  woodLine: '#3a2213',
  woodDark: '#5e3a1f',
  wood: '#8a5a33',
  woodMid: '#b07a45',
  woodLight: '#d9a066',
  woodHi: '#ecc492',
  steelLo: '#56658a',
  steel: '#8796b8',
  steelHi: '#c3cde4',
  screen: '#0b1840',
  screenHi: '#1d3a85',
  bezel: '#1a2340',
  cream: '#f6ecd2',
  red: '#e5484d',
  violet: '#8c6cf0',
  teal: '#2fb8b0',
  soil: '#4a2e1a',
} as const

type DrawFn = (g: Ctx, w: number, h: number) => void

// ---------------------------------------------------------------- architecture

function floorTech(g: Ctx): void {
  const base = '#5b6f96'
  rect(g, 0, 0, 16, 16, base)
  for (const o of [0, 8]) {
    rect(g, 0, o, 16, 1, '#6c82ad')
    rect(g, o, 0, 1, 16, '#6c82ad')
  }
  for (const o of [7, 15]) {
    rect(g, 0, o, 16, 1, '#46587c')
    rect(g, o, 0, 1, 16, '#46587c')
  }
  for (const [x, y] of [[3, 3], [12, 4], [5, 12], [11, 11]] as const) px(g, x, y, '#52668c')
}

function floorWood(g: Ctx): void {
  const tones = [C.woodMid, '#a46c3b', '#b8824c', '#a97240']
  const joints = [5, 12, 2, 9]
  for (let i = 0; i < 4; i++) {
    const y = i * 4
    const t = tones[i] ?? C.woodMid
    const j = joints[i] ?? 0
    rect(g, 0, y, 16, 3, t)
    rect(g, 0, y, 16, 1, shade(t, 0.12))
    rect(g, 0, y + 3, 16, 1, '#7d4f2b')
    rect(g, j, y, 1, 3, '#7d4f2b')
    const grain = shade(t, -0.12)
    rect(g, (j + 4) % 16, y + 1, 2, 1, grain)
    rect(g, (j + 10) % 16, y + 2, 3, 1, grain)
  }
}

function wall(g: Ctx): void {
  rect(g, 0, 0, 16, 1, C.line)
  rect(g, 0, 1, 16, 1, C.cobaltHi)
  rect(g, 0, 2, 16, 1, C.cobaltRaised)
  rect(g, 0, 3, 16, 1, C.cobaltDeep)
  rect(g, 0, 4, 16, 34, C.cobalt)
  rect(g, 0, 4, 16, 1, shade(C.cobalt, -0.2))
  const motif = shade(C.cobalt, 0.1)
  for (const [x, y] of [[3, 12], [11, 22], [3, 32]] as const) {
    px(g, x, y, motif)
    px(g, x - 1, y + 1, motif)
    px(g, x + 1, y + 1, motif)
    px(g, x, y + 2, motif)
  }
  rect(g, 0, 38, 16, 1, C.woodLight)
  rect(g, 0, 39, 16, 1, C.wood)
  rect(g, 0, 40, 16, 18, C.cobaltDeep)
  inset(g, 2, 42, 12, 14, C.cobaltDeep, 0.2)
  rect(g, 0, 58, 16, 1, C.woodHi)
  rect(g, 0, 59, 16, 4, C.woodMid)
  rect(g, 0, 63, 16, 1, C.woodDark)
}

function wallSide(g: Ctx): void {
  rect(g, 0, 0, 8, 16, C.cobaltDeep)
  rect(g, 0, 0, 1, 16, C.line)
  rect(g, 7, 0, 1, 16, C.line)
  rect(g, 1, 0, 1, 16, C.cobaltRaised)
  rect(g, 6, 0, 1, 16, shade(C.cobaltDeep, -0.25))
}

function railBottom(g: Ctx): void {
  rect(g, 0, 0, 16, 1, C.woodLine)
  rect(g, 0, 1, 16, 1, C.woodHi)
  rect(g, 0, 2, 16, 2, C.woodLight)
  rect(g, 0, 4, 16, 1, C.wood)
  for (const bx of [3, 11]) {
    rect(g, bx - 1, 5, 4, 3, C.woodLine)
    rect(g, bx, 5, 2, 3, C.woodMid)
    rect(g, bx + 1, 5, 1, 3, C.wood)
  }
  rect(g, 0, 8, 16, 1, C.wood)
  rect(g, 0, 9, 16, 1, C.woodLine)
}

function rugDen(g: Ctx, w: number, h: number): void {
  rrect(g, 2, 1, w - 4, h - 1, 7, shade(C.sunDeep, -0.3))
  rrect(g, 2, 0, w - 4, h - 1, 7, C.sunDeep)
  rrect(g, 4, 2, w - 8, h - 5, 6, C.sun)
  rrect(g, 7, 5, w - 14, h - 11, 4, C.cream)
  rrect(g, 10, 8, w - 20, h - 17, 3, C.cobaltRaised)
  rrect(g, 11, 9, w - 22, h - 19, 3, C.cream)
  const cx = Math.floor(w / 2)
  const cy = Math.floor((h - 1) / 2)
  diamond(g, cx, cy, 11, C.cobalt)
  diamond(g, cx, cy, 8, C.cream)
  diamond(g, cx, cy, 6, C.sun)
  diamond(g, cx, cy, 3, C.woodMid)
  diamond(g, cx, cy, 1, C.woodDark)
  for (const sx of [cx - 25, cx + 25]) {
    diamond(g, sx, cy, 5, C.cobaltRaised)
    diamond(g, sx, cy, 2, C.sun)
  }
  for (const [x, y] of [[14, 12], [w - 15, 12], [14, h - 15], [w - 15, h - 15]] as const) diamond(g, x, y, 1, C.leafDeep)
  for (let y = 8; y < h - 8; y += 2) {
    rect(g, 0, y, 2, 1, C.cream)
    rect(g, w - 2, y, 2, 1, C.cream)
  }
}

function rugWork(g: Ctx, w: number, h: number): void {
  rrect(g, 0, 1, w, h - 1, 3, '#0b2257')
  rrect(g, 0, 0, w, h - 1, 3, '#16337d')
  rrect(g, 2, 2, w - 4, h - 5, 2, C.muted)
  rrect(g, 3, 3, w - 6, h - 7, 2, '#1f3f8f')
  rect(g, 6, 6, w - 12, 1, C.sun)
  rect(g, 6, h - 8, w - 12, 1, C.sun)
  for (let x = 12; x < w - 10; x += 8)
    for (let y = 11; y < h - 10; y += 6) {
      px(g, x, y, '#3159b5')
      px(g, x - 1, y, '#2b4fa3')
      px(g, x + 1, y, '#2b4fa3')
    }
}

// ---------------------------------------------------------------- back wall

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

// ---------------------------------------------------------------- work half

function workstation(label: string, textCol: string, icon: (g: Ctx) => void, mug: string): DrawFn {
  return (g) => {
    // desk: top face, front face, legs
    rect(g, 2, 20, 48, 5, C.woodLight)
    rect(g, 2, 20, 48, 1, C.woodHi)
    rect(g, 2, 25, 48, 7, C.woodMid)
    rect(g, 2, 25, 48, 1, C.wood)
    rect(g, 49, 20, 1, 12, C.wood)
    bevel(g, 36, 26, 12, 5, C.woodLight, 0.15)
    rect(g, 40, 28, 4, 1, C.woodDark)
    rect(g, 3, 32, 3, 7, C.wood)
    rect(g, 46, 32, 3, 7, C.wood)
    rect(g, 5, 32, 1, 7, C.woodDark)
    rect(g, 48, 32, 1, 7, C.woodDark)
    // monitor
    rect(g, 23, 15, 6, 5, C.steelLo)
    rect(g, 19, 19, 14, 2, C.steel)
    rect(g, 19, 19, 14, 1, C.steelHi)
    box(g, 9, 1, 34, 16, C.bezel, C.line)
    rect(g, 11, 3, 30, 12, C.screen)
    rect(g, 11, 3, 30, 1, C.screenHi)
    pixelText(g, label, 11 + Math.floor((30 - textWidth(label)) / 2), 5, textCol)
    icon(g)
    px(g, 40, 15, C.leaf)
    // keyboard + mouse + mug
    rect(g, 15, 22, 18, 2, C.steelHi)
    for (let x = 16; x < 32; x += 2) px(g, x, 22, C.steel)
    rect(g, 15, 24, 18, 1, C.steelLo)
    rect(g, 35, 22, 2, 2, C.steelHi)
    rect(g, 42, 18, 3, 4, mug)
    rect(g, 42, 18, 3, 1, C.woodDark)
    px(g, 45, 19, mug)
    px(g, 45, 20, mug)
    // chair, back view, in front of the desk
    box(g, 18, 26, 16, 9, C.cobaltDeep, C.line)
    rect(g, 19, 27, 14, 1, C.cobaltRaised)
    rect(g, 19, 28, 1, 6, C.cobalt)
    box(g, 16, 33, 20, 4, '#14306f', C.line)
    rect(g, 17, 34, 18, 1, C.cobalt)
    rect(g, 25, 37, 2, 1, C.steelLo)
    rect(g, 19, 38, 14, 1, C.steel)
    px(g, 19, 38, C.bezel)
    px(g, 32, 38, C.bezel)
    outline(g, C.line)
  }
}

const iconCards = (g: Ctx): void => {
  rect(g, 14, 11, 7, 3, C.muted)
  rect(g, 22, 11, 7, 3, C.sun)
  rect(g, 30, 11, 7, 3, C.muted)
  px(g, 15, 12, C.cobalt)
  px(g, 23, 12, C.woodDark)
  px(g, 31, 12, C.cobalt)
}
const iconRing = (g: Ctx): void => {
  pattern(g, 23, 10, ['..d..', '.ooo.', 'o...o', 'o...o', '.ooo.'], { o: C.sun, d: C.ink })
  px(g, 30, 10, C.sunHi)
  px(g, 17, 12, C.sunDeep)
}
const iconChart = (g: Ctx): void => {
  rect(g, 13, 14, 26, 1, '#22397a')
  line(g, 13, 14, 18, 12, C.leaf)
  line(g, 18, 12, 23, 13, C.leaf)
  line(g, 23, 13, 29, 11, C.leaf)
  line(g, 29, 11, 34, 12, C.leaf)
  line(g, 34, 12, 38, 11, C.leaf)
  px(g, 38, 11, C.sun)
}

function arcade(label: string, body: string, accent: string, screen: (g: Ctx, x: number, y: number, w: number, h: number) => void): DrawFn {
  return (g, w) => {
    const half = Math.ceil(label.length / 2)
    const lines = textWidth(label) <= w - 4 ? [label] : [label.slice(0, half), label.slice(half)]
    const mh = lines.length * 6 + 3
    rect(g, 1, 1, w - 2, 36, body)
    rect(g, 1, 1, 1, 36, shade(body, 0.3))
    rect(g, w - 2, 1, 1, 36, shade(body, -0.35))
    // marquee
    rect(g, 1, 1, w - 2, mh, accent)
    rect(g, 2, 2, w - 4, mh - 2, '#0d1838')
    lines.forEach((t, i) => pixelText(g, t, Math.floor((w - textWidth(t)) / 2), 3 + i * 6, accent))
    // screen
    const sy = mh + 2
    rect(g, 3, sy, w - 6, 25 - sy + 1, '#0a0f24')
    rect(g, 4, sy + 1, w - 8, 25 - sy - 1, C.screen)
    screen(g, 4, sy + 1, w - 8, 25 - sy - 1)
    // control panel (3/4 top face) and joystick
    rect(g, 1, 26, w - 2, 3, shade(body, 0.35))
    rect(g, 1, 29, w - 2, 1, shade(body, -0.4))
    rect(g, 5, 26, 1, 2, C.steelLo)
    rect(g, 4, 25, 3, 2, C.red)
    px(g, 4, 25, '#ff9aa0')
    rect(g, 10, 27, 2, 1, C.sun)
    rect(g, 13, 27, 2, 1, accent === C.sun ? C.leaf : C.sun)
    // lower cabinet with coin door
    inset(g, 7, 31, 6, 4, shade(body, -0.2), 0.2)
    rect(g, 9, 32, 2, 1, C.sun)
    outline(g, C.line)
  }
}

const screenTether = (g: Ctx, x: number, y: number, w: number, h: number): void => {
  const ax = x + 1
  const ay = y + h - 3
  const bx = x + w - 3
  const by = y + 1
  line(g, ax + 1, ay, bx, by + 1, C.ink)
  rect(g, ax, ay, 2, 2, C.leaf)
  rect(g, bx, by, 2, 2, C.sun)
}
const screenVoice = (g: Ctx, x: number, y: number, w: number, h: number): void => {
  const amp = [1, 2, 4, 2, 5, 3, 1, 3, 4, 2, 1, 2]
  const mid = y + Math.floor(h / 2)
  for (let i = 0; i < w; i++) {
    const a = Math.min(Math.floor(h / 2), amp[i % amp.length] ?? 1)
    rect(g, x + i, mid - a, 1, a * 2 + 1, i % 2 ? C.sunDeep : C.sun)
  }
}
const screenBid = (g: Ctx, x: number, y: number, w: number, h: number): void => {
  const pw = 7
  const ph = Math.min(h - 2, 9)
  const px0 = x + Math.floor((w - pw) / 2)
  const py0 = y + Math.floor((h - ph) / 2)
  rect(g, px0, py0, pw, ph, C.ink)
  rect(g, px0 + pw - 2, py0, 2, 2, C.muted)
  px(g, px0 + pw - 1, py0, C.screen)
  for (let ly = py0 + 2; ly < py0 + ph - 1; ly += 2) rect(g, px0 + 1, ly, ly === py0 + 2 ? 3 : 5, 1, C.steel)
  px(g, px0 + pw - 2, py0 + ph - 2, C.red)
}

function serverRack(g: Ctx, w: number, h: number): void {
  rect(g, 1, 1, w - 2, h - 2, '#1a2244')
  rect(g, 1, 1, w - 2, 3, '#2e3a6c')
  rect(g, 1, 1, w - 2, 1, '#44539a')
  rect(g, 1, 4, 1, h - 5, '#2a3566')
  rect(g, w - 2, 1, 1, h - 2, '#10162e')
  for (let i = 0; i < 6; i++) {
    const y = 6 + i * 6
    bevel(g, 3, y, w - 6, 5, '#232d55', 0.15)
    px(g, 5, y + 2, C.leaf)
    px(g, 7, y + 2, i % 2 ? C.sun : C.leaf)
    px(g, 9, y + 2, i === 3 ? C.red : C.cobaltRaised)
    for (let vx = 12; vx < w - 4; vx += 2) rect(g, vx, y + 1, 1, 3, '#141a33')
  }
  outline(g, C.line)
}

function kiosk(g: Ctx, w: number): void {
  rect(g, 2, 1, w - 4, 1, C.steelLo)
  rect(g, 1, 2, w - 2, 12, C.bezel)
  rect(g, 1, 2, w - 2, 1, '#2c3866')
  rect(g, 3, 4, w - 6, 8, C.screen)
  pixelText(g, '>', 4, 5, C.leaf)
  pixelText(g, '_', 8, 5, C.leaf)
  rect(g, 4, 11, 6, 1, C.screenHi)
  px(g, 12, 13, C.sun)
  rect(g, 7, 14, 2, 12, C.steel)
  rect(g, 7, 14, 1, 12, C.steelHi)
  rect(g, 7, 18, 2, 2, C.sun)
  rect(g, 3, 26, w - 6, 3, C.steel)
  rect(g, 3, 26, w - 6, 1, C.steelHi)
  rect(g, 3, 28, w - 6, 1, C.steelLo)
  outline(g, C.line)
}

function plantTall(g: Ctx): void {
  const blades: [number, number, boolean][] = [
    [2, 9, false], [5, 2, true], [8, 5, false], [10, 11, true], [4, 13, false], [7, 14, true],
  ]
  for (const [x, top, deep] of blades) {
    const col = deep ? C.leafDeep : C.leaf
    px(g, x + 1, top, col)
    rect(g, x, top + 1, 2, 20 - top, col)
    rect(g, x, top + 1, 1, 20 - top, deep ? C.leaf : C.leafHi)
    for (let y = top + 3; y < 19; y += 4) px(g, x + 1, y, deep ? '#1a6a30' : C.leafDeep)
  }
  rect(g, 2, 20, 10, 2, C.woodLight)
  rect(g, 3, 20, 8, 1, C.soil)
  px(g, 2, 20, C.woodHi)
  rect(g, 3, 22, 8, 6, C.woodMid)
  rect(g, 4, 28, 6, 1, C.woodMid)
  rect(g, 3, 22, 1, 6, C.woodLight)
  rect(g, 10, 22, 1, 6, C.wood)
  rect(g, 3, 24, 8, 1, C.sun)
  outline(g, '#2a2412')
}

// ---------------------------------------------------------------- den half

function bookshelf(g: Ctx, w: number, h: number): void {
  rect(g, 1, 1, w - 2, h - 2, C.wood)
  rect(g, 1, 1, w - 2, 3, C.woodLight)
  rect(g, 1, 1, w - 2, 1, C.woodHi)
  rect(g, 1, 4, 2, h - 5, C.woodMid)
  rect(g, w - 3, 4, 2, h - 5, C.wood)
  rect(g, 3, 4, w - 6, 38, '#4a2c16')
  for (const y of [13, 24, 35]) {
    rect(g, 3, y, w - 6, 1, C.woodLight)
    rect(g, 3, y + 1, w - 6, 1, C.wood)
  }
  const colors = [C.cobaltRaised, C.sun, C.leaf, C.red, C.ink, C.violet, C.woodLight, C.leafDeep, C.sunDeep, C.muted, C.teal]
  const r = rng(42)
  const comps: [number, number][] = [[4, 12], [15, 23], [26, 34]]
  comps.forEach(([top, bottom], ci) => {
    let x = 4
    const stop = ci === 0 ? 30 : ci === 1 ? 31 : w - 4
    while (x < stop) {
      const bw = r() < 0.5 ? 2 : 3
      if (x + bw > stop) break
      if (r() < 0.08) {
        x += 2
        continue
      }
      const bh = 5 + Math.floor(r() * (bottom - top - 3))
      const col = colors[Math.floor(r() * colors.length)] ?? C.sun
      const by = bottom - bh + 1
      rect(g, x, by, bw, bh, col)
      rect(g, x, by, 1, bh, shade(col, 0.25))
      rect(g, x, by + 2, bw, 1, shade(col, -0.3))
      x += bw
    }
  })
  // trophy on the top shelf
  rect(g, 32, 6, 3, 3, C.sun)
  rect(g, 31, 6, 1, 2, C.sunDeep)
  rect(g, 35, 6, 1, 2, C.sunDeep)
  rect(g, 33, 9, 1, 2, C.sunDeep)
  rect(g, 32, 11, 3, 2, C.sunDeep)
  px(g, 32, 6, C.sunHi)
  // little succulent on the middle shelf
  rect(g, 32, 21, 4, 3, C.cobaltRaised)
  rect(g, 33, 19, 2, 2, C.leaf)
  px(g, 32, 18, C.leaf)
  px(g, 35, 18, C.leafDeep)
  // drawers
  bevel(g, 4, 37, 16, 5, C.woodMid, 0.15)
  bevel(g, 20, 37, 16, 5, C.woodMid, 0.15)
  rect(g, 10, 39, 4, 1, C.woodDark)
  rect(g, 26, 39, 4, 1, C.woodDark)
  rect(g, 1, h - 4, w - 2, 3, C.woodDark)
  outline(g, C.woodLine)
}

function radio(playing: boolean): DrawFn {
  return (g, w) => {
    // cabinet
    rect(g, 1, 12, w - 2, 3, C.woodLight)
    rect(g, 1, 12, w - 2, 1, C.woodHi)
    rect(g, 1, 15, w - 2, 8, C.woodMid)
    rect(g, w - 2, 12, 1, 11, C.wood)
    rect(g, 3, 16, 12, 6, C.wood)
    dither(g, 3, 16, 12, 6, C.woodDark)
    bevel(g, 18, 16, 13, 6, C.woodLight, 0.15)
    rect(g, 20, 18, 2, 2, C.woodDark)
    rect(g, 3, 23, 2, 2, C.woodDark)
    rect(g, w - 5, 23, 2, 2, C.woodDark)
    // turntable on top
    rect(g, 4, 3, 26, 6, '#d4dbea')
    rect(g, 4, 3, 26, 1, '#eef2fa')
    rect(g, 4, 9, 26, 4, C.woodDark)
    rect(g, 4, 9, 26, 1, C.wood)
    oval(g, 6, 3, 15, 6, '#16182a')
    oval(g, 8, 4, 11, 4, '#262a40')
    oval(g, 10, 5, 7, 2, '#16182a')
    rect(g, 12, 5, 3, 2, playing ? C.sun : C.red)
    if (playing) {
      px(g, 16, 7, '#7a80a8')
      px(g, 17, 7, '#7a80a8')
      px(g, 14, 5, C.woodDark)
    } else {
      px(g, 9, 4, '#7a80a8')
      px(g, 10, 4, '#7a80a8')
      px(g, 12, 5, C.ink)
    }
    rect(g, 25, 3, 3, 2, C.steelLo)
    line(g, 25, 5, 20, 7, C.steelHi)
    px(g, 19, 7, C.ink)
    // dial + knobs
    rect(g, 6, 10, 11, 2, playing ? C.sun : '#5a4630')
    px(g, playing ? 13 : 9, 10, playing ? C.red : '#2a1e14')
    px(g, playing ? 13 : 9, 11, playing ? C.red : '#2a1e14')
    rect(g, 20, 10, 2, 2, C.steelHi)
    rect(g, 24, 10, 2, 2, C.steelHi)
    px(g, 28, 10, playing ? C.leaf : '#2a3a2a')
    outline(g, C.woodLine)
    if (playing) {
      const glow = 'rgba(255, 201, 40, 0.4)'
      rect(g, 6, 8, 11, 1, glow)
    }
  }
}

const PETAL = { P: C.sun, p: C.sunDeep, h: C.sunHi, d: C.woodDark, c: C.wood, e: '#1e120a', m: '#1e120a' }

function sunflower(g: Ctx): void {
  // stems + leaves first so the heads sit on top
  rect(g, 8, 11, 1, 12, C.leafDeep)
  rect(g, 7, 11, 1, 12, C.leaf)
  line(g, 4, 18, 6, 22, C.leafDeep)
  line(g, 11, 15, 9, 19, C.leafDeep)
  pattern(g, 9, 16, ['.LL.', 'LLLL', '.Ll.'], { L: C.leaf, l: C.leafDeep })
  pattern(g, 2, 19, ['LL..', '.LLl'], { L: C.leaf, l: C.leafDeep })
  // bud on the right
  pattern(g, 10, 12, ['.p.', 'PPp', '.l.'], { P: C.sun, p: C.sunDeep, l: C.leafDeep })
  // small flower, left
  pattern(g, 1, 12, ['..P.P..', '.PPPPP.', 'PPdddPp', '.PdcdP.', 'PPdddpp', '.PPppp.', '..p.p..'], PETAL)
  // big flower with a little face
  pattern(
    g,
    3,
    1,
    [
      '....P.P....',
      '..P.hPh.P..',
      '..PhPPPPP..',
      '.PhPdddPPP.',
      'PPPdcccdPPp',
      'PPPcececPpp',
      'PPPcmcmcPpp',
      '.PPdcmcdpp.',
      '..PPdddpp..',
      '..P.ppp.p..',
      '....p.p....',
    ],
    PETAL,
  )
  outline(g, '#2a2410')
  // cobalt pot with a heart
  rect(g, 2, 22, 12, 3, C.cobaltRaised)
  rect(g, 3, 22, 10, 1, C.soil)
  px(g, 2, 22, C.cobaltHi)
  px(g, 13, 22, C.cobaltHi)
  rect(g, 2, 23, 12, 1, C.cobaltHi)
  rect(g, 2, 24, 12, 1, C.cobaltDeep)
  rect(g, 3, 25, 10, 3, C.cobalt)
  rect(g, 4, 28, 8, 3, C.cobalt)
  rect(g, 3, 25, 1, 3, C.cobaltRaised)
  rect(g, 4, 28, 1, 3, C.cobaltRaised)
  rect(g, 12, 25, 1, 3, C.cobaltDeep)
  rect(g, 11, 28, 1, 3, C.cobaltDeep)
  pattern(g, 5, 25, ['hh.hh', 'hhhhh', '.hhh.', '..h..'], { h: C.sun })
  rect(g, 7, 22, 2, 1, C.leafDeep)
  outline(g, C.line)
}

function sofa(g: Ctx, w: number): void {
  // back cushions
  box(g, 5, 2, w - 10, 13, C.cobalt, C.line)
  rect(g, 6, 3, w - 12, 1, C.cobaltRaised)
  rect(g, Math.floor(w / 2) - 1, 3, 1, 11, C.cobaltDeep)
  rect(g, Math.floor(w / 2), 3, 1, 11, C.cobaltRaised)
  // seat cushions: top face + front face
  box(g, 8, 13, w - 16, 9, C.cobaltRaised, C.line)
  rect(g, 9, 14, w - 18, 1, C.cobaltHi)
  rect(g, Math.floor(w / 2) - 1, 14, 1, 7, C.cobalt)
  box(g, 8, 20, w - 16, 6, C.cobaltDeep, C.line)
  rect(g, 9, 21, w - 18, 1, C.cobalt)
  // arms
  for (const ax of [1, w - 9]) {
    box(g, ax, 7, 8, 20, C.cobalt, C.line)
    rect(g, ax + 1, 8, 6, 3, C.cobaltRaised)
    rect(g, ax + 1, 8, 6, 1, C.cobaltHi)
    rect(g, ax + 1, 11, 6, 1, C.cobaltDeep)
  }
  rect(g, w - 3, 12, 1, 14, C.cobaltDeep)
  // base + feet
  rect(g, 2, 26, w - 4, 1, C.line)
  rect(g, 3, 27, 3, 2, C.woodDark)
  rect(g, w - 6, 27, 3, 2, C.woodDark)
  // sunflower throw cushion
  pattern(
    g,
    10,
    7,
    ['.yyyyyyyy.', 'yyyyyyyyyY', 'yyyyddyyyY', 'yyydccdyyY', 'yyydccdyyY', 'yyyyddyyyY', 'yyyyyyyyYY', '.YYYYYYYY.'],
    { y: C.sun, Y: C.sunDeep, d: C.woodDark, c: C.wood },
  )
  outline(g, C.line)
}

function coffeeTable(g: Ctx, w: number): void {
  rect(g, 1, 1, w - 2, 4, C.woodLight)
  rect(g, 1, 1, w - 2, 1, C.woodHi)
  rect(g, 1, 5, w - 2, 2, C.woodMid)
  rect(g, w - 2, 1, 1, 6, C.wood)
  rect(g, 3, 7, 3, 6, C.wood)
  rect(g, w - 6, 7, 3, 6, C.wood)
  rect(g, 5, 7, 1, 6, C.woodDark)
  rect(g, w - 4, 7, 1, 6, C.woodDark)
  rect(g, 4, 2, 6, 1, '#f3d2a8')
  outline(g, C.woodLine)
}

function laptop(g: Ctx): void {
  rect(g, 2, 1, 10, 5, C.steelHi)
  rect(g, 3, 2, 8, 3, C.cobaltDeep)
  rect(g, 4, 2, 3, 1, C.sun)
  rect(g, 4, 3, 5, 1, C.leaf)
  rect(g, 5, 4, 2, 1, C.muted)
  rect(g, 1, 6, 12, 2, C.steel)
  rect(g, 1, 6, 12, 1, C.steelHi)
  rect(g, 5, 7, 4, 1, C.steelLo)
  outline(g, C.line)
}

function tvStand(g: Ctx, w: number): void {
  // stand
  rect(g, 1, 19, w - 2, 2, C.woodLight)
  rect(g, 1, 19, w - 2, 1, C.woodHi)
  rect(g, 1, 21, w - 2, 7, C.woodMid)
  rect(g, w - 2, 19, 1, 9, C.wood)
  bevel(g, 3, 22, 11, 5, C.woodLight, 0.15)
  bevel(g, w - 14, 22, 11, 5, C.woodLight, 0.15)
  rect(g, 15, 22, w - 30, 5, '#4a2c16')
  rect(g, 16, 24, 8, 3, C.bezel)
  px(g, 17, 25, C.leaf)
  rect(g, 12, 24, 1, 1, C.woodDark)
  rect(g, w - 13, 24, 1, 1, C.woodDark)
  rect(g, 3, 28, 2, 1, C.woodDark)
  rect(g, w - 5, 28, 2, 1, C.woodDark)
  // tv
  rect(g, 18, 17, 4, 2, C.steelLo)
  box(g, 5, 1, 30, 17, '#141a2e', C.line)
  rect(g, 7, 3, 26, 13, '#173a9c')
  rect(g, 7, 3, 26, 4, '#2a62e8')
  rect(g, 7, 13, 26, 3, C.leafDeep)
  rect(g, 7, 13, 26, 1, C.leaf)
  rect(g, 22, 9, 7, 1, C.woodLight)
  rect(g, 24, 6, 2, 2, C.sun)
  // stick figure
  pattern(g, 11, 6, ['.o.', '.o.', 'ooo', '.o.', 'o.o', 'o.o'], { o: C.ink })
  px(g, 30, 12, C.red)
  px(g, 29, 12, C.red)
  px(g, 32, 4, C.sunHi)
  // controller on the stand top
  rect(g, 27, 18, 6, 2, '#3a3f5c')
  px(g, 27, 18, '#5a6080')
  px(g, 31, 18, C.sun)
  px(g, 32, 19, C.red)
  outline(g, C.line)
}

function lamp(on: boolean): DrawFn {
  return (g) => {
    const s = on ? '#ffd75e' : '#c9a46a'
    const hi = on ? '#fff0b0' : '#dcc08c'
    const lo = on ? '#f0b030' : '#a07c48'
    rect(g, 4, 1, 4, 1, s)
    rect(g, 3, 2, 6, 3, s)
    rect(g, 2, 5, 8, 4, s)
    px(g, 4, 1, hi)
    rect(g, 3, 2, 1, 3, hi)
    rect(g, 2, 5, 1, 4, hi)
    rect(g, 8, 2, 1, 3, lo)
    rect(g, 9, 5, 1, 4, lo)
    rect(g, 2, 9, 8, 1, on ? '#fff6d8' : '#6b5230')
    rect(g, 5, 10, 2, 22, C.woodDark)
    rect(g, 5, 10, 1, 22, C.wood)
    rect(g, 3, 32, 6, 1, C.wood)
    rect(g, 2, 33, 8, 2, C.woodDark)
    outline(g, C.woodLine)
    if (on) {
      dither(g, 1, 10, 10, 4, 'rgba(255, 201, 40, 0.35)')
      rect(g, 3, 10, 6, 1, 'rgba(255, 231, 143, 0.7)')
    }
  }
}

function basketball(g: Ctx): void {
  oval(g, 1, 1, 8, 8, '#e8752a')
  px(g, 3, 2, '#ffa45c')
  px(g, 2, 3, '#ffa45c')
  px(g, 3, 3, '#ffa45c')
  rect(g, 6, 6, 2, 2, '#c4561a')
  const seam = '#5a2a10'
  rect(g, 1, 5, 8, 1, seam)
  rect(g, 5, 1, 1, 8, seam)
  px(g, 3, 1, seam)
  px(g, 2, 2, seam)
  px(g, 2, 8, seam)
  px(g, 3, 7, seam)
  outline(g, seam)
}

const CAT = { o: '#f08a2c', O: '#c4621a', l: '#ffb661', w: '#fff2e0', k: '#3a1a08', n: '#ff8fa6', g: '#7fd34e' }

function cat(rows: readonly string[]): DrawFn {
  return (g) => {
    pattern(g, 0, 0, rows, CAT)
    outline(g, '#4a2410')
  }
}

const CAT_SLEEP = [
  '................',
  '..........o...o.',
  '..........ooooo.',
  '...ooOooOoooooo.',
  '..ooOooOoookoko.',
  '..ooOooOooownwo.',
  '..looooooooooo..',
  '..lOOOOOOOOOo...',
  '................',
]
const CAT_SLEEP_1 = CAT_SLEEP.map((r, i) => (i === 2 ? '....oOooO.ooooo.' : r))
const CAT_AWAKE = [
  '................',
  '.....o....o.....',
  '.....oooooo.....',
  '.....ogoogo.....',
  '.....ownnwo.....',
  '....oOowwoOo....',
  '....oOowwoOo....',
  '....oOowwoOo..l.',
  '....oOooooOo..O.',
  '....owwoowwoOOO.',
  '................',
]

// ---------------------------------------------------------------- hero

const HC = {
  o: '#1a1220',
  h: '#1d1512',
  H: '#3d2c22',
  s: '#b5754a',
  S: '#8f5534',
  m: '#6e3a22',
  e: '#120a08',
  y: PAL.sun,
  Y: PAL.sunDeep,
  t: '#ffe27a',
  j: '#2a4785',
  J: '#1b2f5e',
  k: '#f4f8ff',
  K: '#b9cdfa',
} as const

const HEAD_RIGHT = [
  '................',
  '....h.hhHhh.....',
  '....hhhhHhhh....',
  '...hhhHhhhhhh...',
  '...hhhhhhhhhhh..',
  '...hhhhhhhssss..',
  '...hhhhhSssess..',
  '...hhhhhSssesss.',
  '....hhhhssssms..',
  '.....hhsssss....',
  '.......SS.......',
]

const HEAD: Record<HeroDir, readonly string[]> = {
  down: [
    '................',
    '....h.hhHhh.....',
    '...hhhhHhhhh....',
    '...hhhHhhhhhh...',
    '...hhhhhhhhhh...',
    '...hhshhhhshh...',
    '..ShsesssseshS..',
    '..ShsesssseshS..',
    '....sssmmsss....',
    '.....SssssS.....',
    '.......SS.......',
  ],
  up: [
    '................',
    '....h.hhHhh.....',
    '...hhhhHhhhh....',
    '...hhhHhhhhhh...',
    '...hhhhhhhhhh...',
    '...hhhhHhhhhh...',
    '..ShhhhhhhhhhS..',
    '..ShhhhhhhhhhS..',
    '....hhhhhhhh....',
    '.....hSSSSh.....',
    '.......SS.......',
  ],
  right: HEAD_RIGHT,
  left: HEAD_RIGHT.map((r) => [...r].reverse().join('')),
}

function heroFront(g: Ctx, dir: 'down' | 'up', f: number): void {
  const lift = ([[0, 0], [1, 0], [0, 0], [0, 1], [0, 0]] as const)[f] ?? [0, 0]
  const swing = [0, 1, 0, -1, 0][f] ?? 0
  const bob = f === 2 || f === 4 ? 1 : 0
  // legs
  rect(g, 4, 17, 8, 1, HC.j)
  const leg = (x: number, l: number, innerX: number, shoeX: number) => {
    rect(g, x, 18, 3, 3 - l, HC.j)
    rect(g, innerX, 18, 1, 3 - l, HC.J)
    rect(g, shoeX, 21 - l, 4, 2, HC.k)
    rect(g, shoeX, 22 - l, 4, 1, HC.K)
  }
  leg(4, lift[0], 6, 3)
  leg(9, lift[1], 9, 9)
  // torso
  const y = bob
  rect(g, 3, 11 + y, 10, 1, HC.y)
  rect(g, 4, 12 + y, 8, 5, HC.y)
  rect(g, 3, 11 + y, 5, 1, HC.t)
  rect(g, 11, 12 + y, 1, 5, HC.Y)
  rect(g, 4, 16 + y, 8, 1, HC.Y)
  if (dir === 'down') {
    rect(g, 7, 11 + y, 2, 1, HC.S)
  } else {
    rect(g, 7, 12 + y, 2, 3, HC.Y)
  }
  // arms: the forward arm reads 1px longer
  const arm = (x: number, len: number, outer: number) => {
    rect(g, x, 12 + y, 2, 2, HC.y)
    rect(g, outer, 12 + y, 1, 2, HC.Y)
    rect(g, x, 14 + y, 2, len - 2, HC.s)
    rect(g, x, 12 + y + len - 1, 2, 1, HC.S)
  }
  arm(1, 4 + swing, 1)
  arm(13, 4 - swing, 14)
  pattern(g, 0, y, HEAD[dir], HC)
}

function heroSide(g: Ctx, flip: boolean, f: number): void {
  const R = (x: number, yy: number, w: number, h: number, c: string) => rect(g, flip ? 16 - x - w : x, yy, w, h, c)
  // [frontDx, backDx, frontLift, backLift, armSwing, bob]
  const F = ([
    [1, 0, 0, 0, 0, 0],
    [3, -2, 0, 0, -2, 1],
    [1, 0, 0, 1, 0, 0],
    [-2, 3, 0, 0, 2, 1],
    [0, 1, 1, 0, 0, 0],
  ] as const)[f] ?? [1, 0, 0, 0, 0, 0]
  const [fdx, bdx, fl, bl, swing, bob] = F
  const leg = (dx: number, l: number, col: string, shoe: string) => {
    R(6 + Math.round(dx / 2), 18, 3, 1, col)
    R(6 + dx, 19, 3, 2 - l, col)
    R(6 + dx, 21 - l, 4, 2, shoe)
    R(6 + dx, 22 - l, 4, 1, HC.K)
  }
  // far arm peeks out when swung
  if (swing !== 0) {
    R(7, 12 + bob, 2, 2, '#c98a10')
    R(7 - swing / 2, 14 + bob, 2, 1, HC.S)
    R(7 - swing, 15 + bob, 2, 1, HC.S)
  }
  leg(bdx, bl, HC.J, '#d3ddf2')
  R(5, 17, 6, 1, HC.j)
  leg(fdx, fl, HC.j, HC.k)
  // torso
  R(4, 11 + bob, 8, 6, HC.y)
  R(4, 11 + bob, 8, 1, HC.t)
  R(11, 12 + bob, 1, 5, HC.Y)
  R(4, 16 + bob, 8, 1, HC.Y)
  pattern(g, 0, bob, HEAD[flip ? 'left' : 'right'], HC)
  // near arm, outlined so it separates from the torso
  const segs: [number, number, number, string][] = [
    [7, 11 + bob, 3, HC.Y],
    [7 + swing / 2, 14 + bob, 1, HC.s],
    [7 + swing, 15 + bob, 1, HC.s],
    [7 + swing, 16 + bob, 1, HC.S],
  ]
  for (const [x, yy, h] of segs) R(x - 1, yy, 1, h, HC.o)
  R(7 + swing, 17 + bob, 2, 1, HC.o)
  for (const [x, yy, h, c] of segs) R(x, yy, 2, h, c)
  R(7, 11 + bob, 2, 1, HC.y)
}

function drawHero(g: Ctx, dir: HeroDir, f: number): void {
  if (dir === 'down' || dir === 'up') heroFront(g, dir, f)
  else heroSide(g, dir === 'left', f)
  outline(g, HC.o)
}

// ---------------------------------------------------------------- registry

const STATIC: Record<StaticSpriteId, DrawFn> = {
  floor_tech: floorTech,
  floor_wood: floorWood,
  wall,
  wall_side: wallSide,
  rail_bottom: railBottom,
  rug_den: rugDen,
  rug_work: rugWork,
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
  ws_proploy: workstation('PROPLOY', C.ink, iconCards, C.sun),
  ws_dunne: workstation('DUNNE', C.sun, iconRing, C.ink),
  ws_emtech: workstation('EMTECH', C.leafHi, iconChart, C.red),
  arcade_tether: arcade('TETHER', C.leafDeep, C.leaf, screenTether),
  arcade_riverline: arcade('VOICE', '#7a4fd0', C.sun, screenVoice),
  arcade_bidwright: arcade('BID', C.cobaltDeep, C.cobaltHi, screenBid),
  server_rack: serverRack,
  kiosk: (g, w) => kiosk(g, w),
  plant_tall: plantTall,
  bookshelf,
  radio_0: radio(false),
  radio_1: radio(true),
  sunflower,
  sofa: (g, w) => sofa(g, w),
  coffee_table: (g, w) => coffeeTable(g, w),
  laptop,
  tv_stand: (g, w) => tvStand(g, w),
  lamp_on: lamp(true),
  lamp_off: lamp(false),
  basketball,
  cat_sleep_0: cat(CAT_SLEEP),
  cat_sleep_1: cat(CAT_SLEEP_1),
  cat_awake: cat(CAT_AWAKE),
}

export const HERO_DIRS: readonly HeroDir[] = ['down', 'up', 'left', 'right']
export const HERO_FRAMES = [0, 1, 2, 3, 4] as const

export function buildSprites(): Record<SpriteId, Sprite> {
  const out = {} as Record<SpriteId, Sprite>
  for (const id of Object.keys(SPRITE_SIZES) as StaticSpriteId[]) {
    const [w, h] = SPRITE_SIZES[id]
    const { c, g } = makeCanvas(w, h)
    STATIC[id](g, w, h)
    out[id] = { img: c, w, h }
  }
  const [hw, hh] = HERO_SIZE
  for (const dir of HERO_DIRS)
    for (const f of HERO_FRAMES) {
      const { c, g } = makeCanvas(hw, hh)
      drawHero(g, dir, f)
      const id: HeroSpriteId = `hero_${dir}_${f}`
      out[id] = { img: c, w: hw, h: hh }
    }
  return out
}
