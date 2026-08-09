// Deterministic logo palette extraction.
// Sampling is aspect-ratio safe and clustering happens in OKLab so visually
// similar colors stay together more reliably than with raw RGB distance.
import type { LogoPalette, LogoPaletteColor } from '../types/editor';

type Rgb = [number, number, number];
type Lab = [number, number, number];

interface WeightedSample {
  rgb: Rgb;
  lab: Lab;
  weight: number;
}

interface ClusterColor extends LogoPaletteColor {
  rgb: Rgb;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function rgbToHex(rgb: Rgb): string {
  return `#${rgb.map((value) => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0')).join('')}`;
}

function getSaturation(rgb: Rgb): number {
  const values = rgb.map((value) => value / 255);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return max === 0 ? 0 : (max - min) / max;
}

function srgbToLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(value: number): number {
  const normalized = value <= 0.0031308
    ? 12.92 * value
    : 1.055 * (value ** (1 / 2.4)) - 0.055;
  return clamp(normalized) * 255;
}

function rgbToOklab(rgb: Rgb): Lab {
  const r = srgbToLinear(rgb[0]);
  const g = srgbToLinear(rgb[1]);
  const b = srgbToLinear(rgb[2]);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const lRoot = Math.cbrt(Math.max(0, l));
  const mRoot = Math.cbrt(Math.max(0, m));
  const sRoot = Math.cbrt(Math.max(0, s));
  return [
    0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot,
  ];
}

function oklabToRgb(lab: Lab): Rgb {
  const [l, a, b] = lab;
  const lRoot = l + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = l - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = l - 0.0894841775 * a - 1.291485548 * b;
  const lr = lRoot ** 3;
  const mr = mRoot ** 3;
  const sr = sRoot ** 3;
  return [
    linearToSrgb(4.0767416621 * lr - 3.3077115913 * mr + 0.2309699292 * sr),
    linearToSrgb(-1.2684380046 * lr + 2.6097574011 * mr - 0.3413193965 * sr),
    linearToSrgb(-0.0041960863 * lr - 0.7034186147 * mr + 1.707614701 * sr),
  ];
}

function labDistance(a: Lab, b: Lab): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

function relativeLuminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContainedPixels(img: HTMLImageElement): WeightedSample[] {
  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const sourceWidth = img.naturalWidth || img.width || 1;
  const sourceHeight = img.naturalHeight || img.height || 1;
  const scale = Math.min(size / sourceWidth, size / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const offsetX = (size - drawWidth) / 2;
  const offsetY = (size - drawHeight) / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  const data = ctx.getImageData(0, 0, size, size).data;
  const samples: WeightedSample[] = [];
  // A fixed stride keeps the extractor fast and repeatable.
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const index = (y * size + x) * 4;
      const alpha = data[index + 3] / 255;
      if (alpha < 0.13) continue;

      // Blend anti-aliased edges with a neutral mid-gray instead of letting
      // transparent pixels create false black/white clusters.
      const rgb: Rgb = [
        data[index] * alpha + 128 * (1 - alpha),
        data[index + 1] * alpha + 128 * (1 - alpha),
        data[index + 2] * alpha + 128 * (1 - alpha),
      ];
      const saturation = getSaturation(rgb);
      const brightness = relativeLuminance(rgb);
      const neutralWeight = saturation < 0.06 && (brightness < 0.015 || brightness > 0.9) ? 0.35 : 1;
      const weight = Math.max(0.05, alpha * neutralWeight);
      samples.push({ rgb, lab: rgbToOklab(rgb), weight });
    }
  }
  return samples;
}

function getSmartColors(img: HTMLImageElement, maxColors: number): ClusterColor[] {
  const samples = getContainedPixels(img);
  if (samples.length === 0) {
    const fallback: Rgb = [30, 50, 100];
    return [{ hex: rgbToHex(fallback), rgb: fallback, weight: 1, saturation: getSaturation(fallback), luminance: relativeLuminance(fallback) }];
  }

  const totalWeight = samples.reduce((sum, sample) => sum + sample.weight, 0);
  const averageLab: Lab = samples.reduce<Lab>(
    (sum, sample) => [
      sum[0] + sample.lab[0] * sample.weight,
      sum[1] + sample.lab[1] * sample.weight,
      sum[2] + sample.lab[2] * sample.weight,
    ],
    [0, 0, 0] as Lab
  ).map((value) => value / totalWeight) as Lab;

  const centroids: Lab[] = [averageLab];
  while (centroids.length < Math.min(maxColors, samples.length)) {
    let best = samples[0];
    let bestScore = -Infinity;
    for (const sample of samples) {
      const nearest = Math.min(...centroids.map((centroid) => labDistance(sample.lab, centroid)));
      const score = nearest * (0.6 + getSaturation(sample.rgb));
      if (score > bestScore) {
        bestScore = score;
        best = sample;
      }
    }
    centroids.push([...best.lab]);
  }

  let clusters: WeightedSample[][] = [];
  for (let iteration = 0; iteration < 12; iteration += 1) {
    clusters = Array.from({ length: centroids.length }, () => [] as WeightedSample[]);
    for (const sample of samples) {
      let closest = 0;
      let closestDistance = Infinity;
      for (let i = 0; i < centroids.length; i += 1) {
        const distance = labDistance(sample.lab, centroids[i]);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = i;
        }
      }
      clusters[closest].push(sample);
    }

    let moved = false;
    for (let i = 0; i < clusters.length; i += 1) {
      if (clusters[i].length === 0) continue;
      const weight = clusters[i].reduce((sum, sample) => sum + sample.weight, 0);
      const next: Lab = clusters[i].reduce<Lab>(
        (sum, sample) => [
          sum[0] + sample.lab[0] * sample.weight,
          sum[1] + sample.lab[1] * sample.weight,
          sum[2] + sample.lab[2] * sample.weight,
        ],
        [0, 0, 0] as Lab
      ).map((value) => value / weight) as Lab;
      if (labDistance(centroids[i], next) > 0.00002) moved = true;
      centroids[i] = next;
    }
    if (!moved) break;
  }

  const colors = clusters
    .map((cluster, index) => {
      const weight = cluster.reduce((sum, sample) => sum + sample.weight, 0);
      const rgb = oklabToRgb(centroids[index]);
      return {
        hex: rgbToHex(rgb),
        rgb,
        weight: weight / totalWeight,
        saturation: getSaturation(rgb),
        luminance: relativeLuminance(rgb),
      };
    })
    .filter((color) => color.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  return colors.length > 0 ? colors : [{ hex: '#1e3264', rgb: [30, 50, 100], weight: 1, saturation: 0.7, luminance: 0.03 }];
}

function hueDistance(a: string, b: string): number {
  const toHue = (hex: string) => {
    const [r, g, blue] = hex.slice(1).match(/.{2}/g)!.map((part) => parseInt(part, 16) / 255);
    const max = Math.max(r, g, blue);
    const min = Math.min(r, g, blue);
    if (max === min) return 0;
    const delta = max - min;
    let hue = max === r ? (g - blue) / delta : max === g ? (blue - r) / delta + 2 : (r - g) / delta + 4;
    if (hue < 0) hue += 6;
    return hue * 60;
  };
  const difference = Math.abs(toHue(a) - toHue(b));
  return Math.min(difference, 360 - difference);
}

/** Extract a stable, role-aware palette from an already loaded logo. */
export async function extractPalette(imgEl: HTMLImageElement): Promise<LogoPalette> {
  const canvas = document.createElement('canvas');
  canvas.width = imgEl.naturalWidth || imgEl.width || 1;
  canvas.height = imgEl.naturalHeight || imgEl.height || 1;

  let extracted: ClusterColor[];
  try {
    extracted = getSmartColors(imgEl, 6);
  } catch {
    const fallback: Rgb = [30, 50, 100];
    extracted = [{ hex: rgbToHex(fallback), rgb: fallback, weight: 1, saturation: 0.7, luminance: 0.03 }];
  }

  const dominantColor = extracted[0];
  const accentColor = [...extracted]
    .filter((color) => color.saturation > 0.18 && color.luminance > 0.03 && color.luminance < 0.88)
    .sort((a, b) => (b.weight * 0.58 + b.saturation * 0.42) - (a.weight * 0.58 + a.saturation * 0.42))[0] || dominantColor;
  const secondaryColor = extracted.find((color) => color.hex !== dominantColor.hex && hueDistance(color.hex, dominantColor.hex) > 18) || extracted[1] || dominantColor;
  const colors = extracted.slice(0, 5).map((color) => color.hex);
  const isGold = extracted.some((color) => {
    const [r, g, b] = color.rgb;
    return r > 170 && g > 120 && b < 110 && r > g && g > b;
  });
  const dominantLuminance = dominantColor.luminance;
  const maximumSaturation = Math.max(...extracted.map((color) => color.saturation));

  return {
    colors,
    dominant: dominantColor.hex,
    secondary: secondaryColor.hex,
    accent: accentColor.hex,
    isDark: dominantLuminance < 0.32,
    isVibrant: maximumSaturation > 0.48,
    isGold,
    aspectRatio: canvas.width / canvas.height,
    colorDetails: extracted.map(({ hex, weight, saturation, luminance }) => ({
      hex,
      weight: Math.round(weight * 1000) / 1000,
      saturation: Math.round(saturation * 1000) / 1000,
      luminance: Math.round(luminance * 1000) / 1000,
    } satisfies LogoPaletteColor)),
  };
}

/** Load an image from a data URL and return the element. */
export function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
