import {
  NOTE_FONTS,
  PAPER_PATTERNS,
  PAPER_SWATCHES,
  TEXT_SWATCHES,
} from '../constants'
import type { Note } from '../types'
import { FontIcon, PatternIcon } from './Icons'

interface NoteStylePanelProps {
  note: Note
  noteIndex: number
  onUpdateStyle: (
    patch: Partial<Pick<Note, 'paperColor' | 'textColor' | 'pattern' | 'font'>>,
  ) => void
  onClose: () => void
}

export function NoteStylePanel({
  note,
  noteIndex,
  onUpdateStyle,
  onClose,
}: NoteStylePanelProps) {
  return (
    <div
      className="note-style-panel"
      role="region"
      aria-label={`Pengaturan kertas catatan ${noteIndex + 1}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onClose()
        }
      }}
    >
      <div className="style-section" role="group" aria-label="Pola kertas">
        <span className="style-label-icon" title="Pola kertas" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect
              x="2.5"
              y="2.5"
              width="11"
              height="11"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M5 6h6M5 8.5h6M5 11h4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
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
              onClick={() => onUpdateStyle({ pattern: item.id })}
            >
              <PatternIcon pattern={item.id} />
            </button>
          ))}
        </div>
      </div>

      <div className="style-section" role="group" aria-label="Gaya tulisan">
        <span className="style-label-icon" title="Gaya tulisan" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 4h9M8 4v8.5M5.8 12.5h4.4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
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
              onClick={() => onUpdateStyle({ font: item.id })}
            >
              <FontIcon font={item.id} />
            </button>
          ))}
        </div>
      </div>

      <div className="style-section" role="group" aria-label="Warna kertas">
        <span className="style-label-icon" title="Warna kertas" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect
              x="2.5"
              y="2.5"
              width="11"
              height="11"
              rx="2"
              fill="currentColor"
              fillOpacity="0.25"
              stroke="currentColor"
              strokeWidth="1.3"
            />
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
              onClick={() => onUpdateStyle({ paperColor: swatch.color })}
            />
          ))}
          <label className="color-picker-label" title="Pilih warna kertas kustom">
            <input
              type="color"
              className="color-picker-input"
              aria-label={`Pilih warna kertas kustom catatan ${noteIndex + 1}`}
              value={note.paperColor}
              onChange={(e) => onUpdateStyle({ paperColor: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="style-section" role="group" aria-label="Warna tulisan">
        <span className="style-label-icon" title="Warna tulisan" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M4.8 10.5 8 3l3.2 7.5M5.8 8.3h4.4"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 13h10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div className="style-swatches">
          <button
            type="button"
            className="swatch-btn swatch-btn--auto"
            aria-label="Warna tulisan otomatis"
            title="Otomatis"
            aria-pressed={note.textColor === null}
            onClick={() => onUpdateStyle({ textColor: null })}
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
              onClick={() => onUpdateStyle({ textColor: swatch.color })}
            />
          ))}
          <label className="color-picker-label" title="Pilih warna tulisan kustom">
            <input
              type="color"
              className="color-picker-input"
              aria-label={`Pilih warna tulisan kustom catatan ${noteIndex + 1}`}
              value={note.textColor ?? '#f2f0f5'}
              onChange={(e) => onUpdateStyle({ textColor: e.target.value })}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

