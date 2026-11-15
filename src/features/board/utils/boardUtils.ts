const MAX_WORLD_BOUND = 100000

export function clampNotePosition(
  x: number,
  y: number,
  cardWidth = 0,
  cardHeight = 0,
): { x: number; y: number } {
  // Dalam infinite canvas, catatan dapat ditempatkan bebas di ruang dunia
  // Clamping hanya untuk mencegah overflow/NaN numerik ekstrim
  const maxX = MAX_WORLD_BOUND - Math.max(0, cardWidth)
  const maxY = MAX_WORLD_BOUND - Math.max(0, cardHeight)
  return {
    x: Math.max(-MAX_WORLD_BOUND, Math.min(x, maxX)),
    y: Math.max(-MAX_WORLD_BOUND, Math.min(y, maxY)),
  }
}

export function clientToWorld(
  clientX: number,
  clientY: number,
  pan: { x: number; y: number },
  zoom: number,
): { x: number; y: number } {
  return {
    x: (clientX - pan.x) / zoom,
    y: (clientY - pan.y) / zoom,
  }
}

export function worldToClient(
  worldX: number,
  worldY: number,
  pan: { x: number; y: number },
  zoom: number,
): { x: number; y: number } {
  return {
    x: worldX * zoom + pan.x,
    y: worldY * zoom + pan.y,
  }
}

export function findNoteIdAtPoint(clientX: number, clientY: number): string | null {
  const el = document.elementFromPoint(clientX, clientY)
  return el?.closest<HTMLElement>('[data-note-id]')?.dataset.noteId ?? null
}

export function calculateHangingAngle(pinXPercent: number): number {
  const offsetFromCenter = (50 - pinXPercent) / 50
  return Math.round(offsetFromCenter * 8.5 * 10) / 10
}

export function calculatePinDropPosition(
  clientX: number,
  cardRect: DOMRect,
): { pinX: number; pinY: number } {
  const rawXPercent = ((clientX - cardRect.left) / cardRect.width) * 100
  const pinX = Math.max(16, Math.min(84, Math.round(rawXPercent)))
  const pinY = 12
  return { pinX, pinY }
}

