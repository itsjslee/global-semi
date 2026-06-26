import { useEffect, useRef } from 'react'
import { useAtlasStore } from '../store/useAtlasStore'

const SECTION = 'mt-5 first:mt-0'
const LABEL = 'mb-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/40'
const BODY = 'text-sm leading-relaxed text-ink/75'

export function WhoamiModal() {
  const open = useAtlasStore((s) => s.whoamiOpen)
  const close = useAtlasStore((s) => s.closeWhoami)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  // Trap focus inside when open
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    /* Backdrop — click-through except the panel */
    <div
      className="fixed inset-0 z-[55] grid place-items-center px-6"
      style={{ background: 'rgba(16,32,42,0.45)' }}
      onClick={close}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Whoami / Credits"
        className="relative w-[min(92vw,480px)] animate-[fadeUp_0.3s_ease-out] rounded-3xl border border-white/25 bg-white/14 px-8 py-8 shadow-card outline-none backdrop-blur-[16px] backdrop-saturate-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full text-ink/50 transition-colors hover:bg-ink/10 hover:text-ink"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M1.5 1.5 L9.5 9.5 M9.5 1.5 L1.5 9.5" />
          </svg>
        </button>

        {/* Header */}
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-ink/40">
          whoami · credits
        </p>
        <h2 className="mt-1 font-serif text-3xl font-black leading-tight text-ink">
          Global <span className="text-mint">Semi</span>
        </h2>

        <div className="mt-6 flex flex-col divide-y divide-ink/8">
          {/* Who Am I */}
          <div className={SECTION}>
            <p className={LABEL}>Who Am I</p>
            <p className={BODY}>
              I'm a junior studying <span className="font-semibold text-ink">Computer Engineering</span>{' '}
              with a deep interest in the semiconductor industry, currently a summer intern at{' '}
              <span className="font-semibold text-ink">Applied Materials</span>.
            </p>
          </div>

          {/* Purpose */}
          <div className={`${SECTION} pt-5`}>
            <p className={LABEL}>Purpose</p>
            <p className={BODY}>
              I built <em>Global Semi</em> to create a comprehensive, intuitive global overview of
              how the capital-intensive semiconductor supply chain actually works — where the
              silicon is designed, where the machines are built, where the wafers are fabbed, and
              where the chips are packaged and shipped.
            </p>
          </div>

          {/* Acknowledgments */}
          <div className={`${SECTION} pt-5`}>
            <p className={LABEL}>Acknowledgments</p>
            <p className={BODY}>
              Design credit goes to the <span className="font-semibold text-ink">Levels.fyi</span>{' '}
              team for their phenomenal{' '}
              <a
                href="https://www.levels.fyi/atlas"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-mint underline decoration-mint/40 underline-offset-2 transition-colors hover:decoration-mint"
              >
                Atlas ("The Peninsula")
              </a>{' '}
              — its layout concept and 3D low-poly aesthetic provided the blueprint this map builds
              upon at a planetary scale.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-ink/30">
          37.3875° N · 121.9472° W — global semi atlas
        </p>
      </div>
    </div>
  )
}
