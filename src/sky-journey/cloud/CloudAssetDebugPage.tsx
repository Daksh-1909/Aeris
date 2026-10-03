import { useEffect, useState } from 'react';
import { cloudShapeNames, loadCloudRig, type CloudRig } from './cloudRig';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; rig: CloudRig }
  | { status: 'error'; message: string };

const pageStyle = {
  minHeight: '100vh',
  padding: '48px clamp(20px, 5vw, 72px)',
  background: '#07101f',
  color: '#edf2f3',
  fontFamily: 'Inter, Arial, sans-serif',
} as const;

export function CloudAssetDebugPage() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let mounted = true;
    void loadCloudRig()
      .then((rig) => { if (mounted) setState({ status: 'ready', rig }); })
      .catch((error: unknown) => {
        if (mounted) setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
      });
    return () => { mounted = false; };
  }, []);

  return <main style={pageStyle}>
    <a href="/" style={{ color: '#b8c8ec', fontSize: 12, letterSpacing: '.1em', textDecoration: 'none', textTransform: 'uppercase' }}>← Back to AERIS</a>
    <p style={{ margin: '42px 0 8px', color: '#b8c8ec', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase' }}>Development preview</p>
    <h1 style={{ margin: 0, font: '300 clamp(38px, 6vw, 68px)/1.05 "Cormorant Garamond", Georgia, serif' }}>Cloud character assets</h1>
    {state.status === 'loading' && <p role="status">Loading and validating cloud-rig.json…</p>}
    {state.status === 'error' && <p role="alert" style={{ color: '#ffaaa8' }}>Rig validation failed: {state.message}</p>}
    {state.status === 'ready' && <>
      <p role="status" style={{ margin: '16px 0 32px', color: '#a9d8c8', fontSize: 13 }}>
        Rig validation passed · 4 shapes · 7 circles per shape · matching shape and face keys
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))', gap: 20 }}>
        {cloudShapeNames.map((name) => {
          const shape = state.rig.shapes[name];
          return <section key={name} style={{ minWidth: 0, padding: 18, border: '1px solid rgb(237 242 243 / .18)', borderRadius: 16, background: 'rgb(255 255 255 / .035)' }}>
            <img
              src={`/3d/cloud-character/cloud_${name}.svg`}
              alt={`${shape.label} cloud with its calm face`}
              style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '400 / 260', objectFit: 'contain' }}
            />
            <h2 style={{ margin: '14px 0 5px', font: '400 25px/1.1 "Cormorant Garamond", Georgia, serif' }}>{shape.label}</h2>
            <p style={{ margin: 0, color: '#b9c3d7', fontSize: 11, lineHeight: 1.6 }}>
              Checkpoint {shape.checkpoint} · {shape.circles.length} circles · {state.rig.checkpoints[shape.checkpoint - 1]?.expression} expression
            </p>
          </section>;
        })}
      </div>
    </>}
  </main>;
}
