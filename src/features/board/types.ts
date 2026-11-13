export type PaperPattern = 'polos' | 'garis' | 'titik' | 'kotak'
export type NoteFont = 'sans' | 'serif' | 'mono'

export interface Note {
  id: string
  text: string
  x: number
  y: number
  zIndex: number
  pinned: boolean
  paperColor: string
  textColor: string | null
  pattern: PaperPattern
  font: NoteFont
}

export interface DragState {
  noteId: string
  startClientX: number
  startClientY: number
  originX: number
  originY: number
  moved: boolean
}

export interface PinDragOrigin {
  startClientX: number
  startClientY: number
  moved: boolean
}

export interface PinDragPreview {
  clientX: number
  clientY: number
  targetNoteId: string | null
}

export interface UnpinDragOrigin {
  noteId: string
  noteIndex: number
  startClientX: number
  startClientY: number
  moved: boolean
}

export interface UnpinDragPreview {
  noteId: string
  clientX: number
  clientY: number
  detached: boolean
}

