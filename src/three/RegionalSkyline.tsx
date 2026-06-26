import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { getHubLayout } from '../data/hubs'
import { PALETTE } from '../lib/colors'
import { useAtlasStore } from '../store/useAtlasStore'
import { Building } from './Building'
import { HubLinks } from './HubLinks'

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

  const platform = useMemo(() => {
    const size = layout.radius * 2.3
    const shape = roundedRect(size, size * 0.82, Math.min(size, size * 0.82) * 0.22)
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: false })
    geom.rotateX(-Math.PI / 2)
    geom.computeVertexNormals()
    return geom
  }, [layout.radius])

  const grid = useMemo(() => {
    const span = layout.radius * 2.1
    const g = new THREE.GridHelper(span, Math.max(8, Math.round(span / layout.cell)), PALETTE.sky, PALETTE.sky)
    const mat = g.material as THREE.LineBasicMaterial
    mat.transparent = true
    mat.opacity = 0.16
    g.position.y = 0.06
    return g
  }, [layout])

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
      ;(grid.material as THREE.Material).dispose()
      grid.geometry.dispose()
    }
  }, [platform, grid])

  return (
    <group ref={rootRef}>
      {/* Sea */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
        <planeGeometry args={[layout.radius * 7, layout.radius * 7]} />
        <meshStandardMaterial color={PALETTE.ocean} roughness={1} metalness={0} />
      </mesh>

      {/* Land platform */}
      <mesh geometry={platform} castShadow receiveShadow position={[0, -1.2, 0]}>
        <meshStandardMaterial color={PALETTE.land} roughness={1} metalness={0} flatShading />
      </mesh>

      {/* Planning grid */}
      <primitive object={grid} />

      {/* Procedural skyline */}
      {layout.placements.map((p) => (
        <Building key={p.company.id} company={p.company} x={p.x} z={p.z} />
      ))}

      {/* Live supply-chain data links for the selected node */}
      <HubLinks />
    </group>
  )
}
