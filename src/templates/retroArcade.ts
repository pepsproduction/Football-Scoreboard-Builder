import type { TemplateConfig } from '../types/templates';

const retroArcade: TemplateConfig = {
  id: 'retroArcade',
  name: 'Retro Arcade',
  nameEn: 'Retro Arcade',
  description: 'Classic arcade style with dots pattern and thick borders.',
  styleMode: '2d',
  colors: {
    teamABg: { type: 'solid', color: '#ff003c', alpha: 1 },
    teamBBg: { type: 'solid', color: '#003cff', alpha: 1 },
    scoreABg: { type: 'solid', color: '#ffffff', alpha: 1 },
    scoreBBg: { type: 'solid', color: '#ffffff', alpha: 1 },
    framePrimary: { type: 'solid', color: '#111111', alpha: 1 },
    frameInner: { type: 'solid', color: '#222222', alpha: 1 },
    highlight: { type: 'solid', color: '#ffd700', alpha: 1 },
    glow: { type: 'solid', color: '#ffd700', alpha: 0.5 },
    shadow: { type: 'solid', color: '#000000', alpha: 0.8 },
    timeSlot: { type: 'solid', color: '#000000', alpha: 1 },
    halfSlot: { type: 'solid', color: '#000000', alpha: 1 },
    yellowCard: { type: 'solid', color: '#ffcc00', alpha: 1 },
    redCard: { type: 'solid', color: '#ff0000', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#000000', alpha: 1 },
  },
  layoutType: 'left-right',
  scorePosition: 'outer',
  logoPosition: 'center',
  style: {
    borderThickness: 4,
    cornerRadius: 0,
    bevelDepth: 3,
    shadowStrength: 0.5,
    highlightStrength: 0.75,
    glowStrength: 0,
    frameDepth: 2,
    skewX: 0,
    techBorders: false,
    patternStyle: 'dots',
    moduleShape: 'rect',
  },
  dimensions: {
    width: 820,
    height: 70,
    spacing: 8,
  },
  modulesEnabled: {
    time: true, half: true, yellowCardA: true, yellowCardB: true, redCardA: true, redCardB: true
  },
};

export default retroArcade;
