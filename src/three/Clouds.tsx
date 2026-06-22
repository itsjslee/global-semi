import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { latLngToVector3 } from '../lib/geo'
import { PALETTE } from '../lib/colors'

const UP = new THREE.Vector3(0, 1, 0)
const CLOUD_ALTITUDE = 0.2 // fraction of radius above the surface

/** Where the clouds float (lat, lng) + a per-cloud size and shape seed. */
const CLOUD_DEFS = [
  { lat: 48, lng: -135, scale: 6, seed: 11 },
  { lat: 18, lng: -150, scale: 5, seed: 23 },
  { lat: 8, lng: -95, scale: 5.5, seed: 31 },
  { lat: 38, lng: -60, scale: 5, seed: 47 },
  { lat: 60, lng: -20, scale: 6.5, seed: 53 },
  { lat: 30, lng: 40, scale: 5, seed: 67 },
  { lat: 5, lng: 95, scale: 5.5, seed: 73 },
  { lat: 45, lng: 150, scale: 6, seed: 89 },
  { lat: -20, lng: 160, scale: 5, seed: 97 },
  { lat: -10, lng: -30, scale: 5, seed: 101 },
] as const

/** Tiny deterministic PRNG so cloud shapes are stable across renders. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Puff {
  pos: [number, number, number]
  r: number
}

function makePuffs(seed: number): Puff[] {
  const rng = mulberry32(seed)
  const count = 6 + Math.floor(rng() * 4)
  const puffs: Puff[] = [{ pos: [0, 0, 0], r: 1.0 }]
  for (let i = 1; i < count; i++) {
    puffs.push({
      pos: [(rng() * 2 - 1) * 1.4, (rng() - 0.5) * 0.3, (rng() * 2 - 1) * 1.4],
      r: 0.5 + rng() * 0.55,
    })
  }
  return puffs
}

function Cloud({ lat, lng, scale, seed }: { lat: number; lng: number; scale: number; seed: number }) {
  const { position, quaternion } = useMemo(() => {
    const p = latLngToVector3(lat, lng, CLOUD_ALTITUDE)
    const normal = p.clone().normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(UP, normal)
    return { position: p, quaternion: q }
  }, [lat, lng])

  const puffs = useMemo(() => makePuffs(seed), [seed])

  return (
    <group position={position} quaternion={quaternion} scale={scale}>
      {puffs.map((pf, i) => (
        <mesh key={i} castShadow position={pf.pos} scale={[pf.r * 1.15, pf.r * 0.6, pf.r * 1.15]}>
          {/* detail 1 keeps it low-poly but rounded — reads as a puff, not a rock */}
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={PALETTE.cloud} roughness={1} metalness={0} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/**
 * A slowly-drifting fleet of low-poly clouds. They sit between the key light
 * and the globe, casting the soft moving shadows that sell the 3D depth.
 */
export function Clouds() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.006
  })

  return (
    <group ref={groupRef}>
      {CLOUD_DEFS.map((c, i) => (
        <Cloud key={i} {...c} />
      ))}
    </group>
  )
}
