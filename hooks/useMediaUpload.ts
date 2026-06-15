'use client';
import { nanoid } from 'nanoid';
import { useMediaStore } from '@/store/useMediaStore';
import { useProjectStore } from '@/store/useProjectStore';
import { getMediaType, probeVideo, probeAudio, probeImage } from '@/lib/mediaUtils';
import { MediaItem } from '@/lib/types';

export function useMediaUpload() {
  const addMedia = useMediaStore((s) => s.addMedia);
  const fps = useProjectStore((s) => s.fps);

  const uploadFiles = async (files: File[]) => {
    for (const file of files) {
      const type = getMediaType(file);
      if (!type) continue;

      const blobUrl = URL.createObjectURL(file);
      const id = nanoid();

      let item: MediaItem = { id, name: file.name, type, blobUrl };

      if (type === 'video') {
        try {
          const meta = await probeVideo(blobUrl, fps);
          item = { ...item, ...meta };
        } catch (e) {
          console.warn('Could not probe video metadata', e);
        }
      } else if (type === 'audio') {
        try {
          const meta = await probeAudio(blobUrl, fps);
          item = { ...item, ...meta };
        } catch (e) {
          console.warn('Could not probe audio metadata', e);
        }
      } else if (type === 'image') {
        try {
          const meta = await probeImage(blobUrl);
          item = { ...item, ...meta };
        } catch (e) {
          console.warn('Could not probe image metadata', e);
        }
      }

      addMedia(item);
    }
  };

  return { uploadFiles };
}
