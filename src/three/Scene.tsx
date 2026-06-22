import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Lighting } from './Lighting'
import { Globe } from './Globe'
import { Clouds } from './Clouds'
import { CompanyNodes } from './CompanyNodes'
import { TraceArcs } from './TraceArcs'
import { FlatMap } from './FlatMap'
import { MicroNodes } from './MicroNodes'
import { CameraRig } from './CameraRig'
import { Controls } from './Controls'
import { useAtlasStore } from '../store/useAtlasStore'
import { waypointCamera } from '../lib/geo'
import { WAYPOINTS } from '../data/waypoints'

// Initial pose = the global (US-centered) waypoint, so the globe starts locked
// dead-center with the United States facing the viewer.
const INITIAL = waypointCamera(WAYPOINTS[0])

/** The 3D content — swaps between the macro globe and the micro flat map. */
function SceneContents() {
  const viewMode = useAtlasStore((s) => s.viewMode)

  return (
    <>
      <Lighting />
      <Suspense fallback={null}>
        {viewMode === 'macro' ? (
          <>
            <Globe />
            <Clouds />
            <CompanyNodes />
            <TraceArcs />
          </>
        ) : (
          <>
            <FlatMap />
            <MicroNodes />
          </>
        )}
      </Suspense>
      <CameraRig />
      <Controls />
    </>
  )
}

/**
 * The WebGL layer. Lives inside the fixed, centered ViewStage; transparent so
 * the CSS sky→ocean gradient shows through. The camera framing (CameraRig)
 * keeps the subject centered in both macro and micro views.
 *
 * pointer-events:none on the canvas itself ensures the <canvas> element never
 * intercepts clicks. R3F's event system is re-routed to `eventSource` (a
 * transparent overlay div) so raycasting and OrbitControls still work.
 */
export function Scene({ eventSource }: { eventSource?: HTMLElement | null }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      eventSource={eventSource ?? undefined}
      camera={{
        position: [INITIAL.position.x, INITIAL.position.y, INITIAL.position.z],
        fov: 38,
        near: 1,
        far: 4000,
      }}
      onCreated={({ gl, scene, camera }) => {
        // Disable pointer events on the canvas element itself so UI buttons always
        // win hit-testing. R3F's event system is re-routed to the eventSource div.
        gl.domElement.style.pointerEvents = 'none'
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        scene.background = null
        camera.lookAt(INITIAL.target)
      }}
    >
      <SceneContents />
    </Canvas>
  )
}
