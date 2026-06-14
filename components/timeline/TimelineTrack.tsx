'use client';
import React, { useCallback } from 'react';
import { Track, Clip, VideoClip, ImageClip, AudioClip } from '@/lib/types';
import { TimelineClip } from './TimelineClip';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useMediaStore } from '@/store/useMediaStore';
import { CLIP_HEIGHT, TRACK_HEADER_WIDTH, DEFAULT_FPS } from '@/lib/constants';
import { nanoid } from 'nanoid';

const defaultCrop = { enabled: false, top: 0, right: 0, bottom: 0, left: 0 };
const defaultPadding = { enabled: false, top: 0, right: 0, bottom: 0, left: 0, color: '#000000' };

interface Props {
  track: Track;
  clips: Clip[];
  zoomLevel: number;
  totalFrames: number;
}

export const TimelineTrack: React.FC<Props> = ({ track, clips, zoomLevel, totalFrames }) => {
  const { removeTrack, addClip } = useTimelineStore();
  const mediaItems = useMediaStore((s) => s.mediaItems);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const mediaId = e.dataTransfer.getData('mediaId');
      if (!mediaId) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const startFrame = Math.max(0, Math.round(x / zoomLevel));
      const media = mediaItems[mediaId];
      if (!media) return;

      const duration = media.durationInFrames || DEFAULT_FPS * 5;

      if (media.type === 'video' && track.type === 'video') {
        const clip: VideoClip = {
          id: nanoid(),
          trackId: track.id,
          mediaId,
          startFrame,
          durationInFrames: duration,
          type: 'video',
          trimStartFrame: 0,
          trimEndFrame: duration,
          playbackRate: 1,
          isReversed: false,
          crop: defaultCrop,
          padding: defaultPadding,
        };
        addClip(clip);
      } else if (media.type === 'image' && track.type === 'video') {
        const dur = DEFAULT_FPS * 5;
        const clip: ImageClip = {
          id: nanoid(),
          trackId: track.id,
          mediaId,
          startFrame,
          durationInFrames: dur,
          type: 'image',
          keyframes: [
            { frame: 0, scale: 1, translateX: 0, translateY: 0 },
            { frame: dur - 1, scale: 1.1, translateX: 2, translateY: 1 },
          ],
          crop: defaultCrop,
          padding: defaultPadding,
        };
        addClip(clip);
      } else if (media.type === 'audio' && track.type === 'audio') {
        const clip: AudioClip = {
          id: nanoid(),
          trackId: track.id,
          mediaId,
          startFrame,
          durationInFrames: duration,
          type: 'audio',
          trimStartFrame: 0,
          trimEndFrame: duration,
          volume: 1,
        };
        addClip(clip);
      }
    },
    [track, zoomLevel, mediaItems, addClip]
  );

  const trackWidth = totalFrames * zoomLevel;
  const rowHeight = CLIP_HEIGHT + 8;

  return (
    <div
      className="flex border-b border-zinc-800 flex-shrink-0"
      style={{ height: rowHeight }}
    >
      {/* Track header */}
      <div
        style={{ width: TRACK_HEADER_WIDTH, flexShrink: 0 }}
        className="flex items-center justify-between px-2 bg-zinc-900 border-r border-zinc-700"
      >
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-300 truncate">{track.name}</p>
          <p className="text-[10px] text-zinc-600 capitalize">{track.type}</p>
        </div>
        <button
          onClick={() => removeTrack(track.id)}
          className="text-zinc-600 hover:text-red-400 text-xs ml-1 flex-shrink-0 transition-colors"
          title="Remove track"
        >
          ✕
        </button>
      </div>

      {/* Clip drop area */}
      <div
        className="relative bg-zinc-950 hover:bg-zinc-900 transition-colors"
        style={{ width: trackWidth, flexShrink: 0 }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Grid lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(63,63,70,0.3) 60px)',
          }}
        />
        {clips.map((clip) => (
          <TimelineClip key={clip.id} clip={clip} zoomLevel={zoomLevel} />
        ))}
      </div>
    </div>
  );
};
