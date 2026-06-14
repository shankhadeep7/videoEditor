'use client';
import React, { useCallback, useRef } from 'react';
import { useMediaUpload } from '@/hooks/useMediaUpload';

export const UploadDropzone: React.FC = () => {
  const { uploadFiles } = useMediaUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      uploadFiles(files);
      // reset so same file can be re-uploaded
      if (inputRef.current) inputRef.current.value = '';
    },
    [uploadFiles]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-zinc-600 rounded-lg p-3 text-center cursor-pointer hover:border-zinc-400 transition-colors select-none"
    >
      <p className="text-zinc-400 text-xs">Drop files or click to upload</p>
      <p className="text-zinc-600 text-[10px] mt-0.5">Video · Audio · Image</p>
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*,image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};
