// Floors, walls, rails and rugs: the baked room shell. Light comes from the top-left.

import { type Ctx, diamond, px, rect, rrect, shade } from '../draw'
import { C, type DrawFn } from './palette'

// Local ramps.
const TILE = { grout: '#46577d', lo: '#4c5f87', base: '#5a6e96', mid: '#6479a2', hi: '#7489b3', glint: '#8fa4cc' }
const PLANK = { seam: '#7a4a27', lo: '#93613a', base: '#a8723f', mid: '#b37c47', hi: '#c48d55' }
const WALL = { line: C.line, deep: C.cobaltDeep, shadow: '#123ca8', base: C.cobalt, stripe: '#1a4dcb', raised: C.cobaltRaised }

/** Cool slate tiles laid in a running bond so the grid never lines up. */
function floorTech(g: Ctx): void {
  rect(g, 0, 0, 16, 16, TILE.base)
  // two courses of 16x8 tiles; the second course is offset by half a tile
  for (const [y, joint] of [[0, 0], [8, 8]] as const) {
    rect(g, 0, y + 7, 16, 1, TILE.grout) // grout under the course
    rect(g, joint, y, 1, 7, TILE.grout) // vertical joint
    rect(g, 0, y, 16, 1, TILE.mid) // lit top lip
    rect(g, (joint + 1) % 16, y, 1, 7, TILE.mid) // lit left lip after the joint
    rect(g, 0, y + 6, 16, 1, TILE.lo) // shadow lip above the grout
    rect(g, (joint + 15) % 16, y + 1, 1, 6, TILE.lo) // shadow lip before the joint
    px(g, joint, y + 7, TILE.grout)
  }
  // a soft sheen in one tile, a scuff in the other: breaks the repeat without speckle
  rect(g, 3, 2, 3, 1, TILE.hi)
  px(g, 3, 3, TILE.hi)
  rect(g, 11, 12, 2, 1, TILE.lo)
  px(g, 13, 11, TILE.lo)
  px(g, 2, 2, TILE.glint)
}

/** Warm planks: four boards per tile, staggered butt joints, long grain runs and one knot. */
function floorWood(g: Ctx): void {
  const tones = [PLANK.mid, PLANK.base, PLANK.hi, PLANK.base]
  const joints = [5, 13, 1, 9]
  const grain: [number, number, number][][] = [
    [[8, 1, 5], [0, 2, 3]],
    [[1, 2, 6], [10, 1, 4]],
    [[5, 1, 5], [12, 2, 4]],
    [[12, 1, 3], [2, 2, 5]],
  ]
  for (let i = 0; i < 4; i++) {
    const y = i * 4
    const t = tones[i] ?? PLANK.base
    const j = joints[i] ?? 0
    rect(g, 0, y, 16, 3, t)
    rect(g, 0, y, 16, 1, shade(t, 0.1)) // lit top edge of the board
    rect(g, 0, y + 3, 16, 1, PLANK.seam)
    for (const [gx, gy, gw] of grain[i] ?? []) {
      rect(g, gx, y + gy, gw, 1, shade(t, -0.1))
      if (gx + gw < 16) px(g, gx + gw, y + gy, shade(t, -0.05))
    }
    if (i % 2 === 0) {
      // butt joints on alternate boards only, so the floor reads as long planks, not bricks
      rect(g, j, y, 1, 3, PLANK.seam)
      rect(g, (j + 1) % 16, y, 1, 3, shade(t, 0.14))
    }
  }
  // a knot on the third board
  px(g, 13, 9, PLANK.lo)
  px(g, 14, 9, shade(PLANK.lo, -0.15))
  px(g, 12, 9, shade(PLANK.hi, -0.05))
  // nail heads at two joints
  px(g, 6, 2, PLANK.lo)
  px(g, 10, 14, PLANK.lo)
}

/** Back wall: wood crown moulding, painted cobalt face, chair rail, raised wainscot panels, baseboard. */
function wall(g: Ctx): void {
  // crown moulding
  rect(g, 0, 0, 16, 1, C.woodLine)
  rect(g, 0, 1, 16, 1, C.woodHi)
  rect(g, 0, 2, 16, 1, C.woodLight)
  rect(g, 0, 3, 16, 1, C.wood)
  rect(g, 0, 4, 16, 1, C.woodDark)
  // painted face with a quiet two-tone stripe
  rect(g, 0, 5, 16, 32, WALL.base)
  rect(g, 6, 5, 3, 32, WALL.stripe)
  rect(g, 14, 5, 1, 32, WALL.stripe)
  rect(g, 0, 5, 16, 1, WALL.deep) // shadow cast by the moulding
  rect(g, 0, 6, 16, 1, WALL.shadow)
  // chair rail
  rect(g, 0, 36, 16, 1, WALL.shadow)
  rect(g, 0, 37, 16, 1, C.woodLine)
  rect(g, 0, 38, 16, 1, C.woodHi)
  rect(g, 0, 39, 16, 1, C.woodMid)
  rect(g, 0, 40, 16, 1, C.woodDark)
  // wainscot: stiles + one raised panel per tile
  rect(g, 0, 41, 16, 17, WALL.deep)
  rect(g, 0, 41, 16, 1, WALL.line) // shadow under the rail
  const px0 = 2
  const pw = 12
  const py = 43
  const ph = 13
  rect(g, px0 - 1, py - 1, pw + 2, ph + 2, WALL.line) // groove around the panel
  rect(g, px0, py, pw, ph, WALL.shadow)
  rect(g, px0, py, pw, 1, WALL.raised) // lit top bevel
  rect(g, px0, py, 1, ph, WALL.raised) // lit left bevel
  rect(g, px0 + 1, py + 1, pw - 2, 1, WALL.base)
  rect(g, px0 + 1, py + 1, 1, ph - 2, WALL.base)
  rect(g, px0 + 2, py + 2, pw - 3, ph - 3, WALL.base) // raised field
  rect(g, px0 + 2, py + 2, pw - 3, ph - 3, shade(WALL.base, -0.08))
  rect(g, px0 + 2, py + 2, 1, ph - 3, WALL.base)
  rect(g, px0 + 2, py + 2, pw - 3, 1, WALL.base)
  rect(g, px0 + pw - 1, py + 1, 1, ph - 1, WALL.deep) // shadow bevels
  rect(g, px0 + 1, py + ph - 1, pw - 1, 1, WALL.deep)
  px(g, px0, py + ph - 1, WALL.shadow)
  px(g, px0 + pw - 1, py, WALL.shadow)
  // stile highlight: light falls on the left edge of each stile
  rect(g, 14, 42, 1, 15, shade(WALL.deep, 0.12))
  rect(g, 0, 57, 16, 1, WALL.line)
  // baseboard
  rect(g, 0, 58, 16, 1, C.woodHi)
  rect(g, 0, 59, 16, 1, C.woodLight)
  rect(g, 0, 60, 16, 1, C.woodMid)
  rect(g, 0, 61, 16, 1, C.wood)
  rect(g, 0, 62, 16, 1, C.woodMid)
  rect(g, 0, 63, 16, 1, C.woodLine)
}

/** Side wall edge seen from above: a thick cobalt return with a lit inner bevel. Tiled vertically. */
function wallSide(g: Ctx): void {
  rect(g, 0, 0, 8, 16, WALL.deep)
  rect(g, 0, 0, 1, 16, WALL.line)
  rect(g, 7, 0, 1, 16, WALL.line)
  rect(g, 1, 0, 1, 16, WALL.shadow)
  rect(g, 2, 0, 1, 16, WALL.base)
  rect(g, 3, 0, 2, 16, WALL.shadow)
  rect(g, 5, 0, 1, 16, WALL.deep)
  rect(g, 6, 0, 1, 16, shade(WALL.deep, -0.3))
  // a capped seam every tile, offset so it reads as masonry, not a ruler
  rect(g, 2, 11, 4, 1, shade(WALL.deep, -0.2))
  rect(g, 2, 12, 4, 1, WALL.base)
}

/** Front banister: rounded hand rail, turned balusters, bottom rail. */
function railBottom(g: Ctx): void {
  rect(g, 0, 0, 16, 1, C.woodLine)
  rect(g, 0, 1, 16, 1, C.woodHi)
  rect(g, 0, 2, 16, 1, C.woodLight)
  rect(g, 0, 3, 16, 1, C.woodMid)
  rect(g, 0, 4, 16, 1, C.wood)
  rect(g, 0, 5, 16, 1, C.woodLine)
  // grain on the hand rail
  rect(g, 2, 3, 5, 1, shade(C.woodMid, -0.08))
  rect(g, 10, 2, 4, 1, shade(C.woodLight, -0.07))
  px(g, 9, 1, '#f6dcb4')
  for (const bx of [3, 11]) {
    // baluster: 3 wide, lit left, shadowed right, with a bead in the middle
    rect(g, bx - 1, 6, 5, 2, C.woodLine)
    rect(g, bx, 6, 3, 2, C.woodMid)
    px(g, bx, 6, C.woodLight)
    px(g, bx, 7, C.woodLight)
    px(g, bx + 2, 6, C.wood)
    px(g, bx + 2, 7, C.wood)
  }
  rect(g, 0, 8, 16, 1, C.woodMid)
  rect(g, 0, 9, 16, 1, C.woodLine)
}

/** Den rug: woven kilim with a sawtooth border, a hooked medallion and knotted fringe on the short ends. */
function rugDen(g: Ctx, w: number, h: number): void {
  const x0 = 4
  const x1 = w - 4
  const bw = x1 - x0
  const bh = h - 2
  const cream = C.cream
  const creamLo = '#e8d9b4'
  const creamHi = '#fff8e6'
  const edge = '#a8650b'
  // soft contact shadow on the floor
  rect(g, x0 + 1, h - 2, bw - 1, 2, 'rgba(40,18,6,0.35)')
  rrect(g, x0, 0, bw, bh, 2, edge)
  rect(g, x0 + 1, 1, bw - 2, bh - 2, C.sunDeep)
  // sun band with a woven sawtooth
  rect(g, x0 + 2, 2, bw - 4, bh - 4, C.sun)
  rect(g, x0 + 2, 2, bw - 4, 1, C.sunHi) // top highlight: the rug has thickness
  rect(g, x0 + 2, 2, 1, bh - 4, C.sunHi)
  for (let x = x0 + 4; x < x1 - 4; x += 4) {
    rect(g, x, 5, 3, 1, C.sunDeep)
    px(g, x + 1, 4, C.sunDeep)
    rect(g, x, bh - 6, 3, 1, C.sunDeep)
    px(g, x + 1, bh - 5, C.sunDeep)
  }
  for (let y = 7; y < bh - 7; y += 4) {
    rect(g, x0 + 4, y, 1, 3, C.sunDeep)
    px(g, x0 + 3, y + 1, C.sunDeep)
    rect(g, x1 - 5, y, 1, 3, C.sunDeep)
    px(g, x1 - 4, y + 1, C.sunDeep)
  }
  // cobalt guard stripe
  const gx = x0 + 6
  const gy = 7
  const gw = bw - 12
  const gh = bh - 14
  rect(g, gx, gy, gw, gh, C.cobaltDeep)
  rect(g, gx + 1, gy + 1, gw - 2, gh - 2, C.cobalt)
  rect(g, gx + 1, gy + 1, gw - 2, 1, C.cobaltRaised)
  for (let x = gx + 3; x < gx + gw - 2; x += 4) {
    px(g, x, gy + 1, C.sun)
    px(g, x, gy + gh - 2, C.sun)
  }
  // cream field with a calm weave texture
  const fx = gx + 2
  const fy = gy + 2
  const fw = gw - 4
  const fh = gh - 4
  rect(g, fx, fy, fw, fh, cream)
  rect(g, fx, fy, fw, 1, creamLo)
  for (let y = fy + 2; y < fy + fh - 1; y += 3)
    for (let x = fx + 2 + ((y / 3) % 2 ? 3 : 0); x < fx + fw - 2; x += 6) rect(g, x, y, 2, 1, creamLo)
  const cx = Math.floor(w / 2)
  const cy = Math.floor((bh - 1) / 2)
  // hooked medallion
  diamond(g, cx, cy, 12, C.cobaltDeep)
  diamond(g, cx, cy, 11, C.cobalt)
  diamond(g, cx, cy, 9, cream)
  diamond(g, cx, cy, 7, C.sunDeep)
  diamond(g, cx, cy, 6, C.sun)
  diamond(g, cx, cy, 3, C.cobaltDeep)
  diamond(g, cx, cy, 2, cream)
  px(g, cx, cy, C.red)
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    // hooks off the medallion tips
    px(g, cx + dx * 13, cy, C.cobaltDeep)
    px(g, cx + dx * 14, cy + dy, C.cobaltDeep)
    px(g, cx, cy + dy * 13, C.cobaltDeep)
  }
  px(g, cx - 3, cy - 4, C.sunHi)
  px(g, cx - 4, cy - 3, C.sunHi)
  // side motifs and corner stars
  for (const sx of [cx - 28, cx + 28]) {
    diamond(g, sx, cy, 5, C.cobaltDeep)
    diamond(g, sx, cy, 4, C.cobaltRaised)
    diamond(g, sx, cy, 2, C.sun)
    px(g, sx, cy, C.sunDeep)
  }
  for (const [x, y] of [[fx + 4, fy + 3], [fx + fw - 5, fy + 3], [fx + 4, fy + fh - 4], [fx + fw - 5, fy + fh - 4]] as const) {
    px(g, x, y, C.leafDeep)
    px(g, x - 1, y, C.leaf)
    px(g, x + 1, y, C.leaf)
    px(g, x, y - 1, C.leaf)
    px(g, x, y + 1, C.leaf)
  }
  // a small worn patch where feet land in front of the sofa
  rect(g, cx + 16, fy + fh - 4, 4, 1, creamHi)
  // knotted fringe on the short ends
  for (let y = 2; y < bh - 2; y += 2) {
    const len = 3 + ((y >> 1) % 3 === 0 ? 1 : 0)
    rect(g, x0 - len + 1, y, len - 1, 1, cream)
    px(g, x0 - len, y, creamLo)
    rect(g, x1, y, len - 1, 1, cream)
    px(g, x1 + len - 1, y, creamLo)
  }
}

/** Work rug: low-pile navy runner with a stitched binding, a herringbone pile and two sunflower bars. */
function rugWork(g: Ctx, w: number, h: number): void {
  const navy = '#16337d'
  const navyLo = '#122b6b'
  const navyHi = '#1d3f93'
  const bind = '#0b2257'
  rect(g, 2, h - 2, w - 3, 2, 'rgba(10,20,50,0.35)')
  rrect(g, 0, 0, w, h - 1, 2, bind)
  rect(g, 1, 1, w - 2, 2, '#22468f')
  rect(g, 1, 1, w - 2, 1, '#3159b5')
  rect(g, 1, h - 4, w - 2, 2, '#0f2a68')
  rect(g, 1, 3, 2, h - 7, '#22468f')
  rect(g, w - 3, 3, 2, h - 7, '#0f2a68')
  // stitches along the binding
  for (let x = 4; x < w - 4; x += 3) {
    px(g, x, 2, C.muted)
    px(g, x, h - 4, shade(C.muted, -0.3))
  }
  // field
  rect(g, 3, 3, w - 6, h - 7, navy)
  rect(g, 3, 3, w - 6, 1, navyLo)
  rect(g, 3, 3, 1, h - 7, navyLo)
  // herringbone pile: short diagonal pairs in columns, alternating direction
  for (let x = 6, k = 0; x < w - 6; x += 4, k++)
    for (let y = 6; y < h - 7; y += 3) {
      const d = k % 2 ? 1 : -1
      px(g, x, y, navyHi)
      px(g, x + d, y + 1, navyHi)
    }
  // sunflower bars near each end
  for (const bx of [12, w - 15]) {
    rect(g, bx, 5, 3, h - 11, C.sunDeep)
    rect(g, bx, 5, 2, h - 11, C.sun)
    rect(g, bx, 5, 1, h - 11, C.sunHi)
    rect(g, bx + 5, 5, 1, h - 11, C.muted)
  }
  // a thin centre line like a running track
  rect(g, 22, Math.floor(h / 2) - 1, w - 44, 1, '#2a4fa8')
}

export const ROOM = {
  floor_tech: floorTech,
  floor_wood: floorWood,
  wall,
  wall_side: wallSide,
  rail_bottom: railBottom,
  rug_den: rugDen,
  rug_work: rugWork,
} satisfies Record<string, DrawFn>
