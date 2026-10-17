// Dev-only sprite sheet: every sprite at 4x on cobalt and dark, plus a size check.

import { HERO_SIZE, SPRITE_SIZES, type SpriteId, type StaticSpriteId } from './contract'
import { makeCanvas } from './draw'
import { pixelText } from './font'
import { HERO_DIRS, HERO_FRAMES, buildSprites } from './sprites'

const SCALE = 4
const sprites = buildSprites()

const expected: [SpriteId, number, number][] = [
  ...(Object.keys(SPRITE_SIZES) as StaticSpriteId[]).map((id): [SpriteId, number, number] => [id, ...SPRITE_SIZES[id]]),
  ...HERO_DIRS.flatMap((d) => HERO_FRAMES.map((f): [SpriteId, number, number] => [`hero_${d}_${f}`, ...HERO_SIZE])),
]

const errors: string[] = []
for (const [id, w, h] of expected) {
  const s = sprites[id]
  if (!s) errors.push(`${id}: missing`)
  else if (s.img.width !== w || s.img.height !== h || s.w !== w || s.h !== h)
    errors.push(`${id}: got ${s.img.width}x${s.img.height} (w/h ${s.w}x${s.h}), want ${w}x${h}`)
}
const extra = Object.keys(sprites).filter((k) => !expected.some(([id]) => id === k))
for (const k of extra) errors.push(`${k}: not in contract`)

const status = document.getElementById('status')
if (status) {
  status.textContent = errors.length ? errors.join(' | ') : `OK: ${expected.length} sprites match the contract sizes`
  status.className = errors.length ? 'bad' : ''
}
;(window as unknown as { __artCheck: { count: number; errors: string[] } }).__artCheck = { count: expected.length, errors }

function scaled(src: HTMLCanvasElement): HTMLCanvasElement {
  const { c, g } = makeCanvas(src.width, src.height)
  g.drawImage(src, 0, 0)
  c.style.width = `${src.width * SCALE}px`
  c.style.height = `${src.height * SCALE}px`
  return c
}

function fontSample(color: string): HTMLCanvasElement {
  const lines = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', '0123456789 >.-/:!?%', 'PROPLOY DUNNE EMTECH']
  const { c, g } = makeCanvas(84, lines.length * 7 + 1)
  lines.forEach((t, i) => pixelText(g, t, 1, 1 + i * 7, color))
  c.style.width = `${c.width * SCALE}px`
  return c
}

const root = document.getElementById('root')
for (const [bg, label] of [['cobalt', 'on cobalt'], ['dark', 'on dark']] as const) {
  const h = document.createElement('h2')
  h.textContent = label
  const panel = document.createElement('div')
  panel.className = `panel ${bg}`
  for (const [id] of expected) {
    const fig = document.createElement('figure')
    const cap = document.createElement('figcaption')
    cap.textContent = id
    fig.append(scaled(sprites[id].img), cap)
    panel.append(fig)
  }
  const fig = document.createElement('figure')
  const cap = document.createElement('figcaption')
  cap.textContent = 'pixelText'
  fig.append(fontSample('#f4f8ff'), cap)
  panel.append(fig)
  root?.append(h, panel)
}
