// Logo-aware theme generation.
// The engine keeps the logo's hue family, uses its dominant/secondary/accent
// colors for distinct roles, and adjusts surfaces until important pairs pass
// a readable contrast target.
import type { LogoPalette, EditorColors, ColorConfig, TemplateId, SportType } from '../types/editor';

const solid = (color: string, alpha = 1): ColorConfig => ({ type: 'solid', color, alpha });

const linear = (color: string, stopA: string, stopB: string, alpha = 1): ColorConfig => ({
  type: 'linear',
  color,
  alpha,
  stops: [
    { offset: 0, color: stopA },
    { offset: 1, color: stopB },
  ],
});

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function normalizeHex(hex: string): string {
  const value = (hex || '#000000').trim().replace('#', '');
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return `#${value.split('').map((part) => `${part}${part}`).join('')}`.toLowerCase();
  }
  if (!/^[0-9a-f]{6}$/i.test(value)) return '#000000';
  return `#${value.toLowerCase()}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = normalizeHex(hex).slice(1);
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((value) => Math.round(clamp(value / 255) * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((value) => value / 255);
  const linearize = (value: number) => value <= 0.03928
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function hexToHsl(hex: string): [number, number, number] {
  let [r, g, b] = hexToRgb(hex).map((value) => value / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, lightness];
  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);
  let hue = 0;
  if (max === r) hue = (g - b) / delta + (g < b ? 6 : 0);
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  return [hue / 6, saturation, lightness];
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  let r: number;
  let g: number;
  let b: number;
  const h = ((hue % 1) + 1) % 1;
  const s = clamp(saturation);
  const l = clamp(lightness);
  if (s === 0) {
    r = l;
    g = l;
    b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let adjusted = t;
      if (adjusted < 0) adjusted += 1;
      if (adjusted > 1) adjusted -= 1;
      if (adjusted < 1 / 6) return p + (q - p) * 6 * adjusted;
      if (adjusted < 1 / 2) return q;
      if (adjusted < 2 / 3) return p + (q - p) * (2 / 3 - adjusted) * 6;
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

function makeSurface(hue: number, saturation: number, lightness: number): string {
  return hslToHex(hue, clamp(saturation, 0.04, 0.78), clamp(lightness, 0.035, 0.34));
}

function ensureContrast(color: string, background: string, minimum: number): string {
  const normalized = normalizeHex(color);
  if (contrastRatio(normalized, background) >= minimum) return normalized;

  const [hue, saturation, originalLightness] = hexToHsl(normalized);
  const backgroundIsDark = relativeLuminance(background) < 0.38;
  const candidates = [0.18, 0.28, 0.38, 0.5, 0.62, 0.72, 0.82, 0.92]
    .map((lightness) => hslToHex(hue, saturation, lightness))
    .filter((candidate) => contrastRatio(candidate, background) >= minimum);
  if (candidates.length === 0) {
    return backgroundIsDark ? '#ffffff' : '#111111';
  }

  return candidates.sort((a, b) => {
    const [, , aLightness] = hexToHsl(a);
    const [, , bLightness] = hexToHsl(b);
    const aDistance = Math.abs(aLightness - originalLightness);
    const bDistance = Math.abs(bLightness - originalLightness);
    return aDistance - bDistance;
  })[0];
}

function makeGradient(base: string, lightnessDelta: number, saturationDelta: number): ColorConfig {
  const [hue, saturation, lightness] = hexToHsl(base);
  const stopA = hslToHex(hue, clamp(saturation + saturationDelta), clamp(lightness + lightnessDelta));
  const stopB = hslToHex(hue, clamp(saturation - saturationDelta), clamp(lightness - lightnessDelta));
  return linear(base, stopA, stopB);
}

function getContrastReport(colors: {
  highlight: string;
  teamBg: string;
  frameInner: string;
  scoreBg: string;
  logoPlate: string;
  logo: string;
}): { warnings: string[]; score: number } {
  const checks = [
    { label: 'Highlight / Team', ratio: contrastRatio(colors.highlight, colors.teamBg), minimum: 3 },
    { label: 'Frame / Score', ratio: contrastRatio(colors.frameInner, colors.scoreBg), minimum: 2 },
    { label: 'Logo Plate / Logo', ratio: contrastRatio(colors.logoPlate, colors.logo), minimum: 3 },
  ];
  const warnings = checks
    .filter((check) => check.ratio < check.minimum)
    .map((check) => `${check.label}: ${check.ratio.toFixed(1)}:1`);
  const score = checks.reduce((sum, check) => sum + Math.min(1, check.ratio / check.minimum), 0) / checks.length;
  return { warnings, score: Math.round(score * 100) / 100 };
}

export interface ThemeResult {
  colors: EditorColors;
  suggestedTemplate: TemplateId;
  contrastWarnings: string[];
  contrastScore: number;
  recommendedVariant: number;
}

export function buildThemeFromPalette(
  palette: LogoPalette,
  variant = 0,
  sport: SportType = 'football'
): ThemeResult {
  const dominant = normalizeHex(palette.dominant);
  const secondary = normalizeHex(palette.secondary || palette.dominant);
  const accent = normalizeHex(palette.accent || palette.dominant);
  const [dominantHue, dominantSaturation] = hexToHsl(dominant);
  const [secondaryHue, secondarySaturation] = hexToHsl(secondary);
  const [, accentSaturation] = hexToHsl(accent);

  const monochrome = variant === 2;
  const secondaryFocus = variant === 3;
  const surfaceHue = secondaryFocus ? secondaryHue : dominantHue;
  const surfaceSaturation = monochrome ? 0.06 : Math.max(0.14, Math.min(0.62, dominantSaturation * 0.9));
  const teamALightness = variant === 1 ? 0.2 : 0.14;
  const teamA = makeSurface(surfaceHue, surfaceSaturation, teamALightness);
  const teamB = makeSurface(secondaryFocus ? dominantHue : secondaryHue, secondaryFocus ? surfaceSaturation : Math.max(0.12, secondarySaturation * 0.8), variant === 1 ? 0.24 : 0.18);
  const frameBase = makeSurface(dominantHue, monochrome ? 0.05 : surfaceSaturation, variant === 1 ? 0.1 : 0.075);
  const frameInner = makeSurface(dominantHue, monochrome ? 0.03 : surfaceSaturation * 0.7, 0.045);
  const scoreBase = makeSurface(accentSaturation > 0.3 ? dominantHue : surfaceHue, monochrome ? 0.04 : surfaceSaturation * 0.75, 0.065);
  const plateLightness = relativeLuminance(dominant) > 0.45 ? 0.08 : 0.82;
  const plateBase = hslToHex(dominantHue, monochrome ? 0.04 : Math.min(0.24, dominantSaturation), plateLightness);

  const highlight = ensureContrast(
    variant === 1 ? accent : hslToHex(hexToHsl(accent)[0], Math.max(0.62, accentSaturation), 0.68),
    teamA,
    3
  );
  const glow = ensureContrast(accent, frameBase, 2.5);
  const logoPlate = ensureContrast(plateBase, dominant, 3);
  const timeSlot = makeSurface(dominantHue, monochrome ? 0.04 : surfaceSaturation * 0.8, 0.11);
  const halfSlot = makeSurface(secondaryHue, monochrome ? 0.04 : secondarySaturation * 0.7, 0.09);

  const colors: EditorColors = {
    teamABg: makeGradient(teamA, 0.045, 0.08),
    teamBBg: makeGradient(teamB, 0.045, 0.08),
    scoreABg: makeGradient(scoreBase, 0.035, 0.06),
    scoreBBg: makeGradient(scoreBase, 0.035, 0.06),
    framePrimary: makeGradient(frameBase, 0.035, 0.06),
    frameInner: solid(frameInner),
    highlight: solid(highlight),
    glow: solid(glow, 0.78),
    shadow: solid('#000000', 0.86),
    timeSlot: makeGradient(timeSlot, 0.025, 0.04),
    halfSlot: makeGradient(halfSlot, 0.025, 0.04),
    yellowCard: solid('#ffcd00'),
    redCard: solid('#e8000d'),
    logoPlateBg: solid(logoPlate, 0.96),
  };

  const dominantHueDegrees = dominantHue * 360; // hexToHsl returns hue first.
  let suggestedTemplate: TemplateId = sport === 'basketball' ? 'velocityCore' : 'arenaLive';
  if (sport === 'basketball') {
    if (variant === 1 || (palette.isVibrant && palette.isDark)) suggestedTemplate = 'neonStrike';
    else if (!palette.isDark && palette.isVibrant) suggestedTemplate = 'premierModern';
    else if (palette.isGold) suggestedTemplate = 'ruggedMetal';
  } else if (palette.isGold && palette.isDark) {
    suggestedTemplate = 'championsLeague';
  } else if (palette.isGold) {
    suggestedTemplate = 'premiumMetallic';
  } else if (palette.isVibrant && palette.isDark) {
    suggestedTemplate = 'esportsNeon';
  } else if (!palette.isDark && palette.isVibrant) {
    suggestedTemplate = 'premierModern';
  } else if ((dominantHueDegrees < 30 || dominantHueDegrees > 330 || (dominantHueDegrees > 200 && dominantHueDegrees < 260))) {
    suggestedTemplate = 'competitiveSplit';
  } else if (palette.aspectRatio > 2) {
    suggestedTemplate = 'leftLogoClassic';
  } else if (!palette.isVibrant && !palette.isDark) {
    suggestedTemplate = 'worldCupClassic';
  } else if (palette.isDark && !palette.isVibrant) {
    suggestedTemplate = 'compactLive';
  }

  const contrast = getContrastReport({
    highlight,
    teamBg: teamA,
    frameInner,
    scoreBg: scoreBase,
    logoPlate,
    logo: dominant,
  });

  return {
    colors,
    suggestedTemplate,
    contrastWarnings: contrast.warnings,
    contrastScore: contrast.score,
    recommendedVariant: palette.isDark ? 0 : 2,
  };
}
