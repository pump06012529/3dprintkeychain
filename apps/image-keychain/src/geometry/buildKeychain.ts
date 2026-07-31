import type { BuildParams, RegionSet } from '../types';
import { snapLayers } from './noAms';

/** Helper to ensure clean Emscripten memory allocation and disposal. */
function withScope<T>(fn: (keep: <M extends { delete(): void }>(m: M) => M) => T): T {
  const created: { delete(): void }[] = [];
  const keep = <M extends { delete(): void }>(m: M) => {
    created.push(m);
    return m;
  };
  try {
    return fn(keep);
  } finally {
    for (const m of created) {
      try {
        m.delete();
      } catch (e) {
        console.warn('Error deleting manifold object:', e);
      }
    }
  }
}

type Keep = <M extends { delete(): void }>(m: M) => M;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [Number.isFinite(r) ? r : 255, Number.isFinite(g) ? g : 255, Number.isFinite(b) ? b : 255];
}

/** Convert a Manifold solid mesh into export-friendly TypedArrays. */
function getMeshData(solid: any): { vertProperties: Float32Array; triVerts: Uint32Array } {
  const m = solid.getMesh();
  return { vertProperties: m.vertProperties, triVerts: m.triVerts };
}

function bevelExtrude(cs: any, height: number, chamfer: number, keep: Keep): any {
  if (chamfer <= 0.05) return keep(cs.extrude(height));
  const baseH = Math.max(0.01, height - chamfer);

  let solid = keep(cs.extrude(baseH));
  const steps = 4;
  const stepH = chamfer / steps;
  for (let i = 1; i <= steps; i++) {
    const r = (i / steps) * chamfer;
    const insetCs = keep(cs.offset(-r, 'Round', 1.0, 12));
    if (insetCs.area() < 0.1) break;
    const slice = keep(insetCs.extrude(stepH).translate([0, 0, baseH + (i - 1) * stepH]));
    solid = keep(solid.add(slice));
  }
  return solid;
}

export function buildProfiles(wasm: any, regionSet: RegionSet, params: BuildParams, keep: Keep) {
  const { CrossSection } = wasm;

  const hasHalo = params.colorScheme === 'plate-halo-image';
  const isRaised = params.style === 'raised';

  const snapped = params.printMode === 'noams'
    ? snapLayers(params.baseThickness, params.haloThickness, params.layerHeight)
    : { base: params.baseThickness, halo: params.haloThickness };
  const baseT = snapped.base;
  const haloT = snapped.halo;
  const letterZ = baseT + (hasHalo ? haloT : 0);

  const plateMargin = params.outlineWidth + (hasHalo ? params.haloWidth : 0);
  const lugOuter = params.holeDia / 2 + params.ringThickness;
  const lugPre = Math.max(lugOuter - plateMargin, 0.6);

  let glyphsCS: any;
  if (regionSet.outline.length === 0 || regionSet.outline.every(c => c.length === 0)) {
    glyphsCS = keep(CrossSection.circle(0.01, 3));
  } else {
    glyphsCS = keep(new CrossSection(regionSet.outline, 'NonZero'));
  }
  if (Math.abs(params.boldness) > 0.02) {
    const bolded = keep(glyphsCS.offset(params.boldness, 'Round', 2.0, 12));
    if (bolded.area() > 0.1) glyphsCS = bolded;
  }
  const emptyText = glyphsCS.area() < 0.1;

  const orderedRegions = [...regionSet.regions].sort((a, b) => (a.coverage ?? 1) - (b.coverage ?? 1));
  const regionProfiles: { cs: any, quantRgb: [number, number, number] }[] = [];
  let placed2D: any = null;

  for (const r of orderedRegions) {
    let cs = keep(new CrossSection(r.components.flatMap(c => c.rings), 'NonZero'));
    if (Math.abs(params.boldness) > 0.02) {
      const bolded = keep(cs.offset(params.boldness, 'Round', 2.0, 12));
      if (bolded.area() > 0.1) cs = bolded;
    }
    

    // Gap mitigation: grow the section before subtracting placed2D, 
    // ensuring identical boundaries between adjacent colors (no gaps).
    const gapOffset = params.colorBleed;
    cs = keep(cs.offset(gapOffset, 'Round', 1.0, 12));
    
    if (placed2D) {
      cs = keep(cs.subtract(placed2D));
    }

    if (cs.area() > 0.01) {
      regionProfiles.push({ cs, quantRgb: r.quantRgb });
      placed2D = placed2D ? keep(placed2D.add(cs)) : cs;
    }
  }

  const gBox = { minX: -params.imageWidth/2, maxX: params.imageWidth/2, minY: -params.imageHeight/2, maxY: params.imageHeight/2 };
  const corner = params.ringStyle === 'corner';

  let lugCx: number, lugCy: number;
  let defaultAngle: number;

  if (corner) {
    lugCx = gBox.minX + lugOuter * 0.15;
    lugCy = gBox.maxY + lugOuter * 0.15;
    defaultAngle = 135;
  } else {
    lugCx = gBox.minX - lugOuter;
    lugCy = (gBox.minY + gBox.maxY) / 2;
    defaultAngle = params.ringPosY > 4 ? 90 : 180;
  }

  const holeX = lugCx + params.ringPosX;
  const holeY = lugCy + params.ringPosY;

  const angle = defaultAngle + (params.ringAngle ?? 0);
  const rad = (angle * Math.PI) / 180;
  const neckLen = Math.max(lugOuter * 2.2, 10.0);
  const anchorX = holeX - neckLen * Math.cos(rad);
  const anchorY = holeY - neckLen * Math.sin(rad);

  const lugDisc = keep(CrossSection.circle(lugPre, 32).translate([holeX, holeY]));
  const anchorR = Math.min(lugPre * 0.85, 2.0);
  const anchorDisc = keep(CrossSection.circle(anchorR, 16).translate([anchorX, anchorY]));
  const tabCS = keep(CrossSection.hull([lugDisc, anchorDisc]));

  const sectionIsEmpty = (cs: any) => cs.area() < 0.0001;
  const removeHoles = (cs: any): any => {
    if (sectionIsEmpty(cs)) return cs;
    const rect = keep(CrossSection.square([1000, 1000], true));
    const inverted = keep(rect.subtract(cs));
    const islands = [...inverted.decompose()];
    if (islands.length <= 1) return cs;
    let maxArea = -1;
    let outerSpace = islands[0];
    for (let i = 0; i < islands.length; i++) {
      const area = islands[i].area();
      if (area > maxArea) {
        maxArea = area;
        outerSpace = islands[i];
      }
    }
    return keep(rect.subtract(outerSpace));
  };

  let plateBodySrc = removeHoles(glyphsCS);
  if (params.plateShape === 'rectangle') {
    plateBodySrc = keep(CrossSection.square([gBox.maxX - gBox.minX, gBox.maxY - gBox.minY], true).translate([(gBox.minX + gBox.maxX)/2, (gBox.minY + gBox.maxY)/2]));
  }
  let plateSrc = keep(plateBodySrc.add(tabCS));
  
  const smoothR = Math.max(0.1, params.smoothing);
  let plateCS = keep(plateSrc.offset(plateMargin + smoothR, 'Round', 2.0, 24));
  plateCS = keep(plateCS.offset(-smoothR, 'Round', 2.0, 24));

  let haloCS: any = null;
  if (hasHalo) {
    let bodyCS = keep(plateBodySrc.offset(plateMargin + smoothR, 'Round', 2.0, 24));
    bodyCS = keep(bodyCS.offset(-smoothR, 'Round', 2.0, 24));
    haloCS = keep(bodyCS.offset(-params.haloWidth, 'Round', 1.0, 12));
    // Ensure halo doesn't fill internal holes by subtracting the solid plateBodySrc
    haloCS = keep(haloCS.subtract(plateBodySrc));
  }

  return {
    plateNoHole: plateCS,
    haloCS,
    textCS: glyphsCS,
    inlaysCS: placed2D,
    regionProfiles,
    emptyText,
    isRaised,
    hasHalo,
    baseT,
    haloT,
    letterZ,
    holeX,
    holeY,
    holeR: params.holeDia / 2,
    regionSet,
  };
}

export function buildKeychain(
  wasm: any,
  regionSet: RegionSet,
  params: BuildParams,
): {
  parts: { name: string; vertProperties: Float32Array; triVerts: Uint32Array; colorRgb: [number, number, number] }[];
  warnings: string[];
} {
  const { Manifold, CrossSection } = wasm;
  const warnings: string[] = [];

  const parts = withScope((keep) => {
    const p = buildProfiles(wasm, regionSet, params, keep);
    if (p.emptyText) warnings.push('Image geometry is empty. Check threshold or try a different image.');

    const finalParts: {
      name: string;
      vertProperties: Float32Array;
      triVerts: Uint32Array;
      colorRgb: [number, number, number];
    }[] = [];

    const holeCut = (solid: any, zBottom: number, zTop: number) => {
      const cyl = keep(
        Manifold.cylinder(zTop - zBottom + 2, p.holeR, p.holeR, 32).translate([p.holeX, p.holeY, zBottom - 1]),
      );
      return keep(solid.subtract(cyl));
    };

    const chamBase = Math.min(params.chamfer, p.baseT * 0.6);
    const chamText = Math.min(params.chamfer, params.imageThickness * 0.5);

    if (p.isRaised) {
      let baseSolid = bevelExtrude(p.plateNoHole, p.baseT, chamBase, keep);
      baseSolid = holeCut(baseSolid, 0, p.baseT);
      finalParts.push({ name: 'plate', ...getMeshData(baseSolid), colorRgb: hexToRgb(params.plateColor) });

      if (p.hasHalo && p.haloCS) {
        const haloSolid = keep(p.haloCS.extrude(p.haloT).translate([0, 0, p.baseT]));
        finalParts.push({ name: 'halo', ...getMeshData(haloSolid), colorRgb: hexToRgb(params.haloColor) });
      }

      p.regionProfiles.forEach((rp, i) => {
        const regionBev = bevelExtrude(rp.cs, params.imageThickness, chamText, keep);
        const regionSolid = keep(regionBev.translate([0, 0, p.letterZ]));
        const isSingle = p.regionProfiles.length === 1;
        const name = isSingle ? 'image' : `image_${i}`;
        const color = isSingle ? hexToRgb(params.imageColor) : rp.quantRgb;
        finalParts.push({ name, ...getMeshData(regionSolid), colorRgb: color });
      });
    } else {
      // Engraved: base plate with a recess, flush-filled with coloured inlays.
      let baseSolid = bevelExtrude(p.plateNoHole, p.baseT, chamBase, keep);
      const cutDepth = Math.min(params.imageThickness, p.baseT * 0.6);
      
      // The recess cut should exactly match the inlays (and halo) so the base plate 
      // sticks up to fill any gaps or missing regions (like removed backgrounds).
      const recessCS = p.hasHalo && p.haloCS ? keep(p.haloCS.add(p.inlaysCS ?? p.textCS)) : (p.inlaysCS ?? p.textCS);
      const recessCut = keep(recessCS.extrude(cutDepth + 1).translate([0, 0, p.baseT - cutDepth]));
      let engraved = keep(baseSolid.subtract(recessCut));
      engraved = holeCut(engraved, 0, p.baseT);
      finalParts.push({ name: 'plate', ...getMeshData(engraved), colorRgb: hexToRgb(params.plateColor) });

      if (params.colorScheme !== 'single') {
        if (p.hasHalo && p.haloCS) {
          if (p.haloCS.area() > 0.02) {
            const ringSolid = keep(p.haloCS.extrude(cutDepth).translate([0, 0, p.baseT - cutDepth]));
            finalParts.push({ name: 'halo', ...getMeshData(ringSolid), colorRgb: hexToRgb(params.haloColor) });
          }
        }

        p.regionProfiles.forEach((rp, i) => {
          const regionInfill = keep(rp.cs.extrude(cutDepth).translate([0, 0, p.baseT - cutDepth]));
          const isSingle = p.regionProfiles.length === 1;
          const name = isSingle ? 'image' : `image_${i}`;
          const color = isSingle ? hexToRgb(params.imageColor) : rp.quantRgb;
          finalParts.push({ name, ...getMeshData(regionInfill), colorRgb: color });
        });
      }
    }

    return finalParts;
  });

  return { parts, warnings };
}
