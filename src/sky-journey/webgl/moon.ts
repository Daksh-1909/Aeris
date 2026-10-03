import * as THREE from 'three';

function createHaloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create the moon halo texture.');
  const gradient = context.createRadialGradient(128, 128, 8, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(204,225,255,0.32)');
  gradient.addColorStop(.22, 'rgba(175,207,255,0.16)');
  gradient.addColorStop(.62, 'rgba(139,181,255,0.04)');
  gradient.addColorStop(1, 'rgba(117,158,255,0)');
  context.fillStyle = gradient; context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMoon(scene: THREE.Scene) {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0xece9e2, emissive: 0x0a1020, emissiveIntensity: .4, roughness: 1,
    transparent: true, depthWrite: true,
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.rotation.y = -Math.PI / 2;
  group.add(sphere);
  const haloTexture = createHaloTexture();
  const haloMaterial = new THREE.SpriteMaterial({ map: haloTexture, color: 0xbfd7ff, transparent: true, opacity: .65, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const halo = new THREE.Sprite(haloMaterial);
  halo.scale.set(66, 66, 1);
  halo.position.z = -1.2;
  group.add(halo);
  const ringMaterial = new THREE.SpriteMaterial({ map: haloTexture, color: 0x90b5ff, transparent: true, opacity: .1, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const ring = new THREE.Sprite(ringMaterial);
  ring.scale.set(94, 94, 1);
  ring.position.z = -1.4;
  group.add(ring);
  const light = new THREE.DirectionalLight(0xdceaff, 2.25);
  light.position.set(100, 85, 320);
  group.add(light);
  scene.add(group);

  const loader = new THREE.TextureLoader();
  let colorTexture: THREE.Texture | undefined;
  let bumpTexture: THREE.Texture | undefined;
  let disposed = false;
  loader.load('/3d/moon_color_2k.webp', (texture) => {
    if (disposed) { texture.dispose(); return; }
    colorTexture = texture;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    material.map = texture;
    material.needsUpdate = true;
  });
  loader.load('/3d/moon_bump_2k.webp', (texture) => {
    if (disposed) { texture.dispose(); return; }
    bumpTexture = texture;
    texture.anisotropy = 4;
    material.bumpMap = texture;
    material.bumpScale = .2;
    material.needsUpdate = true;
  });
  function resize(width: number, height: number, camera: THREE.PerspectiveCamera) {
    const distance = 430;
    const viewHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const radius = viewHeight * .0175;
    sphere.scale.setScalar(radius);
    halo.scale.set(radius * 5, radius * 5, 1);
    ring.scale.set(radius * 7, radius * 7, 1);
    const viewWidth = viewHeight * width / height;
    const progress = (group.userData.progress as number | undefined) ?? 0;
    position(progress, viewWidth, viewHeight);
  }
  function position(progress: number, viewWidth: number, viewHeight: number) {
    const t = THREE.MathUtils.smoothstep(progress, .8, 1);
    const x = THREE.MathUtils.lerp(.78, .74, t);
    const y = THREE.MathUtils.lerp(.62, .24, t);
    group.position.set((x - .5) * viewWidth, (.5 - y) * viewHeight, -430);
  }
  function update(progress: number, elapsed: number, camera: THREE.PerspectiveCamera) {
    const distance = 430;
    const viewHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    position(progress, viewHeight * camera.aspect, viewHeight);
    group.userData.progress = progress;
    const visibility = THREE.MathUtils.smoothstep(progress, .79, .86);
    group.visible = visibility > .001;
    material.opacity = visibility;
    sphere.rotation.z = Math.sin(elapsed * .035) * THREE.MathUtils.degToRad(3);
    haloMaterial.opacity = .55 * visibility;
    ringMaterial.opacity = (.07 + .045 * Math.sin(elapsed * .12)) * visibility;
  }
  function dispose() {
    disposed = true;
    scene.remove(group);
    geometry.dispose(); material.dispose(); haloTexture.dispose(); haloMaterial.dispose(); ringMaterial.dispose();
    colorTexture?.dispose(); bumpTexture?.dispose();
  }
  return { resize, update, dispose };
}
