import { useId } from 'react'
import type { NoteFont, PaperPattern, PaperShape } from '../types'

export function PushpinIcon({ size = 16 }: { size?: number }) {
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

export function RealisticPin({
  size = 28,
  color = 'var(--pin-accent, #d4a36a)',
}: {
  size?: number
  color?: string
}) {
  const id = useId().replace(/:/g, '')

  return (
    <svg
      width={size}
      height={Math.round((size * 32) / 28)}
      viewBox="0 0 28 32"
      fill="none"
      aria-hidden="true"
      className="realistic-pin-svg"
    >
      <defs>
        {/* Cast shadow under pin (falls down & right) */}
        <radialGradient
          id={`pin-shadow-${id}`}
          cx="45%"
          cy="45%"
          r="50%"
        >
          <stop offset="0%" stopColor="#000" stopOpacity="0.38" />
          <stop offset="65%" stopColor="#000" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        {/* Dome head 3D sphere gradient with light from upper-left */}
        <radialGradient
          id={`pin-dome-${id}`}
          cx="36%"
          cy="32%"
          r="58%"
          fx="32%"
          fy="28%"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="28%" stopColor={color} stopOpacity="1" />
          <stop offset="85%" stopColor={color} stopOpacity="0.88" />
          <stop offset="100%" stopColor="#1a0f05" stopOpacity="0.5" />
        </radialGradient>

        {/* Metallic needle gradient */}
        <linearGradient id={`pin-needle-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#636c75" />
          <stop offset="45%" stopColor="#d5dce2" />
          <stop offset="100%" stopColor="#41484f" />
        </linearGradient>

        {/* Waist & collar shading */}
        <linearGradient id={`pin-waist-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="35%" stopColor={color} stopOpacity="0.9" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* 1. Cast shadow on paper (offset down-right) */}
      <ellipse
        cx="18.5"
        cy="26"
        rx="7"
        ry="3.5"
        fill={`url(#pin-shadow-${id})`}
      />

      {/* 2. Steel needle entering cork */}
      <polygon
        points="13,20 15,20 14,27"
        fill={`url(#pin-needle-${id})`}
      />

      {/* 3. Base flange ring / collar */}
      <ellipse
        cx="14"
        cy="20.5"
        rx="5.8"
        ry="2.2"
        fill={`url(#pin-waist-${id})`}
        stroke="#1a120b"
        strokeWidth="0.5"
        strokeOpacity="0.5"
      />

      {/* 4. Tapered stem / waist */}
      <path
        d="M10.8 13.5 C10.8 17.5 11.2 19 11.5 20 L16.5 20 C16.8 19 17.2 17.5 17.2 13.5 Z"
        fill={`url(#pin-waist-${id})`}
      />

      {/* 5. Main spherical dome head */}
      <ellipse
        cx="14"
        cy="10"
        rx="8.5"
        ry="8"
        fill={`url(#pin-dome-${id})`}
      />

      {/* 6. Crisp specular highlight glint at upper-left */}
      <ellipse
        cx="11.5"
        cy="7.5"
        rx="3.2"
        ry="2"
        transform="rotate(-25 11.5 7.5)"
        fill="#ffffff"
        fillOpacity="0.55"
      />
    </svg>
  )
}

export function ShapeIcon({ shape }: { shape: PaperShape }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {shape === 'standar' && (
        <rect
          x="2.5"
          y="2.5"
          width="11"
          height="11"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      )}
      {shape === 'lipat' && (
        <>
          <path
            d="M2.5 2.5h11v7l-4 4h-7z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 9.5h4l-4 4v-4z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </>
      )}
      {shape === 'sobek' && (
        <path
          d="M2.5 5 4 3.5 5.5 5 7 3.5 8.5 5 10 3.5 11.5 5 13 3.5l.5 10H2.5z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      )}
      {shape === 'lengkung' && (
        <>
          <path
            d="M2.5 2.5h11v9.5c-2.5-.8-3.8 0-5.5.4s-3 .8-5.5 0z"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 13.5c2-.5 3.5-.5 5 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeOpacity="0.45"
          />
        </>
      )}
    </svg>
  )
}

export function PatternIcon({ pattern }: { pattern: PaperPattern }) {
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

export function FontIcon({ font }: { font: NoteFont }) {
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

export function GripIcon() {
  return (
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
  )
}

export function PlusIcon() {
  return (
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
  )
}

export function CloseIcon() {
  return (
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
  )
}

export function PaletteIcon() {
  return (
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
  )
}

export function ZoomInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7 4.8v4.4M4.8 7h4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function ZoomOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.8 7h4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function FitViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 5.5V3a.5.5 0 0 1 .5-.5h2.5M10.5 2.5H13a.5.5 0 0 1 .5.5v2.5M13.5 10.5V13a.5.5 0 0 1-.5.5h-2.5M5.5 13.5H3a.5.5 0 0 1-.5-.5v-2.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <rect x="5.5" y="5.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function NoteIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 2.5h10a1 1 0 0 1 1 1v6.75l-3.75 3.5H3a1 1 0 0 1-1-1v-9.25a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M10.25 10.25h3.5l-3.5 3.5v-3.5Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M8 4.75v4.5M5.75 7h4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

