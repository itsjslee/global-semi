import { useEffect, useState } from 'react'
import { useAtlasStore } from '../store/useAtlasStore'

const NAVY = '#1A3A54'
const FADE_MS = 450

/**
 * Central "GLOBAL SEMI" splash, shown over the globe once the cream loader
 * lifts. Highly translucent glassmorphism (light fill + heavy blur + subtle
 * border) so the globe reads through it. A minimalist 'X' fades it out and
 * clears the view entirely. The wrapper is click-through, so only the card and
 * its close button are interactive — the globe stays usable around it.
 */
export function SplashCard() {
  const appReady = useAtlasStore((s) => s.appReady)
  const splashDismissed = useAtlasStore((s) => s.splashDismissed)
  const dismissSplash = useAtlasStore((s) => s.dismissSplash)

  const [shown, setShown] = useState(false) // drives the fade-in
  const [closing, setClosing] = useState(false)

  // Fade in on the frame after the loader hands off.
  useEffect(() => {
    if (!appReady || splashDismissed) return
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [appReady, splashDismissed])

  if (!appReady || splashDismissed) return null

  const handleClose = () => {
    setClosing(true)
    setTimeout(dismissSplash, FADE_MS)
  }

  const visible = shown && !closing

  return (
    <div className="pointer-events-none fixed inset-0 z-[50] grid place-items-center px-6">
      <div
        className="pointer-events-auto relative w-[min(92vw,440px)] rounded-3xl border border-white/30 bg-white/15 px-10 py-9 text-center shadow-card backdrop-blur-md backdrop-saturate-150"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
          transition: `opacity ${FADE_MS}ms ease-out, transform ${FADE_MS}ms ease-out`,
        }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 grid h-7 w-7 place-items-center rounded-full text-ink/45 transition-colors hover:bg-ink/10 hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2 2 L10 10 M10 2 L2 10" />
          </svg>
        </button>

        {/* Mountain-ridge accent */}
        <svg width="120" height="24" viewBox="0 0 120 24" fill="none" className="mx-auto mb-4">
          <circle cx="78" cy="6" r="3.2" fill="#00A86B" />
          <path
            d="M2 21 L22 9 L36 15 L54 4 L72 13 L88 8 L104 17 L118 11"
            stroke={NAVY}
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        <h2
          className="font-serif text-5xl font-black uppercase leading-none text-ink"
          style={{ textShadow: '0 1px 14px rgba(253,252,250,0.5)' }}
        >
          Global Semi
        </h2>
        <p
          className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink/70"
          style={{ textShadow: '0 1px 10px rgba(253,252,250,0.45)' }}
        >
          The companies that design, equip, fabricate, and package the world’s chips — mapped
          across the planet.
        </p>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-mint">
          Scroll to descend · Drag to explore
        </p>
      </div>
    </div>
  )
}
