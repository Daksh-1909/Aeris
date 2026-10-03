import type { CSSProperties } from 'react';
import treeSvg from './scene-assets/tree.svg?raw';
import childrenSvg from './scene-assets/children.svg?raw';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);

const treeStops = [
  { at: 0, leaf: '#5a8a3a', light: '#ffd39a', dark: '#2f5a2a', trunk: '#6a4a30', trunkDark: '#3f2a1a' },
  { at: .3, leaf: '#4f9a3c', light: '#8fd16a', dark: '#2f6a2a', trunk: '#6b4528', trunkDark: '#4a2f1a' },
  { at: .7, leaf: '#4a6a30', light: '#ff9a5a', dark: '#243f22', trunk: '#4a3020', trunkDark: '#2a1a10' },
  { at: 1, leaf: '#16302f', light: '#3a5a7a', dark: '#0c1c20', trunk: '#1d1a24', trunkDark: '#0c0a10' },
];

function mixHex(a: string, b: string, amount: number) {
  const channels = [1, 3, 5].map((offset) => {
    const start = Number.parseInt(a.slice(offset, offset + 2), 16);
    const end = Number.parseInt(b.slice(offset, offset + 2), 16);
    return Math.round(start + (end - start) * amount).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

function treeColors(progress: number): CSSProperties {
  const found = treeStops.findIndex((stop, i) => i < treeStops.length - 1 && progress <= treeStops[i + 1].at);
  const index = found < 0 ? treeStops.length - 2 : found;
  const from = treeStops[index];
  const to = treeStops[index + 1] ?? from;
  const amount = smoothstep(clamp01((progress - from.at) / (to.at - from.at || 1)));
  return {
    '--leaf': mixHex(from.leaf, to.leaf, amount),
    '--leaf-light': mixHex(from.light, to.light, amount),
    '--leaf-dark': mixHex(from.dark, to.dark, amount),
    '--trunk': mixHex(from.trunk, to.trunk, amount),
    '--trunk-dark': mixHex(from.trunkDark, to.trunkDark, amount),
  } as CSSProperties;
}

export function GroundScene({ progress }: { progress: number }) {
  const dayOpacity = 1 - smoothstep(clamp01((progress - .54) / .15));
  const sunsetOpacity = smoothstep(clamp01((progress - .62) / .10)) * (1 - smoothstep(clamp01((progress - .76) / .13)));
  const nightOpacity = smoothstep(clamp01((progress - .82) / .08));
  const childrenOpacity = smoothstep(clamp01((progress - .64) / .06)) * (1 - smoothstep(clamp01((progress - .76) / .06)));
  const childrenVisible = progress >= .64 && progress <= .82;
  const childrenActive = progress >= .70 && progress <= .76;
  const duskT = smoothstep(clamp01((progress - .76) / .06));
  const childrenStyle = {
    '--children-rise': `${(1 - smoothstep(clamp01((progress - .64) / .06))) * 12}px`,
    '--kids': mixHex('#2a1222', '#120a14', duskT),
    '--ball': mixHex('#ffd37a', '#c9a45a', duskT),
    '--kite': mixHex('#ff6a5a', '#a84a42', duskT),
    opacity: childrenOpacity,
  } as CSSProperties;

  return <div className="journey__ground-scene" aria-hidden="true">
    <div className="journey__ground-art">
      <img src="/3d/scene/ground.svg" alt="" style={{ opacity: dayOpacity }} />
      <img src="/3d/scene/ground-sunset.svg" alt="" style={{ opacity: sunsetOpacity }} />
      <img src="/3d/scene/ground-night.svg" alt="" style={{ opacity: nightOpacity }} />
    </div>
    <div className="journey__children" style={childrenStyle}>
      <div className={`journey__children-art${childrenActive ? ' journey__children--active' : ''}${childrenVisible ? '' : ' journey__children--hidden'}`} dangerouslySetInnerHTML={{ __html: childrenSvg }} />
    </div>
    <div className="journey__tree" style={treeColors(progress)} dangerouslySetInnerHTML={{ __html: treeSvg }} />
  </div>;
}
