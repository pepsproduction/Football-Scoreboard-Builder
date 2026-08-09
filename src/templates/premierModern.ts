import type { TemplateConfig } from '../types/templates';

export const premierModern: TemplateConfig = {
  id: 'premierModern',
  name: 'Modern Premier',
  nameEn: 'Modern Premier',
  description: 'ธีมสองมิติเรียบแบน สีสันตัดกันชัดเจน สไตล์ลีคอังกฤษยุคใหม่',
  layoutType: 'left-right',
  scorePosition: 'outer',
  logoPosition: 'right',
  styleMode: '2d',
  colors: {
    teamABg: { type: 'solid', color: '#3B0260', alpha: 1 }, // Deep purple
    teamBBg: { type: 'solid', color: '#E1004C', alpha: 1 }, // Bright magenta/red
    scoreABg: { type: 'solid', color: '#ffffff', alpha: 1 },
    scoreBBg: { type: 'solid', color: '#ffffff', alpha: 1 },
    framePrimary: { type: 'solid', color: '#1a1b26', alpha: 0.9 },
    frameInner: { type: 'solid', color: '#ffffff', alpha: 0.2 },
    highlight: { type: 'solid', color: '#00FF85', alpha: 1 }, // Neon green highlight
    glow: { type: 'solid', color: '#000000', alpha: 0 },
    shadow: { type: 'solid', color: '#000000', alpha: 0.4 },
    timeSlot: { type: 'solid', color: '#1a1b26', alpha: 0.9 },
    halfSlot: { type: 'solid', color: '#1a1b26', alpha: 0.9 },
    yellowCard: { type: 'solid', color: '#FFCD00', alpha: 1 },
    redCard: { type: 'solid', color: '#E8000D', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#ffffff', alpha: 1 },
  },
  style: {
    cornerRadius: 0,
    borderThickness: 2,
    bevelDepth: 3,
    shadowStrength: 0.5,
    highlightStrength: 1.0,
    glowStrength: 0,
    frameDepth: 2,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: {
    width: 950,
    height: 70,
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
