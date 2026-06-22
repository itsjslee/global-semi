import { useAtlasStore, type ViewMode } from '../store/useAtlasStore'

const OPTIONS: { value: ViewMode; label: string; glyph: string }[] = [
  { value: 'macro', label: 'Macro', glyph: '🌐' },
  { value: 'micro', label: 'Micro', glyph: '▦' },
]

/** Top-center Macro (globe) / Micro (flat map) view switch. */
export function ViewToggle() {
  const viewMode = useAtlasStore((s) => s.viewMode)
  const setViewMode = useAtlasStore((s) => s.setViewMode)

  return (
    <div className="pointer-events-auto fixed left-1/2 top-5 z-40 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full bg-paper/90 p-1 shadow-rail ring-1 ring-ink/5 backdrop-blur-md">
        {OPTIONS.map((o) => {
          const on = o.value === viewMode
          return (
            <button
              key={o.value}
              onClick={() => setViewMode(o.value)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                on ? 'bg-ink text-paper' : 'text-ink/55 hover:text-ink'
              }`}
            >
              <span className="text-[12px] leading-none">{o.glyph}</span>
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
