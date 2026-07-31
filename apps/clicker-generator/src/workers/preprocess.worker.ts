import { processImage } from '../image/pipeline';
import type { RegionSet } from '../types';

self.onmessage = (e: MessageEvent) => {
  const msg = e.data;
  if (msg.type === 'processImage') {
    try {
      const regionSet = processImage(msg.img, msg.colorCount, msg.opts);
      
      // Regions contain arrays of points which can be large, but structured cloning is usually fast enough for them.
      self.postMessage({ type: 'processImageDone', regionSet });
    } catch (err: any) {
      self.postMessage({ type: 'error', error: err.message || String(err) });
    }
  }
};
