import { lazy, Suspense, type ReactNode } from 'react';
import { isSupabaseConfigured } from '../services/supabaseClient';

const MemberExperience = lazy(() => import('./MemberExperience').then((module) => ({ default: module.MemberExperience })));

export function MemberShell({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="member-shell-loading" role="status">AERIS</div>}><>{!isSupabaseConfigured&&<aside className="demo-mode-banner" role="status">Demo mode — data stays in this browser only; email and contact messages are not sent.</aside>}<MemberExperience>{children}</MemberExperience></></Suspense>;
}
