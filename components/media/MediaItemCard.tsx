'use client';
import React from 'react';
import { MediaItem } from '@/lib/types';
import { useTimelineStore } from '@/store/useTimelineStore';
import { nanoid } from 'nanoid';
import { DEFAULT_FPS } from '@/lib/constants';
import type { VideoClip, ImageClip, AudioClip } from '@/lib/types';

interface Props {
  item: MediaItem;
}

const defaultCrop = { enabled: false, top: 0, right: 0, bottom: 0, left: 0 };
const defaultPadding = { enabled: false, top: 0, right: 0, bottom: 0, left: 0, color: '#000000' };

export const MediaItemCard: React.FC<Props> = ({ item }) => {
  const { tracks, addClip, totalDurationInFrames } = useTimelineStore();

  const handleClick = () => {
    const targetTrack = tracks.find((t) =>
      t.type === (item.type === 'audio' ? 'audio' : 'video')
    );
    if (!targetTrack) return;

    const startFrame = totalDurationInFrames();
    const duration = item.durationInFrames || DEFAULT_FPS * 5;

    if (item.type === 'video') {
      const clip: VideoClip = {
        id: nanoid(),
        trackId: targetTrack.id,
        mediaId: item.id,
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
    } else if (item.type === 'image') {
      const dur = DEFAULT_FPS * 5;
      const clip: ImageClip = {
        id: nanoid(),
        trackId: targetTrack.id,
        mediaId: item.id,
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
    } else if (item.type === 'audio') {
      const clip: AudioClip = {
        id: nanoid(),
        trackId: targetTrack.id,
        mediaId: item.id,
        startFrame,
        durationInFrames: duration,
        type: 'audio',
        trimStartFrame: 0,
        trimEndFrame: duration,
        volume: 1,
      };
      addClip(clip);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('mediaId', item.id);
  };

  const typeIcon = item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : '🖼️';

  return (
    <div
      className="bg-zinc-800 rounded border border-zinc-700 p-1.5 cursor-pointer hover:border-zinc-500 transition-colors"
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
      title={`${item.name} — click or drag to timeline`}
    >
      <div className="aspect-video bg-zinc-900 rounded mb-1 overflow-hidden flex items-center justify-center">
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : item.type === 'image' ? (
          <img src={item.blobUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">{typeIcon}</span>
        )}
      </div>
      <p className="text-[10px] text-zinc-300 truncate leading-tight">{item.name}</p>
      {item.durationInFrames != null && (
        <p className="text-[10px] text-zinc-600 leading-tight">
          {(item.durationInFrames / DEFAULT_FPS).toFixed(1)}s
        </p>
      )}
    </div>
  );
};
