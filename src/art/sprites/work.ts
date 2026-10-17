// Work half: desks, arcade cabinets, server rack, kiosk, plants.

import { type Ctx, bevel, box, inset, line, outline, pattern, px, rect, shade } from '../draw'
import { pixelText, textWidth } from '../font'
import { C, type DrawFn } from './palette'

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

export const WORK = {
  ws_proploy: workstation('PROPLOY', C.ink, iconCards, C.sun),
  ws_dunne: workstation('DUNNE', C.sun, iconRing, C.ink),
  ws_emtech: workstation('EMTECH', C.leafHi, iconChart, C.red),
  arcade_tether: arcade('TETHER', C.leafDeep, C.leaf, screenTether),
  arcade_riverline: arcade('VOICE', '#7a4fd0', C.sun, screenVoice),
  arcade_bidwright: arcade('BID', C.cobaltDeep, C.cobaltHi, screenBid),
  server_rack: serverRack,
  kiosk: (g, w) => kiosk(g, w),
  plant_tall: plantTall,
} satisfies Record<string, DrawFn>
