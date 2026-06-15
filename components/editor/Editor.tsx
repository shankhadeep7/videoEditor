'use client';
import React, { useEffect } from 'react';
import { MediaBin } from '@/components/media/MediaBin';
import { Timeline } from '@/components/timeline/Timeline';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { PropertyPanel } from '@/components/editor/PropertyPanel';
import { Toolbar } from '@/components/editor/Toolbar';
import { usePlayerSync } from '@/hooks/usePlayerSync';
import { useTimelineStore } from '@/store/useTimelineStore';

export const Editor: React.FC = () => {
  const { playerRef, onTimelineSeek, onPlayerFrameUpdate } = usePlayerSync();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === ' ') {
        e.preventDefault();
        // Remotion Player doesn't expose toggle — use play/pause refs
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedClipId, removeClip } = useTimelineStore.getState();
        if (selectedClipId) {
          e.preventDefault();
          removeClip(selectedClipId);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useTimelineStore.getState().undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.shiftKey && e.key === 'z'))
      ) {
        e.preventDefault();
        useTimelineStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white overflow-hidden">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left: Media Bin */}
        <div className="w-48 flex-shrink-0 overflow-hidden">
          <MediaBin />
        </div>

        {/* Center: Preview + Timeline */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Preview takes 60% of center */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <PreviewPanel playerRef={playerRef} onFrameUpdate={onPlayerFrameUpdate} />
          </div>
          {/* Timeline takes remaining 40% */}
          <div style={{ height: 240, flexShrink: 0 }}>
            <Timeline onSeek={onTimelineSeek} />
          </div>
        </div>

        {/* Right: Properties */}
        <div className="w-52 flex-shrink-0 overflow-hidden">
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
};
