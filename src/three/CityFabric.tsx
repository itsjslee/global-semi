import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/** Half-extent of the procedural city built around a hub's hero buildings. */
export function cityRadius(hubRadius: number): number {
  return Math.min(96, Math.max(60, hubRadius * 1.9))
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedOf(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

const FILLER_TINTS = ['#DAD3C3', '#CBC3B0', '#E8E3D7', '#BFC6CC', '#AEB7BD', '#D2CBBA', '#9EA7AD', '#C4C9CE']

interface Filler {
  x: number
  z: number
  w: number
  d: number
  h: number
  color: THREE.Color
}
interface Tree {
  x: number
  z: number
  s: number
}

const _dummy = new THREE.Object3D()

/**
 * A dense, populated low-poly city packed around a hub's hero HQ buildings —
 * thousands of small filler blocks, street trees, and a faint road grid, all
 * generated deterministically per hub and drawn with two InstancedMeshes so the
 * whole metropolis costs only a couple of draw calls. Heroes get a clear radius
 * so the landmark buildings always read above the fabric.
 */
export function CityFabric({
  hubId,
  hubRadius,
  heroes,
}: {
  hubId: string
  hubRadius: number
  heroes: { x: number; z: number }[]
}) {
  const fillerRef = useRef<THREE.InstancedMesh>(null)
  const treeRef = useRef<THREE.InstancedMesh>(null)

  const { fillers, trees, R } = useMemo(() => {
    const rng = mulberry32(seedOf(hubId))
    const R = cityRadius(hubRadius)
    const step = 5.8
    const heroClear = 13
    const fillers: Filler[] = []
    const trees: Tree[] = []

    for (let gx = -R; gx <= R; gx += step) {
      for (let gz = -R; gz <= R; gz += step) {
        const x = gx + (rng() - 0.5) * step * 0.55
        const z = gz + (rng() - 0.5) * step * 0.55
        const r = Math.hypot(x, z)
        if (r > R) continue
        // Soft coastline: thin out near the rounded edge.
        if (r > R * 0.78 && rng() < (r - R * 0.78) / (R * 0.32)) continue
        // Keep the hero landmarks clear.
        if (heroes.some((hpt) => (hpt.x - x) ** 2 + (hpt.z - z) ** 2 < heroClear * heroClear)) continue

        const roll = rng()
        if (roll < 0.16) {
          // Parks / tree clusters punched into the grid.
          if (rng() < 0.7) trees.push({ x, z, s: 0.7 + rng() * 0.9 })
          continue
        }

        const downtown = 1 - Math.min(1, r / (R * 0.55))
        const h = 2 + rng() * 3.5 + downtown * downtown * (10 + rng() * 12)
        const w = 2.3 + rng() * 2.6
        const d = 2.3 + rng() * 2.6
        fillers.push({ x, z, w, d, h, color: new THREE.Color(FILLER_TINTS[(rng() * FILLER_TINTS.length) | 0]) })
        if (rng() < 0.13) trees.push({ x: x + (rng() - 0.5) * 4, z: z + (rng() - 0.5) * 4, s: 0.6 + rng() * 0.6 })
      }
    }
    return { fillers, trees, R }
  }, [hubId, hubRadius, heroes])

  useLayoutEffect(() => {
    const fm = fillerRef.current
    if (fm) {
      fillers.forEach((b, i) => {
        _dummy.position.set(b.x, b.h / 2, b.z)
        _dummy.scale.set(b.w, b.h, b.d)
        _dummy.rotation.set(0, 0, 0)
        _dummy.updateMatrix()
        fm.setMatrixAt(i, _dummy.matrix)
        fm.setColorAt(i, b.color)
      })
      fm.instanceMatrix.needsUpdate = true
      if (fm.instanceColor) fm.instanceColor.needsUpdate = true
      fm.computeBoundingSphere()
    }
    const tm = treeRef.current
    if (tm) {
      trees.forEach((t, i) => {
        _dummy.position.set(t.x, 1.5 * t.s, t.z)
        _dummy.scale.set(t.s, t.s, t.s)
        _dummy.rotation.set(0, 0, 0)
        _dummy.updateMatrix()
        tm.setMatrixAt(i, _dummy.matrix)
      })
      tm.instanceMatrix.needsUpdate = true
      tm.computeBoundingSphere()
    }
  }, [fillers, trees])

  const geoMat = useMemo(() => {
    return {
      fillerGeo: new THREE.BoxGeometry(1, 1, 1),
      fillerMat: new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0, flatShading: true }),
      treeGeo: new THREE.ConeGeometry(1.1, 2.6, 6),
      treeMat: new THREE.MeshStandardMaterial({ color: '#4E7A52', roughness: 1, flatShading: true }),
    }
  }, [])

  useLayoutEffect(() => {
    const g = geoMat
    return () => {
      g.fillerGeo.dispose()
      g.fillerMat.dispose()
      g.treeGeo.dispose()
      g.treeMat.dispose()
    }
  }, [geoMat])

  const roadGrid = useMemo(() => {
    const divisions = Math.max(8, Math.round((R * 2) / 7))
    const g = new THREE.GridHelper(R * 2, divisions, '#5a5f63', '#5a5f63')
    const mat = g.material as THREE.LineBasicMaterial
    mat.transparent = true
    mat.opacity = 0.22
    g.position.y = 0.05
    return g
  }, [R])

  useLayoutEffect(() => {
    return () => {
      ;(roadGrid.material as THREE.Material).dispose()
      roadGrid.geometry.dispose()
    }
  }, [roadGrid])

  return (
    <group>
      {fillers.length > 0 && (
        <instancedMesh
          ref={fillerRef}
          args={[geoMat.fillerGeo, geoMat.fillerMat, fillers.length]}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      )}

      {trees.length > 0 && (
        <instancedMesh
          ref={treeRef}
          args={[geoMat.treeGeo, geoMat.treeMat, trees.length]}
          castShadow
          frustumCulled={false}
        />
      )}

      {/* Main cross avenues for a stronger street read. */}
      {[
        [R * 2, 2.2] as const,
        [2.2, R * 2] as const,
      ].map(([w, d], i) => (
        <mesh key={i} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color={'#4C5256'} roughness={1} />
        </mesh>
      ))}

      <primitive object={roadGrid} />
    </group>
  )
}
