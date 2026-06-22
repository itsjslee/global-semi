import { useAtlasStore } from '../store/useAtlasStore'

/**
 * The "Global Semi" masthead. It lives permanently in the top-right corner of
 * the UI overlay — never a centered banner — so the 3D globe stays completely
 * clear and unobstructed. It gently fades in as the cream loading screen lifts.
 */
export function BrandHeader() {
  const appReady = useAtlasStore((s) => s.appReady)

  return (
    <header
      className="pointer-events-none fixed right-6 top-5 z-40 flex flex-col items-end text-right transition-all duration-700 ease-out"
      style={{
        opacity: appReady ? 1 : 0,
        transform: appReady ? 'translateY(0)' : 'translateY(-6px)',
      }}
    >
      <h1
        className="font-serif text-2xl font-black leading-none text-ink"
        style={{ textShadow: '0 1px 10px rgba(253,252,250,0.65)' }}
      >
        Global <span className="text-mint">Semi</span>
      </h1>
      <p
        className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/50"
        style={{ textShadow: '0 1px 8px rgba(253,252,250,0.6)' }}
      >
        An atlas of the silicon supply chain
      </p>
    </header>
  )
}
