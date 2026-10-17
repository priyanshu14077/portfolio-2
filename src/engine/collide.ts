// Collision and click-to-walk pathfinding: A* on a 4px grid, then string-pulled.
import { SOLIDS, WALK } from '../world.ts'

export const FOOT_W = 10
export const FOOT_H = 5

type Rect = [number, number, number, number]

const hit = (a: Rect, b: Rect) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1]

// The hero's feet box: x centred, y is the bottom edge.
export function blocked(x: number, y: number): boolean {
  if (x - FOOT_W / 2 < WALK.x0 || x + FOOT_W / 2 > WALK.x1 || y - FOOT_H < WALK.y0 || y > WALK.y1) return true
  const feet: Rect = [x - FOOT_W / 2, y - FOOT_H, FOOT_W, FOOT_H]
  return SOLIDS.some((s) => hit(feet, s))
}

const CELL = 4
const GW = Math.ceil(WALK.x1 / CELL) + 1
const GH = Math.ceil(WALK.y1 / CELL) + 1
const free = new Uint8Array(GW * GH)
for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) free[gy * GW + gx] = blocked(gx * CELL, gy * CELL) ? 0 : 1

const isFree = (gx: number, gy: number) => gx >= 0 && gy >= 0 && gx < GW && gy < GH && free[gy * GW + gx] === 1

// Nearest walkable point to (x, y), searching outward in rings.
export function freeSpot(x: number, y: number): [number, number] {
  if (!blocked(x, y)) return [x, y]
  for (let r = 2; r < 80; r += 2) {
    for (let a = 0; a < 16; a++) {
      const px = Math.round(x + Math.cos((a / 16) * Math.PI * 2) * r)
      const py = Math.round(y + Math.sin((a / 16) * Math.PI * 2) * r)
      if (!blocked(px, py)) return [px, py]
    }
  }
  return [x, y]
}

export function lineFree(ax: number, ay: number, bx: number, by: number): boolean {
  const d = Math.hypot(bx - ax, by - ay)
  const n = Math.max(1, Math.ceil(d / 2))
  for (let i = 1; i <= n; i++) if (blocked(ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n)) return false
  return true
}

export function findPath(sx: number, sy: number, tx: number, ty: number): [number, number][] | null {
  ;[tx, ty] = freeSpot(tx, ty)
  if (lineFree(sx, sy, tx, ty)) return [[tx, ty]]
  const start = Math.round(sy / CELL) * GW + Math.round(sx / CELL)
  const goalX = Math.round(tx / CELL)
  const goalY = Math.round(ty / CELL)
  if (!isFree(goalX, goalY)) return null
  const goal = goalY * GW + goalX

  const g = new Float32Array(GW * GH).fill(Infinity)
  const came = new Int32Array(GW * GH).fill(-1)
  const closed = new Uint8Array(GW * GH)
  const heap: [number, number][] = [] // [f, idx]
  const push = (f: number, i: number) => {
    heap.push([f, i])
    let c = heap.length - 1
    while (c > 0) {
      const p = (c - 1) >> 1
      if (heap[p][0] <= heap[c][0]) break
      ;[heap[p], heap[c]] = [heap[c], heap[p]]
      c = p
    }
  }
  const pop = () => {
    const top = heap[0]
    const last = heap.pop()!
    if (heap.length) {
      heap[0] = last
      let c = 0
      for (;;) {
        const l = c * 2 + 1
        const r = l + 1
        let m = c
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r
        if (m === c) break
        ;[heap[m], heap[c]] = [heap[c], heap[m]]
        c = m
      }
    }
    return top[1]
  }
  const hcost = (i: number) => Math.hypot((i % GW) - goalX, Math.floor(i / GW) - goalY)

  g[start] = 0
  push(hcost(start), start)
  while (heap.length) {
    const cur = pop()
    if (cur === goal) break
    if (closed[cur]) continue
    closed[cur] = 1
    const cx = cur % GW
    const cy = Math.floor(cur / GW)
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue
        const nx = cx + dx
        const ny = cy + dy
        if (!isFree(nx, ny)) continue
        if (dx && dy && (!isFree(cx + dx, cy) || !isFree(cx, cy + dy))) continue // no corner cutting
        const ni = ny * GW + nx
        const ng = g[cur] + (dx && dy ? Math.SQRT2 : 1)
        if (ng < g[ni]) {
          g[ni] = ng
          came[ni] = cur
          push(ng + hcost(ni), ni)
        }
      }
  }
  if (came[goal] === -1) return null

  const cells: [number, number][] = []
  for (let i = goal; i !== start && i !== -1; i = came[i]) cells.push([(i % GW) * CELL, Math.floor(i / GW) * CELL])
  cells.reverse()
  cells[cells.length - 1] = [tx, ty]

  // string pulling: keep only the waypoints that break line of sight
  const out: [number, number][] = []
  let ax = sx
  let ay = sy
  for (let i = 0; i < cells.length; i++) {
    const next = cells[i + 1]
    if (!next || !lineFree(ax, ay, next[0], next[1])) {
      out.push(cells[i])
      ;[ax, ay] = cells[i]
    }
  }
  return out
}
