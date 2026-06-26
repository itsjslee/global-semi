import { useEffect, useRef, useState } from 'react'
import { useAtlasStore } from '../store/useAtlasStore'

/** Cream dissolve duration (each half), in ms. */
const FADE_MS = 240

/**
 * Masks the macro↔micro scene swap with a quick cream dissolve (matching the
 * preloader aesthetic). The veil fades in, the 3D scene commits the new view
 * while it's opaque, then it fades out to reveal the camera already gliding
 * into place — so the globe↔skyline hand-off reads as one seamless move.
 */
export function TransitionVeil() {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const renderView = useAtlasStore((s) => s.renderView)
  const commitView = useAtlasStore((s) => s.commitView)
  const [opaque, setOpaque] = useState(false)
  const raf = useRef(0)

  useEffect(() => {
    if (viewMode === renderView) return
    setOpaque(true)
    // Swap the scene at the dissolve's peak, then lift the veil.
    const commit = window.setTimeout(() => {
      commitView()
      raf.current = requestAnimationFrame(() => setOpaque(false))
    }, FADE_MS)
    return () => {
      window.clearTimeout(commit)
      cancelAnimationFrame(raf.current)
    }
  }, [viewMode, renderView, commitView])

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
