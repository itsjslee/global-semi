import * as THREE from 'three'

/**
 * Custom GLSL material for the "Trace the Wafer" arcs.
 *
 * The arc is a TubeGeometry, so `uv.x` runs 0→1 along the path (arc-length
 * normalized) and `uv.y` wraps around the tube. We draw:
 *   • a faint constant "flow line" so every arc reads as part of the web,
 *   • a bright Gaussian pulse traveling along the path, and
 *   • an exponential comet tail trailing behind the pulse.
 * A view-dependent fresnel rim makes the tube glow like a wire. Rendered
 * additively so it lights up over the slate ocean.
 *
 * Pulse position: when `uProgressOverride >= 0` we use it verbatim (so the
 * CameraRig can fly the camera in lock-step with the active trace); otherwise
 * the pulse animates on its own clock — `fract(uTime * uSpeed + uPhase)` — to
 * keep the ambient arcs alive.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uPhase;
  uniform float uProgressOverride;
  uniform float uPulseWidth;
  uniform float uTailLength;
  uniform float uBase;
  uniform float uOpacity;
  uniform vec3  uColor;
  uniform vec3  uPulseColor;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  float gaussian(float x, float w) {
    return exp(-(x * x) / (2.0 * w * w));
  }

  void main() {
    float along = vUv.x;

    // Pulse head position along the path (0..1), wrapping.
    float p = (uProgressOverride >= 0.0)
      ? uProgressOverride
      : fract(uTime * uSpeed + uPhase);

    // Shortest signed distance from this fragment to the pulse head, wrapped
    // into [-0.5, 0.5] so the pulse can cross the seam cleanly.
    float d = along - p;
    d -= floor(d + 0.5);
    float head = gaussian(d, uPulseWidth);

    // Comet tail: distance *behind* the head, wrapped to [0,1).
    float back = p - along;
    back -= floor(back);
    float tail = exp(-back / max(uTailLength, 1e-3)) * 0.55;

    // Fresnel rim so the tube glows along its silhouette.
    float fres = pow(1.0 - max(dot(normalize(vNormalW), normalize(vViewDir)), 0.0), 2.0);

    float glow = clamp(head + tail, 0.0, 1.0);
    float intensity = uBase + glow + fres * 0.22;

    vec3 col = mix(uColor, uPulseColor, clamp(head * 0.9 + fres * 0.25, 0.0, 1.0));
    float alpha = clamp(intensity, 0.0, 1.0) * uOpacity;

    gl_FragColor = vec4(col * (0.55 + intensity * 0.9), alpha);
  }
`

export class ArcShaderMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.085 },
        uPhase: { value: 0 },
        uProgressOverride: { value: -1 },
        uPulseWidth: { value: 0.028 },
        uTailLength: { value: 0.16 },
        uBase: { value: 0.16 },
        uOpacity: { value: 1 },
        uColor: { value: new THREE.Color('#00A86B') },
        uPulseColor: { value: new THREE.Color('#ffffff') },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })
  }
}
