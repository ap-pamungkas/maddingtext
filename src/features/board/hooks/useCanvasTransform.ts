import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import {
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_WIDTH,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from '../constants'
import type { CanvasPan, Note } from '../types'
import { clientToWorld } from '../utils/boardUtils'

interface PointerPoint {
  clientX: number
  clientY: number
}

interface PinchState {
  initialDistance: number
  initialZoom: number
  initialMidpoint: { x: number; y: number }
  initialPan: CanvasPan
}

interface UseCanvasTransformOptions {
  containerRef: RefObject<HTMLElement | null>
  isPinModeActive?: boolean
}

const STORAGE_KEY = 'maddingtext_canvas_view'

function getSavedTransform(): { pan: CanvasPan; zoom: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { pan?: CanvasPan; zoom?: number }
    if (
      parsed &&
      typeof parsed.zoom === 'number' &&
      parsed.pan &&
      typeof parsed.pan.x === 'number' &&
      typeof parsed.pan.y === 'number'
    ) {
      return {
        pan: { x: Math.round(parsed.pan.x), y: Math.round(parsed.pan.y) },
        zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parsed.zoom)),
      }
    }
  } catch {
    // Abaikan jika storage rusak
  }
  return null
}

export function useCanvasTransform({
  containerRef,
  isPinModeActive = false,
}: UseCanvasTransformOptions) {
  const initial = getSavedTransform() ?? {
    pan: { x: 0, y: 0 },
    zoom: DEFAULT_ZOOM,
  }

  const [pan, setPan] = useState<CanvasPan>(initial.pan)
  const [zoom, setZoom] = useState<number>(initial.zoom)
  const [isPanning, setIsPanning] = useState(false)

  const panRef = useRef<CanvasPan>(initial.pan)
  const zoomRef = useRef<number>(initial.zoom)

  useEffect(() => {
    panRef.current = pan
    zoomRef.current = zoom
  }, [pan, zoom])

  // Pelacak pointer aktif untuk gesture sentuhan (pinch-to-zoom multi-touch)
  const activePointersRef = useRef<Map<number, PointerPoint>>(new Map())
  const panStartRef = useRef<{ clientX: number; clientY: number; originPan: CanvasPan } | null>(
    null,
  )
  const pinchStateRef = useRef<PinchState | null>(null)

  // Simpan preferensi view secara debounced agar awet saat refresh
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ pan, zoom }),
        )
      } catch {
        // Abaikan
      }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [pan, zoom])

  // Zoom terpusat pada titik client (kursor mouse atau titik tengah dua jari)
  const zoomAroundClientPoint = useCallback(
    (newZoomRaw: number, clientX: number, clientY: number) => {
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoomRaw))
      const currentZoom = zoomRef.current
      const currentPan = panRef.current

      if (Math.abs(nextZoom - currentZoom) < 0.0001) return

      // Titik dunia sebelum zoom
      const world = clientToWorld(clientX, clientY, currentPan, currentZoom)

      // Hitung pan baru agar titik dunia tersebut tetap berada tepat di bawah clientX, clientY
      const nextPan: CanvasPan = {
        x: Math.round(clientX - world.x * nextZoom),
        y: Math.round(clientY - world.y * nextZoom),
      }

      zoomRef.current = nextZoom
      panRef.current = nextPan
      setZoom(nextZoom)
      setPan(nextPan)
    },
    [],
  )

  // Zoom in bertahap
  const zoomIn = useCallback(() => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    zoomAroundClientPoint(zoomRef.current * (1 + ZOOM_STEP), centerX, centerY)
  }, [zoomAroundClientPoint])

  // Zoom out bertahap
  const zoomOut = useCallback(() => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    zoomAroundClientPoint(zoomRef.current * (1 - ZOOM_STEP), centerX, centerY)
  }, [zoomAroundClientPoint])

  // Reset zoom ke 100%
  const resetZoom = useCallback(() => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    zoomAroundClientPoint(DEFAULT_ZOOM, centerX, centerY)
  }, [zoomAroundClientPoint])

  // Fit & center semua catatan ke viewport
  const fitToNotes = useCallback(
    (notes: Note[]) => {
      if (notes.length === 0) {
        setPan({ x: 0, y: 0 })
        setZoom(DEFAULT_ZOOM)
        return
      }

      let minX = Infinity
      let maxX = -Infinity
      let minY = Infinity
      let maxY = -Infinity

      for (const note of notes) {
        minX = Math.min(minX, note.x)
        maxX = Math.max(maxX, note.x + DEFAULT_CARD_WIDTH)
        minY = Math.min(minY, note.y)
        maxY = Math.max(maxY, note.y + DEFAULT_CARD_HEIGHT)
      }

      const contentW = Math.max(100, maxX - minX)
      const contentH = Math.max(100, maxY - minY)

      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      // Berikan padding agar catatan tidak menempel di tepi layar
      const horizontalPadding = Math.min(120, viewportW * 0.15)
      const verticalPadding = Math.min(140, viewportH * 0.15)

      const availableW = Math.max(100, viewportW - horizontalPadding * 2)
      const availableH = Math.max(100, viewportH - verticalPadding * 2)

      const fitZoomRaw = Math.min(availableW / contentW, availableH / contentH)
      const fitZoom = Math.min(1.2, Math.max(MIN_ZOOM, fitZoomRaw))

      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2

      const nextPan: CanvasPan = {
        x: Math.round(viewportW / 2 - centerX * fitZoom),
        y: Math.round(viewportH / 2 - centerY * fitZoom),
      }

      zoomRef.current = fitZoom
      panRef.current = nextPan
      setZoom(fitZoom)
      setPan(nextPan)
    },
    [],
  )

  // Titik tengah layar dalam koordinat dunia (untuk spawn catatan baru tepat di tengah pandangan pengguna)
  const getViewportCenterWorld = useCallback((): { x: number; y: number } => {
    const viewportCenterX = window.innerWidth / 2
    const viewportCenterY = window.innerHeight / 2
    return clientToWorld(viewportCenterX, viewportCenterY, panRef.current, zoomRef.current)
  }, [])

  // Event Wheel untuk Desktop (non-passive listener agar preventDefault bekerja mencegah browser scroll)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      // Abaikan jika scroll terjadi di dalam textarea atau dropdown menu yang bisa di-scroll
      const target = e.target as HTMLElement | null
      if (
        target?.closest('.note-textarea, .note-style-panel, .color-picker-input') &&
        target.scrollHeight > target.clientHeight
      ) {
        return
      }

      e.preventDefault()

      // Trackpad pinch zoom biasanya mengirimkan e.ctrlKey = true
      const zoomFactor = e.ctrlKey
        ? Math.exp(-e.deltaY * 0.01)
        : Math.exp(-e.deltaY * 0.0018)

      zoomAroundClientPoint(zoomRef.current * zoomFactor, e.clientX, e.clientY)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
    }
  }, [containerRef, zoomAroundClientPoint])

  // Pointer Down pada background kanvas
  const handleCanvasPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      // Jika mode paku aktif, atau klik berasal dari catatan / kontrol, biarkan interaksi lokal berjalan
      if (isPinModeActive) return

      const target = e.target as HTMLElement
      if (
        target.closest(
          '[data-note-id], button, input, textarea, .canvas-toolbar, .canvas-controls',
        )
      ) {
        return
      }

      // Hanya izinkan klik kiri (button 0) atau tombol tengah mouse (button 1) untuk pan
      if (e.button !== 0 && e.button !== 1) return

      activePointersRef.current.set(e.pointerId, {
        clientX: e.clientX,
        clientY: e.clientY,
      })

      const pointers = Array.from(activePointersRef.current.values())

      if (pointers.length === 1) {
        // Mulai single-finger / single-mouse pan
        panStartRef.current = {
          clientX: e.clientX,
          clientY: e.clientY,
          originPan: { ...panRef.current },
        }
        setIsPanning(true)
        e.currentTarget.setPointerCapture(e.pointerId)
      } else if (pointers.length === 2) {
        // Mulai two-finger pinch-to-zoom
        const [p1, p2] = pointers
        const distance = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY)
        const midpoint = {
          x: (p1.clientX + p2.clientX) / 2,
          y: (p1.clientY + p2.clientY) / 2,
        }

        pinchStateRef.current = {
          initialDistance: Math.max(10, distance),
          initialZoom: zoomRef.current,
          initialMidpoint: midpoint,
          initialPan: { ...panRef.current },
        }
        panStartRef.current = null
        setIsPanning(true)
      }
    },
    [isPinModeActive],
  )

  // Pointer Move pada background kanvas
  const handleCanvasPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return

    activePointersRef.current.set(e.pointerId, {
      clientX: e.clientX,
      clientY: e.clientY,
    })

    const pointers = Array.from(activePointersRef.current.values())

    // Two-finger pinch-to-zoom gesture
    if (pointers.length >= 2 && pinchStateRef.current) {
      const [p1, p2] = pointers
      const currentDistance = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY)
      const currentMidpoint = {
        x: (p1.clientX + p2.clientX) / 2,
        y: (p1.clientY + p2.clientY) / 2,
      }

      const { initialDistance, initialZoom, initialMidpoint, initialPan } =
        pinchStateRef.current

      const ratio = currentDistance / initialDistance
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, initialZoom * ratio))

      // Titik dunia di bawah titik tengah awal
      const worldMidX = (initialMidpoint.x - initialPan.x) / initialZoom
      const worldMidY = (initialMidpoint.y - initialPan.y) / initialZoom

      // Pan baru yang mengikuti zoom dan perpindahan kedua jari
      const nextPanX = Math.round(currentMidpoint.x - worldMidX * nextZoom)
      const nextPanY = Math.round(currentMidpoint.y - worldMidY * nextZoom)

      zoomRef.current = nextZoom
      panRef.current = { x: nextPanX, y: nextPanY }
      setZoom(nextZoom)
      setPan({ x: nextPanX, y: nextPanY })
      return
    }

    // Single pointer pan
    if (pointers.length === 1 && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.clientX
      const dy = e.clientY - panStartRef.current.clientY

      const nextPan = {
        x: Math.round(panStartRef.current.originPan.x + dx),
        y: Math.round(panStartRef.current.originPan.y + dy),
      }
      panRef.current = nextPan
      setPan(nextPan)
    }
  }, [])

  // Selesai pointer gesture
  const handleCanvasPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      activePointersRef.current.delete(e.pointerId)
      const remaining = Array.from(activePointersRef.current.values())

      if (remaining.length === 0) {
        panStartRef.current = null
        pinchStateRef.current = null
        setIsPanning(false)
      } else if (remaining.length === 1) {
        // Jika dari 2 jari tersisa 1 jari, ganti origin pan ke jari yang masih menempel
        const [only] = remaining
        panStartRef.current = {
          clientX: only.clientX,
          clientY: only.clientY,
          originPan: { ...panRef.current },
        }
        pinchStateRef.current = null
      }
    },
    [],
  )

  return {
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
  }
}
