import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { Track, Clip } from '@/lib/types';
import { ClipRenderer } from './ClipRenderer';

interface Props {
  track: Track;
  clips: Clip[];
  blobUrls: Record<string, string>;
  width: number;
  height: number;
}

export const TrackLayer: React.FC<Props> = ({ track, clips, blobUrls, width, height }) => {
  if (track.muted) return null;

  return (
    <AbsoluteFill>
      {clips.map((clip) => (
        <Sequence
          key={clip.id}
          from={clip.startFrame}
          durationInFrames={Math.max(1, clip.durationInFrames)}
        >
          <ClipRenderer clip={clip} blobUrls={blobUrls} width={width} height={height} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
