import Module from 'manifold-3d';
// @ts-ignore
import wasmUrl from 'manifold-3d/manifold.wasm?url';
import type { GeometryRequest, GeometryResponse } from '../types';
import { buildKeychain } from '../geometry/buildKeychain';

let wasm: any = null;

async function initWasm() {
  if (wasm) return;
  wasm = await Module({ locateFile: () => wasmUrl });
  wasm.setup();
}

self.onmessage = async (e: MessageEvent<GeometryRequest>) => {
  const req = e.data;

  try {
    if (req.type === 'init') {
      await initWasm();
      self.postMessage({ type: 'ready' } as GeometryResponse);
      return;
    }

    if (req.type === 'build') {
      await initWasm();
      const res = buildKeychain(wasm, req.regionSet, req.params);
      self.postMessage({ type: 'parts', parts: res.parts, warnings: res.warnings } as GeometryResponse, {
        transfer: res.parts.flatMap((p) => [p.vertProperties.buffer, p.triVerts.buffer]),
      });
    }
  } catch (err: any) {
    self.postMessage({ type: 'error', message: err.message || String(err) } as GeometryResponse);
  }
};
