import { interpolate } from 'remotion';
import { ImageKeyframe } from '@/lib/types';
import { CSSProperties } from 'react';

export function applyKeyframes(frame: number, keyframes: ImageKeyframe[]): CSSProperties {
  if (keyframes.length === 0) return {};

  if (keyframes.length === 1) {
    const kf = keyframes[0];
    return {
      transform: `scale(${kf.scale}) translate(${kf.translateX}%, ${kf.translateY}%)`,
    };
  }

  const frames = keyframes.map((k) => k.frame);
  const options = {
    extrapolateLeft: 'clamp' as const,
    extrapolateRight: 'clamp' as const,
  };

  const scale = interpolate(frame, frames, keyframes.map((k) => k.scale), options);
  const translateX = interpolate(frame, frames, keyframes.map((k) => k.translateX), options);
  const translateY = interpolate(frame, frames, keyframes.map((k) => k.translateY), options);

  return {
    transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
  };
}
