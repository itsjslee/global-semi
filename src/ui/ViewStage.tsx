import { useRef, MutableRefObject } from 'react'
import { Scene } from '../three/Scene'

const GRADIENT = 'linear-gradient(180deg, #D6EAF3 0%, #9CC0D6 30%, #4A7E9C 66%, #1A3A54 100%)'

/**
 * The strictly fixed, centered canvas stage. It never moves or resizes when the
 * Macro/Micro view toggles — only the 3D content inside swaps — so the globe /
 * map stays locked to the center of the screen while the UI re-arranges around it.
 *
 * Event routing:
 *   - The <Canvas> itself has pointer-events:none so it can never intercept clicks
 *     meant for the fixed z-40 UI panels.
 *   - A transparent event-source div sits behind the canvas (still pointer-events-auto)
 *     and is passed to <Canvas eventSource> so R3F's raycasting and OrbitControls
 *     still receive globe-area clicks and drags normally.
 *   - Fixed UI panels at z-40 beat this z-0 div in hit-testing, so buttons always win.
 */
export function ViewStage() {
  const eventSourceRef = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement>

  return (
    <div className="pointer-events-none fixed inset-0 z-0 grid place-items-center overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: GRADIENT }} />
      {/* Transparent hit surface — R3F and OrbitControls attach here, not to the canvas. */}
      <div ref={eventSourceRef} className="pointer-events-auto absolute inset-0" />
      {/* Canvas wrapper is pointer-events-none; the <Canvas> itself also carries the prop. */}
      <div className="pointer-events-none relative h-full w-full">
        <Scene eventSource={eventSourceRef} />
      </div>
    </div>
  )
}
