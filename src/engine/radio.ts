// Studio radio: plays a station's track list in a YouTube player docked in the corner.
// YouTube's terms require a visible player of at least 200x200, so the dock
// stays on screen while a station is playing.
import type { Station } from '../types.ts'

interface YTPlayer {
  loadPlaylist(ids: string[], index?: number): void
  setShuffle(on: boolean): void
  setLoop(on: boolean): void
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  nextVideo(): void
  getVideoData?(): { title?: string; author?: string }
}
interface YTNamespace {
  Player: new (el: HTMLElement, opts: object) => YTPlayer
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

type Listener = (s: RadioState) => void
export interface RadioState {
  station: Station | null
  playing: boolean
  title: string
}

let api: Promise<YTNamespace> | null = null
function loadApi(): Promise<YTNamespace> {
  api ??= new Promise((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT)
    window.onYouTubeIframeAPIReady = () => resolve(window.YT!)
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.onerror = () => {
      api = null
      reject(new Error('YouTube blocked'))
    }
    document.head.append(s)
  })
  return api
}

export function createRadio(stations: Station[], dock: HTMLElement) {
  const listeners = new Set<Listener>()
  const state: RadioState = { station: null, playing: false, title: '' }
  let player: YTPlayer | null = null
  let ready: Promise<void> | null = null

  const emit = () => listeners.forEach((l) => l(state))
  const host = dock.querySelector<HTMLElement>('.yt-host')!
  const label = dock.querySelector<HTMLElement>('.radio-now')!
  const render = () => {
    dock.hidden = !state.station
    dock.classList.toggle('playing', state.playing)
    label.textContent = state.station ? `${state.station.freq.toFixed(1)} FM · ${state.station.name}${state.title ? ' — ' + state.title : ''}` : ''
  }
  listeners.add(render)

  function ensurePlayer(): Promise<void> {
    ready ??= loadApi().then(
      (YT) =>
        new Promise<void>((resolve) => {
          const el = document.createElement('div')
          host.replaceChildren(el)
          player = new YT.Player(el, {
            width: 200,
            height: 200,
            playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
            events: {
              onReady: () => resolve(),
              onStateChange: (e: { data: number }) => {
                state.playing = e.data === YT.PlayerState.PLAYING
                const d = player?.getVideoData?.()
                if (d?.title) state.title = d.author ? `${d.title} · ${d.author}` : d.title
                emit()
              },
            },
          })
        }),
    )
    return ready
  }

  async function tune(st: Station) {
    state.station = st
    state.title = ''
    emit()
    try {
      await ensurePlayer()
      // start somewhere random so the station feels like it was already on air
      player!.loadPlaylist(
        st.tracks.map((t) => t.id),
        Math.floor(Math.random() * st.tracks.length),
      )
      player!.setLoop(true)
    } catch {
      state.station = null
      emit()
      throw new Error('radio unavailable')
    }
  }

  dock.querySelector('.radio-stop')!.addEventListener('click', () => stop())
  dock.querySelector('.radio-next')!.addEventListener('click', () => step(1))

  function stop() {
    player?.stopVideo()
    state.playing = false
    state.station = null
    emit()
  }

  function step(d: number) {
    const i = state.station ? stations.indexOf(state.station) : -1
    return tune(stations[(i + d + stations.length) % stations.length])
  }

  return {
    state,
    tune,
    stop,
    step,
    toggle() {
      if (state.station) stop()
      else return tune(stations[0])
    },
    onChange(l: Listener) {
      listeners.add(l)
      return () => listeners.delete(l)
    },
  }
}

export type Radio = ReturnType<typeof createRadio>
