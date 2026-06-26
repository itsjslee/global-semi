import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Edges, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type Category, type Company } from '../data/companies'
import { CATEGORY_COLORS, PALETTE } from '../lib/colors'
import { useAtlasStore } from '../store/useAtlasStore'
import { MarkerPill } from './MarkerPill'

/** drei <Html> distanceFactor tuned for the close-up isometric hub framing. */
const HUB_LABEL_FACTOR = 42

/** Categories that read as flat, wide "cleanroom / fab" sheds vs. glass HQ towers. */
const FAB_CATEGORIES: ReadonlySet<Category> = new Set(['materials', 'equipment', 'foundry', 'osat'])

export function isFab(category: Category): boolean {
  return FAB_CATEGORIES.has(category)
}

/** Stable 0..1 pseudo-random from a string, so a building's silhouette never jitters. */
function seeded(id: string, salt: number): number {
  let h = 2166136261 ^ salt
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

/**
 * A low-poly corporate HQ: a tiered, translucent glass-and-steel tower. Uses a
 * physical glass material (transmission) over an opaque core so the tinted slate
 * mass reads with depth, plus crisp edge framing for the toy-town silhouette.
 */
function TowerMesh({ company, color }: { company: Company; color: string }) {
  const tiers = useMemo(() => {
    const h0 = 8 + seeded(company.id, 1) * 8 // total feel
    const t0 = { w: 5.6, d: 5.6, h: h0 }
    const t1 = { w: 4.2, d: 4.2, h: h0 * 0.66 }
    const t2 = { w: 2.6, d: 2.6, h: h0 * 0.34 }
    return [t0, t1, t2]
  }, [company.id])

  const glass = useMemo(() => {
    const tint = new THREE.Color(PALETTE.ocean).lerp(new THREE.Color(color), 0.35)
    return new THREE.MeshPhysicalMaterial({
      color: tint,
      metalness: 0,
      roughness: 0.12,
      transmission: 0.6,
      thickness: 3.5,
      ior: 1.3,
      transparent: true,
      opacity: 0.92,
      flatShading: true,
    })
  }, [color])

  let y = 0
  return (
    <group>
      {tiers.map((t, i) => {
        const cy = y + t.h / 2
        y += t.h
        return (
          <mesh key={i} castShadow receiveShadow position={[0, cy, 0]} material={glass}>
            <boxGeometry args={[t.w, t.h, t.d]} />
            <Edges threshold={15} color={'#dfe8ef'} />
          </mesh>
        )
      })}
      {/* Category-accent plinth so the supply-chain layer stays legible. */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[tiers[0].w + 0.8, 0.8, tiers[0].d + 0.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.6} toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * A low-poly fab / cleanroom: a wide, flat, monolithic shed in matte metallic
 * white, topped with stylized HVAC units and rooftop duct runs.
 */
function FabMesh({ company, color }: { company: Company; color: string }) {
  const dims = useMemo(() => {
    const w = 11 + seeded(company.id, 2) * 1.5
    const d = 8 + seeded(company.id, 3) * 1.5
    const h = 3 + seeded(company.id, 4) * 1.8
    return { w, d, h }
  }, [company.id])

  const shell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ECE8DF',
        metalness: 0.35,
        roughness: 0.5,
        flatShading: true,
      }),
    [],
  )
  const duct = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#B9BEC4', metalness: 0.6, roughness: 0.4, flatShading: true }),
    [],
  )

  const { w, d, h } = dims
  const top = h
  // A small array of rooftop HVAC boxes laid out along the long axis.
  const units = 3
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]} material={shell}>
        <boxGeometry args={[w, h, d]} />
        <Edges threshold={20} color={'#cfcabd'} />
      </mesh>
      {/* Category accent band along the base. */}
      <mesh position={[0, 0.45, d / 2 + 0.01]} castShadow>
        <boxGeometry args={[w * 0.96, 0.9, 0.4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.6} toneMapped={false} />
      </mesh>
      {/* Rooftop HVAC plant. */}
      {Array.from({ length: units }).map((_, i) => {
        const ux = (i - (units - 1) / 2) * (w / units) * 0.8
        return (
          <mesh key={i} castShadow position={[ux, top + 0.7, 0]} material={duct}>
            <boxGeometry args={[w / units / 2, 1.4, d * 0.42]} />
          </mesh>
        )
      })}
      {/* A pair of duct runs spanning the roof. */}
      {[-d * 0.22, d * 0.22].map((dz, i) => (
        <mesh key={`p${i}`} castShadow position={[0, top + 0.5, dz]} rotation={[0, 0, Math.PI / 2]} material={duct}>
          <cylinderGeometry args={[0.34, 0.34, w * 0.82, 8]} />
        </mesh>
      ))}
    </group>
  )
}

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

  const labelY = isFab(company.category) ? 7 : 20

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
        {isFab(company.category) ? (
          <FabMesh company={company} color={color} />
        ) : (
          <TowerMesh company={company} color={color} />
        )}
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
