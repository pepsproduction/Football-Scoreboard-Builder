import type { TemplateConfig } from '../types/templates';

export const esportsNeon: TemplateConfig = {
  id: 'esportsNeon',
  name: 'Esports Neon',
  nameEn: 'Esports Neon',
  description: 'ธีมดุดันสีมืดตัดกับแสงนีออน เหมาะสำหรับรายการ E-Sports หรือฟุตบอลสมัยใหม่',
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  styleMode: '2d',
  colors: {
    teamABg: { type: 'solid', color: '#09090b', alpha: 0.9 }, // Almost black
    teamBBg: { type: 'solid', color: '#09090b', alpha: 0.9 },
    scoreABg: { type: 'solid', color: '#18181b', alpha: 0.95 }, // Slightly lighter dark
    scoreBBg: { type: 'solid', color: '#18181b', alpha: 0.95 },
    framePrimary: { type: 'solid', color: '#000000', alpha: 0.95 },
    frameInner: { type: 'solid', color: '#27272a', alpha: 1 },
    highlight: { type: 'solid', color: '#06b6d4', alpha: 1 }, // Cyan neon highlight
    glow: { type: 'solid', color: '#06b6d4', alpha: 0.8 }, // Cyan glow
    shadow: { type: 'solid', color: '#000000', alpha: 0.9 },
    timeSlot: { type: 'solid', color: '#000000', alpha: 0.8 },
    halfSlot: { type: 'solid', color: '#000000', alpha: 0.8 },
    yellowCard: { type: 'solid', color: '#FFCD00', alpha: 1 },
    redCard: { type: 'solid', color: '#E8000D', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#000000', alpha: 0.9 },
  },
  style: {
    cornerRadius: 4,
    borderThickness: 2,
    bevelDepth: 3,
    shadowStrength: 0.9,
    highlightStrength: 1.0,
    glowStrength: 1.0,
    frameDepth: 3,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: {
    width: 860,
    height: 70,
    spacing: 8,
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
