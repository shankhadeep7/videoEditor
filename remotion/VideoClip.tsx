import React from 'react';
import { Video } from 'remotion';
import { VideoClip as VideoClipType } from '@/lib/types';
import { CropContainer } from './effects/CropContainer';
import { PaddingContainer } from './effects/PaddingContainer';

interface Props {
  clip: VideoClipType;
  blobUrl: string;
  width: number;
  height: number;
}

export const VideoClipComponent: React.FC<Props> = ({ clip, blobUrl, width, height }) => {
  const src = clip.isReversed && clip.reversedBlobUrl ? clip.reversedBlobUrl : blobUrl;

  const inner = (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Video
        src={src}
        startFrom={clip.trimStartFrame}
        endAt={clip.trimEndFrame}
        playbackRate={clip.playbackRate}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );

  return (
    <PaddingContainer padding={clip.padding}>
      <CropContainer crop={clip.crop} width={width} height={height}>
        {inner}
      </CropContainer>
    </PaddingContainer>
  );
};
