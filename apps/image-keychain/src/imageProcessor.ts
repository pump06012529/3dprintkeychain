import { loadFileToImage } from './image/decode';
import { processImage } from './image/pipeline';
import type { RegionSet } from './types';

export async function processImageToRegions(
  file: File,
  colorCount: number,
  removeBg: boolean = true,
  smoothing: number = 0.5
): Promise<RegionSet> {
  const img = await loadFileToImage(file);
  return processImage(img, colorCount, {
    removeBg,
    smoothing,
    preserveDetail: true
  });
}
