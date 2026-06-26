import { useRef } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type Company } from '../data/companies'
import { CATEGORY_COLORS } from '../lib/colors'
import { archetypeFor, ARCHETYPE_TOP } from '../data/landmarks'
import { useAtlasStore } from '../store/useAtlasStore'
import { BuildingMesh } from './buildings'
import { MarkerPill } from './MarkerPill'

/** drei <Html> distanceFactor tuned for the close-up isometric hub framing. */
const HUB_LABEL_FACTOR = 42

/**
 * One placed building on the hub grid: the procedural mesh + a clickable
 * <Html> label (the only pointer-events:auto surface, satisfying the canvas
 * pass-through rule). Hover / selection scale and emphasis are driven per-frame.
 */
export function Building({ company, x, z }: { company: Company; x: number; z: number }) {
  const color = CATEGORY_COLORS[company.category]
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const labelY = ARCHETYPE_TOP[archetypeFor(company)] + 2.5

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    const { activeNode, hoverNode } = useAtlasStore.getState()
    const isActive = activeNode === company.id
    const isHover = hoverNode === company.id

    const targetScale = isActive ? 1.08 : isHover ? 1.04 : 1
    group.scale.y = THREE.MathUtils.lerp(group.scale.y, targetScale, 0.18)

    if (ringRef.current) {
      const ringTarget = isActive ? 1 : 0
      const m = ringRef.current.material as THREE.MeshBasicMaterial
      m.opacity = THREE.MathUtils.lerp(m.opacity, ringTarget, 0.2)
      ringRef.current.visible = m.opacity > 0.02
    }

    const wrap = wrapRef.current
    if (wrap) {
      const dim = activeNode && !isActive && !isHover
      wrap.style.opacity = dim ? '0.35' : '1'
      wrap.classList.toggle('is-active', isActive)
    }
  })

  return (
    <group position={[x, 0, z]}>
      <group ref={groupRef}>
        <BuildingMesh company={company} color={color} />
      </group>

      {/* Selection ring on the grid floor. */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} visible={false}>
        <ringGeometry args={[7.2, 8.4, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      <Html position={[0, labelY, 0]} center distanceFactor={HUB_LABEL_FACTOR} zIndexRange={[20, 0]}>
        <div ref={wrapRef} className="marker-wrap pointer-events-none flex flex-col items-center">
          <MarkerPill company={company} />
          <span className="marker-stem" />
        </div>
      </Html>
    </group>
  )
}
