import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { loadCountries, type CountryFeature } from '../lib/countries'
import { FLAT_EXTRUDE, MAP_SCALE } from '../lib/geo'
import { PALETTE } from '../lib/colors'

const MAP_HALF_W = 180 * MAP_SCALE // |lng| 180 → half width
const MAP_HALF_H = 90 * MAP_SCALE // |lat| 90 → half height

/**
 * Build flat country shapes in the XY plane (x = lng, y = lat). We extrude
 * them and then rotate the geometry into the XZ plane so x = lng·S, z = -lat·S
 * (matching `latLngToFlat`), with the extrusion pointing up (+Y).
 */
function buildLandGeometry(features: CountryFeature[]): THREE.ExtrudeGeometry {
  const shapes: THREE.Shape[] = []

  for (const f of features) {
    const { type, coordinates } = f.geometry
    const polys = (type === 'Polygon' ? [coordinates] : coordinates) as number[][][][]

    for (const rings of polys) {
      if (!rings.length) continue
      const shape = new THREE.Shape()
      rings[0].forEach(([lng, lat], i) => {
        const x = lng * MAP_SCALE
        const y = lat * MAP_SCALE
        if (i === 0) shape.moveTo(x, y)
        else shape.lineTo(x, y)
      })
      for (let h = 1; h < rings.length; h++) {
        const hole = new THREE.Path()
        rings[h].forEach(([lng, lat], i) => {
          const x = lng * MAP_SCALE
          const y = lat * MAP_SCALE
          if (i === 0) hole.moveTo(x, y)
          else hole.lineTo(x, y)
        })
        shape.holes.push(hole)
      }
      shapes.push(shape)
    }
  }

  const geom = new THREE.ExtrudeGeometry(shapes, { depth: FLAT_EXTRUDE, bevelEnabled: false })
  geom.rotateX(-Math.PI / 2) // lay flat: XY map → XZ, extrude → +Y
  geom.computeVertexNormals()
  return geom
}

/**
 * The "Micro View": a flat low-poly map on a grid. Same countries data as the
 * globe, projected equirectangular, on a slate ocean with a faint map grid.
 */
export function FlatMap() {
  const [features, setFeatures] = useState<CountryFeature[] | null>(null)

  useEffect(() => {
    let cancelled = false
    loadCountries().then((f) => !cancelled && setFeatures(f))
    return () => {
      cancelled = true
    }
  }, [])

  const landGeometry = useMemo(
    () => (features ? buildLandGeometry(features) : null),
    [features],
  )

  const landMaterials = useMemo(
    () => [
      // group 0 = caps (top/bottom), group 1 = extruded sides
      new THREE.MeshStandardMaterial({
        color: PALETTE.land,
        roughness: 1,
        metalness: 0,
        flatShading: true,
      }),
      new THREE.MeshStandardMaterial({ color: PALETTE.landSide, roughness: 1, metalness: 0 }),
    ],
    [],
  )

  const grid = useMemo(() => {
    const g = new THREE.GridHelper(MAP_HALF_W * 2.2, 44, PALETTE.sky, PALETTE.sky)
    const mat = g.material as THREE.LineBasicMaterial
    mat.transparent = true
    mat.opacity = 0.12
    g.position.y = 0.04
    return g
  }, [])

  useEffect(() => {
    return () => {
      landGeometry?.dispose()
      landMaterials.forEach((m) => m.dispose())
      ;(grid.material as THREE.Material).dispose()
      grid.geometry.dispose()
    }
  }, [landGeometry, landMaterials, grid])

  return (
    <group>
      {/* Ocean */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <planeGeometry args={[MAP_HALF_W * 2.6, MAP_HALF_H * 2.8]} />
        <meshStandardMaterial color={PALETTE.ocean} roughness={1} metalness={0} />
      </mesh>

      {/* Map grid */}
      <primitive object={grid} />

      {/* Landmasses */}
      {landGeometry && (
        <mesh geometry={landGeometry} material={landMaterials} castShadow receiveShadow />
      )}
    </group>
  )
}
