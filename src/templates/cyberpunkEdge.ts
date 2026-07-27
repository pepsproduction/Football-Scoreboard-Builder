import type { TemplateConfig } from '../types/templates';

const cyberpunkEdge: TemplateConfig = {
  id: 'cyberpunkEdge',
  name: 'Cyberpunk Edge',
  nameEn: 'Cyberpunk Edge',
  description: 'Heavy skew and neon stripes for a cyberpunk aesthetic.',
  styleMode: '2d',
  colors: {
    teamABg: { type: 'solid', color: '#f700ff', alpha: 0.9 },
    teamBBg: { type: 'solid', color: '#00f7ff', alpha: 0.9 },
    scoreABg: { type: 'solid', color: '#111111', alpha: 1 },
    scoreBBg: { type: 'solid', color: '#111111', alpha: 1 },
    framePrimary: { type: 'solid', color: '#111111', alpha: 1 },
    frameInner: { type: 'solid', color: '#222222', alpha: 1 },
    highlight: { type: 'solid', color: '#ffffff', alpha: 1 },
    glow: { type: 'solid', color: '#f700ff', alpha: 0.5 },
    shadow: { type: 'solid', color: '#000000', alpha: 0.8 },
    timeSlot: { type: 'solid', color: '#111111', alpha: 1 },
    halfSlot: { type: 'solid', color: '#111111', alpha: 1 },
    yellowCard: { type: 'solid', color: '#ffcc00', alpha: 1 },
    redCard: { type: 'solid', color: '#ff0000', alpha: 1 },
    logoPlateBg: { type: 'solid', color: '#fcee0a', alpha: 1 },
  },
  layoutType: 'left-right',
  scorePosition: 'outer',
  logoPosition: 'center',
  style: {
    borderThickness: 3,
    cornerRadius: 0,
    bevelDepth: 0,
    shadowStrength: 0.5,
    highlightStrength: 0,
    glowStrength: 0,
    frameDepth: 0,
    skewX: -0.25,
    techBorders: true,
    patternStyle: 'stripes',
    moduleShape: 'pill',
  },
  dimensions: {
    width: 950,
    height: 70,
    spacing: 6,
  },
  modulesEnabled: {
    time: true, half: true, yellowCardA: true, yellowCardB: true, redCardA: true, redCardB: true
  },
};

export default cyberpunkEdge;
