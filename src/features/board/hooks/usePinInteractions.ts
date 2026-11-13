import { useCallback, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type {
  PinDragOrigin,
  PinDragPreview,
  UnpinDragOrigin,
  UnpinDragPreview,
} from '../types'
import { findNoteIdAtPoint } from '../utils/boardUtils'

interface UsePinInteractionsProps {
  onPinNote: (id: string) => void
  onUnpinNote: (id: string, index: number) => void
}

export function usePinInteractions({
  onPinNote,
  onUnpinNote,
}: UsePinInteractionsProps) {
  const [pinMode, setPinMode] = useState(false)
  const [pinDrag, setPinDrag] = useState<PinDragPreview | null>(null)
  const [unpinDrag, setUnpinDrag] = useState<UnpinDragPreview | null>(null)

  const pinDragOriginRef = useRef<PinDragOrigin | null>(null)
  const unpinDragOriginRef = useRef<UnpinDragOrigin | null>(null)
  const skipNextPinClickRef = useRef(false)
  const skipNextUnpinClickRef = useRef(false)

  const togglePinMode = useCallback(() => {
    if (skipNextPinClickRef.current) {
      skipNextPinClickRef.current = false
      return
    }
    setPinMode((prev) => !prev)
  }, [])

  const deactivatePinMode = useCallback(() => {
    setPinMode(false)
  }, [])

  const handlePinToolPointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return
      pinDragOriginRef.current = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        moved: false,
      }
      skipNextPinClickRef.current = false
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [],
  )

  const handlePinToolPointerMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
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
    },
    [],
  )

  const handlePinToolPointerUp = useCallback(() => {
    const origin = pinDragOriginRef.current
    if (!origin) return

    if (origin.moved) {
      const targetNoteId = findNoteIdAtPoint(
        pinDragOriginRef.current?.startClientX ?? 0,
        pinDragOriginRef.current?.startClientY ?? 0,
      )
      // Read current pointer location from pinDrag if available
      setPinDrag((currentDrag) => {
        const dropTargetId = currentDrag
          ? findNoteIdAtPoint(currentDrag.clientX, currentDrag.clientY)
          : targetNoteId
        if (dropTargetId) {
          onPinNote(dropTargetId)
        }
        return null
      })
    } else {
      setPinDrag(null)
    }

    pinDragOriginRef.current = null
  }, [onPinNote])

  const handlePinToolLostCapture = useCallback(() => {
    pinDragOriginRef.current = null
    setPinDrag(null)
  }, [])

  const handleNotePinPointerDown = useCallback(
    (
      event: PointerEvent<HTMLButtonElement>,
      noteId: string,
      noteIndex: number,
    ) => {
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
    },
    [],
  )

  const handleNotePinPointerMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
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
    },
    [],
  )

  const handleNotePinPointerUp = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      const origin = unpinDragOriginRef.current
      if (!origin) return

      const distance = Math.hypot(
        event.clientX - origin.startClientX,
        event.clientY - origin.startClientY,
      )

      if (origin.moved && distance >= 20) {
        onUnpinNote(origin.noteId, origin.noteIndex)
        deactivatePinMode()
      }

      unpinDragOriginRef.current = null
      setUnpinDrag(null)
    },
    [deactivatePinMode, onUnpinNote],
  )

  const handleNotePinLostCapture = useCallback(() => {
    unpinDragOriginRef.current = null
    setUnpinDrag(null)
  }, [])

  return {
    pinMode,
    pinDrag,
    unpinDrag,
    togglePinMode,
    deactivatePinMode,
    handlePinToolPointerDown,
    handlePinToolPointerMove,
    handlePinToolPointerUp,
    handlePinToolLostCapture,
    handleNotePinPointerDown,
    handleNotePinPointerMove,
    handleNotePinPointerUp,
    handleNotePinLostCapture,
  }
}

