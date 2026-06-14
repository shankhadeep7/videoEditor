import React from 'react';
import { Clip } from '@/lib/types';
import { VideoClipComponent } from './VideoClip';
import { ImageClipComponent } from './ImageClip';
import { AudioClipComponent } from './AudioClip';

interface Props {
  clip: Clip;
  blobUrls: Record<string, string>;
  width: number;
  height: number;
}

export const ClipRenderer: React.FC<Props> = ({ clip, blobUrls, width, height }) => {
  const blobUrl = blobUrls[clip.mediaId] || '';

  if (clip.type === 'video') {
    return <VideoClipComponent clip={clip} blobUrl={blobUrl} width={width} height={height} />;
  }
  if (clip.type === 'image') {
    return <ImageClipComponent clip={clip} blobUrl={blobUrl} width={width} height={height} />;
  }
  if (clip.type === 'audio') {
    return <AudioClipComponent clip={clip} blobUrl={blobUrl} />;
  }
  return null;
};
