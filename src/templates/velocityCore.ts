import type { TemplateConfig } from '../types/templates';

const velocityCore: TemplateConfig = {
  id: 'velocityCore',
  name: 'Velocity Core',
  nameEn: 'Velocity Core',
  description: 'Forward-leaning, high-speed 3D layout.',
  styleMode: '3d',
  colors: {
    teamABg: { type: 'vertical', color: '#003366', alpha: 1 },
    teamBBg: { type: 'vertical', color: '#660000', alpha: 1 },
    scoreABg: { type: 'solid', color: '#000000', alpha: 0.8 },
    scoreBBg: { type: 'solid', color: '#000000', alpha: 0.8 },
    framePrimary: { type: 'solid', color: '#111111', alpha: 1 },
    frameInner: { type: 'solid', color: '#222222', alpha: 1 },
    highlight: { type: 'solid', color: '#ffffff', alpha: 1 },
    glow: { type: 'solid', color: '#ffffff', alpha: 0.5 },
    shadow: { type: 'solid', color: '#000000', alpha: 0.8 },
    timeSlot: { type: 'solid', color: '#000000', alpha: 1 },
    halfSlot: { type: 'solid', color: '#000000', alpha: 1 },
    yellowCard: { type: 'solid', color: '#ffcc00', alpha: 1 },
    redCard: { type: 'solid', color: '#ff0000', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#000000', alpha: 1 },
  },
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  style: {
    borderThickness: 1,
    cornerRadius: 0,
    bevelDepth: 12,
    shadowStrength: 0.6,
    highlightStrength: 0.9,
    glowStrength: 0.4,
    frameDepth: 8,
    skewX: 0.35,
    techBorders: true,
    patternStyle: 'none',
    moduleShape: 'parallelogram',
  },
  dimensions: {
    width: 960,
    height: 78,
    spacing: 16,
  },
  modulesEnabled: {
    time: true, half: true, yellowCardA: true, yellowCardB: true, redCardA: true, redCardB: true
  },
};

export default velocityCore;
