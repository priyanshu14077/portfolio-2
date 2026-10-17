// Den half: bookshelf, radio, sunflowers, sofa, TV, lamp, ball, cat corner and the cat.
// Light comes from the top-left. Outlines use the dark hue of each material and a
// lighter "lit" hue on the top/left edges so silhouettes don't read as hard black.

import { type Ctx, line, makeCanvas, oval, pattern, px, rect, rng, rrect, shade } from '../draw'
import { C, type DrawFn } from './palette'

// ---------------------------------------------------------------- helpers

/** Coloured outline: `lit` on top/left edges, `dark` on bottom/right. Optional region limit. */
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

/** Draw into a scratch canvas, outline it on its own, then composite (keeps overlaps separated). */
function layer(g: Ctx, dark: string, lit: string, draw: (l: Ctx) => void): void {
  const { c, g: l } = makeCanvas(g.canvas.width, g.canvas.height)
  draw(l)
  rim(l, dark, lit)
  g.drawImage(c, 0, 0)
}

/** Long, broken grain strokes across a wood surface. */
function grain(g: Ctx, x: number, y: number, w: number, h: number, col: string, seed: number): void {
  const r = rng(seed)
  for (let row = y; row < y + h; row++) {
    let cx = x + Math.floor(r() * 4)
    while (cx < x + w - 2) {
      const len = 3 + Math.floor(r() * 6)
      if (r() < 0.55) rect(g, cx, row, Math.min(len, x + w - cx), 1, col)
      cx += len + 2 + Math.floor(r() * 4)
    }
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
  backDeep: '#2e1a0c',
}

const SUNR = { line: '#7a4206', lineLit: '#b0690c', dark: '#c27c0e', deep: C.sunDeep, base: C.sun, hi: C.sunHi, spec: '#fff8dc' }
const FAB = { line: C.line, lineLit: '#2a4aa8', deep: C.cobaltDeep, base: C.cobalt, raised: C.cobaltRaised, hi: C.cobaltHi, spec: '#9dbcff' }

// ---------------------------------------------------------------- bookshelf

function book(g: Ctx, x: number, bottom: number, w: number, h: number, col: string, label = false): void {
  const y = bottom - h + 1
  rect(g, x, y, w, h, col)
  rect(g, x, y, 1, h, shade(col, 0.28))
  if (w > 2) rect(g, x + w - 1, y, 1, h, shade(col, -0.22))
  rect(g, x, y, w, 1, shade(col, 0.42))
  rect(g, x, y + 2, w, 1, shade(col, -0.32))
  rect(g, x, bottom - 1, w, 1, shade(col, -0.32))
  if (label) px(g, x + (w > 2 ? 1 : 0), y + 4, C.sunHi)
}

/** Book leaning left: top edge shifted `lean` px to the left of its base. */
function leaningBook(g: Ctx, x: number, bottom: number, w: number, h: number, col: string, lean: number): void {
  for (let i = 0; i < h; i++) {
    const row = bottom - i
    const off = -Math.round((i / (h - 1)) * lean)
    rect(g, x + off, row, w, 1, col)
    px(g, x + off, row, shade(col, 0.28))
    px(g, x + off + w - 1, row, shade(col, -0.25))
    if (i === h - 1) rect(g, x + off, row, w, 1, shade(col, 0.42))
    if (i === 1 || i === h - 3) rect(g, x + off, row, w, 1, shade(col, -0.32))
  }
}

function bookshelf(g: Ctx, w: number, h: number): void {
  // carcass
  rect(g, 1, 1, w - 2, h - 2, W.base)
  rect(g, 1, 1, w - 2, 1, W.hi)
  rect(g, 1, 2, w - 2, 1, W.light)
  rect(g, 1, 3, w - 2, 1, W.mid)
  rect(g, 1, 4, 1, h - 6, W.light)
  rect(g, 2, 4, 1, h - 6, W.mid)
  rect(g, w - 3, 4, 1, h - 6, W.base)
  rect(g, w - 2, 4, 1, h - 6, W.dark)
  // compartments: back panel with a shadow cast by the shelf above and the left side
  const comps: [number, number][] = [[4, 13], [16, 24], [27, 35]]
  for (const [top, bottom] of comps) {
    rect(g, 3, top, w - 6, bottom - top + 1, W.back)
    rect(g, 3, top, w - 6, 2, W.backDeep)
    rect(g, 3, top, 2, bottom - top + 1, W.backDeep)
    // shelf board below: lit top face then front edge
    rect(g, 3, bottom + 1, w - 6, 1, W.light)
    rect(g, 3, bottom + 1, 6, 1, W.hi)
    rect(g, 3, bottom + 2, w - 6, 1, W.mid)
    rect(g, w - 4, bottom + 1, 1, 2, W.base)
  }

  // --- top shelf: row of books, one leaning, a photo frame
  const blue = C.cobaltRaised
  const cream = '#efe3c4'
  const red = '#d9483f'
  const teal = '#2a9e98'
  const plum = '#7a5ad8'
  let x = 5
  for (const [bw, bh, col, lab] of [
    [3, 8, blue, true], [2, 9, C.sun, false], [3, 7, cream, false], [2, 8, red, true], [3, 9, teal, false], [2, 7, C.cobaltDeep, false],
  ] as const) {
    book(g, x, 13, bw, bh, col, lab)
    x += bw
  }
  leaningBook(g, 23, 13, 3, 8, C.sunDeep, -2)
  // photo frame: wood frame, cobalt sky, sun, green hill
  pattern(g, 27, 5, [
    'FFFFFFF',
    'FsssyuF',
    'FsssuuF',
    'FsssssF',
    'FssLLsF',
    'FLLLLlF',
    'FffffFF',
    '.ff.ff.',
    '.d...d.',
  ], { F: W.hi, f: W.mid, s: C.cobaltHi, y: C.sunHi, u: C.sun, L: C.leaf, l: C.leafDeep, d: W.backDeep })
  px(g, 33, 6, W.mid)
  rect(g, 33, 7, 1, 5, W.mid)

  // --- middle shelf: trophy, books, a flat stack
  pattern(g, 4, 17, [
    '.hSSSs.',
    'S.hSs.s',
    'S.hSs.s',
    '.SSSss.',
    '..SSs..',
    '...s...',
    '..ddd..',
    '.dDDDd.',
  ], { h: C.sunHi, S: C.sun, s: C.sunDeep, d: W.mid, D: W.base })
  px(g, 5, 17, C.sunHi)
  x = 12
  for (const [bw, bh, col, lab] of [
    [2, 8, C.leaf, false], [3, 7, plum, true], [2, 8, C.sun, false], [3, 6, blue, false], [2, 8, cream, false], [3, 7, red, true],
  ] as const) {
    book(g, x, 24, bw, bh, col, lab)
    x += bw
  }
  // flat stack, pages facing us
  const flat: [number, number, string][] = [[27, 9, teal], [28, 8, C.sun], [27, 7, blue]]
  flat.forEach(([fx, fw, col], i) => {
    const fy = 24 - i * 2 - 1
    rect(g, fx, fy, fw, 2, col)
    rect(g, fx, fy, fw, 1, shade(col, 0.3))
    rect(g, fx + 1, fy + 1, fw - 2, 1, cream)
    px(g, fx + fw - 1, fy + 1, shade(col, -0.25))
  })

  // --- bottom shelf: books, then a trailing pothos in a cream pot
  x = 5
  for (const [bw, bh, col, lab] of [
    [2, 7, red, false], [3, 8, C.cobaltDeep, true], [2, 9, cream, false], [3, 7, C.leafDeep, false], [2, 8, C.sunDeep, false], [3, 9, blue, true], [2, 6, plum, false],
  ] as const) {
    book(g, x, 35, bw, bh, col, lab)
    x += bw
  }
  pattern(g, 24, 28, [
    '..hLL.L..',
    '.LLhLLlL.',
    'LLlLLLLll',
    '.lPPPPPl.',
    '..PpppQ..',
    '..PpppQ..',
    '..QQQQQ..',
    '.........',
    '.......l.',
    '.......L.',
    '......lL.',
    '.......l.',
  ], { L: C.leaf, h: C.leafHi, l: C.leafDeep, P: '#fff6e2', p: cream, Q: '#cbb88e' })
  book(g, 34, 35, 2, 7, teal, false)

  // --- base: two drawers with brass pulls
  for (const dx of [4, 20]) {
    rect(g, dx, 38, 16, 6, W.mid)
    rect(g, dx, 38, 16, 1, W.light)
    rect(g, dx, 38, 1, 6, W.light)
    rect(g, dx, 43, 16, 1, W.base)
    rect(g, dx + 15, 39, 1, 5, W.base)
    rect(g, dx + 6, 40, 4, 1, W.dark)
    rect(g, dx + 6, 41, 4, 1, C.sunDeep)
    px(g, dx + 6, 41, C.sunHi)
  }
  rect(g, 1, h - 2, w - 2, 1, W.dark)
  rim(g, W.line, W.lineLit)
}

// ---------------------------------------------------------------- radio / turntable cabinet

function radio(playing: boolean): DrawFn {
  return (g, w) => {
    const vinyl = '#1b1c2a'
    const groove = '#2b2e44'
    const sheen = '#5a6188'
    // turntable plinth: lit top face + front edge
    rect(g, 3, 1, w - 6, 9, W.mid)
    rect(g, 3, 1, w - 6, 1, W.hi)
    rect(g, 3, 2, 1, 8, W.light)
    grain(g, 23, 3, 7, 6, W.base, 7)
    rect(g, 3, 10, w - 6, 2, W.base)
    rect(g, 3, 10, w - 6, 1, W.mid)
    rect(g, w - 4, 2, 1, 10, W.dark)
    // platter + record
    oval(g, 4, 2, 18, 8, C.steelLo)
    oval(g, 5, 2, 16, 8, vinyl)
    oval(g, 7, 3, 12, 6, groove)
    oval(g, 8, 3, 10, 6, vinyl)
    oval(g, 10, 4, 6, 4, C.sun)
    rect(g, 11, 4, 4, 1, C.sunHi)
    px(g, 12, 6, C.ink)
    px(g, 13, 6, C.ink)
    // fixed light sheen + a moving groove glint/label mark that shows rotation
    rect(g, 7, 3, 3, 1, sheen)
    px(g, 6, 4, sheen)
    if (playing) {
      rect(g, 16, 8, 3, 1, groove)
      px(g, 14, 7, C.red)
      px(g, 15, 7, C.red)
    } else {
      rect(g, 8, 8, 3, 1, groove)
      px(g, 10, 4, C.red)
      px(g, 11, 4, C.red)
    }
    // tonearm on the record
    rect(g, 24, 2, 4, 3, C.steelLo)
    rect(g, 24, 2, 3, 1, C.steelHi)
    px(g, 25, 3, C.steel)
    line(g, 24, 4, 20, 7, C.steelHi)
    px(g, 19, 7, C.ink)
    px(g, 19, 8, C.steelLo)
    // speed buttons
    rect(g, 24, 7, 2, 1, C.steelHi)
    rect(g, 27, 7, 2, 1, playing ? C.leafHi : C.steelLo)

    // cabinet: top face, front, mid-century legs
    rect(g, 1, 12, w - 2, 2, W.light)
    rect(g, 1, 12, w - 2, 1, W.hi)
    rect(g, 1, 14, w - 2, 9, W.mid)
    rect(g, 1, 14, 1, 9, W.light)
    rect(g, w - 2, 12, 1, 11, W.base)
    rect(g, 1, 22, w - 2, 1, W.base)
    grain(g, 16, 15, 16, 7, W.base, 11)
    // speaker grille: cobalt fabric behind wooden slats
    rect(g, 3, 15, 12, 7, W.dark)
    rect(g, 4, 16, 10, 5, C.cobaltDeep)
    for (const sy of [16, 18, 20]) rect(g, 4, sy, 10, 1, C.cobalt)
    rect(g, 4, 16, 10, 1, C.cobaltRaised)
    rect(g, 3, 22, 12, 1, W.light)
    // dial window
    rect(g, 17, 15, 14, 4, W.dark)
    const glass = playing ? C.sun : '#5a4630'
    rect(g, 18, 16, 12, 2, glass)
    if (playing) rect(g, 18, 16, 12, 1, C.sunHi)
    for (let tx = 19; tx < 30; tx += 2) px(g, tx, 17, playing ? C.sunDeep : '#3e3020')
    rect(g, playing ? 25 : 21, 16, 1, 2, playing ? C.red : '#2a1e14')
    // knobs + power lamp
    for (const kx of [18, 27]) {
      rect(g, kx, 19, 3, 3, C.steelLo)
      rect(g, kx, 19, 2, 2, C.steel)
      px(g, kx, 19, C.steelHi)
    }
    px(g, 23, 20, playing ? C.leafHi : '#2a3a2a')
    // legs
    rect(g, 4, 23, 2, 1, W.base)
    px(g, 3, 24, W.dark)
    px(g, 4, 24, W.dark)
    rect(g, w - 6, 23, 2, 1, W.base)
    px(g, w - 5, 24, W.dark)
    px(g, w - 4, 24, W.dark)
    rim(g, W.line, W.lineLit)
    if (playing) {
      const glow = 'rgba(255, 214, 90, 0.35)'
      rect(g, 17, 14, 14, 1, glow)
      rect(g, 16, 15, 1, 4, glow)
      rect(g, 31, 15, 1, 4, glow)
    }
  }
}

// ---------------------------------------------------------------- sunflower

const SEED = { ring: '#6e3c14', base: '#4a260c', deep: '#2a1406', hi: '#8a5a26' }

/** Radial sunflower head: two petal layers around a seeded disk, lit from the top-left. */
function flowerHead(g: Ctx, cx: number, cy: number, R: number, disk: number, phase: number): void {
  const n = 12
  for (let y = Math.floor(cy - R - 1); y <= Math.ceil(cy + R + 1); y++)
    for (let x = Math.floor(cx - R - 1); x <= Math.ceil(cx + R + 1); x++) {
      const dx = x + 0.5 - cx
      const dy = y + 0.5 - cy
      const r = Math.hypot(dx, dy)
      const th = Math.atan2(dy, dx) + phase
      const lit = r > 0 ? -(dx + dy) / (r * Math.SQRT2) : 0
      if (r <= disk) {
        let col = SEED.base
        if (lit < -0.3 && r > disk * 0.45) col = SEED.deep
        else if (r > disk - 0.9 && lit > 0.3) col = SEED.ring
        if (Math.abs(dx + disk * 0.35) < 0.6 && Math.abs(dy + disk * 0.35) < 0.6) col = SEED.hi
        px(g, x, y, col)
        continue
      }
      const front = R * (0.6 + 0.4 * Math.abs(Math.cos((n / 2) * th)) ** 1.6)
      const back = R * 0.95 * (0.6 + 0.4 * Math.abs(Math.sin((n / 2) * th)) ** 1.6)
      if (r <= front) {
        let col: string = C.sun
        if (r < disk + 0.9) col = C.sunDeep
        else if (lit > 0.45 && r > disk + 1.6) col = C.sunHi
        else if (lit < -0.5 && r > disk + 1.6) col = C.sunDeep
        px(g, x, y, col)
      } else if (r <= back) px(g, x, y, lit > 0.2 ? C.sunDeep : SUNR.dark)
    }
}

function sunflower(g: Ctx): void {
  const LEAF = { L: C.leaf, H: C.leafHi, D: C.leafDeep, d: '#17602b' }
  layer(g, '#3a2a08', '#5a4a10', (g) => {
    // stems
    rect(g, 8, 12, 1, 10, C.leaf)
    rect(g, 9, 13, 1, 9, C.leafDeep)
    line(g, 4, 17, 7, 21, C.leafDeep)
    line(g, 13, 13, 10, 21, C.leafDeep)
    // leaves (heart-ish, with a vein)
    pattern(g, 0, 15, [
      '.HHL...',
      'HLLLLD.',
      'LLDDLLD',
      '.LLLdDd',
      '...dd..',
    ], LEAF)
    pattern(g, 10, 16, [
      '..LHH.',
      '.LLLLH',
      'DLDDLL',
      'dDLLD.',
      '.dd...',
    ], LEAF)
    // side bud on the right, turning away
    pattern(g, 11, 9, [
      '..PP.',
      '.PhPp',
      'PPssp',
      '.pDLp',
      '..DD.',
    ], { P: C.sun, h: C.sunHi, p: C.sunDeep, s: SUNR.dark, D: C.leafDeep, L: C.leaf })
    // smaller head lower-left
    flowerHead(g, 4, 15.5, 4.2, 2, 0.26)

  })
  // the hero head, outlined on its own so it sits in front
  layer(g, '#4a3008', '#7a5410', (g) => flowerHead(g, 8.5, 7, 7, 3.3, 0))

  // glazed cobalt pot with a sunflower band
  rect(g, 2, 21, 12, 3, C.cobaltRaised)
  rect(g, 3, 21, 10, 1, C.soil)
  rect(g, 4, 21, 3, 1, '#6a4428')
  px(g, 2, 21, C.cobaltHi)
  px(g, 13, 21, C.cobaltRaised)
  rect(g, 2, 22, 11, 1, C.cobaltHi)
  rect(g, 13, 22, 1, 2, C.cobalt)
  rect(g, 2, 23, 12, 1, C.cobalt)
  rect(g, 3, 24, 10, 4, C.cobalt)
  rect(g, 4, 28, 8, 3, C.cobalt)
  rect(g, 3, 24, 10, 1, C.cobaltDeep)
  rect(g, 3, 25, 2, 3, C.cobaltRaised)
  rect(g, 4, 28, 1, 2, C.cobaltRaised)
  rect(g, 11, 25, 2, 3, C.cobaltDeep)
  rect(g, 10, 28, 2, 3, C.cobaltDeep)
  rect(g, 4, 30, 8, 1, C.cobaltDeep)
  rect(g, 4, 26, 8, 1, C.sun)
  rect(g, 10, 26, 2, 1, C.sunDeep)
  px(g, 3, 26, C.sunHi)
  rect(g, 5, 25, 1, 1, '#bcd2ff')
  rect(g, 5, 28, 1, 1, C.cobaltHi)
  rim(g, C.line, '#2a4aa8', 0, 21, 16, 11)
}

// ---------------------------------------------------------------- sofa

function sofa(g: Ctx, w: number): void {
  const F = FAB
  const mid = Math.floor(w / 2)
  // backrest: two back cushions with rounded tops
  for (const [bx, bw] of [[6, mid - 6], [mid, w - 6 - mid]] as const) {
    rrect(g, bx, 2, bw, 11, 2, F.base)
    rrect(g, bx, 2, bw - 1, 3, 1, F.raised)
    rect(g, bx + 2, 2, bw - 6, 1, F.hi)
    rect(g, bx, 4, 1, 6, F.raised)
    rect(g, bx + bw - 1, 4, 1, 8, F.deep)
    rect(g, bx + 1, 10, bw - 2, 2, F.deep)
    // soft creases where the cushion sags into the seat
    line(g, bx + 2, 7, bx + 4, 9, F.deep)
    line(g, bx + bw - 3, 7, bx + bw - 5, 9, F.deep)
    rect(g, bx + 3, 4, 6, 1, F.raised)
  }
  // seat cushions: top face, rounded lit lip, front face
  for (const [sx, sw] of [[7, mid - 7], [mid, w - 7 - mid]] as const) {
    rect(g, sx, 12, sw, 5, F.raised)
    rect(g, sx, 12, sw, 1, F.base)
    rect(g, sx + 1, 15, sw - 2, 1, F.hi)
    rect(g, sx + 2, 16, sw - 5, 1, F.spec)
    rect(g, sx, 17, sw, 4, F.base)
    rect(g, sx, 20, sw, 1, F.deep)
    rect(g, sx + sw - 1, 12, 1, 9, F.deep)
    px(g, sx, 17, F.raised)
    // a dip where someone usually sits
    rect(g, sx + 5, 13, 6, 1, F.base)
    px(g, sx + 4, 14, F.base)
  }
  // skirt, separated from the cushions by a shadow line
  rect(g, 6, 21, w - 12, 1, F.line)
  rect(g, 6, 22, w - 12, 3, F.deep)
  rect(g, 6, 22, w - 12, 1, F.base)
  // rolled arms
  for (const ax of [1, w - 8]) {
    rrect(g, ax, 7, 7, 5, 2, F.raised)
    rect(g, ax + 2, 7, 3, 1, F.hi)
    px(g, ax + 1, 8, F.hi)
    rect(g, ax + 2, 8, 2, 1, F.spec)
    rect(g, ax + 6, 9, 1, 2, F.base)
    rect(g, ax, 11, 7, 1, F.deep)
    rect(g, ax, 12, 7, 13, F.base)
    rect(g, ax, 12, 1, 12, F.raised)
    rect(g, ax + 6, 12, 1, 13, F.deep)
    rect(g, ax, 24, 7, 1, F.deep)
    // scroll of the roll on the arm front
    rect(g, ax + 2, 12, 3, 1, F.raised)
    px(g, ax + 2, 13, F.deep)
  }
  // cream pillow with a little sunflower, leaning on the left back cushion
  pattern(g, 9, 5, [
    '.wwwwwww..',
    'wCCCCCCCs.',
    'wCCCyyCCs.',
    'wCCydbyCs.',
    'wCCybbyCs.',
    'wCCCyyCCs.',
    'wCCCCCCss.',
    '.sssssss..',
  ], { w: '#fffaf0', C: C.cream, y: C.sun, d: '#7a4a1c', b: '#5a3010', s: '#d8c79e' })
  // sunflower-yellow throw draped over the left arm: folds, cobalt stripe, fringe
  pattern(g, 0, 6, [
    '.hhhhhhh.',
    'hhyyyyyyq',
    'hyyhyyyyq',
    'hyqhyyqyQ',
    'bbBbbbBbB',
    'yyqhyyqyQ',
    'yyqhyyqyQ',
    'yyqhyyqy.',
    'bbBbbbBb.',
    'yyqhyyqy.',
    'qqQqqqQq.',
    'f.f.f.f..',
  ], { h: C.sunHi, y: C.sun, q: C.sunDeep, Q: SUNR.dark, b: C.cobaltRaised, B: C.cobaltDeep, f: C.sunDeep })
  rim(g, F.line, F.lineLit)
  // tapered walnut legs, outlined in wood
  layer(g, W.line, W.lineLit, (g) => {
    for (const lx of [3, 15, w - 18, w - 6]) {
      rect(g, lx, 26, 3, 1, W.mid)
      px(g, lx, 26, W.light)
      rect(g, lx, 27, 2, 1, W.base)
    }
  })
}

// ---------------------------------------------------------------- coffee table + laptop

function coffeeTable(g: Ctx, w: number): void {
  rect(g, 1, 1, w - 2, 5, W.light)
  rect(g, 1, 1, w - 2, 1, W.hi)
  grain(g, 2, 2, w - 4, 4, W.mid, 3)
  rect(g, 2, 1, 7, 1, '#f6dcb4')
  rect(g, 1, 6, w - 2, 1, W.mid)
  rect(g, 1, 7, w - 2, 1, W.base)
  rect(g, w - 2, 1, 1, 7, W.base)
  rect(g, 5, 8, w - 10, 1, W.dark)
  for (const lx of [3, w - 7]) {
    rect(g, lx, 8, 4, 3, W.mid)
    px(g, lx, 8, W.light)
    rect(g, lx + 3, 8, 1, 3, W.dark)
    rect(g, lx + 1, 11, 2, 2, W.base)
    px(g, lx + 2, 12, W.dark)
  }
  // a paperback (left) and a mug (right) share the top with the laptop
  rect(g, 3, 2, 6, 3, C.cobaltRaised)
  rect(g, 3, 2, 6, 1, C.cobaltHi)
  rect(g, 3, 4, 6, 1, C.cream)
  px(g, 8, 3, C.cobaltDeep)
  rect(g, 26, 1, 3, 4, C.cream)
  rect(g, 26, 1, 3, 1, '#5a3010')
  px(g, 26, 1, '#7a4a1c')
  rect(g, 28, 2, 1, 3, '#d8c79e')
  px(g, 29, 2, '#d8c79e')
  px(g, 29, 3, '#d8c79e')
  rim(g, W.line, W.lineLit)
}

function laptop(g: Ctx): void {
  // lid (screen faces us) and deck
  rect(g, 2, 1, 10, 5, '#2b3558')
  rect(g, 2, 1, 10, 1, C.steel)
  rect(g, 3, 2, 8, 3, '#e8f0ff')
  rect(g, 3, 2, 3, 1, C.sun)
  rect(g, 7, 2, 3, 1, C.cobaltHi)
  rect(g, 4, 3, 6, 1, C.muted)
  rect(g, 4, 4, 4, 1, C.muted)
  rect(g, 1, 6, 12, 2, C.steel)
  rect(g, 1, 6, 12, 1, C.steelHi)
  rect(g, 2, 6, 10, 1, '#d6deef')
  rect(g, 5, 7, 4, 1, C.steelLo)
  rim(g, C.line, '#2a4aa8')
  // screen glow spilling on the deck
  rect(g, 3, 6, 8, 1, 'rgba(185, 205, 250, 0.45)')
}

// ---------------------------------------------------------------- tv + stand

function tvStand(g: Ctx, w: number): void {
  // stand: lit top face, two slatted doors, open cubby with a console
  rect(g, 1, 19, w - 2, 2, W.light)
  rect(g, 1, 19, w - 2, 1, W.hi)
  rect(g, 1, 21, w - 2, 6, W.mid)
  rect(g, 1, 21, 1, 6, W.light)
  rect(g, w - 2, 19, 1, 8, W.base)
  rect(g, 1, 26, w - 2, 1, W.base)
  for (const dx of [3, w - 14]) {
    rect(g, dx, 21, 11, 5, W.base)
    for (let sx = dx + 1; sx < dx + 10; sx += 2) rect(g, sx, 21, 1, 5, W.mid)
    rect(g, dx, 21, 11, 1, W.dark)
  }
  px(g, 13, 23, C.sunDeep)
  px(g, w - 14, 23, C.sunDeep)
  rect(g, 15, 21, w - 30, 5, W.backDeep)
  rect(g, 16, 23, 8, 3, '#dfe6f5')
  rect(g, 16, 23, 8, 1, '#ffffff')
  rect(g, 23, 24, 1, 2, C.steel)
  px(g, 17, 24, C.leafHi)
  rect(g, 18, 25, 4, 1, C.steel)
  // legs
  rect(g, 3, 27, 2, 1, W.base)
  px(g, 3, 28, W.dark)
  rect(g, w - 5, 27, 2, 1, W.base)
  px(g, w - 4, 28, W.dark)

  // tv: bezel lit top-left, neck
  rect(g, 18, 17, 4, 2, C.steelLo)
  rect(g, 18, 17, 1, 2, C.steel)
  rect(g, 4, 1, 32, 17, '#141a2e')
  rect(g, 4, 1, 32, 1, '#2f3a62')
  rect(g, 4, 1, 1, 16, '#252f52')
  rect(g, 5, 16, 30, 1, '#0b1020')
  px(g, 33, 16, C.leafHi)
  // screen: a tiny platformer
  const sx = 6
  const sy = 3
  rect(g, sx, sy, 28, 13, '#5c8dff')
  rect(g, sx, sy + 3, 28, 3, '#7aa4ff')
  rect(g, sx, sy + 6, 28, 2, '#9dbcff')
  // sun, clouds
  rect(g, sx + 22, sy + 1, 3, 3, C.sun)
  px(g, sx + 22, sy + 1, C.sunHi)
  rect(g, sx + 3, sy + 2, 5, 1, C.ink)
  rect(g, sx + 4, sy + 1, 2, 1, C.ink)
  rect(g, sx + 13, sy + 3, 4, 1, C.ink)
  // far hills
  pattern(g, sx, sy + 6, ['...hh.......hhh.............', '.hhhhhh...hhhhhhh......hh...', 'hhhhhhhhhhhhhhhhhhh..hhhhhhh'], { h: '#3a8fb8' })
  // ground
  rect(g, sx, sy + 9, 28, 1, C.leafHi)
  rect(g, sx, sy + 10, 28, 1, C.leaf)
  rect(g, sx, sy + 11, 28, 2, '#8a5a33')
  for (let gx = sx + 1; gx < sx + 28; gx += 4) px(g, gx, sy + 12, '#5e3a1f')
  // floating brick platform with a coin
  rect(g, sx + 15, sy + 5, 6, 2, C.sunDeep)
  rect(g, sx + 15, sy + 5, 6, 1, C.sun)
  px(g, sx + 17, sy + 6, '#a86a10')
  px(g, sx + 19, sy + 5, '#a86a10')
  rect(g, sx + 17, sy + 3, 1, 2, C.sunHi)
  // hero (red cap, cobalt overalls) mid-jump + enemy
  pattern(g, sx + 6, sy + 5, ['.rr', 'rrs', '.ss', 'bbb', 'b.b'], { r: C.red, s: '#ffd9b0', b: C.cobaltDeep })
  pattern(g, sx + 24, sy + 7, ['.oo.', 'okko', 'oooo'], { o: '#8a4a20', k: '#ffffff' })
  // score dots
  rect(g, sx + 1, sy + 1, 1, 1, C.ink)
  rect(g, sx + 1, sy, 0, 0, C.ink)
  // glass glare
  line(g, sx + 25, sy, sx + 27, sy + 2, 'rgba(255,255,255,0.35)')
  px(g, sx + 27, sy, 'rgba(255,255,255,0.35)')

  // controller resting on the stand, cable dropping into the cubby
  rect(g, 13, 18, 6, 2, '#3a3f5c')
  rect(g, 13, 18, 6, 1, '#5a6080')
  px(g, 14, 19, C.ink)
  px(g, 17, 19, C.sun)
  px(g, 18, 19, C.red)
  rim(g, '#0b1020', '#2a3560', 0, 0, 40, 19)
  rim(g, W.line, W.lineLit, 0, 19, 40, 11)
  rect(g, 16, 20, 1, 1, '#2a2e44')
  rect(g, 16, 21, 1, 2, '#2a2e44')
}

// ---------------------------------------------------------------- lamp

function lamp(on: boolean): DrawFn {
  return (g) => {
    const s = on ? { hi: '#fff6d0', base: '#ffe08a', lo: '#f2b544', rim: '#fffbe8' } : { hi: '#f4e6c4', base: '#e0c99a', lo: '#b89a68', rim: '#8a7048' }
    const brass = { hi: '#ffe08a', base: '#c9963e', lo: '#8a5e22' }
    // drum-cone shade
    const rows: [number, number][] = [[4, 4], [3, 6], [3, 6], [2, 8], [2, 8], [2, 8], [1, 10], [1, 10], [1, 10]]
    rows.forEach(([x0, ww], i) => {
      const y = i + 1
      rect(g, x0, y, ww, 1, s.base)
      px(g, x0, y, s.hi)
      if (ww > 4) px(g, x0 + 1, y, s.hi)
      px(g, x0 + ww - 1, y, s.lo)
      if (ww > 6) px(g, x0 + ww - 2, y, s.lo)
    })
    rect(g, 1, 10, 10, 1, s.rim)
    if (on) rect(g, 4, 1, 4, 1, s.rim)
    // pole, switch, base
    rect(g, 5, 11, 2, 21, brass.base)
    rect(g, 5, 11, 1, 21, brass.hi)
    rect(g, 6, 11, 1, 2, brass.lo)
    rect(g, 7, 19, 1, 2, brass.lo)
    rect(g, 4, 30, 4, 1, brass.base)
    oval(g, 2, 31, 8, 4, brass.lo)
    oval(g, 2, 31, 8, 3, brass.base)
    rect(g, 3, 31, 3, 1, brass.hi)
    rim(g, '#4a2e10', '#7a5420')
    if (on) {
      px(g, 5, 11, '#ffffff')
      px(g, 6, 11, s.rim)
      const glow = 'rgba(255, 214, 110, 0.35)'
      rect(g, 2, 11, 3, 1, glow)
      rect(g, 7, 11, 3, 1, glow)
      rect(g, 3, 12, 2, 1, 'rgba(255, 214, 110, 0.2)')
      rect(g, 7, 12, 2, 1, 'rgba(255, 214, 110, 0.2)')
    }
  }
}

// ---------------------------------------------------------------- basketball

function basketball(g: Ctx): void {
  pattern(g, 1, 1, [
    '..ohso..',
    '.hHhsoo.',
    'ohhosoom',
    'ssoososs',
    'oossssmm',
    'ooomsmmd',
    '.oomsmd.',
    '..mmsd..',
  ], { H: '#ffd09a', h: '#ffa45c', o: '#ee7a2a', m: '#cc5c1a', d: '#9a400e', s: '#4a1c06' })
  rim(g, '#4a1c06', '#7a3410')
}

// ---------------------------------------------------------------- cat corner

function beanBag(g: Ctx): void {
  const S = SUNR
  oval(g, 1, 5, 24, 12, S.dark)
  oval(g, 1, 5, 23, 11, S.deep)
  oval(g, 1, 4, 22, 10, S.base)
  oval(g, 4, 1, 18, 10, S.base)
  oval(g, 5, 1, 9, 5, S.hi)
  rect(g, 7, 2, 3, 1, S.spec)
  // the dent where someone just sat: shadowed back wall, lit front lip
  oval(g, 8, 3, 13, 7, S.dark)
  oval(g, 9, 5, 11, 5, S.deep)
  rect(g, 10, 9, 9, 1, S.hi)
  // slouch folds running down from the dent
  line(g, 8, 9, 5, 13, S.deep)
  line(g, 9, 10, 7, 13, S.hi)
  line(g, 20, 9, 21, 13, S.dark)
  rect(g, 3, 15, 20, 1, S.dark)
  rim(g, S.line, S.lineLit)
}

function catTree(g: Ctx): void {
  const K = { hi: '#fbf3df', base: '#e8d6ae', lo: '#c9b084', dark: '#9c8258' }
  const rope = ['#f0d9a4', '#d4b273', '#a8834a']
  // sisal post with diagonal wrap stripes
  for (let y = 8; y < 28; y++)
    for (let x = 6; x < 10; x++) {
      const groove = (x + y) % 3 === 0
      const lit = x === 6 ? 0 : x === 9 ? 1 : 0
      px(g, x, y, groove ? rope[lit + 1] ?? '' : rope[lit] ?? '')
    }
  // wide carpeted base
  rect(g, 1, 27, 14, 2, K.base)
  rect(g, 1, 27, 14, 1, K.hi)
  rect(g, 1, 29, 14, 3, K.lo)
  rect(g, 1, 31, 14, 1, K.dark)
  rect(g, 14, 28, 1, 4, K.dark)
  rect(g, 6, 27, 4, 1, K.lo)
  // small mid platform cantilevered to the right
  rect(g, 6, 17, 9, 2, K.base)
  rect(g, 6, 17, 9, 1, K.hi)
  rect(g, 6, 19, 9, 2, K.lo)
  rect(g, 6, 20, 9, 1, K.dark)
  rect(g, 14, 18, 1, 3, K.dark)
  // top perch: curved cradle with a raised rim and a cobalt cushion
  pattern(g, 1, 2, [
    '.hc.....cl.',
    'hcHHbbbbBcl',
    'hcHbbbbbBcl',
    'hcbbbbbBBcl',
    '.hcccccccl.',
    '..lllllll..',
    '...ddddd...',
  ], { h: K.hi, c: K.base, l: K.lo, d: K.dark, H: C.cobaltHi, b: C.cobaltRaised, B: C.cobalt })
  // pompom on a string from the mid platform
  rect(g, 13, 21, 1, 3, C.cream)
  pattern(g, 12, 24, ['.r.', 'hrd', '.d.'], { r: C.red, h: '#ff9a9a', d: '#a02c2c' })
  rim(g, W.line, W.lineLit)
}

function catBowl(g: Ctx): void {
  pattern(g, 0, 0, [
    '...kKkk...',
    '.hkKkKkkr.',
    '.hbsbbbbd.',
    '..dbbbdd..',
  ], { k: '#8a5220', K: '#b8783a', h: C.cobaltHi, r: C.cobalt, b: C.cobaltRaised, s: '#bcd2ff', d: C.cobaltDeep })
  rim(g, C.line, '#2a4aa8')
}

function recordCrate(g: Ctx): void {
  // sleeves behind, staggered
  rect(g, 3, 4, 14, 4, W.backDeep)
  const sleeves: [number, number, string][] = [[3, 3, C.red], [6, 4, C.cream], [12, 3, '#7a5ad8'], [15, 4, C.leaf]]
  for (const [sx, top, col] of sleeves) {
    rect(g, sx, top, 2, 8 - top, col)
    px(g, sx, top, shade(col, 0.35))
    rect(g, sx + 1, top + 1, 1, 7 - top, shade(col, -0.22))
  }
  // a record half pulled out of its cobalt sleeve
  oval(g, 8, 0, 6, 6, '#1b1c2a')
  rect(g, 10, 2, 2, 1, C.sun)
  rect(g, 9, 1, 2, 1, '#5a6188')
  rect(g, 8, 4, 6, 4, C.cobaltRaised)
  rect(g, 8, 4, 6, 1, C.cobaltHi)
  px(g, 13, 5, C.cobalt)
  rect(g, 9, 6, 2, 1, C.sun)
  // crate: corner posts, two planks, handle slot
  rect(g, 1, 8, 18, 7, W.mid)
  rect(g, 1, 8, 18, 1, W.light)
  rect(g, 3, 11, 14, 1, W.backDeep)
  rect(g, 3, 12, 14, 1, W.base)
  grain(g, 3, 9, 14, 2, W.base, 5)
  rect(g, 8, 9, 4, 1, W.backDeep)
  rect(g, 1, 8, 2, 7, W.light)
  px(g, 2, 9, W.mid)
  rect(g, 17, 8, 2, 7, W.base)
  rect(g, 1, 14, 18, 1, W.dark)
  rim(g, W.line, W.lineLit)
}

function floorCushion(g: Ctx): void {
  const F = FAB
  oval(g, 1, 2, 18, 7, F.deep)
  oval(g, 1, 1, 18, 6, F.raised)
  oval(g, 2, 1, 10, 3, F.hi)
  rect(g, 4, 1, 4, 1, F.spec)
  // tufting creases toward the button
  rect(g, 8, 3, 1, 1, F.base)
  rect(g, 11, 4, 1, 1, F.base)
  rect(g, 9, 5, 2, 1, F.base)
  rect(g, 12, 5, 4, 1, F.base)
  rect(g, 9, 3, 2, 2, C.sunDeep)
  px(g, 9, 3, C.sunHi)
  // piping where top meets the side
  rect(g, 4, 7, 12, 1, C.sun)
  px(g, 3, 6, C.sunDeep)
  px(g, 16, 6, C.sunDeep)
  rim(g, F.line, F.lineLit)
}

// ---------------------------------------------------------------- cat

const CAT = {
  h: '#ffb15c',
  o: '#f08a2c',
  m: '#d0661c',
  d: '#a8480f',
  c: '#fff1d6',
  C: '#efcfa0',
  p: '#ff9bb0',
  n: '#ff7a95',
  k: '#3a1a08',
  x: '#7a3410',
  g: '#9be05a',
}

function cat(rows: readonly string[]): DrawFn {
  return (g) => {
    pattern(g, 0, 0, rows, CAT)
    rim(g, '#5a2a0e', '#8a4418')
  }
}

const CAT_SLEEP = [
  '................',
  '..........m...m.',
  '..........mpopm.',
  '...hhhhh..ohhom.',
  '..hodoodooxoxom.',
  '.hoodoodooocncm.',
  '.mooomooomccccm.',
  '..mmddmmddmmdd..',
  '................',
]
const CAT_SLEEP_1 = [
  '................',
  '..........m...m.',
  '...hhhhh..mpopm.',
  '..hooooooohhhom.',
  '..hodoodooxoxom.',
  '.hoodoodooocncm.',
  '.mooomooomccccm.',
  '..mmddmmddmmdd..',
  '................',
]
const CAT_AWAKE = [
  '................',
  '....m......m....',
  '....mphhhhpm....',
  '....ohdhhdoo....',
  '....ogkoogko....',
  '....occnncco..d.',
  '...mooccccoom.o.',
  '...hodccccdom.o.',
  '...hoomccmoomoo.',
  '...mccmddmccmm..',
  '................',
]

export const DEN = {
  bean_bag: beanBag,
  cat_tree: catTree,
  cat_bowl: catBowl,
  record_crate: recordCrate,
  floor_cushion: floorCushion,
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
