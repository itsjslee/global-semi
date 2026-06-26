import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { getHubLayout } from '../data/hubs'
import { PALETTE } from '../lib/colors'
import { useAtlasStore } from '../store/useAtlasStore'
import { Building } from './Building'
import { HubLinks } from './HubLinks'
import { CityFabric, cityRadius } from './CityFabric'

/** A rounded rectangle Shape, used to extrude the low-poly land "peninsula". */
function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0)
  s.lineTo(x + w, y + h - r)
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2)
  s.lineTo(x + r, y + h)
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
  s.lineTo(x, y + r)
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
  return s
}

/**
 * The isometric "micro" view: a single hub rendered as a low-poly peninsula —
 * a warm land platform on a slate sea, a faint planning grid, procedurally
 * generated fab/HQ buildings, and live data-link splines. The whole grid is
 * centered on the world origin so the camera's look target stays at (0,0,0),
 * keeping the subject locked dead-center per the centering guardrail.
 */
export function RegionalSkyline() {
  const hubId = useAtlasStore((s) => s.activeHub)
  const layout = useMemo(() => getHubLayout(hubId), [hubId])
  const heroes = useMemo(
    () => layout.placements.map((p) => ({ x: p.x, z: p.z })),
    [layout],
  )
  const R = useMemo(() => cityRadius(layout.radius), [layout.radius])

  const platform = useMemo(() => {
    const size = R * 2.2
    const shape = roundedRect(size, size * 0.86, size * 0.2)
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: false })
    geom.rotateX(-Math.PI / 2)
    geom.computeVertexNormals()
    return geom
  }, [R])

  // Rise-and-settle entrance whenever a new hub mounts.
  const rootRef = useRef<THREE.Group>(null)
  const anim = useRef(0)
  useEffect(() => {
    anim.current = 0 // restart the entrance on hub change
  }, [hubId])

  useFrame((_, dt) => {
    const root = rootRef.current
    if (!root) return
    anim.current = Math.min(1, anim.current + dt * 1.8)
    const e = 1 - Math.pow(1 - anim.current, 3) // easeOutCubic
    root.position.y = (1 - e) * -8
    const s = 0.94 + e * 0.06
    root.scale.set(s, s, s)
  })

  useEffect(() => {
    return () => {
      platform.dispose()
    }
  }, [platform])

  // A few low-poly islands dotting the surrounding sea.
  const islands = useMemo(() => {
    const out: { x: number; z: number; r: number }[] = []
    const rng = (n: number) => ((Math.sin(n * 999.7) + 1) % 1)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4
      const dist = R * (1.35 + rng(i) * 0.5)
      out.push({ x: Math.cos(a) * dist, z: Math.sin(a) * dist, r: 6 + rng(i + 9) * 10 })
    }
    return out
  }, [R])

  return (
    <group ref={rootRef}>
      {/* Sea */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[R * 9, R * 9]} />
        <meshStandardMaterial color={PALETTE.ocean} roughness={1} metalness={0} />
      </mesh>

      {/* Outlying islands */}
      {islands.map((isl, i) => (
        <mesh key={i} position={[isl.x, -1.0, isl.z]} receiveShadow castShadow>
          <cylinderGeometry args={[isl.r, isl.r * 1.15, 1, 7]} />
          <meshStandardMaterial color={PALETTE.land} roughness={1} flatShading />
        </mesh>
      ))}

      {/* Land platform (the city ground) */}
      <mesh geometry={platform} castShadow receiveShadow position={[0, -1.2, 0]}>
        <meshStandardMaterial color={PALETTE.land} roughness={1} metalness={0} flatShading />
      </mesh>

      {/* Dense procedural city around the hero HQs */}
      <CityFabric hubId={hubId} hubRadius={layout.radius} heroes={heroes} />

      {/* Hero HQ landmarks */}
      {layout.placements.map((p) => (
        <Building key={p.company.id} company={p.company} x={p.x} z={p.z} />
      ))}

      {/* Live supply-chain data links for the selected node */}
      <HubLinks />
    </group>
  )
}
