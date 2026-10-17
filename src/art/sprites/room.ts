// Floors, walls, rails and rugs: the baked room shell.

import { type Ctx, diamond, inset, px, rect, rrect, shade } from '../draw'
import { C, type DrawFn } from './palette'

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

export const ROOM = {
  floor_tech: floorTech,
  floor_wood: floorWood,
  wall,
  wall_side: wallSide,
  rail_bottom: railBottom,
  rug_den: rugDen,
  rug_work: rugWork,
} satisfies Record<string, DrawFn>
