import * as THREE from 'three';
import { moonDirection } from '../sunMoonPath';
import { sample, type SkySample } from '../timeline';

function makeHaloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(221,235,255,0.38)');
    gradient.addColorStop(.2, 'rgba(190,216,255,0.16)');
    gradient.addColorStop(1, 'rgba(150,190,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMoon(scene: THREE.Scene, camera: THREE.Camera, maxAnisotropy: number) {
  let disposed = false;
  const loader = new THREE.TextureLoader();
  const colorMap = loader.load('/3d/moon_color_2k.webp', (texture) => { if (disposed) texture.dispose(); }, undefined, () => {});
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = Math.min(4, maxAnisotropy);
  const bumpMap = loader.load('/3d/moon_bump_2k.webp', (texture) => { if (disposed) texture.dispose(); }, undefined, () => {});
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.anisotropy = Math.min(4, maxAnisotropy);

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: colorMap,
    bumpMap,
    bumpScale: .2,
    roughness: 1,
    metalness: 0,
    color: 0xece9e2,
    emissive: 0x0a1020,
    emissiveIntensity: .4,
    transparent: true,
    opacity: 0,
    depthWrite: true,
  });
  const moon = new THREE.Mesh(geometry, material);
  moon.scale.setScalar(20);
  // The texture's center is local +x; rotating it onto +z keeps the near side facing home.
  moon.rotation.y = -Math.PI / 2;
  moon.renderOrder = 3;
  scene.add(moon);

  const moonPosition = new THREE.Vector3();
  const lightTarget = new THREE.Object3D();
  scene.add(lightTarget);
  const moonLight = new THREE.DirectionalLight(0xdce8f4, 0);
  moonLight.target = lightTarget;
  scene.add(moonLight);

  const haloTexture = makeHaloTexture();
  const haloMaterial = new THREE.SpriteMaterial({
    map: haloTexture,
    color: 0xb9d5ff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    toneMapped: false,
  });
  const halo = new THREE.Sprite(haloMaterial);
  halo.scale.set(126, 126, 1);
  halo.renderOrder = 2;
  scene.add(halo);

  const ringGeometry = new THREE.RingGeometry(23, 24.2, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x9ebde9,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.renderOrder = 3;
  scene.add(ring);

  const update = (sky: SkySample, time: number) => {
    const direction = moonDirection(sky.progress);
    moonPosition.copy(direction).multiplyScalar(650);
    moon.position.copy(moonPosition);
    moon.rotation.set(Math.sin(time * .021) * Math.PI / 60, -Math.PI / 2 + Math.sin(time * .017) * Math.PI / 60, 0);
    material.opacity = sky.moonOpacity;
    halo.position.copy(moonPosition);
    haloMaterial.opacity = sky.moonOpacity * .31;
    ring.position.copy(moonPosition);
    ring.quaternion.copy(camera.quaternion);
    ringMaterial.opacity = sky.moonOpacity * .035;
    lightTarget.position.copy(moonPosition);
    moonLight.position.set(
      moonPosition.x - 190,
      moonPosition.y + 145,
      moonPosition.z - 175,
    );
    moonLight.intensity = sky.moonOpacity * 1.65;
  };

  const dispose = () => {
    disposed = true;
    geometry.dispose();
    material.dispose();
    colorMap.dispose();
    bumpMap.dispose();
    haloTexture.dispose();
    haloMaterial.dispose();
    ringGeometry.dispose();
    ringMaterial.dispose();
  };

  update(sample(0), 0);
  return { update, dispose };
}
