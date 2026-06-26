/**
 * Building "archetypes" and per-company landmark signatures. Marquee
 * headquarters get recognizable silhouettes (Apple Park's ring, NVIDIA
 * Voyager's triangular vaulted roof, TSMC's GIGAFAB monolith + wafer pond,
 * Applied Materials' finned EPIC Center, Samsung's triple towers); everyone
 * else falls back to a richer-but-generic shape chosen by supply-chain layer.
 */
import { type Category, type Company } from './companies'

export type Archetype =
  | 'tower' // tiered glass HQ tower
  | 'slab' // wide mid-rise glass office
  | 'fab' // flat cleanroom shed
  | 'megaFab' // giant monolithic gigafab
  | 'ring' // Apple Park torus
  | 'vaultRoof' // NVIDIA Voyager triangular vaulted roof
  | 'researchCampus' // Applied Materials EPIC finned R&D block
  | 'tripleTower' // Samsung Digital City trio

/** Recognizable, building-specific signatures for the iconic sites. */
const SIGNATURES: Record<string, Archetype> = {
  apple: 'ring',
  nvidia: 'vaultRoof',
  'applied-materials': 'researchCampus',
  tsmc: 'megaFab',
  asml: 'megaFab',
  samsung: 'tripleTower',
  intel: 'slab',
  foxconn: 'megaFab',
  amd: 'tower',
  qualcomm: 'tripleTower',
  smic: 'megaFab',
  umc: 'megaFab',
  globalfoundries: 'megaFab',
  'sk-hynix': 'megaFab',
  broadcom: 'tower',
}

/** Default silhouette per supply-chain layer. */
const CATEGORY_DEFAULT: Record<Category, Archetype> = {
  eda: 'slab',
  design: 'tower',
  integration: 'slab',
  materials: 'fab',
  equipment: 'fab',
  foundry: 'megaFab',
  osat: 'fab',
}

export function archetypeFor(company: Company): Archetype {
  return SIGNATURES[company.id] ?? CATEGORY_DEFAULT[company.category]
}

/** Optional flagship-site name shown in the detail panel for iconic sites. */
export const LANDMARK_NAME: Record<string, string> = {
  apple: 'Apple Park',
  nvidia: 'Voyager HQ',
  'applied-materials': 'EPIC Center',
  tsmc: 'Fab 18 · GIGAFAB',
  asml: 'EUV Campus',
  samsung: 'Samsung Digital City',
  intel: 'Robert Noyce Building',
  foxconn: 'Longhua Megacomplex',
  globalfoundries: 'Fab 8',
}

/** Nominal building top (world units, full scale) — drives hub label height. */
export const ARCHETYPE_TOP: Record<Archetype, number> = {
  tower: 21,
  slab: 13,
  fab: 7,
  megaFab: 10,
  ring: 6,
  vaultRoof: 11,
  researchCampus: 12,
  tripleTower: 19,
}
