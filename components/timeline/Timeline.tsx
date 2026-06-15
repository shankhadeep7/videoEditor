'use client';
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useProjectStore } from '@/store/useProjectStore';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTrack } from './TimelineTrack';
import { Playhead } from './Playhead';
import { TRACK_HEADER_WIDTH, CLIP_HEIGHT } from '@/lib/constants';

interface Props {
  onSeek: (frame: number) => void;
}

export const Timeline: React.FC<Props> = ({ onSeek }) => {
  const {
    tracks,
    playheadFrame,
    zoomLevel,
    setZoomLevel,
    totalDurationInFrames,
    addTrack,
    getClipsForTrack,
  } = useTimelineStore();
  const { fps } = useProjectStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);

  const totalFrames = totalDurationInFrames() + fps * 5;
  const trackAreaHeight = tracks.length * (CLIP_HEIGHT + 8);

  // Sync scroll for ruler
  const handleScroll = useCallback(() => {
    forceUpdate((n) => n + 1);
  }, []);

  // Auto-scroll playhead into view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const playheadPx = TRACK_HEADER_WIDTH + playheadFrame * zoomLevel;
    const { scrollLeft, clientWidth } = el;
    if (playheadPx < scrollLeft + TRACK_HEADER_WIDTH + 20) return;
    if (playheadPx > scrollLeft + clientWidth - 20) {
      el.scrollLeft = playheadPx - clientWidth / 2;
    }
  }, [playheadFrame, zoomLevel]);

  const scrollLeft = scrollRef.current?.scrollLeft || 0;
  const playheadInTrackArea = playheadFrame * zoomLevel - scrollLeft;

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-t border-zinc-800 select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-800 flex-shrink-0 bg-zinc-900">
        <button
          onClick={() => addTrack('video')}
          className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-zinc-300 transition-colors"
        >
          + Video Track
        </button>
        <button
          onClick={() => addTrack('audio')}
          className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-zinc-300 transition-colors"
        >
          + Audio Track
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-500">Zoom</span>
          <input
            type="range"
            min="0.5"
            max="8"
            step="0.25"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-24 accent-blue-500"
          />
          <span className="text-xs text-zinc-500 w-6">{zoomLevel}x</span>
        </div>
      </div>

      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
      >
        <div style={{ minWidth: TRACK_HEADER_WIDTH + totalFrames * zoomLevel }}>
          {/* Ruler row */}
          <div className="flex sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800">
            <div style={{ width: TRACK_HEADER_WIDTH, flexShrink: 0 }} className="border-r border-zinc-700" />
            <div className="flex-1 overflow-hidden relative">
              <TimelineRuler
                totalFrames={totalFrames}
                fps={fps}
                zoomLevel={zoomLevel}
                onSeek={onSeek}
              />
            </div>
          </div>

          {/* Tracks + playhead overlay */}
          <div className="relative">
            {/* Playhead line over all tracks */}
            <div
              style={{
                position: 'absolute',
                left: TRACK_HEADER_WIDTH - scrollLeft,
                top: 0,
                width: totalFrames * zoomLevel,
                height: trackAreaHeight,
                pointerEvents: 'none',
                zIndex: 40,
                overflow: 'hidden',
              }}
            >
              <Playhead
                frame={playheadFrame}
                zoomLevel={zoomLevel}
                height={trackAreaHeight}
              />
            </div>

            {tracks.map((track) => (
              <TimelineTrack
                key={track.id}
                track={track}
                clips={getClipsForTrack(track.id)}
                zoomLevel={zoomLevel}
                totalFrames={totalFrames}
              />
            ))}

            {tracks.length === 0 && (
              <div className="flex items-center justify-center h-16 text-zinc-600 text-xs">
                Add a track to get started
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
