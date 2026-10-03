let progress = 0;
const listeners = new Set<(value: number) => void>();

export function getSkyProgress() {
  return progress;
}

export function setSkyProgress(value: number) {
  progress = Math.max(0, Math.min(1, value));
  listeners.forEach((listener) => listener(progress));
}

export function subscribeSkyProgress(listener: (value: number) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
