import type { TemplateConfig } from '../types/templates';

export const championsLeague: TemplateConfig = {
  id: 'championsLeague',
  name: 'Champions Night',
  nameEn: 'Champions Night',
  description: 'ธีมสามมิติสีเงินและน้ำเงินเข้มขอบโค้ง สไตล์ฟุตบอลถ้วยยุโรป',
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  styleMode: '3d',
  colors: {
    teamABg: { type: 'linear', color: '#091540', alpha: 1, stops: [{ offset: 0, color: '#050a24' }, { offset: 1, color: '#0f246b' }] },
    teamBBg: { type: 'linear', color: '#091540', alpha: 1, stops: [{ offset: 0, color: '#050a24' }, { offset: 1, color: '#0f246b' }] },
    scoreABg: { type: 'linear', color: '#000000', alpha: 0.8, stops: [{ offset: 0, color: '#000000' }, { offset: 1, color: '#111111' }] },
    scoreBBg: { type: 'linear', color: '#000000', alpha: 0.8, stops: [{ offset: 0, color: '#000000' }, { offset: 1, color: '#111111' }] },
    framePrimary: { type: 'linear', color: '#0b1638', alpha: 1, stops: [{ offset: 0, color: '#070c1f' }, { offset: 1, color: '#102052' }] },
    frameInner: { type: 'solid', color: '#1a2754', alpha: 1 },
    highlight: { type: 'solid', color: '#c4c8d1', alpha: 1 }, // Silver highlight
    glow: { type: 'solid', color: '#ffffff', alpha: 0.1 },
    shadow: { type: 'solid', color: '#000000', alpha: 0.9 },
    timeSlot: { type: 'solid', color: '#000000', alpha: 0.7 },
    halfSlot: { type: 'solid', color: '#000000', alpha: 0.7 },
    yellowCard: { type: 'solid', color: '#FFCD00', alpha: 1 },
    redCard: { type: 'solid', color: '#E8000D', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#050a24', alpha: 0.8 },
  },
  style: {
    cornerRadius: 8,
    borderThickness: 2,
    bevelDepth: 6,
    shadowStrength: 1.0,
    highlightStrength: 0.9,
    glowStrength: 0.6,
    frameDepth: 12,
    skewX: 0,
    techBorders: false,
    patternStyle: 'none',
    moduleShape: 'rect',
  },
  dimensions: {
    width: 900,
    height: 80,
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
