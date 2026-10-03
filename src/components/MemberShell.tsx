import { lazy, Suspense, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { isSupabaseConfigured } from '../services/supabaseConfig';

const MemberExperience = lazy(() => import('./MemberExperience').then((module) => ({ default: module.MemberExperience })));

export function MemberShell({ children }: { children: ReactNode }) {
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const bannerRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    const root = document.documentElement;
    const measure = () => root.style.setProperty('--banner-h', `${banner.getBoundingClientRect().height}px`);
    const observer = new ResizeObserver(measure);
    observer.observe(banner);
    measure();
    return () => { observer.disconnect(); root.style.removeProperty('--banner-h'); };
  }, [showDemoBanner]);
  return <Suspense fallback={<div className="member-shell-loading" role="status">AERIS</div>}><>{!isSupabaseConfigured&&showDemoBanner&&<aside ref={bannerRef} className="demo-mode-banner" role="status"><span>Demo mode — data stays in this browser only; email and contact messages are not sent.</span><button type="button" aria-label="Dismiss demo mode notice" onClick={() => setShowDemoBanner(false)}>×</button></aside>}<MemberExperience>{children}</MemberExperience></></Suspense>;
}
