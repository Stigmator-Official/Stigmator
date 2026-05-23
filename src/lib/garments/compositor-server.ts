/**
 * STIGMATOR Garment Compositor — Server-side only
 * Sharp-based compositor for overlaying tattoo designs onto real garment photos.
 * This file must only be imported in server-side code (API routes, server components).
 */

import sharp from "sharp";

export interface PlacementConfig {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
}

export async function compositeDesignOnGarmentServer(
  garmentBuffer: Buffer,
  designBuffer: Buffer,
  placement: PlacementConfig,
  garmentColor?: string,
  outputWidth: number = 1024,
  outputHeight: number = 1024
): Promise<Buffer> {
  let garment = sharp(garmentBuffer).resize(outputWidth, outputHeight, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  });

  if (garmentColor) {
    const rgb = hexToRgb(garmentColor);
    if (rgb) {
      garment = garment.composite([
        {
          input: Buffer.from(
            `<svg width="${outputWidth}" height="${outputHeight}">
              <rect width="100%" height="100%" fill="rgb(${rgb.r},${rgb.g},${rgb.b})" opacity="0.3"/>
            </svg>`
          ),
          blend: "multiply",
        },
      ]);
    }
  }

  const designMeta = await sharp(designBuffer).metadata();
  const designW = designMeta.width || 512;
  const designH = designMeta.height || 512;

  const maxDesignSize = outputWidth * 0.4 * placement.scale;
  const designAspect = designW / designH;
  let dw: number, dh: number;

  if (designAspect > 1) {
    dw = maxDesignSize;
    dh = maxDesignSize / designAspect;
  } else {
    dh = maxDesignSize;
    dw = maxDesignSize * designAspect;
  }

  const centerX = (placement.x / 100) * outputWidth;
  const centerY = (placement.y / 100) * outputHeight;
  const dx = Math.round(centerX - dw / 2);
  const dy = Math.round(centerY - dh / 2);

  let designSharp = sharp(designBuffer)
    .resize(Math.round(dw), Math.round(dh), { fit: "inside" })
    .ensureAlpha();

  if (placement.opacity < 1) {
    designSharp = designSharp.modulate({
      brightness: 1,
      saturation: 1,
      lightness: placement.opacity,
    });
  }

  const resizedDesign = await designSharp.toBuffer();

  const result = await garment
    .composite([
      {
        input: resizedDesign,
        left: dx,
        top: dy,
        blend: "over",
      },
    ])
    .png({ quality: 95 })
    .toBuffer();

  return result;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
