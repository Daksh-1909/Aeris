import { useEffect, useRef } from 'react';
import './night-sky.css';

function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

type Star = { x: number; y: number; radius: number; phase: number; speed: number; sparkle: boolean };

export function NightSky({ progress, opacity, auroraOpacity }: { progress: number; opacity: number; auroraOpacity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  const opacityRef = useRef(opacity);
  const active = opacity > 0;

  useEffect(() => {
    progressRef.current = progress;
    opacityRef.current = opacity;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context || !active) return;

    const random = seededRandom(1707);
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frameId = 0;
    let isIntersecting = false;
    let pageVisible = document.visibilityState === 'visible';
    let nextShotAt = 0;
    let shootingStar: { start: number; x: number; y: number; length: number; duration: number } | null = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars: Star[] = [];

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const count = width <= 767 ? 120 : 250;
      stars = Array.from({ length: count }, (_, index) => ({
        x: random() * width,
        y: random() * height * .78,
        radius: .45 + random() * 1.15,
        phase: random() * Math.PI * 2,
        speed: .45 + random() * 1.3,
        sparkle: index < 12,
      }));
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const schedule = () => {
      if (!reducedMotion && isIntersecting && pageVisible && opacityRef.current > 0 && frameId === 0) {
        frameId = requestAnimationFrame(draw);
      }
    };

    const draw = (time: number) => {
      frameId = 0;
      context.clearRect(0, 0, width, height);
      const progressNow = progressRef.current;
      const rotation = (progressNow - .8) * .12;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      for (const star of stars) {
        const dx = star.x - width / 2;
        const dy = star.y - height / 2;
        const x = width / 2 + dx * cos - dy * sin;
        const y = height / 2 + dx * sin + dy * cos;
        const twinkle = reducedMotion ? .78 : .42 + .58 * ((Math.sin(time * .001 * star.speed + star.phase) + 1) / 2);
        const radius = star.radius * (star.sparkle ? 1.16 : 1);
        context.globalAlpha = twinkle;
        context.fillStyle = star.sparkle ? '#fff8db' : '#dceaff';
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        if (star.sparkle) {
          context.globalAlpha = twinkle * .58;
          context.strokeStyle = '#fff8db';
          context.lineWidth = .7;
          context.beginPath();
          context.moveTo(x - radius * 3, y); context.lineTo(x + radius * 3, y);
          context.moveTo(x, y - radius * 3); context.lineTo(x, y + radius * 3);
          context.stroke();
        }
      }

      if (!reducedMotion) {
        if (nextShotAt === 0) nextShotAt = time + 8000 + random() * 7000;
        if (!shootingStar && time >= nextShotAt) {
          shootingStar = { start: time, x: random() * width * .62, y: random() * height * .30, length: 70 + random() * 90, duration: 900 + random() * 500 };
        }
        if (shootingStar) {
          const elapsed = time - shootingStar.start;
          const life = Math.max(0, 1 - elapsed / shootingStar.duration);
          const distance = elapsed / shootingStar.duration * shootingStar.length;
          const x = shootingStar.x + distance;
          const y = shootingStar.y + distance * .42;
          const tail = context.createLinearGradient(x - shootingStar.length * .34, y - shootingStar.length * .14, x, y);
          tail.addColorStop(0, 'rgb(213 232 255 / 0)');
          tail.addColorStop(1, `rgb(235 245 255 / ${life})`);
          context.globalAlpha = life;
          context.strokeStyle = tail;
          context.lineWidth = 1.6;
          context.beginPath();
          context.moveTo(x - shootingStar.length * .34, y - shootingStar.length * .14);
          context.lineTo(x, y);
          context.stroke();
          if (elapsed >= shootingStar.duration) {
            shootingStar = null;
            nextShotAt = time + 8000 + random() * 7000;
          }
        }
      }
      context.globalAlpha = 1;
      schedule();
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (!isIntersecting) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (reducedMotion) {
        draw(0);
      } else {
        schedule();
      }
    });
    visibilityObserver.observe(canvas);
    const handleVisibility = () => {
      pageVisible = document.visibilityState === 'visible';
      if (!pageVisible) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (isIntersecting && reducedMotion) {
        draw(0);
      } else {
        schedule();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [active]);

  const nebulaOpacity = .7 * ((Math.max(0, Math.min(1, (progress - .8) / .2))) ** 2 * (3 - 2 * Math.max(0, Math.min(1, (progress - .8) / .2))));

  return <>
    <div className="journey__plane journey__plane--nebula" data-layer="nebula" aria-hidden="true">
      <div className={`journey__nebula${nebulaOpacity > 0 ? ' journey__nebula--active' : ''}`} style={{ opacity: nebulaOpacity }}>
      <span className="journey__nebula-blob journey__nebula-blob--violet" />
      <span className="journey__nebula-blob journey__nebula-blob--blue" />
      <span className="journey__nebula-blob journey__nebula-blob--rose" />
      </div>
    </div>
    <div className="journey__plane journey__plane--aurora" data-layer="aurora" aria-hidden="true">
      <div className={`journey__aurora${auroraOpacity > 0 ? ' journey__aurora--active' : ''}`} style={{ opacity: auroraOpacity }}>
      <svg className="journey__aurora-art" viewBox="0 0 1440 520" preserveAspectRatio="none">
        <defs>
          <linearGradient id="aurora-green" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#54ffb3" stopOpacity="0" /><stop offset=".3" stopColor="#54ffb3" stopOpacity=".06" /><stop offset=".55" stopColor="#54ffb3" stopOpacity=".42" /><stop offset=".8" stopColor="#54ffb3" stopOpacity=".12" /><stop offset="1" stopColor="#54ffb3" stopOpacity="0" /></linearGradient>
          <linearGradient id="aurora-teal" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#46e5db" stopOpacity="0" /><stop offset=".34" stopColor="#46e5db" stopOpacity=".05" /><stop offset=".6" stopColor="#46e5db" stopOpacity=".36" /><stop offset=".84" stopColor="#46e5db" stopOpacity=".1" /><stop offset="1" stopColor="#46e5db" stopOpacity="0" /></linearGradient>
          <linearGradient id="aurora-violet" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#aa72ff" stopOpacity="0" /><stop offset=".38" stopColor="#aa72ff" stopOpacity=".03" /><stop offset=".62" stopColor="#aa72ff" stopOpacity=".28" /><stop offset=".86" stopColor="#aa72ff" stopOpacity=".08" /><stop offset="1" stopColor="#aa72ff" stopOpacity="0" /></linearGradient>
        </defs>
        <g className="journey__aurora-ribbon journey__aurora-ribbon--green"><path fill="url(#aurora-green)" d="M0 125 C180 95 300 165 480 128 S780 90 960 128 S1260 96 1440 128 L1440 180 C1260 150 1150 215 970 184 S675 238 493 193 S180 233 0 198Z" /></g>
        <g className="journey__aurora-ribbon journey__aurora-ribbon--teal"><path fill="url(#aurora-teal)" d="M0 165 C180 135 300 205 480 168 S780 130 960 168 S1260 136 1440 168 L1440 220 C1260 190 1150 255 970 224 S675 278 493 233 S180 273 0 238Z" /></g>
        <g className="journey__aurora-ribbon journey__aurora-ribbon--violet"><path fill="url(#aurora-violet)" d="M0 205 C180 175 300 245 480 208 S780 170 960 208 S1260 176 1440 208 L1440 260 C1260 230 1150 295 970 264 S675 318 493 273 S180 313 0 278Z" /></g>
      </svg>
      </div>
    </div>
    <div className="journey__plane journey__plane--stars" data-layer="stars" aria-hidden="true">
      <canvas ref={canvasRef} className="journey__stars" style={{ opacity }} />
    </div>
  </>;
}
