import { create } from 'zustand';
import { Track, Clip, ImageClip, ImageKeyframe, VideoClip, AudioClip } from '@/lib/types';
import { nanoid } from 'nanoid';

interface TimelineSnapshot {
  tracks: Track[];
  clips: Record<string, Clip>;
}

interface TimelineStore {
  tracks: Track[];
  clips: Record<string, Clip>;
  selectedClipId: string | null;
  playheadFrame: number;
  zoomLevel: number;
  history: TimelineSnapshot[];
  historyIndex: number;

  totalDurationInFrames: () => number;
  getClipsForTrack: (trackId: string) => Clip[];

  addTrack: (type: 'video' | 'audio') => void;
  removeTrack: (trackId: string) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;

  addClip: (clip: Clip) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateClip: (clipId: string, updates: Record<string, any>) => void;
  removeClip: (clipId: string) => void;
  moveClip: (clipId: string, newTrackId: string, newStartFrame: number) => void;

  addKeyframe: (clipId: string, keyframe: ImageKeyframe) => void;
  updateKeyframe: (clipId: string, index: number, updates: Partial<ImageKeyframe>) => void;
  removeKeyframe: (clipId: string, index: number) => void;

  selectClip: (clipId: string | null) => void;
  setPlayheadFrame: (frame: number) => void;
  setZoomLevel: (zoom: number) => void;

  undo: () => void;
  redo: () => void;
  pushSnapshot: () => void;
}

const initialTrackId1 = nanoid();
const initialTrackId2 = nanoid();

const defaultTracks: Track[] = [
  { id: initialTrackId1, name: 'Video 1', type: 'video', muted: false, locked: false },
  { id: initialTrackId2, name: 'Audio 1', type: 'audio', muted: false, locked: false },
];

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  tracks: defaultTracks,
  clips: {},
  selectedClipId: null,
  playheadFrame: 0,
  zoomLevel: 2,
  history: [],
  historyIndex: -1,

  totalDurationInFrames: () => {
    const { clips } = get();
    const all = Object.values(clips);
    if (all.length === 0) return 300;
    return Math.max(300, ...all.map((c) => c.startFrame + c.durationInFrames));
  },

  getClipsForTrack: (trackId) =>
    Object.values(get().clips).filter((c) => c.trackId === trackId),

  addTrack: (type) => {
    const { tracks, pushSnapshot } = get();
    pushSnapshot();
    const count = tracks.filter((t) => t.type === type).length + 1;
    const newTrack: Track = {
      id: nanoid(),
      name: `${type === 'video' ? 'Video' : 'Audio'} ${count}`,
      type,
      muted: false,
      locked: false,
    };
    set({ tracks: [...tracks, newTrack] });
  },

  removeTrack: (trackId) => {
    const { tracks, clips, pushSnapshot } = get();
    pushSnapshot();
    const nextClips = { ...clips };
    Object.keys(nextClips).forEach((id) => {
      if (nextClips[id].trackId === trackId) delete nextClips[id];
    });
    set({ tracks: tracks.filter((t) => t.id !== trackId), clips: nextClips });
  },

  reorderTracks: (fromIndex, toIndex) => {
    const { tracks, pushSnapshot } = get();
    pushSnapshot();
    const next = [...tracks];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    set({ tracks: next });
  },

  addClip: (clip) => {
    const { clips, pushSnapshot } = get();
    pushSnapshot();
    set({ clips: { ...clips, [clip.id]: clip } });
  },

  updateClip: (clipId, updates) => {
    const { clips } = get();
    const existing = clips[clipId];
    if (!existing) return;
    set({ clips: { ...clips, [clipId]: { ...existing, ...updates } as Clip } });
  },

  removeClip: (clipId) => {
    const { clips, selectedClipId, pushSnapshot } = get();
    pushSnapshot();
    const next = { ...clips };
    delete next[clipId];
    set({
      clips: next,
      selectedClipId: selectedClipId === clipId ? null : selectedClipId,
    });
  },

  moveClip: (clipId, newTrackId, newStartFrame) => {
    const { clips } = get();
    const clip = clips[clipId];
    if (!clip) return;
    set({
      clips: {
        ...clips,
        [clipId]: { ...clip, trackId: newTrackId, startFrame: Math.max(0, newStartFrame) },
      },
    });
  },

  addKeyframe: (clipId, keyframe) => {
    const { clips } = get();
    const clip = clips[clipId] as ImageClip;
    if (!clip || clip.type !== 'image') return;
    const keyframes = [...clip.keyframes, keyframe].sort((a, b) => a.frame - b.frame);
    set({ clips: { ...clips, [clipId]: { ...clip, keyframes } } });
  },

  updateKeyframe: (clipId, index, updates) => {
    const { clips } = get();
    const clip = clips[clipId] as ImageClip;
    if (!clip || clip.type !== 'image') return;
    const keyframes = clip.keyframes.map((kf, i) =>
      i === index ? { ...kf, ...updates } : kf
    );
    set({ clips: { ...clips, [clipId]: { ...clip, keyframes } } });
  },

  removeKeyframe: (clipId, index) => {
    const { clips } = get();
    const clip = clips[clipId] as ImageClip;
    if (!clip || clip.type !== 'image') return;
    const keyframes = clip.keyframes.filter((_, i) => i !== index);
    set({ clips: { ...clips, [clipId]: { ...clip, keyframes } } });
  },

  selectClip: (clipId) => set({ selectedClipId: clipId }),
  setPlayheadFrame: (frame) => set({ playheadFrame: frame }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),

  pushSnapshot: () => {
    const { tracks, clips, history, historyIndex } = get();
    const snapshot: TimelineSnapshot = {
      tracks: JSON.parse(JSON.stringify(tracks)),
      clips: JSON.parse(JSON.stringify(clips)),
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const snapshot = history[historyIndex - 1];
    set({ tracks: snapshot.tracks, clips: snapshot.clips, historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const snapshot = history[historyIndex + 1];
    set({ tracks: snapshot.tracks, clips: snapshot.clips, historyIndex: historyIndex + 1 });
  },
}));
