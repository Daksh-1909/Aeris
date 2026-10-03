import * as THREE from 'three';
import { sample, type RGB } from '../../sky/timeline';
import { qualityLimits, type JourneyQuality } from './quality';

type Cloud = { sprite: THREE.Sprite; baseX: number; baseY: number; width: number; phase: number; textureIndex: number };
const CLOUD_TEXTURES = [1, 2, 3, 4].map((index) => `/3d/clouds/cloud_${index}.webp`);

function color(rgb: RGB) {
  return new THREE.Color().setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace);
}

export function createClouds(scene: THREE.Scene) {
  const layers: { depth: number; factor: number; clouds: Cloud[]; group: THREE.Group }[] = [];
  const textures: (THREE.Texture | undefined)[] = [undefined, undefined, undefined, undefined];
  const loader = new THREE.TextureLoader();
  CLOUD_TEXTURES.forEach((url, textureIndex) => {
    loader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      textures[textureIndex] = texture;
      layers.forEach((layer) => layer.clouds.forEach((cloud) => {
        if (cloud.textureIndex === textureIndex) {
          (cloud.sprite.material as THREE.SpriteMaterial).map = texture;
          (cloud.sprite.material as THREE.SpriteMaterial).needsUpdate = true;
        }
      }));
    });
  });
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const counts = mobile ? [3, 3, 4] : qualityLimits('high').clouds;
  const depths = [-200, -350, -550];
  const factors = [1, .6, .3];
  depths.forEach((depth, layerIndex) => {
    const group = new THREE.Group(); group.position.z = depth; scene.add(group);
    const clouds: Cloud[] = [];
    for (let i = 0; i < counts[layerIndex]; i += 1) {
      const material = new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, opacity: .3, depthWrite: false, toneMapped: false });
      const sprite = new THREE.Sprite(material);
      sprite.renderOrder = 2 + layerIndex;
      group.add(sprite);
      clouds.push({ sprite, baseX: (i / counts[layerIndex] - .5) * 1.65 + (Math.random() - .5) * .16, baseY: .19 + ((i * 7 + layerIndex * 3) % 11) / 100, width: .12 + ((i * 5 + layerIndex * 2) % 7) / 100, phase: (i * 17 + layerIndex * 23) % 41, textureIndex: (i + layerIndex) % 4 });
    }
    layers.push({ depth, factor: factors[layerIndex], clouds, group });
  });
  let viewWidth = 1; let viewHeight = 1;
  function resize(width: number, height: number, camera: THREE.PerspectiveCamera) {
    void width;
    void height;
    viewHeight = 2 * Math.abs(depths[0]) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    viewWidth = viewHeight * camera.aspect;
  }
  function update(progress: number, elapsed: number) {
    const sky = sample(progress);
    const cloudTint = color([255, 255, 255]).lerp(color(sky.horizon), THREE.MathUtils.clamp((.96 - sky.cloudBrightness) * .72, .05, .72));
    layers.forEach((layer, layerIndex) => {
      const depthScale = Math.abs(layer.depth) / Math.abs(depths[0]);
      const localWidth = viewWidth * depthScale;
      const localHeight = viewHeight * depthScale;
      const amount = THREE.MathUtils.clamp(sky.cloudBrightness, 0, 1);
      const night = THREE.MathUtils.smoothstep(progress, .81, .99);
      layer.clouds.forEach((cloud, index) => {
        const material = cloud.sprite.material as THREE.SpriteMaterial;
        const drift = elapsed * (.5 + cloud.phase % 15 / 10) * (layerIndex === 0 ? 1 : layerIndex === 1 ? .6 : .3);
        const scroll = progress * (.68 + layerIndex * .05) * layer.factor;
        const normalized = ((cloud.baseX + scroll + drift / Math.max(localWidth, 1) + 1.1) % 2.2 + 2.2) % 2.2 - 1.1;
        cloud.sprite.position.set(normalized * localWidth, (.42 - cloud.baseY) * localHeight, 0);
        cloud.sprite.scale.set(localWidth * cloud.width, localHeight * cloud.width * .48, 1);
        material.color.copy(cloudTint);
        const layerOpacity = [.54, .37, .24][layerIndex];
        material.opacity = layerOpacity * (.07 + amount * .76) * (1 - night) + (index < 2 ? .12 * night : 0);
        if (night > .5 && index < 2) material.color.set(0x192238);
        material.needsUpdate = false;
      });
    });
  }
  function setQuality(quality: JourneyQuality) {
    const targets = mobile ? [3, 3, 4] : qualityLimits(quality).clouds;
    layers.forEach((layer, layerIndex) => layer.clouds.forEach((cloud, index) => {
      cloud.sprite.visible = index < targets[layerIndex];
    }));
  }
  function dispose() {
    layers.forEach(({ group, clouds }) => {
      clouds.forEach(({ sprite }) => (sprite.material as THREE.Material).dispose());
      scene.remove(group);
    });
    textures.forEach((texture) => texture?.dispose());
  }
  return { resize, update, setQuality, dispose };
}
