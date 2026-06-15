import { create } from 'zustand';
import { MediaItem } from '@/lib/types';

interface MediaStore {
  mediaItems: Record<string, MediaItem>;
  addMedia: (item: MediaItem) => void;
  removeMedia: (id: string) => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  mediaItems: {},
  addMedia: (item) =>
    set((state) => ({ mediaItems: { ...state.mediaItems, [item.id]: item } })),
  removeMedia: (id) =>
    set((state) => {
      const next = { ...state.mediaItems };
      delete next[id];
      return { mediaItems: next };
    }),
}));
