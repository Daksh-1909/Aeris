import * as THREE from 'three';
import { sunDirection } from './sunMoonPath';
import { sample, type RGB } from './timeline';

const vertexShader = `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uBottom;
  uniform vec3 uSunDir;
  uniform vec3 uGlowColor;
  uniform float uGlow;
  uniform float uExposure;
  varying vec3 vDir;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, -0.1, 1.0);
    vec3 col = mix(uBottom, uMid, smoothstep(-0.05, 0.25, h));
    col = mix(col, uTop, smoothstep(0.2, 0.9, h));
    vec3 sd = normalize(uSunDir);
    float s = max(dot(d, sd), 0.0);
    col += uGlowColor * (pow(s, 6.0) * 0.45 + pow(s, 64.0) * 0.8) * uGlow;
    float side = pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(sd.x, 0.0, sd.z))), 0.0), 2.0);
    col += uGlowColor * exp(-abs(d.y) * 9.0) * (0.15 + 0.35 * side) * uGlow;
    col *= uExposure;
    col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function setColorFromRGB(target: THREE.Color, [r, g, b]: RGB) {
  target.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
}

export type SkyScene = ReturnType<typeof createSkyScene>;

export function createSkyScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
  camera.position.set(0, -1.1, 0);
  const uniforms = {
    uTop: { value: new THREE.Color() },
    uMid: { value: new THREE.Color() },
    uBottom: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(0, 0, -1) },
    uGlowColor: { value: new THREE.Color() },
    uGlow: { value: 0 },
    uExposure: { value: 1 },
  };
  const geometry = new THREE.SphereGeometry(900, 64, 48);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
  });
  const dome = new THREE.Mesh(geometry, material);
  scene.add(dome);

  const sunGeometry = new THREE.SphereGeometry(14, 32, 24);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
  const sunCore = new THREE.Mesh(sunGeometry, sunMaterial);
  sunCore.renderOrder = 2;
  scene.add(sunCore);

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 128;
  glowCanvas.height = 128;
  const glowContext = glowCanvas.getContext('2d');
  if (glowContext) {
    const gradient = glowContext.createRadialGradient(64, 64, 1, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)');
    gradient.addColorStop(.12, 'rgba(255,255,255,0.58)');
    gradient.addColorStop(.35, 'rgba(255,255,255,0.16)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    glowContext.fillStyle = gradient;
    glowContext.fillRect(0, 0, 128, 128);
  }
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  const makeGlow = (size: number, opacity: number) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffffff,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }));
    sprite.scale.set(size, size, 1);
    sprite.renderOrder = 1;
    scene.add(sprite);
    return sprite;
  };
  const tightGlow = makeGlow(88, 0);
  const wideGlow = makeGlow(528, 0);

  const sunLight = new THREE.DirectionalLight(0xffffff, 0);
  scene.add(sunLight, sunLight.target);
  const skyLight = new THREE.HemisphereLight(0xffffff, 0x3b4960, .35);
  scene.add(skyLight);

  const resize = (width = window.innerWidth, height = window.innerHeight) => {
    const safeWidth = Math.max(1, width);
    const safeHeight = Math.max(1, height);
    renderer.setSize(safeWidth, safeHeight, false);
    camera.aspect = safeWidth / safeHeight;
    camera.updateProjectionMatrix();
  };

  const update = (progress: number, introProgress = 1) => {
    const sky = sample(progress);
    setColorFromRGB(uniforms.uTop.value, sky.top);
    setColorFromRGB(uniforms.uMid.value, sky.middle);
    setColorFromRGB(uniforms.uBottom.value, sky.horizon);
    setColorFromRGB(uniforms.uGlowColor.value, sky.sunColor);
    const sunDir = sunDirection(progress);
    const intro = THREE.MathUtils.clamp(introProgress, 0, 1);
    const sunElevation = Math.asin(sunDir.y);
    sunDir.y = Math.sin(THREE.MathUtils.lerp(sunElevation, Math.max(sunElevation, .025), intro));
    sunDir.normalize();
    uniforms.uSunDir.value.copy(sunDir);
    uniforms.uGlow.value = sky.glow;
    uniforms.uExposure.value = sky.exposure;

    const sunPosition = sunDir.clone().multiplyScalar(700);
    sunCore.position.copy(sunPosition);
    tightGlow.position.copy(sunPosition);
    wideGlow.position.copy(sunPosition);
    const fade = 1 - THREE.MathUtils.smoothstep(progress, .78, .84);
    const sunAlpha = sky.sunOpacity * fade;
    sunMaterial.color.setRGB(sky.sunColor[0] / 255, sky.sunColor[1] / 255, sky.sunColor[2] / 255, THREE.SRGBColorSpace);
    sunMaterial.opacity = sunAlpha;
    const horizonFlattening = Math.max(
      1 - Math.abs(progress - .08) / .16,
      1 - Math.abs(progress - .78) / .12,
    );
    sunCore.scale.set(1, 1 - Math.max(0, horizonFlattening) * .14, 1);
    tightGlow.material.color.setRGB(sky.sunColor[0] / 255, sky.sunColor[1] / 255, sky.sunColor[2] / 255, THREE.SRGBColorSpace);
    wideGlow.material.color.copy(tightGlow.material.color);
    tightGlow.material.opacity = sky.glow * fade * .48;
    wideGlow.material.opacity = sky.glow * fade * .2;
    sunLight.position.copy(sunDir).multiplyScalar(1000);
    sunLight.color.copy(tightGlow.material.color);
    sunLight.intensity = sunAlpha * 1.15;
    skyLight.color.copy(uniforms.uTop.value);
    skyLight.groundColor.copy(uniforms.uBottom.value);

    const pitch = THREE.MathUtils.degToRad(17.5 + intro * 7);
    camera.position.y = THREE.MathUtils.lerp(-1.1, -.25, intro);
    camera.lookAt(0, camera.position.y + Math.tan(pitch) * 900, -900);
  };

  const render = () => renderer.render(scene, camera);
  const dispose = () => {
    geometry.dispose();
    material.dispose();
    sunGeometry.dispose();
    sunMaterial.dispose();
    tightGlow.material.dispose();
    wideGlow.material.dispose();
    glowTexture.dispose();
    renderer.dispose();
  };

  resize();
  update(0);
  return { update, render, resize, dispose };
}
