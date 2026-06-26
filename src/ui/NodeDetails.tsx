import { CATEGORY_LABELS, COMPANY_BY_ID } from '../data/companies'
import { CATEGORY_COLORS } from '../lib/colors'
import { LANDMARK_NAME } from '../data/landmarks'
import { useAtlasStore } from '../store/useAtlasStore'

/** Detail card shown when a company marker is selected. */
export function NodeDetails() {
  const id = useAtlasStore((s) => s.activeNode)
  const setActiveNode = useAtlasStore((s) => s.setActiveNode)
  if (!id) return null

  const company = COMPANY_BY_ID[id]
  if (!company) return null
  const color = CATEGORY_COLORS[company.category]

  return (
    <div className="pointer-events-auto fixed bottom-6 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2">
      <div className="relative rounded-2xl bg-paper/95 p-4 pr-9 shadow-card ring-1 ring-ink/5 backdrop-blur-md">
        <button
          onClick={() => setActiveNode(null)}
          aria-label="Close"
          className="absolute right-3 top-2.5 text-lg leading-none text-ink/35 transition-colors hover:text-ink"
        >
          ×
        </button>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          <span
            className="text-[10px] font-bold uppercase tracking-widest2"
            style={{ color }}
          >
            {CATEGORY_LABELS[company.category]}
          </span>
        </div>
        <h3 className="mt-1.5 text-xl font-bold leading-tight text-ink">{company.name}</h3>
        <p className="text-xs font-medium text-ink/50">
          {company.site}
          {LANDMARK_NAME[company.id] && (
            <span className="text-ink/40"> · {LANDMARK_NAME[company.id]}</span>
          )}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{company.blurb}</p>
      </div>
    </div>
  )
}
