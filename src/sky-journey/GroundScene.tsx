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
  const found = treeStops.findIndex((_, i) => i < treeStops.length - 1 && progress <= treeStops[i + 1].at);
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
  const picnicOpacity = smoothstep(clamp01((progress - .45) / .04)) * (1 - smoothstep(clamp01((progress - .61) / .02)));
  const childrenStyle = {
    '--children-rise': `${(1 - smoothstep(clamp01((progress - .64) / .06))) * 12}px`,
    '--kids': mixHex('#2a1222', '#120a14', duskT),
    '--ball': mixHex('#ffd37a', '#c9a45a', duskT),
    '--kite': mixHex('#ff6a5a', '#a84a42', duskT),
    opacity: childrenOpacity,
  } as CSSProperties;

  return <>
    <div className="journey__ground-scene" data-layer="ground" aria-hidden="true">
      <div className="journey__ground-art">
        <img src="/3d/scene/ground.svg" alt="" style={{ opacity: dayOpacity }} />
        <img src="/3d/scene/ground-sunset.svg" alt="" style={{ opacity: sunsetOpacity }} />
        <img src="/3d/scene/ground-night.svg" alt="" style={{ opacity: nightOpacity }} />
      </div>
      <div className="journey__picnic" style={{ opacity: picnicOpacity, transform: `translateY(${(1 - picnicOpacity) * 8}px)` }}>
        <svg viewBox="0 0 340 150" role="presentation">
          <defs>
            <pattern id="picnic-check" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M0 0H24V24H0Z" fill="#ead8b7" />
              <path d="M0 0H12V12H0ZM12 12H24V24H12Z" fill="#b85b4b" opacity=".82" />
              <path d="M0 12H12V24H0ZM12 0H24V12H12Z" fill="#f1e8d2" />
            </pattern>
          </defs>
          <path d="M29 117 Q170 102 311 117 L303 138 Q170 149 37 138Z" fill="url(#picnic-check)" stroke="#f5e8cc" strokeWidth="3" />
          <path d="M43 137l-5 8m22-8-3 8m22-8-2 8m22-8-1 8m22-8v8m22-8v8m22-8v8m22-8v8m22-8-1 8m22-8-2 8m22-8-3 8m22-8-5 8" stroke="#f5e8cc" strokeWidth="2" strokeLinecap="round" />
          <g strokeLinecap="round" strokeLinejoin="round">
            <circle cx="101" cy="52" r="13" fill="#c67f58" />
            <path d="M90 49q1-17 17-12 8 3 7 12-9-4-14-11-3 7-10 11Z" fill="#493331" />
            <path d="M86 70q15-12 30 0l8 30-20 10-23-10Z" fill="#d2904f" />
            <path d="M88 99q16 5 29 0l17 11-5 8H87q-11-7 1-19Z" fill="#39485a" />
            <path d="M93 73l-15 15 17 7m15-20 13 12-12 5" fill="none" stroke="#c67f58" strokeWidth="6" />

            <circle cx="245" cy="55" r="13" fill="#8d5743" />
            <path d="M232 52q1-15 15-15 12 1 13 15-10-2-16-10-3 7-12 10Z" fill="#252d35" />
            <path d="M230 73q15-13 30 0l7 27-20 10-24-10Z" fill="#64817b" />
            <path d="M230 99q12 6 29 0l17 11-5 8h-43q-10-8 2-19Z" fill="#38434b" />
            <path d="M233 75l-13 13 17 7m18-20 12 13-12 5" fill="none" stroke="#8d5743" strokeWidth="6" />
          </g>
          <ellipse cx="170" cy="105" rx="23" ry="6" fill="#f4efdf" />
          <path d="M150 103q20-20 40 0Z" fill="#dca94f" />
          <path d="M161 95q9-12 18 0" fill="none" stroke="#548151" strokeWidth="3" />
          <circle cx="196" cy="105" r="6" fill="#d95d54" />
          <circle cx="142" cy="108" r="5" fill="#7a9c62" />
        </svg>
      </div>
      <div className="journey__children" data-layer="children" style={childrenStyle}>
        <div className={`journey__children-art${childrenActive ? ' journey__children--active' : ''}${childrenVisible ? '' : ' journey__children--hidden'}`} dangerouslySetInnerHTML={{ __html: childrenSvg }} />
      </div>
    </div>
    <div className="journey__tree" data-layer="tree" style={treeColors(progress)} aria-hidden="true" dangerouslySetInnerHTML={{ __html: treeSvg }} />
  </>;
}
