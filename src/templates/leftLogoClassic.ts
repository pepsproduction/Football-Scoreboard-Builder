// src/templates/leftLogoClassic.ts
import type { TemplateConfig } from '../types/templates';
import type { ColorConfig } from '../types/editor';

const solid = (color: string, alpha = 1): ColorConfig => ({ type: 'solid', color, alpha });
const linear = (color: string, a: string, b: string, alpha = 1): ColorConfig => ({
  type: 'linear', color, alpha,
  stops: [{ offset: 0, color: a }, { offset: 1, color: b }],
});

export const leftLogoClassic: TemplateConfig = {
  id: 'leftLogoClassic',
  name: 'Left Logo Classic',
  nameEn: 'Left Logo Classic',
  description: 'โลโก้อยู่ซ้าย แถบสีเข้ม รูปแบบคลาสสิกสำหรับบอลโลก/บอลถ้วย',
  styleMode: '2d',
  layoutType: 'left-right',
  scorePosition: 'outer',
  logoPosition: 'left',
  colors: {
    teamABg:     linear('#1e1b4b', '#2e2a6b', '#16133b'),
    teamBBg:     linear('#1e1b4b', '#2e2a6b', '#16133b'),
    scoreABg:    solid('#312e81'),
    scoreBBg:    solid('#312e81'),
    framePrimary: solid('#1e1b4b'),
    frameInner:  solid('#0f0d2e'),
    highlight:   solid('#818cf8'),
    glow:        solid('#6366f1', 0.35),
    shadow:      solid('#000000', 0.7),
    timeSlot:    solid('#0f0d2e'),
    halfSlot:    solid('#0f0d2e'),
    yellowCard:  solid('#ca8a04'),
    redCard:     solid('#dc2626'),
    logoPlateBg: solid('#16133b', 0.9),
  },
  style: {
    borderThickness: 2,
    cornerRadius: 3,
    bevelDepth: 4,
    shadowStrength: 0.55,
    glowStrength: 0,
    highlightStrength: 0.45,
    frameDepth: 2,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: { width: 880, height: 76, spacing: 3 },
  modulesEnabled: {
    time: false, half: false,
    yellowCardA: false, yellowCardB: false,
    redCardA: false, redCardB: false,
  },
};
