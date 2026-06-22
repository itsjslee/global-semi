import { useState } from 'react'
import { Scene } from '../three/Scene'

const GRADIENT = 'linear-gradient(180deg, #D6EAF3 0%, #9CC0D6 30%, #4A7E9C 66%, #1A3A54 100%)'

/**
 * The strictly fixed, centered canvas stage. It never moves or resizes when the
 * Macro/Micro view toggles — only the 3D content inside swaps — so the globe /
 * map stays locked to the center of the screen while the UI re-arranges around it.
 *
 * Event routing:
 *   - pointer-events:none is set directly on gl.domElement (the <canvas>) in
 *     Scene's onCreated, so the canvas element itself can never intercept clicks.
 *   - A transparent event-source div (pointer-events-auto) is passed to R3F via
 *     eventSource so raycasting and OrbitControls still work for globe interaction.
 *   - We use a useState callback ref so R3F receives the actual DOM element (not a
 *     ref that might still be null when R3F initialises its event system).
 *   - Fixed UI panels at z-40 beat the z-0 event-source div in hit-testing, so
 *     every button always wins the click over globe-area interaction.
 */
export function ViewStage() {
  const [eventSource, setEventSource] = useState<HTMLDivElement | null>(null)

  return (
    <div className="pointer-events-none fixed inset-0 z-0 grid place-items-center overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: GRADIENT }} />
      {/* Transparent hit surface — R3F and OrbitControls attach here, not to the canvas. */}
      <div ref={setEventSource} className="pointer-events-auto absolute inset-0" />
      {/* Canvas wrapper is pointer-events-none; the canvas element is too (set in onCreated). */}
      <div className="pointer-events-none relative h-full w-full">
        <Scene eventSource={eventSource} />
      </div>
    </div>
  )
}
