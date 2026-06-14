export function framesToTime(frames: number, fps: number): string {
  const totalSeconds = Math.floor(frames / fps);
  const remainingFrames = frames % fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(remainingFrames).padStart(2, '0')}`;
}

export function snapToGrid(frame: number, gridSize: number): number {
  return Math.round(frame / gridSize) * gridSize;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
