import { useEffect, useRef } from 'react';
import { BufferAttribute, BufferGeometry, PerspectiveCamera, Points, PointsMaterial, Scene, WebGLRenderer } from 'three';

/** Small, low-resolution Three.js atmosphere. The hero works normally if WebGL is unavailable. */
export default function AtmosphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      return;
    }

    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.z = 10;

    const positions = new Float32Array(42 * 3);
    for (let index = 0; index < 42; index += 1) {
      positions[index * 3] = Math.sin(index * 12.9898) * 6.5;
      positions[index * 3 + 1] = Math.cos(index * 4.1414) * 3.5;
      positions[index * 3 + 2] = Math.sin(index * 78.233) * 3 - 2;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const material = new PointsMaterial({ color: '#f5f3ef', size: 1.6, sizeAttenuation: true, transparent: true, opacity: 0.2, depthWrite: false });
    const particles = new Points(geometry, material);
    scene.add(particles);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setClearColor(0x000000, 0);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let animationFrame = 0;
    let lastFrame = 0;
    const animate = (time: number) => {
      animationFrame = window.requestAnimationFrame(animate);
      if (time - lastFrame < 1000 / 30 || document.visibilityState === 'hidden') return;
      lastFrame = time;
      particles.rotation.y = Math.sin(time * 0.00008) * 0.09;
      particles.rotation.x = Math.cos(time * 0.00006) * 0.025;
      renderer.render(scene, camera);
    };
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-atmosphere__canvas" aria-hidden="true" />;
}
