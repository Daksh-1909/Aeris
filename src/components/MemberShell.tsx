import { lazy, Suspense, type ReactNode } from 'react';

const MemberExperience = lazy(() => import('./MemberExperience').then((module) => ({ default: module.MemberExperience })));

export function MemberShell({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#111514', color: '#f5f3ef', letterSpacing: '.2em', fontSize: 10 }}>AERIS</div>}><MemberExperience>{children}</MemberExperience></Suspense>;
}
