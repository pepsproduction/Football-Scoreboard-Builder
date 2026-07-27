import type { TemplateConfig } from '../types/templates';

export const cyberNeon: TemplateConfig = {
  id: 'cyberNeon',
  name: 'Cyber Neon',
  nameEn: 'Cyber Neon',
  description: 'ธีมนีออนสว่างไสว ตัดกับพื้นหลังสีเข้ม ล้ำหน้าเกินยุค',
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  styleMode: '3d',
  colors: {
    teamABg: { type: 'linear', color: '#000000', alpha: 0.8, stops: [{ offset: 0, color: '#0a0a0a' }, { offset: 1, color: '#000000' }] },
    teamBBg: { type: 'linear', color: '#000000', alpha: 0.8, stops: [{ offset: 0, color: '#0a0a0a' }, { offset: 1, color: '#000000' }] },
    scoreABg: { type: 'solid', color: '#0f172a', alpha: 0.9 },
    scoreBBg: { type: 'solid', color: '#0f172a', alpha: 0.9 },
    framePrimary: { type: 'solid', color: '#020617', alpha: 0.9 },
    frameInner: { type: 'solid', color: '#1e293b', alpha: 1 },
    highlight: { type: 'solid', color: '#06b6d4', alpha: 1 }, // Cyan neon highlight
    glow: { type: 'solid', color: '#06b6d4', alpha: 1 },
    shadow: { type: 'solid', color: '#000000', alpha: 1 },
    timeSlot: { type: 'solid', color: '#000000', alpha: 0.7 },
    halfSlot: { type: 'solid', color: '#000000', alpha: 0.7 },
    yellowCard: { type: 'solid', color: '#FFCD00', alpha: 1 },
    redCard: { type: 'solid', color: '#E8000D', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#020617', alpha: 0.9 },
  },
  style: {
    cornerRadius: 8,
    borderThickness: 2,
    bevelDepth: 2,
    shadowStrength: 0.5,
    glowStrength: 1.0,
    highlightStrength: 1.0,
    frameDepth: 0,
    skewX: 0.15,
    techBorders: true,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: {
    width: 950,
    height: 70,
    spacing: 6,
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
