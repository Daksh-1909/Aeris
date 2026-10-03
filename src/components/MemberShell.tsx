import { lazy, Suspense, useState, type ReactNode } from 'react';
import { isSupabaseConfigured } from '../services/supabaseConfig';

const MemberExperience = lazy(() => import('./MemberExperience').then((module) => ({ default: module.MemberExperience })));

export function MemberShell({ children }: { children: ReactNode }) {
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  return <Suspense fallback={<div className="member-shell-loading" role="status">AERIS</div>}><>{!isSupabaseConfigured&&showDemoBanner&&<aside className="demo-mode-banner" role="status"><span>Demo mode — data stays in this browser only; email and contact messages are not sent.</span><button type="button" aria-label="Dismiss demo mode notice" onClick={() => setShowDemoBanner(false)}>×</button></aside>}<MemberExperience>{children}</MemberExperience></></Suspense>;
}
