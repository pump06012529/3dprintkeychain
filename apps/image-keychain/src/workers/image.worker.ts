// image.worker.ts — runs processImage() (quantize + traceRegions) off the main thread
// so the browser UI is never blocked while processing PNG/SVG images.
// The main thread handles decode (Canvas API required) then sends raw RGBA pixels here.

import { processImage } from '../image/pipeline';
import type { RegionSet, RGB } from '../types';

export type ImageRequest =
  | {
      type: 'process';
      data: Uint8ClampedArray;
      width: number;
      height: number;
      colorCount: number;
      removeBg: boolean;
      smoothing: number;
    };

export type ImageResponse =
  | { type: 'done'; regionSet: RegionSet }
  | { type: 'error'; message: string };

self.onmessage = (e: MessageEvent<ImageRequest>) => {
  const msg = e.data;
  if (msg.type === 'process') {
    try {
      const img = { data: msg.data, width: msg.width, height: msg.height };
      const regionSet = processImage(img, msg.colorCount, {
        removeBg: msg.removeBg,
        smoothing: msg.smoothing,
        preserveDetail: true,
      });
      (self as unknown as Worker).postMessage({ type: 'done', regionSet } as ImageResponse);
    } catch (err: any) {
      (self as unknown as Worker).postMessage({
        type: 'error',
        message: err?.message ?? String(err),
      } as ImageResponse);
    }
  }
};
