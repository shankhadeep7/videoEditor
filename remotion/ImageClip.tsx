import React from 'react';
import { useCurrentFrame, Img } from 'remotion';
import { ImageClip as ImageClipType } from '@/lib/types';
import { CropContainer } from './effects/CropContainer';
import { PaddingContainer } from './effects/PaddingContainer';
import { applyKeyframes } from './effects/KeyframeEngine';

interface Props {
  clip: ImageClipType;
  blobUrl: string;
  width: number;
  height: number;
}

export const ImageClipComponent: React.FC<Props> = ({ clip, blobUrl, width, height }) => {
  const frame = useCurrentFrame();
  const transformStyle = applyKeyframes(frame, clip.keyframes);

  const inner = (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Img
        src={blobUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transformOrigin: 'center center',
          ...transformStyle,
        }}
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
