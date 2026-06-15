import React from 'react';
import { Audio } from 'remotion';
import { AudioClip as AudioClipType } from '@/lib/types';

interface Props {
  clip: AudioClipType;
  blobUrl: string;
}

export const AudioClipComponent: React.FC<Props> = ({ clip, blobUrl }) => {
  return (
    <Audio
      src={blobUrl}
      startFrom={clip.trimStartFrame}
      endAt={clip.trimEndFrame}
      volume={clip.volume}
    />
  );
};
