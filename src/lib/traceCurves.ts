import * as THREE from 'three'
import { buildArcCurve, latLngToVector3 } from './geo'
import { COMPANY_BY_ID } from '../data/companies'
import { TRACE_BY_ID } from '../data/traces'

/**
 * Memoized arc curve per trace id. Both the TubeGeometry (in TraceArcs) and the
 * camera fly-through (in CameraRig) read from the same cached curve so the
 * pulse and the camera stay perfectly in sync.
 */
const cache = new Map<string, THREE.CurvePath<THREE.Vector3>>()

/** Endpoints sit just above the surface so arcs clear the extruded landmasses. */
const NODE_ALTITUDE = 0.012

export function getTraceCurve(traceId: string): THREE.CurvePath<THREE.Vector3> | null {
  const cached = cache.get(traceId)
  if (cached) return cached

  const trace = TRACE_BY_ID[traceId]
  if (!trace) return null

  const points = trace.sequence
    .map((id) => COMPANY_BY_ID[id])
    .filter(Boolean)
    .map((c) => latLngToVector3(c.lat, c.lng, NODE_ALTITUDE))

  if (points.length < 2) return null

  const curve = buildArcCurve(points)
  cache.set(traceId, curve)
  return curve
}
