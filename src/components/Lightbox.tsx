import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Expand, Heart, Share2, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { Photograph } from '../types/gallery';
import { imageSrcSet, imageUrl } from '../data/gallery';
import { ImageTransition } from './ImageTransition';

interface LightboxProps {
  photos: Photograph[];
  active: Photograph;
  onClose: () => void;
  onChange: (photo: Photograph) => void;
  favorite?: boolean;
  onToggleFavorite?: (photo: Photograph) => void;
}

export function Lightbox({ photos, active, onClose, onChange, favorite=false, onToggleFavorite }: LightboxProps) {
  const [isClosing, setIsClosing]=useState(false);
  const [isImageChanging, setIsImageChanging]=useState(false);
  const [failedImageId, setFailedImageId]=useState<string|null>(null);
  const [zoom, setZoom]=useState(1);
  const [isFullscreen, setIsFullscreen]=useState(false);
  const [transitionPair, setTransitionPair]=useState<{ from: string; to: string; }|null>(null);
  const dialogRef=useRef<HTMLDivElement>(null);
  const closeButtonRef=useRef<HTMLButtonElement>(null);
  const closeTimerRef=useRef<number|null>(null);
  const changeStartTimerRef=useRef<number|null>(null);
  const changeEndTimerRef=useRef<number|null>(null);
  const shaderFallbackTimerRef=useRef<number|null>(null);
  const closingRef=useRef(false);
  const changingRef=useRef(false);
  const activeRef=useRef(active);
  useEffect(() => { activeRef.current=active; }, [active]);

  const finishTransition=useCallback(() => {
    if (shaderFallbackTimerRef.current!==null) window.clearTimeout(shaderFallbackTimerRef.current);
    shaderFallbackTimerRef.current=null;
    setTransitionPair(null);
    changingRef.current=false;
    setIsImageChanging(false);
  }, []);

  const changePhoto=useCallback((photo: Photograph) => {
    if (closingRef.current||changingRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onChange(photo);
      return;
    }
    const fromPhoto=activeRef.current;
    const useWebGL=window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches
      &&(navigator.hardwareConcurrency||4)>2;
    changingRef.current=true;
    setIsImageChanging(true);
    changeStartTimerRef.current=window.setTimeout(() => {
      onChange(photo);
      if (useWebGL) {
        setTransitionPair({ from: imageUrl(fromPhoto.image, 2200), to: imageUrl(photo.image, 2200) });
        shaderFallbackTimerRef.current=window.setTimeout(finishTransition, 1800);
      } else {
        changeEndTimerRef.current=window.setTimeout(finishTransition, 280);
      }
    }, 110);
  }, [finishTransition, onChange]);

  const requestClose=useCallback(() => {
    if (closingRef.current) return;
    closingRef.current=true;
    setIsClosing(true);
    if (changeStartTimerRef.current!==null) window.clearTimeout(changeStartTimerRef.current);
    if (changeEndTimerRef.current!==null) window.clearTimeout(changeEndTimerRef.current);
    if (shaderFallbackTimerRef.current!==null) window.clearTimeout(shaderFallbackTimerRef.current);
    shaderFallbackTimerRef.current=null;
    setTransitionPair(null);
    changingRef.current=false;
    setIsImageChanging(false);
    const delay=window.matchMedia('(prefers-reduced-motion: reduce)').matches? 20:320;
    closeTimerRef.current=window.setTimeout(onClose, delay);
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused=document.activeElement instanceof HTMLElement? document.activeElement:null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    closeButtonRef.current?.focus();

    const onKey=(event: KeyboardEvent) => {
      if (closingRef.current&&event.key!=='Tab') return;
      const activeIndex=photos.findIndex((photo) => photo.id===activeRef.current.id);
      if (event.key==='Escape') {
        event.preventDefault();
        requestClose();
      } else if (event.key==='ArrowRight') {
        event.preventDefault();
        changePhoto(photos[(activeIndex+1)%photos.length]);
      } else if (event.key==='ArrowLeft') {
        event.preventDefault();
        changePhoto(photos[(activeIndex-1+photos.length)%photos.length]);
      } else if (event.key==='Tab') {
        const focusable=dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first=focusable[0];
        const last=focusable[focusable.length-1];
        const focusIsInside=dialogRef.current?.contains(document.activeElement);
        if (event.shiftKey&&(!focusIsInside||document.activeElement===first)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey&&(!focusIsInside||document.activeElement===last)) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (closeTimerRef.current!==null) window.clearTimeout(closeTimerRef.current);
      if (changeStartTimerRef.current!==null) window.clearTimeout(changeStartTimerRef.current);
      if (changeEndTimerRef.current!==null) window.clearTimeout(changeEndTimerRef.current);
      if (shaderFallbackTimerRef.current!==null) window.clearTimeout(shaderFallbackTimerRef.current);
      document.body.style.overflow=previousOverflow;
      previouslyFocused?.focus();
    };
  }, [changePhoto, photos, requestClose]);

  const index=photos.findIndex((photo) => photo.id===active.id);
  const previous=() => changePhoto(photos[(index-1+photos.length)%photos.length]);
  const next=() => changePhoto(photos[(index+1)%photos.length]);
  const download=() => { const link=document.createElement('a'); link.href=imageUrl(active.image, 2200); link.download=`${active.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`; link.rel='noreferrer'; link.click(); };
  const share=async () => { const payload={ title: active.title, text: `${active.title} · AERIS`, url: location.href }; if (navigator.share) await navigator.share(payload); else if (navigator.clipboard) await navigator.clipboard.writeText(payload.url); };
  const fullscreen=async () => { if (document.fullscreenElement) await document.exitFullscreen(); else await dialogRef.current?.requestFullscreen?.(); setIsFullscreen(Boolean(document.fullscreenElement)); };

  return <div ref={dialogRef} className={`lightbox${isClosing? ' lightbox--closing':''}${isImageChanging? ' lightbox--image-transition':''}${transitionPair? ' lightbox--webgl-transition':''}`} role="dialog" aria-modal="true" aria-label={`${active.category} photograph: ${active.title}`} onClick={requestClose}>
    <button ref={closeButtonRef} className="lightbox__close" onClick={requestClose} aria-label="Close image viewer"><X /></button>
    <button className="lightbox__arrow lightbox__arrow--left" disabled={isClosing||isImageChanging} onClick={(event) => { event.stopPropagation(); previous(); }} aria-label="Previous photograph"><ArrowLeft /></button>
    <figure onClick={(event) => event.stopPropagation()}>
      <img key={active.id} className={failedImageId===active.id? 'is-unavailable':undefined} style={{ transform: `scale(${zoom})` }} src={imageUrl(active.image, 1600)} srcSet={imageSrcSet(active.image, [640, 960, 1280, 1600, 2200])} sizes="(max-width: 760px) 100vw, 78vw" width="2200" height="1467" alt={active.description??active.title} loading="eager" decoding="async" onError={() => setFailedImageId(active.id)} />
      {failedImageId===active.id&&<span className="lightbox__image-fallback" aria-hidden="true">Photograph unavailable</span>}
      {transitionPair&&<ImageTransition from={transitionPair.from} to={transitionPair.to} onComplete={finishTransition} onFallback={finishTransition} />}
      <figcaption aria-live="polite" aria-atomic="true">
        <span>{active.category} / {String(index+1).padStart(2, '0')} / {active.metadata??active.location}</span>
        <strong>{active.title}</strong>
        {active.description&&<p>{active.description}</p>}
        <small>{active.location} · {active.year}</small>
      </figcaption>
    </figure>
    <button className="lightbox__arrow lightbox__arrow--right" disabled={isClosing||isImageChanging} onClick={(event) => { event.stopPropagation(); next(); }} aria-label="Next photograph"><ArrowRight /></button>
    <div className="lightbox__tools" onClick={(event) => event.stopPropagation()}><button aria-label={isFullscreen? 'Exit fullscreen':'Enter fullscreen'} onClick={() => void fullscreen()}><Expand size={17} /></button><button aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, value-.25))} disabled={zoom<=1}><ZoomOut size={17} /></button><span aria-live="polite">{Math.round(zoom*100)}%</span><button aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(2.5, value+.25))} disabled={zoom>=2.5}><ZoomIn size={17} /></button><button aria-label="Download photograph" onClick={download}><Download size={17} /></button><button aria-label="Share photograph" onClick={() => void share()}><Share2 size={17} /></button><button aria-label={favorite? 'Remove from favorites':'Add to favorites'} aria-pressed={favorite} onClick={() => onToggleFavorite?.(active)}><Heart size={17} fill={favorite? 'currentColor':'none'} /></button></div>
  </div>;
}
