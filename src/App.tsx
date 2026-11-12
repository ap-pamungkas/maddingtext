import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

type PaperPattern = 'polos' | 'garis' | 'titik' | 'kotak'
type NoteFont = 'sans' | 'serif' | 'mono'

interface Note {
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

interface DragState {
  noteId: string
  startClientX: number
  startClientY: number
  originX: number
  originY: number
  moved: boolean
}

interface PinDragOrigin {
  startClientX: number
  startClientY: number
  moved: boolean
}

interface PinDragPreview {
  clientX: number
  clientY: number
  targetNoteId: string | null
}

interface UnpinDragOrigin {
  noteId: string
  noteIndex: number
  startClientX: number
  startClientY: number
  moved: boolean
}

interface UnpinDragPreview {
  noteId: string
  clientX: number
  clientY: number
  detached: boolean
}

const DEFAULT_CARD_WIDTH = 268
const DEFAULT_CARD_HEIGHT = 190
const CANVAS_PADDING = 16
const KEYBOARD_STEP = 16
const KEYBOARD_FAST_STEP = 48

const PAPER_PATTERNS: { id: PaperPattern; label: string }[] = [
  { id: 'polos', label: 'Polos' },
  { id: 'garis', label: 'Garis' },
  { id: 'titik', label: 'Titik' },
  { id: 'kotak', label: 'Kotak' },
]

const NOTE_FONTS: { id: NoteFont; label: string; stack: string }[] = [
  {
    id: 'sans',
    label: 'Sans',
    stack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  { id: 'serif', label: 'Serif', stack: "Georgia, 'Times New Roman', serif" },
  { id: 'mono', label: 'Mono', stack: "ui-monospace, Consolas, monospace" },
]

const PAPER_SWATCHES: { color: string; label: string }[] = [
  { color: '#26252b', label: 'Abu gelap' },
  { color: '#f3ead8', label: 'Krem kertas' },
  { color: '#d8e2dc', label: 'Hijau sage' },
  { color: '#eddcd2', label: 'Persik lembut' },
  { color: '#dbe7f0', label: 'Biru pucat' },
  { color: '#1f2229', label: 'Arang malam' },
]

const TEXT_SWATCHES: { color: string; label: string }[] = [
  { color: '#f2f0f5', label: 'Putih lembut' },
  { color: '#1b1a1e', label: 'Tinta hitam' },
  { color: '#1d3557', label: 'Tinta biru' },
  { color: '#8c2f39', label: 'Tinta merah bata' },
]

function clampNotePosition(
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
) {
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

function findNoteIdAtPoint(clientX: number, clientY: number): string | null {
  const el = document.elementFromPoint(clientX, clientY)
  return el?.closest<HTMLElement>('[data-note-id]')?.dataset.noteId ?? null
}

function PushpinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 2.5h5l-.85 3.4 2.1 2.1v1.25H8.6v4.25L8 14.5l-.6-1V9.25H4.25V8l2.1-2.1L5.5 2.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PatternIcon({ pattern }: { pattern: PaperPattern }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      {pattern === 'garis' && (
        <path
          d="M4.5 5.5h7M4.5 8h7M4.5 10.5h7"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
      )}
      {pattern === 'titik' && (
        <g fill="currentColor">
          <circle cx="5.5" cy="5.5" r="0.8" />
          <circle cx="8" cy="5.5" r="0.8" />
          <circle cx="10.5" cy="5.5" r="0.8" />
          <circle cx="5.5" cy="8" r="0.8" />
          <circle cx="8" cy="8" r="0.8" />
          <circle cx="10.5" cy="8" r="0.8" />
          <circle cx="5.5" cy="10.5" r="0.8" />
          <circle cx="8" cy="10.5" r="0.8" />
          <circle cx="10.5" cy="10.5" r="0.8" />
        </g>
      )}
      {pattern === 'kotak' && (
        <path
          d="M6 2.5v11M10 2.5v11M2.5 6h11M2.5 10h11"
          stroke="currentColor"
          strokeWidth="1"
        />
      )}
    </svg>
  )
}

function FontIcon({ font }: { font: NoteFont }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {font === 'sans' && (
        <path
          d="M4.5 12.5 8 3.5l3.5 9M5.7 9.5h4.6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {font === 'serif' && (
        <>
          <path
            d="M4.5 12.5 8 3.5l3.5 9M5.7 9.5h4.6"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.2 12.5h2.6M10.2 12.5h2.6"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </>
      )}
      {font === 'mono' && (
        <path
          d="M5.5 4.5 2.5 8l3 3.5M10.5 4.5 13.5 8l-3 3.5M8.8 3.5 7.2 12.5"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [focusId, setFocusId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [pinMode, setPinMode] = useState(false)
  const [pinDrag, setPinDrag] = useState<PinDragPreview | null>(null)
  const [unpinDrag, setUnpinDrag] = useState<UnpinDragPreview | null>(null)
  const [justPinnedId, setJustPinnedId] = useState<string | null>(null)
  const [justUnpinnedId, setJustUnpinnedId] = useState<string | null>(null)
  const [customizingId, setCustomizingId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const nextZIndexRef = useRef(1)
  const dragRef = useRef<DragState | null>(null)
  const pinDragOriginRef = useRef<PinDragOrigin | null>(null)
  const unpinDragOriginRef = useRef<UnpinDragOrigin | null>(null)
  const skipNextPinClickRef = useRef(false)
  const skipNextUnpinClickRef = useRef(false)
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})
  const customizeBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const announceTimerRef = useRef<number | null>(null)
  const justPinnedTimerRef = useRef<number | null>(null)
  const justUnpinnedTimerRef = useRef<number | null>(null)

  const announce = useCallback((message: string) => {
    setAnnouncement(message)
    if (announceTimerRef.current !== null) {
      window.clearTimeout(announceTimerRef.current)
    }
    announceTimerRef.current = window.setTimeout(() => {
      setAnnouncement('')
    }, 1000)
  }, [])

  const triggerPinAnimation = useCallback((id: string) => {
    setJustPinnedId(id)
    if (justPinnedTimerRef.current !== null) {
      window.clearTimeout(justPinnedTimerRef.current)
    }
    justPinnedTimerRef.current = window.setTimeout(() => {
      setJustPinnedId(null)
    }, 300)
  }, [])

  const triggerUnpinAnimation = useCallback((id: string) => {
    setJustUnpinnedId(id)
    if (justUnpinnedTimerRef.current !== null) {
      window.clearTimeout(justUnpinnedTimerRef.current)
    }
    justUnpinnedTimerRef.current = window.setTimeout(() => {
      setJustUnpinnedId(null)
    }, 240)
  }, [])

  useEffect(() => {
    if (focusId && textareaRefs.current[focusId]) {
      textareaRefs.current[focusId]?.focus()
      setFocusId(null)
    }
  }, [focusId, notes])

  useEffect(() => {
    function handleResize() {
      setNotes((prev) =>
        prev.map((note) => {
          const el = cardRefs.current[note.id]
          const width = el?.offsetWidth ?? DEFAULT_CARD_WIDTH
          const height = el?.offsetHeight ?? DEFAULT_CARD_HEIGHT
          const clamped = clampNotePosition(note.x, note.y, width, height)
          if (clamped.x === note.x && clamped.y === note.y) {
            return note
          }
          return { ...note, x: clamped.x, y: clamped.y }
        }),
      )
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function bringToFront(id: string) {
    nextZIndexRef.current += 1
    const nextZ = nextZIndexRef.current
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, zIndex: nextZ } : note)),
    )
  }

  function handleAddNote() {
    const id = crypto.randomUUID()
    const offset = (notes.length % 6) * 24
    const initialX = Math.max(
      CANVAS_PADDING,
      Math.round(window.innerWidth / 2 - DEFAULT_CARD_WIDTH / 2) + offset - 48,
    )
    const initialY = Math.max(84, 96 + offset)
    const clamped = clampNotePosition(
      initialX,
      initialY,
      DEFAULT_CARD_WIDTH,
      DEFAULT_CARD_HEIGHT,
    )

    nextZIndexRef.current += 1
    const zIndex = nextZIndexRef.current

    setPinMode(false)
    setNotes((prev) => [
      ...prev,
      {
        id,
        text: '',
        x: clamped.x,
        y: clamped.y,
        zIndex,
        pinned: false,
        paperColor: '#26252b',
        textColor: null,
        pattern: 'polos',
        font: 'sans',
      },
    ])
    setFocusId(id)
  }

  function updateNoteStyle(
    id: string,
    patch: Partial<Pick<Note, 'paperColor' | 'textColor' | 'pattern' | 'font'>>,
  ) {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...patch } : note)),
    )
  }

  function pinNoteById(id: string) {
    const index = notes.findIndex((n) => n.id === id)
    if (index === -1) return

    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, pinned: true } : note)),
    )
    triggerPinAnimation(id)
    announce(`Catatan ${index + 1} ditempelkan ke mading`)
  }

  function handleTogglePin(id: string, index: number) {
    let nextPinned = false
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== id) return note
        nextPinned = !note.pinned
        return { ...note, pinned: nextPinned }
      }),
    )
    if (nextPinned) {
      triggerPinAnimation(id)
    } else {
      triggerUnpinAnimation(id)
    }
    setPinMode(false)
    announce(
      nextPinned
        ? `Catatan ${index + 1} ditempelkan ke mading`
        : `Paku pada catatan ${index + 1} dilepas`,
    )
  }

  function handleUpdateNote(id: string, text: string) {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, text } : note)),
    )
  }

  function handleDeleteNote(id: string) {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  function handlePinToolPointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    if (event.button !== 0) return
    pinDragOriginRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    }
    skipNextPinClickRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePinToolPointerMove(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    const origin = pinDragOriginRef.current
    if (!origin || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    const dx = event.clientX - origin.startClientX
    const dy = event.clientY - origin.startClientY

    if (!origin.moved && Math.hypot(dx, dy) < 4) return
    if (!origin.moved) {
      origin.moved = true
      skipNextPinClickRef.current = true
    }

    const targetNoteId = findNoteIdAtPoint(event.clientX, event.clientY)
    setPinDrag({
      clientX: event.clientX,
      clientY: event.clientY,
      targetNoteId,
    })
  }

  function handlePinToolPointerUp(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    const origin = pinDragOriginRef.current
    if (!origin) return

    if (origin.moved) {
      const targetNoteId = findNoteIdAtPoint(event.clientX, event.clientY)
      if (targetNoteId) {
        pinNoteById(targetNoteId)
      }
    }

    pinDragOriginRef.current = null
    setPinDrag(null)
  }

  function handlePinToolLostCapture() {
    pinDragOriginRef.current = null
    setPinDrag(null)
  }

  function handleNotePinPointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    noteId: string,
    noteIndex: number,
  ) {
    if (event.button !== 0) return
    event.stopPropagation()
    unpinDragOriginRef.current = {
      noteId,
      noteIndex,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
    }
    skipNextUnpinClickRef.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleNotePinPointerMove(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    const origin = unpinDragOriginRef.current
    if (!origin || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    const distance = Math.hypot(
      event.clientX - origin.startClientX,
      event.clientY - origin.startClientY,
    )

    if (!origin.moved && distance < 4) return
    if (!origin.moved) {
      origin.moved = true
      skipNextUnpinClickRef.current = true
    }

    setUnpinDrag({
      noteId: origin.noteId,
      clientX: event.clientX,
      clientY: event.clientY,
      detached: distance >= 20,
    })
  }

  function handleNotePinPointerUp(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    const origin = unpinDragOriginRef.current
    if (!origin) return

    const distance = Math.hypot(
      event.clientX - origin.startClientX,
      event.clientY - origin.startClientY,
    )

    if (origin.moved && distance >= 20) {
      unpinNoteById(origin.noteId, origin.noteIndex)
    }

    unpinDragOriginRef.current = null
    setUnpinDrag(null)
  }

  function handleNotePinLostCapture() {
    unpinDragOriginRef.current = null
    setUnpinDrag(null)
  }

  function unpinNoteById(id: string, index: number) {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, pinned: false } : note)),
    )
    triggerUnpinAnimation(id)
    announce(`Paku pada catatan ${index + 1} dilepas`)
  }

  function handleHandlePointerDown(
    event: React.PointerEvent<HTMLButtonElement>,
    note: Note,
  ) {
    if (event.button !== 0 || note.pinned || pinMode) return

    bringToFront(note.id)
    dragRef.current = {
      noteId: note.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originX: note.x,
      originY: note.y,
      moved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleHandlePointerMove(
    event: React.PointerEvent<HTMLButtonElement>,
    noteId: string,
  ) {
    const drag = dragRef.current
    if (!drag || drag.noteId !== noteId) return
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return

    const dx = event.clientX - drag.startClientX
    const dy = event.clientY - drag.startClientY

    if (!drag.moved && Math.hypot(dx, dy) < 4) return
    if (!drag.moved) {
      drag.moved = true
      setDraggingId(noteId)
    }

    const el = cardRefs.current[noteId]
    const width = el?.offsetWidth ?? DEFAULT_CARD_WIDTH
    const height = el?.offsetHeight ?? DEFAULT_CARD_HEIGHT
    const clamped = clampNotePosition(
      drag.originX + dx,
      drag.originY + dy,
      width,
      height,
    )

    setNotes((prev) =>
      prev.map((item) =>
        item.id === noteId ? { ...item, x: clamped.x, y: clamped.y } : item,
      ),
    )
  }

  function handleHandleLostCapture(noteId: string) {
    if (dragRef.current?.noteId === noteId) {
      dragRef.current = null
      setDraggingId(null)
    }
  }

  function handleHandleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    note: Note,
    index: number,
  ) {
    if (note.pinned) return

    const step = event.shiftKey ? KEYBOARD_FAST_STEP : KEYBOARD_STEP
    let dx = 0
    let dy = 0

    switch (event.key) {
      case 'ArrowLeft':
        dx = -step
        break
      case 'ArrowRight':
        dx = step
        break
      case 'ArrowUp':
        dy = -step
        break
      case 'ArrowDown':
        dy = step
        break
      default:
        return
    }

    event.preventDefault()
    const el = cardRefs.current[note.id]
    const width = el?.offsetWidth ?? DEFAULT_CARD_WIDTH
    const height = el?.offsetHeight ?? DEFAULT_CARD_HEIGHT
    const clamped = clampNotePosition(
      note.x + dx,
      note.y + dy,
      width,
      height,
    )

    nextZIndexRef.current += 1
    const nextZ = nextZIndexRef.current

    setNotes((prev) =>
      prev.map((item) =>
        item.id === note.id
          ? { ...item, x: clamped.x, y: clamped.y, zIndex: nextZ }
          : item,
      ),
    )
    announce(`Catatan ${index + 1} dipindahkan`)
  }

  function handleToolbarKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('button'),
    )
    const currentIndex = buttons.indexOf(
      document.activeElement as HTMLButtonElement,
    )
    if (currentIndex === -1) return

    event.preventDefault()
    const nextIndex =
      event.key === 'ArrowRight'
        ? (currentIndex + 1) % buttons.length
        : (currentIndex - 1 + buttons.length) % buttons.length
    buttons[nextIndex]?.focus()
  }

  return (
    <main
      className={`canvas${pinMode ? ' canvas--pin-mode' : ''}`}
      aria-label="Kanvas catatan"
    >
      <div className="visually-hidden" aria-live="polite">
        {announcement}
      </div>

      <div
        role="toolbar"
        aria-label="Alat kanvas"
        className="canvas-toolbar"
        onKeyDown={handleToolbarKeyDown}
      >
        <div role="group" aria-label="Alat tempel">
          <button
            type="button"
            className={`toolbar-btn toolbar-btn--pin${pinDrag ? ' dragging' : ''}`}
            aria-pressed={pinMode}
            aria-label="Alat paku: seret ke catatan atau klik untuk menempel dan melepas paku"
            title="Seret paku ke catatan atau klik untuk menempel/melepas paku"
            onPointerDown={handlePinToolPointerDown}
            onPointerMove={handlePinToolPointerMove}
            onPointerUp={handlePinToolPointerUp}
            onLostPointerCapture={handlePinToolLostCapture}
            onClick={() => {
              if (skipNextPinClickRef.current) {
                skipNextPinClickRef.current = false
                return
              }
              setPinMode((prev) => !prev)
            }}
          >
            <PushpinIcon />

          </button>
        </div>

        <span
          role="separator"
          aria-orientation="vertical"
          className="toolbar-separator"
        />

        <button
          type="button"
          className="toolbar-btn"
          onClick={handleAddNote}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 3.25v9.5M3.25 8h9.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          <span>Tambah catatan</span>
        </button>
      </div>

      {notes.map((note, index) => {
        const isDragging = draggingId === note.id
        const isPinTarget = pinDrag?.targetNoteId === note.id
        const isJustPinned = justPinnedId === note.id
        const isJustUnpinned = justUnpinnedId === note.id
        const isUnpinning = unpinDrag?.noteId === note.id
        const isCustomizing = customizingId === note.id
        const fontStack =
          NOTE_FONTS.find((f) => f.id === note.font)?.stack ??
          NOTE_FONTS[0].stack

        return (
          <article
            key={note.id}
            data-note-id={note.id}
            ref={(el) => {
              cardRefs.current[note.id] = el
            }}
            className={`note-card note-card--pattern-${note.pattern}${isDragging ? ' note-card--dragging' : ''}${note.pinned ? ' note-card--pinned' : ''}${isPinTarget ? ' note-card--pin-target' : ''}${isJustPinned ? ' note-card--just-pinned' : ''}${isJustUnpinned ? ' note-card--just-unpinned' : ''}`}
            style={
              {
                transform: `translate3d(${note.x}px, ${note.y}px, 0)`,
                zIndex: note.zIndex,
                '--note-bg': note.paperColor,
                '--note-font': fontStack,
                ...(note.textColor
                  ? { '--note-text-color': note.textColor }
                  : {}),
              } as React.CSSProperties
            }
            onPointerDown={(e) => {
              if (pinMode) {
                const target = e.target as HTMLElement
                if (
                  target.closest('.note-delete-btn') ||
                  target.closest('.note-customize-btn') ||
                  target.closest('.note-style-panel')
                ) {
                  return
                }
                e.preventDefault()
                handleTogglePin(note.id, index)
                return
              }
              bringToFront(note.id)
            }}
          >
            {isPinTarget && !note.pinned && (
              <span className="note-pin-target-ring" aria-hidden="true" />
            )}

            {note.pinned && (
              <button
                type="button"
                className={`note-pin-btn${isJustPinned ? ' note-pin-btn--just-pinned' : ''}${isUnpinning ? ' dragging' : ''}`}
                style={isUnpinning ? { opacity: 0 } : undefined}
                aria-label={`Lepas paku pada catatan ${index + 1}`}
                title="Klik atau seret keluar untuk melepas paku"
                onPointerDown={(e) => handleNotePinPointerDown(e, note.id, index)}
                onPointerMove={handleNotePinPointerMove}
                onPointerUp={handleNotePinPointerUp}
                onLostPointerCapture={handleNotePinLostCapture}
                onClick={(e) => {
                  e.stopPropagation()
                  if (skipNextUnpinClickRef.current) {
                    skipNextUnpinClickRef.current = false
                    return
                  }
                  handleTogglePin(note.id, index)
                }}
              >
                <PushpinIcon />
              </button>
            )}

            <div className="note-header">
              <button
                type="button"
                className={`note-drag-handle${isDragging ? ' dragging' : ''}`}
                aria-disabled={note.pinned || undefined}
                aria-label={
                  note.pinned
                    ? `Catatan ${index + 1} sedang dipaku ke mading`
                    : `Geser catatan ${index + 1}. Gunakan tombol panah untuk memindahkan.`
                }
                onPointerDown={(e) => handleHandlePointerDown(e, note)}
                onPointerMove={(e) => handleHandlePointerMove(e, note.id)}
                onLostPointerCapture={() => handleHandleLostCapture(note.id)}
                onKeyDown={(e) => handleHandleKeyDown(e, note, index)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <circle cx="5" cy="4.5" r="1.15" />
                  <circle cx="5" cy="8" r="1.15" />
                  <circle cx="5" cy="11.5" r="1.15" />
                  <circle cx="10" cy="4.5" r="1.15" />
                  <circle cx="10" cy="8" r="1.15" />
                  <circle cx="10" cy="11.5" r="1.15" />
                </svg>
              </button>
              <button
                type="button"
                ref={(el) => {
                  customizeBtnRefs.current[note.id] = el
                }}
                className="note-customize-btn"
                aria-expanded={isCustomizing}
                aria-label={`Ubah tampilan kertas catatan ${index + 1}`}
                title="Atur kertas dan tulisan"
                onClick={() =>
                  setCustomizingId((prev) =>
                    prev === note.id ? null : note.id,
                  )
                }
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="6" cy="6.5" r="1" fill="currentColor" />
                  <circle cx="9.8" cy="6.2" r="1" fill="currentColor" />
                  <circle cx="10.2" cy="9.8" r="1" fill="currentColor" />
                </svg>
              </button>
              <button
                type="button"
                className="note-delete-btn"
                aria-label={`Hapus catatan ${index + 1}`}
                onClick={() => handleDeleteNote(note.id)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 3.5l7 7M10.5 3.5l-7 7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {isCustomizing && (
              <div
                className="note-style-panel"
                role="region"
                aria-label={`Pengaturan kertas catatan ${index + 1}`}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.stopPropagation()
                    setCustomizingId(null)
                    customizeBtnRefs.current[note.id]?.focus()
                  }
                }}
              >
                <div className="style-section" role="group" aria-label="Pola kertas">
                  <span className="style-label-icon" title="Pola kertas" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="style-chips">
                    {PAPER_PATTERNS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="style-chip"
                        aria-label={`Pola ${item.label}`}
                        title={item.label}
                        aria-pressed={note.pattern === item.id}
                        onClick={() =>
                          updateNoteStyle(note.id, { pattern: item.id })
                        }
                      >
                        <PatternIcon pattern={item.id} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="style-section" role="group" aria-label="Gaya tulisan">
                  <span className="style-label-icon" title="Gaya tulisan" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 4h9M8 4v8.5M5.8 12.5h4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="style-chips">
                    {NOTE_FONTS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="style-chip"
                        aria-label={`Font ${item.label}`}
                        title={item.label}
                        aria-pressed={note.font === item.id}
                        onClick={() =>
                          updateNoteStyle(note.id, { font: item.id })
                        }
                      >
                        <FontIcon font={item.id} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="style-section" role="group" aria-label="Warna kertas">
                  <span className="style-label-icon" title="Warna kertas" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  </span>
                  <div className="style-swatches">
                    {PAPER_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        className="swatch-btn"
                        aria-label={`Warna kertas ${swatch.label}`}
                        title={swatch.label}
                        aria-pressed={note.paperColor === swatch.color}
                        style={{ backgroundColor: swatch.color }}
                        onClick={() =>
                          updateNoteStyle(note.id, {
                            paperColor: swatch.color,
                          })
                        }
                      />
                    ))}
                    <label className="color-picker-label" title="Pilih warna kertas kustom">
                      <input
                        type="color"
                        className="color-picker-input"
                        aria-label={`Pilih warna kertas kustom catatan ${index + 1}`}
                        value={note.paperColor}
                        onChange={(e) =>
                          updateNoteStyle(note.id, {
                            paperColor: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="style-section" role="group" aria-label="Warna tulisan">
                  <span className="style-label-icon" title="Warna tulisan" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M4.8 10.5 8 3l3.2 7.5M5.8 8.3h4.4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="style-swatches">
                    <button
                      type="button"
                      className="swatch-btn swatch-btn--auto"
                      aria-label="Warna tulisan otomatis"
                      title="Otomatis"
                      aria-pressed={note.textColor === null}
                      onClick={() =>
                        updateNoteStyle(note.id, { textColor: null })
                      }
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M8 2a6 6 0 0 1 0 12V2Z" fill="currentColor" />
                      </svg>
                    </button>
                    {TEXT_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        className="swatch-btn"
                        aria-label={`Warna tulisan ${swatch.label}`}
                        title={swatch.label}
                        aria-pressed={note.textColor === swatch.color}
                        style={{ backgroundColor: swatch.color }}
                        onClick={() =>
                          updateNoteStyle(note.id, {
                            textColor: swatch.color,
                          })
                        }
                      />
                    ))}
                    <label className="color-picker-label" title="Pilih warna tulisan kustom">
                      <input
                        type="color"
                        className="color-picker-input"
                        aria-label={`Pilih warna tulisan kustom catatan ${index + 1}`}
                        value={note.textColor ?? '#f2f0f5'}
                        onChange={(e) =>
                          updateNoteStyle(note.id, {
                            textColor: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            <textarea
              ref={(el) => {
                textareaRefs.current[note.id] = el
              }}
              className="note-textarea"
              value={note.text}
              readOnly={pinMode}
              onChange={(e) => handleUpdateNote(note.id, e.target.value)}
              placeholder="Tulis catatan..."
              aria-label={`Isi catatan ${index + 1}`}
            />
          </article>
        )
      })}

      {(pinDrag || unpinDrag) && (
        <div
          className="pin-drag-ghost"
          aria-hidden="true"
          style={{
            transform: `translate3d(${(pinDrag ?? unpinDrag)!.clientX - 16}px, ${(pinDrag ?? unpinDrag)!.clientY - 22}px, 0) rotate(${pinDrag?.targetNoteId || (unpinDrag && !unpinDrag.detached) ? '0deg' : '-12deg'})`,
          }}
        >
          <PushpinIcon size={24} />
        </div>
      )}
    </main>
  )
}

export default App
