// Shared colour ramps for the sprite modules. Light comes from the top-left.

import { PAL } from '../contract'
import type { Ctx } from '../draw'

export const C = {
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

export type DrawFn = (g: Ctx, w: number, h: number) => void
