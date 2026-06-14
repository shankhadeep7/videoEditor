import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PaddingSettings } from '@/lib/types';

interface Props {
  padding: PaddingSettings;
  children: React.ReactNode;
}

export const PaddingContainer: React.FC<Props> = ({ padding, children }) => {
  if (!padding.enabled) return <>{children}</>;

  return (
    <AbsoluteFill style={{ backgroundColor: padding.color }}>
      <div
        style={{
          position: 'absolute',
          top: padding.top,
          right: padding.right,
          bottom: padding.bottom,
          left: padding.left,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
