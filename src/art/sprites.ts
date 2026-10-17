// Code-drawn pixel art for every id in contract.ts. Each area lives in its own
// module under ./sprites; this file merges them and renders the canvases.

import { HERO_SIZE, SPRITE_SIZES, type HeroDir, type HeroSpriteId, type Sprite, type SpriteId, type StaticSpriteId } from './contract'
import { makeCanvas } from './draw'
import { DEN } from './sprites/den'
import { drawHero } from './sprites/hero'
import type { DrawFn } from './sprites/palette'
import { ROOM } from './sprites/room'
import { WALL } from './sprites/wall'
import { WORK } from './sprites/work'

export { pixelText } from './font'

const STATIC = { ...ROOM, ...WALL, ...WORK, ...DEN } satisfies Record<StaticSpriteId, DrawFn>

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
