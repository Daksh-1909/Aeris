import * as THREE from 'three';
import { sample, type SkySample } from '../timeline';
import type { SkyQuality } from '../quality';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uScale;
  uniform float uSpeed;
  uniform float uOpacity;
  uniform float uSunEnergy;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uCloudTint;
  uniform vec3 uNightTint;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 4; octave++) {
      value += noise(p) * amplitude;
      p = p * 2.03 + vec2(17.1, 9.2);
      amplitude *= 0.5;
    }
    return value / 0.9375;
  }

  void main() {
    vec2 drift = vec2(uTime * uSpeed, sin(uTime * 0.0007) * 0.035);
    vec2 p = vUv * vec2(uScale, uScale * 0.48) + drift;
    float broad = fbm(p);
    float detail = fbm(p * 2.8 + vec2(4.7, 13.2));
    float density = broad + (detail - 0.5) * 0.17;
    float cloud = smoothstep(0.49, 0.64, density);
    float edge = smoothstep(0.46, 0.60, density) * (1.0 - smoothstep(0.67, 0.79, density));
    vec2 gradient = vec2(dFdx(density), dFdy(density));
    vec2 lightDirection = normalize(vec2(uSunDir.x, max(uSunDir.y, 0.04)));
    float litSide = max(dot(normalize(gradient + vec2(0.0001)), lightDirection), 0.0);
    float daylight = smoothstep(-0.03, 0.30, uSunDir.y);
    float lowSun = (1.0 - smoothstep(0.08, 0.55, max(uSunDir.y, 0.0))) * uSunEnergy;
    vec3 body = mix(uNightTint, uCloudTint * 0.46, daylight);
    vec3 edgeColor = mix(uCloudTint, uSunColor, lowSun * 0.78);
    vec3 color = body * cloud + edgeColor * edge * (0.11 + lowSun * (0.2 + litSide * 0.48));
    float alpha = cloud * uOpacity;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const desktopLayers = [
  { z: -145, y: 70, scale: 5.2, speed: .0015, opacity: .34, phase: 0.2 },
  { z: -200, y: 112, scale: 4.6, speed: .0012, opacity: .55, phase: 1.3 },
  { z: -350, y: 184, scale: 3.4, speed: -.00082, opacity: .39, phase: 8.1 },
  { z: -550, y: 270, scale: 2.8, speed: .00054, opacity: .27, phase: 16.7 },
] as const;

function setRGB(target: THREE.Color, rgb: SkySample['cloudTint']) {
  target.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace);
}

export function createClouds(scene: THREE.Scene, initialQuality: SkyQuality) {
  const specs = desktopLayers;
  const layers = specs.map((spec) => {
    const uniforms = {
      uTime: { value: 0 },
      uScale: { value: spec.scale },
      uSpeed: { value: spec.speed },
      uOpacity: { value: 0 },
      uSunEnergy: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0, 0, -1) },
      uSunColor: { value: new THREE.Color() },
      uCloudTint: { value: new THREE.Color() },
      uNightTint: { value: new THREE.Color() },
    };
    const geometry = new THREE.PlaneGeometry(1900, 380, 1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, spec.y, spec.z);
    mesh.renderOrder = 1;
    scene.add(mesh);
    return { mesh, geometry, material, uniforms, spec };
  });

  let quality = initialQuality;
  const setQuality = (next: SkyQuality) => { quality = next; };
  const update = (sky: SkySample, sunDirection: THREE.Vector3, time: number) => {
    layers.forEach(({ uniforms, spec }, index) => {
      uniforms.uTime.value = time + spec.phase;
      uniforms.uOpacity.value = index < quality.cloudLayers ? sky.clouds * spec.opacity : 0;
      uniforms.uSunEnergy.value = sky.sunOpacity;
      uniforms.uSunDir.value.copy(sunDirection);
      setRGB(uniforms.uSunColor.value, sky.sunColor);
      setRGB(uniforms.uCloudTint.value, sky.cloudTint);
      setRGB(uniforms.uNightTint.value, sky.middle);
    });
  };

  const dispose = () => layers.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); });
  update(sample(0), new THREE.Vector3(0, 0, -1), 0);
  return { update, setQuality, dispose };
}
