import { useAtlasStore } from '../store/useAtlasStore'

/** Top-left search + contribute + whoami trigger. */
export function TopBar() {
  const openWhoami = useAtlasStore((s) => s.openWhoami)

  return (
    <div className="pointer-events-auto fixed left-6 top-5 z-40 flex items-center gap-2">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl bg-paper/90 px-2 py-1.5 shadow-rail ring-1 ring-ink/5 backdrop-blur-md">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-paper">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
          </svg>
        </span>
        <input
          placeholder="Search companies…"
          className="w-52 bg-transparent px-1 text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
      </div>

      {/* Contribute */}
      <button className="rounded-xl bg-mint px-3.5 py-2 text-sm font-semibold text-paper shadow-rail transition hover:brightness-105">
        + Contribute
      </button>

      {/* Whoami / Credits trigger */}
      <button
        onClick={openWhoami}
        className="flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-2 text-[11px] font-semibold text-ink shadow-rail ring-1 ring-ink/10 backdrop-blur-md transition-colors hover:bg-white/35"
      >
        {/* Animated pulsing dot */}
        <span
          className="h-2 w-2 rounded-full bg-mint"
          style={{ animation: 'pulse-dot 2s ease-in-out infinite' }}
        />
        Whoami / Credits
      </button>
    </div>
  )
}
