/**
 * Regional tech "hubs" — the metro-scale clusters the camera descends into for
 * the isometric micro view (a low-poly "peninsula" of buildings, à la the
 * Levels.fyi Atlas). Every company in `companies.ts` belongs to exactly one hub
 * so any node click can fly the viewer down into a populated regional grid.
 */
import { COMPANIES, type Company } from './companies'

export interface Hub {
  id: string
  /** Headline shown on the hub banner. */
  name: string
  /** Sub-label (the geographic gist). */
  region: string
  /** Representative metro center (used for the macro→micro hand-off framing). */
  lat: number
  lng: number
  /** Ordered company ids that live in this hub. */
  companyIds: string[]
}

export const HUBS: Hub[] = [
  {
    id: 'silicon-valley',
    name: 'Silicon Valley',
    region: 'San Francisco Bay Area · US West',
    lat: 37.387,
    lng: -121.97,
    companyIds: [
      'synopsys', 'cadence', 'nvidia', 'broadcom', 'amd', 'intel', 'apple',
      'qualcomm', 'applied-materials', 'lam-research', 'kla', 'supermicro',
    ],
  },
  {
    id: 'hsinchu',
    name: 'Hsinchu Science Park',
    region: 'Taiwan · the leading-edge foundry cluster',
    lat: 24.78,
    lng: 120.99,
    companyIds: ['tsmc', 'umc', 'mediatek', 'globalwafers'],
  },
  {
    id: 'taipei',
    name: 'Greater Taipei',
    region: 'Taiwan · packaging & systems',
    lat: 25.04,
    lng: 121.4,
    companyIds: ['ase', 'foxconn', 'pegatron', 'quanta'],
  },
  {
    id: 'tokyo',
    name: 'Greater Tokyo',
    region: 'Japan · materials & precision tools',
    lat: 35.68,
    lng: 139.75,
    companyIds: ['tokyo-electron', 'shin-etsu', 'sumco', 'tok', 'nikon', 'canon'],
  },
  {
    id: 'seoul',
    name: 'Seoul Capital Area',
    region: 'Korea · memory & devices',
    lat: 37.4,
    lng: 127.1,
    companyIds: ['samsung', 'sk-hynix'],
  },
  {
    id: 'shanghai',
    name: 'Yangtze River Delta',
    region: 'China · foundry & packaging',
    lat: 31.4,
    lng: 121.0,
    companyIds: ['smic', 'jcet', 'tfme'],
  },
  {
    id: 'europe',
    name: 'European Core',
    region: 'Veldhoven · Munich · the EUV chokepoint',
    lat: 51.42,
    lng: 5.39,
    companyIds: ['asml', 'arm', 'nxp', 'infineon', 'st', 'siltronic', 'merck', 'air-liquide', 'linde', 'tower'],
  },
  {
    id: 'southwest',
    name: 'Desert Southwest',
    region: 'Arizona · Texas',
    lat: 33.2,
    lng: -103,
    companyIds: ['amkor', 'siemens-eda', 'ti'],
  },
  {
    id: 'us-northeast',
    name: 'US Northeast',
    region: 'New York · the Atlantic corridor',
    lat: 41.5,
    lng: -73.5,
    companyIds: ['globalfoundries', 'marvell', 'adi'],
  },
]

export const HUB_BY_ID: Record<string, Hub> = Object.fromEntries(HUBS.map((h) => [h.id, h]))

/** company id → hub id, so a node click can resolve the regional grid to enter. */
export const HUB_OF_COMPANY: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const hub of HUBS) for (const cid of hub.companyIds) map[cid] = hub.id
  return map
})()

export const DEFAULT_HUB = 'silicon-valley'

/** Maps a scroll-timeline waypoint id to the hub it most naturally descends into. */
export const HUB_FOR_WAYPOINT: Record<string, string> = {
  global: 'silicon-valley',
  'us-west': 'silicon-valley',
  southwest: 'southwest',
  'east-asia': 'hsinchu',
  japan: 'tokyo',
  europe: 'europe',
}

export interface HubPlacement {
  company: Company
  /** Grid cell center in world units (XZ plane), grid centered on the origin. */
  x: number
  z: number
}

export interface HubLayout {
  placements: HubPlacement[]
  /** World-unit spacing between cell centers. */
  cell: number
  /** Half-extent of the populated grid (for framing the camera & ground). */
  radius: number
}

const CATEGORY_RANK: Record<string, number> = {
  eda: 0, design: 1, integration: 2, equipment: 3, materials: 4, foundry: 5, osat: 6,
}

const CELL = 17

const layoutCache = new Map<string, HubLayout>()

/**
 * Deterministic isometric grid layout for a hub: companies are sorted by supply
 * layer (so similar buildings cluster) and packed into the squarest grid that
 * holds them, centered on the world origin. Centering on (0,0,0) keeps the
 * hub's grid center coincident with the look target — honoring the "globe stays
 * centered" guardrail even in the micro view.
 */
export function getHubLayout(hubId: string): HubLayout {
  const cached = layoutCache.get(hubId)
  if (cached) return cached

  const hub = HUB_BY_ID[hubId] ?? HUB_BY_ID[DEFAULT_HUB]
  const companies = hub.companyIds
    .map((id) => COMPANIES.find((c) => c.id === id))
    .filter((c): c is Company => Boolean(c))
    .sort((a, b) => (CATEGORY_RANK[a.category] ?? 9) - (CATEGORY_RANK[b.category] ?? 9))

  const n = companies.length
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)))
  const rows = Math.max(1, Math.ceil(n / cols))

  const placements: HubPlacement[] = companies.map((company, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      company,
      x: (col - (cols - 1) / 2) * CELL,
      z: (row - (rows - 1) / 2) * CELL,
    }
  })

  const radius = (Math.max(cols, rows) / 2) * CELL + CELL
  const layout: HubLayout = { placements, cell: CELL, radius }
  layoutCache.set(hubId, layout)
  return layout
}
