import { FitViewIcon, ZoomInIcon, ZoomOutIcon } from './Icons'

interface CanvasControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onFitView: () => void
}

export function CanvasControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
}: CanvasControlsProps) {
  const zoomPercent = Math.round(zoom * 100)

  return (
    <div
      className="canvas-controls"
      role="region"
      aria-label="Kontrol navigasi kanvas"
    >
      <div className="canvas-controls-bar">
        <button
          type="button"
          className="canvas-control-btn"
          onClick={onZoomOut}
          title="Perkecil kanvas (Zoom out)"
          aria-label="Perkecil kanvas"
        >
          <ZoomOutIcon />
        </button>

        <button
          type="button"
          className="canvas-control-btn canvas-control-btn--zoom-level"
          onClick={onResetZoom}
          title="Klik untuk reset zoom ke 100%"
          aria-label={`Zoom ${zoomPercent}%, klik untuk reset ke 100%`}
        >
          {zoomPercent}%
        </button>

        <button
          type="button"
          className="canvas-control-btn"
          onClick={onZoomIn}
          title="Perbesar kanvas (Zoom in)"
          aria-label="Perbesar kanvas"
        >
          <ZoomInIcon />
        </button>

        <span className="canvas-controls-divider" aria-hidden="true" />

        <button
          type="button"
          className="canvas-control-btn canvas-control-btn--fit"
          onClick={onFitView}
          title="Pusatkan semua catatan"
          aria-label="Pusatkan semua catatan"
        >
          <FitViewIcon />
          <span className="canvas-control-btn-label">Pusatkan</span>
        </button>
      </div>

      <div className="canvas-controls-hint" aria-hidden="true">
        <span>Scroll / Pinch untuk zoom • Drag kanvas kosong untuk geser</span>
      </div>
    </div>
  )
}
