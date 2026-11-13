import { useCallback } from 'react'
import type { PointerEvent } from 'react'
import { CanvasToolbar } from './components/CanvasToolbar'
import { NoteCard } from './components/NoteCard'
import { PinDragGhost } from './components/PinDragGhost'
import { useBoardNotes } from './hooks/useBoardNotes'
import { usePinInteractions } from './hooks/usePinInteractions'
import type { Note } from './types'
import { calculatePinDropPosition } from './utils/boardUtils'

export function BoardCanvas() {
  const {
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
  } = useBoardNotes()

  const handlePinNote = useCallback(
    (id: string, clientX?: number) => {
      let pinCoords: { pinX: number; pinY: number } | undefined
      if (clientX !== undefined) {
        const rect = getCardRect(id)
        if (rect) {
          pinCoords = calculatePinDropPosition(clientX, rect)
        }
      }
      pinNoteById(id, pinCoords)
    },
    [getCardRect, pinNoteById],
  )

  const {
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
  } = usePinInteractions({
    onPinNote: handlePinNote,
    onUnpinNote: unpinNoteById,
  })

  const handleAddNote = useCallback(() => {
    deactivatePinMode()
    addNote()
  }, [addNote, deactivatePinMode])

  const handleTogglePinFromBoard = useCallback(
    (id: string, index: number, clientX?: number) => {
      let pinCoords: { pinX: number; pinY: number } | undefined
      if (clientX !== undefined) {
        const rect = getCardRect(id)
        if (rect) {
          pinCoords = calculatePinDropPosition(clientX, rect)
        }
      }
      togglePin(id, index, pinCoords)
      deactivatePinMode()
    },
    [deactivatePinMode, getCardRect, togglePin],
  )

  const handleTogglePinDirect = useCallback(
    (id: string, index: number) => {
      togglePin(id, index)
      deactivatePinMode()
    },
    [deactivatePinMode, togglePin],
  )

  const onCardHandlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>, note: Note) => {
      handleHandlePointerDown(event, note, pinMode)
    },
    [handleHandlePointerDown, pinMode],
  )

  const activeGhost = pinDrag ?? unpinDrag

  return (
    <main
      className={`canvas${pinMode ? ' canvas--pin-mode' : ''}`}
      aria-label="Kanvas catatan"
    >
      <div className="visually-hidden" aria-live="polite">
        {announcement}
      </div>

      <CanvasToolbar
        pinMode={pinMode}
        isPinDragging={Boolean(pinDrag)}
        onPinToolPointerDown={handlePinToolPointerDown}
        onPinToolPointerMove={handlePinToolPointerMove}
        onPinToolPointerUp={handlePinToolPointerUp}
        onPinToolLostCapture={handlePinToolLostCapture}
        onTogglePinMode={togglePinMode}
        onAddNote={handleAddNote}
      />

      {notes.map((note, index) => (
        <NoteCard
          key={note.id}
          note={note}
          index={index}
          isDragging={draggingId === note.id}
          isPinTarget={pinDrag?.targetNoteId === note.id}
          isJustPinned={justPinnedId === note.id}
          isJustUnpinned={justUnpinnedId === note.id}
          isUnpinning={unpinDrag?.noteId === note.id}
          isCustomizing={customizingId === note.id}
          pinMode={pinMode}
          onBringToFront={bringToFront}
          onTogglePinFromBoard={handleTogglePinFromBoard}
          onTogglePin={handleTogglePinDirect}
          onUpdateText={updateNoteText}
          onUpdateStyle={updateNoteStyle}
          onDelete={deleteNote}
          onToggleCustomize={toggleCustomize}
          onCloseCustomize={closeCustomize}
          onHandlePointerDown={onCardHandlePointerDown}
          onHandlePointerMove={handleHandlePointerMove}
          onHandleLostCapture={handleHandleLostCapture}
          onHandleKeyDown={handleHandleKeyDown}
          onNotePinPointerDown={handleNotePinPointerDown}
          onNotePinPointerMove={handleNotePinPointerMove}
          onNotePinPointerUp={handleNotePinPointerUp}
          onNotePinLostCapture={handleNotePinLostCapture}
          registerCardRef={registerCardRef}
          registerTextareaRef={registerTextareaRef}
          registerCustomizeBtnRef={registerCustomizeBtnRef}
        />
      ))}

      {activeGhost && (
        <PinDragGhost
          clientX={activeGhost.clientX}
          clientY={activeGhost.clientY}
          isOverTarget={
            Boolean(pinDrag?.targetNoteId) ||
            Boolean(unpinDrag && !unpinDrag.detached)
          }
        />
      )}
    </main>
  )
}

