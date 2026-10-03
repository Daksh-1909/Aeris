import * as THREE from 'three';
import { sample, type RGB, type SkySample } from '../timeline';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uTint;
  uniform float uDensity;
  varying vec2 vUv;
  void main() {
    float verticalBand = exp(-pow((vUv.y - 0.5) * 3.2, 2.0));
    float horizontalFade = smoothstep(0.0, 0.22, vUv.x) * (1.0 - smoothstep(0.78, 1.0, vUv.x));
    float alpha = verticalBand * horizontalFade * uDensity * 0.22;
    gl_FragColor = vec4(uTint, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function setColor(target: THREE.Color, color: RGB) {
  target.setRGB(color[0] / 255, color[1] / 255, color[2] / 255, THREE.SRGBColorSpace);
}

export function createMist(scene: THREE.Scene) {
  const uniforms = {
    uTint: { value: new THREE.Color() },
    uDensity: { value: 0 },
  };
  const geometry = new THREE.PlaneGeometry(2200, 120, 1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const band = new THREE.Mesh(geometry, material);
  band.position.set(0, 30, -280);
  band.renderOrder = 1;
  scene.add(band);

  const update = (sky: SkySample) => {
    setColor(uniforms.uTint.value, sky.cloudTint);
    const sunrise = 1 - THREE.MathUtils.clamp(Math.abs(sky.progress - .08) / .2, 0, 1);
    uniforms.uDensity.value = .1 + sky.glow * .22 + sunrise * .28;
  };
  const dispose = () => { geometry.dispose(); material.dispose(); };
  update(sample(0));
  return { update, dispose };
}
