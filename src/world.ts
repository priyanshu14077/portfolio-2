// Room layout in art pixels. Every position is the sprite's top-left corner;
// floor objects y-sort on their bottom edge (y + h).
import { SPRITE_SIZES, type HeroDir, type StaticSpriteId } from './art/contract.ts'
import type { PanelKey } from './types.ts'

export const W = 400
export const H = 260
export const WALL_H = 64
export const DEN_X = 208 // floor switches from tech tiles to wood here
export const WALK = { x0: 14, y0: 70, x1: 386, y1: 246 }

export type Layer = 'floor' | 'wall' | 'obj'

export interface WorldObject {
  id: string
  s: StaticSpriteId
  x: number
  y: number
  layer: Layer
  // collision box relative to the sprite; defaults to the bottom 40% for 'obj'
  solid?: [dx: number, dy: number, w: number, h: number] | false
  // draw right after another object (laptop on table)
  on?: string
}

export type Action = 'pet' | 'night' | 'ball' | 'radio'

export interface Hotspot {
  id: string
  obj: string
  label: string
  at: [number, number] // where the hero stands
  face: HeroDir
  panel?: PanelKey
  action?: Action
  zone: 'work' | 'den'
}

export interface Light {
  x: number
  y: number
  r: number
  c: string // 'r,g,b'
  when?: 'radio'
}

const o = (id: string, s: StaticSpriteId, x: number, y: number, layer: Layer = 'obj', extra: Partial<WorldObject> = {}): WorldObject => ({
  id,
  s,
  x,
  y,
  layer,
  ...extra,
})

export const OBJECTS: WorldObject[] = [
  // back wall
  o('board_method', 'board_method', 8, 12, 'wall'),
  o('board_impact', 'board_impact', 70, 14, 'wall'),
  o('github_poster', 'github_poster', 124, 18, 'wall'),
  o('clock', 'clock', 164, 22, 'wall'),
  o('door', 'door', 186, 14, 'wall'),
  o('sign', 'sign_open', 175, 2, 'wall'),
  o('window_a', 'window_day', 226, 14, 'wall'),
  o('jersey', 'jersey_frame', 274, 16, 'wall'),
  o('window_b', 'window_day', 302, 14, 'wall'),
  o('sports_rack', 'sports_rack', 350, 16, 'wall'),
  o('string_lights', 'string_lights', 228, 2, 'wall'),

  // rugs
  o('rug_work', 'rug_work', 24, 140, 'floor'),
  o('rug_den', 'rug_den', 256, 124, 'floor'),

  // work half
  o('ws_proploy', 'ws_proploy', 12, 88),
  o('ws_dunne', 'ws_dunne', 72, 88),
  o('ws_emtech', 'ws_emtech', 132, 88),
  o('arcade_tether', 'arcade_tether', 16, 190),
  o('arcade_riverline', 'arcade_riverline', 44, 190),
  o('arcade_bidwright', 'arcade_bidwright', 72, 190),
  o('server_rack', 'server_rack', 110, 184),
  o('kiosk', 'kiosk', 160, 196),
  o('plant_work', 'plant_tall', 186, 214),
  o('ops_table', 'ops_table', 50, 148),
  o('water_cooler', 'water_cooler', 192, 98),
  o('boxes', 'boxes', 136, 212),
  o('trash_bin', 'trash_bin', 64, 120),

  // den
  o('sunflower_a', 'sunflower', 220, 66),
  o('bookshelf', 'bookshelf', 238, 56),
  o('radio', 'radio_0', 300, 74),
  o('sunflower_b', 'sunflower', 376, 66),
  o('lamp', 'lamp_on', 230, 112, 'obj', { solid: [3, 30, 6, 6] }),
  o('sofa', 'sofa', 272, 122),
  o('coffee_table', 'coffee_table', 285, 160, 'obj', { solid: [1, 4, 32, 10] }),
  o('laptop', 'laptop', 295, 156, 'obj', { solid: false, on: 'coffee_table' }),
  o('tv', 'tv_stand', 284, 208),
  o('ball', 'basketball', 352, 222, 'obj', { solid: false }),
  o('plant_den', 'plant_tall', 380, 214),
  o('bean_bag', 'bean_bag', 342, 128),
  o('cat_tree', 'cat_tree', 368, 150),
  o('cat_bowl', 'cat_bowl', 348, 188, 'obj', { solid: false }),
  o('record_crate', 'record_crate', 220, 216),
  o('floor_cushion', 'floor_cushion', 246, 230, 'obj', { solid: false }),
]

export const byId = Object.fromEntries(OBJECTS.map((ob) => [ob.id, ob])) as Record<string, WorldObject>

export function size(ob: WorldObject): [number, number] {
  const [w, h] = SPRITE_SIZES[ob.s]
  return [w, h]
}

export function rectOf(ob: WorldObject): [number, number, number, number] {
  const [w, h] = size(ob)
  return [ob.x, ob.y, w, h]
}

// collision boxes in world space
export const SOLIDS: [number, number, number, number][] = OBJECTS.flatMap((ob) => {
  if (ob.layer !== 'obj' || ob.solid === false) return []
  const [w, h] = size(ob)
  if (ob.solid) return [[ob.x + ob.solid[0], ob.y + ob.solid[1], ob.solid[2], ob.solid[3]]]
  const fh = Math.max(6, Math.round(h * 0.4))
  return [[ob.x + 1, ob.y + h - fh, w - 2, fh]]
})

export const CAT_OFFSET: [number, number] = [38, 4] // relative to the sofa

const h = (id: string, obj: string, label: string, at: [number, number], face: HeroDir, zone: Hotspot['zone'], rest: Partial<Hotspot>): Hotspot => ({
  id,
  obj,
  label,
  at,
  face,
  zone,
  ...rest,
})

export const HOTSPOTS: Hotspot[] = [
  h('about', 'kiosk', 'whoami', [168, 236], 'up', 'work', { panel: 'about' }),
  h('method', 'board_method', 'How I work', [36, 78], 'up', 'work', { panel: 'method' }),
  h('impact', 'board_impact', 'Impact board', [94, 78], 'up', 'work', { panel: 'impact' }),
  h('github', 'github_poster', 'GitHub', [141, 78], 'up', 'work', { panel: 'github' }),
  h('proploy', 'ws_proploy', 'Proploy', [38, 138], 'up', 'work', { panel: 'proploy' }),
  h('dunne', 'ws_dunne', 'Dunne', [98, 138], 'up', 'work', { panel: 'dunne' }),
  h('emtech', 'ws_emtech', 'Emtech', [158, 138], 'up', 'work', { panel: 'emtech' }),
  h('tether', 'arcade_tether', 'Tether', [30, 238], 'up', 'work', { panel: 'tether' }),
  h('riverline', 'arcade_riverline', 'Riverline voice agent', [58, 238], 'up', 'work', { panel: 'riverline' }),
  h('bidwright', 'arcade_bidwright', 'Bidwright', [86, 238], 'up', 'work', { panel: 'bidwright' }),
  h('skills', 'server_rack', 'Toolbelt', [121, 238], 'up', 'work', { panel: 'skills' }),
  h('location', 'clock', 'Local time', [171, 78], 'up', 'work', { panel: 'location' }),
  h('contact', 'door', 'Contact', [201, 76], 'up', 'work', { panel: 'contact' }),
  h('writing', 'bookshelf', 'Writing', [258, 110], 'up', 'den', { panel: 'writing' }),
  h('music', 'radio', 'Radio', [317, 108], 'up', 'den', { panel: 'music', action: 'radio' }),
  h('sports', 'sports_rack', 'Sports', [364, 108], 'up', 'den', { panel: 'sports' }),
  h('now', 'tv', 'Now', [304, 200], 'down', 'den', { panel: 'now' }),
  h('resume', 'laptop', 'Resume', [302, 186], 'up', 'den', { panel: 'resume' }),
  h('cat', 'sofa', 'Pet the cat', [252, 150], 'right', 'den', { action: 'pet' }),
  h('lamp', 'lamp', 'Lamp', [244, 156], 'left', 'den', { action: 'night' }),
  h('ball', 'ball', 'Basketball', [357, 212], 'down', 'den', { action: 'ball' }),
  h('jersey', 'jersey', 'Luka 77', [285, 108], 'up', 'den', { panel: 'sports' }),
]

export const LIGHTS: Light[] = [
  { x: 236, y: 118, r: 70, c: '255,201,120' }, // lamp
  { x: 38, y: 100, r: 34, c: '120,170,255' },
  { x: 98, y: 100, r: 34, c: '120,170,255' },
  { x: 158, y: 100, r: 34, c: '120,170,255' },
  { x: 201, y: 8, r: 30, c: '255,201,40' }, // open-to-work sign
  { x: 304, y: 216, r: 36, c: '140,190,255' }, // tv
  { x: 29, y: 200, r: 20, c: '255,120,200' },
  { x: 57, y: 200, r: 20, c: '120,255,220' },
  { x: 85, y: 200, r: 20, c: '255,220,120' },
  { x: 121, y: 196, r: 22, c: '90,255,140' }, // server LEDs
  { x: 317, y: 82, r: 30, c: '255,190,90', when: 'radio' },
  // fairy lights along the den wall
  ...[240, 266, 292, 318, 344, 370].map((x) => ({ x, y: 8, r: 14, c: '255,214,140' })),
]

export const SPAWN: [number, number] = [200, 160]
