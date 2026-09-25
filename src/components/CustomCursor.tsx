import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type CursorMode = 'default' | 'view' | 'arrow';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>('default');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduceMotion.matches || !cursorRef.current) return;

    const cursor = cursorRef.current;
    document.documentElement.classList.add('custom-cursor-enabled');
    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3.out' });
    let hoveredElement: HTMLElement | null = null;

    const onPointerMove = (event: PointerEvent) => {
      moveX(event.clientX);
      moveY(event.clientY);
      setVisible(true);

      if (hoveredElement?.matches('.desktop-nav a, .header-contact')) {
        const bounds = hoveredElement.getBoundingClientRect();
        const dx = (event.clientX - (bounds.left + bounds.width / 2)) * 0.08;
        const dy = (event.clientY - (bounds.top + bounds.height / 2)) * 0.08;
        hoveredElement.style.setProperty('--mag-x', `${dx.toFixed(1)}px`);
        hoveredElement.style.setProperty('--mag-y', `${dy.toFixed(1)}px`);
      }
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-cursor]') : null;
      if (hoveredElement && hoveredElement !== target) {
        hoveredElement.style.removeProperty('--mag-x');
        hoveredElement.style.removeProperty('--mag-y');
      }
      hoveredElement = target;
      const nextMode = target?.dataset.cursor;
      setMode(nextMode === 'view' || nextMode === 'arrow' ? nextMode : 'default');
    };

    const onPointerLeave = () => {
      setVisible(false);
      if (hoveredElement) {
        hoveredElement.style.removeProperty('--mag-x');
        hoveredElement.style.removeProperty('--mag-y');
      }
      hoveredElement = null;
      setMode('default');
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      if (hoveredElement) {
        hoveredElement.style.removeProperty('--mag-x');
        hoveredElement.style.removeProperty('--mag-y');
      }
      gsap.set(cursor, { clearProps: 'transform' });
      document.documentElement.classList.remove('custom-cursor-enabled');
    };
  }, []);

  return <div ref={cursorRef} className={`custom-cursor custom-cursor--${mode}${visible ? ' is-visible' : ''}`} aria-hidden="true"><span>{mode === 'view' ? 'VIEW' : mode === 'arrow' ? '→' : ''}</span></div>;
}
