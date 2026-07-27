// src/templates/compactLive.ts
import type { TemplateConfig } from '../types/templates';
import type { ColorConfig } from '../types/editor';

const solid = (color: string, alpha = 1): ColorConfig => ({ type: 'solid', color, alpha });
const linear = (color: string, a: string, b: string, alpha = 1): ColorConfig => ({
  type: 'linear', color, alpha,
  stops: [{ offset: 0, color: a }, { offset: 1, color: b }],
});

export const compactLive: TemplateConfig = {
  id: 'compactLive',
  name: 'Compact Live Score',
  nameEn: 'Compact Live Score',
  description: 'แบบกะทัดรัด บน-ล่าง มีช่องเวลาและครึ่งการแข่งขัน',
  styleMode: '3d',
  layoutType: 'top-bottom',
  scorePosition: 'before',
  logoPosition: 'left',
  colors: {
    teamABg:     linear('#0a1628', '#112040', '#060e1a'),
    teamBBg:     linear('#0a1628', '#112040', '#060e1a'),
    scoreABg:    solid('#091428'),
    scoreBBg:    solid('#091428'),
    framePrimary: linear('#0f1e38', '#162a50', '#080f20'),
    frameInner:  solid('#060e1a'),
    highlight:   solid('#38bdf8'),
    glow:        solid('#0ea5e9', 0.45),
    shadow:      solid('#000000', 0.85),
    timeSlot:    solid('#060e1a'),
    halfSlot:    solid('#060e1a'),
    yellowCard:  solid('#ca8a04'),
    redCard:     solid('#dc2626'),
    logoPlateBg: solid('#0a1628', 0.9),
  },
  style: {
    borderThickness: 2,
    cornerRadius: 5,
    bevelDepth: 7,
    shadowStrength: 0.7,
    glowStrength: 0.4,
    highlightStrength: 0,
    frameDepth: 0,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: { width: 360, height: 120, spacing: 2 },
  modulesEnabled: {
    time: true, half: true,
    yellowCardA: false, yellowCardB: false,
    redCardA: false, redCardB: false,
  },
};
