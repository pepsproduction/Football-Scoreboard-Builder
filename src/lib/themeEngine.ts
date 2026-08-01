// src/lib/themeEngine.ts
// Rule-based theme engine: maps logo palette → editor color defaults + template suggestion
import type { LogoPalette, EditorColors, ColorConfig, TemplateId } from '../types/editor';

const solid = (color: string, alpha = 1): ColorConfig => ({
  type: 'solid',
  color,
  alpha,
});

const linear = (color: string, stopA: string, stopB: string, alpha = 1): ColorConfig => ({
  type: 'linear',
  color,
  alpha,
  stops: [
    { offset: 0, color: stopA },
    { offset: 1, color: stopB },
  ],
});

// ── Color math helpers ────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function darken(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}

function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function hexToHsl(hex: string): [number, number, number] {
  let [r, g, b] = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return rgbToHex(r * 255, g * 255, b * 255);
}

// ── Theme Engine ──────────────────────────────────────────────

export interface ThemeResult {
  colors: EditorColors;
  suggestedTemplate: TemplateId;
}

export function buildThemeFromPalette(palette: LogoPalette, variant: number = 0): ThemeResult {
  const { dominant, secondary, accent, isDark, isVibrant, isGold, aspectRatio } = palette;

  const [domH, domS, domL] = hexToHsl(dominant);
  const [accH, accS, accL] = hexToHsl(accent);
  const [secH, secS, secL] = hexToHsl(secondary);

  let frameBase: string, frameInner: string, teamBg: string, scoreBg: string, plateBg: string;
  let highlightColor = accent;
  let glowColor = accent;

  // Default highlight logic
  if (isGold) {
    highlightColor = '#fbbf24';
    glowColor = '#f59e0b';
  } else {
    highlightColor = hslToHex(accH, Math.max(accS, 0.7), Math.max(accL, 0.6));
    glowColor = hslToHex(accH, Math.max(accS, 0.6), Math.max(accL, 0.5));
  }

  // Variant mappings
  if (variant === 1) {
    // Variant 1: Vibrant / Neon
    frameBase = hslToHex(domH, Math.min(domS, 0.8), 0.15);
    frameInner = hslToHex(domH, Math.min(domS, 0.8), 0.20);
    teamBg = hslToHex(domH, Math.max(0.6, domS), 0.25);
    scoreBg = hslToHex(domH, Math.max(0.4, domS), 0.15);
    plateBg = hslToHex(domH, Math.max(0.5, domS), 0.12);
  } else if (variant === 2) {
    // Variant 2: Monochrome / Deep Dark
    frameBase = hslToHex(domH, Math.min(domS, 0.1), 0.05);
    frameInner = hslToHex(domH, Math.min(domS, 0.1), 0.08);
    teamBg = hslToHex(domH, Math.min(domS, 0.15), 0.08);
    scoreBg = hslToHex(domH, Math.min(domS, 0.1), 0.04);
    plateBg = hslToHex(domH, Math.min(domS, 0.1), 0.03);
    if (!isGold) {
      highlightColor = hslToHex(accH, Math.max(accS, 0.4), 0.5);
      glowColor = hslToHex(accH, Math.max(accS, 0.3), 0.4);
    }
  } else if (variant === 3) {
    // Variant 3: Alternative / Secondary Focused
    frameBase = hslToHex(secH, Math.min(secS, 0.4), 0.10);
    frameInner = hslToHex(secH, Math.min(secS, 0.5), 0.14);
    teamBg = hslToHex(secH, Math.min(secS, 0.6), 0.18);
    scoreBg = hslToHex(secH, Math.min(secS, 0.3), 0.12);
    plateBg = hslToHex(secH, Math.min(secS, 0.3), 0.08);
  } else {
    // Variant 0: Premium Dark (Default)
    frameBase = hslToHex(domH, Math.min(domS, 0.4), 0.08);
    frameInner = hslToHex(domH, Math.min(domS, 0.5), 0.12);
    teamBg = hslToHex(domH, Math.min(domS, 0.6), 0.16);
    scoreBg = hslToHex(domH, Math.min(domS, 0.3), 0.10);
    plateBg = hslToHex(domH, Math.min(domS, 0.3), 0.06);
  }

  // Helper for premium, smooth gradients: top-left (lighter) to bottom-right (darker)
  const makePremiumGradient = (baseHex: string, lDiff: number, sDiff: number) => {
    const [h, s, l] = hexToHsl(baseHex);
    const stopA = hslToHex(h, Math.min(1, s + sDiff), Math.min(1, Math.max(0, l + lDiff)));
    const stopB = hslToHex(h, Math.max(0, s - sDiff), Math.max(0, Math.min(1, l - lDiff)));
    return linear(baseHex, stopA, stopB);
  };

  const colors: EditorColors = {
    teamABg: makePremiumGradient(teamBg, 0.04, 0.1),
    teamBBg: makePremiumGradient(teamBg, 0.04, 0.1),
    scoreABg: makePremiumGradient(scoreBg, 0.03, 0.05),
    scoreBBg: makePremiumGradient(scoreBg, 0.03, 0.05),
    framePrimary: makePremiumGradient(frameBase, 0.03, 0.05),
    frameInner: solid(frameInner),
    highlight: solid(highlightColor),
    glow: { type: 'solid', color: glowColor, alpha: 0.8 },
    shadow: solid('#000000', 0.85),
    timeSlot: makePremiumGradient(hslToHex(domH, Math.min(domS, 0.2), 0.12), 0.02, 0),
    halfSlot: makePremiumGradient(hslToHex(domH, Math.min(domS, 0.2), 0.10), 0.02, 0),
    yellowCard: solid('#ca8a04'),
    redCard: solid('#dc2626'),
    logoPlateBg: { type: 'solid', color: plateBg, alpha: 0.95 },
  };

  // ── Template suggestion rules ──────────────────────────────
  let suggestedTemplate: TemplateId = 'centerCrest';

  if (isGold && isDark) {
    suggestedTemplate = 'championsLeague';
  } else if (isGold) {
    suggestedTemplate = 'premiumMetallic';
  } else if (isVibrant && isDark) {
    suggestedTemplate = 'esportsNeon';
  } else if (!isDark && isVibrant) {
    suggestedTemplate = 'premierModern';
  } else if (aspectRatio > 2) {
    // Wide/horizontal logo → left logo layout
    suggestedTemplate = 'leftLogoClassic';
  } else if (!isVibrant && !isDark) {
    // Neutral/light logo
    suggestedTemplate = 'worldCupClassic';
  } else if (isDark && !isVibrant) {
    // Dark muted → compact
    suggestedTemplate = 'compactLive';
  }

  // Detect red/blue dominant → competitive
  const [, , hue] = hexToHsl(dominant);
  const dominantHue = hue * 360;
  if (
    (dominantHue > 0 && dominantHue < 30) || // red
    (dominantHue > 330 && dominantHue < 360) || // red-magenta
    (dominantHue > 200 && dominantHue < 260) // blue-indigo
  ) {
    suggestedTemplate = 'competitiveSplit';
  }

  return { colors, suggestedTemplate };
}
