// src/templates/minimal2D.ts
import type { TemplateConfig } from '../types/templates';
import type { ColorConfig } from '../types/editor';

const solid = (color: string, alpha = 1): ColorConfig => ({ type: 'solid', color, alpha });

export const minimal2D: TemplateConfig = {
  id: 'minimal2d',
  name: 'Minimal 2D',
  nameEn: 'Minimal 2D',
  description: 'แบบเรียบ อ่านง่าย เส้นขอบชัดเจน เหมาะสำหรับถ่ายทอดสดทั่วไป',
  styleMode: '2d',
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  colors: {
    teamABg:     solid('#0f172a'),
    teamBBg:     solid('#0f172a'),
    scoreABg:    solid('#1e293b'),
    scoreBBg:    solid('#1e293b'),
    framePrimary: solid('#1e293b'),
    frameInner:  solid('#0f172a'),
    highlight:   solid('#38bdf8'),
    glow:        solid('#38bdf8', 0),
    shadow:      solid('#000000', 0.3),
    timeSlot:    solid('#0f172a'),
    halfSlot:    solid('#0f172a'),
    yellowCard:  solid('#ca8a04'),
    redCard:     solid('#dc2626'),
    logoPlateBg: solid('#0f172a', 0.85),
  },
  style: {
    borderThickness: 2,
    cornerRadius: 4,
    bevelDepth: 2,
    shadowStrength: 0.28,
    glowStrength: 0,
    highlightStrength: 0.35,
    frameDepth: 2,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: { width: 860, height: 72, spacing: 3 },
  modulesEnabled: {
    time: false, half: false,
    yellowCardA: false, yellowCardB: false,
    redCardA: false, redCardB: false,
  },
};
