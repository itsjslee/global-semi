import { HUBS, HUB_BY_ID } from '../data/hubs'
import { useAtlasStore } from '../store/useAtlasStore'

/**
 * Micro-view banner: names the hub the camera has descended into, lets the user
 * hop between neighbouring hubs, and pops back out to the macro globe. Mirrors
 * the Levels.fyi Atlas "esc returns to the tour" affordance.
 */
export function HubControls() {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const activeHub = useAtlasStore((s) => s.activeHub)
  const setHub = useAtlasStore((s) => s.setHub)
  const exitHub = useAtlasStore((s) => s.exitHub)

  if (viewMode !== 'micro') return null

  const hub = HUB_BY_ID[activeHub] ?? HUBS[0]
  const idx = HUBS.findIndex((h) => h.id === hub.id)
  const step = (dir: number) => setHub(HUBS[(idx + dir + HUBS.length) % HUBS.length].id)

  return (
    <div className="pointer-events-auto fixed left-1/2 top-[68px] z-40 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-2xl bg-paper/90 px-2 py-1.5 shadow-rail ring-1 ring-ink/5 backdrop-blur-md">
        <button
          onClick={exitHub}
          className="rounded-xl bg-ink px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-paper transition hover:brightness-110"
        >
          ← Globe
        </button>

        <button
          onClick={() => step(-1)}
          aria-label="Previous hub"
          className="grid h-7 w-7 place-items-center rounded-lg text-ink/50 transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          ‹
        </button>

        <div className="min-w-[180px] px-1 text-center">
          <p className="text-[13px] font-bold leading-tight text-ink">{hub.name}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink/45">{hub.region}</p>
        </div>

        <button
          onClick={() => step(1)}
          aria-label="Next hub"
          className="grid h-7 w-7 place-items-center rounded-lg text-ink/50 transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          ›
        </button>
      </div>
    </div>
  )
}
