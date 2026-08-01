// src/lib/paletteExtractor.ts
// Uses ColorThief to extract dominant colors from an uploaded image
import type { LogoPalette } from '../types/editor';

// No external dependencies needed.

// Extract colors smartly using a fast K-means clustering on non-transparent pixels
function getSmartColors(img: HTMLImageElement, maxColors: number): number[][] {
  const canvas = document.createElement('canvas');
  const size = 100;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  
  const pixels: number[][] = [];
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 20) continue; // Ignore highly transparent pixels
    
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Ignore near white, near black, or grays to focus on vibrant colors, unless they're the only colors
    const isBoring = 
      (r > 240 && g > 240 && b > 240) || 
      (r < 25 && g < 25 && b < 25) ||
      (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15);
    
    if (!isBoring || Math.random() < 0.05) { // Down-sample boring colors heavily to prioritize vibrant ones
      pixels.push([r, g, b]);
    }
  }

  // If we rejected too many (e.g., pure black/white logo), fall back to all non-transparent pixels
  if (pixels.length < 50) {
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 50) {
        pixels.push([data[i], data[i+1], data[i+2]]);
      }
    }
  }
  
  if (pixels.length === 0) return [[30, 50, 100]];

  // K-means++ initialization
  let centroids: number[][] = [];
  centroids.push([...pixels[Math.floor(Math.random() * pixels.length)]]);
  
  for (let i = 1; i < maxColors; i++) {
    let maxDist = -1;
    let nextCenter = pixels[0];
    for (const p of pixels) {
      let minDist = Infinity;
      for (const c of centroids) {
        const dist = (p[0]-c[0])**2 + (p[1]-c[1])**2 + (p[2]-c[2])**2;
        if (dist < minDist) minDist = dist;
      }
      if (minDist > maxDist) {
        maxDist = minDist;
        nextCenter = p;
      }
    }
    centroids.push([...nextCenter]);
  }

  // K-means iteration
  let clusters: number[][][] = [];
  for (let iter = 0; iter < 10; iter++) {
    clusters = Array.from({ length: maxColors }, () => []);
    for (const p of pixels) {
      let minDist = Infinity;
      let closest = 0;
      for (let i = 0; i < maxColors; i++) {
        const c = centroids[i];
        const dist = (p[0]-c[0])**2 + (p[1]-c[1])**2 + (p[2]-c[2])**2;
        if (dist < minDist) { minDist = dist; closest = i; }
      }
      clusters[closest].push(p);
    }
    
    let moved = false;
    for (let i = 0; i < maxColors; i++) {
      if (clusters[i].length === 0) continue;
      let sumR = 0, sumG = 0, sumB = 0;
      for (const p of clusters[i]) {
        sumR += p[0]; sumG += p[1]; sumB += p[2];
      }
      const newR = sumR / clusters[i].length;
      const newG = sumG / clusters[i].length;
      const newB = sumB / clusters[i].length;
      if (Math.abs(centroids[i][0] - newR) > 1 || Math.abs(centroids[i][1] - newG) > 1 || Math.abs(centroids[i][2] - newB) > 1) moved = true;
      centroids[i] = [newR, newG, newB];
    }
    if (!moved) break;
  }
  
  // Sort clusters by size
  const sortedClusters = clusters.filter(c => c.length > 0).sort((a, b) => b.length - a.length);
  const result = sortedClusters.map(c => {
    let r=0,g=0,b=0;
    for(const p of c) { r+=p[0]; g+=p[1]; b+=p[2]; }
    return [Math.round(r/c.length), Math.round(g/c.length), Math.round(b/c.length)];
  });

  return result.length > 0 ? result : [[30, 50, 100]];
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
  const canvas = document.createElement('canvas');
  canvas.width = imgEl.naturalWidth || imgEl.width;
  canvas.height = imgEl.naturalHeight || imgEl.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(imgEl, 0, 0);

  const tempImg = new Image();
  await new Promise<void>((resolve) => {
    tempImg.onload = () => resolve();
    tempImg.src = canvas.toDataURL('image/png');
  });

  let dominant: number[];
  let palette: number[][];

  try {
    const extractedColors = getSmartColors(tempImg, 6);
    // Find the most frequent color that isn't too desaturated/extreme
    const vibrant = extractedColors.filter(c => {
      const sat = getSaturation(c);
      const bright = getBrightness(c);
      return sat > 0.15 && bright > 25 && bright < 235;
    });
    
    dominant = vibrant.length > 0 ? vibrant[0] : extractedColors[0];
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
