import * as THREE from 'three';
import { sunElevation } from './sunMoonPathMath';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);

export function sunDirection(progress: number): THREE.Vector3 {
  const t = clamp01((progress - .04) / .76);
  const elevation = sunElevation(progress);
  const azimuth = THREE.MathUtils.lerp(-.9, .9, t);
  return new THREE.Vector3(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    -Math.cos(azimuth) * Math.cos(elevation),
  ).normalize();
}

export function moonDirection(progress: number): THREE.Vector3 {
  const t = ease(clamp01((progress - .8) / .2));
  const elevation = THREE.MathUtils.lerp(-.12, .75, t);
  const azimuth = THREE.MathUtils.lerp(.75, .35, t);
  return new THREE.Vector3(
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
    -Math.cos(azimuth) * Math.cos(elevation),
  ).normalize();
}
