import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type Company } from '../data/companies'
import { CATEGORY_COLORS } from '../lib/colors'
import { FLAT_EXTRUDE, latLngToFlat } from '../lib/geo'
import { WAYPOINTS } from '../data/waypoints'
import { useAtlasStore } from '../store/useAtlasStore'
import { MarkerPill, MARKER_DISTANCE_FACTOR } from './MarkerPill'

/** Flat-map marker: a small pin on the landmass + a floating logo pill above. */
export function FlatCompanyMarker({ company }: { company: Company }) {
  const color = CATEGORY_COLORS[company.category]

  const pinPos = useMemo(
    () => latLngToFlat(company.lat, company.lng, FLAT_EXTRUDE),
    [company],
  )
  const pillPos = useMemo(
    () => latLngToFlat(company.lat, company.lng, FLAT_EXTRUDE + 4),
    [company],
  )

  const wrapRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const wrap = wrapRef.current
    const dot = dotRef.current
    if (!wrap || !dot) return

    const { activeNode, hoverNode, activeWaypoint } = useAtlasStore.getState()
    const isActive = activeNode === company.id
    const isHover = hoverNode === company.id
    const focus = WAYPOINTS[activeWaypoint]?.companies ?? []
    const relevant = isActive || isHover || focus.length === 0 || focus.includes(company.id)
    const emphasis = isActive || isHover ? 1 : relevant ? 0.95 : 0.18

    wrap.style.opacity = String(emphasis)
    wrap.style.pointerEvents = emphasis > 0.5 ? 'auto' : 'none'
    wrap.classList.toggle('is-active', isActive)
    wrap.classList.toggle('is-dim', !relevant)

    const targetScale = isActive ? 1.9 : isHover ? 1.5 : 1
    dot.scale.setScalar(THREE.MathUtils.lerp(dot.scale.x, targetScale, 0.25))
    ;(dot.material as THREE.MeshStandardMaterial).emissiveIntensity = isActive || isHover ? 1.4 : 0.7
  })

  return (
    <>
      <mesh ref={dotRef} position={pinPos}>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          roughness={0.9}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      <Html position={pillPos} center distanceFactor={MARKER_DISTANCE_FACTOR} zIndexRange={[20, 0]}>
        <div ref={wrapRef} className="marker-wrap pointer-events-none flex flex-col items-center">
          <MarkerPill company={company} />
          <span className="marker-stem" />
        </div>
      </Html>
    </>
  )
}
