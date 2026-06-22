import { Scene } from '../three/Scene'

const GRADIENT = 'linear-gradient(180deg, #D6EAF3 0%, #9CC0D6 30%, #4A7E9C 66%, #1A3A54 100%)'

/**
 * The strictly fixed, centered canvas stage. Fully pointer-events:none so the
 * canvas layer can never intercept clicks meant for the fixed UI panels above it.
 * R3F's event system is disabled on the Canvas (events={false}) to prevent its
 * capture-phase listeners from swallowing site-wide pointer events.
 */
export function ViewStage() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 grid place-items-center overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: GRADIENT }} />
      <div className="relative h-full w-full">
        <Scene />
      </div>
    </div>
  )
}
