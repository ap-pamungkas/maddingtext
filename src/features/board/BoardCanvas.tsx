import { useCallback, useRef } from 'react'
import type { PointerEvent } from 'react'
import { CanvasControls } from './components/CanvasControls'
import { CanvasToolbar } from './components/CanvasToolbar'
import { NoteCard } from './components/NoteCard'
import { PinDragGhost } from './components/PinDragGhost'
import { useBoardNotes } from './hooks/useBoardNotes'
import { useCanvasTransform } from './hooks/useCanvasTransform'
import { usePinInteractions } from './hooks/usePinInteractions'
import type { Note } from './types'
import { calculatePinDropPosition } from './utils/boardUtils'

export function BoardCanvas() {
  const containerRef = useRef<HTMLElement | null>(null)

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

  const {
    pan,
    zoom,
    isPanning,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToNotes,
    getViewportCenterWorld,
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
  } = useCanvasTransform({
    containerRef,
    isPinModeActive: pinMode,
  })

  const handleAddNote = useCallback(() => {
    deactivatePinMode()
    const center = getViewportCenterWorld()
    addNote(center)
  }, [addNote, deactivatePinMode, getViewportCenterWorld])

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

  const onCardHandlePointerMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>, noteId: string) => {
      handleHandlePointerMove(event, noteId, zoom)
    },
    [handleHandlePointerMove, zoom],
  )

  const activeGhost = pinDrag ?? unpinDrag

  return (
    <main
      ref={containerRef}
      className={`canvas${pinMode ? ' canvas--pin-mode' : ''}${isPanning ? ' canvas--panning' : ''}`}
      aria-label="Kanvas catatan mading tak hingga"
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onPointerCancel={handleCanvasPointerUp}
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

      <CanvasControls
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onFitView={() => fitToNotes(notes)}
      />

      <div
        className="canvas-world"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
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
            onHandlePointerMove={onCardHandlePointerMove}
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
      </div>

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

