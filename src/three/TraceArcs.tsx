import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { TRACES, type Trace } from '../data/traces'
import { getTraceCurve } from '../lib/traceCurves'
import { ArcShaderMaterial } from './ArcMaterial'
import { useAtlasStore } from '../store/useAtlasStore'

const TUBE_SEGMENTS = 260
const TUBE_RADIUS = 0.42
const RADIAL_SEGMENTS = 9

function TraceArc({ trace, index }: { trace: Trace; index: number }) {
  const materialRef = useRef<ArcShaderMaterial>(null)

  const curve = useMemo(() => getTraceCurve(trace.id), [trace.id])
  const geometry = useMemo(() => {
    if (!curve) return null
    return new THREE.TubeGeometry(curve, TUBE_SEGMENTS, TUBE_RADIUS, RADIAL_SEGMENTS, false)
  }, [curve])

  const material = useMemo(() => {
    const mat = new ArcShaderMaterial()
    mat.uniforms.uColor.value = new THREE.Color(trace.color)
    mat.uniforms.uPulseColor.value = new THREE.Color(trace.pulseColor)
    // Stagger ambient pulses so the arcs don't all blink in unison.
    mat.uniforms.uPhase.value = index * 0.37
    return mat
  }, [trace, index])

  // Dispose GPU resources on unmount / hot-reload.
  useEffect(() => {
    return () => {
      geometry?.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((_, delta) => {
    const { activeTraceId, tracePlaying, tourProgress } = useAtlasStore.getState()
    const mat = materialRef.current
    if (!mat) return

    mat.uniforms.uTime.value += delta

    const isActive = activeTraceId === trace.id
    if (isActive && tracePlaying) {
      // Lock the pulse to the camera fly-through progress.
      mat.uniforms.uProgressOverride.value = tourProgress
      mat.uniforms.uOpacity.value = 1
      mat.uniforms.uBase.value = 0.32
    } else {
      mat.uniforms.uProgressOverride.value = -1 // free-running ambient pulse
      mat.uniforms.uOpacity.value = isActive ? 0.95 : 0.5
      mat.uniforms.uBase.value = isActive ? 0.2 : 0.12
    }
  })

  if (!geometry) return null

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={2}>
      <primitive ref={materialRef} object={material} attach="material" />
    </mesh>
  )
}

export function TraceArcs() {
  return (
    <group>
      {TRACES.map((trace, i) => (
        <TraceArc key={trace.id} trace={trace} index={i} />
      ))}
    </group>
  )
}
