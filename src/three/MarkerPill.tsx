import { useMemo, useState } from 'react'
import { CATEGORY_BADGE, type Company } from '../data/companies'
import { CATEGORY_COLORS } from '../lib/colors'
import { useAtlasStore } from '../store/useAtlasStore'

/** drei <Html> distanceFactor for markers — larger keeps them legible zoomed out. */
export const MARKER_DISTANCE_FACTOR = 165

/**
 * Candidate logo sources, tried in order. Google's favicon service reliably
 * returns the brand mark; DuckDuckGo's icon service is a higher-res backup;
 * if both fail we render a colored monogram so the marker never looks broken.
 */
function logoCandidates(domain: string): string[] {
  if (!domain) return []
  return [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ]
}

function monogram(name: string): string {
  return name
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** The circular logo chip. Handles alpha (white backing) and scales cleanly. */
function MarkerLogo({ company, color }: { company: Company; color: string }) {
  const candidates = useMemo(() => logoCandidates(company.domain), [company.domain])
  const [idx, setIdx] = useState(0)

  if (idx >= candidates.length) {
    return (
      <span
        className="marker-logo text-[13px] font-extrabold leading-none text-paper"
        style={{ background: color }}
      >
        {monogram(company.name)}
      </span>
    )
  }

  return (
    <span className="marker-logo bg-white" style={{ boxShadow: `inset 0 0 0 1.5px ${color}` }}>
      <img
        key={candidates[idx]}
        src={candidates[idx]}
        alt={`${company.name} logo`}
        className="h-full w-full object-contain p-[3px]"
        loading="lazy"
        draggable={false}
        onError={() => setIdx((i) => i + 1)}
      />
    </span>
  )
}

/**
 * The pill content shared by the macro (globe) and micro (flat map) markers:
 * a corporate logo chip, the company name, and a category tag. Selection /
 * hover wiring lives here so both views behave identically.
 */
export function MarkerPill({ company }: { company: Company }) {
  const color = CATEGORY_COLORS[company.category]
  const setActiveNode = useAtlasStore((s) => s.setActiveNode)
  const setHoverNode = useAtlasStore((s) => s.setHoverNode)

  return (
    <button
      type="button"
      className="marker-pill"
      onClick={(e) => {
        e.stopPropagation()
        const { activeNode } = useAtlasStore.getState()
        setActiveNode(activeNode === company.id ? null : company.id)
      }}
      onMouseEnter={() => setHoverNode(company.id)}
      onMouseLeave={() => setHoverNode(null)}
    >
      <MarkerLogo company={company} color={color} />
      <span className="marker-name">{company.name}</span>
      <span className="marker-badge" style={{ background: color }}>
        {CATEGORY_BADGE[company.category]}
      </span>
    </button>
  )
}
