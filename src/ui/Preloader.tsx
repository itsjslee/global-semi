import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { loadCountries } from '../lib/countries'
import { useAtlasStore } from '../store/useAtlasStore'

const MIN_DURATION = 800 // ms — don't let the screen just flash
const MAX_DURATION = 9000 // ms — hard cap so the loader can never hang
const FADE_MS = 700

const NAVY = '#1A3A54'

/** Pipeline micro-copy, advanced as the bar fills. */
const PHASES = [
  'INITIALIZING ATLAS',
  'PROVISIONING FABLESS DESIGN',
  'ASSEMBLING MACHINERY',
  'FABRICATING SILICON',
  'CALIBRATING FOUNDRIES',
  'PACKAGING & TEST',
  'RENDERING THE GLOBE',
]

/**
 * Retro-minimal preloader. Warm cream backdrop, a small mountain-ridge accent,
 * a bold serif "GLOBAL SEMI", a thin track + mint fill capped by a sliding
 * block handle, monospaced pipeline subtext, and muted coordinates at the foot.
 *
 * Gates on the real assets (country geometry fetch + anything on the THREE
 * LoadingManager via useProgress), eases to 100%, then fades out cleanly.
 */
export function Preloader() {
  const { active } = useProgress()
  const setAppReady = useAtlasStore((s) => s.setAppReady)

  const [display, setDisplay] = useState(0)
  const [fading, setFading] = useState(false)
  const [removed, setRemoved] = useState(false)

  const dataReady = useRef(false)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    loadCountries().then(() => {
      if (!cancelled) dataReady.current = true
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let raf = 0
    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t
      const elapsed = t - startRef.current
      const ready =
        elapsed > MAX_DURATION || (dataReady.current && !active && elapsed > MIN_DURATION)
      const target = ready ? 100 : 92
      setDisplay((d) => {
        const next = d + (target - d) * 0.05
        return ready && next > 99.4 ? 100 : next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  useEffect(() => {
    if (display < 100 || fading) return
    setFading(true)
    const t = setTimeout(() => {
      setRemoved(true)
      setAppReady()
    }, FADE_MS)
    return () => clearTimeout(t)
  }, [display, fading, setAppReady])

  if (removed) return null

  const pct = Math.round(display)
  const phase = PHASES[Math.min(PHASES.length - 1, Math.floor((display / 100) * PHASES.length))]

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center transition-opacity ease-out"
      style={{ background: '#FDFCFA', opacity: fading ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="flex w-[320px] max-w-[80vw] flex-col items-center">
        {/* Mountain-ridge accent */}
        <svg width="148" height="30" viewBox="0 0 148 30" fill="none" className="mb-5">
          <circle cx="96" cy="7" r="4" fill="#00A86B" />
          <path
            d="M2 27 L26 12 L42 19 L64 5 L84 16 L104 9 L124 21 L146 14"
            stroke={NAVY}
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Serif wordmark */}
        <h1
          className="font-serif text-6xl font-black uppercase leading-none tracking-tight sm:text-7xl"
          style={{ color: NAVY }}
        >
          Global Semi
        </h1>

        {/* Retro progress bar: thin grey track + mint fill + sliding block handle */}
        <div className="relative mt-9 h-[3px] w-full bg-[#E7E2D6]">
          <div className="absolute left-0 top-0 h-full bg-mint" style={{ width: `${display}%` }} />
          <div
            className="absolute top-1/2 h-3.5 w-2.5 -translate-x-1/2 -translate-y-1/2 bg-[#1A3A54]"
            style={{ left: `${display}%` }}
          />
        </div>

        {/* Pipeline subtext */}
        <div className="mt-3 flex w-full items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#1A3A54]/55">
          <span>{phase}…</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
      </div>

      {/* Muted coordinates */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#1A3A54]/35">
        37.3875° N · 121.9472° W — global semi atlas
      </p>
    </div>
  )
}
