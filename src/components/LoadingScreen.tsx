export function LoadingScreen() {
  return <div className="loading-screen" role="status" aria-live="polite" aria-label="AERIS is ready">
    <div className="loading-screen__lockup"><span>AERIS</span><small>Moments Above.</small></div>
    <div className="loading-screen__progress"><span /></div>
    <span className="loading-screen__label">LOADING</span>
  </div>;
}
