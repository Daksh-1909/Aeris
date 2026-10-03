import * as THREE from 'three';
import { qualityLimits, type JourneyQuality } from './quality';

const starVertex = /* glsl */`
  attribute float aPhase;
  attribute float aRate;
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vSize;
  varying vec3 vColor;
  void main() {
    float pulse = 0.84 + 0.16 * sin(uTime * aRate + aPhase);
    vAlpha = pulse * uOpacity;
    vSize = aSize;
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * (300.0 / max(1.0, -mvPosition.z));
  }
`;

const starFragment = /* glsl */`
  uniform float uSparkle;
  varying float vAlpha;
  varying float vSize;
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float alpha;
    if (uSparkle > 0.5) {
      float crossShape = max((1.0 - smoothstep(0.0, 0.13, abs(p.x))) * (1.0 - smoothstep(0.05, 0.5, abs(p.y))), (1.0 - smoothstep(0.0, 0.13, abs(p.y))) * (1.0 - smoothstep(0.05, 0.5, abs(p.x))));
      float core = 1.0 - smoothstep(0.0, 0.12, length(p));
      alpha = max(crossShape * 0.72, core);
    } else {
      alpha = 1.0 - smoothstep(0.18, 0.5, length(p));
    }
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha * vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function makeStars(count: number, size: number, sparkle: boolean, seed: number) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const rates = new Float32Array(count);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const colorChoices = [new THREE.Color(0xf5f6ff), new THREE.Color(0xffe8cf), new THREE.Color(0xcadfff)];
  for (let i = 0; i < count; i += 1) {
    const x = (random() - .5) * 680;
    const y = (random() - .08) * 300;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = -445 - random() * 15;
    phases[i] = random() * Math.PI * 2;
    rates[i] = .7 + random() * 2.1;
    sizes[i] = sparkle ? 8 + random() * 5 : size * (.72 + random() * .56);
    const chosen = colorChoices[random() < .84 ? 0 : random() < .55 ? 1 : 2];
    colors[i * 3] = chosen.r;
    colors[i * 3 + 1] = chosen.g;
    colors[i * 3 + 2] = chosen.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aRate', new THREE.BufferAttribute(rates, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uSparkle: { value: sparkle ? 1 : 0 } },
    vertexShader: starVertex, fragmentShader: starFragment,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  });
  return new THREE.Points(geometry, material);
}

function makeStreakMaterial() {
  return new THREE.LineBasicMaterial({ color: 0xcde3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
}

export function createStars(scene: THREE.Scene) {
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const scale = mobile ? .4 : 1;
  const group = new THREE.Group();
  const tiny = makeStars(Math.round(2500 * scale), 2.2, false, 1741);
  const medium = makeStars(Math.round(500 * scale), 3.6, false, 3859);
  const bright = makeStars(Math.round(40 * scale), 1, true, 7409);
  group.add(tiny, medium, bright);
  scene.add(group);

  const streakGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -425), new THREE.Vector3(0, 0, -425)]);
  const streakMaterial = makeStreakMaterial();
  const streak = new THREE.Line(streakGeometry, streakMaterial);
  streak.frustumCulled = false;
  scene.add(streak);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let reduceEffects = false;
  try { reduceEffects = localStorage.getItem('aeris:reduce-effects') === 'true'; } catch { /* Storage can be disabled. */ }
  const shootingStarsEnabled = !reduceMotion && !reduceEffects;

  function setQuality(quality: JourneyQuality) {
    const limits = qualityLimits(quality).stars;
    [tiny, medium, bright].forEach((points, index) => {
      const available = points.geometry.attributes.position.count;
      points.geometry.setDrawRange(0, Math.min(available, limits[index]));
    });
  }

  function update(progress: number, elapsed: number) {
    const nightBlend = THREE.MathUtils.smoothstep(progress, .78, .96);
    const dawnBlend = THREE.MathUtils.smoothstep(progress, 0, .12);
    const opacity = THREE.MathUtils.clamp((1 - dawnBlend) * .42 + nightBlend, 0, 1);
    group.visible = opacity > .002;
    group.rotation.z = THREE.MathUtils.clamp((progress - .78) / .22, 0, 1) * .35;
    group.children.forEach((points) => {
      ((points as THREE.Points).material as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;
      ((points as THREE.Points).material as THREE.ShaderMaterial).uniforms.uOpacity.value = opacity;
    });
    if (!shootingStarsEnabled) { streak.visible = false; return; }
    const cycle = 11.3;
    const phase = (elapsed + 4.7) % cycle;
    const active = progress > .91 && phase < .8;
    streak.visible = active;
    if (active) {
      const t = phase / .8;
      const x = 210 - t * 190;
      const y = 115 - t * 112;
      const positions = streak.geometry.attributes.position as THREE.BufferAttribute;
      positions.setXYZ(0, x, y, -425);
      positions.setXYZ(1, x - 26, y + 17, -425);
      positions.needsUpdate = true;
      streakMaterial.opacity = Math.sin(t * Math.PI) * .9;
    }
  }

  function dispose() {
    scene.remove(group, streak);
    group.children.forEach((points) => {
      (points as THREE.Points).geometry.dispose();
      ((points as THREE.Points).material as THREE.Material).dispose();
    });
    streak.geometry.dispose();
    streakMaterial.dispose();
  }
  return { update, setQuality, dispose };
}
