import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Track, Clip } from '@/lib/types';
import { TrackLayer } from './TrackLayer';

export interface CompositionProps {
  tracks: Track[];
  clips: Record<string, Clip>;
  blobUrls: Record<string, string>;
  width: number;
  height: number;
}

export const MainComposition: React.FC<CompositionProps> = ({
  tracks,
  clips,
  blobUrls,
  width,
  height,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {tracks.map((track) => {
        const trackClips = Object.values(clips).filter((c) => c.trackId === track.id);
        return (
          <TrackLayer
            key={track.id}
            track={track}
            clips={trackClips}
            blobUrls={blobUrls}
            width={width}
            height={height}
          />
        );
      })}
    </AbsoluteFill>
  );
};
