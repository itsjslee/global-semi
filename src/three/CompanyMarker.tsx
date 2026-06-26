import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type Company } from '../data/companies'
import { CATEGORY_COLORS } from '../lib/colors'
import { GLOBE_RADIUS, latLngToVector3 } from '../lib/geo'
import { archetypeFor, ARCHETYPE_TOP } from '../data/landmarks'
import { WAYPOINTS } from '../data/waypoints'
import { useAtlasStore } from '../store/useAtlasStore'
import { BuildingMesh } from './buildings'
import { MarkerPill, MARKER_DISTANCE_FACTOR } from './MarkerPill'

const smooth01 = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

const WORLD_UP = new THREE.Vector3(0, 1, 0)
/** Shrinks the full-scale hub buildings down to globe-surface props. */
const GLOBE_BUILD_SCALE = 0.34

export function CompanyMarker({ company }: { company: Company }) {
  const color = CATEGORY_COLORS[company.category]

  // Anchor on the land surface; orient the building's +Y to the surface normal.
  const anchor = useMemo(() => latLngToVector3(company.lat, company.lng, 0.012), [company])
  const dir = useMemo(() => anchor.clone().normalize(), [anchor])
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(WORLD_UP, dir),
    [dir],
  )
  const pillPos = useMemo(() => {
    const top = ARCHETYPE_TOP[archetypeFor(company)] * GLOBE_BUILD_SCALE
    return anchor.clone().addScaledVector(dir, top + 4)
  }, [anchor, dir, company])

  const wrapRef = useRef<HTMLDivElement>(null)
  const buildingRef = useRef<THREE.Group>(null)

  useFrame(({ camera }) => {
    const wrap = wrapRef.current
    const building = buildingRef.current
    if (!building) return

    const { activeNode, hoverNode, activeWaypoint } = useAtlasStore.getState()

    // ── Far-side culling: hide as the site rounds the limb of the globe ──
    const camLen = camera.position.length() || 1
    const cos = dir.dot(camera.position) / camLen
    const horizon = (GLOBE_RADIUS * 0.86) / camLen
    let facing = smooth01((cos - horizon) / 0.12)
    if (!company.key) facing *= 1 - smooth01((camLen - 240) / 60)

    building.visible = facing > 0.02
    const isActive = activeNode === company.id
    const isHover = hoverNode === company.id
    const targetScale = (isActive ? 1.22 : isHover ? 1.12 : 1) * GLOBE_BUILD_SCALE
    const sc = THREE.MathUtils.lerp(building.scale.x, Math.max(0.0001, facing) * targetScale, 0.2)
    building.scale.setScalar(sc)

    // ── Labels only on hover / selection / the active region — declutter ──
    if (wrap) {
      const focus = WAYPOINTS[activeWaypoint]?.companies ?? []
      const labeled = isActive || isHover || (facing > 0.6 && focus.includes(company.id))
      wrap.style.opacity = labeled ? '1' : '0'
      wrap.style.pointerEvents = labeled && facing > 0.5 ? 'auto' : 'none'
      wrap.classList.toggle('is-active', isActive)
    }
  })

  return (
    <>
      <group ref={buildingRef} position={anchor} quaternion={quaternion} scale={GLOBE_BUILD_SCALE}>
        <BuildingMesh company={company} color={color} compact />
      </group>

      <Html position={pillPos} center distanceFactor={MARKER_DISTANCE_FACTOR} zIndexRange={[20, 0]}>
        <div ref={wrapRef} className="marker-wrap pointer-events-none flex flex-col items-center" style={{ opacity: 0 }}>
          <MarkerPill company={company} />
          <span className="marker-stem" />
        </div>
      </Html>
    </>
  )
}
