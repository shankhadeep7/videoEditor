import React from 'react';
import { CropSettings } from '@/lib/types';

interface Props {
  crop: CropSettings;
  width: number;
  height: number;
  children: React.ReactNode;
}

export const CropContainer: React.FC<Props> = ({ crop, width, height, children }) => {
  if (!crop.enabled) return <>{children}</>;

  const visibleW = width * (1 - (crop.left + crop.right) / 100);
  const visibleH = height * (1 - (crop.top + crop.bottom) / 100);
  const offsetX = -(width * crop.left) / 100;
  const offsetY = -(height * crop.top) / 100;

  return (
    <div
      style={{
        width: visibleW,
        height: visibleH,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: offsetX,
          top: offsetY,
          width,
          height,
        }}
      >
        {children}
      </div>
    </div>
  );
};
