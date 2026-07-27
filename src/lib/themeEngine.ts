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

// ── Theme Engine ──────────────────────────────────────────────

export interface ThemeResult {
  colors: EditorColors;
  suggestedTemplate: TemplateId;
}

export function buildThemeFromPalette(palette: LogoPalette): ThemeResult {
  const { dominant, secondary, accent, isDark, isVibrant, isGold, aspectRatio } = palette;

  // Frame should be a deeply tinted dark shade to make vibrant elements pop
  // Instead of turning it completely muddy, we keep a rich dark tint.
  const frameBase = darken(dominant, 0.7);
  const frameInner = darken(dominant, 0.85);
  
  // Highlight should be extremely vibrant and bright
  const highlightColor = isGold
    ? '#f59e0b'
    : isVibrant
    ? lighten(accent, 0.15) // Keep it punchy
    : '#3b82f6';
  const glowColor = isGold ? '#f59e0b' : accent;

  // Team backgrounds use the dominant color but ensured to be rich and legible.
  // If the logo is already dark, use it directly. If it's very bright, darken just enough for white text.
  const teamBg = isDark ? lighten(dominant, 0.05) : darken(dominant, 0.35);
  
  // Score backgrounds use a deeper shade for contrast, mixed slightly with the secondary color for richness
  const scoreBg = mix(darken(teamBg, 0.3), secondary, 0.15);
  
  const plateBg = darken(dominant, 0.5);

  const colors: EditorColors = {
    teamABg: linear(teamBg, lighten(teamBg, 0.1), darken(teamBg, 0.15)),
    teamBBg: linear(teamBg, lighten(teamBg, 0.1), darken(teamBg, 0.15)),
    scoreABg: linear(scoreBg, lighten(scoreBg, 0.12), darken(scoreBg, 0.1)),
    scoreBBg: linear(scoreBg, lighten(scoreBg, 0.12), darken(scoreBg, 0.1)),
    framePrimary: linear(frameBase, lighten(frameBase, 0.1), darken(frameBase, 0.15)),
    frameInner: solid(frameInner),
    highlight: solid(highlightColor),
    glow: { type: 'solid', color: glowColor, alpha: 0.7 },
    shadow: solid('#000000', 0.85),
    timeSlot: linear(darken(dominant, 0.6), darken(dominant, 0.5), darken(dominant, 0.7)),
    halfSlot: linear(darken(dominant, 0.6), darken(dominant, 0.5), darken(dominant, 0.7)),
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
