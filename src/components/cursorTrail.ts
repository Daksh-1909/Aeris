type Particle = { x: number; y: number; vx: number; vy: number; life: number; radius: number };

export function createCursorTrail(canvas: HTMLCanvasElement, getColors: () => [string, string]) {
  const context = canvas.getContext('2d');
  if (!context) return { emit: () => undefined, pause: () => undefined, resume: () => undefined, destroy: () => undefined };
  const particles: Particle[] = [];
  let frame = 0;
  let last = { x: -100, y: -100 };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const draw = () => {
    frame = 0;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const [first, second] = getColors();
    context.globalCompositeOperation = 'lighter';
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx; particle.y += particle.vy; particle.life -= .035;
      if (particle.life <= 0) { particles.splice(i, 1); continue; }
      const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 4);
      glow.addColorStop(0, i % 2 ? first : second); glow.addColorStop(1, 'transparent');
      context.globalAlpha = particle.life * .72; context.fillStyle = glow;
      context.beginPath(); context.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2); context.fill();
    }
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    if (particles.length) frame = window.requestAnimationFrame(draw);
  };
  const wake = () => { if (!frame && particles.length) frame = window.requestAnimationFrame(draw); };
  const onResize = () => resize();
  resize(); window.addEventListener('resize', onResize, { passive: true });
  return {
    emit(x: number, y: number) {
      const speed = Math.hypot(x - last.x, y - last.y);
      const count = Math.min(3, 1 + Math.floor(speed / 18));
      for (let i = 0; i < count; i += 1) particles.push({ x, y, vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6 - .15, life: 1, radius: 1.5 + Math.random() * 2 });
      if (particles.length > 40) particles.splice(0, particles.length - 40);
      last = { x, y }; wake();
    },
    pause() { if (frame) window.cancelAnimationFrame(frame); frame = 0; context.clearRect(0, 0, window.innerWidth, window.innerHeight); },
    resume: wake,
    destroy() { if (frame) window.cancelAnimationFrame(frame); window.removeEventListener('resize', onResize); particles.length = 0; context.clearRect(0, 0, window.innerWidth, window.innerHeight); },
  };
}
