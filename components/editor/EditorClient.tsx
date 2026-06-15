'use client';
import dynamic from 'next/dynamic';

const Editor = dynamic(
  () => import('./Editor').then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
        Loading editor…
      </div>
    ),
  }
);

export default function EditorClient() {
  return <Editor />;
}
