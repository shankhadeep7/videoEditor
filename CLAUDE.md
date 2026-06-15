# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (TypeScript checked)
npm run lint     # ESLint check
```

## Architecture

**Browser-based video editor** — all media stays client-side as `URL.createObjectURL()` blob URLs. No backend or file upload server.

### Key constraint: All Remotion components must be client-side only
- `app/page.tsx` renders `EditorClient` (a Client Component that uses `next/dynamic` with `ssr: false`)
- Never use Remotion imports in Server Components

### State: 3 Zustand stores
- `store/useProjectStore.ts` — fps (30), resolution (1920×1080)
- `store/useMediaStore.ts` — uploaded media registry (id → MediaItem with blobUrl)
- `store/useTimelineStore.ts` — tracks[], clips{}, playheadFrame, zoomLevel, undo/redo history

### Data flow
```
User uploads file → useMediaUpload hook → useMediaStore (blob URL)
User drags to timeline → useTimelineStore (Clip added to track)
Zustand state → remotion/Composition.tsx → <Player> renders preview
```

### Remotion composition mapping
- `remotion/Composition.tsx` — reads tracks/clips from inputProps, renders layers
- `remotion/TrackLayer.tsx` — each track is an `<AbsoluteFill>` with `<Sequence>` per clip
- `remotion/VideoClip.tsx` — `<Video>` with startFrom trimming, playbackRate, crop, padding
- `remotion/ImageClip.tsx` — `<Img>` with `interpolate()` keyframe animations
- `remotion/AudioClip.tsx` — `<Audio>` with trim and volume

**Stacking/layering**: JSX render order (not z-index — Remotion does not support it). Track at index 0 is bottom layer.

### Operations implementation
| Feature | Where |
|---------|-------|
| Image zoom/pan | `remotion/effects/KeyframeEngine.ts` — `interpolate()` → CSS `scale/translate` |
| Crop | `remotion/effects/CropContainer.tsx` — `overflow:hidden` + offset |
| Padding | `remotion/effects/PaddingContainer.tsx` — `<AbsoluteFill>` with backgroundColor |
| Trim | `<Video startFrom={trimStartFrame} endAt={trimEndFrame}>` |
| Speed | `<Video playbackRate={rate}>`, clip duration = sourceDuration / rate |
| Reverse | `lib/ffmpegWorker.ts` — lazy-loads `@ffmpeg/ffmpeg`, produces new blob URL |
| Overlay/stack | Multiple tracks rendered as `<AbsoluteFill>` layers |
| Stitching | Sequential `<Sequence from={startFrame}>` on same track |

### COOP/COEP headers required
Set in `next.config.ts` and `vercel.json` for FFmpeg.wasm's SharedArrayBuffer requirement.

### Timeline UI
- `components/timeline/Timeline.tsx` — container with ruler + track rows + playhead
- `components/timeline/TimelineTrack.tsx` — drop target for media bin drag; renders clips
- `components/timeline/TimelineClip.tsx` — draggable/resizable clip block (drag edges to trim, drag body to move)
- Playhead syncs bidirectionally with Remotion Player via `playerRef.current.seekTo()` and `timeupdate` events

### Clip type discriminator
`clip.type === 'video' | 'image' | 'audio'` — always narrow with this before accessing type-specific props like `trimStartFrame`, `keyframes`, `volume`.
