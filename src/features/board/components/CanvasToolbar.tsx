import type { KeyboardEvent, PointerEvent } from 'react'
import { PlusIcon, PushpinIcon } from './Icons'

interface CanvasToolbarProps {
  pinMode: boolean
  isPinDragging: boolean
  onPinToolPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
  onPinToolPointerMove: (event: PointerEvent<HTMLButtonElement>) => void
  onPinToolPointerUp: (event: PointerEvent<HTMLButtonElement>) => void
  onPinToolLostCapture: () => void
  onTogglePinMode: () => void
  onAddNote: () => void
}

export function CanvasToolbar({
  pinMode,
  isPinDragging,
  onPinToolPointerDown,
  onPinToolPointerMove,
  onPinToolPointerUp,
  onPinToolLostCapture,
  onTogglePinMode,
  onAddNote,
}: CanvasToolbarProps) {
  function handleToolbarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
    <div
      role="toolbar"
      aria-label="Alat kanvas"
      className="canvas-toolbar"
      onKeyDown={handleToolbarKeyDown}
    >
      <div role="group" aria-label="Alat tempel">
        <button
          type="button"
          className={`toolbar-btn toolbar-btn--pin${isPinDragging ? ' dragging' : ''}`}
          aria-pressed={pinMode}
          aria-label="Alat paku: seret ke catatan atau klik untuk menempel dan melepas paku"
          title="Seret paku ke catatan atau klik untuk menempel/melepas paku"
          onPointerDown={onPinToolPointerDown}
          onPointerMove={onPinToolPointerMove}
          onPointerUp={onPinToolPointerUp}
          onLostPointerCapture={onPinToolLostCapture}
          onClick={onTogglePinMode}
        >
          <PushpinIcon />
        </button>
      </div>

      <span
        role="separator"
        aria-orientation="vertical"
        className="toolbar-separator"
      />

      <button type="button" className="toolbar-btn" onClick={onAddNote}>
        <PlusIcon />
        <span>Tambah catatan</span>
      </button>
    </div>
  )
}

