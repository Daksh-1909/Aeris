import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { Photograph } from '../types/gallery';
import { imageUrl } from '../data/gallery';

interface LightboxProps {
  photos: Photograph[];
  active: Photograph;
  onClose: () => void;
  onChange: (photo: Photograph) => void;
}

export function Lightbox({ photos, active, onClose, onChange }: LightboxProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [isImageChanging, setIsImageChanging] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const changeStartTimerRef = useRef<number | null>(null);
  const changeEndTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);
  const changingRef = useRef(false);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  const changePhoto = useCallback((photo: Photograph) => {
    if (closingRef.current || changingRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onChange(photo);
      return;
    }
    changingRef.current = true;
    setIsImageChanging(true);
    changeStartTimerRef.current = window.setTimeout(() => {
      onChange(photo);
      changeEndTimerRef.current = window.setTimeout(() => {
        changingRef.current = false;
        setIsImageChanging(false);
      }, 280);
    }, 110);
  }, [onChange]);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setIsClosing(true);
    if (changeStartTimerRef.current !== null) window.clearTimeout(changeStartTimerRef.current);
    if (changeEndTimerRef.current !== null) window.clearTimeout(changeEndTimerRef.current);
    changingRef.current = false;
    setIsImageChanging(false);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 20 : 320;
    closeTimerRef.current = window.setTimeout(onClose, delay);
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (closingRef.current && event.key !== 'Tab') return;
      const activeIndex = photos.findIndex((photo) => photo.id === activeRef.current.id);
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        changePhoto(photos[(activeIndex + 1) % photos.length]);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        changePhoto(photos[(activeIndex - 1 + photos.length) % photos.length]);
      } else if (event.key === 'Tab') {
        const buttons = document.querySelectorAll<HTMLButtonElement>('.lightbox button:not([disabled])');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      if (changeStartTimerRef.current !== null) window.clearTimeout(changeStartTimerRef.current);
      if (changeEndTimerRef.current !== null) window.clearTimeout(changeEndTimerRef.current);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [changePhoto, photos, requestClose]);

  const index = photos.findIndex((photo) => photo.id === active.id);
  const previous = () => changePhoto(photos[(index - 1 + photos.length) % photos.length]);
  const next = () => changePhoto(photos[(index + 1) % photos.length]);

  return <div className={`lightbox${isClosing ? ' lightbox--closing' : ''}${isImageChanging ? ' lightbox--image-transition' : ''}`} role="dialog" aria-modal="true" aria-label={`${active.category} photograph: ${active.title}`} onClick={requestClose}>
    <button ref={closeButtonRef} className="lightbox__close" onClick={requestClose} aria-label="Close image viewer"><X /></button>
    <button className="lightbox__arrow lightbox__arrow--left" disabled={isClosing} onClick={(event) => { event.stopPropagation(); previous(); }} aria-label="Previous photograph"><ArrowLeft /></button>
    <figure onClick={(event) => event.stopPropagation()}>
      <img key={active.id} src={imageUrl(active.image, 2200)} alt={active.description ?? active.title} />
      <figcaption>
        <span>{active.category} / {String(index + 1).padStart(2, '0')} / {active.metadata ?? active.location}</span>
        <strong>{active.title}</strong>
        {active.description && <p>{active.description}</p>}
        <small>{active.location} · {active.year}</small>
      </figcaption>
    </figure>
    <button className="lightbox__arrow lightbox__arrow--right" disabled={isClosing} onClick={(event) => { event.stopPropagation(); next(); }} aria-label="Next photograph"><ArrowRight /></button>
  </div>;
}
