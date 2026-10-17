// The engine depends only on this file. src/art/sprites.ts implements it.
// Units are art pixels: the world is 400x260 and the canvas scales it up with
// nearest-neighbour filtering.

export interface Sprite {
  img: HTMLCanvasElement
  w: number
  h: number
}

// Fixed sizes (w x h). The world layout in src/world.ts is built around them.
export const SPRITE_SIZES = {
  // architecture
  floor_tech: [16, 16], // work half: cool blue-grey tiles
  floor_wood: [16, 16], // den half: warm planks
  wall: [16, 64], // back wall strip: top trim, wall face, baseboard (bottom 6px)
  wall_side: [8, 16], // left/right wall edge, tiled vertically
  rail_bottom: [16, 10], // front rail along the bottom edge, tiled
  rug_den: [96, 52],
  rug_work: [140, 40],

  // back wall (hung)
  board_method: [56, 34], // "HOW I WORK" whiteboard: 4 steps DISCOVER SCOPE BUILD SHIP
  board_impact: [48, 30], // "IMPACT" board with tiny bar chart + "3D>15S"
  github_poster: [34, 26], // green contribution grid + "GITHUB"
  clock: [14, 14], // wall clock (hands are drawn by the engine; leave the face empty)
  door: [30, 50], // closed door with window pane and handle
  sign_open: [52, 10], // lit sign above the door: "OPEN TO WORK", sunflower glow
  sign_off: [52, 10], // same sign, unlit/dim
  window_day: [40, 30], // sky blue, clouds, a few skyline blocks
  window_night: [40, 30], // dark blue, moon, stars, lit skyline windows
  jersey_frame: [22, 28], // framed blue/white basketball jersey number 77
  sports_rack: [28, 30], // wall rack: badminton racket + cricket bat crossed
  string_lights: [156, 10], // warm fairy lights draped along the top of the den wall

  // work half (floor, anchored bottom-centre)
  ws_proploy: [52, 40], // desk + monitor reading "PROPLOY" + chair in front
  ws_dunne: [52, 40], // same desk family, monitor reads "DUNNE", gold ring icon
  ws_emtech: [52, 40], // monitor reads "EMTECH"
  arcade_tether: [28, 38], // arcade cabinet, marquee "TETHER"
  arcade_riverline: [28, 38], // marquee "VOICE", waveform on screen
  arcade_bidwright: [28, 38], // marquee "BID", doc icon on screen
  server_rack: [22, 44], // rack with blinking LED rows (engine may overlay blinks)
  kiosk: [16, 30], // "whoami" terminal on a stand
  plant_tall: [14, 30],
  ops_table: [60, 26], // stand-up table: architecture printout, sticky notes, two mugs, a laptop
  water_cooler: [12, 28], // office water cooler, blue bottle on top
  boxes: [18, 18], // two stacked shipping boxes, top one taped, a cable coil
  trash_bin: [8, 10], // small mesh bin with crumpled paper

  // den half
  bookshelf: [40, 46], // full of colourful spines
  radio_0: [34, 26], // low cabinet with retro radio/turntable on top
  radio_1: [34, 26], // same, playing: dial lit, record rotated
  sunflower: [16, 32], // pot with 2-3 sunflowers (signature prop)
  sofa: [60, 30], // front-facing sofa, cobalt fabric, with cushion
  coffee_table: [34, 14],
  laptop: [14, 9], // open laptop seen from the front-top, sits on coffee table
  tv_stand: [40, 30], // TV on low stand, screen shows a pixel stick-figure game + controller
  lamp_on: [12, 36], // floor lamp, warm shade lit
  lamp_off: [12, 36],
  basketball: [10, 10],
  bean_bag: [26, 18], // slouchy sunflower-yellow bean bag
  cat_tree: [16, 34], // scratching post with two platforms and a dangling toy
  cat_bowl: [10, 5], // food bowl with kibble
  record_crate: [20, 16], // wooden crate of vinyl records, sleeves visible
  floor_cushion: [20, 10], // flat round floor cushion

  // cat (sits on the sofa; engine positions it)
  cat_sleep_0: [16, 9], // curled orange cat
  cat_sleep_1: [16, 9], // breathing frame (1px taller back)
  cat_awake: [16, 11], // sitting up, eyes open

  // hero: 16x24, feet at bottom-centre. frame 0 = idle, 1..4 = walk cycle
  // ids: hero_<dir>_<frame>, dir in down|up|left|right
} as const satisfies Record<string, readonly [number, number]>

export type StaticSpriteId = keyof typeof SPRITE_SIZES
export type HeroDir = 'down' | 'up' | 'left' | 'right'
export type HeroSpriteId = `hero_${HeroDir}_${0 | 1 | 2 | 3 | 4}`
export type SpriteId = StaticSpriteId | HeroSpriteId
export const HERO_SIZE = [16, 24] as const

// Palette shared by the art and the UI (mirrors the CSS tokens).
export const PAL = {
  cobalt: '#1546c4',
  cobaltDeep: '#0f3596',
  cobaltRaised: '#2a62e8',
  ink: '#f4f8ff',
  muted: '#b9cdfa',
  sun: '#ffc928',
  sunDeep: '#e09a12',
  leaf: '#3fbf5f',
  leafDeep: '#23843d',
  line: '#0a2466',
} as const
