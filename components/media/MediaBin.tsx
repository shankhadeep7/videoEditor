'use client';
import React from 'react';
import { useMediaStore } from '@/store/useMediaStore';
import { UploadDropzone } from './UploadDropzone';
import { MediaItemCard } from './MediaItemCard';

export const MediaBin: React.FC = () => {
  const mediaItems = useMediaStore((s) => s.mediaItems);
  const items = Object.values(mediaItems);

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      <div className="p-3 border-b border-zinc-800 flex-shrink-0">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
          Media
        </h2>
        <UploadDropzone />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center mt-6">No media yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <MediaItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
