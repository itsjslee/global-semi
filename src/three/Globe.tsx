import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import ThreeGlobe from 'three-globe'
import { PALETTE } from '../lib/colors'
import { loadCountries } from '../lib/countries'

export function Globe() {
  const globe = useMemo(() => {
    const g = new ThreeGlobe({ animateIn: false })

    // ── Ocean: matte, desaturated slate sphere ────────────────────────────
    g.globeMaterial(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(PALETTE.ocean),
        roughness: 1,
        metalness: 0,
      }),
    )

    // A whisper of atmosphere for depth (kept subtle for the toy-town look).
    g.showAtmosphere(true)
      .atmosphereColor(PALETTE.sky)
      .atmosphereAltitude(0.1)

    // ── Landmasses: flat-shaded, low-poly, warm sand ──────────────────────
    g.polygonAltitude(0.012)
      .polygonSideColor(() => PALETTE.landSide)
      .polygonStrokeColor(() => PALETTE.landStroke)
      .polygonsTransitionDuration(0)

    // Prefer a true matte MeshStandard cap (flat-shaded) when the installed
    // three-globe exposes it; otherwise fall back to the color accessor.
    const landMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(PALETTE.land),
      roughness: 1,
      metalness: 0,
      flatShading: true,
    })
    const anyGlobe = g as unknown as {
      polygonCapMaterial?: (m: THREE.Material) => unknown
    }
    if (typeof anyGlobe.polygonCapMaterial === 'function') {
      anyGlobe.polygonCapMaterial(landMat)
    } else {
      g.polygonCapColor(() => PALETTE.land)
    }

    return g
  }, [])

  // ── Load country geometry, then enable shadow receiving on the meshes ────
  useEffect(() => {
    let cancelled = false

    loadCountries().then((features) => {
      if (!cancelled) globe.polygonsData(features)
    })

    // three-globe builds the polygon meshes asynchronously; flip receiveShadow
    // on for a couple of seconds' worth of frames as they stream in.
    let raf = 0
    let frames = 0
    const enableShadows = () => {
      globe.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          obj.receiveShadow = true
          obj.castShadow = false
        }
      })
      if (frames++ < 120 && !cancelled) raf = requestAnimationFrame(enableShadows)
    }
    raf = requestAnimationFrame(enableShadows)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [globe])

  // Dispose GPU resources on unmount.
  useEffect(() => {
    return () => {
      globe.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (mesh.isMesh) {
          mesh.geometry?.dispose()
          const mat = mesh.material
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
          else mat?.dispose()
        }
      })
    }
  }, [globe])

  return <primitive object={globe} />
}
