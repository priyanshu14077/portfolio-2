// Pixel helpers. Everything snaps to integer rects; nothing anti-aliases.

export type Ctx = CanvasRenderingContext2D

export function makeCanvas(w: number, h: number): { c: HTMLCanvasElement; g: Ctx } {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  if (!g) throw new Error('2d canvas context unavailable')
  g.imageSmoothingEnabled = false
  return { c, g }
}

export function rect(g: Ctx, x: number, y: number, w: number, h: number, col: string): void {
  if (w <= 0 || h <= 0) return
  g.fillStyle = col
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

export function px(g: Ctx, x: number, y: number, col: string): void {
  rect(g, x, y, 1, 1, col)
}

/** Filled rect with a 1px border in `edge`. */
export function box(g: Ctx, x: number, y: number, w: number, h: number, fill: string, edge: string): void {
  rect(g, x, y, w, h, edge)
  rect(g, x + 1, y + 1, w - 2, h - 2, fill)
}

/** Raised block lit from the top-left: light top/left edges, dark bottom/right edges. */
export function bevel(g: Ctx, x: number, y: number, w: number, h: number, base: string, amt = 0.2): void {
  rect(g, x, y, w, h, base)
  rect(g, x, y, w, 1, shade(base, amt))
  rect(g, x, y, 1, h, shade(base, amt))
  rect(g, x, y + h - 1, w, 1, shade(base, -amt))
  rect(g, x + w - 1, y + 1, 1, h - 1, shade(base, -amt))
}

/** Recessed panel: dark top/left, light bottom/right. */
export function inset(g: Ctx, x: number, y: number, w: number, h: number, base: string, amt = 0.2): void {
  rect(g, x, y, w, h, base)
  rect(g, x, y, w, 1, shade(base, -amt))
  rect(g, x, y, 1, h, shade(base, -amt))
  rect(g, x, y + h - 1, w, 1, shade(base, amt))
  rect(g, x + w - 1, y + 1, 1, h - 1, shade(base, amt))
}

/** Checkerboard of `col` over the area. */
export function dither(g: Ctx, x: number, y: number, w: number, h: number, col: string, phase = 0): void {
  for (let yy = 0; yy < h; yy++)
    for (let xx = 0; xx < w; xx++) if ((xx + yy + phase) % 2 === 0) px(g, x + xx, y + yy, col)
}

/** Lighten (amt > 0) toward white or darken (amt < 0) toward black. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt)),
  )
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('')
}

/** Filled ellipse inscribed in the box, built from 1px-tall row spans. */
export function oval(g: Ctx, x: number, y: number, w: number, h: number, col: string): void {
  for (let row = 0; row < h; row++) {
    const dy = (row + 0.5 - h / 2) / (h / 2)
    const span = w * Math.sqrt(Math.max(0, 1 - dy * dy))
    const ins = Math.round((w - span) / 2)
    rect(g, x + ins, y + row, w - 2 * ins, 1, col)
  }
}

/** Rounded rect with stepped corners of radius r. */
export function rrect(g: Ctx, x: number, y: number, w: number, h: number, r: number, col: string): void {
  for (let row = 0; row < h; row++) {
    const d = Math.min(row, h - 1 - row)
    const ins = d < r ? Math.round(r - Math.sqrt(r * r - (r - d - 0.5) ** 2)) : 0
    rect(g, x + ins, y + row, w - 2 * ins, 1, col)
  }
}

/** Diamond centred on (cx, cy) with radius r (odd width 2r+1). */
export function diamond(g: Ctx, cx: number, cy: number, r: number, col: string): void {
  for (let dy = -r; dy <= r; dy++) {
    const hw = r - Math.abs(dy)
    rect(g, cx - hw, cy + dy, hw * 2 + 1, 1, col)
  }
}

/** Bresenham line stamped with a t x t square. */
export function line(g: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, t = 1): void {
  let x = Math.round(x0)
  let y = Math.round(y0)
  const ex = Math.round(x1)
  const ey = Math.round(y1)
  const dx = Math.abs(ex - x)
  const dy = -Math.abs(ey - y)
  const sx = x < ex ? 1 : -1
  const sy = y < ey ? 1 : -1
  const off = Math.floor(t / 2)
  let err = dx + dy
  for (;;) {
    rect(g, x - off, y - off, t, t, col)
    if (x === ex && y === ey) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
}

/** Draw a char grid; chars missing from `map` are transparent. */
export function pattern(g: Ctx, x: number, y: number, rows: readonly string[], map: Record<string, string>): void {
  rows.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const col = map[row.charAt(rx)]
      if (col) px(g, x + rx, y + ry, col)
    }
  })
}

/** Paint `col` on every transparent pixel that touches an opaque one (4-neighbour). */
export function outline(g: Ctx, col: string): void {
  const { width: w, height: h } = g.canvas
  const a = g.getImageData(0, 0, w, h).data
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && (a[(y * w + x) * 4 + 3] ?? 0) > 0
  g.fillStyle = col
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)))
        g.fillRect(x, y, 1, 1)
}

/** Deterministic PRNG so sprites look the same on every load. */
export function rng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}
