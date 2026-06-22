/**
 * "Trace the Wafer" sequences. Each trace is an ordered chain of company node
 * ids; a glowing pulse travels the arcs in order and the camera can fly behind
 * it. Arcs for every trace render faintly at all times (the "interconnected
 * web"); the active trace gets the bright pulse + camera follow.
 */
export interface Trace {
  id: string
  name: string
  description: string
  /** Base arc color. */
  color: string
  /** Traveling-pulse color. */
  pulseColor: string
  /** Ordered company ids. */
  sequence: string[]
}

export const TRACES: Trace[] = [
  {
    id: 'logic',
    name: 'Logic Chip Lifecycle',
    description: 'How an AI/mobile logic die is designed, fabbed, packaged, and shipped.',
    color: '#FF7F66',
    pulseColor: '#FFE7C2',
    sequence: ['synopsys', 'arm', 'nvidia', 'tsmc', 'ase', 'apple'],
  },
  {
    id: 'equipment',
    name: 'Equipment → Memory',
    description: 'Toolmakers arm a memory fab: TEL & ASML → Applied Materials → SK Hynix → OSAT.',
    color: '#00A86B',
    pulseColor: '#EAFBF2',
    sequence: ['tokyo-electron', 'asml', 'applied-materials', 'sk-hynix', 'ase'],
  },
]

export const TRACE_BY_ID: Record<string, Trace> = Object.fromEntries(
  TRACES.map((t) => [t.id, t]),
)
