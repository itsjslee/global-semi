import { WAYPOINTS } from '../data/waypoints'
import { HUBS } from '../data/hubs'
import { useAtlasStore } from '../store/useAtlasStore'
import { scrollToWaypoint } from '../hooks/useScrollWaypoints'

interface RailItem {
  id: string
  label: string
  on: boolean
  onSelect: () => void
}

function Rail({ title, items }: { title: string; items: RailItem[] }) {
  return (
    <nav className="pointer-events-auto fixed left-6 top-1/2 z-40 -translate-y-1/2">
      <div className="rounded-2xl bg-paper/85 p-2.5 shadow-rail ring-1 ring-ink/5 backdrop-blur-md">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest2 text-ink/40">
          {title}
        </p>
        <ul className="flex flex-col gap-0.5">
          {items.map((it, i) => (
            <li key={it.id}>
              <button
                onClick={it.onSelect}
                className={`rail-item group w-full ${it.on ? 'bg-mint/10' : 'hover:bg-ink/[0.04]'}`}
              >
                <span className="relative flex items-center">
                  <span
                    className={`absolute -left-2.5 h-5 w-1 rounded-full transition-all ${
                      it.on ? 'bg-mint' : 'bg-transparent'
                    }`}
                  />
                  <span className={`rail-index ${it.on ? 'text-mint' : 'text-ink/35'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </span>
                <span
                  className={`rail-label ${it.on ? 'text-ink' : 'text-ink/55 group-hover:text-ink/80'}`}
                >
                  {it.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

/**
 * Left-hand numbered rail. In macro it lists the scroll-timeline waypoints; in
 * micro it switches to the regional hubs so you can hop between skylines.
 */
export function Sidebar() {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const active = useAtlasStore((s) => s.activeWaypoint)
  const activeHub = useAtlasStore((s) => s.activeHub)
  const setHub = useAtlasStore((s) => s.setHub)

  if (viewMode === 'micro') {
    return (
      <Rail
        title="Hubs"
        items={HUBS.map((h) => ({
          id: h.id,
          label: h.name,
          on: h.id === activeHub,
          onSelect: () => setHub(h.id),
        }))}
      />
    )
  }

  return (
    <Rail
      title="Regions"
      items={WAYPOINTS.map((wp, i) => ({
        id: wp.id,
        label: wp.label,
        on: i === active,
        onSelect: () => scrollToWaypoint(i),
      }))}
    />
  )
}
