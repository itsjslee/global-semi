import { GLOBE_RADIUS } from '../lib/geo'

/**
 * A single sharp directional key light produces the clean, isometric-style
 * shadows the art direction calls for; ambient + hemisphere fill keeps the
 * shaded sides from going muddy.
 */
export function Lighting() {
  const R = GLOBE_RADIUS
  return (
    <>
      <ambientLight intensity={0.55} color="#cfe0ec" />
      <hemisphereLight args={['#e7eef4', '#21425a', 0.55]} />

      <directionalLight
        castShadow
        color="#FFF1DC"
        intensity={2.3}
        position={[R * 1.9, R * 2.3, R * 1.4]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-normalBias={0.6}
        shadow-camera-near={R * 0.5}
        shadow-camera-far={R * 7}
        shadow-camera-left={-R * 1.7}
        shadow-camera-right={R * 1.7}
        shadow-camera-top={R * 1.7}
        shadow-camera-bottom={-R * 1.7}
      />

      {/* Soft cool rim from the opposite side for separation from the bg. */}
      <directionalLight color="#9fc2dd" intensity={0.4} position={[-R * 2, -R * 0.5, -R * 1.5]} />
    </>
  )
}
