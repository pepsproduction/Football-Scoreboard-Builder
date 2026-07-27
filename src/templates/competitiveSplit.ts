// src/templates/competitiveSplit.ts
import type { TemplateConfig } from '../types/templates';
import type { ColorConfig } from '../types/editor';

const solid = (color: string, alpha = 1): ColorConfig => ({ type: 'solid', color, alpha });
const linear = (color: string, a: string, b: string, alpha = 1): ColorConfig => ({
  type: 'linear', color, alpha,
  stops: [{ offset: 0, color: a }, { offset: 1, color: b }],
});

export const competitiveSplit: TemplateConfig = {
  id: 'competitiveSplit',
  name: 'Competitive Split',
  nameEn: 'Competitive Split',
  description: 'สองสีแบ่งซ้าย-ขวา เหมาะกับทีมที่มีสีต่างกัน',
  styleMode: '2d',
  layoutType: 'left-right',
  scorePosition: 'outer',
  logoPosition: 'center',
  colors: {
    teamABg:     linear('#1e3a5f', '#245070', '#122238'),
    teamBBg:     linear('#5f1e1e', '#703030', '#381212'),
    scoreABg:    solid('#1a3052'),
    scoreBBg:    solid('#521a1a'),
    framePrimary: solid('#1a1a2e'),
    frameInner:  solid('#0d0d1a'),
    highlight:   solid('#ffffff', 0.8),
    glow:        solid('#60a5fa', 0.3),
    shadow:      solid('#000000', 0.75),
    timeSlot:    solid('#0d0d1a'),
    halfSlot:    solid('#0d0d1a'),
    yellowCard:  solid('#ca8a04'),
    redCard:     solid('#ef4444'),
    logoPlateBg: solid('#0d0d1a', 0.9),
  },
  style: {
    borderThickness: 3,
    cornerRadius: 4,
    bevelDepth: 5,
    shadowStrength: 0.6,
    glowStrength: 0,
    highlightStrength: 0,
    frameDepth: 0,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: { width: 900, height: 78, spacing: 3 },
  modulesEnabled: {
    time: true, half: true,
    yellowCardA: false, yellowCardB: false,
    redCardA: false, redCardB: false,
  },
};
