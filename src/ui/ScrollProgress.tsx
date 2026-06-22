import { WAYPOINTS } from '../data/waypoints'
import { useAtlasStore } from '../store/useAtlasStore'
import { scrollToWaypoint } from '../hooks/useScrollWaypoints'

/** Right-edge scroll-progress dots, one per waypoint. */
export function ScrollProgress() {
  const active = useAtlasStore((s) => s.activeWaypoint)

  return (
    <div className="pointer-events-auto fixed right-5 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2.5">
      {WAYPOINTS.map((wp, i) => {
        const on = i === active
        return (
          <button
            key={wp.id}
            aria-label={wp.label}
            title={wp.label}
            onClick={() => scrollToWaypoint(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              on ? 'scale-125 bg-mint shadow-marker' : 'bg-paper/45 hover:bg-paper/80'
            }`}
          />
        )
      })}
    </div>
  )
}
