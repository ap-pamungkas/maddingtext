import { memo } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { NOTE_FONTS } from '../constants'
import type { Note } from '../types'
import { calculateHangingAngle } from '../utils/boardUtils'
import { CloseIcon, GripIcon, PaletteIcon, RealisticPin } from './Icons'
import { NoteStylePanel } from './NoteStylePanel'

interface NoteCardProps {
  note: Note
  index: number
  isDragging: boolean
  isPinTarget: boolean
  isJustPinned: boolean
  isJustUnpinned: boolean
  isUnpinning: boolean
  isCustomizing: boolean
  pinMode: boolean
  onBringToFront: (id: string) => void
  onTogglePinFromBoard: (id: string, index: number, clientX?: number) => void
  onTogglePin: (id: string, index: number) => void
  onUpdateText: (id: string, text: string) => void
  onUpdateStyle: (
    id: string,
    patch: Partial<Pick<Note, 'paperColor' | 'textColor' | 'pattern' | 'font' | 'shape'>>,
  ) => void
  onDelete: (id: string) => void
  onToggleCustomize: (id: string) => void
  onCloseCustomize: () => void
  onHandlePointerDown: (event: PointerEvent<HTMLButtonElement>, note: Note) => void
  onHandlePointerMove: (event: PointerEvent<HTMLButtonElement>, noteId: string) => void
  onHandleLostCapture: (noteId: string) => void
  onHandleKeyDown: (event: KeyboardEvent<HTMLButtonElement>, note: Note, index: number) => void
  onNotePinPointerDown: (
    event: PointerEvent<HTMLButtonElement>,
    noteId: string,
    index: number,
  ) => void
  onNotePinPointerMove: (event: PointerEvent<HTMLButtonElement>) => void
  onNotePinPointerUp: (event: PointerEvent<HTMLButtonElement>) => void
  onNotePinLostCapture: () => void
  registerCardRef: (id: string, el: HTMLElement | null) => void
  registerTextareaRef: (id: string, el: HTMLTextAreaElement | null) => void
  registerCustomizeBtnRef: (id: string, el: HTMLButtonElement | null) => void
}

export const NoteCard = memo(function NoteCard({
  note,
  index,
  isDragging,
  isPinTarget,
  isJustPinned,
  isJustUnpinned,
  isUnpinning,
  isCustomizing,
  pinMode,
  onBringToFront,
  onTogglePinFromBoard,
  onTogglePin,
  onUpdateText,
  onUpdateStyle,
  onDelete,
  onToggleCustomize,
  onCloseCustomize,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandleLostCapture,
  onHandleKeyDown,
  onNotePinPointerDown,
  onNotePinPointerMove,
  onNotePinPointerUp,
  onNotePinLostCapture,
  registerCardRef,
  registerTextareaRef,
  registerCustomizeBtnRef,
}: NoteCardProps) {
  const fontStack =
    NOTE_FONTS.find((f) => f.id === note.font)?.stack ?? NOTE_FONTS[0].stack

  const pinXPos = note.pinX ?? 50
  const pinYPos = note.pinY ?? 12
  const angle = note.pinned
    ? calculateHangingAngle(pinXPos)
    : (note.rotation ?? 0)

  const cardStyle: CSSProperties = {
    transform: `translate3d(${note.x}px, ${note.y}px, 0) rotate(${angle}deg)`,
    transformOrigin: note.pinned ? `${pinXPos}% ${pinYPos}px` : '50% 50%',
    zIndex: note.zIndex,
    '--note-bg': note.paperColor,
    '--note-font': fontStack,
    ...(note.textColor ? { '--note-text-color': note.textColor } : {}),
  } as CSSProperties

  return (
    <article
      data-note-id={note.id}
      ref={(el) => registerCardRef(note.id, el)}
      className={`note-card note-card--shape-${note.shape || 'standar'} note-card--pattern-${note.pattern}${isDragging ? ' note-card--dragging' : ''}${note.pinned ? ' note-card--pinned' : ''}${isPinTarget ? ' note-card--pin-target' : ''}${isJustPinned ? ' note-card--just-pinned' : ''}${isJustUnpinned ? ' note-card--just-unpinned' : ''}`}
      style={cardStyle}
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
          onTogglePinFromBoard(note.id, index, e.clientX)
          return
        }
        onBringToFront(note.id)
      }}
    >
      {isPinTarget && !note.pinned && (
        <span className="note-pin-target-ring" aria-hidden="true" />
      )}

      {note.shape === 'lipat' && (
        <span className="note-paper-fold" aria-hidden="true" />
      )}

      {note.shape === 'sobek' && (
        <div className="note-paper-torn-edge" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
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
          onPointerDown={(e) => onHandlePointerDown(e, note)}
          onPointerMove={(e) => onHandlePointerMove(e, note.id)}
          onLostPointerCapture={() => onHandleLostCapture(note.id)}
          onKeyDown={(e) => onHandleKeyDown(e, note, index)}
        >
          <GripIcon />
        </button>

        <button
          type="button"
          ref={(el) => registerCustomizeBtnRef(note.id, el)}
          className="note-customize-btn"
          aria-expanded={isCustomizing}
          aria-label={`Ubah tampilan kertas catatan ${index + 1}`}
          title="Atur kertas dan tulisan"
          onClick={() => onToggleCustomize(note.id)}
        >
          <PaletteIcon />
        </button>

        <button
          type="button"
          className="note-delete-btn"
          aria-label={`Hapus catatan ${index + 1}`}
          onClick={() => onDelete(note.id)}
        >
          <CloseIcon />
        </button>
      </div>

      {isCustomizing && (
        <NoteStylePanel
          note={note}
          noteIndex={index}
          onUpdateStyle={(patch) => onUpdateStyle(note.id, patch)}
          onClose={onCloseCustomize}
        />
      )}

      <textarea
        ref={(el) => registerTextareaRef(note.id, el)}
        className="note-textarea"
        value={note.text}
        readOnly={pinMode}
        onChange={(e) => onUpdateText(note.id, e.target.value)}
        placeholder="Tulis catatan..."
        aria-label={`Isi catatan ${index + 1}`}
      />

      {note.pinned && (
        <>
          <span
            className="note-pin-hole"
            aria-hidden="true"
            style={{ left: `${pinXPos}%`, top: `${pinYPos}px` }}
          />
          <button
            type="button"
            className={`note-pin-btn${isJustPinned ? ' note-pin-btn--just-pinned' : ''}${isUnpinning ? ' dragging' : ''}`}
            style={{
              left: `${pinXPos}%`,
              ...(isUnpinning ? { opacity: 0 } : {}),
            }}
            aria-label={`Lepas paku pada catatan ${index + 1}`}
            title="Klik atau seret keluar untuk melepas paku"
            onPointerDown={(e) => onNotePinPointerDown(e, note.id, index)}
            onPointerMove={onNotePinPointerMove}
            onPointerUp={onNotePinPointerUp}
            onLostPointerCapture={onNotePinLostCapture}
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin(note.id, index)
            }}
          >
            <RealisticPin size={26} />
          </button>
        </>
      )}
    </article>
  )
})
