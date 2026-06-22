import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useAtlasStore, WAYPOINT_COUNT, type ManualOffset } from '../store/useAtlasStore'
import { WAYPOINTS } from '../data/waypoints'
import { clamp, GLOBE_RADIUS, microCamera, smoothstep, waypointCamera } from '../lib/geo'
import { getTraceCurve } from '../lib/traceCurves'

/** Loops per second the pulse (and camera) travel along the active trace. */
const TRACE_SPEED = 0.05

/** Idle auto-rotation: spin speed (rad/s) and how long after an interaction it resumes. */
const AUTO_ROTATE_SPEED = 0.06
const IDLE_SECONDS = 2.5

const WORLD_UP = new THREE.Vector3(0, 1, 0)

// Scratch objects reused every frame (single rig instance → safe to share).
const _desiredPos = new THREE.Vector3()
const _desiredTarget = new THREE.Vector3()
const _at = new THREE.Vector3()
const _ahead = new THREE.Vector3()
const _tan = new THREE.Vector3()
const _up = new THREE.Vector3()
const _off = new THREE.Vector3()
const _dirN = new THREE.Vector3()
const _right = new THREE.Vector3()
const _qYaw = new THREE.Quaternion()
const _qPitch = new THREE.Quaternion()

function dampVec(cur: THREE.Vector3, tgt: THREE.Vector3, lambda: number, dt: number) {
  cur.x = THREE.MathUtils.damp(cur.x, tgt.x, lambda, dt)
  cur.y = THREE.MathUtils.damp(cur.y, tgt.y, lambda, dt)
  cur.z = THREE.MathUtils.damp(cur.z, tgt.z, lambda, dt)
}

/** True when the user is actively steering with the keyboard. */
function manualEngaged(m: ManualOffset) {
  return m.yaw !== 0 || m.pitch !== 0 || m.zoom !== 0
}

/**
 * Keyboard orbit. Rotates the camera position AROUND THE GLOBE CENTER (origin),
 * not around the waypoint focus:
 *   • yaw   → azimuth about world-up (Left/Right arrows spin the globe),
 *   • pitch → elevation about the camera's right axis (Up/Down),
 *   • zoom  → radial distance from center.
 * Paired with a lookAt of (0,0,0), this keeps the globe pinned to the center of
 * the screen — the camera never translates in X/Y, it only orbits.
 */
function orbitAroundCenter(pos: THREE.Vector3, manual: ManualOffset) {
  _off.copy(pos).multiplyScalar(1 + manual.zoom)

  _qYaw.setFromAxisAngle(WORLD_UP, manual.yaw)
  _off.applyQuaternion(_qYaw)

  _dirN.copy(_off).normalize()
  _right.crossVectors(WORLD_UP, _dirN)
  if (_right.lengthSq() < 1e-6) _right.set(1, 0, 0)
  _right.normalize()
  _qPitch.setFromAxisAngle(_right, manual.pitch)
  _off.applyQuaternion(_qPitch)

  _off.setLength(clamp(_off.length(), GLOBE_RADIUS * 1.15, GLOBE_RADIUS * 7))
  pos.copy(_off) // camera = origin + offset → strictly orbits the center
}

/**
 * Drives the camera in 'tour' mode:
 *   • Trace playing → fly behind the moving pulse along the active arc.
 *   • Macro → blend between waypoints, always looking at the globe center, with
 *     a slow idle auto-rotation on the global hero that pauses on interaction.
 *   • Micro → top-down flat-map framing.
 * In 'explore' mode it yields entirely to OrbitControls.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const target = useRef(new THREE.Vector3(0, 0, 0))

  // Idle auto-rotation bookkeeping.
  const autoAngle = useRef(0)
  const lastInteract = useRef(0)
  const prevScroll = useRef(0)
  const prevManualKey = useRef('0,0,0')

  useFrame((state, rawDt) => {
    const s = useAtlasStore.getState()
    const now = state.clock.elapsedTime
    const dt = Math.min(rawDt, 0.05) // guard against huge dt after tab refocus

    // ── Interaction tracking (drives the auto-rotation pause) ─────────────
    const manualKey = `${s.manual.yaw},${s.manual.pitch},${s.manual.zoom}`
    if (manualKey !== prevManualKey.current) {
      prevManualKey.current = manualKey
      lastInteract.current = now
    }
    if (Math.abs(s.scrollProgress - prevScroll.current) > 1e-4) {
      prevScroll.current = s.scrollProgress
      lastInteract.current = now
    }
    if (s.mode === 'explore' || s.tracePlaying) lastInteract.current = now

    if (s.mode === 'explore') return // OrbitControls owns the camera

    // ── Micro (flat map): blend the top-down framing across waypoints ──────
    if (s.viewMode === 'micro') {
      const sp = clamp(s.scrollProgress, 0, WAYPOINT_COUNT - 1)
      const i = Math.floor(sp)
      const j = Math.min(i + 1, WAYPOINT_COUNT - 1)
      const f = smoothstep(sp - i)

      const a = microCamera(WAYPOINTS[i], i)
      const b = microCamera(WAYPOINTS[j], j)
      _desiredPos.copy(a.position).lerp(b.position, f)
      if (manualEngaged(s.manual)) {
        orbitAroundCenter(_desiredPos, s.manual)
        _desiredTarget.set(0, 0, 0) // lock lookAt to the map center
      } else {
        _desiredTarget.copy(a.target).lerp(b.target, f)
      }
      dampVec(camera.position, _desiredPos, 3.5, dt)
      dampVec(target.current, _desiredTarget, 4.5, dt)
      camera.lookAt(target.current)
      return
    }

    if (s.tracePlaying) {
      const curve = getTraceCurve(s.activeTraceId)
      if (curve) {
        const p = (s.tourProgress + dt * TRACE_SPEED) % 1
        s.setTourProgress(p)

        curve.getPointAt(clamp(p, 0, 1), _at)
        curve.getPointAt(Math.min(p + 0.03, 1), _ahead)

        _tan.copy(_ahead).sub(_at)
        if (_tan.lengthSq() < 1e-6) _tan.set(0, 0, 1)
        _tan.normalize()
        _up.copy(_at).normalize()

        // Behind and above the pulse → cinematic chase cam.
        _desiredPos.copy(_at).addScaledVector(_tan, -14).addScaledVector(_up, 9)
        _desiredTarget.copy(_ahead)

        dampVec(camera.position, _desiredPos, 5, dt)
        dampVec(target.current, _desiredTarget, 6, dt)
        camera.lookAt(target.current)
        return
      }
    }

    // ── Macro waypoint blend (always looking at the globe center) ─────────
    const sp = clamp(s.scrollProgress, 0, WAYPOINT_COUNT - 1)
    const i = Math.floor(sp)
    const j = Math.min(i + 1, WAYPOINT_COUNT - 1)
    const f = smoothstep(sp - i)

    const a = waypointCamera(WAYPOINTS[i])
    const b = waypointCamera(WAYPOINTS[j])
    _desiredPos.copy(a.position).lerp(b.position, f)

    // Idle auto-rotation: strongest at the global hero (sp≈0), fading out as you
    // descend into a region, and paused while the user is interacting.
    const autoWeight = 1 - smoothstep(clamp(sp, 0, 1))
    if (autoWeight < 0.5) autoAngle.current = 0 // reset away from the hero
    const idle = now - lastInteract.current > IDLE_SECONDS
    if (autoWeight > 0.98 && idle) {
      autoAngle.current = (autoAngle.current + dt * AUTO_ROTATE_SPEED) % (Math.PI * 2)
    }
    if (autoAngle.current !== 0) {
      _desiredPos.applyAxisAngle(WORLD_UP, autoAngle.current * autoWeight)
    }

    // Keyboard rotation orbits the globe center too — globe never drifts.
    if (manualEngaged(s.manual)) orbitAroundCenter(_desiredPos, s.manual)
    _desiredTarget.set(0, 0, 0)

    dampVec(camera.position, _desiredPos, 3.5, dt)
    dampVec(target.current, _desiredTarget, 4.5, dt)
    camera.lookAt(target.current)
  })

  return null
}
