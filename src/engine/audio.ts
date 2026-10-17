// Sound effects, synthesised with WebAudio. The context is created on the first gesture.

let ac: AudioContext | null = null
let master: GainNode | null = null
let muted = false

export function unlockAudio() {
  if (ac) return
  ac = new AudioContext()
  master = ac.createGain()
  master.gain.value = muted ? 0 : 0.4
  master.connect(ac.destination)
}

export function setMuted(m: boolean) {
  muted = m
  if (master) master.gain.value = m ? 0 : 0.4
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol = 0.3, slideTo?: number) {
  if (!ac || !master) return
  const t = ac.currentTime + start
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const sfx = {
  blip() {
    tone(660, 0, 0.06, 'square', 0.12)
    tone(990, 0.05, 0.08, 'square', 0.1)
  },
  close() {
    tone(520, 0, 0.06, 'square', 0.1)
    tone(390, 0.05, 0.08, 'square', 0.08)
  },
  step() {
    tone(140, 0, 0.03, 'triangle', 0.05)
  },
  meow() {
    if (!ac || !master) return
    const t = ac.currentTime
    const osc = ac.createOscillator()
    const bp = ac.createBiquadFilter()
    const g = ac.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(520, t)
    osc.frequency.linearRampToValueAtTime(820, t + 0.12)
    osc.frequency.linearRampToValueAtTime(480, t + 0.4)
    bp.type = 'bandpass'
    bp.frequency.value = 1400
    bp.Q.value = 3
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.05)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
    osc.connect(bp).connect(g).connect(master)
    osc.start(t)
    osc.stop(t + 0.5)
  },
  bounce() {
    tone(180, 0, 0.12, 'sine', 0.35, 70)
  },
  click() {
    tone(1200, 0, 0.02, 'square', 0.06)
  },
  fanfare() {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.22, 'square', 0.12))
  },
}
