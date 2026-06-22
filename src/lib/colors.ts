/**
 * Central palette. These values are shared between the 3D scene (THREE.Color
 * accepts the hex strings directly) and the Tailwind config so the UI overlay
 * and the WebGL scene stay in lockstep.
 */
export const PALETTE = {
  ocean: '#1A3A54',
  oceanDeep: '#12293C',
  land: '#E2D9C5',
  landSide: '#C9BFA6',
  landStroke: '#B4A988',
  cloud: '#FBFAF6',
  sky: '#BCD4E6',
  mint: '#00A86B',
  coral: '#FF7F66',
  paper: '#FBFAF6',
  ink: '#16202A',
} as const

/** Supply-chain layer → accent color (3D node + UI badge). */
export const CATEGORY_COLORS: Record<string, string> = {
  eda: '#7C5CFF', // violet
  materials: '#C56B4A', // terracotta
  equipment: '#F2A33C', // amber
  design: '#00A86B', // mint
  foundry: '#2E8BC0', // blue
  osat: '#FF7F66', // coral
  integration: '#5E708A', // slate-grey
}
