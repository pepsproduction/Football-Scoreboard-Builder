// src/templates/centerCrest.ts
import type { TemplateConfig } from '../types/templates';
import type { ColorConfig } from '../types/editor';

const solid = (color: string, alpha = 1): ColorConfig => ({ type: 'solid', color, alpha });
const linear = (color: string, a: string, b: string, alpha = 1): ColorConfig => ({
  type: 'linear', color, alpha,
  stops: [{ offset: 0, color: a }, { offset: 1, color: b }],
});

export const centerCrest: TemplateConfig = {
  id: 'centerCrest',
  name: 'Center Crest Broadcast',
  nameEn: 'Center Crest Broadcast',
  description: 'กรอบ Metallic 3D โลโก้อยู่กลาง เหมาะสำหรับถ่ายทอดสดระดับมืออาชีพ',
  styleMode: '3d',
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  colors: {
    teamABg:     linear('#0d1f3f', '#152a52', '#091528'),
    teamBBg:     linear('#0d1f3f', '#152a52', '#091528'),
    scoreABg:    linear('#1a3060', '#2040807', '#0f1f40'),
    scoreBBg:    linear('#1a3060', '#204080', '#0f1f40'),
    framePrimary: linear('#162244', '#243870', '#0a1428'),
    frameInner:  solid('#0a1020'),
    highlight:   solid('#60a5fa'),
    glow:        solid('#3b82f6', 0.55),
    shadow:      solid('#000000', 0.9),
    timeSlot:    solid('#091830'),
    halfSlot:    solid('#091830'),
    yellowCard:  solid('#ca8a04'),
    redCard:     solid('#dc2626'),
    logoPlateBg: linear('#0d1a33', '#162244', '#091020', 0.95),
  },
  style: {
    borderThickness: 3,
    cornerRadius: 6,
    bevelDepth: 10,
    shadowStrength: 0.8,
    glowStrength: 0.45,
    highlightStrength: 1,
    frameDepth: 0,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: { width: 920, height: 82, spacing: 4 },
  modulesEnabled: {
    time: false, half: false,
    yellowCardA: false, yellowCardB: false,
    redCardA: false, redCardB: false,
  },
};
