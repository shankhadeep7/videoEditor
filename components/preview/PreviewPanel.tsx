'use client';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { PlayerRef } from '@remotion/player';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useMediaStore } from '@/store/useMediaStore';
import { PlayerControls } from './PlayerControls';
import { MainComposition, type CompositionProps } from '@/remotion/Composition';

const Player = dynamic(
  () => import('@remotion/player').then((m) => m.Player),
  { ssr: false }
);

interface Props {
  playerRef: React.RefObject<PlayerRef | null>;
  onFrameUpdate: (frame: number) => void;
}

export const PreviewPanel: React.FC<Props> = ({ playerRef, onFrameUpdate }) => {
  const tracks = useTimelineStore((s) => s.tracks);
  const clips = useTimelineStore((s) => s.clips);
  const totalDurationInFrames = useTimelineStore((s) => s.totalDurationInFrames);
  const { fps, width, height } = useProjectStore();
  const mediaItems = useMediaStore((s) => s.mediaItems);

  const blobUrls: Record<string, string> = {};
  Object.values(mediaItems).forEach((item) => {
    blobUrls[item.id] = item.blobUrl;
  });

  const totalFrames = Math.max(1, totalDurationInFrames());

  // Sync playhead from Player to timeline store
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleTimeUpdate = () => {
      const frame = player.getCurrentFrame();
      onFrameUpdate(frame);
    };

    player.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      player.removeEventListener('timeupdate', handleTimeUpdate);
    };
  });

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden min-h-0">
        <Player
          ref={playerRef}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          component={MainComposition as React.FC<any>}
          inputProps={{ tracks, clips, blobUrls, width, height } as CompositionProps}
          durationInFrames={totalFrames}
          fps={fps}
          compositionWidth={width}
          compositionHeight={height}
          style={{ width: '100%', maxWidth: '100%', maxHeight: '100%' }}
          acknowledgeRemotionLicense
        />
      </div>
      <PlayerControls playerRef={playerRef} />
    </div>
  );
};
