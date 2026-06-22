/**
 * The scroll-driven camera timeline. Scrolling the page maps a fractional
 * index across this array; the CameraRig blends between consecutive stops.
 *
 * The camera ALWAYS looks at the globe center (0,0,0) — see waypointCamera — so
 * the globe stays locked dead-center. A waypoint instead positions the camera
 * along its focus point's surface normal, which swings that region to face the
 * viewer; `distance` controls how close (how zoomed) and `tilt` the obliqueness.
 */
export interface Waypoint {
  id: string
  label: string
  region: string
  lat: number
  lng: number
  /** Camera distance beyond the surface focus, in world units (globe R = 100). */
  distance: number
  /** Oblique angle in degrees (0 = straight along the normal). */
  tilt: number
  /** Node ids emphasised at this stop (the rest dim). */
  companies: string[]
}

export const WAYPOINTS: Waypoint[] = [
  {
    id: 'global',
    label: 'Global View',
    region: 'The interconnected web',
    // Centered on the contiguous US so it faces the viewer at startup.
    lat: 39.5,
    lng: -98.5,
    distance: 300,
    tilt: 6,
    companies: [],
  },
  {
    id: 'us-west',
    label: 'Silicon Valley & US West',
    region: 'NorCal · SoCal',
    lat: 36.5,
    lng: -120,
    distance: 120,
    tilt: 16,
    companies: [
      'synopsys',
      'cadence',
      'nvidia',
      'amd',
      'intel',
      'broadcom',
      'applied-materials',
      'lam-research',
      'kla',
      'apple',
      'qualcomm',
      'supermicro',
    ],
  },
  {
    id: 'southwest',
    label: 'The Desert & Southwest',
    region: 'Arizona · Texas',
    lat: 33,
    lng: -103,
    distance: 150,
    tilt: 16,
    companies: ['amkor', 'siemens-eda', 'ti', 'marvell'],
  },
  {
    id: 'east-asia',
    label: 'East Asia Hub',
    region: 'Taiwan · Korea · China',
    lat: 30,
    lng: 122,
    distance: 150,
    tilt: 14,
    companies: [
      'tsmc',
      'umc',
      'mediatek',
      'globalwafers',
      'ase',
      'foxconn',
      'pegatron',
      'quanta',
      'samsung',
      'sk-hynix',
      'smic',
      'jcet',
      'tfme',
    ],
  },
  {
    id: 'japan',
    label: 'Japan Innovation',
    region: 'Tokyo · materials & tools',
    lat: 36,
    lng: 139,
    distance: 95,
    tilt: 16,
    companies: ['tokyo-electron', 'shin-etsu', 'sumco', 'nikon', 'canon', 'tok'],
  },
  {
    id: 'europe',
    label: 'European Core',
    region: 'NL · DE · CH · FR · UK',
    lat: 50,
    lng: 5,
    distance: 140,
    tilt: 16,
    companies: ['asml', 'arm', 'nxp', 'infineon', 'st', 'siltronic', 'merck', 'air-liquide', 'linde'],
  },
]
