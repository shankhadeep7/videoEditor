'use client';
import { useRef, useCallback } from 'react';
import type { PlayerRef } from '@remotion/player';
import { useTimelineStore } from '@/store/useTimelineStore';

export function usePlayerSync() {
  const playerRef = useRef<PlayerRef>(null);
  const setPlayheadFrame = useTimelineStore((s) => s.setPlayheadFrame);

  const onTimelineSeek = useCallback(
    (frame: number) => {
      playerRef.current?.seekTo(frame);
      setPlayheadFrame(frame);
    },
    [setPlayheadFrame]
  );

  const onPlayerFrameUpdate = useCallback(
    (frame: number) => {
      setPlayheadFrame(frame);
    },
    [setPlayheadFrame]
  );

  return { playerRef, onTimelineSeek, onPlayerFrameUpdate };
}
