import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type RevealDirection = 'up' | 'down' | 'left' | 'right';

interface ImageRevealProps {
  image: string;
  srcSet?: string;
  sizes?: string;
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
export function ImageReveal({ image, srcSet, sizes, alt, direction = 'up', duration = 0.9, delay = 0, parallax = false, reveal = true, className = '' }: ImageRevealProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const frameRef = useRef<HTMLSpanElement>(null);
  const visualRef = useRef<HTMLSpanElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const visual = visualRef.current;
    const imageElement = imageRef.current;
    if (!frame || !visual || !imageElement || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let responsiveMotion: ReturnType<typeof gsap.matchMedia> | null = null;
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
        responsiveMotion = gsap.matchMedia(frame);
        responsiveMotion.add('(min-width: 761px)', () => {
          gsap.fromTo(visual, { yPercent: 4 }, {
            yPercent: -4,
            ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 1 },
          });
        });
      }
    }, frame);
    return () => {
      responsiveMotion?.revert();
      context.revert();
    };
  }, [delay, direction, duration, parallax, reveal]);

  return <span ref={frameRef} className={`image-reveal ${className}`}>
    <span ref={visualRef} className={`image-reveal__visual${parallax ? ' image-reveal__visual--parallax' : ''}`}>
      <img ref={imageRef} className={imageFailed ? 'image-reveal__image--failed' : undefined} src={image} srcSet={srcSet} sizes={sizes} width="1600" height="1200" alt={alt} loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
      {imageFailed && <span className="image-reveal__fallback" aria-hidden="true">Image unavailable</span>}
    </span>
  </span>;
}
