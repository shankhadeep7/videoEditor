'use client';
import React, { useState } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useMediaStore } from '@/store/useMediaStore';
import { VideoClip, ImageClip, AudioClip, CropSettings, PaddingSettings } from '@/lib/types';
import { reverseVideo } from '@/lib/ffmpegWorker';

export const PropertyPanel: React.FC = () => {
  const { selectedClipId, clips, updateClip, addKeyframe, updateKeyframe, removeKeyframe, removeClip } =
    useTimelineStore();
  const mediaItems = useMediaStore((s) => s.mediaItems);
  const [reversing, setReversing] = useState(false);

  const clip = selectedClipId ? clips[selectedClipId] : null;

  if (!clip) {
    return (
      <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 p-4">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Properties</h2>
        <p className="text-zinc-600 text-xs mt-6 text-center leading-relaxed">
          Select a clip to edit its properties
        </p>
      </div>
    );
  }

  const media = mediaItems[clip.mediaId];

  const CropSection = () => {
    if (clip.type === 'audio') return null;
    const c = (clip as VideoClip | ImageClip).crop;
    const setEnabled = (enabled: boolean) =>
      updateClip(clip.id, { crop: { ...c, enabled } });
    const setVal = (k: keyof CropSettings, v: number) =>
      updateClip(clip.id, { crop: { ...c, [k]: v } });

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Crop</span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={c.enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="accent-blue-500 w-3 h-3"
            />
            <span className="text-[10px] text-zinc-400">Enable</span>
          </label>
        </div>
        {c.enabled && (
          <div className="grid grid-cols-2 gap-1.5">
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <div key={side}>
                <label className="text-[10px] text-zinc-500 capitalize">{side} %</label>
                <input
                  type="number"
                  min={0}
                  max={49}
                  value={c[side]}
                  onChange={(e) => setVal(side, Number(e.target.value))}
                  className="w-full bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-0.5 mt-0.5 border border-zinc-700 focus:border-blue-500 outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const PaddingSection = () => {
    if (clip.type === 'audio') return null;
    const p = (clip as VideoClip | ImageClip).padding;
    const setEnabled = (enabled: boolean) =>
      updateClip(clip.id, { padding: { ...p, enabled } });
    const setVal = (k: keyof PaddingSettings, v: number | string) =>
      updateClip(clip.id, { padding: { ...p, [k]: v } });

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Padding</span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={p.enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="accent-blue-500 w-3 h-3"
            />
            <span className="text-[10px] text-zinc-400">Enable</span>
          </label>
        </div>
        {p.enabled && (
          <>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <div key={side}>
                  <label className="text-[10px] text-zinc-500 capitalize">{side} px</label>
                  <input
                    type="number"
                    min={0}
                    value={p[side]}
                    onChange={(e) => setVal(side, Number(e.target.value))}
                    className="w-full bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-0.5 mt-0.5 border border-zinc-700 focus:border-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-[10px] text-zinc-500">Fill Color</label>
              <input
                type="color"
                value={p.color}
                onChange={(e) => setVal('color', e.target.value)}
                className="w-full h-7 bg-zinc-800 rounded border border-zinc-700 mt-0.5 cursor-pointer"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-start justify-between flex-shrink-0">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold text-zinc-200">Properties</h2>
          <p className="text-[10px] text-zinc-500 truncate mt-0.5">{media?.name}</p>
          <span className="text-[10px] text-zinc-600 capitalize">{clip.type}</span>
        </div>
        <button
          onClick={() => removeClip(clip.id)}
          className="text-zinc-600 hover:text-red-400 text-xs ml-2 flex-shrink-0 transition-colors"
          title="Delete clip"
        >
          Delete
        </button>
      </div>

      <div className="p-3 space-y-0.5">
        {/* ── VIDEO PROPS ── */}
        {clip.type === 'video' && (
          <div className="mb-4">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Video</span>
            <div className="space-y-2">
              {/* Speed */}
              <div>
                <label className="text-[10px] text-zinc-500">Speed</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="range"
                    min={0.25}
                    max={4}
                    step={0.25}
                    value={(clip as VideoClip).playbackRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value);
                      const vc = clip as VideoClip;
                      const baseDuration = vc.trimEndFrame - vc.trimStartFrame;
                      updateClip(clip.id, {
                        playbackRate: rate,
                        durationInFrames: Math.max(1, Math.round(baseDuration / rate)),
                      });
                    }}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-xs text-zinc-300 w-8 tabular-nums">
                    {(clip as VideoClip).playbackRate}x
                  </span>
                </div>
              </div>

              {/* Trim start */}
              <div>
                <label className="text-[10px] text-zinc-500">Trim Start (frames)</label>
                <input
                  type="number"
                  min={0}
                  value={(clip as VideoClip).trimStartFrame}
                  onChange={(e) => updateClip(clip.id, { trimStartFrame: Number(e.target.value) })}
                  className="w-full bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-0.5 mt-0.5 border border-zinc-700 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Trim end */}
              <div>
                <label className="text-[10px] text-zinc-500">Trim End (frames)</label>
                <input
                  type="number"
                  min={1}
                  value={(clip as VideoClip).trimEndFrame}
                  onChange={(e) => updateClip(clip.id, { trimEndFrame: Number(e.target.value) })}
                  className="w-full bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-0.5 mt-0.5 border border-zinc-700 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Reverse */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <label className="text-[10px] text-zinc-500">Reverse</label>
                  {reversing && (
                    <p className="text-[10px] text-yellow-400 mt-0.5">Processing with FFmpeg…</p>
                  )}
                </div>
                <button
                  onClick={async () => {
                    const vc = clip as VideoClip;
                    if (vc.isReversed) {
                      updateClip(clip.id, { isReversed: false });
                      return;
                    }
                    const mediaItem = mediaItems[clip.mediaId];
                    if (!mediaItem) return;
                    setReversing(true);
                    try {
                      const blob = await fetch(mediaItem.blobUrl).then((r) => r.blob());
                      const file = new File([blob], mediaItem.name, { type: blob.type });
                      const reversedUrl = await reverseVideo(file);
                      updateClip(clip.id, { isReversed: true, reversedBlobUrl: reversedUrl });
                    } catch (err) {
                      console.error('Reverse failed:', err);
                    } finally {
                      setReversing(false);
                    }
                  }}
                  disabled={reversing}
                  className={`text-xs px-3 py-1 rounded transition-colors disabled:opacity-50 ${
                    (clip as VideoClip).isReversed
                      ? 'bg-orange-600 hover:bg-orange-500 text-white'
                      : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                  }`}
                >
                  {(clip as VideoClip).isReversed ? 'Reversed ✓' : 'Reverse'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── AUDIO PROPS ── */}
        {clip.type === 'audio' && (
          <div className="mb-4">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Audio</span>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-zinc-500">Volume</label>
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={(clip as AudioClip).volume}
                    onChange={(e) => updateClip(clip.id, { volume: parseFloat(e.target.value) })}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-xs text-zinc-300 w-10 tabular-nums">
                    {Math.round((clip as AudioClip).volume * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500">Trim Start (frames)</label>
                <input
                  type="number"
                  min={0}
                  value={(clip as AudioClip).trimStartFrame}
                  onChange={(e) => updateClip(clip.id, { trimStartFrame: Number(e.target.value) })}
                  className="w-full bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-0.5 mt-0.5 border border-zinc-700 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500">Trim End (frames)</label>
                <input
                  type="number"
                  min={1}
                  value={(clip as AudioClip).trimEndFrame}
                  onChange={(e) => updateClip(clip.id, { trimEndFrame: Number(e.target.value) })}
                  className="w-full bg-zinc-800 text-zinc-200 text-xs rounded px-2 py-0.5 mt-0.5 border border-zinc-700 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── IMAGE KEYFRAMES ── */}
        {clip.type === 'image' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Keyframes (Zoom/Pan)
              </span>
              <button
                onClick={() =>
                  addKeyframe(clip.id, {
                    frame: Math.round(clip.durationInFrames / 2),
                    scale: 1,
                    translateX: 0,
                    translateY: 0,
                  })
                }
                className="text-[10px] bg-zinc-700 hover:bg-zinc-600 px-2 py-0.5 rounded text-zinc-300 transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {(clip as ImageClip).keyframes.map((kf, i) => (
                <div key={i} className="bg-zinc-800 rounded p-2 border border-zinc-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-zinc-400 font-medium">Keyframe {i + 1}</span>
                    <button
                      onClick={() => removeKeyframe(clip.id, i)}
                      className="text-zinc-600 hover:text-red-400 text-[10px] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Frame', key: 'frame', min: 0, max: clip.durationInFrames - 1, step: 1 },
                      { label: 'Scale', key: 'scale', min: 0.1, max: 5, step: 0.05 },
                      { label: 'Pan X %', key: 'translateX', min: -100, max: 100, step: 1 },
                      { label: 'Pan Y %', key: 'translateY', min: -100, max: 100, step: 1 },
                    ].map(({ label, key, min, max, step }) => (
                      <div key={key}>
                        <label className="text-[10px] text-zinc-500">{label}</label>
                        <input
                          type="number"
                          min={min}
                          max={max}
                          step={step}
                          value={kf[key as keyof typeof kf]}
                          onChange={(e) =>
                            updateKeyframe(clip.id, i, { [key]: Number(e.target.value) })
                          }
                          className="w-full bg-zinc-700 text-zinc-200 text-xs rounded px-1.5 py-0.5 mt-0.5 border border-zinc-600 focus:border-blue-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-800 pt-3">
          <CropSection />
          <PaddingSection />
        </div>
      </div>
    </div>
  );
};
