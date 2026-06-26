import { create } from 'zustand'
import { WAYPOINTS } from '../data/waypoints'
import { TRACES } from '../data/traces'
import { DEFAULT_HUB, HUB_FOR_WAYPOINT, HUB_OF_COMPANY } from '../data/hubs'

export type Mode = 'tour' | 'explore'
/**
 * Macro = the 3D globe. Micro = the isometric regional "skyline" of a single
 * hub (low-poly buildings on a grid). The canvas stays centered for both.
 */
export type ViewMode = 'macro' | 'micro'

export interface ManualOffset {
  /** Orbit yaw offset around the look target (radians). */
  yaw: number
  /** Orbit pitch offset (radians, clamped). */
  pitch: number
  /** Zoom multiplier delta; final distance = base * (1 + zoom). */
  zoom: number
}

const ZERO_OFFSET: ManualOffset = { yaw: 0, pitch: 0, zoom: 0 }

export interface AtlasState {
  // ── App lifecycle ───────────────────────────────────────────
  /** Flipped true once the preloader has finished and faded out. */
  appReady: boolean
  setAppReady: () => void
  /** The central splash card is shown after load until the user closes it. */
  splashDismissed: boolean
  dismissSplash: () => void
  /** Whoami / Credits modal. */
  whoamiOpen: boolean
  openWhoami: () => void
  closeWhoami: () => void

  // ── View mode (globe vs isometric hub) ──────────────────────
  /** The user's intent (drives UI + the transition veil). */
  viewMode: ViewMode
  /**
   * The view actually rendered by the 3D scene. It lags `viewMode` by the
   * length of the cream dissolve so the globe↔skyline swap happens while the
   * veil is opaque — making the macro↔micro hand-off feel seamless.
   */
  renderView: ViewMode
  commitView: () => void
  setViewMode: (view: ViewMode) => void
  toggleViewMode: () => void

  // ── Regional hub (the isometric micro view) ─────────────────
  /** Which hub's skyline the micro view renders / the camera frames. */
  activeHub: string
  setHub: (hubId: string) => void
  /** Descend into a hub's isometric skyline (from a node click or toggle). */
  enterHub: (hubId: string) => void
  /** Pop back out to the macro globe. */
  exitHub: () => void
  /**
   * Click handler shared by every marker/building: in macro this dives into the
   * company's regional hub; in micro it toggles the building's detail panel.
   */
  selectCompany: (companyId: string) => void

  // ── Camera mode ─────────────────────────────────────────────
  /** 'tour' = guided waypoint camera; 'explore' = free OrbitControls. */
  mode: Mode
  setMode: (mode: Mode) => void
  toggleMode: () => void

  // ── Scroll-driven waypoint timeline ─────────────────────────
  /** Snapped (rounded) active waypoint index. Drives the sidebar. */
  activeWaypoint: number
  /** Continuous progress across the timeline, 0 .. WAYPOINTS.length - 1. */
  scrollProgress: number
  setScroll: (progress: number) => void

  // ── "Trace the Wafer" ───────────────────────────────────────
  activeTraceId: string
  setTrace: (id: string) => void
  /** When true the camera follows the active trace's pulse. */
  tracePlaying: boolean
  startTrace: (id?: string) => void
  stopTrace: () => void
  /** Pulse position along the active curve, 0..1 (written by CameraRig). */
  tourProgress: number
  setTourProgress: (p: number) => void

  // ── Selection / hover ───────────────────────────────────────
  activeNode: string | null
  hoverNode: string | null
  setActiveNode: (id: string | null) => void
  setHoverNode: (id: string | null) => void

  // ── ALL / KEY filter ────────────────────────────────────────
  showAll: boolean
  toggleShowAll: () => void

  // ── Manual keyboard camera nudges (tour mode) ───────────────
  manual: ManualOffset
  nudge: (delta: Partial<ManualOffset>) => void
  resetManual: () => void
}

const PITCH_LIMIT = 1.05 // ~60° of manual pitch either way

export const useAtlasStore = create<AtlasState>((set, get) => ({
  // ── App lifecycle ───────────────────────────────────────────
  appReady: false,
  setAppReady: () => set({ appReady: true }),
  splashDismissed: false,
  dismissSplash: () => set({ splashDismissed: true }),
  whoamiOpen: false,
  openWhoami: () => set({ whoamiOpen: true }),
  closeWhoami: () => set({ whoamiOpen: false }),

  // ── View mode ───────────────────────────────────────────────
  viewMode: 'macro',
  renderView: 'macro',
  commitView: () => set((s) => ({ renderView: s.viewMode })),
  setViewMode: (view) =>
    set((s) => {
      if (view === s.viewMode) return { viewMode: view }
      // Toggling into micro descends into the hub that matches the current
      // scroll region, so the view always lands on a populated grid.
      const hub =
        view === 'micro'
          ? HUB_FOR_WAYPOINT[WAYPOINTS[s.activeWaypoint]?.id] ?? s.activeHub
          : s.activeHub
      // Switching views resets transient camera state for a clean re-frame.
      return { viewMode: view, activeHub: hub, tracePlaying: false, manual: { ...ZERO_OFFSET } }
    }),
  toggleViewMode: () => get().setViewMode(get().viewMode === 'macro' ? 'micro' : 'macro'),

  // ── Regional hub ────────────────────────────────────────────
  activeHub: DEFAULT_HUB,
  setHub: (hubId) =>
    set((s) =>
      hubId === s.activeHub
        ? { activeHub: hubId }
        : { activeHub: hubId, activeNode: null, manual: { ...ZERO_OFFSET } },
    ),
  enterHub: (hubId) =>
    set({
      viewMode: 'micro',
      activeHub: hubId,
      tracePlaying: false,
      manual: { ...ZERO_OFFSET },
    }),
  exitHub: () =>
    set({ viewMode: 'macro', activeNode: null, manual: { ...ZERO_OFFSET } }),
  selectCompany: (companyId) =>
    set((s) => {
      if (s.viewMode === 'macro') {
        // Dive from the globe into this company's regional skyline.
        return {
          viewMode: 'micro',
          activeHub: HUB_OF_COMPANY[companyId] ?? s.activeHub,
          activeNode: companyId,
          tracePlaying: false,
          manual: { ...ZERO_OFFSET },
        }
      }
      // Already in a hub → toggle the detail panel for this building.
      return { activeNode: s.activeNode === companyId ? null : companyId }
    }),

  // ── Camera mode ─────────────────────────────────────────────
  mode: 'tour',
  setMode: (mode) =>
    set((s) =>
      mode === 'explore'
        ? { mode, tracePlaying: false }
        : { mode, manual: { ...ZERO_OFFSET } },
    ),
  toggleMode: () => get().setMode(get().mode === 'tour' ? 'explore' : 'tour'),

  // ── Scroll-driven waypoint timeline ─────────────────────────
  activeWaypoint: 0,
  scrollProgress: 0,
  setScroll: (progress) => {
    const snapped = Math.round(progress)
    set((s) =>
      snapped === s.activeWaypoint
        ? { scrollProgress: progress }
        : // Re-frame cleanly whenever we land on a new stop.
          { scrollProgress: progress, activeWaypoint: snapped, manual: { ...ZERO_OFFSET } },
    )
  },

  // ── "Trace the Wafer" ───────────────────────────────────────
  activeTraceId: TRACES[0].id,
  setTrace: (id) => set({ activeTraceId: id }),
  tracePlaying: false,
  startTrace: (id) =>
    set((s) => ({
      tracePlaying: true,
      mode: 'tour', // following the pulse only makes sense in guided mode
      activeTraceId: id ?? s.activeTraceId,
      tourProgress: 0,
      activeNode: null,
    })),
  stopTrace: () => set({ tracePlaying: false }),
  tourProgress: 0,
  setTourProgress: (p) => set({ tourProgress: p }),

  // ── Selection / hover ───────────────────────────────────────
  activeNode: null,
  hoverNode: null,
  setActiveNode: (id) => set({ activeNode: id }),
  setHoverNode: (id) => set({ hoverNode: id }),

  // ── ALL / KEY filter ────────────────────────────────────────
  showAll: true,
  toggleShowAll: () => set((s) => ({ showAll: !s.showAll })),

  // ── Manual keyboard camera nudges ───────────────────────────
  manual: { ...ZERO_OFFSET },
  nudge: (delta) =>
    set((s) => ({
      manual: {
        yaw: s.manual.yaw + (delta.yaw ?? 0),
        pitch: Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, s.manual.pitch + (delta.pitch ?? 0))),
        zoom: Math.max(-0.55, Math.min(1.6, s.manual.zoom + (delta.zoom ?? 0))),
      },
    })),
  resetManual: () => set({ manual: { ...ZERO_OFFSET } }),
}))

export const WAYPOINT_COUNT = WAYPOINTS.length
