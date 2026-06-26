import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { HUBS, type Hub } from '../data/hubs'
import { GLOBE_RADIUS, latLngToVector3 } from '../lib/geo'
import { PALETTE } from '../lib/colors'
import { useAtlasStore } from '../store/useAtlasStore'

const WORLD_UP = new THREE.Vector3(0, 1, 0)
const smooth01 = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

/**
 * A standing map-pin beacon for one regional hub. Clicking its label dives the
 * camera into that hub's isometric city. Pins are the primary "prominent
 * region" affordance on the globe (the per-company buildings stay unlabeled
 * until hovered).
 */
function RegionPin({ hub }: { hub: Hub }) {
  const anchor = useMemo(() => latLngToVector3(hub.lat, hub.lng, 0.014), [hub])
  const dir = useMemo(() => anchor.clone().normalize(), [anchor])
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(WORLD_UP, dir), [dir])
  const labelPos = useMemo(() => anchor.clone().addScaledVector(dir, 12.5), [anchor, dir])

  const enterHub = useAtlasStore((s) => s.enterHub)
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useFrame(({ camera, clock }) => {
    const group = groupRef.current
    if (!group) return
    const camLen = camera.position.length() || 1
    const cos = dir.dot(camera.position) / camLen
    const horizon = (GLOBE_RADIUS * 0.82) / camLen
    const facing = smooth01((cos - horizon) / 0.1)
    group.visible = facing > 0.02

    if (headRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 3) * 0.12
      headRef.current.scale.setScalar(pulse)
    }
    if (wrapRef.current) {
      wrapRef.current.style.opacity = String(facing)
      wrapRef.current.style.pointerEvents = facing > 0.55 ? 'auto' : 'none'
    }
  })

  return (
    <>
      <group ref={groupRef} position={anchor} quaternion={quaternion}>
        {/* Pole */}
        <mesh position={[0, 4, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 8, 8]} />
          <meshStandardMaterial color={'#16202A'} roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Glowing head */}
        <mesh ref={headRef} position={[0, 9, 0]} castShadow>
          <sphereGeometry args={[2.1, 16, 16]} />
          <meshStandardMaterial
            color={PALETTE.mint}
            emissive={PALETTE.mint}
            emissiveIntensity={0.9}
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>
        {/* Base ring on the surface */}
        <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 2.6, 24]} />
          <meshBasicMaterial color={PALETTE.mint} transparent opacity={0.7} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <Html position={labelPos} center distanceFactor={170} zIndexRange={[30, 0]}>
        <div ref={wrapRef} className="region-pin-wrap pointer-events-none" style={{ opacity: 0 }}>
          <button
            type="button"
            className="region-pin-label"
            onClick={(e) => {
              e.stopPropagation()
              enterHub(hub.id)
            }}
          >
            <span className="region-pin-dot" />
            {hub.name}
          </button>
        </div>
      </Html>
    </>
  )
}

/** All regional hub pins for the macro globe. */
export function RegionPins() {
  return (
    <group>
      {HUBS.map((hub) => (
        <RegionPin key={hub.id} hub={hub} />
      ))}
    </group>
  )
}
