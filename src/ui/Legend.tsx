import { CATEGORY_LABELS, CATEGORY_ORDER } from '../data/companies'
import { CATEGORY_COLORS } from '../lib/colors'

/** Bottom-right supply-chain layer legend. */
export function Legend() {
  return (
    <div className="pointer-events-auto fixed bottom-6 right-6 z-40 rounded-2xl bg-paper/85 p-3 shadow-rail ring-1 ring-ink/5 backdrop-blur-md">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest2 text-ink/40">
        Supply Chain
      </p>
      <ul className="flex flex-col gap-1.5">
        {CATEGORY_ORDER.map((cat, i) => (
          <li key={cat} className="flex items-center gap-2">
            <span
              className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[8px] font-bold text-paper"
              style={{ background: CATEGORY_COLORS[cat] }}
            >
              {i + 1}
            </span>
            <span className="text-[11px] font-medium text-ink/70">{CATEGORY_LABELS[cat]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
