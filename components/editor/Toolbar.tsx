'use client';
import React from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';

export const Toolbar: React.FC = () => {
  const { undo, redo, historyIndex, history } = useTimelineStore();

  return (
    <div className="h-11 flex items-center px-4 bg-zinc-950 border-b border-zinc-800 gap-3 flex-shrink-0">
      <span className="text-sm font-bold text-white tracking-tight">VideoEditor</span>
      <div className="h-4 w-px bg-zinc-700 mx-1" />
      <button
        onClick={undo}
        disabled={historyIndex <= 0}
        className="text-xs text-zinc-400 hover:text-white disabled:opacity-30 px-2 py-1 rounded hover:bg-zinc-800 transition-colors disabled:cursor-not-allowed"
        title="Undo (Ctrl+Z)"
      >
        ↩ Undo
      </button>
      <button
        onClick={redo}
        disabled={historyIndex >= history.length - 1}
        className="text-xs text-zinc-400 hover:text-white disabled:opacity-30 px-2 py-1 rounded hover:bg-zinc-800 transition-colors disabled:cursor-not-allowed"
        title="Redo (Ctrl+Y)"
      >
        Redo ↪
      </button>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-zinc-600">Double-click a clip to delete it</span>
      </div>
    </div>
  );
};
