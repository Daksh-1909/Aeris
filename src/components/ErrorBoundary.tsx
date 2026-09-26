import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { hasError: boolean; }
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('AERIS interface error', error, info.componentStack); }
  render() { if (this.state.hasError) return <main role="alert" style={{ minHeight: '100vh', display: 'grid', placeContent: 'center', padding: 24, background: '#111514', color: '#f5f3ef', textAlign: 'center' }}><p className="eyebrow">AERIS / A MOMENT TO RESET</p><h1 style={{ font: "300 clamp(48px, 8vw, 88px) 'Cormorant Garamond', serif" }}>Something interrupted the view.</h1><button onClick={() => window.location.assign('/')} style={{ padding: '14px 20px', cursor: 'pointer' }}>Return to AERIS</button></main>; return this.props.children; }
}
