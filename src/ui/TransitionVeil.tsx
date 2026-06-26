import { useEffect, useState } from 'react'
import { useAtlasStore } from '../store/useAtlasStore'

/** Cream dissolve duration (each half), in ms. */
const FADE_MS = 240

/**
 * Masks the macro↔micro scene swap with a quick cream dissolve (matching the
 * preloader aesthetic). The veil fades in, the 3D scene commits the new view
 * while it's opaque, then it fades out to reveal the camera already gliding
 * into place — so the globe↔skyline hand-off reads as one seamless move.
 *
 * The effect keys ONLY on `viewMode` (the intent). `commitView` mutates
 * `renderView`, so depending on it here would re-run the effect and tear down
 * the pending "lift" timer before it could fire — leaving the veil stuck open.
 */
export function TransitionVeil() {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const [opaque, setOpaque] = useState(false)

  useEffect(() => {
    if (useAtlasStore.getState().renderView === viewMode) return
    setOpaque(true)
    // Swap the scene at the dissolve's peak, then lift the veil just after.
    const commit = window.setTimeout(() => useAtlasStore.getState().commitView(), FADE_MS)
    const lift = window.setTimeout(() => setOpaque(false), FADE_MS + 80)
    return () => {
      window.clearTimeout(commit)
      window.clearTimeout(lift)
    }
  }, [viewMode])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[55]"
      style={{
        background: '#FDFCFA',
        opacity: opaque ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease-in-out`,
      }}
    />
  )
}
