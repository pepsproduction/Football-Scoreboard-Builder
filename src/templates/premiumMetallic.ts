// src/templates/premiumMetallic.ts
import type { TemplateConfig } from '../types/templates';
import type { ColorConfig } from '../types/editor';

const solid = (color: string, alpha = 1): ColorConfig => ({ type: 'solid', color, alpha });
const linear = (color: string, a: string, b: string, alpha = 1): ColorConfig => ({
  type: 'linear', color, alpha,
  stops: [{ offset: 0, color: a }, { offset: 1, color: b }],
});

export const premiumMetallic: TemplateConfig = {
  id: 'premiumMetallic',
  name: 'Premium Metallic',
  nameEn: 'Premium Metallic',
  description: 'กรอบทองโลหะ Bevel ลึก เหมาะสำหรับการแข่งขันระดับพรีเมียม',
  styleMode: '3d',
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  colors: {
    teamABg:     linear('#1a1200', '#2a1e00', '#0f0a00'),
    teamBBg:     linear('#1a1200', '#2a1e00', '#0f0a00'),
    scoreABg:    linear('#2d2000', '#4a3500', '#1a1200'),
    scoreBBg:    linear('#2d2000', '#4a3500', '#1a1200'),
    framePrimary: linear('#3d2e00', '#6b4f00', '#1a1400'),
    frameInner:  solid('#1a1000'),
    highlight:   solid('#fbbf24'),
    glow:        solid('#f59e0b', 0.6),
    shadow:      solid('#000000', 0.95),
    timeSlot:    solid('#1a1000'),
    halfSlot:    solid('#1a1000'),
    yellowCard:  solid('#f59e0b'),
    redCard:     solid('#dc2626'),
    logoPlateBg: linear('#2d2000', '#4a3800', '#1a1200', 0.95),
  },
  style: {
    borderThickness: 4,
    cornerRadius: 8,
    bevelDepth: 18,
    shadowStrength: 0.95,
    glowStrength: 0,
    highlightStrength: 0.75,
    frameDepth: 6,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: { width: 940, height: 88, spacing: 5 },
  modulesEnabled: {
    time: false, half: false,
    yellowCardA: false, yellowCardB: false,
    redCardA: false, redCardB: false,
  },
};
