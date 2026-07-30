import { loadFileToImage } from './image/decode';
import { processImage } from './image/pipeline';
import type { RegionSet } from './types';

export async function processImageToRegions(
  file: File,
  colorCount: number,
  removeBg: boolean = true
): Promise<RegionSet> {
  const img = await loadFileToImage(file);
  return processImage(img, colorCount, {
    removeBg,
    smoothing: 0.5,
    preserveDetail: true
  });
}
