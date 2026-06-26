import * as THREE from 'three'
import type { Waypoint } from '../data/waypoints'

/**
 * Globe radius. This is `three-globe`'s default GLOBE_RADIUS — we match it
 * exactly so our hand-placed nodes/arcs land on the same sphere as the
 * library's extruded country meshes.
 */
export const GLOBE_RADIUS = 100

const DEG2RAD = Math.PI / 180

/**
 * Latitude/longitude → world position, replicating `three-globe`'s internal
 * `polar2Cartesian`. `altitude` is a fraction of the radius (0 = surface).
 * Keep this in sync with the library or markers will drift off their country.
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  altitude = 0,
  out = new THREE.Vector3(),
): THREE.Vector3 {
  const phi = (90 - lat) * DEG2RAD
  const theta = (90 - lng) * DEG2RAD
  const r = GLOBE_RADIUS * (1 + altitude)
  return out.set(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

/** Outward unit normal at a given lat/lng. */
export function surfaceNormal(lat: number, lng: number, out = new THREE.Vector3()) {
  return latLngToVector3(lat, lng, 0, out).normalize()
}

const _worldUp = new THREE.Vector3(0, 1, 0)

/**
 * Camera position + look target for a waypoint.
 *
 * The look target is ALWAYS the globe center (0,0,0), so the globe stays pinned
 * to the middle of the screen. The camera is positioned along the focus point's
 * surface normal — which rotates that region to face the viewer — then tilted
 * `tilt` degrees toward the south for a touch of oblique 3D.
 */
export function waypointCamera(
  wp: Pick<Waypoint, 'lat' | 'lng' | 'distance' | 'tilt'>,
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const focus = latLngToVector3(wp.lat, wp.lng, 0)
  const normal = focus.clone().normalize()

  // Build a local tangent frame (east / north) so we can tilt predictably.
  const east = new THREE.Vector3().crossVectors(_worldUp, normal)
  if (east.lengthSq() < 1e-6) east.set(1, 0, 0) // at the poles, pick any tangent
  east.normalize()
  const north = new THREE.Vector3().crossVectors(normal, east).normalize()

  const tilt = wp.tilt * DEG2RAD
  // Lean the camera offset away from straight-up, toward the south, so the
  // view looks "north and down" onto the region.
  const camDir = normal
    .clone()
    .multiplyScalar(Math.cos(tilt))
    .add(north.multiplyScalar(-Math.sin(tilt)))
    .normalize()

  const position = focus.clone().add(camDir.multiplyScalar(wp.distance))
  // Always look at the globe center so it never drifts off-screen.
  return { position, target: new THREE.Vector3(0, 0, 0) }
}

/**
 * Build a smooth arc curve that arches over the globe through an ordered list
 * of surface points. Each leg is a quadratic Bézier whose control point is
 * lifted above the great-circle midpoint — longer legs arch higher. Returned
 * as a CurvePath so it can drive both a TubeGeometry and a camera fly-through
 * (uv.x on the tube == arc-length fraction == curve.getPointAt(t)).
 */
export function buildArcCurve(points: THREE.Vector3[]): THREE.CurvePath<THREE.Vector3> {
  const path = new THREE.CurvePath<THREE.Vector3>()
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const angle = a.angleTo(b) // radians of separation on the sphere
    const lift = GLOBE_RADIUS * (0.12 + angle * 0.45)
    const mid = a.clone().add(b).multiplyScalar(0.5)
    const control = mid.normalize().multiplyScalar(GLOBE_RADIUS + lift)
    path.add(new THREE.QuadraticBezierCurve3(a.clone(), control, b.clone()))
  }
  return path
}

// ── Flat "micro" map (equirectangular) ─────────────────────────────────────

/** World units per degree on the flat map. */
export const MAP_SCALE = 1.25

/** Extrusion height of the flat-map landmasses (also where markers sit). */
export const FLAT_EXTRUDE = 1.4

/**
 * Lat/lng → flat-map world position. The map lies in the XZ plane:
 *   x = lng (east +X),  z = -lat (north −Z, so north reads "up" on screen).
 * `y` lifts a marker above the extruded landmasses.
 */
export function latLngToFlat(lat: number, lng: number, y = 0, out = new THREE.Vector3()) {
  return out.set(lng * MAP_SCALE, y, -lat * MAP_SCALE)
}

/**
 * Camera pose for a waypoint on the flat map. Parked north of and above the
 * focus, tilted down — east stays on the right, north reads up. Waypoint 0
 * frames the whole board; the rest zoom into their region.
 */
export function microCamera(
  wp: Pick<Waypoint, 'lat' | 'lng' | 'distance'>,
  index: number,
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const focus = index === 0 ? new THREE.Vector3(0, 0, 0) : latLngToFlat(wp.lat, wp.lng, 0)
  const height = index === 0 ? 560 : wp.distance * 1.5
  const back = index === 0 ? 150 : wp.distance * 0.6
  const position = focus.clone().add(new THREE.Vector3(0, height, back))
  return { position, target: focus }
}

// ── Isometric "micro" hub framing ───────────────────────────────────────────

/**
 * Camera pose for the isometric regional skyline. The hub grid is centered on
 * the world origin, so the look target is (0,0,0) — the subject stays locked
 * dead-center. The camera sits at a fixed iso-style azimuth/elevation and backs
 * off by an amount proportional to the grid's radius so any hub frames cleanly.
 */
export function isoHubCamera(radius: number): {
  position: THREE.Vector3
  target: THREE.Vector3
} {
  const az = 42 * DEG2RAD // azimuth around +Y
  const el = 33 * DEG2RAD // elevation above the ground plane
  const dist = radius * 3.4 + 36
  const dir = new THREE.Vector3(
    Math.cos(el) * Math.cos(az),
    Math.sin(el),
    Math.cos(el) * Math.sin(az),
  )
  return { position: dir.multiplyScalar(dist), target: new THREE.Vector3(0, 0, 0) }
}

/** Clamp helper. */
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Smoothstep easing for interpolation. */
export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}
