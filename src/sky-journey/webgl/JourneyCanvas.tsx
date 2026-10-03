import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { subscribeScrollFrames } from '../../animations/scroll';
import { sample, type RGB } from '../../sky/timeline';
import { createClouds } from './clouds';
import { createLandscape } from './landscape';

const vertexShader = /* glsl */`
  varying vec3 vDirection;
  void main() {
    vDirection = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform vec3 uTop;
  uniform vec3 uMiddle;
  uniform vec3 uHorizon;
  varying vec3 vDirection;
  void main() {
    float vertical = 1.0 - (normalize(vDirection).y * 0.5 + 0.5);
    float upperMix = smoothstep(0.0, 0.56, vertical);
    float horizonMix = smoothstep(0.56, 1.0, vertical);
    vec3 color = mix(uTop, uMiddle, upperMix);
    color = mix(color, uHorizon, horizonMix);
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    color += dither / 255.0;
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function linearColor(rgb: RGB) {
  return new THREE.Color().setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace);
}

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create the sun glow texture.');
  const gradient = context.createRadialGradient(128, 128, 2, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255,255,255,0.92)');
  gradient.addColorStop(.08, 'rgba(255,255,255,0.62)');
  gradient.addColorStop(.24, 'rgba(255,255,255,0.23)');
  gradient.addColorStop(.56, 'rgba(255,255,255,0.055)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function updateSun(
  progress: number,
  elapsed: number,
  camera: THREE.PerspectiveCamera,
  group: THREE.Group,
  coreMaterial: THREE.MeshStandardMaterial,
  tightMaterial: THREE.SpriteMaterial,
  wideMaterial: THREE.SpriteMaterial,
) {
  const { sun } = sample(progress);
  const distance = 120;
  const viewHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const viewWidth = viewHeight * camera.aspect;
  const introOffset = progress < .16 ? 1.4 * Math.exp(-elapsed * 1.4) : 0;
  group.position.set(
    (sun.x / 100 - .5) * viewWidth,
    (.5 - (sun.y + introOffset) / 100) * viewHeight,
    -distance,
  );
  const diameter = viewHeight * .018 * sun.size;
  group.scale.setScalar(diameter);
  const sunColor = linearColor(sun.color);
  coreMaterial.color.copy(sunColor).lerp(new THREE.Color(0xffffff), .22);
  coreMaterial.emissive.copy(sunColor).multiplyScalar(.42);
  coreMaterial.opacity = sun.opacity;
  tightMaterial.color.copy(sunColor);
  wideMaterial.color.copy(sunColor);
  const horizonDiffusion = THREE.MathUtils.clamp((sun.y - 18) / 64, 0, 1);
  tightMaterial.opacity = sun.opacity * (.30 + horizonDiffusion * .12);
  wideMaterial.opacity = sun.opacity * (.16 + horizonDiffusion * .22);
  group.visible = sun.opacity > .001;
}

export default function JourneyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.closest<HTMLElement>('.journey__stage');
    if (!canvas || !stage) return;

    let renderer: THREE.WebGLRenderer | undefined;
    let skyGeometry: THREE.SphereGeometry | undefined;
    let skyMaterial: THREE.ShaderMaterial | undefined;
    let sunGeometry: THREE.SphereGeometry | undefined;
    let coreMaterial: THREE.MeshStandardMaterial | undefined;
    let tightMaterial: THREE.SpriteMaterial | undefined;
    let wideMaterial: THREE.SpriteMaterial | undefined;
    let glowTexture: THREE.CanvasTexture | undefined;
    let clouds: ReturnType<typeof createClouds> | undefined;
    let landscape: ReturnType<typeof createLandscape> | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let unsubscribe: () => void = () => {};

    try {
      const context = canvas.getContext('webgl2', { alpha: false, antialias: true, powerPreference: 'high-performance' });
      const contextUsable = Boolean(context && !context.isContextLost() && context.getContextAttributes());
      if (!context || !contextUsable) {
        stage.dataset.webglFallback = 'true';
        return undefined;
      }
      renderer = new THREE.WebGLRenderer({ canvas, context, alpha: false, antialias: true, powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, .1, 1200);
      camera.position.set(0, 0, 0);

      skyGeometry = new THREE.SphereGeometry(500, 64, 40);
      skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTop: { value: new THREE.Color() },
          uMiddle: { value: new THREE.Color() },
          uHorizon: { value: new THREE.Color() },
        },
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        depthWrite: false,
        toneMapped: true,
      });
      const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
      skyDome.frustumCulled = false;
      scene.add(skyDome);

      const sunGroup = new THREE.Group();
      sunGeometry = new THREE.SphereGeometry(1, 48, 32);
      coreMaterial = new THREE.MeshStandardMaterial({
        color: 0xffedcd,
        emissive: 0xc78752,
        emissiveIntensity: .42,
        roughness: .72,
        metalness: 0,
        transparent: true,
        depthWrite: false,
      });
      const core = new THREE.Mesh(sunGeometry, coreMaterial);
      sunGroup.add(core);

      glowTexture = makeGlowTexture();
      tightMaterial = new THREE.SpriteMaterial({ map: glowTexture, color: 0xffd69e, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
      wideMaterial = new THREE.SpriteMaterial({ map: glowTexture, color: 0xffd69e, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
      const tightGlow = new THREE.Sprite(tightMaterial);
      tightGlow.scale.set(5.5, 5.5, 1);
      tightGlow.position.z = -.15;
      const wideGlow = new THREE.Sprite(wideMaterial);
      wideGlow.scale.set(16, 16, 1);
      wideGlow.position.z = -.2;
      sunGroup.add(wideGlow, tightGlow);
      scene.add(sunGroup);

      const ambient = new THREE.AmbientLight(0xffffff, .52);
      const sunLight = new THREE.DirectionalLight(0xffe1b5, 1.6);
      sunLight.position.set(0, 0, 30);
      scene.add(ambient, sunLight);

      landscape = createLandscape(scene);
      clouds = createClouds(scene);

      const resize = () => {
        if (!renderer) return;
        const width = Math.max(1, stage.clientWidth);
        const height = Math.max(1, stage.clientHeight);
        const dprCap = width <= 760 ? 1.5 : 2;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        landscape?.resize(width, height, camera);
        clouds?.resize(width, height, camera);
      };
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      window.addEventListener('resize', resize, { passive: true });

      let elapsed = 0;
      let pointerX = 0;
      let pointerY = 0;
      let dampedPointerX = 0;
      let dampedPointerY = 0;
      const onPointerMove = (event: PointerEvent) => {
        if (widthIsMobile()) return;
        pointerX = (event.clientX / Math.max(window.innerWidth, 1) - .5) * 2;
        pointerY = (event.clientY / Math.max(window.innerHeight, 1) - .5) * 2;
      };
      const widthIsMobile = () => stage.clientWidth <= 760;
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      const update = (progress: number) => {
        const sky = sample(progress);
        skyMaterial?.uniforms.uTop.value.copy(linearColor(sky.top));
        skyMaterial?.uniforms.uMiddle.value.copy(linearColor(sky.middle));
        skyMaterial?.uniforms.uHorizon.value.copy(linearColor(sky.horizon));
        landscape?.update(sky.horizon, sky.middle, progress);
        clouds?.update(progress, elapsed);
        const targetPitch = (progress - .5) * THREE.MathUtils.degToRad(10);
        camera.rotation.x += (targetPitch - dampedPointerY * .012 - camera.rotation.x) * .08;
        camera.position.x += (dampedPointerX * .6 - camera.position.x) * .08;
        camera.position.z += ((progress - .5) * 6 - camera.position.z) * .08;
        if (coreMaterial && tightMaterial && wideMaterial) updateSun(progress, elapsed, camera, sunGroup, coreMaterial, tightMaterial, wideMaterial);
        if (document.visibilityState !== 'hidden') renderer?.render(scene, camera);
      };

      update(Number.parseFloat(stage.style.getPropertyValue('--journey-progress')) || 0);
      delete stage.dataset.webglFallback;
      stage.dataset.webglReady = 'true';
      unsubscribe = subscribeScrollFrames((_scroll, deltaSeconds) => {
        elapsed += deltaSeconds;
        dampedPointerX += (pointerX - dampedPointerX) * .05;
        dampedPointerY += (pointerY - dampedPointerY) * .05;
        const progress = Number.parseFloat(stage.style.getPropertyValue('--journey-progress'));
        update(Number.isFinite(progress) ? progress : 0);
      });

      const onVisibility = () => {
        if (document.visibilityState === 'visible') {
          const progress = Number.parseFloat(stage.style.getPropertyValue('--journey-progress'));
          update(Number.isFinite(progress) ? progress : 0);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', resize);
        resizeObserver?.disconnect();
        unsubscribe();
        clouds?.dispose();
        landscape?.dispose();
        stage.removeAttribute('data-webgl-ready');
        skyGeometry?.dispose();
        skyMaterial?.dispose();
        sunGeometry?.dispose();
        coreMaterial?.dispose();
        tightMaterial?.dispose();
        wideMaterial?.dispose();
        glowTexture?.dispose();
        renderer?.dispose();
        renderer?.forceContextLoss();
      };
    } catch (error) {
      console.warn(`Journey WebGL could not start; keeping the CSS sky fallback: ${error instanceof Error ? error.message : 'renderer initialization failed'}`);
      stage.dataset.webglFallback = 'true';
      stage.removeAttribute('data-webgl-ready');
      resizeObserver?.disconnect();
      unsubscribe();
      clouds?.dispose();
      landscape?.dispose();
      skyGeometry?.dispose();
      skyMaterial?.dispose();
      sunGeometry?.dispose();
      coreMaterial?.dispose();
      tightMaterial?.dispose();
      wideMaterial?.dispose();
      glowTexture?.dispose();
      renderer?.dispose();
      return undefined;
    }
  }, []);

  return <canvas ref={canvasRef} className="journey__canvas" aria-hidden="true" />;
}
