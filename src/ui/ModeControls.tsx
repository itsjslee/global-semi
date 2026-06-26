import { useAtlasStore } from '../store/useAtlasStore'

/** Generic two-or-more option segmented control. */
function Segment<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-full bg-paper/90 p-1 shadow-rail ring-1 ring-ink/5 backdrop-blur-md">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              on ? 'bg-ink text-paper' : 'text-ink/55 hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Bottom-left controls: Tour/Explore and All/Key segmented toggles. */
export function ModeControls() {
  const mode = useAtlasStore((s) => s.mode)
  const setMode = useAtlasStore((s) => s.setMode)
  const showAll = useAtlasStore((s) => s.showAll)
  const toggleShowAll = useAtlasStore((s) => s.toggleShowAll)

  return (
    <div className="pointer-events-auto fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2.5">
      <div className="flex gap-2">
        <Segment
          value={mode}
          onChange={(v) => setMode(v)}
          options={[
            { value: 'tour', label: 'Tour' },
            { value: 'explore', label: 'Explore' },
          ]}
        />
        <Segment
          value={showAll ? 'all' : 'key'}
          onChange={(v) => {
            if ((v === 'all') !== showAll) toggleShowAll()
          }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'key', label: 'Key' },
          ]}
        />
      </div>
    </div>
  )
}
