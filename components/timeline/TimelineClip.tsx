'use client';
import React, { useCallback, useRef } from 'react';
import { Clip } from '@/lib/types';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useMediaStore } from '@/store/useMediaStore';
import { CLIP_HEIGHT } from '@/lib/constants';

interface Props {
  clip: Clip;
  zoomLevel: number;
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  video: { bg: '#1d4ed8', border: '#3b82f6', text: '#dbeafe' },
  image: { bg: '#7c3aed', border: '#a855f7', text: '#ede9fe' },
  audio: { bg: '#15803d', border: '#22c55e', text: '#dcfce7' },
};

export const TimelineClip: React.FC<Props> = ({ clip, zoomLevel }) => {
  const { selectedClipId, selectClip, moveClip, updateClip, removeClip } = useTimelineStore();
  const mediaItems = useMediaStore((s) => s.mediaItems);
  const media = mediaItems[clip.mediaId];
  const isSelected = selectedClipId === clip.id;

  const dragRef = useRef<{ mouseX: number; startFrame: number } | null>(null);
  const resizeRef = useRef<{
    mouseX: number;
    side: 'left' | 'right';
    startFrame: number;
    startDuration: number;
  } | null>(null);

  const left = clip.startFrame * zoomLevel;
  const width = Math.max(8, clip.durationInFrames * zoomLevel);
  const colors = TYPE_COLORS[clip.type] || TYPE_COLORS.video;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).dataset.resize) return;
      e.stopPropagation();
      selectClip(clip.id);
      dragRef.current = { mouseX: e.clientX, startFrame: clip.startFrame };

      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - dragRef.current.mouseX;
        const frameDelta = Math.round(dx / zoomLevel);
        const newStart = Math.max(0, dragRef.current.startFrame + frameDelta);
        moveClip(clip.id, clip.trackId, newStart);
      };
      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [clip.id, clip.trackId, clip.startFrame, selectClip, moveClip, zoomLevel]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, side: 'left' | 'right') => {
      e.stopPropagation();
      resizeRef.current = {
        mouseX: e.clientX,
        side,
        startFrame: clip.startFrame,
        startDuration: clip.durationInFrames,
      };

      const onMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        const dx = ev.clientX - resizeRef.current.mouseX;
        const frameDelta = Math.round(dx / zoomLevel);
        if (resizeRef.current.side === 'right') {
          const newDuration = Math.max(1, resizeRef.current.startDuration + frameDelta);
          updateClip(clip.id, { durationInFrames: newDuration });
        } else {
          const newStart = Math.max(0, resizeRef.current.startFrame + frameDelta);
          const deltaFrames = newStart - resizeRef.current.startFrame;
          const newDuration = Math.max(1, resizeRef.current.startDuration - deltaFrames);
          updateClip(clip.id, { startFrame: newStart, durationInFrames: newDuration });
        }
      };
      const onUp = () => {
        resizeRef.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [clip.id, clip.startFrame, clip.durationInFrames, updateClip, zoomLevel]
  );

  return (
    <div
      style={{
        position: 'absolute',
        left,
        width,
        height: CLIP_HEIGHT,
        top: 4,
        userSelect: 'none',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 4,
        outline: isSelected ? '2px solid rgba(255,255,255,0.5)' : 'none',
        outlineOffset: 1,
        cursor: 'grab',
        overflow: 'hidden',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => removeClip(clip.id)}
    >
      {/* Left resize handle */}
      <div
        data-resize="left"
        onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 8,
          height: '100%',
          cursor: 'ew-resize',
          zIndex: 10,
        }}
      />
      {/* Right resize handle */}
      <div
        data-resize="right"
        onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 8,
          height: '100%',
          cursor: 'ew-resize',
          zIndex: 10,
        }}
      />

      {/* Content */}
      <div style={{ padding: '4px 10px', pointerEvents: 'none' }}>
        <p style={{ fontSize: 11, color: colors.text, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {media?.name || clip.type}
        </p>
        {clip.type === 'video' && clip.playbackRate !== 1 && (
          <p style={{ fontSize: 10, color: '#fde047' }}>{clip.playbackRate}x</p>
        )}
        {clip.type === 'video' && clip.isReversed && (
          <p style={{ fontSize: 10, color: '#fb923c' }}>↩ reversed</p>
        )}
      </div>
    </div>
  );
};
