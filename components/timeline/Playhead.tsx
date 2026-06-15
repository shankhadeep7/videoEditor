'use client';
import React from 'react';

interface Props {
  frame: number;
  zoomLevel: number;
  height: number;
}

export const Playhead: React.FC<Props> = ({ frame, zoomLevel, height }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: frame * zoomLevel,
        top: 0,
        height,
        width: 1,
        backgroundColor: '#ef4444',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: -4,
          width: 9,
          height: 12,
          backgroundColor: '#ef4444',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        }}
      />
    </div>
  );
};
