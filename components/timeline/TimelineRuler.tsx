'use client';
import React, { useCallback } from 'react';
import { framesToTime } from '@/lib/timelineUtils';
import { TRACK_HEADER_WIDTH } from '@/lib/constants';

interface Props {
  totalFrames: number;
  fps: number;
  zoomLevel: number;
  onSeek: (frame: number) => void;
}

export const TimelineRuler: React.FC<Props> = ({ totalFrames, fps, zoomLevel, onSeek }) => {
  const width = totalFrames * zoomLevel;

  // How many frames between visible labels depends on zoom
  const minPxBetweenLabels = 60;
  const framesPerLabel = Math.max(1, Math.ceil(minPxBetweenLabels / zoomLevel / fps) * fps);

  const markers: number[] = [];
  for (let f = 0; f <= totalFrames; f += framesPerLabel) {
    markers.push(f);
  }

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const frame = Math.round(x / zoomLevel);
      onSeek(Math.max(0, Math.min(frame, totalFrames)));
    },
    [zoomLevel, totalFrames, onSeek]
  );

  return (
    <div
      style={{ position: 'relative', width, height: 28, cursor: 'pointer', flexShrink: 0 }}
      onClick={handleClick}
    >
      {markers.map((frame) => (
        <div
          key={frame}
          style={{
            position: 'absolute',
            left: frame * zoomLevel,
            top: 0,
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            paddingBottom: 2,
          }}
        >
          <div
            style={{ width: 1, height: 8, backgroundColor: '#52525b', flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 9,
              color: '#71717a',
              marginLeft: 2,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {framesToTime(frame, fps)}
          </span>
        </div>
      ))}
    </div>
  );
};
