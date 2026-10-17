// 3x5 bitmap font. Each glyph is five 3-char rows, '#' = ink.

const GLYPHS: Record<string, string> = {
  A: '.#. #.# ### #.# #.#',
  B: '##. #.# ##. #.# ##.',
  C: '.## #.. #.. #.. .##',
  D: '##. #.# #.# #.# ##.',
  E: '### #.. ##. #.. ###',
  F: '### #.. ##. #.. #..',
  G: '.## #.. #.# #.# .##',
  H: '#.# #.# ### #.# #.#',
  I: '### .#. .#. .#. ###',
  J: '..# ..# ..# #.# .#.',
  K: '#.# #.# ##. #.# #.#',
  L: '#.. #.. #.. #.. ###',
  M: '#.# ### #.# #.# #.#',
  N: '##. #.# #.# #.# #.#',
  O: '.#. #.# #.# #.# .#.',
  P: '##. #.# ##. #.. #..',
  Q: '.#. #.# #.# ##. .##',
  R: '##. #.# ##. #.# #.#',
  S: '.## #.. .#. ..# ##.',
  T: '### .#. .#. .#. .#.',
  U: '#.# #.# #.# #.# ###',
  V: '#.# #.# #.# #.# .#.',
  W: '#.# #.# #.# ### #.#',
  X: '#.# #.# .#. #.# #.#',
  Y: '#.# #.# .#. .#. .#.',
  Z: '### ..# .#. #.. ###',
  '0': '### #.# #.# #.# ###',
  '1': '.#. ##. .#. .#. ###',
  '2': '##. ..# .#. #.. ###',
  '3': '##. ..# .#. ..# ##.',
  '4': '#.# #.# ### ..# ..#',
  '5': '### #.. ##. ..# ##.',
  '6': '.## #.. ##. #.# .#.',
  '7': '### ..# .#. .#. .#.',
  '8': '.#. #.# .#. #.# .#.',
  '9': '.#. #.# .## ..# ##.',
  '>': '#.. .#. ..# .#. #..',
  '.': '... ... ... ... .#.',
  '-': '... ... ### ... ...',
  '/': '..# ..# .#. #.. #..',
  ':': '... .#. ... .#. ...',
  '!': '.#. .#. .#. ... .#.',
  '?': '##. ..# .#. ... .#.',
  '%': '#.# ..# .#. #.. #.#',
  _: '... ... ... ... ###',
}

const SPACE_ADVANCE = 3
const ADVANCE = 4 // 3px glyph + 1px spacing

function advance(ch: string): number {
  return ch === ' ' ? SPACE_ADVANCE : ADVANCE
}

/** Width in pixels that pixelText would draw. */
export function textWidth(text: string): number {
  let w = 0
  for (const ch of text) w += advance(ch)
  return w > 0 ? w - 1 : 0
}

/** Draw text in the 3x5 font with its top-left at (x, y). Returns the drawn width. */
export function pixelText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string): number {
  const upper = text.toUpperCase()
  const ox = Math.round(x)
  const oy = Math.round(y)
  ctx.fillStyle = color
  let cx = ox
  for (const ch of upper) {
    if (ch !== ' ') {
      const glyph = (GLYPHS[ch] ?? GLYPHS['?'] ?? '').replace(/ /g, '')
      for (let i = 0; i < glyph.length; i++) if (glyph[i] === '#') ctx.fillRect(cx + (i % 3), oy + Math.floor(i / 3), 1, 1)
    }
    cx += advance(ch)
  }
  return textWidth(upper)
}
