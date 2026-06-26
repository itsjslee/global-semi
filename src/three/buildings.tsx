import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'
import { type Company } from '../data/companies'
import { archetypeFor, type Archetype } from '../data/landmarks'
import { PALETTE } from '../lib/colors'

/**
 * A procedural, low-poly render of a company's flagship site. Marquee HQs get
 * recognizable silhouettes (see `landmarks.ts`); the rest use richer category
 * archetypes. `compact` swaps the costly glass-transmission materials and fine
 * detail for a cheaper silhouette so the same kit can dot the macro globe with
 * dozens of buildings without tanking the frame rate.
 */

interface Mats {
  glass: THREE.Material
  metal: THREE.Material
  dark: THREE.Material
  panelA: THREE.Material
  panelB: THREE.Material
  accent: THREE.Material
  water: THREE.Material
  foliage: THREE.Material
  trunk: THREE.Material
}

function useMats(color: string, compact: boolean): Mats {
  const mats = useMemo<Mats>(() => {
    const tint = new THREE.Color(PALETTE.ocean).lerp(new THREE.Color(color), 0.42)
    const glass = compact
      ? new THREE.MeshStandardMaterial({
          color: tint,
          metalness: 0.2,
          roughness: 0.28,
          transparent: true,
          opacity: 0.92,
          flatShading: true,
        })
      : new THREE.MeshPhysicalMaterial({
          color: tint,
          metalness: 0,
          roughness: 0.12,
          transmission: 0.55,
          thickness: 3,
          ior: 1.3,
          transparent: true,
          opacity: 0.92,
          flatShading: true,
        })
    return {
      glass,
      metal: new THREE.MeshStandardMaterial({ color: '#ECE8DF', metalness: 0.35, roughness: 0.5, flatShading: true }),
      dark: new THREE.MeshStandardMaterial({ color: '#3A4754', metalness: 0.45, roughness: 0.5, flatShading: true }),
      panelA: new THREE.MeshStandardMaterial({ color: '#C9CDD2', metalness: 0.4, roughness: 0.5, flatShading: true }),
      panelB: new THREE.MeshStandardMaterial({ color: '#5B7FA6', metalness: 0.3, roughness: 0.45, flatShading: true }),
      accent: new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.6, toneMapped: false }),
      water: new THREE.MeshStandardMaterial({ color: PALETTE.ocean, metalness: 0.2, roughness: 0.15 }),
      foliage: new THREE.MeshStandardMaterial({ color: '#4E7A52', roughness: 1, flatShading: true }),
      trunk: new THREE.MeshStandardMaterial({ color: '#7A6149', roughness: 1 }),
    }
  }, [color, compact])

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])
  return mats
}

/** A clutch of low-poly conifers for landscaping (full detail only). */
function Trees({ m, spots }: { m: Mats; spots: [number, number, number][] }) {
  return (
    <>
      {spots.map(([x, s, z], i) => (
        <group key={i} position={[x, 0, z]} scale={s}>
          <mesh position={[0, 0.5, 0]} material={m.trunk} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 1, 6]} />
          </mesh>
          <mesh position={[0, 1.7, 0]} material={m.foliage} castShadow>
            <coneGeometry args={[1, 2.4, 7]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function GlassBox({
  args,
  position,
  m,
  detail,
}: {
  args: [number, number, number]
  position: [number, number, number]
  m: Mats
  detail: boolean
}) {
  return (
    <mesh castShadow receiveShadow position={position} material={m.glass}>
      <boxGeometry args={args} />
      {detail && <Edges threshold={15} color={'#e3ecf2'} />}
    </mesh>
  )
}

function Plinth({ w, d, color }: { w: number; d: number; color: string }) {
  return (
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[w, 0.8, d]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.6} toneMapped={false} />
    </mesh>
  )
}

// ── Archetypes ──────────────────────────────────────────────────────────────

function Tower({ m, color, detail }: { m: Mats; color: string; detail: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow material={m.metal}>
        <boxGeometry args={[8, 1.2, 8]} />
      </mesh>
      <GlassBox args={[6, 12, 6]} position={[0, 1.2 + 6, 0]} m={m} detail={detail} />
      <GlassBox args={[4.4, 7, 4.4]} position={[0, 13.2 + 3.5, 0]} m={m} detail={detail} />
      <GlassBox args={[2.6, 3.4, 2.6]} position={[0, 20.2 + 1.7, 0]} m={m} detail={detail} />
      {detail && (
        <mesh position={[0, 22.7, 0]} material={m.dark} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 2.4, 5]} />
        </mesh>
      )}
      <Plinth w={8.4} d={8.4} color={color} />
      {detail && <Trees m={m} spots={[[5, 0.9, 5], [-5, 0.8, 4.5], [4.5, 0.8, -5]]} />}
    </group>
  )
}

function Slab({ m, color, detail }: { m: Mats; color: string; detail: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow material={m.metal}>
        <boxGeometry args={[12, 1.2, 8]} />
      </mesh>
      <GlassBox args={[11, 11, 6.6]} position={[0, 1.2 + 5.5, 0]} m={m} detail={detail} />
      {detail &&
        [3, 6, 9].map((y) => (
          <mesh key={y} position={[0, y, 3.35]} material={m.dark}>
            <boxGeometry args={[11.1, 0.25, 0.2]} />
          </mesh>
        ))}
      {/* Entrance canopy */}
      <mesh position={[0, 1.6, 4.2]} material={m.metal} castShadow>
        <boxGeometry args={[4, 0.3, 1.6]} />
      </mesh>
      <Plinth w={12.4} d={8.4} color={color} />
      {detail && <Trees m={m} spots={[[7, 0.9, 3], [-7, 0.85, 2]]} />}
    </group>
  )
}

function Fab({ m, color, detail }: { m: Mats; color: string; detail: boolean }) {
  return (
    <group>
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow material={m.metal}>
        <boxGeometry args={[12, 4.4, 9]} />
        {detail && <Edges threshold={20} color={'#cfcabd'} />}
      </mesh>
      {/* Horizontal louver band */}
      <mesh position={[0, 3.1, 4.55]} material={m.dark}>
        <boxGeometry args={[11.4, 1.2, 0.3]} />
      </mesh>
      {/* Accent band */}
      <mesh position={[0, 0.9, 4.56]} castShadow>
        <boxGeometry args={[11.4, 1, 0.4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.6} toneMapped={false} />
      </mesh>
      {/* Rooftop HVAC */}
      {detail ? (
        [-3.4, 0, 3.4].map((x) => (
          <mesh key={x} position={[x, 5.1, 0]} material={m.dark} castShadow>
            <boxGeometry args={[2.4, 1.4, 4]} />
          </mesh>
        ))
      ) : (
        <mesh position={[0, 5.1, 0]} material={m.dark} castShadow>
          <boxGeometry args={[9, 1.2, 4]} />
        </mesh>
      )}
      {detail &&
        [-2.2, 2.2].map((z) => (
          <mesh key={z} position={[0, 4.9, z]} rotation={[0, 0, Math.PI / 2]} material={m.dark} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 10, 8]} />
          </mesh>
        ))}
      {/* Loading dock */}
      {detail && (
        <mesh position={[0, 0.8, -5.2]} material={m.dark} castShadow>
          <boxGeometry args={[6, 1.6, 1.5]} />
        </mesh>
      )}
    </group>
  )
}

function MegaFab({ m, color, detail, company }: { m: Mats; color: string; detail: boolean; company: Company }) {
  const isTsmc = company.id === 'tsmc'
  return (
    <group>
      {/* Raised plinth */}
      <mesh position={[0, 0.5, 0]} receiveShadow castShadow material={m.dark}>
        <boxGeometry args={[15, 1, 12]} />
      </mesh>
      {/* Main monolith */}
      <mesh position={[0, 1 + 4, 0.5]} castShadow receiveShadow material={m.metal}>
        <boxGeometry args={[14, 8, 9]} />
        {detail && <Edges threshold={18} color={'#d3cec2'} />}
      </mesh>
      {/* Horizontal sunshade bands (gray-black) */}
      {(detail ? [2.5, 5, 7.5] : [5]).map((y) => (
        <mesh key={y} position={[0, 1 + y, 5.05]} material={m.dark}>
          <boxGeometry args={[14.2, 0.6, 0.4]} />
        </mesh>
      ))}
      {/* Secondary lower block */}
      <mesh position={[0, 1 + 2.5, -4.4]} castShadow receiveShadow material={m.metal}>
        <boxGeometry args={[12, 5, 3.4]} />
      </mesh>
      {/* Rooftop chiller farm */}
      {detail ? (
        Array.from({ length: 12 }).map((_, i) => {
          const cx = ((i % 4) - 1.5) * 3
          const cz = (Math.floor(i / 4) - 1) * 2.6
          return (
            <mesh key={i} position={[cx, 9.6, cz + 0.5]} material={m.dark} castShadow>
              <boxGeometry args={[2, 1.1, 1.8]} />
            </mesh>
          )
        })
      ) : (
        <mesh position={[0, 9.4, 0.5]} material={m.dark} castShadow>
          <boxGeometry args={[12, 0.9, 7]} />
        </mesh>
      )}
      {/* Accent stripe with the company tint */}
      <mesh position={[0, 1.4, 5.06]} castShadow>
        <boxGeometry args={[14.2, 0.9, 0.45]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.6} toneMapped={false} />
      </mesh>
      {/* TSMC's circular "wafer pond" out front */}
      {isTsmc && (
        <mesh position={[0, 1.05, 8.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={m.water}>
          <cylinderGeometry args={[3.4, 3.4, 0.2, 28]} />
        </mesh>
      )}
    </group>
  )
}

function Ring({ m, color, detail }: { m: Mats; color: string; detail: boolean }) {
  return (
    <group>
      {/* The torus building, flattened into a multi-storey band. */}
      <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow material={m.glass} scale={[1, 1, 0.5]}>
        <torusGeometry args={[6, 1.5, 10, 36]} />
        {detail && <Edges threshold={24} color={'#e3ecf2'} />}
      </mesh>
      <Plinth w={15} d={15} color={color} />
      {/* Inner courtyard greenery */}
      <mesh position={[0, 0.85, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={m.foliage}>
        <circleGeometry args={[4.2, 24]} />
      </mesh>
      {detail && <Trees m={m} spots={[[0, 1, 0], [2, 0.8, 1.5], [-2, 0.8, -1.5]]} />}
    </group>
  )
}

function VaultRoof({ m, color, detail }: { m: Mats; color: string; detail: boolean }) {
  // Wide low office mass + a shallow gable roof carrying triangular skylights.
  const W = 13
  const D = 9
  const roofY = 5
  return (
    <group>
      <GlassBox args={[W, 5, D]} position={[0, 2.5, 0]} m={m} detail={detail} />
      {/* Tall glass front facade */}
      <GlassBox args={[W, 7.5, 0.6]} position={[0, 3.75, D / 2]} m={m} detail={detail} />
      {/* Gable roof: two slanted planes meeting at a central ridge. */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[0, roofY + 1.4, (side * D) / 4]}
          rotation={[side * 0.42, 0, 0]}
          castShadow
          material={m.metal}
        >
          <boxGeometry args={[W, 0.4, D / 2 + 1]} />
        </mesh>
      ))}
      {/* Triangular skylight grid (the NVIDIA wireframe motif). */}
      {detail &&
        [-1, 1].map((side) =>
          [-4, -1.3, 1.3, 4].map((x) => (
            <mesh
              key={`${side}-${x}`}
              position={[x, roofY + 1.55, (side * D) / 4]}
              rotation={[side * 0.42, 0, 0]}
            >
              <boxGeometry args={[0.12, 0.06, D / 2]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} toneMapped={false} />
            </mesh>
          )),
        )}
      <Plinth w={W + 0.6} d={D + 0.6} color={color} />
      {detail && <Trees m={m} spots={[[7.5, 0.9, 2], [-7.5, 0.85, -2]]} />}
    </group>
  )
}

function ResearchCampus({ m, color, detail }: { m: Mats; color: string; detail: boolean }) {
  // Big rectangular R&D block with silver/blue panel bands + finned brows.
  const W = 13
  const D = 10
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow material={m.metal}>
        <boxGeometry args={[W + 1, 1.2, D + 1]} />
      </mesh>
      {/* Three stacked storeys in alternating panel colours. */}
      {[
        { y: 2.4, mat: m.panelA },
        { y: 5.6, mat: m.panelB },
        { y: 8.8, mat: m.panelA },
      ].map((f, i) => (
        <mesh key={i} position={[0, f.y, 0]} castShadow receiveShadow material={f.mat}>
          <boxGeometry args={[W, 3, D]} />
        </mesh>
      ))}
      {/* Vision glass strip */}
      <GlassBox args={[W - 0.4, 9.2, 0.5]} position={[0, 5.5, D / 2]} m={m} detail={detail} />
      {/* Projecting metal fin "brows" */}
      {detail &&
        [4, 7.2, 10.4].map((y) => (
          <mesh key={y} position={[0, y, D / 2 + 0.4]} material={m.dark} castShadow>
            <boxGeometry args={[W + 0.4, 0.3, 1.2]} />
          </mesh>
        ))}
      {/* Projecting corner entry element */}
      <GlassBox args={[3, 11, 3]} position={[-(W / 2) + 1.2, 5.5, D / 2 - 1.2]} m={m} detail={detail} />
      <Plinth w={W + 1.4} d={D + 1.4} color={color} />
    </group>
  )
}

function TripleTower({ m, color, detail }: { m: Mats; color: string; detail: boolean }) {
  const heights = [18, 15, 16.5]
  return (
    <group>
      {/* Shared podium */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow material={m.metal}>
        <boxGeometry args={[13, 2.4, 8]} />
      </mesh>
      {heights.map((h, i) => (
        <GlassBox key={i} args={[3, h, 4]} position={[(i - 1) * 4.4, 2.4 + h / 2, 0]} m={m} detail={detail} />
      ))}
      <Plinth w={13.4} d={8.4} color={color} />
      {detail && <Trees m={m} spots={[[7, 0.9, 3], [-7, 0.85, -3]]} />}
    </group>
  )
}

const RENDERERS: Record<
  Archetype,
  (p: { m: Mats; color: string; detail: boolean; company: Company }) => JSX.Element
> = {
  tower: Tower,
  slab: Slab,
  fab: Fab,
  megaFab: MegaFab,
  ring: Ring,
  vaultRoof: VaultRoof,
  researchCampus: ResearchCampus,
  tripleTower: TripleTower,
}

export function BuildingMesh({
  company,
  color,
  compact = false,
}: {
  company: Company
  color: string
  compact?: boolean
}) {
  const m = useMats(color, compact)
  const archetype = archetypeFor(company)
  const Render = RENDERERS[archetype]
  return <Render m={m} color={color} detail={!compact} company={company} />
}
