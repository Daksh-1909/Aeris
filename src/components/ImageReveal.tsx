import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type RevealDirection = 'up' | 'down' | 'left' | 'right';

interface ImageRevealProps {
  image: string;
  alt: string;
  direction?: RevealDirection;
  duration?: number;
  delay?: number;
  parallax?: boolean;
  reveal?: boolean;
  className?: string;
}

const closedMasks: Record<RevealDirection, string> = {
  up: 'inset(100% 0 0 0)',
  down: 'inset(0 0 100% 0)',
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
};

/** Scroll triggered mask reveal with a restrained scale and optional image drift. */
export function ImageReveal({ image, alt, direction = 'up', duration = 0.9, delay = 0, parallax = false, reveal = true, className = '' }: ImageRevealProps) {
  const frameRef = useRef<HTMLSpanElement>(null);
  const visualRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const visual = visualRef.current;
    const imageElement = imageRef.current;
    if (!frame || !visual || !imageElement || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      if (reveal) {
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: frame, start: 'top 86%', once: true },
        });
        timeline
          .fromTo(frame, { clipPath: closedMasks[direction] }, { clipPath: 'inset(0% 0% 0% 0%)', duration, delay, ease: 'power2.inOut' })
          .fromTo(imageElement, { scale: 1.05, filter: 'blur(6px)' }, { scale: 1, filter: 'blur(0px)', duration, ease: 'power2.out' }, '<');
      }

      if (parallax) {
        gsap.fromTo(visual, { yPercent: 4 }, {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      }
    }, frame);
    return () => context.revert();
  }, [delay, direction, duration, parallax, reveal]);

  return <span ref={frameRef} className={`image-reveal ${className}`}>
    <span ref={visualRef} className={`image-reveal__visual${parallax ? ' image-reveal__visual--parallax' : ''}`}>
      <img ref={imageRef} src={image} alt={alt} loading="lazy" />
    </span>
  </span>;
}
