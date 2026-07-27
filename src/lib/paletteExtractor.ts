// src/lib/paletteExtractor.ts
// Uses ColorThief to extract dominant colors from an uploaded image
import type { LogoPalette } from '../types/editor';

// No external dependencies needed.

// Inline ColorThief-compatible implementation using canvas
// Extract colors by quantizing RGB space to find the most frequent distinct colors
function getQuantizedColors(img: HTMLImageElement, maxColors: number): number[][] {
  const canvas = document.createElement('canvas');
  const size = 150;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  
  const data = ctx.getImageData(0, 0, size, size).data;
  const colorMap = new Map<number, { count: number; rawCount: number; r: number; g: number; b: number }>();
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; 
    
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Down-weight pure white/black slightly
    const isBoring = (r > 240 && g > 240 && b > 240) || (r < 25 && g < 25 && b < 25);
    const weight = isBoring ? 0.1 : 1;

    // Quantize to 4-bits per channel
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    
    const existing = colorMap.get(key);
    if (existing) {
      existing.count += weight;
      existing.rawCount++;
      existing.r += r;
      existing.g += g;
      existing.b += b;
    } else {
      colorMap.set(key, { count: weight, rawCount: 1, r, g, b });
    }
  }

  const sortedBuckets = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
  const result: number[][] = [];
  
  for (const bucket of sortedBuckets) {
    if (result.length >= maxColors * 2) break;
    
    const avg = [
      Math.round(bucket.r / bucket.rawCount),
      Math.round(bucket.g / bucket.rawCount),
      Math.round(bucket.b / bucket.rawCount)
    ];

    // Ensure distinct colors (Euclidean distance threshold)
    const isDistinct = result.every(res => {
      const dr = res[0] - avg[0];
      const dg = res[1] - avg[1];
      const db = res[2] - avg[2];
      return (dr*dr + dg*dg + db*db) > 2500; // threshold
    });
    
    if (isDistinct || result.length === 0) {
      result.push(avg);
    }
  }

  while (result.length < maxColors) {
    result.push([30, 50, 100]); // fallback
  }

  return result.slice(0, maxColors);
}


/** Convert [r,g,b] array to hex string */
function rgbToHex(rgb: number[]): string {
  return (
    '#' +
    rgb
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
      .join('')
  );
}

/** Get perceived brightness 0–255 */
function getBrightness(rgb: number[]): number {
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

/** Get saturation 0–1 */
function getSaturation(rgb: number[]): number {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

/** Determine if color is "gold-ish" */
function isGoldish(rgb: number[]): boolean {
  const [r, g, b] = rgb;
  return r > 180 && g > 140 && b < 80 && r > g && g > b;
}

/**
 * Extract color palette from an image element.
 * The image must already be loaded (naturalWidth > 0).
 */
export async function extractPalette(imgEl: HTMLImageElement): Promise<LogoPalette> {
  // ColorThief requires a fully loaded image on a same-origin canvas
  // We draw the image to an offscreen canvas to handle cross-origin issues
  const canvas = document.createElement('canvas');
  canvas.width = imgEl.naturalWidth || imgEl.width;
  canvas.height = imgEl.naturalHeight || imgEl.height;
  const ctx = canvas.getContext('2d')!;

  // Fill white background to handle transparent PNGs (ColorThief can't read alpha)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgEl, 0, 0);

  // Create a temporary image from the canvas to pass to ColorThief
  const tempImg = new Image();
  await new Promise<void>((resolve) => {
    tempImg.onload = () => resolve();
    tempImg.src = canvas.toDataURL('image/png');
  });

  let dominant: number[];
  let palette: number[][];

  try {
    const extractedColors = getQuantizedColors(tempImg, 8);
    // The most frequent distinct color is dominant
    dominant = extractedColors[0];
    palette = extractedColors;
  } catch {
    // Fallback if extraction fails
    dominant = [30, 50, 100];
    palette = [
      [30, 50, 100],
      [60, 90, 160],
      [100, 140, 200],
      [200, 180, 80],
      [220, 220, 240],
    ];
  }

  // Sort palette by saturation descending → more vibrant first
  const sorted = [...palette].sort(
    (a, b) => getSaturation(b) - getSaturation(a)
  );

  const colors = sorted.slice(0, 5).map(rgbToHex);
  const dominantHex = rgbToHex(dominant);
  const secondaryHex = colors[1] || dominantHex;
  const accentHex = colors[0] || dominantHex; // most saturated

  const brightness = getBrightness(dominant);
  const saturation = getSaturation(sorted[0] || dominant);

  return {
    colors,
    dominant: dominantHex,
    secondary: secondaryHex,
    accent: accentHex,
    isDark: brightness < 128,
    isVibrant: saturation > 0.5,
    isGold: isGoldish(dominant) || sorted.some(isGoldish),
    aspectRatio: canvas.width / canvas.height,
  };
}

/**
 * Load an image from a data URL and return the element.
 */
export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
