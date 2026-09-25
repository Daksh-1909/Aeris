export function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand${footer ? ' brand--footer' : ''}`} href="#top" aria-label="Aeris home">
    <span>AERIS</span><small>Moments Above.</small>
  </a>;
}
