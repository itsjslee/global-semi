import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type Company } from '../data/companies'
import { CATEGORY_COLORS } from '../lib/colors'
import { GLOBE_RADIUS, latLngToVector3 } from '../lib/geo'
import { WAYPOINTS } from '../data/waypoints'
import { useAtlasStore } from '../store/useAtlasStore'
import { MarkerPill, MARKER_DISTANCE_FACTOR } from './MarkerPill'

const smooth01 = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

export function CompanyMarker({ company }: { company: Company }) {
  const color = CATEGORY_COLORS[company.category]

  // Static geometry: anchor on the surface, pill floats just above it.
  const dotPos = useMemo(() => latLngToVector3(company.lat, company.lng, 0.012), [company])
  const pillPos = useMemo(() => latLngToVector3(company.lat, company.lng, 0.055), [company])
  const dir = useMemo(() => dotPos.clone().normalize(), [dotPos])

  const wrapRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<THREE.Mesh>(null)

  useFrame(({ camera }) => {
    const wrap = wrapRef.current
    const dot = dotRef.current
    if (!wrap || !dot) return

    const { activeNode, hoverNode, activeWaypoint } = useAtlasStore.getState()

    // ── Far-side culling: fade pills as they round the limb of the globe ──
    const camLen = camera.position.length() || 1
    const cos = dir.dot(camera.position) / camLen
    const horizon = (GLOBE_RADIUS * 0.86) / camLen
    let facing = smooth01((cos - horizon) / 0.12)

    // Declutter: hide non-key nodes when zoomed all the way out (global view).
    if (!company.key) facing *= 1 - smooth01((camLen - 240) / 60)

    // ── Emphasis: spotlight the active stop's companies, dim the rest ─────
    const isActive = activeNode === company.id
    const isHover = hoverNode === company.id
    const focus = WAYPOINTS[activeWaypoint]?.companies ?? []
    const relevant = isActive || isHover || focus.length === 0 || focus.includes(company.id)
    const emphasis = isActive || isHover ? 1 : relevant ? 0.92 : 0.16

    wrap.style.opacity = String(facing * emphasis)
    wrap.style.pointerEvents = facing > 0.5 && emphasis > 0.5 ? 'auto' : 'none'
    wrap.classList.toggle('is-active', isActive)
    wrap.classList.toggle('is-dim', !relevant)

    // 3D anchor dot mirrors the same visibility + a pop on select/hover.
    const targetScale = (isActive ? 2.2 : isHover ? 1.7 : 1) * Math.max(0.001, facing)
    dot.scale.setScalar(THREE.MathUtils.lerp(dot.scale.x, targetScale, 0.25))
    dot.visible = facing > 0.02
    const mat = dot.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = isActive || isHover ? 1.4 : 0.7
  })

  return (
    <>
      <mesh ref={dotRef} position={dotPos}>
        <icosahedronGeometry args={[1.5, 0]} />
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
