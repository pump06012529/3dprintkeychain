// Removed textLayout imports

export interface BuildParams {
  size: number; // The target physical width/height of the keychain
  style: 'raised' | 'engraved';
  baseThickness: number; // base_thickness
  imageThickness: number; // text_thickness -> imageThickness
  outlineWidth: number; // outline_width
  smoothing: number; // smoothing
  /** Plate silhouette: hug the image ('outline') or a rounded rectangle behind them. */
  plateShape: 'outline' | 'rectangle';
  /** Top-edge bevel in mm on the plate & raised letters (0 = sharp/off). */
  chamfer: number;
  ringStyle: 'loop' | 'corner';
  holeDia: number; // hole_dia
  ringThickness: number; // ring_thickness
  ringPosX: number; // ring_pos_x
  ringPosY: number; // ring_pos_y
  ringAngle?: number;
  haloWidth: number; // halo_width
  haloThickness: number; // halo_thickness
  colorScheme: 'single' | 'plate-image' | 'plate-halo-image';
  plateColor: string;
  haloColor: string;
  imageColor: string;

  /** Outline dilation applied to the image, in mm (positive = bolder, negative = thinner). */
  boldness: number;

  // --- Print mode ---
  /** 'ams' = auto multi-material; 'noams' = single nozzle, manual filament swap per Z band. */
  printMode: 'ams' | 'noams';
  /** Layer height used to snap the colour bands in no-AMS mode. */
  layerHeight: number;

  imageWidth: number;
  imageHeight: number;
}

export type GeometryRequest =
  | { type: 'build'; regionSet: RegionSet; params: BuildParams }
  | { type: 'init' };

export interface PartMesh {
  name: string;
  vertProperties: Float32Array;
  triVerts: Uint32Array;
  colorRgb: [number, number, number];
}

export type GeometryResponse =
  | { type: 'ready' }
  | { type: 'parts'; parts: PartMesh[]; warnings: string[] }
  | { type: 'error'; message: string };

export type RGB = [number, number, number];
export type Ring = [number, number][];

export interface RegionSet {
  regions: { quantRgb: RGB; components: { rings: Ring[]; coverage: number }[]; coverage: number }[];
  outline: Ring[];
  aspect: number;
}

export interface PaletteEntry {
  quantRgb: RGB;
  filamentRgb: RGB;
  coverage: number;
}
