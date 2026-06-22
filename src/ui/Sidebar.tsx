import { WAYPOINTS } from '../data/waypoints'
import { useAtlasStore } from '../store/useAtlasStore'
import { scrollToWaypoint } from '../hooks/useScrollWaypoints'

/** Left-hand numbered waypoint rail (mirrors the Atlas layout). */
export function Sidebar() {
  const active = useAtlasStore((s) => s.activeWaypoint)

  return (
    <nav className="pointer-events-auto fixed left-6 top-1/2 z-40 -translate-y-1/2">
      <div className="rounded-2xl bg-paper/85 p-2.5 shadow-rail ring-1 ring-ink/5 backdrop-blur-md">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest2 text-ink/40">
          Regions
        </p>
        <ul className="flex flex-col gap-0.5">
          {WAYPOINTS.map((wp, i) => {
            const on = i === active
            return (
              <li key={wp.id}>
                <button
                  onClick={() => scrollToWaypoint(i)}
                  className={`rail-item group w-full ${on ? 'bg-mint/10' : 'hover:bg-ink/[0.04]'}`}
                >
                  <span className="relative flex items-center">
                    <span
                      className={`absolute -left-2.5 h-5 w-1 rounded-full transition-all ${
                        on ? 'bg-mint' : 'bg-transparent'
                      }`}
                    />
                    <span className={`rail-index ${on ? 'text-mint' : 'text-ink/35'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </span>
                  <span
                    className={`rail-label ${on ? 'text-ink' : 'text-ink/55 group-hover:text-ink/80'}`}
                  >
                    {wp.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
