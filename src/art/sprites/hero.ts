// The player character: 16x24, four directions, idle + 4-frame walk.

import { PAL, type HeroDir } from '../contract'
import { type Ctx, outline, pattern, rect } from '../draw'

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

export function drawHero(g: Ctx, dir: HeroDir, f: number): void {
  if (dir === 'down' || dir === 'up') heroFront(g, dir, f)
  else heroSide(g, dir === 'left', f)
  outline(g, HC.o)
}
