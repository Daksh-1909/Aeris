import { useEffect, useRef, type ReactNode } from 'react';

/** One-time, viewport-triggered reveal used for editorial photo cards. */
export function EditorialReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.dataset.revealPending = 'true';
    if (!('IntersectionObserver' in window)) {
      element.dataset.revealed = 'true';
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      element.dataset.revealed = 'true';
      observer.disconnect();
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`editorial-reveal ${className}`}>{children}</div>;
}
