import { DEFAULT_FPS } from './constants';

export async function probeVideo(
  blobUrl: string,
  fps = DEFAULT_FPS
): Promise<{ durationInFrames: number; width: number; height: number; thumbnailUrl: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = blobUrl;
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      video.currentTime = 0.5;
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth || 320, 320);
      canvas.height = Math.min(video.videoHeight || 180, 180);
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve({
        durationInFrames: Math.floor(video.duration * fps),
        width: video.videoWidth || 1920,
        height: video.videoHeight || 1080,
        thumbnailUrl,
      });
      video.remove();
    };

    video.onerror = reject;
  });
}

export async function probeAudio(
  blobUrl: string,
  fps = DEFAULT_FPS
): Promise<{ durationInFrames: number }> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    audio.src = blobUrl;
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      resolve({ durationInFrames: Math.floor(audio.duration * fps) });
      audio.remove();
    };
    audio.onerror = reject;
  });
}

export async function probeImage(blobUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = blobUrl;
  });
}

export function getMediaType(file: File): 'video' | 'audio' | 'image' | null {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('image/')) return 'image';
  return null;
}
