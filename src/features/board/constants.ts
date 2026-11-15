import type { NoteFont, PaperPattern, PaperShape } from './types'

export const DEFAULT_CARD_WIDTH = 268
export const DEFAULT_CARD_HEIGHT = 190
export const CANVAS_PADDING = 16
export const KEYBOARD_STEP = 16
export const KEYBOARD_FAST_STEP = 48

export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 2.5
export const DEFAULT_ZOOM = 1.0
export const ZOOM_STEP = 0.15

export const PAPER_SHAPES: { id: PaperShape; label: string }[] = [
  { id: 'standar', label: 'Potongan rapi' },
  { id: 'lipat', label: 'Sudut terlipat' },
  { id: 'sobek', label: 'Sobekan catatan' },
  { id: 'lengkung', label: 'Lengkung terangkat' },
]

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
  { color: '#FFE27A', label: 'Kuning kertas' },
  { color: '#F5F0E3', label: 'Putih tulang' },
  { color: '#BDE0F0', label: 'Biru muda' },
  { color: '#F6C4CC', label: 'Merah muda' },
  { color: '#C6E6C0', label: 'Hijau pastel' },
  { color: '#FFC999', label: 'Oranye hangat' },
  { color: '#26252b', label: 'Abu malam' },
]

export const TEXT_SWATCHES: { color: string; label: string }[] = [
  { color: '#f2f0f5', label: 'Putih lembut' },
  { color: '#1b1a1e', label: 'Tinta hitam' },
  { color: '#1d3557', label: 'Tinta biru' },
  { color: '#8c2f39', label: 'Tinta merah bata' },
]

