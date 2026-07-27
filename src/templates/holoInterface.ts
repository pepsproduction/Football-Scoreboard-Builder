import type { TemplateConfig } from '../types/templates';

const holoInterface: TemplateConfig = {
  id: 'holoInterface',
  name: 'Holo Interface',
  nameEn: 'Holo Interface',
  description: 'Semi-transparent hologram style with glowing grid.',
  styleMode: '3d',
  colors: {
    teamABg: { type: 'solid', color: '#0088ff', alpha: 0.35 },
    teamBBg: { type: 'solid', color: '#ff2255', alpha: 0.35 },
    scoreABg: { type: 'solid', color: '#000000', alpha: 0.6 },
    scoreBBg: { type: 'solid', color: '#000000', alpha: 0.6 },
    framePrimary: { type: 'solid', color: '#111111', alpha: 1 },
    frameInner: { type: 'solid', color: '#222222', alpha: 1 },
    highlight: { type: 'solid', color: '#00eeff', alpha: 1 },
    glow: { type: 'solid', color: '#00eeff', alpha: 0.8 },
    shadow: { type: 'solid', color: '#000000', alpha: 0.8 },
    timeSlot: { type: 'solid', color: '#002244', alpha: 0.8 },
    halfSlot: { type: 'solid', color: '#002244', alpha: 0.8 },
    yellowCard: { type: 'solid', color: '#ffcc00', alpha: 1 },
    redCard: { type: 'solid', color: '#ff0000', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#001122', alpha: 0.7 },
  },
  layoutType: 'top-bottom',
  scorePosition: 'after',
  logoPosition: 'left',
  style: {
    borderThickness: 1,
    cornerRadius: 8,
    bevelDepth: 2,
    shadowStrength: 0,
    highlightStrength: 0.4,
    glowStrength: 1.0,
    frameDepth: 2,
    skewX: 0.05,
    techBorders: true,
    patternStyle: 'grid',
    moduleShape: 'parallelogram',
  },
  dimensions: {
    width: 320,
    height: 120,
    spacing: 4,
  },
  modulesEnabled: {
    time: true, half: true, yellowCardA: true, yellowCardB: true, redCardA: true, redCardB: true
  },
};

export default holoInterface;
