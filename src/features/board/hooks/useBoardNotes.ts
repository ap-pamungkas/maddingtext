import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import {
  CANVAS_PADDING,
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_WIDTH,
  KEYBOARD_FAST_STEP,
  KEYBOARD_STEP,
} from '../constants'
import type { DragState, Note } from '../types'
import { clampNotePosition } from '../utils/boardUtils'
import {
  fetchNotesFromSheets,
  isSheetsConfigured,
  saveNotesToSheets,
} from '../../../lib/sheetsService'

export function useBoardNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [focusId, setFocusId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [justPinnedId, setJustPinnedId] = useState<string | null>(null)
  const [justUnpinnedId, setJustUnpinnedId] = useState<string | null>(null)
  const [customizingId, setCustomizingId] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const nextZIndexRef = useRef(1)
  const isLoadedRef = useRef(false)
  const saveTimeoutRef = useRef<number | null>(null)
  const dragRef = useRef<DragState | null>(null)
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

  // Memuat data pertama kali dari Google Sheets jika URL sudah diset
  useEffect(() => {
    let active = true

    async function loadRemoteNotes() {
      if (!isSheetsConfigured()) {
        isLoadedRef.current = true
        return
      }

      announce('Memuat catatan dari Google Sheets...')
      const remoteNotes = await fetchNotesFromSheets()

      if (active && remoteNotes) {
        setNotes(remoteNotes)
        const maxZ = remoteNotes.reduce((max, n) => Math.max(max, n.zIndex), 0)
        if (maxZ > 0) {
          nextZIndexRef.current = maxZ + 1
        }
        announce(`Memuat ${remoteNotes.length} catatan dari Google Sheets`)
      }
      isLoadedRef.current = true
    }

    loadRemoteNotes()

    return () => {
      active = false
    }
  }, [announce])

  // Sinkronisasi otomatis ke Google Sheets setiap kali notes berubah (debounced 1 detik)
  useEffect(() => {
    if (!isLoadedRef.current || !isSheetsConfigured()) {
      return
    }

    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      await saveNotesToSheets(notes)
    }, 1000)

    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [notes])

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

  const bringToFront = useCallback((id: string) => {
    nextZIndexRef.current += 1
    const nextZ = nextZIndexRef.current
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, zIndex: nextZ } : note)),
    )
  }, [])

  const addNote = useCallback(() => {
    const id = crypto.randomUUID()
    setNotes((prev) => {
      const offset = (prev.length % 6) * 24
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

      const randomTilt = Math.round((Math.random() * 3.6 - 1.8) * 10) / 10

      return [
        ...prev,
        {
          id,
          text: '',
          x: clamped.x,
          y: clamped.y,
          zIndex,
          pinned: false,
          paperColor: '#FFE27A',
          textColor: null,
          pattern: 'polos',
          font: 'sans',
          shape: 'standar',
          rotation: randomTilt,
          pinX: 50,
          pinY: 12,
        },
      ]
    })
    setFocusId(id)
  }, [])

  const updateNoteStyle = useCallback(
    (
      id: string,
      patch: Partial<Pick<Note, 'paperColor' | 'textColor' | 'pattern' | 'font' | 'shape'>>,
    ) => {
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, ...patch } : note)),
      )
    },
    [],
  )

  const pinNoteById = useCallback(
    (id: string, coords?: { pinX: number; pinY: number }) => {
      setNotes((prev) => {
        const index = prev.findIndex((n) => n.id === id)
        if (index === -1) return prev
        triggerPinAnimation(id)
        announce(`Catatan ${index + 1} ditempelkan ke mading`)
        return prev.map((note) =>
          note.id === id
            ? {
                ...note,
                pinned: true,
                pinX: coords ? coords.pinX : (note.pinX ?? 50),
                pinY: coords ? coords.pinY : (note.pinY ?? 12),
              }
            : note,
        )
      })
    },
    [announce, triggerPinAnimation],
  )

  const unpinNoteById = useCallback(
    (id: string, index: number) => {
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, pinned: false } : note)),
      )
      triggerUnpinAnimation(id)
      announce(`Paku pada catatan ${index + 1} dilepas`)
    },
    [announce, triggerUnpinAnimation],
  )

  const togglePin = useCallback(
    (id: string, index: number, coords?: { pinX: number; pinY: number }) => {
      let nextPinned = false
      setNotes((prev) =>
        prev.map((note) => {
          if (note.id !== id) return note
          nextPinned = !note.pinned
          return {
            ...note,
            pinned: nextPinned,
            pinX: nextPinned && coords ? coords.pinX : (note.pinX ?? 50),
            pinY: nextPinned && coords ? coords.pinY : (note.pinY ?? 12),
          }
        }),
      )
      if (nextPinned) {
        triggerPinAnimation(id)
      } else {
        triggerUnpinAnimation(id)
      }
      announce(
        nextPinned
          ? `Catatan ${index + 1} ditempelkan ke mading`
          : `Paku pada catatan ${index + 1} dilepas`,
      )
    },
    [announce, triggerPinAnimation, triggerUnpinAnimation],
  )

  const updateNoteText = useCallback((id: string, text: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, text } : note)),
    )
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])

  const toggleCustomize = useCallback((id: string) => {
    setCustomizingId((prev) => (prev === id ? null : id))
  }, [])

  const closeCustomize = useCallback(() => {
    if (customizingId && customizeBtnRefs.current[customizingId]) {
      customizeBtnRefs.current[customizingId]?.focus()
    }
    setCustomizingId(null)
  }, [customizingId])

  const handleHandlePointerDown = useCallback(
    (
      event: PointerEvent<HTMLButtonElement>,
      note: Note,
      isPinModeActive: boolean,
    ) => {
      if (event.button !== 0 || note.pinned || isPinModeActive) return

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
    },
    [bringToFront],
  )

  const handleHandlePointerMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>, noteId: string) => {
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
    },
    [],
  )

  const handleHandleLostCapture = useCallback((noteId: string) => {
    if (dragRef.current?.noteId === noteId) {
      dragRef.current = null
      setDraggingId(null)
    }
  }, [])

  const handleHandleKeyDown = useCallback(
    (
      event: KeyboardEvent<HTMLButtonElement>,
      note: Note,
      index: number,
    ) => {
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
    },
    [announce],
  )

  const registerCardRef = useCallback((id: string, el: HTMLElement | null) => {
    cardRefs.current[id] = el
  }, [])

  const registerTextareaRef = useCallback(
    (id: string, el: HTMLTextAreaElement | null) => {
      textareaRefs.current[id] = el
    },
    [],
  )

  const registerCustomizeBtnRef = useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      customizeBtnRefs.current[id] = el
    },
    [],
  )

  const getCardRect = useCallback((id: string): DOMRect | null => {
    return cardRefs.current[id]?.getBoundingClientRect() ?? null
  }, [])

  return {
    notes,
    draggingId,
    justPinnedId,
    justUnpinnedId,
    customizingId,
    announcement,
    addNote,
    updateNoteText,
    updateNoteStyle,
    deleteNote,
    pinNoteById,
    unpinNoteById,
    togglePin,
    bringToFront,
    toggleCustomize,
    closeCustomize,
    handleHandlePointerDown,
    handleHandlePointerMove,
    handleHandleLostCapture,
    handleHandleKeyDown,
    registerCardRef,
    registerTextareaRef,
    registerCustomizeBtnRef,
    getCardRect,
  }
}

