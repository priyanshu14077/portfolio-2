// Den half: bookshelf, radio, sunflowers, sofa, TV, lamp, ball and the cat.

import { type Ctx, bevel, box, dither, line, outline, oval, pattern, px, rect, rng, shade } from '../draw'
import { C, type DrawFn } from './palette'

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

export const DEN = {
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
} satisfies Record<string, DrawFn>
