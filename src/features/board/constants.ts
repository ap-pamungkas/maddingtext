import type { NoteFont, PaperPattern } from './types'

export const DEFAULT_CARD_WIDTH = 268
export const DEFAULT_CARD_HEIGHT = 190
export const CANVAS_PADDING = 16
export const KEYBOARD_STEP = 16
export const KEYBOARD_FAST_STEP = 48

export const PAPER_PATTERNS: { id: PaperPattern; label: string }[] = [
  { id: 'polos', label: 'Polos' },
  { id: 'garis', label: 'Garis' },
  { id: 'titik', label: 'Titik' },
  { id: 'kotak', label: 'Kotak' },
]

export const NOTE_FONTS: { id: NoteFont; label: string; stack: string }[] = [
  {
    id: 'sans',
    label: 'Sans',
    stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  { id: 'serif', label: 'Serif', stack: "Georgia, 'Times New Roman', serif" },
  { id: 'mono', label: 'Mono', stack: "ui-monospace, Consolas, monospace" },
]

export const PAPER_SWATCHES: { color: string; label: string }[] = [
  { color: '#26252b', label: 'Abu gelap' },
  { color: '#f3ead8', label: 'Krem kertas' },
  { color: '#d8e2dc', label: 'Hijau sage' },
  { color: '#eddcd2', label: 'Persik lembut' },
  { color: '#dbe7f0', label: 'Biru pucat' },
  { color: '#1f2229', label: 'Arang malam' },
]

export const TEXT_SWATCHES: { color: string; label: string }[] = [
  { color: '#f2f0f5', label: 'Putih lembut' },
  { color: '#1b1a1e', label: 'Tinta hitam' },
  { color: '#1d3557', label: 'Tinta biru' },
  { color: '#8c2f39', label: 'Tinta merah bata' },
]

