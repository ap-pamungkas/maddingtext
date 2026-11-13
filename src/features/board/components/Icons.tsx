import type { NoteFont, PaperPattern } from '../types'

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

