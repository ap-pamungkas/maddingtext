import { CANVAS_PADDING } from '../constants'

export function clampNotePosition(
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
): { x: number; y: number } {
  const maxLeft = Math.max(
    CANVAS_PADDING,
    window.innerWidth - cardWidth - CANVAS_PADDING,
  )
  const maxTop = Math.max(
    CANVAS_PADDING,
    window.innerHeight - cardHeight - CANVAS_PADDING,
  )

  return {
    x: Math.max(CANVAS_PADDING, Math.min(x, maxLeft)),
    y: Math.max(CANVAS_PADDING, Math.min(y, maxTop)),
  }
}

export function findNoteIdAtPoint(clientX: number, clientY: number): string | null {
  const el = document.elementFromPoint(clientX, clientY)
  return el?.closest<HTMLElement>('[data-note-id]')?.dataset.noteId ?? null
}

