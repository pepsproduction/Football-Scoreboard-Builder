import type { TemplateConfig } from '../types/templates';

export const worldCupClassic: TemplateConfig = {
  id: 'worldCupClassic',
  name: 'Global Classic',
  nameEn: 'Global Classic',
  description: 'ธีมคลาสสิคบน/ล่าง ขอบมน อ่านง่าย สไตล์ทัวร์นาเมนต์ระดับโลก',
  layoutType: 'top-bottom',
  scorePosition: 'after',
  logoPosition: 'left',
  styleMode: '2d',
  colors: {
    teamABg: { type: 'solid', color: '#1a1a1a', alpha: 0.95 },
    teamBBg: { type: 'solid', color: '#1a1a1a', alpha: 0.95 },
    scoreABg: { type: 'solid', color: '#880000', alpha: 1 }, // Deep red for scores
    scoreBBg: { type: 'solid', color: '#880000', alpha: 1 },
    framePrimary: { type: 'solid', color: '#ffffff', alpha: 0.95 }, // White main frame
    frameInner: { type: 'solid', color: '#e0e0e0', alpha: 1 },
    highlight: { type: 'solid', color: '#D4AF37', alpha: 1 }, // Gold accents
    glow: { type: 'solid', color: '#000000', alpha: 0 },
    shadow: { type: 'solid', color: '#000000', alpha: 0.6 },
    timeSlot: { type: 'solid', color: '#1a1a1a', alpha: 0.95 },
    halfSlot: { type: 'solid', color: '#1a1a1a', alpha: 0.95 },
    yellowCard: { type: 'solid', color: '#FFCD00', alpha: 1 },
    redCard: { type: 'solid', color: '#E8000D', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#ffffff', alpha: 1 },
  },
  style: {
    cornerRadius: 12,
    borderThickness: 2,
    bevelDepth: 3,
    shadowStrength: 0.6,
    highlightStrength: 0.8,
    glowStrength: 0.1,
    frameDepth: 2,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: {
    width: 320,
    height: 120,
    spacing: 2,
  },
  modulesEnabled: {
    time: true,
    half: true,
    yellowCardA: true,
    yellowCardB: true,
    redCardA: true,
    redCardB: true,
  }
};
