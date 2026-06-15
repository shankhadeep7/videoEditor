import { create } from 'zustand';
import { DEFAULT_FPS, DEFAULT_WIDTH, DEFAULT_HEIGHT } from '@/lib/constants';

interface ProjectStore {
  fps: number;
  width: number;
  height: number;
  setFps: (fps: number) => void;
  setResolution: (width: number, height: number) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  fps: DEFAULT_FPS,
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  setFps: (fps) => set({ fps }),
  setResolution: (width, height) => set({ width, height }),
}));
