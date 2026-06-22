import { OrbitControls } from '@react-three/drei'
import { GLOBE_RADIUS } from '../lib/geo'
import { useAtlasStore } from '../store/useAtlasStore'

/**
 * Free-look orbit controls, mounted ONLY in Explore mode. Keeping it unmounted
 * the rest of the time prevents OrbitControls' per-frame `update()` from
 * fighting the CameraRig for the camera. On mount it initializes from the
 * camera's current pose, so handing off from a waypoint feels seamless.
 */
export function Controls() {
  const enabled = useAtlasStore((s) => s.mode === 'explore')
  if (!enabled) return null

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
      minDistance={GLOBE_RADIUS * 1.12}
      maxDistance={GLOBE_RADIUS * 4.2}
    />
  )
}
