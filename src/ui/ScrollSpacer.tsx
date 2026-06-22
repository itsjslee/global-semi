import { WAYPOINT_COUNT } from '../store/useAtlasStore'

/**
 * The only element in normal document flow. Its height (one viewport per
 * waypoint) gives the page something to scroll, which `useScrollWaypoints`
 * translates into camera progress. Everything else is fixed-positioned.
 */
export function ScrollSpacer() {
  return (
    <div
      aria-hidden
      className="pointer-events-none w-px"
      style={{ height: `${WAYPOINT_COUNT * 100}vh` }}
    />
  )
}
