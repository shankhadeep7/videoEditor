export interface Project {
  fps: number;
  width: number;
  height: number;
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio';
  muted: boolean;
  locked: boolean;
}

export interface CropSettings {
  enabled: boolean;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PaddingSettings {
  enabled: boolean;
  top: number;
  right: number;
  bottom: number;
  left: number;
  color: string;
}

export interface ImageKeyframe {
  frame: number;
  scale: number;
  translateX: number;
  translateY: number;
}

export interface BaseClip {
  id: string;
  trackId: string;
  mediaId: string;
  startFrame: number;
  durationInFrames: number;
}

export interface VideoClip extends BaseClip {
  type: 'video';
  trimStartFrame: number;
  trimEndFrame: number;
  playbackRate: number;
  isReversed: boolean;
  reversedBlobUrl?: string;
  crop: CropSettings;
  padding: PaddingSettings;
}

export interface ImageClip extends BaseClip {
  type: 'image';
  keyframes: ImageKeyframe[];
  crop: CropSettings;
  padding: PaddingSettings;
}

export interface AudioClip extends BaseClip {
  type: 'audio';
  trimStartFrame: number;
  trimEndFrame: number;
  volume: number;
}

export type Clip = VideoClip | ImageClip | AudioClip;

export interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio';
  blobUrl: string;
  durationInFrames?: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}
