import * as THREE from 'three';
import { sample, type RGB, type SkySample } from '../timeline';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uBase;
  uniform vec3 uHorizon;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform float uDepth;
  uniform float uRim;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  #include <common>
  void main() {
    vec3 base = mix(uBase, uHorizon, uDepth * 0.82);
    vec3 horizontal = normalize(vec3(vWorldPosition.x, 0.0, vWorldPosition.z));
    float sunSide = max(dot(horizontal, normalize(vec3(uSunDir.x, 0.0, uSunDir.z))), 0.0);
    float ridgeEdge = smoothstep(0.975, 1.0, vUv.y);
    float rimLight = ridgeEdge * sunSide * uRim * (1.0 - uDepth * 0.65);
    vec3 color = base + uSunColor * rimLight * 0.22;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const layerSpecs = [
  { z: -120, topFraction: .02, amplitude: 19, scale: .012, seed: 1.7, depth: 0 },
  { z: -220, topFraction: .04, amplitude: 15, scale: .009, seed: 4.2, depth: .34 },
  { z: -340, topFraction: .06, amplitude: 11, scale: .0065, seed: 8.1, depth: .67 },
  { z: -480, topFraction: .08, amplitude: 8, scale: .0045, seed: 12.6, depth: 1 },
] as const;

function setColor(target: THREE.Color, color: RGB) {
  target.setRGB(color[0] / 255, color[1] / 255, color[2] / 255, THREE.SRGBColorSpace);
}

function makeRidgeGeometry(amplitude: number, scale: number, seed: number) {
  const width = 2600;
  const height = 720;
  const geometry = new THREE.PlaneGeometry(width, height, 256, 32);
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const vertical = THREE.MathUtils.clamp((y + height / 2) / height, 0, 1);
    const ridgeNoise = Math.sin(x * scale + seed) * .58
      + Math.sin(x * scale * 2.13 + seed * 2.7) * .27
      + Math.sin(x * scale * .47 - seed * 1.3) * .15;
    positions.setY(index, y + ridgeNoise * amplitude * vertical * vertical);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

export function createRidges(scene: THREE.Scene) {
  const layers = layerSpecs.map((spec) => {
    const geometry = makeRidgeGeometry(spec.amplitude, spec.scale, spec.seed);
    const uniforms = {
      uBase: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSunColor: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3(0, 0, -1) },
      uDepth: { value: spec.depth },
      uRim: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: THREE.FrontSide,
      depthWrite: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, Math.abs(spec.z) * spec.topFraction - 360, spec.z);
    mesh.renderOrder = 0;
    scene.add(mesh);
    return { geometry, material, uniforms };
  });

  const update = (sky: SkySample, direction: THREE.Vector3) => {
    layers.forEach(({ uniforms }, index) => {
      const depth = layerSpecs[index].depth;
      const darkness = .12 + depth * .13;
      const base: RGB = [sky.top[0] * darkness, sky.top[1] * darkness, sky.top[2] * darkness];
      setColor(uniforms.uBase.value, base);
      setColor(uniforms.uHorizon.value, sky.horizon);
      setColor(uniforms.uSunColor.value, sky.sunColor);
      uniforms.uSunDir.value.copy(direction);
      uniforms.uRim.value = sky.glow;
    });
  };

  const dispose = () => layers.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); });
  update(sample(0), new THREE.Vector3(0, 0, -1));
  return { update, dispose };
}
