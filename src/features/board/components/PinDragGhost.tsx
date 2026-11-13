import { PushpinIcon } from './Icons'

interface PinDragGhostProps {
  clientX: number
  clientY: number
  isOverTarget: boolean
}

export function PinDragGhost({
  clientX,
  clientY,
  isOverTarget,
}: PinDragGhostProps) {
  return (
    <div
      className="pin-drag-ghost"
      aria-hidden="true"
      style={{
        transform: `translate3d(${clientX - 16}px, ${clientY - 22}px, 0) rotate(${isOverTarget ? '0deg' : '-12deg'})`,
      }}
    >
      <PushpinIcon size={24} />
    </div>
  )
}

