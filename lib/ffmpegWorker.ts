// Lazy-loaded FFmpeg instance for video reverse operation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ffmpegInstance: any = null;

export async function reverseVideo(file: File): Promise<string> {
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

  if (!ffmpegInstance) {
    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegInstance = ffmpeg;
  }

  const ffmpeg = ffmpegInstance;
  const inputName = 'input.mp4';
  const outputName = 'reversed.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(file));
  await ffmpeg.exec(['-i', inputName, '-vf', 'reverse', '-af', 'areverse', outputName]);
  const data = await ffmpeg.readFile(outputName) as Uint8Array;
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  // Copy into a plain ArrayBuffer to satisfy TypeScript's BlobPart constraint
  const plainBuffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(plainBuffer).set(data);
  const blob = new Blob([plainBuffer], { type: 'video/mp4' });
  return URL.createObjectURL(blob);
}
