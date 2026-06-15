'use client';
import React from 'react';
import type { PlayerRef } from '@remotion/player';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useProjectStore } from '@/store/useProjectStore';
import { framesToTime } from '@/lib/timelineUtils';

interface Props {
  playerRef: React.RefObject<PlayerRef | null>;
}

export const PlayerControls: React.FC<Props> = ({ playerRef }) => {
  const playheadFrame = useTimelineStore((s) => s.playheadFrame);
  const totalDurationInFrames = useTimelineStore((s) => s.totalDurationInFrames);
  const fps = useProjectStore((s) => s.fps);
  const total = totalDurationInFrames();

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex-shrink-0">
      <button
        onClick={() => playerRef.current?.seekTo(0)}
        className="text-zinc-400 hover:text-white text-sm transition-colors"
        title="Go to start"
      >
        ⏮
      </button>
      <button
        onClick={() => playerRef.current?.pause()}
        className="text-zinc-400 hover:text-white transition-colors"
        title="Pause"
      >
        ⏸
      </button>
      <button
        onClick={() => playerRef.current?.play()}
        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors"
        title="Play"
      >
        ▶
      </button>
      <button
        onClick={() => playerRef.current?.seekTo(total - 1)}
        className="text-zinc-400 hover:text-white text-sm transition-colors"
        title="Go to end"
      >
        ⏭
      </button>
      <span className="text-xs text-zinc-400 ml-2 font-mono tabular-nums">
        {framesToTime(playheadFrame, fps)} / {framesToTime(total, fps)}
      </span>
    </div>
  );
};
