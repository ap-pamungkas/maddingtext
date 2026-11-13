import { RealisticPin } from './Icons'

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
        transform: `translate3d(${clientX - 14}px, ${clientY - 16}px, 0) rotate(${isOverTarget ? '0deg' : '-12deg'})`,
      }}
    >
      <RealisticPin size={30} />
    </div>
  )
}

