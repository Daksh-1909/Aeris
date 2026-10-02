import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type CursorMode = 'default' | 'link' | 'view' | 'drag' | 'hidden' | 'disabled';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>('default');
  const [visible, setVisible] = useState(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!finePointer.matches || reduceMotion.matches || !dot || !ring) return;

    let hoveredElement: HTMLElement | null = null;
    let previousMode: CursorMode = 'default';
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    const dotX = gsap.quickTo(dot, 'x', { duration: .08, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: .08, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3.out' });

    document.documentElement.classList.add('custom-cursor-enabled');
    const onPointerMove = (event: PointerEvent) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setVisible(true);
      }

      if (hoveredElement?.matches('.desktop-nav a[data-cursor="magnetic"], .header-contact[data-cursor="magnetic"]')) {
        const bounds = hoveredElement.getBoundingClientRect();
        hoveredElement.style.setProperty('--mag-x', `${((event.clientX - (bounds.left + bounds.width / 2)) * .08).toFixed(1)}px`);
        hoveredElement.style.setProperty('--mag-y', `${((event.clientY - (bounds.top + bounds.height / 2)) * .08).toFixed(1)}px`);
      }
    };

    const updateCursorMode = (nextMode: CursorMode) => {
      if (nextMode === previousMode) return;
      previousMode = nextMode;
      setMode((current) => current === nextMode ? current : nextMode);
    };
    const onPointerOver = (event: PointerEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-cursor], a, button, input, textarea, select, [contenteditable="true"]')
        : null;
      if (hoveredElement && hoveredElement !== target) {
        hoveredElement.style.removeProperty('--mag-x');
        hoveredElement.style.removeProperty('--mag-y');
      }
      hoveredElement = target;
      if (!target) return updateCursorMode('default');
      if (target.matches('input, textarea, select, [contenteditable="true"]')) return updateCursorMode('hidden');
      if (target.matches(':disabled,[aria-disabled="true"]')) return updateCursorMode('disabled');
      const requested = target.dataset.cursor;
      if (requested === 'view') return updateCursorMode('view');
      if (requested === 'drag') return updateCursorMode('drag');
      if (requested === 'hide') return updateCursorMode('hidden');
      if (requested === 'link' || target.matches('a,button')) return updateCursorMode('link');
      updateCursorMode('default');
    };
    const onPointerLeave = () => {
      if (isVisibleRef.current) {
        isVisibleRef.current = false;
        setVisible(false);
      }
      hoveredElement?.style.removeProperty('--mag-x');
      hoveredElement?.style.removeProperty('--mag-y');
      hoveredElement = null;
      updateCursorMode('default');
    };
    const onPointerDown = () => ring.classList.add('is-down');
    const onPointerUp = () => ring.classList.remove('is-down');
    const onVisibilityChange = () => {
      if (document.hidden) onPointerLeave();
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      hoveredElement?.style.removeProperty('--mag-x');
      hoveredElement?.style.removeProperty('--mag-y');
      gsap.killTweensOf([dot, ring]);
      gsap.set([dot, ring], { clearProps: 'transform' });
      document.documentElement.classList.remove('custom-cursor-enabled');
    };
  }, []);

  return <>
    <div ref={ringRef} className={`cursor-ring${visible ? ' is-visible' : ''}${mode === 'hidden' ? ' is-hidden' : ''}`} data-state={mode} aria-hidden="true">
      <span>{mode === 'view' ? 'VIEW' : mode === 'drag' ? '↔ DRAG' : mode === 'disabled' ? '×' : ''}</span>
    </div>
    <div ref={dotRef} className={`cursor-dot${visible ? ' is-visible' : ''}${mode === 'hidden' ? ' is-hidden' : ''}`} aria-hidden="true" />
  </>;
}
