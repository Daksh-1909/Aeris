import * as THREE from 'three';
import type { RGB } from '../../sky/timeline';

type Ridge = { mesh: THREE.Mesh; rim: THREE.Line; depth: number; height: number; seed: number };

function color(rgb: RGB) {
  return new THREE.Color().setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace);
}

function ridgeGeometry(width: number, height: number, seed: number) {
  const segments = 128;
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const indices: number[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const x = (i / segments - .5) * width;
    const n = i / segments;
    const peak = Math.sin(n * Math.PI * (3 + seed)) * .24 + Math.sin(n * Math.PI * (8 + seed * 2)) * .11 + Math.sin(n * Math.PI * (17 + seed)) * .045;
    const y = -height * (.27 + .09 * Math.sin(n * Math.PI * (2 + seed))) + peak * height;
    const offset = i * 6;
    positions[offset] = x; positions[offset + 1] = y; positions[offset + 2] = 0;
    positions[offset + 3] = x; positions[offset + 4] = -height * .8; positions[offset + 5] = 0;
    if (i < segments) {
      const a = i * 2; const b = a + 1; const c = a + 2; const d = a + 3;
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function rimGeometry(width: number, height: number, seed: number) {
  const segments = 128;
  const positions = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i += 1) {
    const n = i / segments;
    const peak = Math.sin(n * Math.PI * (3 + seed)) * .24 + Math.sin(n * Math.PI * (8 + seed * 2)) * .11 + Math.sin(n * Math.PI * (17 + seed)) * .045;
    positions[i * 3] = (n - .5) * width;
    positions[i * 3 + 1] = -height * (.27 + .09 * Math.sin(n * Math.PI * (2 + seed))) + peak * height;
    positions[i * 3 + 2] = .05;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

export function createLandscape(scene: THREE.Scene) {
  const ridges: Ridge[] = [];
  const depths = [-112, -220, -340, -480];
  const alphas = [.96, .78, .56, .36];
  depths.forEach((depth, index) => {
    const material = new THREE.MeshBasicMaterial({ color: 0x526477, transparent: true, opacity: alphas[index], depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    mesh.position.z = depth;
    mesh.frustumCulled = false;
    scene.add(mesh);
    const rimMaterial = new THREE.LineBasicMaterial({ color: 0xffb27b, transparent: true, opacity: .3 - index * .055, depthWrite: false });
    const rim = new THREE.Line(new THREE.BufferGeometry(), rimMaterial);
    rim.position.z = depth;
    rim.frustumCulled = false;
    scene.add(rim);
    ridges.push({ mesh, rim, depth, height: index + 1, seed: index + 1 });
  });

  const mistMaterial = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0xd7a88d) }, uOpacity: { value: .3 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; void main(){ float edge=smoothstep(0.0,0.45,vUv.y)*(1.0-smoothstep(0.55,1.0,vUv.y)); float side=smoothstep(0.0,0.12,vUv.x)*(1.0-smoothstep(0.88,1.0,vUv.x)); gl_FragColor=vec4(uColor,edge*side*uOpacity); }',
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
  });
  const mist = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mistMaterial);
  mist.position.z = -105;
  scene.add(mist);

  let lastWidth = 0; let lastHeight = 0;
  function resize(width: number, height: number, camera: THREE.PerspectiveCamera) {
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width; lastHeight = height;
    ridges.forEach((ridge) => {
      const viewHeight = 2 * Math.abs(ridge.depth) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const viewWidth = viewHeight * camera.aspect;
      ridge.mesh.geometry.dispose();
      ridge.rim.geometry.dispose();
      ridge.mesh.geometry = ridgeGeometry(viewWidth * 1.45, viewHeight, ridge.seed);
      ridge.rim.geometry = rimGeometry(viewWidth * 1.45, viewHeight, ridge.seed);
    });
    const viewHeight = 2 * 105 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const viewWidth = viewHeight * camera.aspect;
    mist.scale.set(viewWidth * 1.4, viewHeight * .2, 1);
    mist.position.y = -viewHeight * .19;
  }

  function update(horizon: RGB, middle: RGB, progress: number) {
    const h = color(horizon); const m = color(middle);
    ridges.forEach((ridge, index) => {
      const material = ridge.mesh.material as THREE.MeshBasicMaterial;
      material.color.copy(h).lerp(new THREE.Color(0x101b2d), index * .17 + .16);
      const rimMaterial = ridge.rim.material as THREE.LineBasicMaterial;
      rimMaterial.color.copy(h).lerp(new THREE.Color(0xffb47f), .48);
      const sunrise = Math.max(0, 1 - Math.abs(progress - .12) / .19);
      const sunset = Math.max(0, 1 - Math.abs(progress - .72) / .2);
      rimMaterial.opacity = (.08 + .38 * Math.max(sunrise, sunset)) * (1 - index * .18);
    });
    mistMaterial.uniforms.uColor.value.copy(m).lerp(h, .65);
    mistMaterial.uniforms.uOpacity.value = .13 + .3 * Math.max(0, 1 - Math.abs(progress - .12) / .2);
  }

  function dispose() {
    ridges.forEach(({ mesh, rim }) => {
      mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose();
      rim.geometry.dispose(); (rim.material as THREE.Material).dispose();
      scene.remove(mesh, rim);
    });
    mist.geometry.dispose(); mistMaterial.dispose(); scene.remove(mist);
  }
  return { resize, update, dispose };
}
