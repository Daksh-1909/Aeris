import * as THREE from 'three';
import { sample, type SkySample } from '../timeline';

const vertexShader = `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uDpr;
  varying float vTwinkle;
  varying vec3 vDirection;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vDirection = normalize(position);
    vTwinkle = 0.72 + 0.28 * sin(uTime * 1.4 + aPhase);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aSize * (780.0 / max(1.0, -viewPosition.z)) * uDpr;
  }
`;

const fragmentShader = `
  uniform float uOpacity;
  uniform float uSunGlow;
  uniform vec3 uSunDir;
  varying float vTwinkle;
  varying vec3 vDirection;
  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float disc = 1.0 - smoothstep(0.22, 0.5, length(point));
    float sunAlignment = dot(normalize(vDirection), normalize(uSunDir));
    float sunFade = smoothstep(0.92 - uSunGlow * 0.035, 0.995, 1.0 - sunAlignment);
    float alpha = disc * uOpacity * vTwinkle * sunFade;
    gl_FragColor = vec4(vec3(0.74, 0.84, 1.0), alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function buildStarGeometry(count: number) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  let seed = 0x51a7;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let index = 0; index < count; index += 1) {
    const theta = random() * Math.PI * 2;
    const y = random() * .92 + .08;
    const radius = Math.sqrt(1 - y * y) * 850;
    positions.set([Math.cos(theta) * radius, y * 850, Math.sin(theta) * radius], index * 3);
    sizes[index] = .7 + random() * 1.8;
    phases[index] = random() * Math.PI * 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  return geometry;
}

export function createStars(scene: THREE.Scene) {
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const geometry = buildStarGeometry(mobile ? 1200 : 3000);
  const uniforms = {
    uTime: { value: 0 },
    uDpr: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uOpacity: { value: 0 },
    uSunGlow: { value: 0 },
    uSunDir: { value: new THREE.Vector3(0, 0, -1) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = -5;
  scene.add(points);

  const update = (sky: SkySample, sunDirection: THREE.Vector3, time: number) => {
    uniforms.uOpacity.value = sky.stars;
    uniforms.uSunGlow.value = sky.glow;
    uniforms.uSunDir.value.copy(sunDirection);
    uniforms.uTime.value = time;
  };
  const dispose = () => { geometry.dispose(); material.dispose(); };
  update(sample(0), new THREE.Vector3(0, 0, -1), 0);
  return { update, dispose };
}
