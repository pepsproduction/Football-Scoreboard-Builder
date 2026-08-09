import { describe, expect, it } from 'vitest';
import { buildThemeFromPalette, contrastRatio, relativeLuminance } from './themeEngine';
import type { LogoPalette } from '../types/editor';

const palette: LogoPalette = {
  colors: ['#0b3d91', '#f4b400', '#ffffff'],
  dominant: '#0b3d91',
  secondary: '#f4b400',
  accent: '#f4b400',
  isDark: true,
  isVibrant: true,
  isGold: true,
  aspectRatio: 1.5,
};

describe('logo theme engine', () => {
  it('returns a stable, sport-aware basketball theme', () => {
    const first = buildThemeFromPalette(palette, 0, 'basketball');
    const second = buildThemeFromPalette(palette, 0, 'basketball');

    expect(first.suggestedTemplate).toBe(second.suggestedTemplate);
    expect(first.colors.highlight.color).toBe(second.colors.highlight.color);
    expect(first.colors.teamABg.color).not.toBe('#ffffff');
    expect(first.contrastScore).toBeGreaterThan(0.7);
  });

  it('calculates WCAG contrast and finite luminance values', () => {
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 3);
  });
});
