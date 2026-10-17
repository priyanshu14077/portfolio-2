// The player character: 16x24, four directions, idle + 4-frame walk.
// Drawn from ASCII maps: head per direction, then torso, arms and legs per
// frame. Light comes from the top-left. A selective outline tints each edge
// pixel by the material it wraps (hair, skin, shirt, denim, sneaker).

import { PAL, type HeroDir } from '../contract'
import { type Ctx, pattern } from '../draw'

const C: Record<string, string> = {
  // hair
  a: '#5a4234',
  h: '#2e211b',
  d: '#1d1411',
  // skin
  l: '#dc9a6e',
  s: '#bb7a4f',
  S: '#94593a',
  m: '#6e3426',
  r: '#cf7a5c',
  F: '#7c4a33',
  // eyes
  e: '#1f1416',
  w: '#fff6e8',
  // shirt
  t: '#ffe486',
  y: PAL.sun,
  Y: PAL.sunDeep,
  D: '#b26c0e',
  f: '#c88410',
  // jeans
  L: '#4b70ba',
  j: '#2d4b8c',
  J: '#1e3466',
  q: '#16264f',
  // sneakers
  k: '#f6f9ff',
  K: '#c3cde8',
  z: '#7d87aa',
  x: '#a9b3d2',
}

// Outline colour per material, keyed by the fill it touches.
const EDGE: [string, string][] = [
  ['adh', '#140c0b'],
  ['lsSmrFew', '#4a2216'],
  ['tyYDf', '#6a3a0a'],
  ['LjJq', '#0e1636'],
  ['kKzx', '#262a4a'],
]

// ---------------------------------------------------------------- heads (rows 0..10)

const HEAD_DOWN = [
  '................',
  '....hhhh.hhh....',
  '...haahhhhhhh...',
  '..haahhaahhhhd..',
  '..hhhhaahhhdhd..',
  '..hdhhdhhdhhdd..',
  '..hdllhlllhsdd..',
  '..sdlellssesdS..',
  '..sdlellssesdS..',
  '...dlrmssmrSd...',
  '.....ssmmSS.....',
]

const HEAD_UP = [
  '................',
  '....hhhh.hhh....',
  '...haahhhhhhh...',
  '..haahhaahhhhd..',
  '..hhhhaahhhdhd..',
  '..haahhhhaahdd..',
  '..hhhaahhhhddd..',
  '..shhhhhahhddS..',
  '..shdhhdhhdddS..',
  '...hdhhdhhdd....',
  '......sSSS......',
]

const HEAD_RIGHT = [
  '................',
  '.....hhhh.hh....',
  '....haahhhhhh...',
  '...haahhaahhh...',
  '...hhhhaahhhhd..',
  '...haahhhhdhdd..',
  '...hhaahdlllls..',
  '...hhhdsSllels..',
  '...hhdhsSllelss.',
  '...hdhdSlllsmS..',
  '......dSsssS....',
]

const mirror = (rows: readonly string[]) => rows.map((r) => [...r].reverse().join(''))

const HEAD: Record<HeroDir, readonly string[]> = {
  down: HEAD_DOWN,
  up: HEAD_UP,
  right: HEAD_RIGHT,
  left: mirror(HEAD_RIGHT),
}

// ---------------------------------------------------------------- front / back

// Torso rows 11..15, cols 4..11 (arms drawn separately).
const TORSO_DOWN = [
  '...tttySSyyyY...',
  '....tyyyyyyY....',
  '....tyyyyDDY....',
  '....tyyyyYYY....',
  '....YYYYYYYD....',
]
const TORSO_UP = [
  '...tttyyyyyY....',
  '....tyyyyyyY....',
  '....tyyyyyyY....',
  '....tyyyyyYY....',
  '....YYYYYYYD....',
]

// Legs from the hip row down to row 22. Index = frame.
const LEGS_FRONT: readonly (readonly string[])[] = [
  [
    '....LLjjjjjJ....',
    '....LjjJJjjJ....',
    '....LjJ..LjJ....',
    '....LjJ..LjJ....',
    '....LjJ..LjJ....',
    '...kkkK..kkkK...',
    '...zzzz..zzzz...',
  ],
  [
    '....LLjjjjjJ....',
    '....LjJJJjjJ....',
    '....LjJ..LjJ....',
    '....LjJ..LjJ....',
    '...kkkK..KkkK...',
    '...zzzz..zzzz...',
  ],
  [
    '....LLjjjjjJ....',
    '....LjjJJjjJ....',
    '....LjJ..LjJ....',
    '....LjJ..kkkK...',
    '....LjJ..zzzz...',
    '...kkkK.........',
    '...zzzz.........',
  ],
  [
    '....LLjjjjjJ....',
    '....LjjJJJjJ....',
    '....LjJ..LjJ....',
    '....LjJ..LjJ....',
    '...KkkK..kkkK...',
    '...zzzz..zzzz...',
  ],
  [
    '....LLjjjjjJ....',
    '....LjjJJjjJ....',
    '....LjJ..LjJ....',
    '...kkkK..LjJ....',
    '...zzzz..LjJ....',
    '.........kkkK...',
    '.........zzzz...',
  ],
]

// Body offset per frame: contact frames sit 1px lower than passing frames.
const BOB = [0, 1, 0, 1, 0]
// Near/right-hand arm swing per frame: -1 back, 0 at side, +1 forward.
const SWING = [0, -1, 0, 1, 0]

function frontArm(g: Ctx, x: number, y: number, len: number, lit: boolean): void {
  const sleeve = lit ? 'ty' : 'yY'
  const skin = lit ? 'ls' : 'sS'
  const rows = [sleeve, lit ? 'yy' : 'yD']
  for (let i = 0; i < len - 3; i++) rows.push(skin)
  rows.push(lit ? 'sS' : 'SF')
  pattern(g, x, y, rows, C)
}

function heroFront(g: Ctx, dir: 'down' | 'up', f: number): void {
  const b = BOB[f] ?? 0
  const sw = SWING[f] ?? 0
  const legs = LEGS_FRONT[f] ?? LEGS_FRONT[0]!
  pattern(g, 0, 23 - legs.length, legs, C)
  pattern(g, 0, 11 + b, dir === 'down' ? TORSO_DOWN : TORSO_UP, C)
  // facing the viewer the left arm is the character's right; seen from the back it flips
  const s = dir === 'down' ? sw : -sw
  frontArm(g, 2, 12 + b, 5 + s, true)
  frontArm(g, 12, 12 + b, 5 - s, false)
  pattern(g, 0, b, HEAD[dir], C)
}

// ---------------------------------------------------------------- side (drawn facing right)

const TORSO_SIDE = [
  '.....ttyyyY.....',
  '.....tyyyyY.....',
  '.....tyyyyY.....',
  '.....tyyyYY.....',
  '.....YYYYYD.....',
]

// Near arm overlays (cols absolute, rows from shoulder) for swing -1, 0, +1.
const ARM_SIDE: Record<number, readonly string[]> = {
  [-1]: [
    '......tY........',
    '.....tyD........',
    '....lsD.........',
    '...lsS..........',
    '...sS...........',
  ],
  0: [
    '.......tY.......',
    '.......yY.......',
    '.......lS.......',
    '.......lS.......',
    '.......sS.......',
  ],
  1: [
    '.......tY.......',
    '.......yyD......',
    '........lsD.....',
    '.........lsS....',
    '..........sS....',
  ],
}
// The far arm peeks out on the opposite side when the near arm swings.
const FAR_ARM_SIDE: Record<number, readonly string[]> = {
  [-1]: ['................', '................', '...........fF...', '...........FF...', '............F...'],
  1: ['................', '................', '...fF...........', '...FF...........', '...F............'],
}

const LEGS_SIDE: readonly (readonly string[])[] = [
  [
    '.....LLjjjJ.....',
    '......LjjJq.....',
    '......LjjJq.....',
    '......LjjJq.....',
    '......LjjJq.....',
    '......kkkkkK....',
    '......zzzzzz....',
  ],
  [
    '.....LLjjjJ.....',
    '....qqqLjJ......',
    '...qqq..LjJ.....',
    '..qqq....LjJ....',
    '.xxxx....kkkkK..',
    '..zzzz...zzzzz..',
  ],
  [
    '.....LLjjjJ.....',
    '......LjjJq.....',
    '......LjjJq.....',
    '....xqLjjJ......',
    '...xxxLjjJ......',
    '...zzzkkkkkK....',
    '......zzzzzz....',
  ],
  [
    '.....LLjjjJ.....',
    '....LjJqqqq.....',
    '...LjJ..qqq.....',
    '..LjJ....qqq....',
    '.kkkK....xxxx...',
    '..zzzz...zzzzz..',
  ],
  [
    '.....LLjjjJ.....',
    '......LjjJq.....',
    '......LjjJq.....',
    '....LjJLjJq.....',
    '...kkkKLjJ......',
    '...zzzzxxxxx....',
    '.......zzzzz....',
  ],
]

function heroSide(g: Ctx, flip: boolean, f: number): void {
  const b = BOB[f] ?? 0
  const sw = SWING[f] ?? 0
  const legs = LEGS_SIDE[f] ?? LEGS_SIDE[0]!
  const m = (rows: readonly string[]) => (flip ? mirror(rows) : rows)
  const far = FAR_ARM_SIDE[sw]
  if (far) pattern(g, 0, 11 + b, m(far), C)
  pattern(g, 0, 23 - legs.length, m(legs), C)
  pattern(g, 0, 11 + b, m(TORSO_SIDE), C)
  pattern(g, 0, b, HEAD[flip ? 'left' : 'right'], C)
  pattern(g, 0, 11 + b, m(ARM_SIDE[sw] ?? ARM_SIDE[0]!), C)
}

// ---------------------------------------------------------------- outline

function selout(g: Ctx): void {
  const { width: w, height: h } = g.canvas
  const img = g.getImageData(0, 0, w, h)
  const a = img.data
  const edgeOf = new Map<string, string>()
  for (const [keys, col] of EDGE) for (const k of keys) if (C[k]) edgeOf.set(C[k]!.toLowerCase(), col)
  const hexAt = (x: number, y: number) => {
    const i = (y * w + x) * 4
    return '#' + [a[i], a[i + 1], a[i + 2]].map((v) => (v ?? 0).toString(16).padStart(2, '0')).join('')
  }
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && (a[(y * w + x) * 4 + 3] ?? 0) > 0
  const marks: [number, number, string][] = []
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (solid(x, y)) continue
      const n = ([[x, y + 1], [x, y - 1], [x - 1, y], [x + 1, y]] as const).find(([nx, ny]) => solid(nx, ny))
      if (n) marks.push([x, y, edgeOf.get(hexAt(n[0], n[1])) ?? '#1c1420'])
    }
  for (const [x, y, col] of marks) {
    g.fillStyle = col
    g.fillRect(x, y, 1, 1)
  }
}

export function drawHero(g: Ctx, dir: HeroDir, f: number): void {
  if (dir === 'down' || dir === 'up') heroFront(g, dir, f)
  else heroSide(g, dir === 'left', f)
  selout(g)
}
