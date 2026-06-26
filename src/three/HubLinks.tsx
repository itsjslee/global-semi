import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { type Category } from '../data/companies'
import { CATEGORY_COLORS } from '../lib/colors'
import { getHubLayout } from '../data/hubs'
import { useAtlasStore } from '../store/useAtlasStore'

/** The two halves of the chain a link bridges: who designs vs. who makes. */
const DESIGN_SIDE: ReadonlySet<Category> = new Set(['eda', 'design', 'integration'])
const MAKE_SIDE: ReadonlySet<Category> = new Set(['materials', 'equipment', 'foundry', 'osat'])

function linkHeight(category: Category): number {
  return MAKE_SIDE.has(category) ? 5.5 : 15
}

interface Link {
  curve: THREE.QuadraticBezierCurve3
  geometry: THREE.TubeGeometry
}

/**
 * Glowing "data-link" splines that arc between a selected node and its
 * complementary supply-chain partners inside the hub (design/IP HQs ⇄ the fabs
 * and packaging houses). They appear only while a node is active and pulse a
 * travelling spark to read as live data flow.
 */
function HubLinksInner({ hubId, nodeId }: { hubId: string; nodeId: string }) {
  const layout = useMemo(() => getHubLayout(hubId), [hubId])

  const { links, color } = useMemo(() => {
    const active = layout.placements.find((p) => p.company.id === nodeId)
    if (!active) return { links: [] as Link[], color: '#FFFFFF' }

    const activeIsDesign = DESIGN_SIDE.has(active.company.category)
    const wanted = activeIsDesign ? MAKE_SIDE : DESIGN_SIDE

    const from = new THREE.Vector3(active.x, linkHeight(active.company.category), active.z)
    const links: Link[] = []
    for (const p of layout.placements) {
      if (p.company.id === nodeId) continue
      if (!wanted.has(p.company.category)) continue
      const to = new THREE.Vector3(p.x, linkHeight(p.company.category), p.z)
      const mid = from.clone().add(to).multiplyScalar(0.5)
      mid.y += from.distanceTo(to) * 0.35 + 6
      const curve = new THREE.QuadraticBezierCurve3(from.clone(), mid, to)
      const geometry = new THREE.TubeGeometry(curve, 40, 0.28, 7, false)
      links.push({ curve, geometry })
    }
    return { links, color: CATEGORY_COLORS[active.company.category] }
  }, [layout, nodeId])

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color],
  )

  const sparksRef = useRef<THREE.Group>(null)

  useEffect(() => {
    return () => {
      links.forEach((l) => l.geometry.dispose())
      material.dispose()
    }
  }, [links, material])

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.4) % 1
    const grp = sparksRef.current
    if (!grp) return
    grp.children.forEach((child, i) => {
      const link = links[i]
      if (!link) return
      link.curve.getPointAt(t, child.position)
    })
    material.opacity = 0.42 + Math.sin(state.clock.elapsedTime * 2.4) * 0.12
  })

  if (!links.length) return null

  return (
    <group renderOrder={3}>
      {links.map((l, i) => (
        <mesh key={i} geometry={l.geometry} material={material} frustumCulled={false} />
      ))}
      <group ref={sparksRef}>
        {links.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.9, 10, 10]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function HubLinks() {
  const hubId = useAtlasStore((s) => s.activeHub)
  const nodeId = useAtlasStore((s) => s.activeNode)
  if (!nodeId) return null
  return <HubLinksInner hubId={hubId} nodeId={nodeId} />
}
