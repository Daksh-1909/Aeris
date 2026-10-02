import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { hasError: boolean; }
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('AERIS interface error', error, info.componentStack); }
  render() {
    if (this.state.hasError) {
      return <main className="app-error" role="alert">
        <p className="eyebrow">AERIS / A MOMENT TO RESET</p>
        <h1>Something interrupted the view.</h1>
        <p>Please reload the page, or return to the AERIS home page.</p>
        <div className="app-error__actions">
          <button type="button" onClick={() => window.location.reload()}>Reload page</button>
          <a href="/">Return to AERIS</a>
        </div>
      </main>;
    }
    return this.props.children;
  }
}
