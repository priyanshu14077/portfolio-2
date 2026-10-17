// Content model. src/content.ts fills it; src/engine/panel.ts renders it.

export type Section =
  | { type: 'text'; title?: string; body: string }
  | { type: 'list'; title?: string; items: string[] }
  | { type: 'tags'; title?: string; items: string[] }
  | { type: 'links'; title?: string; items: { label: string; href: string; note?: string }[] }
  | { type: 'stats'; title?: string; items: { value: string; label: string }[] }
  | { type: 'timeline'; title?: string; items: { when: string; what: string; note?: string }[] }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; poster?: string; caption?: string }
  | { type: 'gallery'; title?: string; items: { src: string; alt: string; caption?: string }[] }
  | { type: 'steps'; title?: string; items: { name: string; tagline: string; points: string[] }[] }
  | { type: 'posts'; title?: string; items: { title: string; href: string; date: string; tags: string[] }[] }
  | { type: 'clock'; tz: string; label: string }
  | { type: 'radio' }
  | { type: 'status' }

export type PanelKey =
  | 'about'
  | 'method'
  | 'impact'
  | 'proploy'
  | 'dunne'
  | 'emtech'
  | 'tether'
  | 'riverline'
  | 'bidwright'
  | 'skills'
  | 'github'
  | 'writing'
  | 'now'
  | 'music'
  | 'sports'
  | 'location'
  | 'resume'
  | 'contact'

export interface Panel {
  title: string
  icon: string // one glyph
  subtitle?: string
  sections: Section[]
}

export interface Station {
  id: string
  freq: number
  name: string
  genre: string
  playlist: string // YouTube playlist id
  tracks: { id: string; title: string; artist: string }[] // video ids played in order
}

export interface Content {
  profile: {
    name: string
    role: string
    location: string
    greeting: string // first speech bubble
    classicUrl: string
    resumeUrl?: string
  }
  availability: {
    open: boolean
    modes: string[] // e.g. remote, on-site, relocation
    roles: string[]
    note: string
  }
  stations: Station[]
  panels: Record<PanelKey, Panel>
}
