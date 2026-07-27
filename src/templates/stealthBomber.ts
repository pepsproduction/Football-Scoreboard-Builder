import type { TemplateConfig } from '../types/templates';

const stealthBomber: TemplateConfig = {
  id: 'stealthBomber',
  name: 'Stealth Bomber',
  nameEn: 'Stealth Bomber',
  description: 'Dark, sleek, and stealthy design with minimal accents.',
  styleMode: '2d',
  colors: {
    teamABg: { type: 'solid', color: '#1a1a1a', alpha: 1 },
    teamBBg: { type: 'solid', color: '#1a1a1a', alpha: 1 },
    scoreABg: { type: 'solid', color: '#000000', alpha: 1 },
    scoreBBg: { type: 'solid', color: '#000000', alpha: 1 },
    framePrimary: { type: 'solid', color: '#111111', alpha: 1 },
    frameInner: { type: 'solid', color: '#222222', alpha: 1 },
    highlight: { type: 'solid', color: '#ff3300', alpha: 1 },
    glow: { type: 'solid', color: '#ff3300', alpha: 0.5 },
    shadow: { type: 'solid', color: '#000000', alpha: 0.8 },
    timeSlot: { type: 'solid', color: '#000000', alpha: 1 },
    halfSlot: { type: 'solid', color: '#000000', alpha: 1 },
    yellowCard: { type: 'solid', color: '#ffcc00', alpha: 1 },
    redCard: { type: 'solid', color: '#ff0000', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#0a0a0a', alpha: 1 },
  },
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  style: {
    borderThickness: 2,
    cornerRadius: 0,
    bevelDepth: 0,
    shadowStrength: 0.9,
    highlightStrength: 0,
    glowStrength: 0,
    frameDepth: 0,
    skewX: -0.15,
    techBorders: false,
    patternStyle: 'stripes',
    moduleShape: 'parallelogram',
  },
  dimensions: {
    width: 880,
    height: 72,
    spacing: 4,
  },
  modulesEnabled: {
    time: true, half: true, yellowCardA: true, yellowCardB: true, redCardA: true, redCardB: true
  },
};

export default stealthBomber;
