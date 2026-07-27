import type { TemplateConfig } from '../types/templates';

const dynamicHex: TemplateConfig = {
  id: 'dynamicHex',
  name: 'Dynamic Hex',
  nameEn: 'Dynamic Hex',
  description: 'Hexagon layout with 3D tech styling.',
  styleMode: '3d',
  colors: {
    teamABg: { type: 'vertical', color: '#161d2b', alpha: 1 },
    teamBBg: { type: 'vertical', color: '#2b1616', alpha: 1 },
    scoreABg: { type: 'solid', color: '#000000', alpha: 0.8 },
    scoreBBg: { type: 'solid', color: '#000000', alpha: 0.8 },
    framePrimary: { type: 'solid', color: '#111111', alpha: 1 },
    frameInner: { type: 'solid', color: '#222222', alpha: 1 },
    highlight: { type: 'solid', color: '#00ffff', alpha: 1 },
    glow: { type: 'solid', color: '#00ffff', alpha: 0.5 },
    shadow: { type: 'solid', color: '#000000', alpha: 0.8 },
    timeSlot: { type: 'solid', color: '#111111', alpha: 1 },
    halfSlot: { type: 'solid', color: '#111111', alpha: 1 },
    yellowCard: { type: 'solid', color: '#ffcc00', alpha: 1 },
    redCard: { type: 'solid', color: '#ff0000', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#11151c', alpha: 1 },
  },
  layoutType: 'left-right',
  scorePosition: 'inner',
  logoPosition: 'center',
  style: {
    borderThickness: 2,
    cornerRadius: 0,
    bevelDepth: 8,
    shadowStrength: 0.8,
    highlightStrength: 0.7,
    glowStrength: 0.9,
    frameDepth: 14,
    skewX: 0,
    techBorders: true,
    patternStyle: 'grid',
    moduleShape: 'hexagon',
  },
  dimensions: {
    width: 900,
    height: 84,
    spacing: 12,
  },
  modulesEnabled: {
    time: true, half: true, yellowCardA: true, yellowCardB: true, redCardA: true, redCardB: true
  },
};

export default dynamicHex;
