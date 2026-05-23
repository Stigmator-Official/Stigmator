/**
 * STIGMATOR Garment Compositor — Client-side only
 * Canvas-based compositor for overlaying tattoo designs onto real garment photos.
 * This file must NOT import any Node.js-only modules.
 */

export interface PlacementConfig {
  x: number; // 0-100 (percentage of canvas)
  y: number; // 0-100
  scale: number; // 0.1 - 3.0
  rotation: number; // degrees
  opacity: number; // 0-1
  flipX: boolean;
  flipY: boolean;
}

export interface CompositeOptions {
  garmentImageUrl: string;
  designImageUrl: string;
  placement: PlacementConfig;
  garmentColor?: string;
  printEffect?: "dtg" | "screen" | "embroidery" | "sublimation";
  outputWidth?: number;
  outputHeight?: number;
}

/**
 * Client-side canvas compositor.
 * Loads images, draws garment, then overlays the transformed design.
 */
export async function compositeDesignOnGarment(
  options: CompositeOptions
): Promise<string> {
  const {
    garmentImageUrl,
    designImageUrl,
    placement,
    garmentColor,
    printEffect = "dtg",
    outputWidth = 1024,
    outputHeight = 1024,
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    const garmentImg = new Image();
    garmentImg.crossOrigin = "anonymous";
    const designImg = new Image();
    designImg.crossOrigin = "anonymous";

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === 2) {
        try {
          drawComposite(ctx, canvas, garmentImg, designImg, placement, garmentColor, printEffect);
          resolve(canvas.toDataURL("image/png", 0.95));
        } catch (err) {
          reject(err);
        }
      }
    };

    garmentImg.onload = onLoad;
    designImg.onload = onLoad;
    garmentImg.onerror = () => reject(new Error("Failed to load garment image"));
    designImg.onerror = () => reject(new Error("Failed to load design image"));

    garmentImg.src = garmentImageUrl;
    designImg.src = designImageUrl;
  });
}

function drawComposite(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  garmentImg: HTMLImageElement,
  designImg: HTMLImageElement,
  placement: PlacementConfig,
  garmentColor?: string,
  printEffect: string = "dtg"
) {
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);

  const garmentAspect = garmentImg.naturalWidth / garmentImg.naturalHeight;
  const canvasAspect = width / height;
  let gw: number, gh: number, gx: number, gy: number;

  if (garmentAspect > canvasAspect) {
    gw = width;
    gh = width / garmentAspect;
    gx = 0;
    gy = (height - gh) / 2;
  } else {
    gh = height;
    gw = height * garmentAspect;
    gx = (width - gw) / 2;
    gy = 0;
  }

  ctx.drawImage(garmentImg, gx, gy, gw, gh);

  if (garmentColor && garmentColor !== "#ffffff" && garmentColor !== "#fafafa") {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = garmentColor;
    ctx.fillRect(gx, gy, gw, gh);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = garmentColor;
    ctx.fillRect(gx, gy, gw, gh);
    ctx.restore();
  }

  const centerX = (placement.x / 100) * width;
  const centerY = (placement.y / 100) * height;

  const maxDesignSize = width * 0.4 * placement.scale;
  const designAspect = designImg.naturalWidth / designImg.naturalHeight;
  let dw: number, dh: number;

  if (designAspect > 1) {
    dw = maxDesignSize;
    dh = maxDesignSize / designAspect;
  } else {
    dh = maxDesignSize;
    dw = maxDesignSize * designAspect;
  }

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((placement.rotation * Math.PI) / 180);
  ctx.scale(placement.flipX ? -1 : 1, placement.flipY ? -1 : 1);
  ctx.globalAlpha = placement.opacity;

  if (printEffect === "dtg") {
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = placement.opacity * 0.15;
    ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
  } else if (printEffect === "screen") {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  } else if (printEffect === "embroidery") {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-dw / 2, -dh / 2, dw, dh);
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
  }

  ctx.restore();
}

/**
 * Generate a mockup for a product design with all placements.
 */
export async function generateProductMockup(
  garmentImageUrl: string,
  designs: Array<{ imageUrl: string; placement: PlacementConfig }>,
  garmentColor?: string,
  outputWidth: number = 1024,
  outputHeight: number = 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    const garmentImg = new Image();
    garmentImg.crossOrigin = "anonymous";

    garmentImg.onload = async () => {
      try {
        const garmentAspect = garmentImg.naturalWidth / garmentImg.naturalHeight;
        const canvasAspect = outputWidth / outputHeight;
        let gw: number, gh: number, gx: number, gy: number;

        if (garmentAspect > canvasAspect) {
          gw = outputWidth;
          gh = outputWidth / garmentAspect;
          gx = 0;
          gy = (outputHeight - gh) / 2;
        } else {
          gh = outputHeight;
          gw = outputHeight * garmentAspect;
          gx = (outputWidth - gw) / 2;
          gy = 0;
        }

        ctx.drawImage(garmentImg, gx, gy, gw, gh);

        if (garmentColor && garmentColor !== "#ffffff" && garmentColor !== "#fafafa") {
          ctx.save();
          ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = garmentColor;
          ctx.fillRect(gx, gy, gw, gh);
          ctx.restore();
          ctx.save();
          ctx.globalCompositeOperation = "overlay";
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = garmentColor;
          ctx.fillRect(gx, gy, gw, gh);
          ctx.restore();
        }

        for (const { imageUrl, placement } of designs) {
          await drawDesignOnCanvas(ctx, canvas, imageUrl, placement);
        }

        resolve(canvas.toDataURL("image/png", 0.95));
      } catch (err) {
        reject(err);
      }
    };

    garmentImg.onerror = () => reject(new Error("Failed to load garment image"));
    garmentImg.src = garmentImageUrl;
  });
}

async function drawDesignOnCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  imageUrl: string,
  placement: PlacementConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const { width, height } = canvas;
      const centerX = (placement.x / 100) * width;
      const centerY = (placement.y / 100) * height;

      const maxDesignSize = width * 0.4 * placement.scale;
      const designAspect = img.naturalWidth / img.naturalHeight;
      let dw: number, dh: number;

      if (designAspect > 1) {
        dw = maxDesignSize;
        dh = maxDesignSize / designAspect;
      } else {
        dh = maxDesignSize;
        dw = maxDesignSize * designAspect;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((placement.rotation * Math.PI) / 180);
      ctx.scale(placement.flipX ? -1 : 1, placement.flipY ? -1 : 1);
      ctx.globalAlpha = placement.opacity;
      ctx.globalCompositeOperation = "multiply";
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = placement.opacity * 0.15;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
      resolve();
    };

    img.onerror = () => reject(new Error("Failed to load design image"));
    img.src = imageUrl;
  });
}
