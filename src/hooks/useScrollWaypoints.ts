import { useEffect } from 'react'
import { useAtlasStore, WAYPOINT_COUNT } from '../store/useAtlasStore'

function maxScroll() {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
}

/** Scroll the page so a given waypoint becomes active. */
export function scrollToWaypoint(index: number, behavior: ScrollBehavior = 'smooth') {
  const t = WAYPOINT_COUNT > 1 ? index / (WAYPOINT_COUNT - 1) : 0
  window.scrollTo({ top: t * maxScroll(), behavior })
}

/**
 * Maps native page scroll → fractional waypoint progress in the store. The
 * ScrollSpacer gives the document its height; the CameraRig reads the progress.
 */
export function useScrollWaypoints() {
  const setScroll = useAtlasStore((s) => s.setScroll)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const p01 = window.scrollY / maxScroll()
        setScroll(p01 * (WAYPOINT_COUNT - 1))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [setScroll])
}
